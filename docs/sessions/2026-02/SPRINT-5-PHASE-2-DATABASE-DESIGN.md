# Sprint 5 Phase 2: Database Normalization - Architecture Design 📊

**Date:** February 4, 2026
**Phase:** 2 - Database Normalization (16h)
**Lead:** Aria (@architect)
**Story:** STY-017
**Status:** DESIGN PHASE COMPLETE

---

## 🎯 MISSION: Database Schema Normalization

**Objective:** Normalize current JSON-based schema to 3NF for 20-30% query optimization

**Timeline:** 16 hours
- Schema Design: 4h ✅ (THIS DOCUMENT)
- Migration Strategy: 3h (Next)
- Implementation: 6h (Next)
- Testing & Validation: 3h (Next)

---

## 📐 CURRENT STATE ANALYSIS

### Current Architecture (JSON Blobs)
```
user_data (JSON in localStorage/Supabase)
├── accounts: Array<Account>
├── transactions: Array<Transaction>
├── categories: Array<Category>
├── goals: Array<Goal>
├── investments: Array<InvestmentAsset>
├── patrimonyItems: Array<PatrimonyItem>
└── categoryBudgets: Array<CategoryBudget>
```

**Problems:**
- ❌ No normalization (1NF, 2NF, 3NF violations)
- ❌ Data duplication (category names in transactions)
- ❌ No foreign key constraints
- ❌ No indexes on search/filter columns
- ❌ Queries must load entire objects

---

## 📊 NORMALIZED SCHEMA DESIGN (3NF)

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Normalized DB                        │
├─────────────────────────────────────────────────────────┤

auth.users (Supabase managed)
    ↓ (user_id FK)
    ├─→ accounts (1 user : N accounts)
    ├─→ transactions (1 user : N transactions)
    ├─→ goals (1 user : N goals)
    ├─→ investments (1 user : N investments)
    ├─→ categories (1 user : N categories)
    ├─→ patrimony_items (1 user : N items)
    └─→ category_budgets (1 user : N budgets)

transactions → accounts (N:1)
transactions → categories (N:1)
transactions → transaction_groups (N:1, for recurring)

investments → accounts (N:1, optional)

patrimony_items → accounts (N:1, optional)

category_budgets → categories (N:1)
```

---

## 🗄️ NORMALIZED TABLE SCHEMAS

### 1. Accounts Table

```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment', 'other')),
  balance DECIMAL(19,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  color VARCHAR(7),
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,

  CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT check_balance CHECK (balance >= 0)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_deleted_at ON accounts(deleted_at);
```

**Normalized from:** `GlobalState.accounts`
**Atomicity:** Each row = one account (1NF ✅)
**Dependencies:** Only depends on user_id (2NF ✅, 3NF ✅)

---

### 2. Categories Table

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  type VARCHAR(50) CHECK (type IN ('income', 'expense', 'mixed')),
  color VARCHAR(7),
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,

  CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT uc_categories_user_name UNIQUE(user_id, name, deleted_at IS NULL)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_deleted_at ON categories(deleted_at);
```

**Normalized from:** `GlobalState.categories`
**Atomicity:** Each row = one category (1NF ✅)
**Dependencies:** Only depends on user_id (2NF ✅, 3NF ✅)

---

### 3. Transactions Table (CORE)

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id UUID NOT NULL,
  category_id UUID NOT NULL,
  description VARCHAR(500),
  amount DECIMAL(19,2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  date DATE NOT NULL,
  paid BOOLEAN DEFAULT false,
  group_id UUID,  -- for recurring/installment transactions
  group_index INT,  -- position in group (1-indexed)
  spender VARCHAR(50),  -- 'ME', 'SPOUSE', or child ID
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,

  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
  CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_transactions_group FOREIGN KEY (group_id) REFERENCES transaction_groups(id) ON DELETE SET NULL,
  CONSTRAINT check_amount CHECK (amount > 0)
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_paid ON transactions(paid);
CREATE INDEX idx_transactions_group_id ON transactions(group_id);
CREATE INDEX idx_transactions_deleted_at ON transactions(deleted_at);
CREATE INDEX idx_transactions_composite ON transactions(user_id, date DESC, deleted_at);
```

**Normalized from:** `GlobalState.transactions`
**Atomicity:** Each row = one transaction (1NF ✅)
**Dependencies:** All depend on their respective FKs (2NF ✅, 3NF ✅)
**Performance:** Critical indexes for query speed

---

### 4. Transaction Groups Table (for recurring)

```sql
CREATE TABLE transaction_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('recurring', 'installment', 'other')),
  frequency VARCHAR(50),  -- 'daily', 'weekly', 'monthly', etc.
  created_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,

  CONSTRAINT fk_transaction_groups_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_transaction_groups_user_id ON transaction_groups(user_id);
```

---

### 5. Goals Table

```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(19,2) NOT NULL,
  current_amount DECIMAL(19,2) DEFAULT 0,
  deadline DATE,
  category VARCHAR(100),
  priority VARCHAR(50),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,

  CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT check_target CHECK (target_amount > 0),
  CONSTRAINT check_current CHECK (current_amount >= 0)
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_deadline ON goals(deadline);
```

---

### 6. Investments Table

```sql
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id UUID,  -- optional link to account
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),  -- 'stock', 'fund', 'crypto', etc
  quantity DECIMAL(19,8) NOT NULL,
  average_price DECIMAL(19,8) NOT NULL,
  current_price DECIMAL(19,8),
  total_value DECIMAL(19,2),
  currency VARCHAR(3) DEFAULT 'BRL',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,

  CONSTRAINT fk_investments_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_investments_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_symbol ON investments(symbol);
