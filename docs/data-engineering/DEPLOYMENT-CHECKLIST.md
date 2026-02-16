# Migration Deployment Checklist

**Migration:** 20260216_database_optimizations.sql
**Date:** February 16, 2026
**Executor:** [Your Name]
**Execution Date:** [Fill in]
**Execution Time:** [Fill in]

---

## Phase 1: Pre-Deployment (5 minutes)

### Documentation Review

- [ ] Read Executive Summary: `MIGRATION-SUMMARY.md`
- [ ] Read Execution Guide: `MIGRATION-EXECUTION-GUIDE.md`
- [ ] Understand what migration does
- [ ] Understand rollback procedure
- [ ] Team member confirmed as available for support

### Environment Verification

- [ ] Supabase project accessible: https://app.supabase.com
- [ ] Have database credentials ready (or use Dashboard)
- [ ] Network connectivity tested
- [ ] No other migrations running
- [ ] Database is healthy (no warnings in Supabase)

### Backup Creation

- [ ] Logged into Supabase Dashboard
- [ ] Navigated to: Settings → Database → Backups
- [ ] Created backup manually (point-in-time)
- [ ] Backup status shows "Completed"
- [ ] Backup timestamp noted: _______________
- [ ] Can see how to restore from this backup

### Team Communication

- [ ] Team notified of deployment window
- [ ] Maintenance window (if any) is acceptable
- [ ] Support person available (N/A for low-risk migration)
- [ ] No critical operations scheduled

---

## Phase 2: Execution (10 minutes)

### Preparation

- [ ] Copy migration SQL file
- [ ] File location: `supabase/migrations/20260216_database_optimizations.sql`
- [ ] Verified file contains BEGIN and COMMIT
- [ ] Verified file contains success message
- [ ] File has no syntax errors (manually review)

### Execution via Supabase Dashboard

- [ ] Opened https://app.supabase.com
- [ ] Selected SPFP project
- [ ] Clicked "SQL Editor" in sidebar
- [ ] Clicked "New Query" button
- [ ] Pasted migration SQL into editor
- [ ] Reviewed SQL code before execution
- [ ] Clicked "Run" button
- [ ] Received success message: "Database optimizations completed successfully!"

### Timing Record

- [ ] Start time recorded: _______________
- [ ] Execution completed: _______________
- [ ] Total execution time: _____ seconds (expected: 5-10)
- [ ] No timeout occurred

### Error Handling

- [ ] No errors displayed
- [ ] No warnings displayed
- [ ] If errors occurred, documented them: _______________
- [ ] If errors, attempted recovery or contacted support

---

## Phase 3: Immediate Validation (5 minutes)

### Quick Verification Queries

**Query 1: Index Count**

```sql
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';
```

- [ ] Query executed
- [ ] Result: _______ (expected: 14)
- [ ] Status: [ ] PASS [ ] FAIL

**Query 2: View Count**

```sql
SELECT COUNT(*) as view_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'VIEW'
AND (table_name LIKE '%health_check%' OR table_name = 'dashboard_metrics');
```

- [ ] Query executed
- [ ] Result: _______ (expected: 6)
- [ ] Status: [ ] PASS [ ] FAIL

**Query 3: Constraint Count**

```sql
SELECT COUNT(*) as constraint_count
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND constraint_name LIKE 'unique_%';
```

- [ ] Query executed
- [ ] Result: _______ (expected: 2)
- [ ] Status: [ ] PASS [ ] FAIL

**Query 4: Soft Delete Columns**

```sql
SELECT COUNT(*) as deleted_at_count
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name = 'deleted_at';
```

- [ ] Query executed
- [ ] Result: _______ (expected: 4)
- [ ] Status: [ ] PASS [ ] FAIL

### Quick Validation Summary

- [ ] All 4 quick checks PASSED
- [ ] No unexpected errors in logs
- [ ] Application is responsive
- [ ] Ready for full validation

---

## Phase 4: Full Validation (10 minutes)

### Run Complete Validation Script

**File:** `supabase/migrations/20260216_validate_optimizations.sql`

- [ ] Opened new SQL query in Supabase
- [ ] Copied validation script
- [ ] Executed validation script
- [ ] Script completed without errors

### Review Validation Results

#### Indexes Validation
- [ ] All 14 indexes listed
- [ ] Index names match expected names
- [ ] No unexpected indexes created

#### Constraints Validation
- [ ] `unique_user_category_name` constraint visible
- [ ] `unique_default_template` constraint visible
- [ ] Constraints on correct tables

#### Soft Delete Columns Validation
- [ ] `deleted_at` columns in 4 tables
- [ ] Columns have correct data type (TIMESTAMPTZ)
- [ ] No unexpected columns added

#### Views Validation
- [ ] All 6 views listed
- [ ] View names correct:
  - [ ] dashboard_metrics
  - [ ] crm_health_check
  - [ ] corporate_health_check
  - [ ] sales_health_check
  - [ ] operational_health_check
  - [ ] marketing_health_check

#### Audit Table Validation
- [ ] `automation_permissions_audit` table exists
- [ ] Table has all expected columns
- [ ] RLS policies applied

#### Functions Validation
- [ ] `cleanup_old_automation_logs` function exists
- [ ] Function is executable

#### Data Integrity Validation
- [ ] No duplicate category names per user
- [ ] No null values in unexpected columns
- [ ] Soft-deleted records properly marked

#### Index Usage Statistics
- [ ] Index statistics retrieved
- [ ] Index sizes are reasonable
- [ ] Indexes are accessible

