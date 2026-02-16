-- ============================================
-- Validation Script for Database Optimizations
-- Migration: 20260216_database_optimizations.sql
-- Author: Nova (Data Engineer)
-- Purpose: Verify all changes from optimization migration
-- ============================================

-- ============================================
-- 1. VERIFY INDEXES CREATED
-- ============================================

SELECT '=== INDEXES CREATED ===' as check_category;

SELECT
  indexname,
  tablename,
  indexdef,
  idx_blks_read,
  idx_blks_hit
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_%'
    OR tablename IN ('categories', 'custom_templates')
  )
ORDER BY tablename, indexname;

-- Count indexes
SELECT
  'Total Indexes' as metric,
  COUNT(*)::text as value
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';

-- ============================================
-- 2. VERIFY CONSTRAINTS CREATED
-- ============================================

SELECT '=== CONSTRAINTS CREATED ===' as check_category;

SELECT
  constraint_name,
  table_name,
  constraint_type,
  is_deferrable,
  initially_deferred
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND (
    constraint_name LIKE 'unique_%'
    OR table_name IN ('categories', 'custom_templates')
  )
ORDER BY table_name, constraint_name;

-- ============================================
-- 3. VERIFY COLUMNS ADDED (SOFT DELETE)
-- ============================================

SELECT '=== SOFT DELETE COLUMNS ADDED ===' as check_category;

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name = 'deleted_at'
    OR (table_name = 'sent_atas' AND column_name = 'updated_at')
  )
ORDER BY table_name, column_name;

-- ============================================
-- 4. VERIFY VIEWS CREATED
-- ============================================

SELECT '=== VIEWS CREATED ===' as check_category;

SELECT
  table_name as view_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'VIEW'
  AND (
    table_name LIKE '%health_check%'
    OR table_name = 'dashboard_metrics'
  )
ORDER BY table_name;

-- ============================================
-- 5. VERIFY AUDIT TABLE CREATED
-- ============================================

SELECT '=== AUDIT TABLE CREATED ===' as check_category;

SELECT
  table_name,
  table_type,
  (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'automation_permissions_audit'
  ) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'automation_permissions_audit';

-- ============================================
-- 6. VERIFY FUNCTIONS CREATED
-- ============================================

SELECT '=== FUNCTIONS CREATED ===' as check_category;

SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE 'cleanup%';

-- ============================================
-- 7. VERIFY TRIGGERS CREATED
-- ============================================

SELECT '=== TRIGGERS CREATED ===' as check_category;

SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%updated_at%';

-- ============================================
-- 8. DATA INTEGRITY CHECKS
-- ============================================

SELECT '=== DATA INTEGRITY CHECKS ===' as check_category;

-- Check if any categories have duplicate names per user
SELECT
  'Duplicate Categories' as check_name,
  COUNT(*) as count
FROM (
  SELECT user_id, LOWER(name) as name
  FROM categories
  GROUP BY user_id, LOWER(name)
  HAVING COUNT(*) > 1
) duplicates;

-- Check for null values in critical fields
SELECT
  'NULL deleted_at in sent_atas' as check_name,
  COUNT(*) as count
FROM sent_atas
WHERE deleted_at IS NULL;

-- Check for orphaned soft-deleted records
SELECT
  'Soft-deleted Records (sent_atas)' as check_name,
  COUNT(*) as count
FROM sent_atas
WHERE deleted_at IS NOT NULL;

-- ============================================
-- 9. PERFORMANCE INDEX USAGE
-- ============================================

SELECT '=== INDEX USAGE STATISTICS ===' as check_category;

SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_%'
    OR tablename IN ('categories', 'custom_templates')
  )
ORDER BY idx_scan DESC;

-- ============================================
-- 10. SUMMARY REPORT
-- ============================================

SELECT '=== MIGRATION SUMMARY REPORT ===' as category, NULL as details
UNION ALL
SELECT 'Indexes Created', COUNT(*)::text FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
UNION ALL
SELECT 'Constraints Added', COUNT(*)::text FROM information_schema.table_constraints WHERE table_schema = 'public' AND constraint_name LIKE 'unique_%'
UNION ALL
SELECT 'Soft Delete Columns', COUNT(*)::text FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'deleted_at'
UNION ALL
SELECT 'Views Created', COUNT(*)::text FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'VIEW' AND table_name LIKE '%health_check%'
UNION ALL
SELECT 'Audit Tables Created', COUNT(*)::text FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'automation_permissions_audit'
UNION ALL
SELECT 'Functions Created', COUNT(*)::text FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE 'cleanup%'
UNION ALL
SELECT 'Triggers Created', COUNT(*)::text FROM information_schema.triggers WHERE trigger_schema = 'public' AND trigger_name LIKE '%updated_at%'
ORDER BY category;

-- ============================================
-- 11. EXPLAIN ANALYZE - PERFORMANCE TEST
-- ============================================

SELECT '=== PERFORMANCE TEST (EXPLAIN ANALYZE) ===' as check_category;

-- Test Kanban index performance
EXPLAIN ANALYZE
SELECT id, title, status, priority, position
FROM operational_tasks
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
  AND status = 'in_progress'
  AND deleted_at IS NULL
ORDER BY priority DESC
LIMIT 10;

-- ============================================
-- 12. MIGRATION SUCCESS INDICATOR
-- ============================================

SELECT
  'MIGRATION STATUS' as indicator,
  CASE
    WHEN (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%') >= 14
    AND (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = 'public' AND constraint_name LIKE 'unique_%') >= 2
    AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'VIEW' AND table_name LIKE '%health_check%') >= 6
    THEN 'SUCCESS - All optimizations applied'
    ELSE 'WARNING - Some components missing'
  END as status,
  NOW() as verification_time;

-- ============================================
-- END VALIDATION SCRIPT
-- ============================================
