-- Migration: Credit Card Invoices Schema
-- Author: Nova - Data Engineer
-- Date: 2026-02-05
-- Purpose: Create normalized tables for credit card invoice tracking
-- Status: Ready for Supabase deployment

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- Main invoice table: One record per card per month
CREATE TABLE IF NOT EXISTS card_invoices (
  -- Primary & Foreign Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- Invoice Metadata
  invoice_number VARCHAR(50) NOT NULL,  -- Bank's invoice identifier (e.g., "202601", "001-2026")
  invoice_date DATE NOT NULL,           -- First day of invoice month (YYYY-MM-01)
  closing_date DATE NOT NULL,           -- When invoice closes (account.closingDay)
  due_date DATE NOT NULL,               -- Payment due date (account.dueDay)

  -- Amount Tracking
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  pending_amount DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount - COALESCE(paid_amount, 0)) STORED,

  -- Status & Classification
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',  -- OPEN | PAID | PARTIAL | OVERDUE
  source VARCHAR(20) DEFAULT 'manual',         -- manual | csv | api | auto_sync

  -- Installment Summary
  total_installments INT DEFAULT 1,            -- How many items in this invoice
  paid_installments INT DEFAULT 0,             -- How many are already paid

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,  -- Soft delete support (consistent with transactions table)

  -- Constraints
  CONSTRAINT valid_dates CHECK (closing_date < due_date),
  CONSTRAINT valid_amounts CHECK (total_amount >= 0 AND paid_amount >= 0 AND pending_amount >= 0),
  CONSTRAINT valid_status CHECK (status IN ('OPEN', 'PAID', 'PARTIAL', 'OVERDUE')),
  CONSTRAINT valid_source CHECK (source IN ('manual', 'csv', 'api', 'auto_sync')),
  CONSTRAINT unique_invoice_per_card_month UNIQUE (user_id, card_id, invoice_date) DEFERRABLE INITIALLY DEFERRED
);

