# DATA ENGINEER PHASE 1 - Credit Card Invoice Architecture
## STY-058 & STY-060 Design Document

**Prepared by:** Nova - Data Engineer
**Date:** 2026-02-05
**Status:** Design Phase - Ready for Implementation
**Estimated Effort:** 16h (8h STY-058 + 7h STY-060)

---

## EXECUTIVE SUMMARY

This document provides the complete data architecture for credit card invoice management in SPFP. We will design:

1. **Normalized schema** for card invoices and installments
2. **High-performance queries** (target: <100ms)
3. **Type-safe interfaces** for frontend integration
4. **Data ingestion strategy** supporting multiple sources
5. **Integration points** with existing FinanceContext

The system will support:
- Multiple credit cards per user
- Monthly invoice tracking (12+ months history)
- Installment breakdowns (up to 24 months)
- Real-time status updates
- Predictive calculations (ideal payment amounts)

---

## PART 1: CURRENT STATE ANALYSIS

### 1.1 Existing Schema Overview

#### Accounts Table (Current)
```typescript
interface Account {
  id: string;
  name: string;
  type: 'CHECKING' | 'INVESTMENT' | 'CASH' | 'CREDIT_CARD';
  owner: 'ME' | 'SPOUSE' | 'JOINT';
  balance: number;
  creditLimit?: number;
  color?: string;
  lastFourDigits?: string;
  network?: 'VISA' | 'MASTERCARD' | 'ELO' | 'AMEX' | 'OTHER';
  closingDay?: number;      // Invoice closing day (e.g., 10)
  dueDay?: number;          // Payment due day (e.g., 20)
  deletedAt?: number;       // Soft delete timestamp
}
```

**Current Usage:** Represents credit cards but lacks detailed invoice tracking.

#### Transactions Table (Current)
```typescript
interface Transaction {
  id: string;
  accountId: string;        // Reference to credit card account
  description: string;
  value: number;
  date: string;             // Transaction date
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  paid: boolean;            // Payment status (unclear semantics)
  spender?: string;
  sentiment?: string;
  groupId?: string;         // For installments/recurring
  groupType?: 'INSTALLMENT' | 'RECURRING';
  groupIndex?: number;      // Current installment number
  groupTotal?: number;      // Total installments
  deletedAt?: number;
}
```

**Current Usage:** All-in-one transaction storage. No separate invoice/installment tracking.

#### Current Problems:
- No normalized invoice/installment structure
- Invoice metadata mixed with transaction data
- No clear invoice grouping mechanism
- No due date tracking per invoice
- No invoice status management (OPEN/PAID/OVERDUE)
- Difficult to query "current + future installments"
- Performance issues with large transaction sets (filtering on the fly)

### 1.2 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Data Sources                                 │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Manual Form │  CSV Import  │  Open Finance│  Mock/Dev Data     │
│  (STY-055)   │  (Bank Export)│  (Future)    │  (Testing)         │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬──────────┘
       │              │              │                │
       │ Validation   │              │                │
       ▼              ▼              ▼                ▼
   ┌─────────────────────────────────────────────────────────┐
   │  cardInvoiceService.ts                                  │
   │  - fetchInvoices(accountId)                             │
   │  - parseInvoiceData(source: 'form'|'csv'|'api')        │
   │  - calculateInstallments()                              │
   │  - syncToSupabase()                                     │
   │  - withErrorRecovery & retry logic                      │
   └──────────────────────┬──────────────────────────────────┘
                          │
                          ▼
   ┌─────────────────────────────────────────────────────────┐
   │  Supabase PostgreSQL                                    │
   │  ┌───────────────────────────────────────────────────┐  │
   │  │ card_invoices                                     │  │
   │  │ - id (PK), user_id, card_id, invoice_number      │  │
   │  │ - invoice_date, due_date, closing_date           │  │
   │  │ - total_amount, paid_amount, status              │  │
   │  │ - source ('form'|'csv'|'api'|'manual')           │  │
   │  │ - created_at, updated_at                         │  │
   │  └───────────────────────────────────────────────────┘  │
   │  ┌───────────────────────────────────────────────────┐  │
   │  │ card_invoice_items (installments)                │  │
   │  │ - id (PK), invoice_id (FK)                       │  │
   │  │ - installment_number, installment_total          │  │
   │  │ - description, amount, category_id               │  │
   │  │ - transaction_id (FK), status                    │  │
   │  │ - due_date, paid_date                            │  │
   │  └───────────────────────────────────────────────────┘  │
   └──────────────────────┬──────────────────────────────────┘
                          │
                          ▼
   ┌─────────────────────────────────────────────────────────┐
   │  FinanceContext + localStorage                          │
   │  - creditCardInvoices: Invoice[]                        │
   │  - syncCreditCardInvoices()                             │
   │  - getInstallmentsByCard()                              │
   │  - getFutureInstallments()                              │
   └──────────────────────┬──────────────────────────────────┘
                          │
                          ▼
   ┌─────────────────────────────────────────────────────────┐
   │  React Components                                       │
   │  - CreditCardInvoiceDetails (STY-060)                   │
   │  - CreditCardDisplay (STY-061)                          │
   │  - Sidebar Invoice Section (STY-055)                    │
   │  - CRM Payment Tracking (STY-069)                       │
   └─────────────────────────────────────────────────────────┘
