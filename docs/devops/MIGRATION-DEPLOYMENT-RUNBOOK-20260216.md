# SPFP Migration Deployment Runbook - 20260216
## Database Optimizations - Step-by-Step Execution Guide

**Document Version:** 1.0
**Created:** 2026-02-16
**Last Updated:** 2026-02-16
**Owner:** Gage (DevOps Engineer)
**Status:** READY FOR DEPLOYMENT

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Instructions](#deployment-instructions)
3. [Post-Deployment Validation](#post-deployment-validation)
4. [Monitoring & Rollback](#monitoring--rollback)
5. [Handoff & Documentation](#handoff--documentation)

---

## Pre-Deployment Checklist

### Phase 1: Verification (5 minutes)

- [ ] **Verify Migration File Exists**
  ```bash
  ls -lah supabase/migrations/20260216_database_optimizations.sql
  ```
  Expected: File size ~12 KB

- [ ] **Verify Validation Script Exists**
  ```bash
  ls -lah supabase/migrations/20260216_validate_optimizations.sql
  ```
  Expected: File size ~7 KB

- [ ] **Check Git Status** (Ensure clean working directory)
  ```bash
  cd "D:\Projetos Antigravity\SPFP\SPFP"
  git status
  ```
  Expected: Only `.gitignore` and `.mcp.json` modified, docs files untracked

- [ ] **Verify Supabase Access**
  - Navigate to https://app.supabase.com
  - Confirm you can login
  - Confirm you can access SPFP project
  - Go to SQL Editor - confirm access

### Phase 2: Backup (10 minutes)

- [ ] **Request Database Backup** (Required)
  1. Go to Supabase Dashboard
  2. Select SPFP Project
  3. Settings → Backups
  4. Click "Request backup"
  5. Wait for email confirmation
  6. Document backup ID: _______________

### Phase 3: Notifications (5 minutes)

- [ ] **Notify Team** (if production environment)
  - Slack: #devops-deployment
  - Email: engineering@example.com
  - Message: "Starting SPFP database migration 20260216 - ETA 5 minutes, no downtime expected"

- [ ] **Check Low-Traffic Window**
  - Confirm current time is outside peak usage hours
  - No ongoing user sessions (preferred)
  - Documentation: Confirmed at _______________

### Phase 4: Pre-Flight (2 minutes)

- [ ] **Final Verification**
  - [ ] All previous checks passed
  - [ ] Team notified
  - [ ] Database backup confirmed
  - [ ] No production incidents active
  - [ ] Rollback plan reviewed and understood

**Pre-Deployment Status:** ✅ APPROVED / ❌ BLOCKED

---

## Deployment Instructions

### Step 1: Access Supabase Dashboard

**Time:** 1 minute

1. Open https://app.supabase.com in your browser
2. Login with your Supabase credentials
3. Select the SPFP project from the project list
4. You should see the project dashboard

**Verification:**
- [ ] Dashboard loads successfully
- [ ] You can see the project name: "SPFP" (or similar)

---

### Step 2: Open SQL Editor

**Time:** 1 minute

1. On the left sidebar, click **SQL Editor**
2. In the SQL Editor panel, click the **+** or **New Query** button
3. A new empty SQL editor window opens

**Verification:**
- [ ] SQL Editor is visible with empty text area
- [ ] You can see line numbers on the left
- [ ] Run button (▶) is visible at the top right

---

### Step 3: Load Migration SQL

**Time:** 2 minutes

1. Open this file in your text editor:
   ```
   supabase/migrations/20260216_database_optimizations.sql
   ```

2. Select all contents (Ctrl+A)

3. Copy to clipboard (Ctrl+C)

4. Click in the Supabase SQL Editor text area

5. Paste the contents (Ctrl+V)

6. Verify the SQL is present:
   - First line should be: `-- ============================================`
   - Last line should be: `COMMIT;`
   - Total lines should be ~259

**Verification:**
- [ ] SQL content is visible in editor
- [ ] No syntax highlighting errors (red underlines)
- [ ] File size indicator shows: ~12 KB or similar

---

### Step 4: Execute Migration

**Time:** 30-60 seconds

1. Click the **Run** button (▶) in the top right of the SQL Editor
   - OR press **Ctrl+Enter**

2. Wait for execution to complete

3. Watch the status at the bottom of the screen:
   - Yellow spinner appears (execution in progress)
   - Should complete within 30-60 seconds
   - Final message: `Database optimizations completed successfully!`

**Expected Output:**

```
Database optimizations completed successfully! | 1 row
```

**Verification:**
- [ ] Migration completed without errors
- [ ] "Database optimizations completed successfully!" message appears
- [ ] No error messages in red
- [ ] Execution time recorded: _____ seconds

**If Migration Fails:**
- [ ] Document the error message: _____________________________________________
- [ ] Do NOT execute rollback (consult with team first)
- [ ] Go to: [Error Recovery - Troubleshooting Section](#troubleshooting)

---

### Step 5: Quick Health Check

**Time:** 2 minutes

Now verify the migration succeeded with a quick query:

1. In the same SQL Editor (or new query), run:

```sql
-- Quick Health Check for Migration 20260216
SELECT
  'Indexes' as check_type,
  COUNT(*)::text as count_found,
  '14' as expected
FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
UNION ALL
SELECT 'Constraints', COUNT(*)::text, '2'
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND constraint_name LIKE 'unique_%'
UNION ALL
SELECT 'Views', COUNT(*)::text, '6'
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'VIEW' AND table_name LIKE '%health_check%'
UNION ALL
SELECT 'Soft Delete Columns', COUNT(*)::text, '5'
FROM information_schema.columns
WHERE table_schema = 'public' AND column_name = 'deleted_at';
```

2. Review results:
   - Indexes: Should be ≥ 14
   - Constraints: Should be ≥ 2
   - Views: Should be = 6
   - Soft Delete Columns: Should be = 5

**Verification:**
- [ ] Indexes count: ____ (expected: ≥14)
- [ ] Constraints count: ____ (expected: ≥2)
- [ ] Views count: ____ (expected: 6)
- [ ] Soft Delete Columns: ____ (expected: 5)

---

## Post-Deployment Validation

### Phase 1: Immediate Validation (5 minutes)

After migration completes, run the full validation script:

1. Open the validation file:
   ```
   supabase/migrations/20260216_validate_optimizations.sql
   ```

2. Copy all contents to clipboard

3. In Supabase SQL Editor, create a new query and paste

4. Execute each validation section one by one:
   - Run section "1. VERIFY INDEXES CREATED"
   - Run section "2. VERIFY CONSTRAINTS CREATED"
   - Run section "3. VERIFY COLUMNS ADDED"
   - Run section "4. VERIFY VIEWS CREATED"
   - Run section "5. VERIFY AUDIT TABLE CREATED"

5. Document results in table below:

| Section | Status | Notes |
|---------|--------|-------|
| Indexes | ✅ / ⚠️ / ❌ | ____________________ |
| Constraints | ✅ / ⚠️ / ❌ | ____________________ |
| Soft Delete Columns | ✅ / ⚠️ / ❌ | ____________________ |
| Views | ✅ / ⚠️ / ❌ | ____________________ |
| Audit Table | ✅ / ⚠️ / ❌ | ____________________ |

### Phase 2: Performance Validation (5 minutes)

Test the new indexes with actual queries:

1. Run Kanban board performance test:

```sql
EXPLAIN ANALYZE
SELECT id, title, status, priority, position
FROM operational_tasks
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
  AND status = 'in_progress'
  AND deleted_at IS NULL
ORDER BY priority DESC
LIMIT 10;
```

Expected: Uses `idx_operational_tasks_kanban` index (shows "Index Scan" in plan)
Execution time: < 50ms

Actual execution time: _____ ms

2. Run transaction history performance test:

```sql
EXPLAIN ANALYZE
SELECT id, description, amount, date, type
FROM transactions
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
  AND DATE(date) >= CURRENT_DATE - INTERVAL '90 days'
  AND deleted_at IS NULL
ORDER BY date DESC
LIMIT 100;
```

Expected: Uses `idx_transactions_user_date_paid` index
Execution time: < 50ms

Actual execution time: _____ ms

### Phase 3: Data Integrity Check (3 minutes)

Verify no data was corrupted:

```sql
-- Check for any constraint violations
SELECT
  'Categories' as table_name,
  COUNT(*) as duplicate_count
FROM categories
WHERE deleted_at IS NULL
GROUP BY user_id, LOWER(name)
HAVING COUNT(*) > 1
UNION ALL
SELECT 'Templates',
  COUNT(*)
FROM custom_templates
WHERE is_default = true
GROUP BY user_id, type
HAVING COUNT(*) > 1;
```

Expected: No results (0 rows)
Actual results: ____ rows

**Status:** ✅ PASSED / ⚠️ WARNING / ❌ FAILED

---

## Monitoring & Rollback

### Monitoring (First 24 Hours)

- [ ] Monitor query performance in Supabase dashboard
- [ ] Check slow query logs for any issues
- [ ] Monitor application logs for errors
- [ ] Monitor database CPU/Memory usage
- [ ] Confirm no user-facing issues reported

### Rollback Procedure (If Needed)

**ONLY perform rollback if critical issues occur and approved by tech lead**

1. Create a new query in Supabase SQL Editor

2. Paste the rollback commands:

```sql
-- Rollback: Drop all new indexes (safe, no data loss)
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
DROP INDEX IF EXISTS idx_categories_user_order;

-- Drop constraints
ALTER TABLE categories DROP CONSTRAINT IF EXISTS unique_user_category_name;
ALTER TABLE custom_templates DROP CONSTRAINT IF EXISTS unique_default_template;

-- Drop views
DROP VIEW IF EXISTS dashboard_metrics;
DROP VIEW IF EXISTS crm_health_check;
DROP VIEW IF EXISTS corporate_health_check;
DROP VIEW IF EXISTS sales_health_check;
DROP VIEW IF EXISTS operational_health_check;
DROP VIEW IF EXISTS marketing_health_check;

-- Drop audit table
DROP TABLE IF EXISTS automation_permissions_audit;
```

3. Execute rollback query

4. Verify rollback success:
```sql
SELECT
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_20260216_%') as remaining_indexes,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'automation_permissions_audit') as audit_table_exists;
```

Expected: Both values should be 0 (zero)

---

## Handoff & Documentation

### Final Status Report

Complete this section after successful deployment:

**Migration ID:** `20260216_database_optimizations.sql`
**Deployment Date:** _____________
**Deployment Time:** _____________ (HH:MM UTC)
**Execution Duration:** _____________ seconds
**Status:** ✅ SUCCESS / ⚠️ WARNING / ❌ FAILED

### Deployment Sign-Off

- **Deployed By:** _________________________ (Name/Initial)
- **Verified By:** _________________________ (Name/Initial)
- **Approved By:** _________________________ (Name/Initial)
- **Date:** _____________

### Documented Issues

If any issues occurred during deployment:

| Issue | Severity | Resolution | Status |
|-------|----------|-----------|--------|
| | | | |
| | | | |

### Notifications

- [ ] Team notified of successful deployment (Slack #devops-deployment)
- [ ] Documentation updated in docs/deployment/
- [ ] Git repository updated with handoff notes
- [ ] Engineering team notified of available features

### Next Steps for Development Team

1. **Update Application Code:**
   - Add `WHERE deleted_at IS NULL` filters to all queries
   - Use new analytical views in dashboard widgets
   - Implement soft-delete in transaction deletion flows

2. **Implement Audit Trail:**
   - Create audit history viewer in admin panel
   - Use `automation_permissions_audit` table

3. **Schedule Maintenance Task:**
   - Set up cron job for `cleanup_old_automation_logs()`
   - Suggested schedule: Daily at 2 AM UTC
   - Command: `SELECT cron.schedule('cleanup-logs', '0 2 * * *', 'SELECT cleanup_old_automation_logs()');`

4. **Monitor Performance:**
   - Track query performance for 24-48 hours
   - Document any performance regressions
   - Compare with baseline numbers from pre-migration

---

## Troubleshooting

### Issue: Migration Timeout

**Symptom:** Execution takes > 5 minutes or times out

**Cause:** Large data volume or slow database connection

**Resolution:**
1. Check database resource usage (CPU, Memory) in Supabase dashboard
2. Try during off-peak hours (late evening / early morning)
3. Contact Supabase support if timeouts persist

### Issue: Constraint Violation Error

**Symptom:** Error: "Constraint violation: duplicate category name"

**Cause:** Duplicate category names exist in data

**Resolution:**
1. Find duplicates:
```sql
SELECT user_id, LOWER(name), COUNT(*)
FROM categories
GROUP BY user_id, LOWER(name)
HAVING COUNT(*) > 1;
```

2. Manually merge duplicates (update transactions to point to single category)
3. Delete duplicate category records
4. Retry migration

### Issue: Index Already Exists Error

**Symptom:** Error: "Relation 'idx_*' already exists"

**Cause:** Migration was partially executed before

**Resolution:**
- Migration is idempotent (uses `CREATE INDEX IF NOT EXISTS`)
- Safe to re-run
- All indexes should use `IF NOT EXISTS` clause

### Issue: Function Not Found Error

**Symptom:** Error: "Function 'update_updated_at_column' not found"

**Cause:** Function not created in previous migration

**Resolution:**
1. Create the function manually:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';
```

2. Retry migration

### Issue: Permission Denied Error

**Symptom:** Error: "Permission denied for schema public"

**Cause:** Insufficient database permissions

**Resolution:**
1. Use Supabase dashboard (automatically has correct permissions)
2. OR use service role key (not anon key) for CLI
3. Verify user has `CREATEDB` and `CREATEROLE` permissions

---

## Additional Resources

**Migration Files:**
- Migration: `supabase/migrations/20260216_database_optimizations.sql`
- Validation: `supabase/migrations/20260216_validate_optimizations.sql`

**Documentation:**
- Execution Guide: `docs/data-engineering/MIGRATION-EXECUTION-GUIDE-20260216.md`
- Quick Execute: `docs/data-engineering/QUICK-EXECUTE-20260216.md`
- Technical Analysis: `docs/data-engineering/TECHNICAL-ANALYSIS-20260216.md`

**Related Epics:**
- EPIC-004: Core Fixes - Category Validation
- EPIC-001: CRM v2 - Soft Delete & Performance
- EPIC-002: Corporate HQ - Soft Delete & Performance
- EPIC-003: AI Automation - Retention & Audit

---

## Contact & Support

**Primary Contact:** Gage (DevOps Engineer)
**Slack:** @gage or #devops-deployment
**On-Call:** [Your escalation contact]
**Email:** devops@example.com

For critical issues during deployment:
1. Document the error message
2. Screenshot the error
3. Do NOT attempt unsanctioned rollback
4. Contact DevOps lead immediately
5. Have backup ID ready (from pre-deployment phase)

---

**Document Status:** ✅ READY FOR DEPLOYMENT
**Last Updated:** 2026-02-16
**Version:** 1.0

---

END OF RUNBOOK