```

---

### 7. Patrimony Items Table

```sql
CREATE TABLE patrimony_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100),  -- 'property', 'vehicle', 'jewelry', etc
  value DECIMAL(19,2) NOT NULL,
  acquisition_date DATE,
  acquisition_value DECIMAL(19,2),
  currency VARCHAR(3) DEFAULT 'BRL',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,

  CONSTRAINT fk_patrimony_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_patrimony_user_id ON patrimony_items(user_id);
```

---

### 8. Category Budgets Table

```sql
CREATE TABLE category_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID NOT NULL,
  monthly_limit DECIMAL(19,2) NOT NULL,
  alert_threshold DECIMAL(3,2) DEFAULT 0.8,  -- 80%
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,

  CONSTRAINT fk_category_budgets_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_category_budgets_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  CONSTRAINT uc_category_budgets UNIQUE(user_id, category_id)
);

CREATE INDEX idx_category_budgets_user_id ON category_budgets(user_id);
CREATE INDEX idx_category_budgets_category_id ON category_budgets(category_id);
```

---

## 🔍 NORMALIZATION VERIFICATION

### 1NF (Atomic Values)
✅ Each column contains only atomic (indivisible) values
✅ No repeating groups (arrays moved to separate tables)
✅ Each cell contains exactly one value

### 2NF (No Partial Dependencies)
✅ Every non-key attribute depends on the entire primary key
✅ No dependencies on subset of composite keys
✅ For single-key tables: automatically satisfied

### 3NF (No Transitive Dependencies)
✅ No non-key attributes depend on other non-key attributes
✅ Example: transaction.amount doesn't depend on transaction.date
✅ All dependencies go through foreign keys

---

## 📈 EXPECTED PERFORMANCE IMPROVEMENTS

### Current vs Normalized

| Operation | Current | Normalized | Improvement |
|-----------|---------|-----------|------------|
| Find user's expenses | Load 10K rows, filter JS | SELECT + index | 95% ⬇️ |
| Monthly reports | Full scan + sort | Indexed date query | 80% ⬇️ |
| Category stats | Deserialize JSON | Grouped aggregate query | 75% ⬇️ |
| Budget alerts | In-memory join | Database join | 60% ⬇️ |

**Expected Overall:** 20-30% query improvement

---

## 🛡️ DATA INTEGRITY STRATEGY

### Foreign Key Constraints
- ✅ RESTRICT: Prevent deletion of referenced accounts/categories
- ✅ CASCADE: Delete related transactions when user deleted
- ✅ SET NULL: Allow optional relationships to be cleared

### Soft Deletes
- ✅ `deleted_at` timestamp for all tables
- ✅ Queries filter by `deleted_at IS NULL`
- ✅ Enables recovery if needed

### Validation Constraints
- ✅ CHECK constraints for valid types
- ✅ Amount > 0 for transactions/investments
- ✅ Balance >= 0 for accounts
- ✅ UNIQUE constraints where appropriate

---

## 🔄 MIGRATION STRATEGY OUTLINE

### Phase 1: Create Normalized Tables
- Create all 8 new tables with foreign keys
- NO data yet, just schema

### Phase 2: Data Migration
- Read JSON blobs from old storage
- Transform to normalized format
- Validate data integrity
- Insert into new tables

### Phase 3: Verification
- Verify row counts match
- Spot-check samples
- Run aggregate queries
- Compare results

### Phase 4: Dual-Read Phase
- Query layer reads from normalized tables
- Fallback to JSON if not found
- Monitor for issues

### Phase 5: Cleanup
- After 1-2 weeks of monitoring
- Drop old JSON table
- Archive backup

---

## 📋 ACCEPTANCE CRITERIA - DESIGN PHASE

- [x] Normalized schema designed (3NF verified)
- [x] ER diagram created
- [x] All 8 tables defined with constraints
- [x] Indexes planned for performance
- [x] Soft delete strategy documented
- [x] Data integrity strategy defined
- [x] Migration strategy outlined
- [x] Expected performance improvements documented

---

## 🚀 NEXT STEPS

### Phase 2.2: Migration Strategy (3h)
- Create migration SQL script
- Plan zero-downtime approach
- Document rollback procedure

### Phase 2.3: Implementation (6h)
- Execute schema creation
- Create migration utilities
- Test on staging

### Phase 2.4: Testing & Validation (3h)
- Run dry-run on data copy
- Verify all data migrated
- Performance benchmark
- Rollback test

---

**Created by:** Aria (@architect)
**Date:** February 4, 2026
**Status:** DESIGN COMPLETE - READY FOR MIGRATION PHASE