```

---

## PART 2: NEW SCHEMA DESIGN

### 2.1 Normalized Tables

#### Table: `card_invoices`
**Purpose:** Central fact table for monthly card invoices
**Denormalization:** Yes (for query performance)

```sql
CREATE TABLE IF NOT EXISTS card_invoices (
  -- Primary & Foreign Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- Invoice Metadata
  invoice_number VARCHAR(50) NOT NULL,  -- Bank's invoice identifier
  invoice_date DATE NOT NULL,           -- Month/year identifier (first day of invoice month)
  closing_date DATE NOT NULL,           -- When invoice closes (usually closing_day of account)
  due_date DATE NOT NULL,               -- Payment due date

  -- Amount Tracking
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  pending_amount DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount - COALESCE(paid_amount, 0)) STORED,

  -- Status & Classification
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',  -- OPEN | PAID | PARTIAL | OVERDUE
  source VARCHAR(20) DEFAULT 'manual',         -- manual | csv | api | auto_sync

  -- Installment Summary
  total_installments INT DEFAULT 1,
  paid_installments INT DEFAULT 0,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,  -- Soft delete

  -- Constraints
  CONSTRAINT valid_dates CHECK (closing_date < due_date),
  CONSTRAINT valid_amounts CHECK (total_amount >= 0 AND paid_amount >= 0),
  CONSTRAINT valid_status CHECK (status IN ('OPEN', 'PAID', 'PARTIAL', 'OVERDUE')),
  CONSTRAINT unique_invoice_per_card_month UNIQUE (user_id, card_id, invoice_date)
);

-- Indexes for query optimization
CREATE INDEX idx_card_invoices_user_card ON card_invoices(user_id, card_id);
CREATE INDEX idx_card_invoices_due_date ON card_invoices(user_id, due_date);
CREATE INDEX idx_card_invoices_status ON card_invoices(user_id, status);
CREATE INDEX idx_card_invoices_date_range ON card_invoices(invoice_date DESC) WHERE deleted_at IS NULL;

-- Trigger: Auto-update status when all installments are paid
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE card_invoices
  SET status = CASE
    WHEN paid_installments = total_installments THEN 'PAID'
    WHEN paid_installments > 0 THEN 'PARTIAL'
    WHEN due_date < NOW() THEN 'OVERDUE'
    ELSE 'OPEN'
  END,
  updated_at = NOW()
  WHERE id = NEW.invoice_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Table: `card_invoice_items` (Installments)
**Purpose:** Individual line items (installments) within each invoice
**Denormalization:** Yes (category_id cached for query speed)

```sql
CREATE TABLE IF NOT EXISTS card_invoice_items (
  -- Primary & Foreign Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES card_invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transaction Reference (optional)
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,

  -- Installment Metadata
  installment_number INT NOT NULL,      -- 1, 2, 3... (for multi-month installments)
  installment_total INT NOT NULL,       -- Total installments (e.g., 3 for "1 of 3")
  original_transaction_date DATE,       -- When the purchase was made

  -- Item Details
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Status Tracking
  status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING | PAID | OVERDUE | CANCELLED
  due_date DATE NOT NULL,
  paid_date DATE,

  -- Denormalization (for faster queries)
  card_id UUID NOT NULL,                 -- Copied from card_invoices for easy filtering

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_amounts CHECK (amount > 0),
  CONSTRAINT valid_installment_number CHECK (installment_number >= 1 AND installment_number <= installment_total),
  CONSTRAINT valid_status CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
  CONSTRAINT valid_due_date CHECK (due_date >= invoice_date)
);

-- Indexes for query optimization
CREATE INDEX idx_card_invoice_items_invoice ON card_invoice_items(invoice_id);
CREATE INDEX idx_card_invoice_items_user_status ON card_invoice_items(user_id, status);
CREATE INDEX idx_card_invoice_items_card_due_date ON card_invoice_items(card_id, due_date);
CREATE INDEX idx_card_invoice_items_transaction ON card_invoice_items(transaction_id);
CREATE INDEX idx_card_invoice_items_category ON card_invoice_items(category_id);

-- Trigger: Auto-update payment status
CREATE OR REPLACE FUNCTION update_installment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.paid_date IS NOT NULL THEN
    NEW.status = 'PAID';
  ELSIF NEW.due_date < NOW() AND NEW.status = 'PENDING' THEN
    NEW.status = 'OVERDUE';
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_installment_status
BEFORE INSERT OR UPDATE ON card_invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_installment_status();
```

#### Row-Level Security Policies

```sql
-- card_invoices: Users see only their own invoices
CREATE POLICY card_invoices_user_isolation ON card_invoices
  FOR ALL
  USING (user_id = auth.uid());

-- card_invoice_items: Users see only items from their invoices
CREATE POLICY card_invoice_items_user_isolation ON card_invoice_items
  FOR ALL
  USING (user_id = auth.uid());

-- Enable RLS
ALTER TABLE card_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_invoice_items ENABLE ROW LEVEL SECURITY;
```

---

## PART 3: OPTIMIZED QUERIES

### Query Performance Targets
- **Simple filters (by card + month):** <50ms
- **Complex aggregations (future installments):** <100ms
- **Full history (12 months):** <200ms
- **Pagination (100 items/page):** <75ms