-- Individual items (installments) within an invoice
CREATE TABLE IF NOT EXISTS card_invoice_items (
  -- Primary & Foreign Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES card_invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,  -- Optional link to transaction

  -- Installment Metadata
  installment_number INT NOT NULL,      -- 1, 2, 3... (position in installment series)
  installment_total INT NOT NULL,       -- Total installments (e.g., 3 for "1 of 3")
  original_transaction_date DATE,       -- When the purchase was originally made

  -- Item Details
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Status Tracking
  status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING | PAID | OVERDUE | CANCELLED
  due_date DATE NOT NULL,                -- When this specific installment is due
  paid_date DATE,                        -- When it was paid (NULL = unpaid)

  -- Denormalization (for faster queries across cards)
  card_id UUID NOT NULL,                 -- Copied from card_invoices for easy filtering

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_amounts CHECK (amount > 0),
  CONSTRAINT valid_installment_number CHECK (installment_number >= 1 AND installment_number <= installment_total),
  CONSTRAINT valid_status CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
  CONSTRAINT valid_dates CHECK (paid_date IS NULL OR paid_date >= due_date)
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

-- Indexes for card_invoices table
CREATE INDEX idx_card_invoices_user_id ON card_invoices(user_id);
CREATE INDEX idx_card_invoices_card_id ON card_invoices(card_id);
CREATE INDEX idx_card_invoices_user_card ON card_invoices(user_id, card_id);
CREATE INDEX idx_card_invoices_due_date ON card_invoices(due_date);
CREATE INDEX idx_card_invoices_status ON card_invoices(status);
CREATE INDEX idx_card_invoices_active ON card_invoices(user_id, card_id) WHERE deleted_at IS NULL;

-- Composite indexes for common query patterns
CREATE INDEX idx_card_invoices_user_card_date_desc ON card_invoices(user_id, card_id, invoice_date DESC);
CREATE INDEX idx_card_invoices_user_status_date_desc ON card_invoices(user_id, status, due_date DESC);
CREATE INDEX idx_card_invoices_date_range ON card_invoices(invoice_date DESC) WHERE deleted_at IS NULL;

-- Indexes for card_invoice_items table
CREATE INDEX idx_card_invoice_items_invoice ON card_invoice_items(invoice_id);
CREATE INDEX idx_card_invoice_items_user_id ON card_invoice_items(user_id);
CREATE INDEX idx_card_invoice_items_user_status ON card_invoice_items(user_id, status);
CREATE INDEX idx_card_invoice_items_card_due ON card_invoice_items(card_id, due_date);
CREATE INDEX idx_card_invoice_items_transaction ON card_invoice_items(transaction_id);
CREATE INDEX idx_card_invoice_items_category ON card_invoice_items(category_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_card_invoice_items_user_card_due ON card_invoice_items(user_id, card_id, due_date DESC);
CREATE INDEX idx_card_invoice_items_status_due ON card_invoice_items(status, due_date) WHERE status IN ('PENDING', 'OVERDUE');

-- ============================================================================
-- 3. ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE card_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own invoices
CREATE POLICY card_invoices_user_isolation ON card_invoices
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can only see items from their invoices
CREATE POLICY card_invoice_items_user_isolation ON card_invoice_items
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 4. CREATE TRIGGERS
-- ============================================================================

-- Trigger: Auto-update invoice status based on installment payment
CREATE OR REPLACE FUNCTION update_invoice_status_from_items()
RETURNS TRIGGER AS $$
DECLARE
  v_paid_items INT;
  v_total_items INT;
  v_total_amount DECIMAL(12, 2);
  v_paid_amount DECIMAL(12, 2);
BEGIN
  -- Calculate paid/total items
  SELECT COUNT(*), SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END)
  INTO v_total_items, v_paid_items
  FROM card_invoice_items
  WHERE invoice_id = NEW.invoice_id AND status != 'CANCELLED';

  -- Calculate amounts
  SELECT SUM(amount), SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END)
  INTO v_total_amount, v_paid_amount
  FROM card_invoice_items
  WHERE invoice_id = NEW.invoice_id AND status != 'CANCELLED';

  -- Update invoice
  UPDATE card_invoices
  SET
    total_installments = COALESCE(v_total_items, 0),
    paid_installments = COALESCE(v_paid_items, 0),
    total_amount = COALESCE(v_total_amount, 0),
    paid_amount = COALESCE(v_paid_amount, 0),
    status = CASE
      WHEN v_paid_items = v_total_items AND v_total_items > 0 THEN 'PAID'
      WHEN v_paid_items > 0 AND v_paid_items < v_total_items THEN 'PARTIAL'
      WHEN due_date < NOW()::DATE AND status = 'OPEN' THEN 'OVERDUE'
      ELSE 'OPEN'
    END,
    updated_at = NOW()
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Fire on insert/update/delete of items
CREATE TRIGGER trg_update_invoice_on_item_change
AFTER INSERT OR UPDATE OR DELETE ON card_invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_status_from_items();

-- Trigger: Auto-update item status when paid_date is set
CREATE OR REPLACE FUNCTION update_installment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If paid_date is set, mark as PAID
  IF NEW.paid_date IS NOT NULL THEN
    NEW.status = 'PAID';
  -- If due_date has passed and still PENDING, mark as OVERDUE
  ELSIF NEW.due_date < NOW()::DATE AND NEW.status = 'PENDING' THEN
    NEW.status = 'OVERDUE';
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Fire before insert/update of items
CREATE TRIGGER trg_update_installment_status
BEFORE INSERT OR UPDATE ON card_invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_installment_status();

-- ============================================================================
-- 5. CREATE VIEWS (Optional - for convenience)
-- ============================================================================

-- View: Future installments (pending or overdue, upcoming 90 days)
CREATE OR REPLACE VIEW v_future_installments AS
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
  cii.card_id,
  cii.user_id,
  ca.name AS card_name,
  ca.lastFourDigits AS card_last_four,
  ca.network AS card_network,
  ci.total_amount,
  ci.status AS invoice_status
FROM card_invoice_items cii
JOIN card_invoices ci ON cii.invoice_id = ci.id
JOIN accounts ca ON cii.card_id = ca.id
WHERE cii.status IN ('PENDING', 'OVERDUE')
  AND cii.due_date > CURRENT_DATE
  AND cii.due_date <= CURRENT_DATE + INTERVAL '90 days'
  AND ci.deleted_at IS NULL;

