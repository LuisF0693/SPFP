-- ============================================
-- Stripe Integration Tables
-- Created: 2025-02-18
-- Description: Tables for Stripe payment processing
-- ============================================

-- ============================================
-- 1. stripe_sessions table
-- Stores checkout session information
-- ============================================
CREATE TABLE IF NOT EXISTS stripe_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  price_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
    -- Possible values: 'open', 'expired', 'complete'
  amount INTEGER NOT NULL,
    -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'BRL',
  plan_type TEXT NOT NULL,
    -- 'parcelado' or 'mensal'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_user_id
  ON stripe_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id
  ON stripe_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_stripe_sessions_created_at
  ON stripe_sessions(created_at DESC);

-- ============================================
-- 2. stripe_subscriptions table
-- Stores recurring subscription information
-- ============================================
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  price_id TEXT NOT NULL,
  status TEXT NOT NULL,
    -- Possible values: 'active', 'past_due', 'cancelled'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_id
  ON stripe_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subscription_id
  ON stripe_subscriptions(subscription_id);

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id
  ON stripe_subscriptions(customer_id);

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status
  ON stripe_subscriptions(status);

-- ============================================
-- 3. user_access table
-- Controls user access to SPFP features
-- ============================================
CREATE TABLE IF NOT EXISTS user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan INTEGER NOT NULL,
    -- 99 for Essencial, 349 for Wealth
  plan_type TEXT NOT NULL,
    -- 'parcelado' for one-time payment, 'mensal' for subscription
  access_granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
    -- NULL for recurring subscriptions (renew automatically)
    -- Set for one-time payments that should expire
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_access_user_id
  ON user_access(user_id);

CREATE INDEX IF NOT EXISTS idx_user_access_is_active
  ON user_access(is_active);

CREATE INDEX IF NOT EXISTS idx_user_access_expires_at
  ON user_access(expires_at);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================

-- stripe_sessions RLS
ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON stripe_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert sessions"
  ON stripe_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update sessions"
  ON stripe_sessions
  FOR UPDATE
  USING (true);

-- stripe_subscriptions RLS
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON stripe_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON stripe_subscriptions
  FOR ALL
  USING (true);

-- user_access RLS
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access"
  ON user_access
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage access"
  ON user_access
  FOR ALL
  USING (true);

-- ============================================
-- Create helper functions
-- ============================================

-- Function to grant user access
CREATE OR REPLACE FUNCTION grant_user_access(
  p_user_id UUID,
  p_plan INTEGER,
  p_plan_type TEXT,
  p_expires_at TIMESTAMP DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, user_id UUID, plan INTEGER) AS $$
BEGIN
  INSERT INTO user_access (user_id, plan, plan_type, expires_at, is_active)
  VALUES (p_user_id, p_plan, p_plan_type, p_expires_at, true)
  ON CONFLICT (user_id)
  DO UPDATE SET
    plan = p_plan,
    plan_type = p_plan_type,
    expires_at = p_expires_at,
    is_active = true,
    updated_at = NOW();

  RETURN QUERY
  SELECT true, p_user_id, p_plan;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has active access
CREATE OR REPLACE FUNCTION user_has_access(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_access
    WHERE user_id = p_user_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql;

-- Function to revoke user access
CREATE OR REPLACE FUNCTION revoke_user_access(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_access
  SET is_active = false, updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Create audit trigger for tracking changes
-- ============================================

CREATE TABLE IF NOT EXISTS stripe_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id UUID,
  user_id UUID,
  changes JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION log_stripe_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO stripe_audit_log (table_name, operation, record_id, user_id, changes)
    VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, NEW.user_id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO stripe_audit_log (table_name, operation, record_id, user_id, changes)
    VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, NEW.user_id, jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO stripe_audit_log (table_name, operation, record_id, user_id, changes)
    VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, OLD.user_id, to_jsonb(OLD));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to audit log changes
CREATE TRIGGER stripe_sessions_audit
  AFTER INSERT OR UPDATE OR DELETE ON stripe_sessions
  FOR EACH ROW EXECUTE FUNCTION log_stripe_changes();

CREATE TRIGGER stripe_subscriptions_audit
  AFTER INSERT OR UPDATE OR DELETE ON stripe_subscriptions
  FOR EACH ROW EXECUTE FUNCTION log_stripe_changes();

CREATE TRIGGER user_access_audit
  AFTER INSERT OR UPDATE OR DELETE ON user_access
  FOR EACH ROW EXECUTE FUNCTION log_stripe_changes();
