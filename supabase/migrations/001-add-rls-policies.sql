-- ============================================
-- Migration 001: Add Row Level Security Policies
-- Purpose: Isolate user data per user_id (user_data, interaction_logs)
-- ============================================

-- 1. USER_DATA TABLE - RLS Policies
-- ============================================

-- Enable RLS on user_data table
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own user_data" ON user_data;
DROP POLICY IF EXISTS "Users can insert their own user_data" ON user_data;
DROP POLICY IF EXISTS "Users can update their own user_data" ON user_data;
DROP POLICY IF EXISTS "Users can delete their own user_data" ON user_data;

-- SELECT: Users can only view their own records
CREATE POLICY "Users can view their own user_data"
ON user_data
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Users can only insert records with their own user_id
CREATE POLICY "Users can insert their own user_data"
ON user_data
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own records
CREATE POLICY "Users can update their own user_data"
ON user_data
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own records
CREATE POLICY "Users can delete their own user_data"
ON user_data
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. INTERACTION_LOGS TABLE - RLS Policies
-- ============================================

-- Enable RLS on interaction_logs table
ALTER TABLE interaction_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own interaction_logs" ON interaction_logs;
DROP POLICY IF EXISTS "Users can insert their own interaction_logs" ON interaction_logs;
DROP POLICY IF EXISTS "Users can delete their own interaction_logs" ON interaction_logs;

-- SELECT: Users can only view their own logs
CREATE POLICY "Users can view their own interaction_logs"
ON interaction_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- INSERT: Users can only insert logs for themselves
CREATE POLICY "Users can insert their own interaction_logs"
ON interaction_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own logs
CREATE POLICY "Users can delete their own interaction_logs"
ON interaction_logs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- Verification Query (run after migration):
-- SELECT tablename, policyname FROM pg_policies
-- WHERE tablename IN ('user_data', 'interaction_logs')
-- ORDER BY tablename, policyname;
-- ============================================
