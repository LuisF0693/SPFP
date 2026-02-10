-- ============================================
-- SPFP Evolution v2.0 - COMBINED MIGRATION
-- Execute this in Supabase SQL Editor
-- Project: jqmlloimcgsfjhhbenzk
-- Date: 2025-02-10
-- ============================================

-- ============================================
-- PART 1: INVESTMENTS & PORTFOLIO
-- ============================================

-- Investments table (Portfólio de Investimentos)
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identification
  name VARCHAR(255) NOT NULL,
  ticker VARCHAR(20),
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'tesouro', 'cdb', 'lci', 'lca', 'renda_fixa',
    'acao', 'stock', 'reit', 'fii', 'etf', 'fundo'
  )),

  -- Values
  quantity DECIMAL(18, 8) NOT NULL DEFAULT 0,
  average_price DECIMAL(18, 2) NOT NULL DEFAULT 0,
  current_price DECIMAL(18, 2),
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD')),

  -- Type-specific details
  institution VARCHAR(255),
  rate DECIMAL(8, 4),
  rate_type VARCHAR(20) CHECK (rate_type IN ('pre', 'pos_cdi', 'ipca')),
  maturity_date DATE,
  liquidity VARCHAR(20) CHECK (liquidity IN ('D+0', 'D+1', 'D+30', 'D+60', 'D+90', 'maturity')),

  -- Tesouro specific
  tesouro_type VARCHAR(20) CHECK (tesouro_type IN ('selic', 'ipca', 'prefixado')),

  -- Funds specific
  cnpj VARCHAR(20),
  fund_type VARCHAR(20) CHECK (fund_type IN ('rf', 'rv', 'multi', 'cambial')),
  fund_manager VARCHAR(255),

  -- Linking
  goal_id UUID,  -- Will add FK after checking if goals table exists
  is_retirement BOOLEAN NOT NULL DEFAULT FALSE,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for investments
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_type ON investments(type);
CREATE INDEX IF NOT EXISTS idx_investments_goal_id ON investments(goal_id);
CREATE INDEX IF NOT EXISTS idx_investments_is_retirement ON investments(is_retirement);

-- Enable RLS on investments
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own investments" ON investments;
DROP POLICY IF EXISTS "Users can create their own investments" ON investments;
DROP POLICY IF EXISTS "Users can update their own investments" ON investments;
DROP POLICY IF EXISTS "Users can delete their own investments" ON investments;

-- RLS Policies for investments
CREATE POLICY "Users can view their own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" ON investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments" ON investments
  FOR DELETE USING (auth.uid() = user_id);

-- Retirement Settings table
CREATE TABLE IF NOT EXISTS retirement_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  current_age INTEGER NOT NULL DEFAULT 30 CHECK (current_age >= 18 AND current_age <= 80),
  retirement_age INTEGER NOT NULL DEFAULT 65 CHECK (retirement_age >= 30 AND retirement_age <= 100),
  life_expectancy INTEGER NOT NULL DEFAULT 100 CHECK (life_expectancy >= 60 AND life_expectancy <= 120),

  annual_return_rate DECIMAL(5, 2) NOT NULL DEFAULT 8.0 CHECK (annual_return_rate >= 0 AND annual_return_rate <= 50),
  inflation_rate DECIMAL(5, 2) NOT NULL DEFAULT 4.5 CHECK (inflation_rate >= 0 AND inflation_rate <= 30),

  monthly_contribution DECIMAL(18, 2) NOT NULL DEFAULT 0,
  desired_monthly_income DECIMAL(18, 2) NOT NULL DEFAULT 0,
  current_patrimony DECIMAL(18, 2) NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for retirement_settings
CREATE INDEX IF NOT EXISTS idx_retirement_settings_user_id ON retirement_settings(user_id);

