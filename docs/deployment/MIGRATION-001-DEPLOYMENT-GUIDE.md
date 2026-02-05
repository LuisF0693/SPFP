# Migration 001 - Manual Deployment Guide

**For:** Gage (DevOps Engineer) / Authorized Admin
**Duration:** 15-20 minutes
**Date:** 2026-02-05
**Environment:** Production Supabase

---

## QUICK START (Copy-Paste Ready)

### 5-Step Deployment Process

1. **Backup** (2 min)
2. **Execute Script** (1 min)
3. **Verify Schema** (5 min)
4. **Test Queries** (5 min)
5. **Document & Commit** (2 min)

---

## STEP 1: BACKUP (2 minutes)

### Manual Backup in Supabase Console

```
1. Go to: https://supabase.com/dashboard
2. Select Project: SPFP (Production)
3. Left sidebar > Settings > Database
4. Click "Backups" tab
5. Verify automated backup exists (daily at 2 AM UTC)
6. Optional: Create manual backup
   - Click "Create backup" button
   - Name: pre-FASE-1-schema-001_$(date +%Y%m%d_%H%M%S)
   - Click "Confirm"
   - Wait for "Backup completed" status
```

**Backup Verification:**
```
✅ Backup Status: Completed
✅ Backup Date: Today
✅ Size: ~50MB
✅ Retention: 30 days
```

---

## STEP 2: EXECUTE SQL SCRIPT (1 minute)

### Open SQL Editor

```
1. Go to: https://supabase.com/dashboard
2. Select Project: SPFP (Production)
3. Left sidebar > SQL Editor
4. Click "New query" button
```

### Copy Migration Script

Option A: Direct Copy from File
```
1. Open: docs/migrations/001_card_invoices_schema.sql
2. Select all (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)
```

Option B: Via CLI (if using supabase-cli)
```bash
supabase db execute \
  --file docs/migrations/001_card_invoices_schema.sql \
  --project-id your_project_id
```

### Paste & Execute

```
1. In Supabase SQL Editor, paste script
2. Script should show in editor
3. Click "Run" button (or Cmd+Enter / Ctrl+Enter)
4. Status should show "Query OK"
5. No error messages should appear
```

### Success Indicator

```
✅ "Query OK" message appears
✅ No red error text
✅ Execution took < 10 seconds
✅ No warnings about missing tables
```

---

## STEP 3: VERIFY SCHEMA (5 minutes)

### Quick Visual Check in Supabase Console

**Tab: Structure > Tables**
```
Should see:
✅ card_invoices (green checkmark)
✅ card_invoice_items (green checkmark)
```

**Tab: Policies**
```
Should see:
✅ card_invoices > card_invoices_user_isolation
✅ card_invoice_items > card_invoice_items_user_isolation
```

### Run Verification Queries

Copy and run each query below in SQL Editor:

#### Query 1: Tables Created
```sql
SELECT
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_name IN ('card_invoices', 'card_invoice_items')
  AND table_schema = 'public'
ORDER BY table_name;
```

Expected: 2 rows (both tables present)

#### Query 2: RLS Enabled
```sql
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('card_invoices', 'card_invoice_items')
  AND schemaname = 'public';
```

Expected: 2 rows, all with `rowsecurity = true`

#### Query 3: Indexes Created
```sql
SELECT
  COUNT(*) as index_count,
  tablename
FROM pg_indexes
WHERE tablename IN ('card_invoices', 'card_invoice_items')
  AND schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

Expected:
```
 index_count |      tablename
-------------+---------------------
           8 | card_invoices
           5 | card_invoice_items
```

#### Query 4: Triggers Exist
```sql
SELECT
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('card_invoices', 'card_invoice_items')
ORDER BY event_object_table, trigger_name;
```

Expected: 2 rows
- `trg_update_installment_status` on `card_invoice_items`
- `trg_update_invoice_on_item_change` on `card_invoice_items`

#### Query 5: Views Exist
```sql
SELECT
  schemaname,
  viewname
FROM information_schema.views
WHERE viewname LIKE 'v_%'
  AND schemaname = 'public'
ORDER BY viewname;
```

Expected: 3 rows
- `v_future_installments`
- `v_monthly_spending_summary`
- `v_overdue_items`

### Document Results

Mark verification complete:
```
✅ Query 1: Tables - PASS
✅ Query 2: RLS Policies - PASS
✅ Query 3: Indexes - PASS (13 total)
✅ Query 4: Triggers - PASS
✅ Query 5: Views - PASS
```

---

## STEP 4: TEST QUERIES (5 minutes)

### Test Q1-Q10 from QUERIES-QUICK-REFERENCE.md

Run each query and verify execution time:

#### Q1: Get Invoices (Empty Result Expected)
```sql
SELECT
  ci.id,
  ci.invoice_number,
  ci.invoice_date,
  ci.total_amount,
  ci.status
FROM card_invoices ci
WHERE ci.deleted_at IS NULL
ORDER BY ci.invoice_date DESC
LIMIT 50;
```

Expected: 0 rows (table empty)
Time: < 50ms

#### Q2: Future Installments
```sql
SELECT
  cii.id,
  cii.due_date,
  cii.amount,
  cii.status
FROM card_invoice_items cii
WHERE cii.status IN ('PENDING', 'OVERDUE')
  AND cii.due_date >= NOW()::DATE
  AND cii.due_date <= NOW()::DATE + INTERVAL '90 days'
