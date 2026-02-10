-- ============================================
-- SPFP Evolution v2.0 - Investments & Portfolio Tables
-- Migration: 20250210_investments_portfolio.sql
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
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  is_retirement BOOLEAN NOT NULL DEFAULT FALSE,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_type ON investments(type);
CREATE INDEX IF NOT EXISTS idx_investments_goal_id ON investments(goal_id);
CREATE INDEX IF NOT EXISTS idx_investments_is_retirement ON investments(is_retirement);

-- Enable RLS
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Create index
CREATE INDEX IF NOT EXISTS idx_retirement_settings_user_id ON retirement_settings(user_id);

-- Enable RLS
ALTER TABLE retirement_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own retirement settings" ON retirement_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own retirement settings" ON retirement_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retirement settings" ON retirement_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own retirement settings" ON retirement_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to investments
DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to retirement_settings
DROP TRIGGER IF EXISTS update_retirement_settings_updated_at ON retirement_settings;
CREATE TRIGGER update_retirement_settings_updated_at
  BEFORE UPDATE ON retirement_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Success Message
-- ============================================
COMMENT ON TABLE investments IS 'SPFP Evolution v2.0 - Investment Portfolio with support for multiple asset types';
COMMENT ON TABLE retirement_settings IS 'SPFP Evolution v2.0 - Retirement planning parameters';