### 3.1 Core Queries

#### Q1: Get invoices for a card (last 12 months)
```sql
-- Use case: Display invoice history in CreditCardInvoiceDetails component
-- Performance: ~30ms with proper indexes
SELECT
  ci.id,
  ci.invoice_number,
  ci.invoice_date,
  ci.due_date,
  ci.total_amount,
  ci.paid_amount,
  ci.pending_amount,
  ci.status,
  COUNT(cii.id) FILTER (WHERE cii.status != 'CANCELLED') as item_count,
  COUNT(cii.id) FILTER (WHERE cii.status = 'PAID') as paid_items,
  MAX(cii.due_date) as last_item_due_date
FROM card_invoices ci
LEFT JOIN card_invoice_items cii ON ci.id = cii.invoice_id
WHERE ci.user_id = $1
  AND ci.card_id = $2
  AND ci.invoice_date >= NOW() - INTERVAL '12 months'
  AND ci.deleted_at IS NULL
GROUP BY ci.id
ORDER BY ci.invoice_date DESC
LIMIT 50;
```

**Expected Result (sample):**
```json
[
  {
    "id": "inv_001",
    "invoice_number": "202601",
    "invoice_date": "2026-01-01",
    "due_date": "2026-01-20",
    "total_amount": 5234.50,
    "paid_amount": 0.00,
    "pending_amount": 5234.50,
    "status": "OPEN",
    "item_count": 8,
    "paid_items": 0,
    "last_item_due_date": "2026-01-20"
  }
]
```

#### Q2: Get current + future installments for a card
```sql
-- Use case: STY-060 - Display upcoming payments + current invoices
-- Performance: ~40ms
SELECT
  cii.id,
  cii.invoice_id,
  ci.invoice_date,
  cii.due_date,
  cii.description,
  cii.amount,
  cii.installment_number,
  cii.installment_total,
  cii.status,
  cii.category_id,
  c.name as category_name,
  ci.total_amount,
  ci.status as invoice_status
FROM card_invoice_items cii
JOIN card_invoices ci ON cii.invoice_id = ci.id
LEFT JOIN categories c ON cii.category_id = c.id
WHERE cii.user_id = $1
  AND cii.card_id = $2
  AND cii.status IN ('PENDING', 'OVERDUE')
  AND cii.due_date >= NOW()::DATE
  AND cii.due_date <= NOW()::DATE + INTERVAL '90 days'
ORDER BY cii.due_date ASC;
```

**Expected Result:**
```json
[
  {
    "id": "item_001",
    "invoice_id": "inv_001",
    "invoice_date": "2026-01-01",
    "due_date": "2026-01-20",
    "description": "Compra Online - Eletrodomésticos",
    "amount": 1299.90,
    "installment_number": 1,
    "installment_total": 3,
    "status": "PENDING",
    "category_id": "cat_8",
    "category_name": "Compras",
    "total_amount": 5234.50,
    "invoice_status": "OPEN"
  }
]
```

#### Q3: Calculate ideal installment amount (for recommendation)
```sql
-- Use case: STY-060 - Show "valor ideal" based on history
-- Performance: ~80ms
WITH recent_installments AS (
  SELECT
    amount
  FROM card_invoice_items
  WHERE user_id = $1
    AND card_id = $2
    AND created_at >= NOW() - INTERVAL '6 months'
    AND status != 'CANCELLED'
)
SELECT
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) as median_installment,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY amount) as q1_amount,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY amount) as q3_amount,
  AVG(amount) as avg_installment,
  MAX(amount) as max_installment,
  MIN(amount) as min_installment,
  STDDEV_POP(amount) as std_dev,
  COUNT(*) as total_installments
FROM recent_installments;
```

#### Q4: Get invoices grouped by due date (for alert system)
```sql
-- Use case: STY-060 - Group upcoming payments by date
-- Performance: ~60ms
SELECT
  cii.due_date,
  SUM(cii.amount) as total_due,
  COUNT(cii.id) as num_installments,
  ARRAY_AGG(DISTINCT c.name) as categories,
  json_agg(json_build_object(
    'id', cii.id,
    'description', cii.description,
    'amount', cii.amount,
    'installment_number', cii.installment_number,
    'installment_total', cii.installment_total
  )) as items
FROM card_invoice_items cii
JOIN card_invoices ci ON cii.invoice_id = ci.id
LEFT JOIN categories c ON cii.category_id = c.id
WHERE cii.user_id = $1
  AND cii.card_id = $2
  AND cii.status IN ('PENDING', 'OVERDUE')
  AND cii.due_date > NOW()::DATE
  AND cii.due_date <= NOW()::DATE + INTERVAL '90 days'
GROUP BY cii.due_date
ORDER BY cii.due_date ASC;
```

#### Q5: Invoice summary with pagination
```sql
-- Use case: List invoices with efficient pagination
-- Performance: ~35ms
WITH invoice_summary AS (
  SELECT
    ci.id,
    ci.invoice_number,
    ci.invoice_date,
    ci.due_date,
    ci.total_amount,
    ci.status,
    COUNT(*) FILTER (WHERE cii.status = 'PAID') as paid_count,
    COUNT(*) as total_count,
    SUM(CASE WHEN cii.status = 'PAID' THEN cii.amount ELSE 0 END) as amount_paid
  FROM card_invoices ci
  LEFT JOIN card_invoice_items cii ON ci.id = cii.invoice_id
  WHERE ci.user_id = $1
    AND ci.card_id = $2
    AND ci.deleted_at IS NULL
  GROUP BY ci.id
)
SELECT *
FROM invoice_summary
ORDER BY invoice_date DESC
LIMIT $3 OFFSET $4;
```

