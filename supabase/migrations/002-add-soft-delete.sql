-- ============================================
-- Migration 002: Add Soft Delete Support
-- Purpose: Add deleted_at timestamp for soft deletes (GDPR/LGPD compliance)
-- This allows data recovery and maintains audit trails
-- ============================================

-- 1. USER_DATA TABLE - Add deleted_at column
-- ============================================
ALTER TABLE IF EXISTS user_data
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- Create index for soft delete queries (performance optimization)
CREATE INDEX IF NOT EXISTS idx_user_data_deleted_at ON user_data(deleted_at);
CREATE INDEX IF NOT EXISTS idx_user_data_user_id_deleted_at ON user_data(user_id, deleted_at);

-- Update RLS policy to exclude soft-deleted rows
DROP POLICY IF EXISTS "Users can view their own user_data" ON user_data;

CREATE POLICY "Users can view their own user_data"
ON user_data
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- 2. ACCOUNTS TABLE - Add deleted_at column (if exists)
-- ============================================
-- NOTE: Currently SPFP stores accounts in user_data.content JSON,
-- but this migration prepares for future schema changes

-- If individual accounts table exists, uncomment:
-- ALTER TABLE IF EXISTS accounts
-- ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
-- CREATE INDEX IF NOT EXISTS idx_accounts_deleted_at ON accounts(deleted_at);
-- CREATE INDEX IF NOT EXISTS idx_accounts_user_id_deleted_at ON accounts(user_id, deleted_at);

-- 3. TRANSACTIONS TABLE - Add deleted_at column (if exists)
-- ============================================
-- NOTE: Currently SPFP stores transactions in user_data.content JSON,
-- but this migration prepares for future schema changes

-- If individual transactions table exists, uncomment:
-- ALTER TABLE IF EXISTS transactions
-- ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
-- CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at ON transactions(deleted_at);
-- CREATE INDEX IF NOT EXISTS idx_transactions_user_id_deleted_at ON transactions(user_id, deleted_at);

-- 4. INTERACTION_LOGS TABLE - Add deleted_at column
-- ============================================
ALTER TABLE IF EXISTS interaction_logs
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_interaction_logs_deleted_at ON interaction_logs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_interaction_logs_user_id_deleted_at ON interaction_logs(user_id, deleted_at);

-- ============================================
-- Soft Delete Helper Functions
-- ============================================

-- Function to soft delete user data
CREATE OR REPLACE FUNCTION soft_delete_user_data(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_data
  SET deleted_at = NOW()
  WHERE user_id = p_user_id AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore soft-deleted user data
CREATE OR REPLACE FUNCTION restore_user_data(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE user_data
  SET deleted_at = NULL
  WHERE user_id = p_user_id AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete interaction logs
CREATE OR REPLACE FUNCTION soft_delete_interaction_logs(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE interaction_logs
  SET deleted_at = NOW()
  WHERE user_id = p_user_id AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active (non-deleted) rows count
CREATE OR REPLACE FUNCTION count_active_user_data()
RETURNS TABLE(user_id UUID, active_count INT) AS $$
BEGIN
  RETURN QUERY
  SELECT user_data.user_id, COUNT(*)::INT
  FROM user_data
  WHERE deleted_at IS NULL
  GROUP BY user_data.user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Verification Query (run after migration):
-- ============================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name IN ('user_data', 'interaction_logs')
-- AND column_name = 'deleted_at'
-- ORDER BY table_name;

-- Check soft delete indexes:
-- SELECT indexname, tablename, indexdef
-- FROM pg_indexes
-- WHERE indexname LIKE '%deleted_at%'
-- ORDER BY tablename;
-- ============================================
