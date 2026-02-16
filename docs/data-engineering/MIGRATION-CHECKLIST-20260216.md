# SPFP Database Migration - Pre & Post Execution Checklist

**Migration ID:** `20260216_database_optimizations.sql`
**Date:** 2026-02-16

---

## Pre-Execution Checklist

### Database Preparation ✅

- [ ] **Full backup created**
  - [ ] Backup verified in Supabase Dashboard
  - [ ] Backup is recent (within 24 hours)
  - [ ] Backup size noted: _______ GB
  - [ ] Backup download tested (optional)

- [ ] **Disk space verified**
  - [ ] Available space: _________ GB (need 500MB+)
  - [ ] Index growth estimated: 45-60 MB
  - [ ] Safe to proceed: YES / NO

- [ ] **Database connections checked**
  - [ ] Current connections: _________ (< 50 preferred)
  - [ ] Long-running transactions: _________ (should be 0)
  - [ ] Maintenance mode available: YES / NO

- [ ] **Performance baseline recorded**
  ```
  Before Migration Metrics:
  - Kanban query time: _________ ms
  - Sales pipeline query time: _________ ms
  - Transaction history query time: _________ ms
  - General database load: LOW / MEDIUM / HIGH
  ```

### Data Validation ✅

- [ ] **Category duplicates checked**
  ```sql
  SELECT user_id, LOWER(name), COUNT(*)
  FROM categories
  GROUP BY user_id, LOWER(name)
  HAVING COUNT(*) > 1;
  ```
  - [ ] Result: _________ duplicate(s) found
  - [ ] Action: _________ (describe fix or mark "none found")

- [ ] **Default template duplicates checked**
  ```sql
  SELECT user_id, type, COUNT(*)
  FROM custom_templates
  WHERE is_default = true
  GROUP BY user_id, type
  HAVING COUNT(*) > 1;
  ```
  - [ ] Result: _________ duplicate(s) found
  - [ ] Action: _________ (describe fix or mark "none found")

- [ ] **Null category names checked**
  ```sql
  SELECT COUNT(*) FROM categories WHERE name IS NULL;
  ```
  - [ ] Result: _________ rows with NULL names
  - [ ] Action: _________ (fix or confirm acceptable)

- [ ] **update_updated_at_column() function exists**
  ```sql
  SELECT EXISTS(
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  );
  ```
  - [ ] Result: TRUE / FALSE
  - [ ] If FALSE: Create function before migration

### Stakeholder Communication ✅

- [ ] **DevOps notified**
  - [ ] Slack message sent: [ ] YES
  - [ ] Email sent: [ ] YES
  - [ ] Meeting scheduled: [ ] YES (if major)

- [ ] **Backend team notified**
  - [ ] New soft-delete requirements explained
  - [ ] Code changes discussed
  - [ ] Implementation timeline set

- [ ] **Users informed (if needed)**
  - [ ] Announcement posted: [ ] YES
  - [ ] Expected downtime: 0 minutes (online operation)
  - [ ] Expected slowdown: 2-5 seconds during index creation

### Execution Preparation ✅

- [ ] **Migration file location verified**
  - [ ] File path: `supabase/migrations/20260216_database_optimizations.sql`
  - [ ] File size: _________ bytes (should be ~7-8 KB)
  - [ ] File checksum verified: [ ] YES (optional)

- [ ] **Validation script prepared**
  - [ ] File path: `supabase/migrations/20260216_validate_optimizations.sql`
  - [ ] File reviewed: [ ] YES
  - [ ] Test queries verified: [ ] YES

- [ ] **Execution method chosen**
  - [ ] Method: _________ (Dashboard / CLI / psql / Other)
  - [ ] Credentials verified: [ ] YES
  - [ ] Network connectivity tested: [ ] YES

- [ ] **Rollback plan ready**
  - [ ] Rollback script location: `docs/data-engineering/MIGRATION-EXECUTION-GUIDE-20260216.md`
  - [ ] Rollback procedure reviewed: [ ] YES
  - [ ] Time estimate to rollback: _________ minutes
  - [ ] Owner assigned: _________

---

## Execution Phase

### Pre-Execution (Day-Of)

- [ ] **Final validation pass**
  - [ ] All pre-execution checklist items completed
  - [ ] Backup confirmed: _________ (timestamp)
  - [ ] Team on standby: [ ] YES
  - [ ] Monitoring tools active: [ ] YES

- [ ] **Communication sent**
  - [ ] "Migration starting in 10 minutes" message sent
  - [ ] Slack channel: _________
  - [ ] Distribution: [ ] #engineering [ ] #ops [ ] @stakeholders

- [ ] **Monitoring started**
  - [ ] Database monitoring tool active
  - [ ] Application logs monitored
  - [ ] Error tracking active (Sentry, DataDog, etc.)
  - [ ] Performance monitoring active

### Migration Execution