-- View: Monthly spending summary
CREATE OR REPLACE VIEW v_monthly_spending_summary AS
SELECT
  ci.user_id,
  ci.card_id,
  ca.name AS card_name,
  DATE_TRUNC('month', ci.invoice_date)::DATE AS month,
  COUNT(DISTINCT ci.id) AS num_invoices,
  SUM(ci.total_amount) AS total_spent,
  SUM(ci.paid_amount) AS total_paid,
  SUM(ci.pending_amount) AS total_pending,
  AVG(ci.total_amount) AS avg_invoice_amount,
  COUNT(DISTINCT cii.id) AS total_items
FROM card_invoices ci
LEFT JOIN card_invoice_items cii ON ci.id = cii.invoice_id
LEFT JOIN accounts ca ON ci.card_id = ca.id
WHERE ci.deleted_at IS NULL
GROUP BY ci.user_id, ci.card_id, ca.name, DATE_TRUNC('month', ci.invoice_date);

-- View: Overdue items with days overdue
CREATE OR REPLACE VIEW v_overdue_items AS
SELECT
  cii.id,
  cii.description,
  cii.amount,
  cii.due_date,
  (CURRENT_DATE - cii.due_date) AS days_overdue,
  CASE
    WHEN (CURRENT_DATE - cii.due_date) > 30 THEN 'CRITICAL'
    WHEN (CURRENT_DATE - cii.due_date) > 15 THEN 'WARNING'
    ELSE 'ALERT'
  END AS severity,
  cii.card_id,
  ca.name AS card_name,
  ca.lastFourDigits AS card_last_four,
  cii.user_id
FROM card_invoice_items cii
JOIN card_invoices ci ON cii.invoice_id = ci.id
JOIN accounts ca ON cii.card_id = ca.id
WHERE cii.status = 'OVERDUE'
  AND cii.due_date < CURRENT_DATE
  AND ci.deleted_at IS NULL;

-- ============================================================================
-- 6. GRANT PERMISSIONS (if using RLS with specific roles)
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON card_invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON card_invoice_items TO authenticated;

-- Ensure RLS policies are enforced
ALTER TABLE card_invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE card_invoice_items FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. ROLLBACK SCRIPT (Save for emergency)
-- ============================================================================
-- To rollback this migration, run:
/*
DROP VIEW IF EXISTS v_overdue_items CASCADE;
DROP VIEW IF EXISTS v_monthly_spending_summary CASCADE;
DROP VIEW IF EXISTS v_future_installments CASCADE;

DROP TRIGGER IF EXISTS trg_update_installment_status ON card_invoice_items;
DROP TRIGGER IF EXISTS trg_update_invoice_on_item_change ON card_invoice_items;

DROP FUNCTION IF EXISTS update_installment_status();
DROP FUNCTION IF EXISTS update_invoice_status_from_items();

DROP TABLE IF EXISTS card_invoice_items CASCADE;
DROP TABLE IF EXISTS card_invoices CASCADE;
*/

-- ============================================================================
-- 8. SEED DATA (Optional - for development/testing)
-- ============================================================================

-- Uncomment to insert test data (replace user_id and card_id with real UUIDs)
/*
INSERT INTO card_invoices (
  user_id, card_id, invoice_number, invoice_date, closing_date, due_date,
  total_amount, status, source, total_installments
) VALUES (
  '12345678-1234-1234-1234-123456789012',  -- Replace with real user_id
  '87654321-4321-4321-4321-210987654321',  -- Replace with real card_id
  '202601',
  '2026-01-01',
  '2025-12-21',
  '2026-01-20',
  5234.50,
  'OPEN',
  'manual',
  8
) RETURNING id;

-- Then insert items with the returned invoice_id
INSERT INTO card_invoice_items (
  invoice_id, user_id, card_id,
  installment_number, installment_total,
  description, amount, due_date, status
) VALUES (
  'returned-invoice-id',
  '12345678-1234-1234-1234-123456789012',
  '87654321-4321-4321-4321-210987654321',
  1,
  3,
  'Compra - Eletrodomésticos',
  1299.90,
  '2026-01-20',
  'PENDING'
);
*/

-- ============================================================================
-- End of Migration
-- ============================================================================
-- Verification queries to check schema:
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'card_%';
-- SELECT * FROM information_schema.statistics WHERE table_name LIKE 'card_%';