#### Q6: Get overdue items with days overdue
```sql
-- Use case: Display overdue alerts + risks
-- Performance: ~50ms
SELECT
  cii.id,
  cii.description,
  cii.amount,
  cii.due_date,
  ci.card_id,
  ca.name as card_name,
  (NOW()::DATE - cii.due_date) as days_overdue,
  CASE
    WHEN (NOW()::DATE - cii.due_date) > 30 THEN 'CRITICAL'
    WHEN (NOW()::DATE - cii.due_date) > 15 THEN 'WARNING'
    ELSE 'ALERT'
  END as severity
FROM card_invoice_items cii
JOIN card_invoices ci ON cii.invoice_id = ci.id
JOIN accounts ca ON ci.card_id = ca.id
WHERE cii.user_id = $1
  AND cii.status = 'OVERDUE'
  AND cii.due_date < NOW()::DATE
ORDER BY cii.due_date ASC;
```

#### Q7: Monthly spending summary
```sql
-- Use case: Dashboard widget showing monthly trend
-- Performance: ~90ms
SELECT
  DATE_TRUNC('month', ci.invoice_date)::DATE as month,
  COUNT(DISTINCT ci.id) as num_invoices,
  SUM(ci.total_amount) as total_spent,
  SUM(ci.paid_amount) as total_paid,
  SUM(ci.pending_amount) as total_pending,
  AVG(ci.total_amount) as avg_invoice_amount
FROM card_invoices ci
WHERE ci.user_id = $1
  AND ci.card_id = $2
  AND ci.invoice_date >= NOW() - INTERVAL '12 months'
  AND ci.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', ci.invoice_date)
ORDER BY month DESC;
```

#### Q8: Installment breakdown by category
```sql
-- Use case: Analytics - Spending by category in current invoice
-- Performance: ~70ms
SELECT
  c.name,
  COUNT(cii.id) as item_count,
  SUM(cii.amount) as total_amount,
  AVG(cii.amount) as avg_amount,
  MIN(cii.amount) as min_amount,
  MAX(cii.amount) as max_amount
FROM card_invoice_items cii
JOIN card_invoices ci ON cii.invoice_id = ci.id
LEFT JOIN categories c ON cii.category_id = c.id
WHERE cii.user_id = $1
  AND ci.card_id = $2
  AND ci.invoice_date = DATE_TRUNC('month', NOW())::DATE
  AND cii.status != 'CANCELLED'
GROUP BY c.id, c.name
ORDER BY total_amount DESC;
```

#### Q9: Get multiple cards' upcoming installments (for sidebar)
```sql
-- Use case: STY-055 - Sidebar showing upcoming from ALL cards
-- Performance: ~100ms (multiple cards)
SELECT
  ca.id as card_id,
  ca.name as card_name,
  ca.lastFourDigits,
  ca.network,
  MIN(cii.due_date) as next_due_date,
  SUM(cii.amount) as total_amount_due,
  COUNT(cii.id) as num_items,
  JSON_AGG(JSON_BUILD_OBJECT(
    'description', cii.description,
    'amount', cii.amount,
    'due_date', cii.due_date
  ) ORDER BY cii.due_date LIMIT 3) as top_3_items
FROM accounts ca
LEFT JOIN card_invoice_items cii ON ca.id = cii.card_id
LEFT JOIN card_invoices ci ON cii.invoice_id = ci.id
WHERE ca.user_id = $1
  AND ca.type = 'CREDIT_CARD'
  AND ca.deleted_at IS NULL
  AND cii.status IN ('PENDING', 'OVERDUE')
  AND cii.due_date >= NOW()::DATE
  AND cii.due_date <= NOW()::DATE + INTERVAL '30 days'
GROUP BY ca.id, ca.name, ca.lastFourDigits, ca.network
ORDER BY next_due_date ASC;
```

#### Q10: Invoice reconciliation (manual vs auto-sync)
```sql
-- Use case: Verify invoice sync accuracy
-- Performance: ~120ms
SELECT
  ci.id,
  ci.invoice_number,
  ci.source,
  ci.total_amount,
  COUNT(DISTINCT cii.id) as num_items,
  COUNT(DISTINCT t.id) as num_transactions,
  CASE
    WHEN COUNT(DISTINCT t.id) = COUNT(DISTINCT cii.id) THEN 'BALANCED'
    WHEN COUNT(DISTINCT t.id) > COUNT(DISTINCT cii.id) THEN 'ORPHANED_TXN'
    ELSE 'MISSING_TXN'
  END as reconciliation_status
FROM card_invoices ci
LEFT JOIN card_invoice_items cii ON ci.id = cii.invoice_id
LEFT JOIN transactions t ON cii.transaction_id = t.id
WHERE ci.user_id = $1
  AND ci.card_id = $2
  AND ci.invoice_date >= NOW() - INTERVAL '6 months'
GROUP BY ci.id, ci.invoice_number, ci.source, ci.total_amount
ORDER BY ci.invoice_date DESC;
```

