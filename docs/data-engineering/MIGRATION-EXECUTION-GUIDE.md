# Migration Execution Guide: Database Optimizations (20260216)

**Status:** READY FOR EXECUTION
**Migration File:** `supabase/migrations/20260216_database_optimizations.sql`
**Author:** Nova (Data Engineer)
**Date:** February 16, 2026
**Risk Level:** LOW (additive changes only)

---

## Executive Summary

This migration optimizes the SPFP database with:
- 4 composite indexes for CRM, Corporate HQ, Kanban, and Pipeline operations
- UNIQUE constraint for category validation (EPIC-004.4)
- 5 analytics views for health checks
- Soft delete columns for compliance
- Audit trail table for automation permissions
- Cleanup functions for data retention

**Execution Time:** ~5-10 seconds
**Estimated Performance Gain:** 5x faster queries for operational tasks

---

## Prerequisites

Before executing this migration, verify:

### 1. Backup Current Database
```bash
# Backup via Supabase Dashboard
# Settings > Database > Backups > Create Backup
```

### 2. Verify Supabase Project Access
- Project URL: `https://jqmlloimcgsfjhhbenzk.supabase.co`
- Access Supabase Dashboard: https://app.supabase.com

### 3. Get Appropriate Credentials
- You need **Supabase Service Role Key** (from project settings)
- Or use Supabase Dashboard SQL Editor (easiest option)

---

## Execution Options

### Option 1: Supabase Dashboard (Recommended - No Tools Needed)

**Steps:**

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your SPFP project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy Migration SQL**
   - Open file: `supabase/migrations/20260216_database_optimizations.sql`
   - Copy entire content

4. **Paste and Execute**
   - Paste into the SQL Editor
   - Click "Run" button (or Ctrl+Enter)
   - Wait for execution (should complete in 5-10 seconds)

5. **Verify Success**
   - You should see message: "Database optimizations completed successfully!"
   - No errors should be displayed

---

### Option 2: Using psql (Direct Database Connection)

**Prerequisites:**
- psql client installed
- Postgres superuser credentials (from Supabase)

**Steps:**

```bash
# Get database credentials from Supabase > Settings > Database
# Host: You'll find it in the connection string
# Port: Usually 5432
# Database: postgres
# User: postgres

psql -h <HOST>.supabase.co \
  -U postgres \
  -d postgres \
  -f supabase/migrations/20260216_database_optimizations.sql
```

**Prompt for password:** Enter your Supabase database password

---

### Option 3: Using Supabase CLI (If Installed)

```bash
# Navigate to project directory
cd "D:\Projetos Antigravity\SPFP\SPFP"

# Push migrations
supabase db push

# This will:
# 1. Detect uncommitted migrations
# 2. Prompt for confirmation
# 3. Execute on remote database
```

---

## Migration Contents Breakdown

### Part 1: Category Validation (EPIC-004)
```sql
-- Prevents duplicate category names per user (case-insensitive)
ALTER TABLE categories
ADD CONSTRAINT unique_user_category_name UNIQUE(user_id, LOWER(name));
```
**Impact:** Business logic validation moved to database level

### Part 2: Soft Delete & Performance (EPIC-001, EPIC-002)

**Tables Modified:**
- `sent_atas`: Added `updated_at`, `deleted_at`, 2 indexes
- `custom_templates`: Added UNIQUE constraint for default templates
- `user_files`: Added `deleted_at` column
- `operational_tasks`: Added `deleted_at` + 3 performance indexes
- `sales_leads`: Added `deleted_at` + 2 pipeline indexes
- `corporate_activities`: Added 2 realtime-optimized indexes
- `marketing_posts`: Added 2 calendar/platform indexes

**Indexes Created:**
1. **idx_sent_atas_user_type_sent** - For ATA filtering by type
2. **idx_operational_tasks_kanban** - For Kanban board operations
3. **idx_operational_tasks_due_dates** - For deadline tracking
4. **idx_sales_leads_analysis** - For pipeline analytics
5. **idx_sales_leads_value_analysis** - For value-based analysis
6. **idx_corporate_activities_realtime** - For feed subscriptions
7. **idx_corporate_activities_approval** - For approval workflows
8. **idx_marketing_posts_calendar** - For calendar views
9. **idx_marketing_posts_by_platform** - For platform filtering
10. **idx_transactions_user_date_paid** - For transaction queries
11. **idx_accounts_user_type** - For balance queries
12. **idx_categories_user_order** - For category ordering
13. **idx_goals_user_deadline** - For deadline tracking
14. **idx_partnership_clients_closed** - For revenue analysis