-- Enable RLS on retirement_settings
ALTER TABLE retirement_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own retirement settings" ON retirement_settings;
DROP POLICY IF EXISTS "Users can create their own retirement settings" ON retirement_settings;
DROP POLICY IF EXISTS "Users can update their own retirement settings" ON retirement_settings;
DROP POLICY IF EXISTS "Users can delete their own retirement settings" ON retirement_settings;

-- RLS Policies for retirement_settings
CREATE POLICY "Users can view their own retirement settings" ON retirement_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own retirement settings" ON retirement_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retirement settings" ON retirement_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own retirement settings" ON retirement_settings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 2: PARTNERSHIPS
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

-- Create indexes for partners_v2
CREATE INDEX IF NOT EXISTS idx_partners_v2_user_id ON partners_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_v2_is_active ON partners_v2(is_active);

-- Enable RLS on partners_v2
ALTER TABLE partners_v2 ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own partners" ON partners_v2;
DROP POLICY IF EXISTS "Users can create their own partners" ON partners_v2;
DROP POLICY IF EXISTS "Users can update their own partners" ON partners_v2;
DROP POLICY IF EXISTS "Users can delete their own partners" ON partners_v2;

-- RLS Policies for partners_v2
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

-- Create indexes for partnership_clients
CREATE INDEX IF NOT EXISTS idx_partnership_clients_user_id ON partnership_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_partnership_clients_partner_id ON partnership_clients(partner_id);
CREATE INDEX IF NOT EXISTS idx_partnership_clients_status ON partnership_clients(status);
CREATE INDEX IF NOT EXISTS idx_partnership_clients_closed_at ON partnership_clients(closed_at);

-- Enable RLS on partnership_clients
ALTER TABLE partnership_clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own partnership clients" ON partnership_clients;
DROP POLICY IF EXISTS "Users can create their own partnership clients" ON partnership_clients;
DROP POLICY IF EXISTS "Users can update their own partnership clients" ON partnership_clients;
DROP POLICY IF EXISTS "Users can delete their own partnership clients" ON partnership_clients;

-- RLS Policies for partnership_clients
CREATE POLICY "Users can view their own partnership clients" ON partnership_clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own partnership clients" ON partnership_clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own partnership clients" ON partnership_clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own partnership clients" ON partnership_clients
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 3: TRIGGERS FOR UPDATED_AT
-- ============================================

-- Updated_at trigger function (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_retirement_settings_updated_at ON retirement_settings;
CREATE TRIGGER update_retirement_settings_updated_at
  BEFORE UPDATE ON retirement_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partners_v2_updated_at ON partners_v2;
CREATE TRIGGER update_partners_v2_updated_at
  BEFORE UPDATE ON partners_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partnership_clients_updated_at ON partnership_clients;
CREATE TRIGGER update_partnership_clients_updated_at
  BEFORE UPDATE ON partnership_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 4: VIEWS FOR DASHBOARD
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
-- PART 5: TABLE COMMENTS
-- ============================================

COMMENT ON TABLE investments IS 'SPFP Evolution v2.0 - Investment Portfolio with support for multiple asset types';
COMMENT ON TABLE retirement_settings IS 'SPFP Evolution v2.0 - Retirement planning parameters';
COMMENT ON TABLE partners_v2 IS 'SPFP Evolution v2.0 - Business partners for commission sharing';
COMMENT ON TABLE partnership_clients IS 'SPFP Evolution v2.0 - Clients acquired through partnerships with 50/50 split';

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- Tables created:
--   - investments (11 investment types, goal linking, RLS)
--   - retirement_settings (100-year projections, RLS)
--   - partners_v2 (partner management, RLS)
--   - partnership_clients (50/50 split, computed columns, RLS)
--
-- Views created:
--   - partnership_summary_by_partner
--   - partnership_monthly_revenue
--
-- All tables have:
--   - UUID primary keys
--   - RLS enabled with user isolation
--   - updated_at triggers
--   - Proper indexes
-- ============================================