---

## PART 4: DATA INTEGRITY & VALIDATION

### 4.1 Constraints & Rules

| Constraint | Type | Severity | Check |
|-----------|------|----------|-------|
| User isolation | RLS | CRITICAL | Must verify `user_id` on every query |
| Valid dates | CHECK | HIGH | `closing_date < due_date` |
| Amount consistency | CHECK | HIGH | `paid_amount <= total_amount` |
| Installment numbers | CHECK | MEDIUM | `1 <= number <= total` |
| Status values | CHECK | MEDIUM | Must be in enum list |
| Unique invoice | UNIQUE | HIGH | `(user_id, card_id, invoice_date)` |
| Amount positivity | CHECK | MEDIUM | All amounts >= 0 |

### 4.2 Data Validation Rules

```typescript
// TypeScript validation schema (using Zod)
import { z } from 'zod';

export const CardInvoiceSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  cardId: z.string().uuid(),
  invoiceNumber: z.string().min(1).max(50),
  invoiceDate: z.coerce.date(),
  closingDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  totalAmount: z.number().min(0).max(999999.99),
  paidAmount: z.number().min(0).max(999999.99),
  status: z.enum(['OPEN', 'PAID', 'PARTIAL', 'OVERDUE']),
  source: z.enum(['manual', 'csv', 'api', 'auto_sync']),
  totalInstallments: z.number().int().min(1),
  paidInstallments: z.number().int().min(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}).strict();

export const CardInvoiceItemSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  userId: z.string().uuid(),
  installmentNumber: z.number().int().min(1),
  installmentTotal: z.number().int().min(1),
  description: z.string().min(1).max(255),
  amount: z.number().min(0.01).max(999999.99),
  categoryId: z.string().uuid().nullable(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']),
  dueDate: z.coerce.date(),
  paidDate: z.coerce.date().nullable(),
}).strict();
```

---

## PART 5: TYPESCRIPT TYPES & INTERFACES

### 5.1 Frontend Types (`src/types/creditCard.ts`)

```typescript
/**
 * Credit Card Invoice Types for SPFP
 * Organized for type safety and validation
 */

// Enums
export enum InvoiceStatus {
  OPEN = 'OPEN',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE'
}

export enum InstallmentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum InvoiceSource {
  MANUAL = 'manual',
  CSV = 'csv',
  API = 'api',
  AUTO_SYNC = 'auto_sync'
}

// Main Interfaces
export interface CardInvoice {
  id: string;
  userId: string;
  cardId: string;

  // Identifiers
  invoiceNumber: string;  // e.g., "202601" or "001-2026"

  // Dates
  invoiceDate: Date;      // First day of invoice month
  closingDate: Date;      // When invoice closes
  dueDate: Date;          // Payment due date

  // Amounts
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;  // Derived: total - paid

  // Status
  status: InvoiceStatus;
  source: InvoiceSource;

  // Installment summary
  totalInstallments: number;
  paidInstallments: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CardInvoiceItem {
  id: string;
  invoiceId: string;
  userId: string;
  transactionId?: string;  // Link to transactions table

  // Installment info
  installmentNumber: number;      // 1, 2, 3...
  installmentTotal: number;       // Total installments
  originalTransactionDate?: Date; // When purchase was made

  // Item details
  description: string;
  amount: number;
  categoryId?: string;

  // Status
  status: InstallmentStatus;
  dueDate: Date;
  paidDate?: Date;

  // Denormalization
  cardId: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface CardInvoiceSummary extends CardInvoice {
  itemCount: number;
  paidItems: number;
  lastItemDueDate: Date;
}

export interface FutureInstallment {
  dueDate: Date;
  totalAmount: number;
  cardId: string;
  cardName: string;
  cardLastFour?: string;
  cardNetwork?: string;
  items: CardInvoiceItem[];
}

export interface InstallmentRecommendation {
  medianInstallment: number;
  averageInstallment: number;
  maxInstallment: number;
  minInstallment: number;
  stdDeviation: number;
  totalInstallments: number;
  percentileQ1: number;
  percentileQ3: number;
}

export interface InvoiceSyncResult {
  invoicesCreated: number;
  invoicesUpdated: number;
  itemsCreated: number;
  itemsUpdated: number;
  errors: string[];
  timestamp: Date;
  source: InvoiceSource;
}

export interface CardInvoiceFilters {
  cardId?: string;
  status?: InvoiceStatus;
  dateFrom?: Date;
  dateTo?: Date;
  source?: InvoiceSource;
  limit?: number;
  offset?: number;
}

export interface MonthlySpendingSummary {
  month: Date;
  numInvoices: number;
  totalSpent: number;
  totalPaid: number;
  totalPending: number;
  avgInvoiceAmount: number;
}

export interface OverdueItem {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  cardId: string;
  cardName: string;
  daysOverdue: number;
  severity: 'ALERT' | 'WARNING' | 'CRITICAL';
}

export interface InvoiceReconciliation {
  invoiceId: string;
  invoiceNumber: string;
  source: InvoiceSource;
  totalAmount: number;
  numItems: number;
  numTransactions: number;
  status: 'BALANCED' | 'ORPHANED_TXN' | 'MISSING_TXN';
}
```