---

## Phase 5: Performance Validation (5 minutes)

### Performance Test

**Query:** Test Kanban index performance

```sql
EXPLAIN ANALYZE
SELECT id, title, status, priority, position
FROM operational_tasks
WHERE status = 'in_progress'
AND deleted_at IS NULL
ORDER BY priority DESC
LIMIT 10;
```

- [ ] Query executed
- [ ] Execution plan reviewed
- [ ] Index used: [ ] YES [ ] NO
- [ ] Execution time: _______ ms (should be < 200ms)
- [ ] Status: [ ] PASS [ ] FAIL

**Expected:** Index Scan (not Seq Scan), ~100ms execution time

### Optional: More Performance Tests

- [ ] Transaction filtering test
- [ ] Sales pipeline test
- [ ] Calendar view test

---

## Phase 6: Application Verification (10 minutes)

### Application Health

- [ ] Application is still running
- [ ] No critical errors in logs
- [ ] Dashboard loads normally
- [ ] No unexpected delays
- [ ] Can view transactions
- [ ] Can view tasks/Kanban
- [ ] Can view sales pipeline

### Feature Testing (Optional)

- [ ] Category creation works
- [ ] Duplicate category prevention works (if applicable)
- [ ] Soft delete doesn't affect user workflows
- [ ] New views accessible via analytics (if implemented)

### Integration Testing

- [ ] No API errors
- [ ] Database queries perform well
- [ ] Real-time sync working (if enabled)
- [ ] No connection issues

---

## Phase 7: Documentation & Sign-Off (5 minutes)

### Record Execution Details

- [ ] Execution Date: _______________
- [ ] Execution Time: _______________
- [ ] Executor Name: _______________
- [ ] Total Duration: _____ minutes
- [ ] Status: [ ] SUCCESS [ ] PARTIAL [ ] FAILED

### Document Any Issues

If issues occurred:

- [ ] Issue documented: _______________
- [ ] Resolution attempted: _______________
- [ ] Escalation required: [ ] YES [ ] NO
- [ ] Issue resolved: [ ] YES [ ] NO

### Update Tracking

- [ ] Git commit created (if needed)
- [ ] Deployment tracked in issue management
- [ ] Team updated in Slack/email
- [ ] Documentation updated if needed

### Archive Records

- [ ] This checklist saved and dated
- [ ] Migration execution time recorded
- [ ] Performance baseline established
- [ ] Archive location: `docs/data-engineering/deployments/`

---

## Phase 8: Post-Deployment Monitoring (24 hours)

### Day 1 Monitoring

- [ ] Check error logs every hour
- [ ] Monitor database performance
- [ ] Review index usage statistics
- [ ] Check application performance
- [ ] Monitor user reports

### Ongoing Monitoring

- [ ] Set up alerts for slow queries
- [ ] Review index usage weekly
- [ ] Check disk space usage
- [ ] Monitor backup success
- [ ] Document any issues

---

## Rollback Procedure (If Needed)

### Decision to Rollback

Only rollback if:
- Critical errors prevent application function
- Data integrity issues detected
- Severe performance degradation
- Constraint violations discovered

### Rollback Steps

1. [ ] Backup current database (in case we need it)
2. [ ] Go to: Supabase Dashboard → Settings → Database → Backups
3. [ ] Select backup from before migration
4. [ ] Click "Restore"
5. [ ] Confirm restoration
6. [ ] Wait 5-10 minutes for restore to complete
7. [ ] Verify application recovered
8. [ ] Document rollback reason

### Post-Rollback

- [ ] Application verified as working
- [ ] Team notified of rollback
- [ ] Root cause analysis started
- [ ] New migration plan created
- [ ] Document saved to rollback records

---

## Success Criteria Summary

Migration is successful when:

- [ ] All 14 indexes created and verified
- [ ] All 2 constraints created and verified
- [ ] All 6 views created and verified
- [ ] All soft delete columns added
- [ ] Audit table created
- [ ] Functions created
- [ ] Data integrity verified
- [ ] Performance improved (index scans used)
- [ ] Application running normally
- [ ] No critical errors
- [ ] Team confirmed success

---

## Final Approval

### Self Sign-Off

**Executor:** ___________________
**Date:** ___________________
**Approval:** [ ] ALL PASSED [ ] ISSUES FOUND

### Approval Notes

```
[Write any notes about execution, issues, or observations]

```

---

## Contact Information

**Questions during deployment?**
- Data Engineer: Nova (@data-engineer)
- DevOps: Gage (@devops)
- Architect: Aria (@architect)

**Emergency Contact:** [Contact info]

---

**Checklist Version:** 1.0
**Status:** READY FOR USE
**Last Updated:** February 16, 2026

---

## Appendix: Quick Reference Links

- Migration File: `supabase/migrations/20260216_database_optimizations.sql`
- Validation Script: `supabase/migrations/20260216_validate_optimizations.sql`
- Execution Guide: `docs/data-engineering/MIGRATION-EXECUTION-GUIDE.md`
- Full Report: `docs/data-engineering/MIGRATION-EXECUTION-REPORT.md`
- Executive Summary: `docs/data-engineering/MIGRATION-SUMMARY.md`
- Schema Analysis: `docs/data-engineering/DATABASE-REVIEW-2026.md`
- Production Readiness: `docs/data-engineering/PRODUCTION-READINESS-CHECKLIST.md`

---

**End of Checklist**
