-- ============================================
-- RLS Isolation Tests - user_data & interaction_logs Tables
-- Purpose: Verify that users cannot access other users' data
-- Reference: STY-001 (Implement RLS Policies)
-- ============================================

-- ============================================
-- TEST SETUP
-- ============================================

-- Test 1: Verify RLS is enabled on both tables
-- Expected: Both tables should have row_security = on
SELECT tablename, rowsecurity
FROM pg_class
JOIN pg_tables ON pg_class.relname = pg_tables.tablename
WHERE tablename IN ('user_data', 'interaction_logs')
  AND schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- TEST 2: Verify all 7 RLS policies are created
-- ============================================
-- Expected: 7 rows (4 for user_data, 3 for interaction_logs)
SELECT
  tablename,
  policyname,
  permissive,
  cmd,
  qual AS policy_condition
FROM pg_policies
WHERE tablename IN ('user_data', 'interaction_logs')
ORDER BY tablename, policyname;

-- Result should show:
-- user_data:
--   - Users can delete their own user_data (DELETE)
--   - Users can insert their own user_data (INSERT)
--   - Users can update their own user_data (UPDATE)
--   - Users can view their own user_data (SELECT)
-- interaction_logs:
--   - Users can delete their own interaction_logs (DELETE)
--   - Users can insert their own interaction_logs (INSERT)
--   - Users can view their own interaction_logs (SELECT)

-- ============================================
-- TEST 3: Verify SELECT policy condition syntax
-- ============================================
-- Check that SELECT policies use (auth.uid() = user_id)
SELECT
  tablename,
  policyname,
  qual AS policy_condition
FROM pg_policies
WHERE tablename = 'user_data'
  AND cmd = 'SELECT'
  AND policyname = 'Users can view their own user_data';

-- Expected: qual should contain condition checking auth.uid() = user_id

-- ============================================
-- TEST 4: Verify INSERT policy prevents cross-user writes
-- ============================================
-- Check that INSERT policies use WITH CHECK (auth.uid() = user_id)
SELECT
  tablename,
  policyname,
  qual AS policy_condition,
  with_check AS insert_check
FROM pg_policies
WHERE tablename = 'user_data'
  AND cmd = 'INSERT'
  AND policyname = 'Users can insert their own user_data';

-- Expected: with_check should contain condition checking auth.uid() = user_id

-- ============================================
-- TEST 5: Verify UPDATE policy restricts modifications
-- ============================================
SELECT
  tablename,
  policyname,
  qual AS using_condition,
  with_check AS update_check
FROM pg_policies
WHERE tablename = 'user_data'
  AND cmd = 'UPDATE'
  AND policyname = 'Users can update their own user_data';

-- Expected: Both using and with_check should verify auth.uid() = user_id

-- ============================================
-- TEST 6: Verify DELETE policy restricts deletion
-- ============================================
SELECT
  tablename,
  policyname,
  qual AS policy_condition
FROM pg_policies
WHERE tablename = 'user_data'
  AND cmd = 'DELETE'
  AND policyname = 'Users can delete their own user_data';

-- Expected: qual should contain condition checking auth.uid() = user_id

-- ============================================
-- TEST 7: Manual isolation verification (conceptual)
-- ============================================
-- NOTE: These tests assume you have two test users in auth.users table
-- User A: user_id = 'test-user-a-uuid'
-- User B: user_id = 'test-user-b-uuid'
--
-- To manually test RLS:
-- 1. Login as User A via Supabase Auth
-- 2. Run: SELECT * FROM user_data WHERE user_id != auth.uid();
--    Expected: ERROR permission denied for table user_data
--
-- 3. Run: SELECT * FROM user_data WHERE user_id = auth.uid();
--    Expected: Returns User A's records only
--
-- 4. Attempt INSERT with User B's ID:
--    INSERT INTO user_data (user_id, data) VALUES ('test-user-b-uuid', '...');
--    Expected: ERROR new row violates row-level security policy
--
-- 5. Attempt UPDATE on User B's record:
--    UPDATE user_data SET column = 'value' WHERE user_id = 'test-user-b-uuid';
--    Expected: 0 rows updated (silently fails - no error, just no rows match)
--
-- 6. Attempt DELETE on User B's record:
--    DELETE FROM user_data WHERE user_id = 'test-user-b-uuid';
--    Expected: 0 rows deleted

-- ============================================
-- TEST 8: Verify interaction_logs has same RLS pattern
-- ============================================
SELECT
  tablename,
  policyname,
  cmd,
  qual AS policy_condition
FROM pg_policies
WHERE tablename = 'interaction_logs'
ORDER BY cmd, policyname;

-- Expected:
-- - DELETE policy with auth.uid() = user_id
-- - INSERT policy with auth.uid() = user_id (WITH CHECK)
-- - SELECT policy with auth.uid() = user_id

-- ============================================
-- TEST 9: Count policies by operation type
-- ============================================
SELECT
  cmd AS operation,
  COUNT(*) AS total_policies
FROM pg_policies
WHERE tablename IN ('user_data', 'interaction_logs')
GROUP BY cmd
ORDER BY cmd;

-- Expected:
-- DELETE: 2 policies
-- INSERT: 2 policies
-- SELECT: 2 policies

-- ============================================
-- TEST 10: Verify no orphaned or duplicate policies
-- ============================================
SELECT
  tablename,
  policyname,
  COUNT(*) AS duplicate_count
FROM pg_policies
WHERE tablename IN ('user_data', 'interaction_logs')
GROUP BY tablename, policyname
HAVING COUNT(*) > 1;

-- Expected: No rows (no duplicates)

-- ============================================
-- SUMMARY REPORT
-- ============================================
-- Run this final query to get an overview of all RLS status
WITH policy_summary AS (
  SELECT
    tablename,
    COUNT(*) AS total_policies,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) AS select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) AS insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) AS update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) AS delete_policies
  FROM pg_policies
  WHERE tablename IN ('user_data', 'interaction_logs')
  GROUP BY tablename
)
SELECT
  tablename,
  total_policies,
  select_policies,
  insert_policies,
  update_policies,
  delete_policies,
  CASE
    WHEN tablename = 'user_data' AND total_policies = 4 THEN '✅ CORRECT'
    WHEN tablename = 'interaction_logs' AND total_policies = 3 THEN '✅ CORRECT'
    ELSE '❌ INCORRECT'
  END AS status
FROM policy_summary
ORDER BY tablename;

-- ============================================
-- NOTES FOR EXECUTOR
-- ============================================
-- 1. Run all queries above to verify RLS setup
-- 2. Tests 1-9 are automated and can be run in Supabase SQL Editor
-- 3. Test 10 (manual isolation) requires actual auth context
-- 4. Summary report should show:
--    - user_data: 4 total policies ✅
--    - interaction_logs: 3 total policies ✅
-- 5. If any test fails, RLS is not properly configured
-- 6. All tests should pass before considering STY-001 complete