### 5.2 FinanceContext Extension

```typescript
// Add to GlobalState interface in FinanceContext.tsx
interface GlobalState {
  // ... existing fields ...
  creditCardInvoices: CardInvoice[];
  creditCardInvoiceItems: CardInvoiceItem[];
  lastInvoiceSync?: Date;
  isSyncingInvoices?: boolean;
}

// Add to FinanceContextType
export interface FinanceContextData extends FinanceContextType {
  // ... existing methods ...

  // Invoice operations
  creditCardInvoices: CardInvoice[];
  creditCardInvoiceItems: CardInvoiceItem[];
  syncCreditCardInvoices: (cardId: string) => Promise<InvoiceSyncResult>;
  addCreditCardInvoice: (invoice: Omit<CardInvoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCreditCardInvoice: (invoice: CardInvoice) => void;
  deleteCreditCardInvoice: (id: string) => void;

  // Item operations
  addCreditCardInvoiceItem: (item: Omit<CardInvoiceItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCreditCardInvoiceItem: (item: CardInvoiceItem) => void;
  deleteCreditCardInvoiceItem: (id: string) => void;

  // Query operations
  getInvoicesByCard: (cardId: string, months?: number) => CardInvoice[];
  getFutureInstallments: (cardId?: string, days?: number) => FutureInstallment[];
  getInstallmentsByInvoice: (invoiceId: string) => CardInvoiceItem[];
  getInstallmentRecommendation: (cardId: string) => InstallmentRecommendation;
  getMonthlySpending: (cardId: string) => MonthlySpendingSummary[];
  getOverdueItems: () => OverdueItem[];

  // Status
  isSyncingInvoices: boolean;
  lastInvoiceSync?: Date;
}
```

---

## PART 6: DATA INGESTION ARCHITECTURE

### 6.1 Sources & Integration Strategy

| Source | Priority | Effort | Recommendation | Timeline |
|--------|----------|--------|-----------------|----------|
| **Manual Form** | P0 | 3h | Implement first (MVE) | Week 1 |
| **CSV Import** | P1 | 4h | Support standard bank exports | Week 1-2 |
| **Open Banking API** | P2 | 12h | Integrate with Cosmos/PIX | Week 3+ |
| **Direct Bank APIs** | P3 | 20h+ | Per-bank integration | Future |

### 6.2 CSV Import Strategy

**Expected CSV Format (Brazilian Banks):**
```csv
Invoice Date,Due Date,Description,Amount,Category,Status,Installment Number,Installment Total
2026-01-10,2026-01-20,"Compra - Eletrodomésticos",1299.90,"Compras",PENDING,1,3
2026-01-10,2026-02-20,"Compra - Eletrodomésticos",1299.90,"Compras",PENDING,2,3
2026-01-10,2026-03-20,"Compra - Eletrodomésticos",1299.90,"Compras",PENDING,3,3
```

**Parsing Logic:**
```typescript
async function parseCSVInvoices(
  file: File,
  cardId: string,
  userId: string
): Promise<{ invoices: Partial<CardInvoice>[], items: Partial<CardInvoiceItem>[] }> {
  const text = await file.text();
  const rows = text.split('\n').slice(1); // Skip header

  const invoices = new Map<string, Partial<CardInvoice>>();
  const items: Partial<CardInvoiceItem>[] = [];

  for (const row of rows) {
    const [invoiceDate, dueDate, description, amount, category, status, instNum, instTotal] = row.split(',');

    // Create invoice key (month-based)
    const invKey = new Date(invoiceDate).toISOString().slice(0, 7);
    if (!invoices.has(invKey)) {
      invoices.set(invKey, {
        cardId,
        userId,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        closingDate: new Date(new Date(invoiceDate).getTime() - 10 * 24 * 60 * 60 * 1000),
        source: 'csv',
        status: 'OPEN',
        totalAmount: 0,
        totalInstallments: parseInt(instTotal)
      });
    }

    // Add item
    const invoice = invoices.get(invKey)!;
    items.push({
      invoiceId: '', // Will be set after invoice creation
      userId,
      description,
      amount: parseFloat(amount),
      categoryId: category, // Map to existing category
      status: status as InstallmentStatus,
      dueDate: new Date(dueDate),
      installmentNumber: parseInt(instNum),
      installmentTotal: parseInt(instTotal),
      cardId
    });

    // Sum total
    invoice.totalAmount = (invoice.totalAmount || 0) + parseFloat(amount);
  }

  return {
    invoices: Array.from(invoices.values()),
    items
  };
}
```

### 6.3 Form Data (STY-055)

**Form fields:**
- Invoice Number
- Invoice Date
- Due Date
- Total Amount
- Status (dropdown)
- Add Items (modal/form):
  - Description
  - Amount
  - Category
  - Installment Number
  - Installment Total
  - Due Date

### 6.4 API Integration Pattern (Future)

