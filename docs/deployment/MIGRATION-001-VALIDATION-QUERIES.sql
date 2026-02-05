-- Migration 001: Card Invoices Schema - Validation Queries
-- Date: 2026-02-05
-- Run these queries after deploying 001_card_invoices_schema.sql
-- Copy each query below into Supabase SQL Editor and run individually

-- ============================================================================
-- 1. VERIFY TABLES CREATED
-- ============================================================================

-- Query 1.1: Check tables exist
SELECT
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_name IN ('card_invoices', 'card_invoice_items')
  AND table_schema = 'public'
ORDER BY table_name;
-- Expected Result: 2 rows
--   table_name        | table_schema
--   card_invoice_items | public
--   card_invoices      | public

-- ============================================================================
-- 2. VERIFY COLUMNS
-- ============================================================================

-- Query 2.1: Verify card_invoices columns (16 expected)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'card_invoices'
  AND table_schema = 'public'
ORDER BY ordinal_position;
-- Expected: 17 rows with columns:
-- id, user_id, card_id, invoice_number, invoice_date, closing_date, due_date,
-- total_amount, paid_amount, pending_amount, status, source,
-- total_installments, paid_installments, created_at, updated_at, deleted_at

-- Query 2.2: Verify card_invoice_items columns
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'card_invoice_items'
  AND table_schema = 'public'
ORDER BY ordinal_position;
-- Expected: 15 rows with columns:
-- id, invoice_id, user_id, transaction_id, installment_number, installment_total,
-- original_transaction_date, description, amount, category_id, status,
-- due_date, paid_date, card_id, created_at, updated_at

-- ============================================================================
-- 3. VERIFY ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Query 3.1: Verify RLS enabled
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('card_invoices', 'card_invoice_items')
  AND schemaname = 'public';
-- Expected Result: 2 rows, all with rowsecurity = true
--   tablename        | rowsecurity
--   card_invoices    | t
--   card_invoice_items | t

-- Query 3.2: List RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  using_expression,
  with_check_expression
FROM pg_policies
WHERE tablename IN ('card_invoices', 'card_invoice_items')
  AND schemaname = 'public'
ORDER BY tablename, policyname;
-- Expected Result: 2 rows
--   tablename | policyname                         | cmd | using
--   card_invoice_items | card_invoice_items_user_isolation | ALL | (user_id = auth.uid())
--   card_invoices | card_invoices_user_isolation | ALL | (user_id = auth.uid())

-- ============================================================================
-- 4. VERIFY INDEXES
-- ============================================================================

-- Query 4.1: Count indexes
SELECT
  COUNT(*) as total_indexes,
  tablename
FROM pg_indexes
WHERE tablename IN ('card_invoices', 'card_invoice_items')
  AND schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
-- Expected Result: 2 rows
--   total_indexes | tablename
--   8 | card_invoices
--   5 | card_invoice_items

-- Query 4.2: List all indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('card_invoices', 'card_invoice_items')
  AND schemaname = 'public'
ORDER BY tablename, indexname;
-- Expected: 13 indexes total

-- Query 4.3: Verify specific indexes exist
SELECT
  indexname,
  CASE WHEN indexname LIKE 'idx_%' THEN 'Custom'
       WHEN indexname LIKE '%_pkey' THEN 'Primary Key'
       ELSE 'Other'
  END as index_type
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('card_invoices', 'card_invoice_items')
ORDER BY tablename, indexname;

-- ============================================================================
-- 5. VERIFY CONSTRAINTS
-- ============================================================================

-- Query 5.1: List all constraints
SELECT
  constraint_name,
  table_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name IN ('card_invoices', 'card_invoice_items')
  AND table_schema = 'public'
ORDER BY table_name, constraint_name;
-- Expected: 8 constraints total
--   - PRIMARY KEYs: 2
--   - FOREIGN KEYs: 2 (for user_id)
--   - UNIQUE: 1 (unique_invoice_per_card_month)
--   - CHECKs: 3+

-- Query 5.2: Verify foreign keys
SELECT
  constraint_name,
  table_name,
  column_name,
  referenced_table_name,
  referenced_column_name
FROM information_schema.referential_constraints
JOIN information_schema.key_column_usage
  ON referential_constraints.constraint_name = key_column_usage.constraint_name
WHERE table_name IN ('card_invoices', 'card_invoice_items');
-- Expected: FKs pointing to auth.users, accounts, transactions, categories

-- Query 5.3: Verify check constraints
SELECT
  constraint_name,
  table_name,
  check_clause
