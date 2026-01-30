# SPFP Deployment Guide

## Table of Contents
1. [CI/CD Pipeline](#cicd-pipeline)
2. [RLS Policies (Row-Level Security)](#rls-policies)
3. [Environment Setup](#environment-setup)
4. [Deployment Procedures](#deployment-procedures)
5. [Rollback Procedures](#rollback-procedures)
6. [Monitoring & Validation](#monitoring--validation)

---

## CI/CD Pipeline

### Overview

SPFP uses **GitHub Actions** for automated CI/CD on every push and pull request. All quality gates must pass before code can be merged to `main`.

**Workflow File:** `.github/workflows/ci.yml`

### Automatic Triggers

CI/CD pipeline runs automatically on:
- **Push** to `main` or `sprint-*` branches
- **Pull Request** targeting `main` or `sprint-*` branches

### Pipeline Stages (In Parallel)

#### 1. **Linting** (ESLint)
- **Command:** `npm run lint`
- **Status:** ❌ Blocks merge on errors
- **Purpose:** Enforce code style and catch common mistakes
- **Duration:** ~30 seconds

#### 2. **Type Checking** (TypeScript)
- **Command:** `npx tsc --noEmit`
- **Status:** ❌ Blocks merge on errors
- **Purpose:** Catch type errors before runtime
- **Duration:** ~30 seconds

#### 3. **Unit Tests** (Vitest + Coverage)
- **Command:** `npm run test -- --run --coverage`
- **Status:** ❌ Blocks merge on failures
- **Artifacts:** Coverage report uploaded
- **Purpose:** Validate business logic and calculations
- **Duration:** ~1.5 minutes

#### 4. **Build Verification** (After stages 1-3 pass)
- **Command:** `npm run build`
- **Status:** ❌ Blocks merge on errors
- **Artifacts:** Production bundle uploaded to `dist/`
- **Purpose:** Ensure production build is possible
- **Duration:** ~1.5 minutes

#### 5. **Security Check** (npm audit)
- **Command:** `npm audit --audit-level=moderate`
- **Status:** ❌ Blocks merge on vulnerabilities
- **Purpose:** Detect vulnerable dependencies
- **Duration:** ~20 seconds

### Build Status Requirements

All checks must **PASS** before PR can be merged:

| Check | Required | Behavior on Failure |
|-------|----------|-------------------|
| Lint | ✅ | Blocks merge |
| Type Check | ✅ | Blocks merge |
| Tests | ✅ | Blocks merge |
| Build | ✅ | Blocks merge |
| Security | ✅ | Blocks merge |
| 1+ Code Review | ✅ | Blocks merge |

### Performance Targets

| Stage | Target | Actual |
|-------|--------|--------|
| Lint | < 1 min | ~30s |
| Type Check | < 1 min | ~30s |
| Tests | < 2 min | ~1m 30s |
| Build | < 2 min | ~1m 30s |
| Security | < 1 min | ~20s |
| **Total** | **< 7 min** | ~4 min |

### Branch Protection Rules

The `main` branch requires:
1. ✅ All status checks pass
2. ✅ At least 1 code review approval
3. ✅ Branches must be up to date before merging
4. ❌ Force push disabled
5. ❌ Direct commits disabled

**To Set Up:**
1. GitHub repo → Settings → Branches
2. Click "Add rule" → Pattern: `main`
3. Enable: "Require status checks to pass before merging"
4. Enable: "Require code reviews before merging" (min: 1)
5. Enable: "Dismiss stale review approvals"

### Local Testing Before Push

Run all checks locally to catch issues early:

```bash
# Check all
npm run lint && npm run typecheck && npm run test -- --run && npm run build && npm audit

# Or individually
npm run lint          # Linting
npm run typecheck     # Type checking
npm run test -- --run --coverage  # Tests with coverage
npm run build         # Build
npm audit             # Security
```

### Troubleshooting CI/CD Failures

#### Lint Errors
```bash
npm run lint -- --fix    # Auto-fix fixable issues
npm run lint             # Review remaining issues
```

#### Type Errors
```bash
npm run typecheck        # See all type errors
```

#### Test Failures
```bash
npm run test             # Run in watch mode for debugging
```

#### Build Failures
```bash
npm run build            # See build errors in detail
```

#### Security Vulnerabilities
```bash
npm audit                # See vulnerable packages
npm audit fix            # Auto-fix where possible
npm audit fix --force    # Force fix (may break things)
```

### PR Workflow

**Step 1: Create Feature Branch**
```bash
git checkout -b feature/my-feature
```

**Step 2: Run Local CI Checks**
```bash
npm run lint && npm run typecheck && npm run test -- --run && npm run build
```

**Step 3: Push to Remote**
```bash
git push origin feature/my-feature
```

**Step 4: Create PR on GitHub**
- GitHub Actions automatically runs all checks
- Results appear on PR in real-time
- ✅ Green = All passed
- ❌ Red = Something failed → Click "Details" to see logs

**Step 5: Fix Issues If Needed**
- Make local changes
- Re-run `npm run lint && npm run test -- --run` locally
- Push again → CI re-runs automatically

**Step 6: Get Code Review**
- At least 1 approval required
- Cannot merge until all checks pass

**Step 7: Merge**
- Click "Merge pull request"
- Automatic merge to `main`

### Artifacts

CI/CD generates these artifacts (available 90 days):

1. **Build Artifacts** (`dist/`)
   - Production-ready bundle
   - Can be deployed to production

2. **Coverage Report** (`coverage/`)
   - Test coverage metrics
   - Referenced in PR reviews

View artifacts on GitHub Actions → Run details → "Artifacts"

### Environment

- **Node.js:** 18.x LTS
- **npm:** Latest (auto-installed)
- **Cache:** npm cache enabled (speeds up CI)

---

## RLS Policies

### Overview

All user data tables have **Row-Level Security (RLS)** enabled to ensure GDPR/LGPD compliance and prevent cross-user data leakage.

**Critical:** RLS is REQUIRED for production deployment. All authenticated users have implicit data access - RLS enforces database-level isolation.

### Tables Protected

| Table | Purpose | Policies |
|-------|---------|----------|
| `user_data` | Financial records (transactions, accounts, goals, investments, patrimony) | 4 (SELECT, INSERT, UPDATE, DELETE) |
| `interaction_logs` | User action audit trail | 3 (SELECT, INSERT, DELETE) |

### RLS Policy Rules

#### user_data Table

| Operation | Rule | Behavior |
|-----------|------|----------|
| **SELECT** | `auth.uid() = user_id` | Users can only view their own records |
| **INSERT** | `WITH CHECK (auth.uid() = user_id)` | Users can only insert records with their own user_id |
| **UPDATE** | `USING (auth.uid() = user_id)` + `WITH CHECK (auth.uid() = user_id)` | Users can only update their own records |
| **DELETE** | `USING (auth.uid() = user_id)` | Users can only delete their own records |

#### interaction_logs Table

| Operation | Rule | Behavior |
|-----------|------|----------|
| **SELECT** | `auth.uid() = user_id` | Users can only view their own logs |
| **INSERT** | `WITH CHECK (auth.uid() = user_id)` | Users can only insert logs for themselves |
| **DELETE** | `USING (auth.uid() = user_id)` | Users can only delete their own logs |

### Policy Implementation Details

**Policy Name Pattern:** `"Users can {action} their own {table}"`

**Example Policy:**
```sql
CREATE POLICY "Users can view their own user_data"
ON user_data
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

**Key Features:**
- All policies are `TO authenticated` (only logged-in users)
- All policies reference `auth.uid()` (Supabase built-in function returning current user's UUID)
- Implicit deny: if no policy matches, operation is denied
- No admin bypass: even service role can't read other users' data without explicit bypass

---

## Environment Setup

### Prerequisites

- Supabase project created (URL and API keys configured)
- PostgreSQL 14+ (Supabase-managed)
- Git repository with migration files
- Node.js 18+ (for local testing)

### Configuration Files

**Database Credentials:** Stored in `.env.local` (never commit):
```bash
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]  # Only for backend
```

**Application Config:** `src/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Deployment Procedures

### Initial RLS Deployment (First Time)

#### Step 1: Verify Migration File
```bash
# Check migration exists and is valid
cat supabase/migrations/001-add-rls-policies.sql

# Verify syntax (should have 7 CREATE POLICY statements)
grep -c "CREATE POLICY" supabase/migrations/001-add-rls-policies.sql
# Expected: 7
```

#### Step 2: Deploy to Staging Environment

**Option A: Using Supabase CLI (Recommended)**
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref [project-id]

# Push migrations to staging
supabase db push --local

# Verify deployment
supabase db pull
```

**Option B: Manual via Supabase Dashboard**
1. Go to https://supabase.com → Select Project
2. Navigate to **SQL Editor**
3. Create new query
4. Copy entire contents of `supabase/migrations/001-add-rls-policies.sql`
5. Paste into SQL Editor
6. Click **Execute**
7. Wait for success notification

#### Step 3: Verify RLS Policies Deployed

```sql
-- Run in Supabase SQL Editor
SELECT tablename, policyname, permissive, cmd
FROM pg_policies
WHERE tablename IN ('user_data', 'interaction_logs')
ORDER BY tablename, policyname;

-- Expected Output (8 rows):
-- user_data | Users can delete their own user_data | t | DELETE
-- user_data | Users can insert their own user_data | t | INSERT
-- user_data | Users can update their own user_data | t | UPDATE
-- user_data | Users can view their own user_data | t | SELECT
-- interaction_logs | Users can delete their own interaction_logs | t | DELETE
-- interaction_logs | Users can insert their own interaction_logs | t | INSERT
-- interaction_logs | Users can view their own interaction_logs | t | SELECT
```

**If you see fewer than 8 rows:** Migration did not apply correctly. Check error logs and retry.

#### Step 4: Test RLS Isolation

```sql
-- Test 1: Attempt to read all user data (should fail)
SELECT * FROM user_data WHERE user_id != auth.uid();
-- Expected: ERROR: permission denied for table user_data

-- Test 2: Read own data (should succeed)
SELECT * FROM user_data WHERE user_id = auth.uid();
-- Expected: Returns rows for current user only

-- Test 3: Attempt cross-user INSERT (should fail)
INSERT INTO user_data (user_id, data_column)
VALUES ('different-user-uuid', 'value')
-- Expected: ERROR: new row violates row-level security policy

-- Test 4: UPDATE own record (should succeed)
UPDATE user_data
SET some_field = 'value'
WHERE user_id = auth.uid()
LIMIT 1;
-- Expected: 1 row updated
```

#### Step 5: Run Automated Tests

```bash
# Run RLS validation tests
npm run test:rls

# Or manually in Supabase SQL Editor
# Copy contents of supabase/tests/rls-user-isolation.test.sql
# Execute each query and verify expected results
```

#### Step 6: Deploy to Production

**Only after staging validation:**

```bash
# Deploy to production (requires confirmation)
supabase db push --linked

# Verify in production
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('user_data', 'interaction_logs');
-- Expected: 7
```

---

## Rollback Procedures

### Emergency Rollback (Disable RLS)

**⚠️ WARNING:** Only use if RLS is causing critical issues. Users may access each other's data.

```sql
-- Disable RLS on user_data
ALTER TABLE user_data DISABLE ROW LEVEL SECURITY;

-- Disable RLS on interaction_logs
ALTER TABLE interaction_logs DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('user_data', 'interaction_logs')
  AND schemaname = 'public';
-- Expected: rowsecurity = false for both
```

### Full Rollback (Drop Policies & Re-enable)

```sql
-- Drop all RLS policies
DROP POLICY IF EXISTS "Users can view their own user_data" ON user_data;
DROP POLICY IF EXISTS "Users can insert their own user_data" ON user_data;
DROP POLICY IF EXISTS "Users can update their own user_data" ON user_data;
DROP POLICY IF EXISTS "Users can delete their own user_data" ON user_data;

DROP POLICY IF EXISTS "Users can view their own interaction_logs" ON interaction_logs;
DROP POLICY IF EXISTS "Users can insert their own interaction_logs" ON interaction_logs;
DROP POLICY IF EXISTS "Users can delete their own interaction_logs" ON interaction_logs;

-- Disable RLS
ALTER TABLE user_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_logs DISABLE ROW LEVEL SECURITY;
```

### Re-apply After Rollback

```bash
# Re-run migration
supabase db push --local

# Verify all 7 policies are back
SELECT COUNT(*) FROM pg_policies
WHERE tablename IN ('user_data', 'interaction_logs');
```

---

## Monitoring & Validation

### Daily Checks

```sql
-- Verify RLS status
SELECT
  tablename,
  rowsecurity,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables
WHERE tablename IN ('user_data', 'interaction_logs')
  AND schemaname = 'public';

-- Expected: rowsecurity = true, policy_count = 4 (user_data) or 3 (interaction_logs)
```

### Performance Impact

RLS adds minimal overhead (~2-5% query latency per policy check). Monitor:

```sql
-- Check slow queries related to user_data
SELECT query, calls, mean_time
FROM pg_stat_statements
WHERE query LIKE '%user_data%'
ORDER BY mean_time DESC
LIMIT 10;
```

### User Complaint Troubleshooting

**"I can't see my data"**
1. Verify RLS policies exist: `SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_data'` (should be 4)
2. Verify user is authenticated: `SELECT auth.uid()` returns non-null UUID
3. Verify data exists for user: Check database directly with service role

**"I see other users' data"**
🚨 CRITICAL ISSUE - RLS may be disabled
1. Check RLS status: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'user_data'`
2. If `false`, immediately re-enable: `ALTER TABLE user_data ENABLE ROW LEVEL SECURITY`
3. Verify all 7 policies exist
4. Audit access logs for data leakage

---

## Compliance & Audit

### GDPR/LGPD Compliance

RLS ensures:
- ✅ **Data Isolation:** Users can only access their own data
- ✅ **Audit Trail:** interaction_logs track all data access
- ✅ **Enforcement:** Database-level enforcement (not application-level)
- ✅ **Immutability:** Policies cannot be bypassed by application logic

### Audit Trail

All user actions are logged in `interaction_logs` with RLS applied:

```sql
-- User can only see their own logs
SELECT * FROM interaction_logs WHERE user_id = auth.uid();

-- Audit: View all actions by a specific user (admin only)
-- Note: Admin accounts may need service role access
SELECT action, timestamp, metadata
FROM interaction_logs
WHERE user_id = 'target-user-uuid'
ORDER BY timestamp DESC;
```

---

## Support & Escalation

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Permission denied on SELECT | RLS policy mismatch | Verify policy condition: `auth.uid() = user_id` |
| Cannot INSERT own data | INSERT WITH CHECK incorrect | Verify `WITH CHECK (auth.uid() = user_id)` |
| Silent UPDATE failure | UPDATE USING condition false | Check that row matches `auth.uid() = user_id` |
| RLS not working | RLS disabled on table | Run: `ALTER TABLE [table] ENABLE ROW LEVEL SECURITY` |

### Escalation Path

1. **Check RLS status** (this guide, "Monitoring" section)
2. **Review policy definitions** (this guide, "RLS Policy Rules")
3. **Run test suite** (`supabase/tests/rls-user-isolation.test.sql`)
4. **Contact DBA** if issue persists

---

## References

- [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [GDPR Compliance](https://gdpr-info.eu/)
- [LGPD Compliance](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

---

**Document Owner:** Backend Team
**Last Updated:** 2026-01-30
**Status:** Active
**Approval:** Required before production deployment