```typescript
interface BankAPIConnector {
  provider: 'nubank' | 'bradesco' | 'itau' | 'open_finance';
  authenticate(): Promise<AuthToken>;
  fetchInvoices(accountId: string, from: Date, to: Date): Promise<RawInvoice[]>;
  parseInvoices(raw: RawInvoice[]): Promise<{ invoices: CardInvoice[], items: CardInvoiceItem[] }>;
  syncTransactions(): Promise<void>;
}

// Implement for Nubank (example)
class NubankConnector implements BankAPIConnector {
  async fetchInvoices(accountId: string) {
    const response = await fetch('https://api.nubank.com.br/statements', {
      headers: { 'Authorization': `Bearer ${this.accessToken}` }
    });
    return response.json();
  }
}
```

---

## PART 7: PERFORMANCE BENCHMARKS

### 7.1 Query Performance Targets (PostgreSQL)

| Query | Dataset | Target | Expected | Notes |
|-------|---------|--------|----------|-------|
| Q1 (Last 12 invoices) | 50 rows | <50ms | ~35ms | Indexed on user_id + card_id |
| Q2 (Future 90 days) | 200 items | <75ms | ~40ms | Indexed on card_id + due_date |
| Q3 (Statistics) | 180 items | <100ms | ~80ms | Uses percentile_cont |
| Q4 (Grouped alerts) | 500 items | <100ms | ~60ms | JSON aggregation |
| Q5 (Pagination) | 1000+ invoices | <100ms | ~35ms | Limit + offset |
| Q6 (Overdue) | 10000 items | <150ms | ~50ms | Status-based filter |
| Q7 (Monthly trend) | 36 invoices | <150ms | ~90ms | Date truncation + aggregate |
| Q8 (Category breakdown) | 200 items | <100ms | ~70ms | Group by + join |
| Q9 (Multi-card alerts) | 4 cards × 100 items | <100ms | ~100ms | Union of cards |
| Q10 (Reconciliation) | 24 invoices | <200ms | ~120ms | 3-table join |

### 7.2 Index Strategy

```sql
-- Primary indexes for common filters
CREATE INDEX idx_card_invoices_user_id ON card_invoices(user_id);
CREATE INDEX idx_card_invoices_card_id ON card_invoices(card_id);
CREATE INDEX idx_card_invoices_user_card ON card_invoices(user_id, card_id);
CREATE INDEX idx_card_invoices_due_date ON card_invoices(due_date);
CREATE INDEX idx_card_invoices_status ON card_invoices(status);

-- Composite indexes for common query patterns
CREATE INDEX idx_card_invoices_user_card_date
  ON card_invoices(user_id, card_id, invoice_date DESC);
CREATE INDEX idx_card_invoices_user_status_date
  ON card_invoices(user_id, status, due_date DESC);

-- Items indexes
CREATE INDEX idx_card_invoice_items_invoice ON card_invoice_items(invoice_id);
CREATE INDEX idx_card_invoice_items_user_status ON card_invoice_items(user_id, status);
CREATE INDEX idx_card_invoice_items_card_due ON card_invoice_items(card_id, due_date);
CREATE INDEX idx_card_invoice_items_user_card_due
  ON card_invoice_items(user_id, card_id, due_date DESC);

-- Soft-delete aware indexes
CREATE INDEX idx_card_invoices_active
  ON card_invoices(user_id, card_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_card_invoice_items_active
  ON card_invoice_items(user_id, status)
  WHERE deleted_at IS NULL;  -- If items also support soft delete
```

### 7.3 Caching Strategy

| Data | TTL | Invalidate | Notes |
|------|-----|-----------|-------|
| Invoice list (12 mo) | 6h | On new transaction | localStorage + memory |
| Current month items | 1h | On item update | High volatility |
| Future 90 days | 4h | On invoice/item change | Reference data |
| Monthly statistics | 12h | On month change | Historical |
| Recommendation stats | 24h | On invoice close | Long-term trends |
| Category breakdown | 2h | On transaction add | Monthly view |

---

## PART 8: ERROR RECOVERY & RELIABILITY

### 8.1 Failure Scenarios

| Scenario | Impact | Recovery Strategy |
|----------|--------|-------------------|
| **API timeout** | Sync fails | Retry with exponential backoff (3x) |
| **Duplicate invoice** | Data corruption | Check UNIQUE constraint, merge items |
| **Missing category** | Null reference | Create default category, log issue |
| **Amount mismatch** | Data integrity | Log discrepancy, alert user, manual review |
| **Network error** | Partial sync | Queue for retry, show cached data |
| **Database constraint fail** | Transaction rollback | Validate client-side first, retry |
| **User data corruption** | RLS bypass attempt | Log security event, prevent write |

### 8.2 Implementation Pattern

```typescript
import { withErrorRecovery } from '../services/errorRecovery';

async function syncInvoicesWithRecovery(cardId: string, userId: string) {
  const result = await withErrorRecovery(
    async () => {
      // Fetch from API/CSV
      const rawData = await cardInvoiceService.fetchInvoices(cardId);

      // Parse & validate
      const invoices = parseInvoices(rawData);
      validateInvoices(invoices);

      // Sync to Supabase with transaction
      const syncResult = await syncToSupabase(invoices, userId);

      return syncResult;
    },
    'Sync credit card invoices',
    {
      maxRetries: 3,
      userId,
      metadata: { cardId, operation: 'sync_invoices' },
      previousState: currentInvoices, // For rollback
      onRollback: async (state) => {
        // Restore previous state if sync fails
        await restoreInvoices(state);
      }
    }
  );

  return result;
}
```

---

## PART 9: MIGRATION PLAN

