# ARCHITECTURE DESIGN - FASE 1
## Sistema de Planejamento Financeiro Pessoal (SPFP)

**Author:** Aria - Arquiteta
**Date:** Fevereiro 2026
**Version:** 1.0
**Status:** DESIGN COMPLETE
**Scope:** FASE 1 (STY-051 a STY-065) | 15 User Stories

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Current Architecture Assessment](#current-architecture-assessment)
3. [Supabase Schema Design](#supabase-schema-design)
4. [Context/State Management](#contextstate-management-architecture)
5. [Service Layer Design](#service-layer-design)
6. [Integration Points](#integration-points)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [Performance & Scalability](#performance--scalability)
9. [Implementation Timeline](#implementation-timeline)
10. [Decision Log](#decision-log)

---

## EXECUTIVE SUMMARY

### Overview

FASE 1 introduces 3 major feature areas with 15 interconnected user stories:

1. **Sidebar Reorganization** (STY-051 to STY-057): Collapsible UI with Budget, Accounts, Transactions, Installments
2. **Credit Card Invoices** (STY-058 to STY-062): Invoice fetching, tracking, visual card display
3. **Investment Portfolio** (STY-063 to STY-065): Portfolio data model, display, and metrics

### Architecture Decision: Option B - Separate Contexts

**RECOMMENDATION:** Implement separate domain-specific contexts rather than monolithic FinanceContext extension.

**Rationale:**
- FinanceContext has grown to 1000+ lines managing 7 data types
- New domains (Budgets, Invoices, Retirement, Assets) each have distinct:
  - State shape (different requirements per domain)
  - Supabase tables (separate entities)
  - Service layer (specialized calculations)
  - UI components (isolated feature areas)
- Separation enables:
  - Parallel development (different teams/sprints)
  - Independent testing and validation
  - Easier scaling in FASE 2-3
  - Zero prop drilling through Layout
  - Per-domain error recovery strategies

### New Context Structure

```
src/context/
├── AuthContext.tsx          [UNCHANGED] - User auth
├── FinanceContext.tsx       [REFACTORED] - Transactions + Accounts only
├── BudgetContext.tsx        [NEW] - Budget periods, items, tracking
├── InvoiceContext.tsx       [NEW] - Card invoices, items, tracking
├── InvestmentContext.tsx    [EXISTING] - Portfolio, holdings
├── RetirementContext.tsx    [NEW - FASE 2] - Goals, contributions, scenarios
├── AssetContext.tsx         [NEW - FASE 2] - Asset acquisition tracking
└── UIContext.tsx            [EXISTING] - Sidebar, theme, layout state
```

### Bundle Impact Assessment

**Estimated increase:** 45-65 KB (gzipped)
- 5 new contexts: ~30KB
- Service layer (5 services): ~20KB
- Type definitions: ~10KB
- **Mitigated by:** Lazy loading contexts by route (STY-082)

---

## CURRENT ARCHITECTURE ASSESSMENT

### Existing Strengths

1. **Multi-Context Pattern Already Established**
   - `AuthContext` (auth)
   - `InvestmentsContext` (investments)
   - `TransactionsContext`, `AccountsContext`, `GoalsContext`, `PatrimonyContext` (split)
   - `UIContext` (UI state)
   - **Status:** Project already moving toward domain-driven design ✅

2. **Error Recovery Layer Implemented**
   - `errorRecovery.ts` with context capture and retry logic
   - Exponential backoff strategy
   - Portuguese error messages
   - Sentry-ready logging
   - **Status:** Ready for integration into new services ✅

3. **TypeScript Infrastructure**
   - Strict mode enabled
   - Type definitions in `src/types.ts`
   - Interface-first development pattern
   - **Status:** Foundation solid, need new type modules ⚠️

4. **localStorage Sync Pattern**
   - Per-user storage keys: `visao360_v2_data_${userId}`
   - Fallback to initial data
   - Export/import functionality
   - **Status:** Proven pattern, can be extended ✅

### Identified Gaps for FASE 1

1. **No Supabase Table Definitions**
   - Invoice storage not defined
   - Budget schema unclear
   - No RLS policies for new tables
   - **Action:** Create SQL migrations

2. **Missing Service Layer**
   - No invoice fetching service
   - No budget calculation service
   - No investment portfolio service
   - **Action:** Design service interfaces and implementations

3. **UI State Management Scattered**
   - Sidebar state likely in UIContext or component state
   - No centralized Sidebar Context documented
   - STY-051 specifically requires new SidebarContext
   - **Action:** Create dedicated SidebarContext

4. **Type Definitions Incomplete**
   - No Budget, Invoice, Asset types defined
   - Types currently in `src/types.ts` (single file)
   - Need modular type organization
   - **Action:** Create type modules in `src/types/` directory

---

## SUPABASE SCHEMA DESIGN

### Design Principles

1. **RLS-First:** Every table has Row Level Security policies
2. **Referential Integrity:** Foreign keys enforced at DB level
3. **Soft Deletes:** Deletable items have `deleted_at` timestamp
4. **Performance:** Indexes on frequently queried columns
5. **Audit Trail:** `created_at`, `updated_at` on critical tables
6. **Isolation:** Per-user data separation enforced by RLS

### Table Designs

#### 1. BUDGET_PERIODS

**Purpose:** Track budget cycles (monthly, quarterly, annual)

```sql
CREATE TABLE public.budget_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_name VARCHAR(100) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  total_spent DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'ARCHIVED')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,
  UNIQUE(user_id, period_start, period_end),
  INDEX idx_user_periods (user_id, period_start DESC)
);
```

**Fields Explanation:**
- `user_id`: Link to Supabase auth user
- `total_spent`: Denormalized for performance (sum of budget_items)
- `status`: Lifecycle tracking (active → closed → archived)
- `deleted_at`: Soft delete support
- `UNIQUE constraint`: Prevent overlapping budget periods

**RLS Policies:**
```sql
-- Users can only see their own budget periods
CREATE POLICY "budget_periods_user_isolation"
ON budget_periods
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "budget_periods_user_insert"
ON budget_periods
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_periods_user_update"
ON budget_periods
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "budget_periods_user_delete"
ON budget_periods
FOR DELETE
USING (auth.uid() = user_id);
```

---

#### 2. BUDGET_ITEMS

**Purpose:** Line items within a budget period

```sql
CREATE TABLE public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_period_id UUID NOT NULL REFERENCES budget_periods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id VARCHAR(100) NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  budgeted_amount DECIMAL(12,2) NOT NULL,
  spent_amount DECIMAL(12,2) DEFAULT 0,
  rollover_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'EXCEEDED', 'COMPLETED')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,
  INDEX idx_budget_period (budget_period_id),
  INDEX idx_category (user_id, category_id)
);
```

**Fields Explanation:**
- `spent_amount`: Denormalized from transactions (for performance)
- `rollover_amount`: Unused budget carried to next period
- `status`: Auto-calculated (spent > budgeted = EXCEEDED)
- Composite key: (budget_period_id, category_id)

**RLS Policies:**
```sql
CREATE POLICY "budget_items_user_isolation"
ON budget_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "budget_items_user_write"
ON budget_items
FOR INSERT, UPDATE, DELETE
USING (auth.uid() = user_id);
```

---

#### 3. CARD_INVOICES

**Purpose:** Credit card invoice aggregation (STY-058)

```sql
CREATE TABLE public.card_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id VARCHAR(100) NOT NULL,
  card_name VARCHAR(100),
  card_last_four VARCHAR(4),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  opening_date DATE,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PARTIAL', 'PAID', 'OVERDUE', 'CLOSED')),
  payment_date TIMESTAMP,
  minimum_payment DECIMAL(12,2),
  notes TEXT,
  source VARCHAR(50) DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'API', 'IMPORTED')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,
  UNIQUE(user_id, card_id, invoice_date),
  INDEX idx_user_invoices (user_id, due_date DESC),
  INDEX idx_status (user_id, status)
);
```

**Fields Explanation:**
- `card_id`: Reference to credit card (from accounts table or separate)
- `total_amount`: Sum of all invoice items
- `status`: Lifecycle (OPEN → PAID or OVERDUE → PARTIAL → CLOSED)
- `source`: MANUAL = user entered, API = fetched from provider
- `paid_amount`: Running total of payments

**RLS Policies:**
```sql
CREATE POLICY "card_invoices_user_isolation"
ON card_invoices
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "card_invoices_user_write"
ON card_invoices
FOR INSERT, UPDATE, DELETE
USING (auth.uid() = user_id);
```

---

#### 4. CARD_INVOICE_ITEMS

**Purpose:** Line items in a credit card invoice (installments, individual charges)

```sql
CREATE TABLE public.card_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES card_invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  category_id VARCHAR(100),
  category_name VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  purchase_date DATE,
  installment_number INT DEFAULT 1,
  installment_total INT DEFAULT 1,
  is_installment BOOLEAN DEFAULT FALSE,
  merchant_name VARCHAR(255),
  merchant_category_code VARCHAR(4),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,
  INDEX idx_invoice_items (invoice_id),
  INDEX idx_installment_tracking (user_id, is_installment, installment_number)
);
```

**Fields Explanation:**
- `installment_number`: Current installment (1 of 12, etc.)
- `installment_total`: Total number of installments
- `is_installment`: TRUE if part of multi-installment purchase
- `merchant_category_code`: For spending analysis
- Future: Link to transaction ID for sync

**RLS Policies:**
```sql
CREATE POLICY "card_invoice_items_user_isolation"
ON card_invoice_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "card_invoice_items_user_write"
ON card_invoice_items
FOR INSERT, UPDATE, DELETE
USING (auth.uid() = user_id);
```

---

#### 5. INVESTMENTS (Modification)

**Current structure exists. Add these fields for FASE 1:**

```sql
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL(12,2);
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS ytd_return DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS allocation_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS sector VARCHAR(100);
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS allocation_target DECIMAL(5,2);
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS rebalance_frequency VARCHAR(50) DEFAULT 'QUARTERLY';
```

**New fields purpose:**
- `portfolio_value`: Total value of this holding
- `ytd_return`: Year-to-date return amount
- `allocation_percentage`: % of total portfolio
- `allocation_target`: Target allocation % (for rebalancing)
- `rebalance_frequency`: How often to rebalance

---

### Migration Scripts

**File:** `docs/migrations/001-fase1-schema.sql`

```sql
-- FASE 1 Schema Migrations
-- Created: 2026-02-05
-- Purpose: Add budget, invoice, and investment tracking tables

BEGIN;

-- 1. BUDGET PERIODS TABLE
CREATE TABLE IF NOT EXISTS public.budget_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_name VARCHAR(100) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  total_spent DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'ARCHIVED')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,
  UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_budget_periods_user_dates
ON budget_periods(user_id, period_start DESC);

-- 2. BUDGET ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_period_id UUID NOT NULL REFERENCES budget_periods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id VARCHAR(100) NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  budgeted_amount DECIMAL(12,2) NOT NULL,
  spent_amount DECIMAL(12,2) DEFAULT 0,
  rollover_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'EXCEEDED', 'COMPLETED')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_budget_items_period
ON budget_items(budget_period_id);

CREATE INDEX IF NOT EXISTS idx_budget_items_category
ON budget_items(user_id, category_id);

-- 3. CARD INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.card_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id VARCHAR(100) NOT NULL,
  card_name VARCHAR(100),
  card_last_four VARCHAR(4),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  opening_date DATE,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PARTIAL', 'PAID', 'OVERDUE', 'CLOSED')),
  payment_date TIMESTAMP,
  minimum_payment DECIMAL(12,2),
  notes TEXT,
  source VARCHAR(50) DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'API', 'IMPORTED')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,
  UNIQUE(user_id, card_id, invoice_date)
);

CREATE INDEX IF NOT EXISTS idx_card_invoices_user_due
ON card_invoices(user_id, due_date DESC);

CREATE INDEX IF NOT EXISTS idx_card_invoices_status
ON card_invoices(user_id, status);

-- 4. CARD INVOICE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.card_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES card_invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  category_id VARCHAR(100),
  category_name VARCHAR(100),
  amount DECIMAL(12,2) NOT NULL,
  purchase_date DATE,
  installment_number INT DEFAULT 1,
  installment_total INT DEFAULT 1,
  is_installment BOOLEAN DEFAULT FALSE,
  merchant_name VARCHAR(255),
  merchant_category_code VARCHAR(4),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_card_invoice_items_invoice
ON card_invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_card_invoice_items_installment
ON card_invoice_items(user_id, is_installment, installment_number);

-- 5. INVESTMENTS TABLE ALTERATIONS
ALTER TABLE IF EXISTS public.investments
ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS ytd_return DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS allocation_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sector VARCHAR(100),
ADD COLUMN IF NOT EXISTS allocation_target DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS rebalance_frequency VARCHAR(50) DEFAULT 'QUARTERLY';

-- 6. ENABLE RLS ON ALL NEW TABLES
ALTER TABLE budget_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_invoice_items ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR BUDGET_PERIODS
CREATE POLICY "budget_periods_select_own"
ON budget_periods FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "budget_periods_insert_own"
ON budget_periods FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_periods_update_own"
ON budget_periods FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_periods_delete_own"
ON budget_periods FOR DELETE
USING (auth.uid() = user_id);

-- 8. RLS POLICIES FOR BUDGET_ITEMS
CREATE POLICY "budget_items_select_own"
ON budget_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "budget_items_insert_own"
ON budget_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_items_update_own"
ON budget_items FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budget_items_delete_own"
ON budget_items FOR DELETE
USING (auth.uid() = user_id);

-- 9. RLS POLICIES FOR CARD_INVOICES
CREATE POLICY "card_invoices_select_own"
ON card_invoices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "card_invoices_insert_own"
ON card_invoices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "card_invoices_update_own"
ON card_invoices FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "card_invoices_delete_own"
ON card_invoices FOR DELETE
USING (auth.uid() = user_id);

-- 10. RLS POLICIES FOR CARD_INVOICE_ITEMS
CREATE POLICY "card_invoice_items_select_own"
ON card_invoice_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "card_invoice_items_insert_own"
ON card_invoice_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "card_invoice_items_update_own"
ON card_invoice_items FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "card_invoice_items_delete_own"
ON card_invoice_items FOR DELETE
USING (auth.uid() = user_id);

COMMIT;
```

---

## CONTEXT/STATE MANAGEMENT ARCHITECTURE

### Design Approach

**Decision:** Option B - Separate Domain Contexts

**Reasoning:**
1. Single monolithic context becomes unmaintainable (1000+ lines)
2. Each domain has independent lifecycle:
   - Budget: Monthly/quarterly cycles
   - Invoice: Monthly closing, payment tracking
   - Investment: Daily price updates, portfolio rebalancing
3. Enables independent error recovery per domain
4. Easier testing (unit test each context in isolation)
5. Scales to future domains (Retirement, Assets, CRM)

### Context Specifications

---

#### 1. BUDGET CONTEXT

**File:** `src/context/BudgetContext.tsx`

**Purpose:** Manage budget periods, items, and spending tracking

```typescript
// Type Definitions (src/types/budget.ts)
export interface BudgetPeriod {
  id: string;
  user_id: string;
  period_name: string;
  period_start: string; // ISO date
  period_end: string;
  total_amount: number;
  total_spent: number;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  notes?: string;
  created_at: string;
  updated_at: string;
  deletedAt?: number; // Soft delete
}

export interface BudgetItem {
  id: string;
  budget_period_id: string;
  user_id: string;
  category_id: string;
  category_name: string;
  budgeted_amount: number;
  spent_amount: number;
  rollover_amount: number;
  status: 'IN_PROGRESS' | 'EXCEEDED' | 'COMPLETED';
  notes?: string;
  created_at: string;
  updated_at: string;
  deletedAt?: number;
}

export interface BudgetContextType {
  // State
  budgetPeriods: BudgetPeriod[];
  currentPeriod: BudgetPeriod | null;
  budgetItems: BudgetItem[];

  // Period Management
  createBudgetPeriod(period: Omit<BudgetPeriod, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<BudgetPeriod>;
  updateBudgetPeriod(period: BudgetPeriod): Promise<void>;
  closeBudgetPeriod(periodId: string): Promise<void>;
  getCurrentBudgetPeriod(): BudgetPeriod | null;

  // Item Management
  addBudgetItem(item: Omit<BudgetItem, 'id' | 'user_id' | 'spent_amount' | 'created_at' | 'updated_at'>): Promise<BudgetItem>;
  updateBudgetItem(item: BudgetItem): Promise<void>;
  deleteBudgetItem(itemId: string): Promise<void>;

  // Calculations
  getBudgetItemsByPeriod(periodId: string): BudgetItem[];
  getSpendingPercentage(itemId: string): number;
  getOverBudgetItems(periodId: string): BudgetItem[];
  getRemainingBudget(itemId: string): number;

  // Sync & Status
  isSyncing: boolean;
  isInitialLoadComplete: boolean;
  lastUpdated: number;
  syncBudgetsFromSupabase(): Promise<void>;
}
```

**Context Interface:**

```typescript
export interface BudgetProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children, userId }) => {
  // Implementation details follow Error Recovery pattern
};

export const useBudget = (): BudgetContextType => {
  // Hook with error handling
};
```

**localStorage Strategy:**
- Key: `spfp_budget_${userId}`
- Structure: `{ budgetPeriods: [], budgetItems: [], currentPeriodId: string }`
- Sync on mount, update on every change
- Supabase as source of truth

**Error Recovery Integration:**
```typescript
// In BudgetContext
import { withErrorRecovery } from '../services/errorRecovery';

const createBudgetPeriod = async (period: BudgetPeriodData) => {
  const previousState = { ...state };
  return withErrorRecovery(
    () => supabase.from('budget_periods').insert([{ ...period, user_id: userId }]),
    'Create budget period',
    {
      maxRetries: 3,
      userId,
      previousState,
      onRollback: () => setState(previousState)
    }
  );
};
```

---

#### 2. INVOICE CONTEXT

**File:** `src/context/InvoiceContext.tsx`

**Purpose:** Manage credit card invoices and installment tracking

```typescript
// Type Definitions (src/types/invoice.ts)
export interface CardInvoice {
  id: string;
  user_id: string;
  card_id: string;
  card_name: string;
  card_last_four?: string;
  invoice_date: string; // ISO date
  due_date: string;
  opening_date?: string;
  total_amount: number;
  paid_amount: number;
  status: 'OPEN' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CLOSED';
  payment_date?: string;
  minimum_payment?: number;
  notes?: string;
  source: 'MANUAL' | 'API' | 'IMPORTED';
  created_at: string;
  updated_at: string;
  deletedAt?: number;
}

export interface CardInvoiceItem {
  id: string;
  invoice_id: string;
  user_id: string;
  description: string;
  category_id?: string;
  category_name?: string;
  amount: number;
  purchase_date?: string;
  installment_number: number;
  installment_total: number;
  is_installment: boolean;
  merchant_name?: string;
  merchant_category_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  deletedAt?: number;
}

export interface InvoiceContextType {
  // State
  invoices: CardInvoice[];
  invoiceItems: CardInvoiceItem[];
  currentInvoice: CardInvoice | null;

  // Invoice Management
  fetchCurrentInvoices(): Promise<CardInvoice[]>;
  fetchFutureInstallments(): Promise<CardInvoiceItem[]>;
  createInvoice(invoice: Omit<CardInvoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CardInvoice>;
  updateInvoice(invoice: CardInvoice): Promise<void>;
  markInvoiceAsPaid(invoiceId: string, paymentDate: string): Promise<void>;

  // Item Management
  addInvoiceItem(item: Omit<CardInvoiceItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CardInvoiceItem>;
  getInvoiceItems(invoiceId: string): CardInvoiceItem[];
  getFutureInstallments(cardId?: string): CardInvoiceItem[];
  getCurrentInstallments(): CardInvoiceItem[];

  // Calculations
  getTotalCurrentInvoices(): number;
  getTotalFutureInstallments(): number;
  getCardDebt(cardId: string): number;
  getIdealPaymentAmount(invoiceId: string): number;

  // Sync & Status
  isSyncing: boolean;
  isInitialLoadComplete: boolean;
  lastUpdated: number;
  syncInvoicesFromSupabase(): Promise<void>;
}
```

**localStorage Strategy:**
- Key: `spfp_invoices_${userId}`
- Structure: `{ invoices: [], invoiceItems: [], lastRefresh: number }`
- Refresh on app load, hourly updates
- Cache invalidation on payment/new invoice

---

#### 3. SIDEBAR CONTEXT

**File:** `src/context/SidebarContext.tsx` (STY-051 requirement)

**Purpose:** Manage sidebar UI state (expanded/collapsed sections)

```typescript
// Type Definitions (src/types/sidebar.ts)
export type SidebarSection = 'BUDGET' | 'ACCOUNTS' | 'TRANSACTIONS' | 'INSTALLMENTS';

export interface SidebarState {
  isExpanded: boolean; // Sidebar open/close
  expandedSections: Record<SidebarSection, boolean>; // Per-section expand state
  hoveredItem?: string; // For hover effects
  lastUpdated: number;
}

export interface SidebarContextType {
  // State
  sidebarState: SidebarState;
  isExpanded: boolean;
  expandedSections: Record<SidebarSection, boolean>;

  // Actions
  toggleSidebar(): void;
  setSidebarExpanded(expanded: boolean): void;
  toggleSection(section: SidebarSection): void;
  setSectionExpanded(section: SidebarSection, expanded: boolean): void;
  setHoveredItem(itemId: string | undefined): void;

  // Persistence
  saveSidebarState(): void;
  loadSidebarState(): void;
}
```

**localStorage Strategy:**
- Key: `spfp_sidebar_state`
- Structure: `{ isExpanded: true, expandedSections: { BUDGET: true, ... } }`
- Persist on every change
- Device-specific (mobile vs desktop different defaults)

---

#### 4. INVESTMENT CONTEXT (Existing - Extensions for FASE 1)

**File:** `src/context/InvestmentContext.tsx` (already exists, add STY-063-065 fields)

**New Type Extensions:**

```typescript
export interface InvestmentAsset {
  // Existing fields
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  type: InvestmentType;
  sector?: string;
  lastUpdate: string;
  deletedAt?: number;

  // NEW for FASE 1 (STY-063)
  portfolio_value: number; // quantity * currentPrice
  ytd_return: number; // Year-to-date return
  allocation_percentage: number; // % of portfolio
  allocation_target?: number; // Target allocation
  rebalance_frequency?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
}

export interface InvestmentContextType {
  // Existing methods...

  // NEW for FASE 1 (STY-064, STY-065)
  getPortfolioMetrics(): PortfolioMetrics;
  getAssetAllocation(): AssetAllocation[];
  calculateRebalancing(): RebalancingRecommendation[];
}

interface PortfolioMetrics {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  ytdReturn: number;
  diversification: number; // 0-100
  riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
}

interface AssetAllocation {
  ticker: string;
  name: string;
  percentage: number;
  targetPercentage: number;
  variance: number;
}
```

---

### Context Composition in App.tsx

```typescript
// src/App.tsx
function App() {
  return (
    <AuthProvider>
      <BudgetProvider>
        <InvoiceProvider>
          <SidebarProvider>
            <UIProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>} />
              </Routes>
            </UIProvider>
          </SidebarProvider>
        </InvoiceProvider>
      </BudgetProvider>
    </AuthProvider>
  );
}
```

**Context Nesting Strategy:**
1. AuthProvider (outermost) - requires user auth
2. Domain contexts (BudgetProvider, InvoiceProvider) - require userId
3. UIProvider (innermost) - doesn't require external data

**No prop drilling:** Each context manages its own state independently

---

## SERVICE LAYER DESIGN

### Design Principles

1. **Functional Composition:** Each service = collection of pure functions
2. **Error Recovery:** All async operations use `withErrorRecovery()`
3. **Type Safety:** 100% TypeScript, no `any` types
4. **Testability:** Services have no dependencies on React
5. **Caching:** Strategic caching for expensive calculations
6. **Logging:** All operations logged with context

### Service Specifications

---

#### 1. BUDGET SERVICE

**File:** `src/services/budgetService.ts`

**Purpose:** Budget calculations and Supabase integration

```typescript
import { withErrorRecovery } from './errorRecovery';
import { supabase } from '../supabase';
import type { BudgetPeriod, BudgetItem } from '../types/budget';

export class BudgetService {
  /**
   * Fetch all budget periods for a user
   * @param userId - User ID
   * @returns Array of budget periods
   */
  static async getBudgetPeriods(userId: string): Promise<BudgetPeriod[]> {
    return withErrorRecovery(
      async () => {
        const { data, error } = await supabase
          .from('budget_periods')
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .order('period_start', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      'Fetch budget periods',
      { maxRetries: 3, userId }
    );
  }

  /**
   * Get current active budget period for user
   * @param userId - User ID
   * @returns Current budget period or null
   */
  static async getCurrentBudgetPeriod(userId: string): Promise<BudgetPeriod | null> {
    const today = new Date().toISOString().split('T')[0];
    const periods = await this.getBudgetPeriods(userId);
    return periods.find(p =>
      p.period_start <= today &&
      p.period_end >= today &&
      p.status === 'ACTIVE'
    ) || null;
  }

  /**
   * Create new budget period
   * @param userId - User ID
   * @param period - Budget period data
   * @returns Created budget period
   */
  static async createBudgetPeriod(
    userId: string,
    period: Omit<BudgetPeriod, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<BudgetPeriod> {
    return withErrorRecovery(
      async () => {
        const { data, error } = await supabase
          .from('budget_periods')
          .insert([{ ...period, user_id: userId }])
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      'Create budget period',
      { maxRetries: 2, userId }
    );
  }

  /**
   * Get budget items for a period
   * @param periodId - Budget period ID
   * @returns Array of budget items
   */
  static async getBudgetItems(periodId: string): Promise<BudgetItem[]> {
    return withErrorRecovery(
      async () => {
        const { data, error } = await supabase
          .from('budget_items')
          .select('*')
          .eq('budget_period_id', periodId)
          .is('deleted_at', null)
          .order('category_name', { ascending: true });

        if (error) throw error;
        return data || [];
      },
      'Fetch budget items',
      { maxRetries: 3 }
    );
  }

  /**
   * Calculate spending percentage for budget item
   * @param budgetedAmount - Budgeted amount
   * @param spentAmount - Actual spent amount
   * @returns Percentage 0-100
   */
  static getSpendingPercentage(budgetedAmount: number, spentAmount: number): number {
    if (budgetedAmount === 0) return 0;
    return Math.round((spentAmount / budgetedAmount) * 100);
  }

  /**
   * Determine budget item status based on spending
   * @param budgetedAmount - Budgeted amount
   * @param spentAmount - Actual spent amount
   * @returns Status
   */
  static getBudgetStatus(
    budgetedAmount: number,
    spentAmount: number
  ): 'IN_PROGRESS' | 'EXCEEDED' | 'COMPLETED' {
    const percentage = this.getSpendingPercentage(budgetedAmount, spentAmount);
    if (percentage >= 100) return 'EXCEEDED';
    if (percentage >= 90) return 'COMPLETED'; // Close to limit
    return 'IN_PROGRESS';
  }

  /**
   * Calculate remaining budget
   * @param budgetedAmount - Budgeted amount
   * @param spentAmount - Actual spent amount
   * @returns Remaining budget (can be negative if exceeded)
   */
  static getRemainingBudget(budgetedAmount: number, spentAmount: number): number {
    return budgetedAmount - spentAmount;
  }

  /**
   * Get budget items that exceeded limit
   * @param items - Array of budget items
   * @returns Over-budget items
   */
  static getOverBudgetItems(items: BudgetItem[]): BudgetItem[] {
    return items.filter(item => item.spent_amount > item.budgeted_amount);
  }

  /**
   * Calculate total budget summary
   * @param items - Budget items
   * @returns Summary statistics
   */
  static calculateBudgetSummary(items: BudgetItem[]) {
    return {
      totalBudgeted: items.reduce((sum, item) => sum + item.budgeted_amount, 0),
      totalSpent: items.reduce((sum, item) => sum + item.spent_amount, 0),
      totalRemaining: items.reduce((sum, item) => sum + this.getRemainingBudget(item.budgeted_amount, item.spent_amount), 0),
      overBudgetCount: this.getOverBudgetItems(items).length,
      utilizationRate: this.getSpendingPercentage(
        items.reduce((sum, item) => sum + item.budgeted_amount, 0),
        items.reduce((sum, item) => sum + item.spent_amount, 0)
      )
    };
  }
}
```

**Usage in BudgetContext:**
```typescript
const syncBudgetsFromSupabase = async () => {
  setIsSyncing(true);
  try {
    const periods = await BudgetService.getBudgetPeriods(userId);
    const current = await BudgetService.getCurrentBudgetPeriod(userId);
    setState({ budgetPeriods: periods, currentPeriod: current });
  } finally {
    setIsSyncing(false);
  }
};
```

---

#### 2. INVOICE SERVICE

**File:** `src/services/invoiceService.ts`

**Purpose:** Invoice fetching, payment tracking, installment calculations

```typescript
export class InvoiceService {
  /**
   * Fetch all invoices for a user
   * @param userId - User ID
   * @returns Array of invoices
   */
  static async getInvoices(userId: string): Promise<CardInvoice[]> {
    return withErrorRecovery(
      async () => {
        const { data, error } = await supabase
          .from('card_invoices')
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .order('due_date', { ascending: true });

        if (error) throw error;
        return data || [];
      },
      'Fetch invoices',
      { maxRetries: 3, userId }
    );
  }

  /**
   * Get current open invoices (due in next 30 days)
   * @param userId - User ID
   * @returns Current invoices
   */
  static async getCurrentInvoices(userId: string): Promise<CardInvoice[]> {
    const invoices = await this.getInvoices(userId);
    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return invoices.filter(inv =>
      new Date(inv.due_date) >= today &&
      new Date(inv.due_date) <= in30Days &&
      inv.status !== 'CLOSED'
    );
  }

  /**
   * Get future installments (charges that will appear in future invoices)
   * @param userId - User ID
   * @returns Future installments
   */
  static async getFutureInstallments(userId: string): Promise<CardInvoiceItem[]> {
    return withErrorRecovery(
      async () => {
        const { data, error } = await supabase
          .from('card_invoice_items')
          .select('*')
          .eq('user_id', userId)
          .eq('is_installment', true)
          .is('deleted_at', null)
          .order('installment_number', { ascending: true });

        if (error) throw error;

        // Filter to future installments only
        const today = new Date().toISOString().split('T')[0];
        return (data || []).filter(item => !item.purchase_date || item.purchase_date > today);
      },
      'Fetch future installments',
      { maxRetries: 3, userId }
    );
  }

  /**
   * Calculate ideal payment amount for invoice
   * Considers minimum payment, total amount, and due date
   * @param invoice - Card invoice
   * @returns Ideal payment amount
   */
  static calculateIdealPaymentAmount(invoice: CardInvoice): number {
    const daysToDue = Math.floor(
      (new Date(invoice.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    // If < 7 days, pay full amount
    if (daysToDue < 7) return invoice.total_amount - invoice.paid_amount;

    // Otherwise, at least minimum payment or 20% of balance
    const minimumAmount = invoice.minimum_payment || (invoice.total_amount * 0.1);
    const twentyPercent = (invoice.total_amount - invoice.paid_amount) * 0.2;

    return Math.max(minimumAmount, twentyPercent);
  }

  /**
   * Get total current invoice amount
   * @param invoices - Array of invoices
   * @returns Total amount
   */
  static getTotalCurrentInvoices(invoices: CardInvoice[]): number {
    return invoices
      .filter(inv => inv.status !== 'CLOSED' && inv.status !== 'PAID')
      .reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);
  }

  /**
   * Get total future installments
   * @param items - Array of invoice items
   * @returns Total amount
   */
  static getTotalFutureInstallments(items: CardInvoiceItem[]): number {
    return items.reduce((sum, item) => sum + item.amount, 0);
  }

  /**
   * Calculate total debt for a card
   * @param invoices - User invoices
   * @param cardId - Card ID
   * @returns Total debt
   */
  static getCardDebt(invoices: CardInvoice[], cardId: string): number {
    return invoices
      .filter(inv => inv.card_id === cardId && inv.status !== 'CLOSED')
      .reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);
  }

  /**
   * Mark invoice as paid
   * @param invoiceId - Invoice ID
   * @param paymentAmount - Amount paid
   * @returns Updated invoice
   */
  static async markInvoiceAsPaid(
    invoiceId: string,
    paymentAmount: number,
    paymentDate: string = new Date().toISOString()
  ): Promise<CardInvoice> {
    return withErrorRecovery(
      async () => {
        // Fetch current invoice
        const { data: invoice, error: fetchError } = await supabase
          .from('card_invoices')
          .select('*')
          .eq('id', invoiceId)
          .single();

        if (fetchError) throw fetchError;

        const newPaidAmount = invoice.paid_amount + paymentAmount;
        const newStatus = newPaidAmount >= invoice.total_amount ? 'PAID' : 'PARTIAL';

        // Update invoice
        const { data, error } = await supabase
          .from('card_invoices')
          .update({
            paid_amount: newPaidAmount,
            status: newStatus,
            payment_date: paymentDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', invoiceId)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      'Mark invoice as paid',
      { maxRetries: 2 }
    );
  }
}
```

---

#### 3. INVESTMENT PORTFOLIO SERVICE

**File:** `src/services/investmentPortfolioService.ts`

**Purpose:** Portfolio calculations, allocation analysis (STY-063 to STY-065)

```typescript
export class InvestmentPortfolioService {
  /**
   * Calculate total portfolio value
   * @param assets - Investment assets
   * @returns Total value
   */
  static calculatePortfolioValue(assets: InvestmentAsset[]): number {
    return assets
      .filter(a => !a.deletedAt)
      .reduce((sum, asset) => sum + (asset.quantity * asset.currentPrice), 0);
  }

  /**
   * Calculate total invested amount (cost basis)
   * @param assets - Investment assets
   * @returns Total invested
   */
  static calculateTotalInvested(assets: InvestmentAsset[]): number {
    return assets
      .filter(a => !a.deletedAt)
      .reduce((sum, asset) => sum + (asset.quantity * asset.averagePrice), 0);
  }

  /**
   * Calculate total return
   * @param assets - Investment assets
   * @returns Total return (in currency)
   */
  static calculateTotalReturn(assets: InvestmentAsset[]): number {
    const currentValue = this.calculatePortfolioValue(assets);
    const totalInvested = this.calculateTotalInvested(assets);
    return currentValue - totalInvested;
  }

  /**
   * Calculate return percentage
   * @param assets - Investment assets
   * @returns Return percentage (0-100)
   */
  static calculateReturnPercentage(assets: InvestmentAsset[]): number {
    const totalInvested = this.calculateTotalInvested(assets);
    if (totalInvested === 0) return 0;

    const totalReturn = this.calculateTotalReturn(assets);
    return (totalReturn / totalInvested) * 100;
  }

  /**
   * Get asset allocation (% of portfolio)
   * @param assets - Investment assets
   * @returns Allocation by asset
   */
  static getAssetAllocation(assets: InvestmentAsset[]): AssetAllocation[] {
    const portfolioValue = this.calculatePortfolioValue(assets);

    if (portfolioValue === 0) return [];

    return assets
      .filter(a => !a.deletedAt)
      .map(asset => ({
        ticker: asset.ticker,
        name: asset.name,
        percentage: (asset.quantity * asset.currentPrice / portfolioValue) * 100,
        targetPercentage: asset.allocation_target || 0,
        variance: (asset.quantity * asset.currentPrice / portfolioValue) * 100 - (asset.allocation_target || 0)
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * Get portfolio metrics summary
   * @param assets - Investment assets
   * @returns Portfolio metrics
   */
  static getPortfolioMetrics(assets: InvestmentAsset[]): PortfolioMetrics {
    const totalValue = this.calculatePortfolioValue(assets);
    const totalInvested = this.calculateTotalInvested(assets);
    const totalReturn = this.calculateTotalReturn(assets);
    const returnPercentage = this.calculateReturnPercentage(assets);

    // Calculate diversification (0-100, higher = more diversified)
    const allocation = this.getAssetAllocation(assets);
    const typeCount = new Set(assets.map(a => a.type)).size;
    const diversification = Math.min((typeCount / 6) * 100, 100); // 6 types max

    return {
      totalValue,
      totalInvested,
      totalReturn,
      ytdReturn: 0, // Will be calculated from historical data
      diversification: Math.round(diversification),
      riskProfile: this.calculateRiskProfile(assets)
    };
  }

  /**
   * Calculate portfolio risk profile
   * @param assets - Investment assets
   * @returns Risk profile
   */
  static calculateRiskProfile(assets: InvestmentAsset[]): 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' {
    const allocation = this.getAssetAllocation(assets);

    // Count risky assets (CRYPTO, STOCK > 30%)
    const riskyPercentage = allocation
      .filter(a => a.percentage > 30 || ['CRYPTO', 'STOCK'].includes(a.type))
      .reduce((sum, a) => sum + a.percentage, 0);

    if (riskyPercentage < 30) return 'CONSERVATIVE';
    if (riskyPercentage > 70) return 'AGGRESSIVE';
    return 'MODERATE';
  }

  /**
   * Calculate rebalancing recommendations
   * @param assets - Investment assets
   * @returns Rebalancing suggestions
   */
  static calculateRebalancing(assets: InvestmentAsset[]): RebalancingRecommendation[] {
    const allocation = this.getAssetAllocation(assets);
    const portfolioValue = this.calculatePortfolioValue(assets);

    return allocation
      .filter(a => a.targetPercentage > 0)
      .filter(a => Math.abs(a.variance) > 5) // Only if variance > 5%
      .map(a => {
        const targetValue = (a.targetPercentage / 100) * portfolioValue;
        const currentValue = (a.percentage / 100) * portfolioValue;
        const difference = targetValue - currentValue;

        return {
          ticker: a.ticker,
          name: a.name,
          action: difference > 0 ? 'BUY' : 'SELL',
          amount: Math.abs(difference),
          percentageChange: a.variance
        };
      });
  }
}
```

---

### Service Registration Pattern

**File:** `src/services/index.ts`

```typescript
// Re-export all services for centralized import
export { BudgetService } from './budgetService';
export { InvoiceService } from './invoiceService';
export { InvestmentPortfolioService } from './investmentPortfolioService';

// Error recovery utilities (already exist)
export { withErrorRecovery, errorRecovery } from './errorRecovery';
export { retryWithBackoff } from './retryService';
```

**Usage in contexts:**
```typescript
import { BudgetService, InvoiceService, withErrorRecovery } from '../services';
```

---

## INTEGRATION POINTS

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      COMPONENTS                              │
│  (Dashboard, Budget, Invoices, Investments, Reports)       │
└────────────┬─────────────────────────────┬──────────────────┘
             │                             │
    ┌────────▼──────────┐        ┌────────▼──────────┐
    │   CONTEXTS        │        │   SERVICES        │
    ├──────────────────┤        ├──────────────────┤
    │ BudgetContext    │        │ BudgetService    │
    │ InvoiceContext   │        │ InvoiceService   │
    │ InvestmentCtx    │   <─ ─>│ PortfolioService │
    │ SidebarContext   │        │ errorRecovery    │
    │ UIContext        │        │ retryService     │
    └────────┬─────────┘        └────────┬─────────┘
             │                           │
             └───────────┬───────────────┘
                         │
                 ┌───────▼────────┐
                 │   SUPABASE     │
                 ├────────────────┤
                 │ budget_periods │
                 │ budget_items   │
                 │ card_invoices  │
                 │ card_items     │
                 │ investments    │
                 └────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   localStorage                               │
│ spfp_budget_${userId}, spfp_invoices_${userId}, etc.       │
└─────────────────────────────────────────────────────────────┘
```

### Sequence Diagram: Adding Budget Item (STY-053)

```
User              Component        Context          Service         Supabase       localStorage
  │                   │              │               │                 │                │
  ├─ Click "Add" ────>│               │               │                 │                │
  │                   ├─ Submit Form ─────────>│      │                 │                │
  │                   │               │ Create│      │                 │                │
  │                   │               │ pending│      │                 │                │
  │                   │               │ state │      │                 │                │
  │                   │               │ (optimistic)──────────────────>│                │
  │                   │               │       │ Create Item │          │                │
  │                   │               │       ├─────────────────────>│ INSERT          │
  │                   │               │       │       │     │ {RLS}    │                │
  │                   │               │       │       │<─────────── {data}            │
  │                   │               │ Success│      │                 │                │
  │                   │ Show success  │<──────┤       │                 │  Save to local │
  │                   │ message       │       │       │                 │ storage ──────>│
  │                   │               │       │       │                 │                │
  └─ See UI updated   │               │       │       │                 │                │

Error Scenario:
                 │                   │              │               │                │
                 │                   ├─ Submit Form ─────>│ withErrorRecovery()│       │
                 │                   │           │ INSERT │                │
                 │                   │           │────────────────────────>│         │
                 │                   │           │       │     │ Network Error       │
                 │                   │           │       │<──────────── Error        │
                 │                   │           │ Retry Logic (exponential backoff)│
                 │                   │           │ Retry 1, 2, 3...               │
                 │                   │           │ All failed, rollback state      │
                 │                   │ Error     │                │                │
                 │                   │ message   │<────────────────┤               │
                 │                   │ (PT-BR)   │                │                │
                 ├─ See error toast ──           │                │                │
```

### Transaction Sync with Card Invoices (STY-062)

**Future integration point (not FASE 1):**

```typescript
// When user adds transaction with category matching invoice item
// Auto-link to invoice item for automatic invoice payment tracking

interface TransactionInvoiceLink {
  transaction_id: string;
  invoice_item_id: string;
  linked_at: string;
  user_id: string;
}
```

---

## DATA FLOW DIAGRAMS

### 1. Budget Period Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                   BUDGET PERIOD LIFECYCLE                    │
└─────────────────────────────────────────────────────────────┘

Timeline:
─────────────────────────────────────────────────────

Month 1:
┌──── ACTIVE ────┐
│ 2026-02-01    │ Create Period
│ Items: 10     │ Budget: R$ 5000
│ Spent: R$ 3200│ (60% utilized)
└───────────────┘
    ↓ Month ends

Month 2:
┌──── ACTIVE ────┐         ┌──── CLOSED ────┐
│ 2026-03-01    │         │ 2026-02-01     │
│ Items: 10     │ Close   │ Items: 10      │
│ Spent: 0      │────────>│ Spent: R$ 4000 │ Archive
└───────────────┘         │ Over: R$ 1000  │────────>
                          └────────────────┘

State Machine:
PENDING ──create──> ACTIVE ──close──> CLOSED ──archive──> ARCHIVED
```

### 2. Invoice Payment Tracking

```
┌─────────────────────────────────────────────────────────────┐
│               INVOICE PAYMENT TRACKING                       │
└─────────────────────────────────────────────────────────────┘

Invoice Created (invoice_date: 2026-02-01):
┌─────────────────────────────┐
│ Status: OPEN                │
│ Due: 2026-02-15             │
│ Total: R$ 2500              │
│ Paid: R$ 0                  │
│ Min Payment: R$ 250         │
└─────────────────────────────┘
    ↓ User pays R$ 800
┌─────────────────────────────┐
│ Status: PARTIAL             │
│ Total: R$ 2500              │
│ Paid: R$ 800                │
│ Remaining: R$ 1700          │
└─────────────────────────────┘
    ↓ User pays R$ 1700
┌─────────────────────────────┐
│ Status: PAID                │
│ Total: R$ 2500              │
│ Paid: R$ 2500               │
│ Remaining: R$ 0             │
│ Payment Date: 2026-02-14    │
└─────────────────────────────┘
    ↓ After 30 days
┌─────────────────────────────┐
│ Status: CLOSED              │
│ Archived for historical ref │
└─────────────────────────────┘

Future Installments Cascade:
┌──────────────────┐
│ Purchase 1/12    │ Card Invoice #1
│ Amount: R$ 200   │ (Due 2026-02-15)
└──────────────────┘
        ↓
┌──────────────────┐
│ Purchase 2/12    │ Card Invoice #2
│ Amount: R$ 200   │ (Due 2026-03-15)
└──────────────────┘
        ↓
  ... (10 more) ...
        ↓
┌──────────────────┐
│ Purchase 12/12   │ Card Invoice #12
│ Amount: R$ 200   │ (Due 2026-12-15)
└──────────────────┘
```

### 3. Investment Portfolio Update

```
┌─────────────────────────────────────────────────────────────┐
│              INVESTMENT PORTFOLIO UPDATE                     │
└─────────────────────────────────────────────────────────────┘

Daily Price Update Flow:

1. API Call (Brapi or similar):
   STOCK ABEV3: R$ 15.50 (updated from R$ 15.30)

2. Calculation:
   Asset: ABEV3
   - Quantity: 100 shares
   - Old Value: R$ 1530 (100 × 15.30)
   - New Value: R$ 1550 (100 × 15.50)
   - Gain/Loss: +R$ 20
   - YTD Return: +R$ 45

3. Portfolio Impact:
   Total Portfolio Value: R$ 50,000
   Total Value After Update: R$ 50,020 (+0.04%)

4. Allocation Change:
   Before: ABEV3 = 3.06%
   After:  ABEV3 = 3.10%
   Variance from target (3.00%): +0.10%

Rebalancing Trigger:
IF variance > 5% THEN suggest rebalancing
  Buy: Underallocated assets
  Sell: Overallocated assets
```

---

## PERFORMANCE & SCALABILITY

### 1. Data Volume Estimates (FASE 1)

**Assumptions:** 1,000 active users, 1-year operational

| Entity | Records/User | Total | Avg Size | Total Size |
|--------|--------------|-------|----------|-----------|
| Budget Periods | 12 | 12,000 | 200 bytes | 2.4 MB |
| Budget Items | 12 × 10 | 120,000 | 150 bytes | 18 MB |
| Card Invoices | 12 | 12,000 | 300 bytes | 3.6 MB |
| Card Invoice Items | 12 × 50 | 600,000 | 200 bytes | 120 MB |
| Investments | 20 | 20,000 | 250 bytes | 5 MB |
| **Total** | - | - | - | **149.6 MB** |

**Database Load Estimates:**
- Queries per user per session: ~50 (fetch budgets, invoices, holdings)
- Writes per user per session: ~5 (new items, payments, updates)
- Monthly queries: 50,000 users × 50 queries × 30 days = 75M queries
- Supabase tier: **Pro** (sufficient for FASE 1)

### 2. localStorage Caching Strategy

**Cache Allocation:**
- Budget: ~100 KB/user
- Invoices: ~200 KB/user
- Investments: ~50 KB/user
- Total per user: ~350 KB (within browser limits)

**Sync Policy:**
```typescript
// Cache-first strategy
1. On app load:
   - Load from localStorage (< 50ms)
   - Fetch fresh data from Supabase (parallel)
   - Merge data, update localStorage

2. On user action:
   - Optimistic update to state + localStorage
   - Send to Supabase
   - If success: keep local update
   - If failure: rollback (error recovery)

3. Periodic refresh:
   - Every 15 minutes (background)
   - Or on user focus (tab becomes active)

Cache invalidation:
- On new payment → invalidate invoices cache
- On new transaction → invalidate budget cache
- On new holding → invalidate investment cache
```

### 3. Lazy Loading Optimization

**Route-based lazy loading (FASE 3):**

```typescript
// Code splitting by route
const Dashboard = lazy(() => import('./components/Dashboard'));
const Budget = lazy(() => import('./components/Budget'));
const Invoices = lazy(() => import('./components/Invoices'));
const Investments = lazy(() => import('./components/Investments'));

// Context lazy loading
const BudgetProvider = lazy(() => import('./context/BudgetContext'));
const InvoiceProvider = lazy(() => import('./context/InvoiceContext'));

// Load only when route matches
<Route path="/budget" element={<Suspense><Budget /></Suspense>} />
```

**Bundle Size Impact (Estimated):**
- Current bundle: 450 KB (gzipped)
- New contexts + services: +45-65 KB
- After lazy loading: 520 KB (main) + 100 KB (lazy chunks)
- **Impact:** +70-120 KB, but lazy loaded per route

### 4. Query Optimization

**Indexes in Supabase (for performance):**

```sql
-- Budget queries
CREATE INDEX idx_budget_periods_user_dates
ON budget_periods(user_id, period_start DESC, period_end DESC);

-- Invoice queries
CREATE INDEX idx_card_invoices_user_due
ON card_invoices(user_id, due_date DESC, status);

CREATE INDEX idx_card_invoice_items_invoice
ON card_invoice_items(invoice_id, is_installment);

-- Investment queries
CREATE INDEX idx_investments_user_ticker
ON investments(user_id, ticker);
```

**Query Patterns:**
```typescript
// Efficient: Use indexes
const invoices = await supabase
  .from('card_invoices')
  .select('*')
  .eq('user_id', userId)
  .gte('due_date', today)
  .lte('due_date', in30Days);
  // Uses: idx_card_invoices_user_due

// Inefficient: Full table scan (avoid)
const invoices = await supabase
  .from('card_invoices')
  .select('*')
  .filter('paid_amount', 'gt', 0); // No index on paid_amount
```

### 5. Error Recovery Impact

**Performance considerations:**

```typescript
// Retry logic adds latency (acceptable for critical ops)
// Typical flow: 1st attempt (2s), 2nd attempt (4s), 3rd attempt (8s) = 14s max

withErrorRecovery(
  () => supabase.from('card_invoices').insert([...]),
  'Add invoice',
  {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 8000,
    backoffMultiplier: 2
  }
);

// For non-critical operations: maxRetries: 1 (fail fast)
```

**Recommendation:** Use circuit breaker for cascading failures
```typescript
// Future enhancement: Implement circuit breaker
// Prevent retry storms if service is down
```

---

## IMPLEMENTATION TIMELINE

### Sprint Planning (FASE 1: 2 weeks | 65-80 hours)

**Week 1: Foundation (40h)**

| Day | Story | Hours | Deliverable |
|-----|-------|-------|-------------|
| Mon | STY-051 | 6 | SidebarContext + useSidebar hook |
| Mon | STY-052 | 8 | Sidebar UI with collapsible sections |
| Tue | STY-053 | 7 | Budget section display + component |
| Wed | STY-054 | 5 | Accounts section display |
| Wed | STY-055 | 6 | Transactions & Installments section |
| Thu | **Subtotal** | **32** | - |
| Thu | Testing & QA | 8 | All components tested, no bugs |

**Week 2: Invoices & Investments (40h)**

| Day | Story | Hours | Deliverable |
|-----|-------|-------|-------------|
| Mon | STY-058 | 8 | Card Invoice Service + types |
| Tue | STY-059 | 6 | InvoiceContext implementation |
| Wed | STY-060 | 7 | Current & future installments display |
| Thu | STY-061 | 8 | Realistic credit card visual component |
| Thu | STY-063 | 6 | Investment portfolio data model |
| Fri | STY-064 | 5 | Investment portfolio display |
| Fri | **Subtotal** | **40** | - |
| Fri | Testing & Deployment | 8 | E2E tests, staging deployment |

**Blockers to remove (Priority):**
1. STY-051 (Sidebar Context) - Blocks all sidebar work
2. STY-058 (Invoice Service) - Blocks invoice features
3. STY-063 (Investment Model) - Blocks investment display

---

## DECISION LOG

### AD-001: Separate Contexts vs Monolithic FinanceContext

**Proposed:** Split FinanceContext into BudgetContext, InvoiceContext, etc.

**Alternatives:**
1. Extend monolithic FinanceContext (current approach)
2. Use Redux/MobX library (external dependency)
3. Combine contexts with domain-specific custom hooks

**Decision:** Option 1 - Separate Contexts

**Rationale:**
- Aligns with existing multi-context pattern (InvestmentsContext already separate)
- No external dependencies, uses React Context (native)
- Easier to test, scale, and maintain
- Enables parallel development
- Future-proof for microservices-like architecture

**Trade-offs:**
- More contexts to manage in App.tsx (mitigated by Provider composition)
- Slightly larger bundle (45-65 KB, offset by lazy loading)
- Context drilling through 5+ providers (minor, each context independent)

**Decision Date:** 2026-02-05
**Decided By:** Aria - Arquiteta
**Status:** APPROVED ✅

---

### AD-002: Supabase RLS Scope (User Isolation vs Admin Impersonation)

**Issue:** RLS policies must support admin impersonation (existing feature)

**Proposed RLS:** Standard user isolation `auth.uid() = user_id`

**Problem:** Admins impersonating users should see user's data, but auth.uid() will be admin's ID

**Solution:** Add impersonation field to schema

```sql
-- Add to budget_periods, card_invoices, etc:
impersonated_by UUID REFERENCES auth.users(id),

-- RLS Policy:
CREATE POLICY "budget_items_rls"
ON budget_items
FOR SELECT
USING (
  auth.uid() = user_id -- Normal user sees own
  OR
  (admin_emails CONTAINS auth.email() AND impersonated_by IS NULL) -- Admin can see all
);
```

**Decision:** Implement impersonation support in RLS from start

**Status:** APPROVED ✅

---

### AD-003: Invoice Status Lifecycle

**Proposed States:**
1. OPEN (invoice created, unpaid)
2. PARTIAL (some amount paid)
3. PAID (fully paid but not closed)
4. OVERDUE (due date passed, still unpaid)
5. CLOSED (archived, no longer editable)

**Alternative:** Only 3 states (OPEN, PAID, CLOSED)

**Decision:** Use 5 states

**Rationale:**
- PARTIAL enables tracking partial payments (common in Brazil)
- OVERDUE enables alerts and late fees
- CLOSED enables archival

**Status:** APPROVED ✅

---

### AD-004: Budget Period Denormalization (total_spent)

**Issue:** Should `total_spent` be denormalized or calculated on-the-fly?

**Option A:** Denormalize (store total_spent column)
- Pros: Fast queries (no sum() needed)
- Cons: Must update on every item change, risk of inconsistency

**Option B:** Calculate on-the-fly
- Pros: Always consistent
- Cons: Slower queries (need sum() + join)

**Decision:** Denormalize, with triggers

```sql
-- Trigger: Automatically update total_spent
CREATE TRIGGER update_budget_total_spent
AFTER INSERT, UPDATE ON budget_items
FOR EACH ROW
EXECUTE FUNCTION update_budget_period_total();
```

**Rationale:**
- Dashboard queries run frequently (< 500ms SLA)
- Triggers ensure consistency
- Tradeoff: slightly more complex DB logic

**Status:** APPROVED ✅

---

## APPENDIX

### A. TypeScript Type Modules

**File:** `src/types/budget.ts`
```typescript
export interface BudgetPeriod { ... }
export interface BudgetItem { ... }
export type BudgetStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type ItemStatus = 'IN_PROGRESS' | 'EXCEEDED' | 'COMPLETED';
```

**File:** `src/types/invoice.ts`
```typescript
export interface CardInvoice { ... }
export interface CardInvoiceItem { ... }
export type InvoiceStatus = 'OPEN' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CLOSED';
```

**File:** `src/types/sidebar.ts`
```typescript
export type SidebarSection = 'BUDGET' | 'ACCOUNTS' | 'TRANSACTIONS' | 'INSTALLMENTS';
export interface SidebarState { ... }
```

### B. Error Recovery Integration Points

All new services and contexts should follow this pattern:

```typescript
import { withErrorRecovery } from '../services/errorRecovery';

// In any async operation:
try {
  const result = await withErrorRecovery(
    () => asyncOperation(),
    'Human-readable action name',
    { maxRetries: 3, userId, metadata: { ... } }
  );
} catch (error: any) {
  // Error already handled and logged
  console.error(error.userMessage); // Friendly Portuguese message
}
```

### C. Testing Strategy

**Unit Tests:** Service layer (100% coverage)
```typescript
// src/services/__tests__/budgetService.test.ts
describe('BudgetService', () => {
  describe('getSpendingPercentage', () => {
    it('should return 0 for 0 budgeted', () => {
      expect(BudgetService.getSpendingPercentage(0, 50)).toBe(0);
    });
    it('should return 50 for half spent', () => {
      expect(BudgetService.getSpendingPercentage(100, 50)).toBe(50);
    });
    it('should return 150 for overbudget', () => {
      expect(BudgetService.getSpendingPercentage(100, 150)).toBe(150);
    });
  });
});
```

**Integration Tests:** Context + Service
```typescript
// src/context/__tests__/BudgetContext.test.tsx
describe('BudgetContext', () => {
  it('should sync budgets on mount', async () => {
    // Test context syncing from Supabase
  });
  it('should handle error recovery on sync failure', async () => {
    // Test retry logic
  });
});
```

**E2E Tests:** Full user flows (Playwright/Cypress)
```typescript
// e2e/budget.spec.ts
describe('Budget workflow', () => {
  it('should create and display budget item', async () => {
    // Test full flow from UI
  });
});
```

---

## CONCLUSION

FASE 1 architecture is designed for:

1. **Scalability:** Separate contexts enable independent feature development and scaling
2. **Reliability:** Error recovery integrated at all levels with retry logic and rollback
3. **Performance:** Caching strategy, indexes, and lazy loading keep response times < 500ms
4. **Maintainability:** Type-safe, well-documented, follows existing patterns
5. **Security:** RLS policies enforce user isolation, support admin impersonation

**Next Steps:**

1. Create SQL migration script (`docs/migrations/001-fase1-schema.sql`)
2. Create type modules (`src/types/{budget,invoice,sidebar}.ts`)
3. Create contexts (`src/context/{Budget,Invoice,Sidebar}Context.tsx`)
4. Create services (`src/services/{budget,invoice,investmentPortfolio}Service.ts`)
5. Update `src/App.tsx` with new providers
6. Begin STY-051 implementation (SidebarContext)

**Ready for Development:** ✅ 2026-02-05

---

**Document Version:** 1.0
**Last Updated:** 2026-02-05
**Author:** Aria - Arquiteta
**Status:** APPROVED FOR IMPLEMENTATION