FROM information_schema.check_constraints
WHERE table_schema = 'public'
  AND table_name IN ('card_invoices', 'card_invoice_items')
ORDER BY table_name, constraint_name;

-- ============================================================================
-- 6. VERIFY TRIGGERS
-- ============================================================================

-- Query 6.1: List triggers
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation,
  action_orientation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('card_invoices', 'card_invoice_items')
ORDER BY event_object_table, trigger_name;
-- Expected: 2 triggers on card_invoice_items
--   trg_update_installment_status (BEFORE, INSERT OR UPDATE)
--   trg_update_invoice_on_item_change (AFTER, INSERT OR UPDATE OR DELETE)

-- Query 6.2: Verify trigger functions exist
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_invoice_status_from_items',
    'update_installment_status'
  )
ORDER BY routine_name;
-- Expected: 2 functions (PLPGSQL)

-- ============================================================================
-- 7. VERIFY VIEWS
-- ============================================================================

-- Query 7.1: List views
SELECT
  schemaname,
  viewname,
  viewowner
FROM information_schema.views
WHERE viewname LIKE 'v_%'
  AND schemaname = 'public'
ORDER BY viewname;
-- Expected: 3 views
--   v_future_installments
--   v_monthly_spending_summary
--   v_overdue_items

-- Query 7.2: Verify view definitions (can see structure)
SELECT
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_type = 'VIEW'
  AND table_schema = 'public'
  AND table_name LIKE 'v_%'
ORDER BY table_name;

-- ============================================================================
-- 8. VERIFY DATA INTEGRITY (Empty Database Expected)
-- ============================================================================

-- Query 8.1: Check table row counts
SELECT 'card_invoices' as table_name, COUNT(*) as row_count FROM card_invoices
UNION ALL
SELECT 'card_invoice_items', COUNT(*) FROM card_invoice_items
ORDER BY table_name;
-- Expected: 0 rows in both tables (empty on fresh deployment)

-- Query 8.2: Verify no orphaned data
SELECT
  'card_invoices' as table_name,
  COUNT(*) as total_rows,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT card_id) as unique_cards
FROM card_invoices
UNION ALL
SELECT
  'card_invoice_items',
  COUNT(*),
  COUNT(DISTINCT user_id),
  COUNT(DISTINCT card_id)
FROM card_invoice_items;

-- ============================================================================
-- 9. TEST RLS POLICIES (Optional - requires auth context)
-- ============================================================================

-- Query 9.1: Test user isolation (simulate user 123)
-- SET request.jwt.claim.sub = '123';
-- SELECT COUNT(*) FROM card_invoices;
-- Expected: 0 (user 123 has no invoices yet)
-- RESET request.jwt.claim.sub;

-- Query 9.2: Test unauthenticated access (should be blocked or return 0)
-- RESET request.jwt.claim.sub;
-- SELECT COUNT(*) FROM card_invoices;
-- Expected: Error or 0 depending on policy

-- ============================================================================
-- 10. PERFORMANCE TEST (Query Execution Times)
-- ============================================================================

-- Query 10.1: Simple count (should be instant)
SELECT COUNT(*) FROM card_invoices;
-- Expected: < 10ms

-- Query 10.2: Join tables (should be instant)
SELECT COUNT(*)
FROM card_invoices ci
LEFT JOIN card_invoice_items cii ON ci.id = cii.invoice_id;
-- Expected: < 10ms

-- Query 10.3: With index filter
SELECT COUNT(*)
FROM card_invoices
WHERE user_id = '12345678-1234-1234-1234-123456789012'::uuid;
-- Expected: < 5ms (uses index)

-- Query 10.4: Complex aggregation
SELECT
  COUNT(DISTINCT user_id),
  COUNT(DISTINCT card_id),
  AVG(total_amount)
FROM card_invoices;
-- Expected: < 20ms

-- ============================================================================
-- 11. QUICK TEST QUERIES (From QUERIES-QUICK-REFERENCE.md)
-- ============================================================================

-- Q1: Get Invoices for Card (Last 12 Months)
SELECT
  ci.id,
  ci.invoice_number,
  ci.invoice_date,
  ci.due_date,
  ci.total_amount,
  ci.paid_amount,
  ci.pending_amount,
  ci.status,
  COUNT(cii.id) FILTER (WHERE cii.status != 'CANCELLED') as item_count,
  COUNT(cii.id) FILTER (WHERE cii.status = 'PAID') as paid_items
FROM card_invoices ci
LEFT JOIN card_invoice_items cii ON ci.id = cii.invoice_id
WHERE ci.user_id = 'test-user-id'::uuid
  AND ci.card_id = 'test-card-id'::uuid
  AND ci.invoice_date >= NOW() - INTERVAL '12 months'
  AND ci.deleted_at IS NULL