- [ ] **Migration started**
  - [ ] Start time: _________
  - [ ] Method used: _________
  - [ ] Executed by: _________

- [ ] **Migration completed**
  - [ ] End time: _________
  - [ ] Total duration: _________ seconds
  - [ ] Result: SUCCESS / FAILURE
  - [ ] Error message (if failed): _________

- [ ] **Initial observations**
  - [ ] System responsive: YES / NO
  - [ ] Database queries normal: YES / NO / SLOW
  - [ ] No unusual errors in logs: YES / NO
  - [ ] Application features working: YES / NO

---

## Post-Execution Validation

### Quick Validation (5 minutes)

- [ ] **Index creation verified**
  ```sql
  SELECT COUNT(*) FROM pg_indexes
  WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
  ```
  - [ ] Expected: 14+
  - [ ] Actual: _________

- [ ] **Constraints verified**
  ```sql
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = 'public' AND constraint_name LIKE 'unique_%';
  ```
  - [ ] Expected: 2
  - [ ] Actual: _________

- [ ] **Columns verified**
  ```sql
  SELECT COUNT(DISTINCT table_name) FROM information_schema.columns
  WHERE table_schema = 'public' AND column_name = 'deleted_at';
  ```
  - [ ] Expected: 5
  - [ ] Actual: _________

- [ ] **Views verified**
  ```sql
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'VIEW'
    AND table_name LIKE '%health_check%' OR table_name = 'dashboard_metrics';
  ```
  - [ ] Expected: 6
  - [ ] Actual: _________

### Comprehensive Validation (30 minutes)

- [ ] **Run full validation script**
  - [ ] Script location: `supabase/migrations/20260216_validate_optimizations.sql`
  - [ ] All 12 sections completed: [ ] YES
  - [ ] All checks passed: [ ] YES
  - [ ] Issues found: [ ] NONE / [ ] _________ (describe)

- [ ] **Soft delete functionality tested**
  ```sql
  -- Test soft delete on sent_atas
  UPDATE sent_atas SET deleted_at = NOW() WHERE id = 'test-id' LIMIT 1;
  SELECT COUNT(*) FROM sent_atas WHERE deleted_at IS NOT NULL;
  ```
  - [ ] Soft delete works: YES / NO
  - [ ] Rows affected: _________

- [ ] **Index usage verified**
  ```sql
  SELECT indexname, idx_scan FROM pg_stat_user_indexes
  WHERE indexname LIKE 'idx_%' AND idx_scan > 0;
  ```
  - [ ] Indexes being used: [ ] YES
  - [ ] Active indexes: _________ (count)
  - [ ] Unused indexes: _________ (count)

- [ ] **Performance improved**
  - [ ] Kanban query: _________ ms (before: _________ ms)
  - [ ] Sales pipeline query: _________ ms (before: _________ ms)
  - [ ] Transaction history: _________ ms (before: _________ ms)
  - [ ] Overall improvement: _________ % faster

### Data Integrity Checks

- [ ] **No data corruption detected**
  - [ ] Transaction count unchanged: _________ (expected count)
  - [ ] Account count unchanged: _________
  - [ ] User count unchanged: _________
  - [ ] All checksums match: [ ] YES

- [ ] **Constraint enforcement verified**
  ```sql
  -- Test unique_user_category_name
  INSERT INTO categories (user_id, name) VALUES ('uuid', 'Duplicate Test');
  -- Should reject if category with same LOWER(name) exists
  ```
  - [ ] Constraint enforced: YES / NO

- [ ] **Soft delete filtering works**
  - [ ] Queries with IS NULL filter working: YES / NO
  - [ ] Soft-deleted records excluded: YES / NO
  - [ ] Restore functionality ready: YES / NO

### Application Testing

- [ ] **Dashboard loads correctly**
  - [ ] Page load time: _________ ms
  - [ ] Metrics displayed: [ ] YES
  - [ ] Charts render correctly: [ ] YES
  - [ ] No console errors: [ ] YES

- [ ] **Kanban board loads correctly**
  - [ ] Page load time: _________ ms
  - [ ] Task filtering: [ ] YES
  - [ ] Drag-and-drop: [ ] YES
  - [ ] Status updates: [ ] YES

- [ ] **Sales pipeline loads correctly**
  - [ ] Page load time: _________ ms
  - [ ] Leads displayed: [ ] YES
  - [ ] Stage filtering: [ ] YES
  - [ ] Value calculations: [ ] YES

- [ ] **Transaction history loads correctly**
  - [ ] Page load time: _________ ms
  - [ ] Transactions displayed: [ ] YES
  - [ ] Date range filtering: [ ] YES
  - [ ] Soft-deleted excluded: [ ] YES

### Integration Testing

- [ ] **API endpoints tested**
  - [ ] GET /operational_tasks: _________ ms
  - [ ] GET /sales_leads: _________ ms
  - [ ] GET /transactions: _________ ms
  - [ ] All returning correct data: [ ] YES