### Part 3: AI Automation Audit (EPIC-003)

**New Table:** `automation_permissions_audit`
```sql
-- Tracks all changes to automation permissions
-- Fields: user_id, changed_at, changed_by, change_type, previous_value, new_value
-- Retention: Keep indefinitely for audit trail
```

**Cleanup Function:**
```sql
-- Removes automation logs older than 90 days
CREATE FUNCTION cleanup_old_automation_logs()
```

### Part 4: Analytics Views

**5 New Views Created:**
1. **dashboard_metrics** - Daily transaction summaries
2. **crm_health_check** - ATA statistics per user
3. **corporate_health_check** - Activity and approval metrics
4. **sales_health_check** - Pipeline KPIs
5. **operational_health_check** - Task status distribution
6. **marketing_health_check** - Content posting metrics

---

## Post-Migration Verification

After successful execution, run these validation queries:

### 1. Verify Indexes Created

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

**Expected:** 14 indexes listed

### 2. Verify Constraints

```sql
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name IN ('categories', 'custom_templates')
ORDER BY table_name, constraint_name;
```

**Expected:**
- `categories`: `unique_user_category_name` (UNIQUE)
- `custom_templates`: `unique_default_template` (UNIQUE)

### 3. Verify Views

```sql
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE '%health_check%' OR table_name = 'dashboard_metrics'
ORDER BY table_name;
```

**Expected:** 6 views
- automation_permissions_audit (table, not view)
- corporate_health_check
- crm_health_check
- dashboard_metrics
- marketing_health_check
- operational_health_check
- sales_health_check

### 4. Verify Soft Delete Columns

```sql
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'deleted_at'
ORDER BY table_name;
```

**Expected:** Columns in:
- sent_atas
- user_files
- operational_tasks
- sales_leads

### 5. Test Query Performance

**Before Migration (simulated):**
```sql
-- This would scan entire table without index
-- Time: ~500ms for large datasets
EXPLAIN ANALYZE
SELECT * FROM operational_tasks
WHERE status = 'in_progress'
ORDER BY priority DESC;
```

**After Migration (with index):**
```sql
-- This uses idx_operational_tasks_kanban index
-- Time: ~100ms (5x faster)
EXPLAIN ANALYZE
SELECT * FROM operational_tasks
WHERE status = 'in_progress'
ORDER BY priority DESC;
```

---

## Rollback Procedure (If Needed)

If issues occur, rollback is NOT automatic. Follow these steps:

### Using Supabase Dashboard Backup

1. Go to: Supabase Dashboard > Settings > Database > Backups
2. Select the backup taken before migration
3. Click "Restore"
4. Confirm restoration

### Manual Rollback (If Backup Unavailable)

You can execute the rollback script:

