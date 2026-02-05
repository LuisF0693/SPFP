-- FASE 1 Schema Migrations
-- Created: 2026-02-05
-- Purpose: Add budget, invoice, and investment tracking tables for SPFP
-- Version: 1.0

BEGIN;

-- ============================================================================
-- 1. BUDGET PERIODS TABLE
-- ============================================================================

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
ON budget_periods(user_id, period_start DESC, period_end DESC);

-- Enable RLS
ALTER TABLE budget_periods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_periods
DROP POLICY IF EXISTS "budget_periods_select_own" ON budget_periods;
DROP POLICY IF EXISTS "budget_periods_insert_own" ON budget_periods;
DROP POLICY IF EXISTS "budget_periods_update_own" ON budget_periods;
DROP POLICY IF EXISTS "budget_periods_delete_own" ON budget_periods;

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

-- ============================================================================
-- 2. BUDGET ITEMS TABLE
-- ============================================================================

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

-- Enable RLS
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_items
DROP POLICY IF EXISTS "budget_items_select_own" ON budget_items;
DROP POLICY IF EXISTS "budget_items_insert_own" ON budget_items;
DROP POLICY IF EXISTS "budget_items_update_own" ON budget_items;
DROP POLICY IF EXISTS "budget_items_delete_own" ON budget_items;

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

-- ============================================================================
-- 3. CARD INVOICES TABLE
-- ============================================================================

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
ON card_invoices(user_id, due_date DESC, status);

CREATE INDEX IF NOT EXISTS idx_card_invoices_status
ON card_invoices(user_id, status);

-- Enable RLS
ALTER TABLE card_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for card_invoices
DROP POLICY IF EXISTS "card_invoices_select_own" ON card_invoices;
DROP POLICY IF EXISTS "card_invoices_insert_own" ON card_invoices;
DROP POLICY IF EXISTS "card_invoices_update_own" ON card_invoices;
DROP POLICY IF EXISTS "card_invoices_delete_own" ON card_invoices;

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

-- ============================================================================
-- 4. CARD INVOICE ITEMS TABLE
-- ============================================================================

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

-- Enable RLS
ALTER TABLE card_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for card_invoice_items
DROP POLICY IF EXISTS "card_invoice_items_select_own" ON card_invoice_items;
DROP POLICY IF EXISTS "card_invoice_items_insert_own" ON card_invoice_items;
DROP POLICY IF EXISTS "card_invoice_items_update_own" ON card_invoice_items;
DROP POLICY IF EXISTS "card_invoice_items_delete_own" ON card_invoice_items;

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

-- ============================================================================
-- 5. INVESTMENTS TABLE ALTERATIONS
-- ============================================================================

-- Add new columns for portfolio tracking (FASE 1: STY-063)
ALTER TABLE IF EXISTS public.investments
ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS ytd_return DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS allocation_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS allocation_target DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS rebalance_frequency VARCHAR(50) DEFAULT 'QUARTERLY';

-- ============================================================================
-- 6. TRIGGER FOR BUDGET TOTAL_SPENT DENORMALIZATION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_budget_period_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE budget_periods
  SET total_spent = (
    SELECT COALESCE(SUM(spent_amount), 0)
    FROM budget_items
    WHERE budget_period_id = NEW.budget_period_id
      AND deleted_at IS NULL
  ),
  updated_at = now()
  WHERE id = NEW.budget_period_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_budget_items_insert ON budget_items;
CREATE TRIGGER trigger_budget_items_insert
AFTER INSERT ON budget_items
FOR EACH ROW
EXECUTE FUNCTION update_budget_period_total();

DROP TRIGGER IF EXISTS trigger_budget_items_update ON budget_items;
CREATE TRIGGER trigger_budget_items_update
AFTER UPDATE ON budget_items
FOR EACH ROW
EXECUTE FUNCTION update_budget_period_total();

-- ============================================================================
-- 7. FUNCTION FOR INVOICE STATUS AUTO-UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.paid_amount >= NEW.total_amount THEN
    NEW.status := 'PAID';
  ELSIF NEW.paid_amount > 0 THEN
    NEW.status := 'PARTIAL';
  END IF;

  IF NEW.status IN ('OPEN', 'PARTIAL') AND NEW.due_date < CURRENT_DATE THEN
    NEW.status := 'OVERDUE';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_invoice_status_update ON card_invoices;
CREATE TRIGGER trigger_invoice_status_update
BEFORE UPDATE ON card_invoices
FOR EACH ROW
EXECUTE FUNCTION update_invoice_status();

-- ============================================================================
-- 8. DATA VALIDATION CONSTRAINTS
-- ============================================================================

ALTER TABLE budget_periods
ADD CONSTRAINT chk_budget_dates CHECK (period_start <= period_end);

ALTER TABLE card_invoices
ADD CONSTRAINT chk_invoice_amounts CHECK (total_amount >= 0 AND paid_amount >= 0 AND paid_amount <= total_amount);

ALTER TABLE card_invoice_items
ADD CONSTRAINT chk_item_amount CHECK (amount > 0);

COMMIT;
