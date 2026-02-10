-- ============================================
-- SPFP Evolution v2.0 - Partnerships Tables
-- Migration: 20250210_partnerships.sql
-- ============================================

-- Partners table (Gestão de Parcerias)
CREATE TABLE IF NOT EXISTS partners_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  default_commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 50.0 CHECK (default_commission_rate >= 0 AND default_commission_rate <= 100),

  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_partners_v2_user_id ON partners_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_v2_is_active ON partners_v2(is_active);

-- Enable RLS
ALTER TABLE partners_v2 ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own partners" ON partners_v2
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own partners" ON partners_v2
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partners" ON partners_v2
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own partners" ON partners_v2
  FOR DELETE USING (auth.uid() = user_id);

-- Partnership Clients table
CREATE TABLE IF NOT EXISTS partnership_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners_v2(id) ON DELETE CASCADE,

  client_name VARCHAR(255) NOT NULL,
  contract_value DECIMAL(18, 2) NOT NULL CHECK (contract_value >= 0),
  commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 50.0 CHECK (commission_rate >= 0 AND commission_rate <= 100),

  -- Computed columns stored for performance
  total_commission DECIMAL(18, 2) GENERATED ALWAYS AS (contract_value * commission_rate / 100) STORED,
  my_share DECIMAL(18, 2) GENERATED ALWAYS AS (contract_value * commission_rate / 100 / 2) STORED,
  partner_share DECIMAL(18, 2) GENERATED ALWAYS AS (contract_value * commission_rate / 100 / 2) STORED,

  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  closed_at DATE,
  paid_at TIMESTAMPTZ,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_partnership_clients_user_id ON partnership_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_partnership_clients_partner_id ON partnership_clients(partner_id);
CREATE INDEX IF NOT EXISTS idx_partnership_clients_status ON partnership_clients(status);
CREATE INDEX IF NOT EXISTS idx_partnership_clients_closed_at ON partnership_clients(closed_at);

-- Enable RLS
ALTER TABLE partnership_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own partnership clients" ON partnership_clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own partnership clients" ON partnership_clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partnership clients" ON partnership_clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own partnership clients" ON partnership_clients
  FOR DELETE USING (auth.uid() = user_id);

-- Apply trigger to partners_v2
DROP TRIGGER IF EXISTS update_partners_v2_updated_at ON partners_v2;
CREATE TRIGGER update_partners_v2_updated_at
  BEFORE UPDATE ON partners_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to partnership_clients
DROP TRIGGER IF EXISTS update_partnership_clients_updated_at ON partnership_clients;
CREATE TRIGGER update_partnership_clients_updated_at
  BEFORE UPDATE ON partnership_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Summary Views for Dashboard
-- ============================================

-- View: Partnership Summary by Partner
CREATE OR REPLACE VIEW partnership_summary_by_partner AS
SELECT
  p.user_id,
  p.id as partner_id,
  p.name as partner_name,
  COUNT(pc.id) as total_clients,
  COALESCE(SUM(pc.contract_value), 0) as total_contract_value,
  COALESCE(SUM(pc.total_commission), 0) as total_commission,
  COALESCE(SUM(pc.my_share), 0) as total_my_share,
  COALESCE(SUM(pc.partner_share), 0) as total_partner_share,
  COALESCE(SUM(CASE WHEN pc.status = 'pending' THEN pc.my_share ELSE 0 END), 0) as pending_my_share,
  COALESCE(SUM(CASE WHEN pc.status = 'paid' THEN pc.my_share ELSE 0 END), 0) as paid_my_share
FROM partners_v2 p
LEFT JOIN partnership_clients pc ON p.id = pc.partner_id
GROUP BY p.user_id, p.id, p.name;

-- View: Monthly Partnership Revenue
CREATE OR REPLACE VIEW partnership_monthly_revenue AS
SELECT
  pc.user_id,
  DATE_TRUNC('month', pc.closed_at) as month,
  COUNT(pc.id) as clients_count,
  SUM(pc.contract_value) as total_contract_value,
  SUM(pc.total_commission) as total_commission,
  SUM(pc.my_share) as total_my_share,
  SUM(pc.partner_share) as total_partner_share
FROM partnership_clients pc
WHERE pc.closed_at IS NOT NULL
GROUP BY pc.user_id, DATE_TRUNC('month', pc.closed_at)
ORDER BY month DESC;

-- ============================================
-- Success Message
-- ============================================
COMMENT ON TABLE partners_v2 IS 'SPFP Evolution v2.0 - Business partners for commission sharing';
COMMENT ON TABLE partnership_clients IS 'SPFP Evolution v2.0 - Clients acquired through partnerships with 50/50 split';