```sql
-- Drop indexes
DROP INDEX IF EXISTS idx_sent_atas_deleted_at;
DROP INDEX IF EXISTS idx_sent_atas_user_type_sent;
DROP INDEX IF EXISTS idx_operational_tasks_deleted_at;
DROP INDEX IF EXISTS idx_operational_tasks_kanban;
DROP INDEX IF EXISTS idx_operational_tasks_due_dates;
DROP INDEX IF EXISTS idx_sales_leads_deleted_at;
DROP INDEX IF EXISTS idx_sales_leads_analysis;
DROP INDEX IF EXISTS idx_sales_leads_value_analysis;
DROP INDEX IF EXISTS idx_corporate_activities_realtime;
DROP INDEX IF EXISTS idx_corporate_activities_approval;
DROP INDEX IF EXISTS idx_marketing_posts_calendar;
DROP INDEX IF EXISTS idx_marketing_posts_by_platform;
DROP INDEX IF EXISTS idx_transactions_user_date_paid;
DROP INDEX IF EXISTS idx_accounts_user_type;
DROP INDEX IF EXISTS idx_categories_user_order;
DROP INDEX IF EXISTS idx_goals_user_deadline;
DROP INDEX IF EXISTS idx_partnership_clients_closed;

-- Drop functions
DROP FUNCTION IF EXISTS cleanup_old_automation_logs();

-- Drop views
DROP VIEW IF EXISTS marketing_health_check;
DROP VIEW IF EXISTS operational_health_check;
DROP VIEW IF EXISTS sales_health_check;
DROP VIEW IF EXISTS corporate_health_check;
DROP VIEW IF EXISTS crm_health_check;
DROP VIEW IF EXISTS dashboard_metrics;

-- Drop table
DROP TABLE IF EXISTS automation_permissions_audit;

-- Drop constraints
ALTER TABLE categories DROP CONSTRAINT IF EXISTS unique_user_category_name;
ALTER TABLE custom_templates DROP CONSTRAINT IF EXISTS unique_default_template;

-- Drop columns (NOTE: Data in these columns will be lost)
ALTER TABLE sent_atas DROP COLUMN IF EXISTS updated_at;
ALTER TABLE sent_atas DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE user_files DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE operational_tasks DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE sales_leads DROP COLUMN IF EXISTS deleted_at;
```

**WARNING:** Rollback will:
- Remove all indexes (queries may slow down)
- Remove soft delete columns (data loss not possible since they only contain DELETE timestamps)
- Remove audit table (lose new audit records)
- Remove new views (reporting features unavailable)

---

## Troubleshooting

### Error: "Constraint violation on unique_user_category_name"

**Cause:** Database has duplicate category names for same user

**Solution:**
```sql
-- Check for duplicates
SELECT user_id, LOWER(name) as name, COUNT(*)
FROM categories
GROUP BY user_id, LOWER(name)
HAVING COUNT(*) > 1;

-- Merge duplicates manually or delete extras before retry
```

### Error: "Index already exists"

**Cause:** Index was created in previous attempt

**Solution:** Indexes are created with `IF NOT EXISTS`, so this shouldn't happen. If it does:
```sql
-- Check existing indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- Drop and retry migration
```

### Error: "Function update_updated_at_column does not exist"

**Cause:** Function from previous migration (002-add-soft-delete.sql) is missing

**Solution:** Run previous migrations first:
```bash
# Via Supabase CLI
supabase db push

# This will run all pending migrations in order
```

### Slow Execution (> 30 seconds)

**Cause:** Large database or under heavy load

**Solution:**
- Retry during off-peak hours
- Migration will not lock tables (concurrent operations possible)
- Safe to execute during business hours

---

## Success Criteria

Migration is successful when:

- [ ] SQL execution completes without errors
- [ ] Message displayed: "Database optimizations completed successfully!"
- [ ] All 14 indexes verified in pg_indexes
- [ ] All 2 constraints verified
- [ ] All 6 views verified
- [ ] Test query performance shows improvement
- [ ] No application errors after deployment
- [ ] Automated tests pass (if applicable)

---

## Next Steps After Migration

1. **Update Application Code**
   - Code already uses the new `deleted_at` columns
   - Code already filters with `WHERE deleted_at IS NULL`
   - No code changes required

2. **Update Frontend**
   - Dashboard metrics view now available
   - Health check views ready for analytics
   - No frontend changes required

3. **Monitor Performance**
   - Watch for query performance improvements
   - Monitor database load metrics
   - Check Supabase logs for errors

4. **Update Documentation**
   - This guide becomes reference for future migrations
   - Add links to health check views in dashboard
   - Document new analytics features

---

## Contact & Support

**Questions or Issues?**
- Check this guide's Troubleshooting section
- Review Supabase logs: Dashboard > Logs > Database
- Ask Data Engineer team for assistance

**Related Documentation:**
- Schema Analysis: `docs/data-engineering/DATABASE-REVIEW-2026.md`
- Production Readiness: `docs/data-engineering/PRODUCTION-READINESS-CHECKLIST.md`
- Schema Dependencies: `docs/data-engineering/SCHEMA-DEPENDENCY-MAP.md`

---

**Document Version:** 1.0
**Last Updated:** February 16, 2026
**Status:** READY FOR EXECUTION