- [ ] **Real-time subscriptions tested**
  - [ ] Supabase realtime subscriptions active: [ ] YES
  - [ ] Updates received in real-time: [ ] YES
  - [ ] No connection drops: [ ] YES

- [ ] **Background jobs tested**
  - [ ] Automation logs: [ ] Running
  - [ ] Scheduled tasks: [ ] Running
  - [ ] Cleanup function ready: [ ] YES (manual scheduling needed)

---

## Post-Execution Cleanup

### Documentation Updates

- [ ] **Update API documentation**
  - [ ] New soft-delete behavior documented
  - [ ] New views documented
  - [ ] Query examples updated
  - [ ] File: _________ (path)

- [ ] **Update developer guide**
  - [ ] Soft-delete pattern documented
  - [ ] View usage examples added
  - [ ] Changelog entry created
  - [ ] File: `docs/data-engineering/`

- [ ] **Update database schema documentation**
  - [ ] New indexes listed
  - [ ] New columns listed
  - [ ] New views listed
  - [ ] File: _________ (path)

### Code Implementation

- [ ] **Soft delete filtering added to queries**
  - [ ] operational_tasks: [ ] .is('deleted_at', null) added
  - [ ] sales_leads: [ ] .is('deleted_at', null) added
  - [ ] sent_atas: [ ] .is('deleted_at', null) added
  - [ ] user_files: [ ] .is('deleted_at', null) added

- [ ] **Restore functionality implemented**
  - [ ] Soft-delete endpoint created
  - [ ] Restore endpoint created
  - [ ] Admin UI updated
  - [ ] User permissions checked

- [ ] **Analytical views integrated**
  - [ ] dashboard_metrics integrated into dashboard
  - [ ] health_check views used in monitoring
  - [ ] New dashboard widgets created
  - [ ] Admin dashboard updated

### Operational Tasks

- [ ] **Schedule recurring maintenance**
  - [ ] Cleanup job scheduled: `cleanup_old_automation_logs()`
  - [ ] Schedule: 0 2 * * * (2 AM daily)
  - [ ] Owner assigned: _________
  - [ ] Monitoring set up: [ ] YES

- [ ] **Update monitoring rules**
  - [ ] Index usage alerts added
  - [ ] Query performance alerts added
  - [ ] Constraint violation alerts added
  - [ ] Monitoring tool: _________ (DataDog, New Relic, etc.)

- [ ] **Add to runbooks**
  - [ ] Soft delete procedure documented
  - [ ] Restore procedure documented
  - [ ] Index maintenance procedure documented
  - [ ] Emergency rollback procedure documented
  - [ ] File: _________ (path)

---

## Sign-Off

### Migration Completion

| Item | Status | Owner | Date |
|------|--------|-------|------|
| Migration Executed | ✅ / ❌ | _________ | _________ |
| Validation Passed | ✅ / ❌ | _________ | _________ |
| Performance Tested | ✅ / ❌ | _________ | _________ |
| All Fixes Completed | ✅ / ❌ | _________ | _________ |
| Documentation Updated | ✅ / ❌ | _________ | _________ |
| Production Ready | ✅ / ❌ | _________ | _________ |

### Approvals

- [ ] **DevOps Approval**
  - [ ] Name: _________
  - [ ] Signature: _________ Date: _________

- [ ] **DBA Approval**
  - [ ] Name: _________
  - [ ] Signature: _________ Date: _________

- [ ] **Tech Lead Approval**
  - [ ] Name: _________
  - [ ] Signature: _________ Date: _________

### Final Sign-Off

**Migration Status:** ✅ COMPLETE / ❌ FAILED

**Executed by:** _________ Date: _________ Time: _________

**Signed by:** _________ Date: _________

**Notes:**
```
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
```

---

## Issues & Resolutions

| Issue | Severity | Description | Resolution | Owner | Date |
|-------|----------|-------------|-----------|-------|------|
| Example | HIGH | Duplicate categories found | Merged duplicates, retried | Joe | 2/16 |
| | | | | | |
| | | | | | |

---

## Next Steps

1. **Immediate (Day 1)**
   - [ ] Monitor system for 24 hours
   - [ ] Track query performance improvements
   - [ ] Address any issues reported

2. **Short-term (Week 1)**
   - [ ] Complete code implementation
   - [ ] Enable soft-delete UI features
   - [ ] Deploy analytical dashboards

3. **Medium-term (Month 1)**
   - [ ] Schedule first cleanup job execution
   - [ ] Analyze audit trail data
   - [ ] Optimize queries based on index usage

4. **Long-term (Ongoing)**
   - [ ] Monitor index fragmentation
   - [ ] Review audit trail patterns
   - [ ] Plan materialization of frequently-accessed views

---

**Checklist Version:** 1.0
**Last Updated:** 2026-02-16
**Status:** READY FOR USE