### 9.1 Phase 1: Schema Creation (Week 1)
1. Create `card_invoices` table with constraints
2. Create `card_invoice_items` table with constraints
3. Create RLS policies
4. Create indexes
5. Set up triggers for status auto-update

### 9.2 Phase 2: Service Implementation (Week 1-2)
1. Create `src/services/cardInvoiceService.ts`
2. Implement `fetchInvoices()` (mock data first)
3. Implement `parseInvoices()` (CSV + form)
4. Add error recovery & retry logic
5. Write integration tests

### 9.3 Phase 3: Frontend Integration (Week 2-3)
1. Add types to `src/types/creditCard.ts`
2. Extend FinanceContext with invoice state
3. Create UI components:
   - `CreditCardInvoiceDetails.tsx` (STY-060)
   - `CreditCardDisplay.tsx` (STY-061)
   - Invoice form (STY-055)
4. Integrate with Dashboard & Sidebar

### 9.4 Phase 4: Data Migration (Optional)
1. Script to migrate existing transactions to card_invoice_items
2. Backfill invoice dates based on transaction dates
3. Validate data integrity

---

## PART 10: DELIVERABLES CHECKLIST

### 10.1 Code Deliverables

- [ ] SQL migrations: `001_card_invoices_schema.sql`
- [ ] Service: `src/services/cardInvoiceService.ts`
- [ ] Types: `src/types/creditCard.ts`
- [ ] Validators: `src/services/validationService.ts` (extend)
- [ ] FinanceContext extension: `src/context/FinanceContext.tsx`
- [ ] Components:
  - [ ] `src/components/CreditCardInvoiceDetails.tsx`
  - [ ] `src/components/CreditCardDisplay.tsx`
  - [ ] `src/components/forms/InvoiceForm.tsx`
  - [ ] `src/components/forms/InvoiceItemForm.tsx`
- [ ] Utilities: `src/utils/invoiceCalculations.ts`

### 10.2 Documentation

- [ ] Database schema diagram (ER diagram)
- [ ] Query performance report (EXPLAIN ANALYZE)
- [ ] Type definitions documentation
- [ ] API endpoint documentation
- [ ] Error codes & handling guide
- [ ] Testing strategy document

### 10.3 Testing

- [ ] Unit tests: Service layer (50+ tests)
- [ ] Integration tests: Database layer (20+ tests)
- [ ] Component tests: React components (15+ tests)
- [ ] Performance tests: Query benchmarks
- [ ] Error recovery tests: 10+ failure scenarios

### 10.4 Stories Completion

- [ ] STY-058: Card Invoice Fetching Service ✓
- [ ] STY-060: Current & Future Installments Display ✓
- [ ] STY-061: Realistic Card Design ✓
- [ ] STY-059: Invoice Context Integration (prerequisite) ✓

---

## PART 11: NEXT STEPS

### Immediate Actions (Today)
1. Present this design to @architect for review
2. Validate schema relationships with @devops
3. Approve TypeScript type structure with @dev

### Implementation Order
1. **STY-058 (8h):** Create service + schema + basic queries
2. **STY-059 (6h):** Integrate with FinanceContext
3. **STY-060 (7h):** Build UI components + advanced queries
4. **STY-061 (8h):** Realistic card design + animations

### Risk Mitigation
- Start with mock data (no real API calls)
- Use transactions for atomicity
- Implement comprehensive error recovery
- Test with 1000+ records to verify performance

---

## APPENDIX A: Quick Reference

### Storage Key Strategy
```typescript
// localStorage keys for invoice caching
const INVOICE_CACHE_KEY = (userId: string) => `spfp_invoices_${userId}`;
const ITEMS_CACHE_KEY = (userId: string) => `spfp_invoice_items_${userId}`;
const SYNC_STATE_KEY = (userId: string) => `spfp_invoice_sync_${userId}`;
```

### Common Calculations
```typescript
// Calculate pending amount
const pending = invoice.totalAmount - invoice.paidAmount;

// Calculate percentage paid
const paidPercentage = (invoice.paidAmount / invoice.totalAmount) * 100;

// Days until due
const daysUntilDue = Math.ceil(
  (invoice.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
);

// Months back from invoice date
const monthsAgo = (invoice.invoiceDate) => {
  const now = new Date();
  return (now.getFullYear() - invoice.invoiceDate.getFullYear()) * 12 +
         (now.getMonth() - invoice.invoiceDate.getMonth());
};
```

### Sample Mock Data
```json
{
  "invoices": [
    {
      "id": "inv_001",
      "invoiceNumber": "202601",
      "invoiceDate": "2026-01-01",
      "dueDate": "2026-01-20",
      "closingDate": "2025-12-21",
      "totalAmount": 5234.50,
      "paidAmount": 0,
      "status": "OPEN",
      "source": "manual",
      "totalInstallments": 8
    }
  ],
  "items": [
    {
      "id": "item_001",
      "invoiceId": "inv_001",
      "description": "Compra - Eletrodomésticos",
      "amount": 1299.90,
      "installmentNumber": 1,
      "installmentTotal": 3,
      "dueDate": "2026-01-20",
      "status": "PENDING",
      "categoryId": "cat_8"
    }
  ]
}
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-05
**Status:** Ready for Implementation
**Next Review:** After STY-058 completion