GROUP BY ci.id
ORDER BY ci.invoice_date DESC
LIMIT 50;
-- Expected: 0 rows (no data yet), execution time < 50ms

-- Q2: Current + Future Installments (90 Days)
SELECT
  cii.id,
  cii.invoice_id,
  ci.invoice_date,
  cii.due_date,
  cii.description,
  cii.amount,
  cii.installment_number,
  cii.installment_total,
  cii.status
FROM card_invoice_items cii
JOIN card_invoices ci ON cii.invoice_id = ci.id
WHERE cii.user_id = 'test-user-id'::uuid
  AND cii.card_id = 'test-card-id'::uuid
  AND cii.status IN ('PENDING', 'OVERDUE')
  AND cii.due_date >= NOW()::DATE
  AND cii.due_date <= NOW()::DATE + INTERVAL '90 days'
ORDER BY cii.due_date ASC;
-- Expected: 0 rows, execution time < 50ms

-- Q6: Overdue Items with Severity
SELECT
  cii.id,
  cii.description,
  cii.amount,
  cii.due_date,
  ci.card_id,
  ca.name as card_name,
  (NOW()::DATE - cii.due_date) as days_overdue,
  CASE
    WHEN (NOW()::DATE - cii.due_date) > 30 THEN 'CRITICAL'
    WHEN (NOW()::DATE - cii.due_date) > 15 THEN 'WARNING'
    ELSE 'ALERT'
  END as severity
FROM card_invoice_items cii
JOIN card_invoices ci ON cii.invoice_id = ci.id
JOIN accounts ca ON ci.card_id = ca.id
WHERE cii.user_id = 'test-user-id'::uuid
  AND cii.status = 'OVERDUE'
  AND cii.due_date < NOW()::DATE
ORDER BY cii.due_date ASC;
-- Expected: 0 rows, execution time < 50ms

-- Q7: Monthly Spending Summary
SELECT
  DATE_TRUNC('month', ci.invoice_date)::DATE as month,
  COUNT(DISTINCT ci.id) as num_invoices,
  SUM(ci.total_amount) as total_spent,
  SUM(ci.paid_amount) as total_paid,
  SUM(ci.pending_amount) as total_pending,
  AVG(ci.total_amount) as avg_invoice_amount
FROM card_invoices ci
WHERE ci.user_id = 'test-user-id'::uuid
  AND ci.card_id = 'test-card-id'::uuid
  AND ci.invoice_date >= NOW() - INTERVAL '12 months'
  AND ci.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', ci.invoice_date)
ORDER BY month DESC;
-- Expected: 0 rows, execution time < 100ms

-- ============================================================================
-- 12. COMPLETE VERIFICATION SUMMARY
-- ============================================================================

-- Final check: All system components present
SELECT
  'Tables' as component,
  COUNT(*) as count,
  'Expected: 2' as target
FROM information_schema.tables
WHERE table_name IN ('card_invoices', 'card_invoice_items')
  AND table_schema = 'public'
UNION ALL
SELECT 'Indexes', COUNT(*), 'Expected: 13'
FROM pg_indexes
WHERE tablename IN ('card_invoices', 'card_invoice_items')
  AND schemaname = 'public'
UNION ALL
SELECT 'RLS Policies', COUNT(*), 'Expected: 2'
FROM pg_policies
WHERE tablename IN ('card_invoices', 'card_invoice_items')
  AND schemaname = 'public'
UNION ALL
SELECT 'Views', COUNT(*), 'Expected: 3'
FROM information_schema.views
WHERE viewname LIKE 'v_%'
  AND schemaname = 'public'
UNION ALL
SELECT 'Constraints', COUNT(*), 'Expected: 8+'
FROM information_schema.table_constraints
WHERE table_name IN ('card_invoices', 'card_invoice_items')
  AND table_schema = 'public'
UNION ALL
SELECT 'Triggers', COUNT(*), 'Expected: 2'
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('card_invoices', 'card_invoice_items');

-- ============================================================================
-- END OF VALIDATION QUERIES
-- ============================================================================

-- Run all queries above and confirm all expected results match
-- If any query returns unexpected results, review DEVOPS-RUNBOOK.md for troubleshooting
-- After successful validation, create MIGRATION-001-DEPLOYED.md report

-- Copy this comment to mark completion:
-- ✅ All validation queries passed
-- ✅ Schema deployed successfully
-- ✅ Ready for application development