ORDER BY cii.due_date ASC;
```

Expected: 0 rows (table empty)
Time: < 50ms

#### Q3-Q10: Run remaining queries
- All should return 0 rows (tables empty)
- All should complete in < 120ms

### Document Test Results

```
✅ Q1 - Get Invoices: PASS (0ms)
✅ Q2 - Future Installments: PASS (0ms)
✅ Q3-Q10: All PASS (< 120ms each)
```

---

## STEP 5: DOCUMENT & COMMIT (2 minutes)

### Update Deployment Report

File: `docs/deployment/MIGRATION-001-DEPLOYED.md`

Fill in the Execution Record section:
```markdown
| Deployment Time UTC | 2026-02-05 14:35 |
| Executed By | [Your Name] |
| Status | SUCCESS |
| Issues Encountered | None |
```

### Commit to Git

```bash
# Stage deployment report
git add docs/deployment/MIGRATION-001-DEPLOYED.md

# Commit with message
git commit -m "chore: Deploy migration 001_card_invoices_schema

- Created card_invoices table with 16 columns
- Created card_invoice_items table with invoice line items
- Created 13 indexes for query optimization
- Enabled RLS policies for user data isolation
- Created 3 views for analytics
- Created 2 triggers for auto-status updates
- All verification queries passed
- No issues encountered

Deployment Date: 2026-02-05 14:35 UTC
Deployed By: Gage
Status: SUCCESS"

# Push to main
git push origin main
```

---

## ROLLBACK (If Needed)

### Quick Rollback (< 5 minutes)

**If schema has issues, run this to revert:**

```sql
-- Drop views first
DROP VIEW IF EXISTS v_overdue_items CASCADE;
DROP VIEW IF EXISTS v_monthly_spending_summary CASCADE;
DROP VIEW IF EXISTS v_future_installments CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS trg_update_installment_status ON card_invoice_items;
DROP TRIGGER IF EXISTS trg_update_invoice_on_item_change ON card_invoice_items;

-- Drop functions
DROP FUNCTION IF EXISTS update_installment_status();
DROP FUNCTION IF EXISTS update_invoice_status_from_items();

-- Drop tables (cascade deletes policies and indexes)
DROP TABLE IF EXISTS card_invoice_items CASCADE;
DROP TABLE IF EXISTS card_invoices CASCADE;
```

### Full Restore from Backup (30-60 minutes)

If queries fail:
1. Go to Supabase Console > Settings > Database > Backups
2. Click the backup from before deployment
3. Click "Restore" button
4. Confirm restoration
5. Wait for status "Restoration completed"

---

## MONITORING (After Deployment)

### Real-Time Checks (First 5 minutes)

**Check Error Rate:**
```
1. Supabase Console > Logs
2. Filter: "error" or "ERROR"
3. Result should be empty
```

**Check Application:**
```
1. Go to: https://app.spfp.com
2. Login to dashboard
3. Navigate to Accounts/Invoices section
4. Should load without errors
```

### Health Metrics (First Hour)

**Database Metrics:**
```
1. Supabase Console > Logs > Database
2. Monitor:
   - Query latency: Should be < 100ms
   - Error rate: Should be 0%
   - Connections: Should be normal
```

**Application Metrics:**
```
1. Sentry Dashboard (if configured)
2. Check:
   - Error rate: Should be < 0.1%
   - No new errors related to migration
```

---

## CHECKLIST FOR DEPLOYMENT

Print and use this checklist:

```
PRE-DEPLOYMENT
[ ] Backup verified in Supabase
[ ] Migration script reviewed
[ ] Team notified of deployment
[ ] On-call engineer available

DEPLOYMENT
[ ] Opened Supabase SQL Editor
[ ] Copied migration script (001_card_invoices_schema.sql)
[ ] Pasted into SQL Editor
[ ] Executed script (clicked "Run")
[ ] "Query OK" message appeared
[ ] No error messages shown

VERIFICATION
[ ] Query 1: Tables created (2 rows)
[ ] Query 2: RLS enabled (2 rows, rowsecurity=true)
[ ] Query 3: Indexes created (13 total)
[ ] Query 4: Triggers created (2 triggers)
[ ] Query 5: Views created (3 views)
[ ] Q1-Q10 test queries all pass
[ ] All execution times < 120ms

POST-DEPLOYMENT
[ ] Updated MIGRATION-001-DEPLOYED.md
[ ] Committed to git
[ ] Pushed to main branch
[ ] Team notified of success
[ ] Error rate monitoring for 1 hour

SIGN-OFF
[ ] Deployed By: _________________ Date: _______
[ ] Verified By: _________________ Date: _______
```

---

## EMERGENCY CONTACTS

**If deployment fails:**
- DevOps Lead: [Gage]
- Data Engineer: [Nova]
- On-Call: [From rotation]

**Escalation (if needed):**
- Supabase Support: https://supabase.com/support
- Team Slack: #devops-incidents

---

## NOTES

- Deployment is read-only after execution (no interactive prompts)
- All operations complete without requiring user input
- Estimated total time: 15 minutes
- No data loss risk (only creating new schema)
- Can be safely rerun if needed (tables already exist)

---

**Ready for Deployment!**

Execute this guide step-by-step. Expected success rate: 99%+

For issues, refer to: `docs/deployment/DEVOPS-RUNBOOK.md` Section 9 (Troubleshooting)

