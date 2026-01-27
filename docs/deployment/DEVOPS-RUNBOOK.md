# SPFP DevOps Runbook

**Version:** 1.0
**Last Updated:** 2026-01-27
**Status:** Production-Ready
**Owner:** DevOps Engineer (Gage)

---

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Deployment Process](#deployment-process)
3. [Database Migrations](#database-migrations)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoring & Alerts](#monitoring--alerts)
6. [Rollback Procedures](#rollback-procedures)
7. [Performance Monitoring](#performance-monitoring)
8. [Security Checklist](#security-checklist)
9. [Common Issues & Fixes](#common-issues--fixes)
10. [Release Notes Template](#release-notes-template)

---

## 1. Environment Setup

### 1.1 Supabase Project Setup

#### Prerequisites
- Supabase account (https://supabase.com)
- PostgreSQL 14+ knowledge
- Row-Level Security (RLS) understanding

#### Initial Setup Steps

1. **Create Supabase Project**
   ```bash
   # Navigate to supabase.com console
   # Click "New Project"
   # Select region: closest to users (recommended: us-east-1 or eu-west-1)
   # Select database password complexity: Strong (16+ chars, mixed case)
   # Note project ID and API keys
   ```

2. **Retrieve Connection Details**
   - From Supabase console > Settings > API
   - Copy `Project URL` (supabaseUrl)
   - Copy `anon public` key (supabaseAnonKey)
   - Copy `service_role` key (for admin operations)

3. **Configure Database**
   ```sql
   -- Run in Supabase SQL Editor

   -- Enable necessary extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "moddatetime";
   CREATE EXTENSION IF NOT EXISTS "http";

   -- Create initial schema (see docs/migrations/ folder)
   -- Each migration file should be applied in order
   ```

4. **Set Up Authentication Methods**
   - Go to Authentication > Providers
   - Enable: Email/Password, Google OAuth
   - Configure Google OAuth:
     - Get OAuth credentials from Google Cloud Console
     - Add to Supabase Authentication providers
     - Set authorized redirect URI: `https://jqmlloimcgsfjhhbenzk.supabase.co/auth/v1/callback`

5. **Configure RLS Policies**
   - See Section 3.1 for RLS policy deployment
   - All data tables must have RLS enabled
   - Test policies in SQL Editor before production

#### Production Safeguards

```sql
-- Run in production after all tables are created
-- This prevents accidental access without proper RLS policies

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrimony ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
```

### 1.2 GitHub Repository Setup

#### Initial Configuration

1. **Create Repository**
   ```bash
   gh repo create spfp \
     --description "Sistema de Planejamento Financeiro Pessoal" \
     --public \
     --source=. \
     --remote=origin \
     --push
   ```

2. **Configure Branch Protection**
   ```bash
   # Settings > Branches > Add rule
   # Pattern: main
   # Require pull request reviews before merging: YES
   # Require status checks to pass: YES
   # Dismiss stale reviews: YES
   # Require branches to be up to date: YES
   # Restrict who can push: YES (admins only)
   ```

3. **Set Up Environments**
   ```bash
   # Settings > Environments
   # Create: staging
   # Create: production
   # For each environment:
   #   - Add required reviewers
   #   - Set deployment branches (staging: develop, production: main)
   ```

### 1.3 GitHub Actions Secrets

#### Required Secrets for CI/CD

Add the following secrets to GitHub repository settings (Settings > Secrets and variables > Actions):

**For All Environments:**
```
GEMINI_API_KEY          # Google Gemini API key
SUPABASE_URL            # Supabase project URL
SUPABASE_ANON_KEY       # Supabase public anon key
```

**For Staging Deployment:**
```
STAGING_SUPABASE_URL           # Staging Supabase URL
STAGING_SUPABASE_SERVICE_ROLE  # Staging admin key
STAGING_DEPLOY_KEY             # Staging server SSH key (if using)
```

**For Production Deployment:**
```
PROD_SUPABASE_URL              # Production Supabase URL
PROD_SUPABASE_SERVICE_ROLE     # Production admin key
PROD_DEPLOY_KEY                # Production server SSH key
PROD_GITHUB_TOKEN              # GitHub token for release creation
SENTRY_AUTH_TOKEN              # Sentry error tracking (optional)
SLACK_WEBHOOK                  # Slack notifications (optional)
```

**Command to Add Secrets:**
```bash
# Interactive method
gh secret set SECRET_NAME --body "secret_value" -R antigravity/spfp

# Or via command line
gh secret set GEMINI_API_KEY --body "sk-..." -R antigravity/spfp
```

### 1.4 Environment Variables

#### Development (.env.local)
```env
# Supabase
VITE_SUPABASE_URL=https://jqmlloimcgsfjhhbenzk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini
GEMINI_API_KEY=AIzaSy...

# Optional: Local Supabase (if using supabase-cli)
SUPABASE_ACCESS_TOKEN=sbp_...
```

#### Staging (.env.staging)
```env
VITE_SUPABASE_URL=https://staging-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key...
GEMINI_API_KEY=staging-gemini-key...
REACT_APP_ENV=staging
REACT_APP_LOG_LEVEL=debug
```

#### Production (.env.production)
```env
VITE_SUPABASE_URL=https://jqmlloimcgsfjhhbenzk.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key...
GEMINI_API_KEY=production-gemini-key...
REACT_APP_ENV=production
REACT_APP_LOG_LEVEL=error
```

**Important:** Never commit `.env.local` or environment-specific files. Use GitHub Secrets instead.

### 1.5 Monitoring & Logging Setup

#### Set Up Error Tracking (Sentry)

1. **Create Sentry Project**
   ```bash
   # Visit sentry.io
   # Create organization: Antigravity
   # Create project: SPFP (React)
   # Copy DSN
   ```

2. **Configure in Application**
   ```typescript
   // src/main.tsx
   import * as Sentry from "@sentry/react";

   if (import.meta.env.PROD) {
     Sentry.init({
       dsn: "https://...@sentry.io/...",
       environment: import.meta.env.VITE_REACT_APP_ENV,
       tracesSampleRate: 0.1,
       integrations: [
         new Sentry.Replay({ maskAllText: true }),
       ],
     });
   }
   ```

#### Set Up Application Logging

```typescript
// src/services/logService.ts
export const setupLogging = () => {
  if (import.meta.env.PROD) {
    console.log = (...args) => {
      // Send to logging service
      fetch('/api/logs', {
        method: 'POST',
        body: JSON.stringify({ level: 'info', message: args.join(' ') })
      });
    };
  }
};
```

#### Set Up Supabase Audit Logging

```sql
-- Enable audit logging in Supabase
-- Settings > Auditing > Enable Audit Logging

-- This automatically logs all row changes in audit.audit_log_entries
-- Accessible via: supabase.from('audit.audit_log_entries').select('*')
```

#### Set Up Uptime Monitoring

```bash
# Option 1: Supabase native (if available)
# Settings > Monitoring > Enable Uptime Alerts

# Option 2: Use external service (e.g., Uptime Robot, Pingdom)
# Create monitor for: https://your-deployed-url.com/health
# Set interval: 5 minutes
# Alert if down for 10+ minutes
```

---

## 2. Deployment Process

### 2.1 Staging Deployment

#### Trigger: Push to `develop` Branch

```mermaid
develop → CI/CD Tests → Manual Approval → Deploy to Staging → Smoke Tests → Notify Team
```

#### Step-by-Step Process

1. **Create Feature Branch and PR**
   ```bash
   git checkout -b feature/your-feature
   # Make changes
   git add .
   git commit -m "feat: your feature description [Story X.X]"
   git push origin feature/your-feature

   # Create PR to develop
   gh pr create --title "Feature: Your Title" \
               --body "Closes #issue-number" \
               --base develop
   ```

2. **Push to Develop Branch**
   ```bash
   # After PR approval and merge
   git checkout develop
   git pull origin develop
   ```

3. **CI/CD Pipeline Executes**
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Unit tests (Vitest)
   - Build (Vite)
   - Security scan (npm audit)

4. **Manual Approval for Staging**
   ```bash
   # GitHub Actions requires manual approval for staging environment
   # Go to Actions > Latest workflow run > Review deployments
   # Click "Approve and deploy"
   ```

5. **Deploy to Staging**
   ```bash
   # Automated by GitHub Actions workflow
   # Workflow: .github/workflows/deploy-staging.yml

   # Deployment steps:
   # 1. Build production bundle: npm run build
   # 2. Upload to staging environment
   # 3. Set environment variables from secrets
   # 4. Restart application
   ```

6. **Run Smoke Tests**
   ```bash
   # Automated smoke test suite runs post-deployment
   # Tests include:
   # - Application loads (HTTP 200)
   # - Auth page accessible
   # - Login functionality works
   # - Dashboard loads with sample data
   # - Gemini API responds
   ```

7. **Notify Team**
   ```bash
   # Slack notification sent with:
   # - Deployment status
   # - URL: https://staging.spfp.app
   # - Git commit hash and message
   # - Changes summary
   ```

#### Staging Deployment Rollback
```bash
# If staging deployment fails:
# 1. Automated rollback to previous version
# 2. Slack notification with error details
# 3. Email to DevOps on-call engineer
# 4. Investigate root cause in build logs
```

### 2.2 Production Deployment

#### Trigger: Release Tag on `main` Branch

```mermaid
Release Tag (v1.X.X) → Verify Tests → Build → Deploy to Blue → Smoke Tests →
Green/Blue Switch → Monitor 1hr → Rollback if Issues
```

#### Step-by-Step Process

1. **Create Release Branch**
   ```bash
   # Create release branch from main
   git checkout main
   git pull origin main
   git checkout -b release/v1.X.X

   # Update version in package.json
   npm version minor  # or major/patch as appropriate
   ```

2. **Create Release Commit**
   ```bash
   # Update CHANGELOG.md
   # Update release notes

   git add .
   git commit -m "chore: release v1.X.X"
   git push origin release/v1.X.X
   ```

3. **Create PR and Merge to Main**
   ```bash
   gh pr create --title "Release: v1.X.X" \
               --body "Production release" \
               --base main

   # After approval:
   # Merge PR (squash or merge as per policy)
   ```

4. **Tag Release**
   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.X.X -m "Release version 1.X.X"
   git push origin v1.X.X

   # Or via GitHub CLI:
   gh release create v1.X.X \
     --title "Version 1.X.X" \
     --notes "See CHANGELOG.md for details"
   ```

5. **CI/CD Verifies & Builds**
   - All tests pass (lint, typecheck, unit tests)
   - Build succeeds without warnings
   - Security scan completes (npm audit)
   - Artifact size within limits

6. **Deploy to Blue Environment**
   ```bash
   # Blue/Green deployment strategy
   # Blue = new version
   # Green = current production

   # Deployment steps:
   # 1. Build production bundle
   # 2. Upload to "blue" server/CDN
   # 3. Set environment variables
   # 4. Health check blue environment
   # 5. Wait for approval before switching traffic
   ```

7. **Run Production Smoke Tests**
   ```bash
   # Test blue environment (not yet public)
   # Tests include:
   # - All staging smoke tests
   # - Payment processing (if applicable)
   # - Data export functionality
   # - Report generation
   # - AI insights generation
   # - Real Supabase connection
   ```

8. **Manual Approval: Green/Blue Switch**
   ```bash
   # Go to GitHub Actions > Latest production deployment
   # Review test results and logs
   # Click "Approve and switch traffic"
   # Traffic now routes to blue (new version)
   ```

9. **Monitor for 1 Hour**
   ```bash
   # Post-deployment monitoring:
   # - Error rate (target: < 0.1%)
   # - API response times (p99: < 500ms)
   # - Database query times (p99: < 100ms)
   # - User login rate
   # - Transactions processed

   # Check metrics via:
   # - Sentry dashboard
   # - Supabase metrics
   # - Custom logging service
   # - Uptime monitoring
   ```

10. **Automatic Rollback if Issues**
    ```bash
    # If any of these conditions are met, automatic rollback to green:
    # - Error rate > 1% for > 5 minutes
    # - HTTP 5xx errors > 10 per minute
    # - Database connection failures
    # - Gemini API failures > 50%

    # Automatic actions:
    # 1. Traffic switched back to green
    # 2. Slack alert sent to team
    # 3. PagerDuty incident created
    # 4. Post-mortem scheduled
    ```

#### Production Deployment Failure Recovery
```bash
# If deployment fails at any stage:

# 1. Review error logs
git log --oneline origin/main | head -5
gh run view <run-id> --log

# 2. Check what changed in failed version
gh pr view <pr-number> --json files

# 3. If rollback needed
git revert HEAD --no-edit
git push origin main

# 4. Notify team
# Email + Slack with error details and recovery steps
```

---

## 3. Database Migrations

### 3.1 RLS (Row-Level Security) Policies Deployment

#### RLS Policy Structure

All tables must have RLS enabled with policies that:
1. Prevent unauthorized data access
2. Allow users to see only their own data
3. Prevent accidental data modification

#### Deployment Process

1. **Create Migration File**
   ```bash
   # Create new migration in docs/migrations/
   # Naming convention: YYYY-MM-DD_description.sql
   # Example: 2026-01-27_ai_history_rls.sql
   ```

2. **Write RLS Policies**
   ```sql
   -- Example RLS policy for transactions table
   -- File: docs/migrations/2026-01-27_transactions_rls.sql

   -- Enable RLS
   ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

   -- Policy: Users can see their own transactions
   CREATE POLICY "Users can view their own transactions"
   ON public.transactions
   FOR SELECT
   USING (auth.uid() = user_id);

   -- Policy: Users can insert their own transactions
   CREATE POLICY "Users can insert their own transactions"
   ON public.transactions
   FOR INSERT
   WITH CHECK (auth.uid() = user_id);

   -- Policy: Users can update their own transactions
   CREATE POLICY "Users can update their own transactions"
   ON public.transactions
   FOR UPDATE
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);

   -- Policy: Users can delete their own transactions
   CREATE POLICY "Users can delete their own transactions"
   ON public.transactions
   FOR DELETE
   USING (auth.uid() = user_id);

   -- Policy: Admins can view all transactions
   CREATE POLICY "Admins can view all transactions"
   ON public.transactions
   FOR SELECT
   USING (
     EXISTS (
       SELECT 1 FROM public.admin_users
       WHERE admin_users.user_id = auth.uid()
     )
   );
   ```

3. **Test RLS Policies in Staging**
   ```bash
   # In Supabase SQL Editor (staging project)

   -- Test as user_id: 123
   SET request.jwt.claim.sub = '123';
   SELECT * FROM public.transactions;  -- Should see only user 123's data

   -- Test as different user
   SET request.jwt.claim.sub = '456';
   SELECT * FROM public.transactions;  -- Should see only user 456's data

   -- Test unauthorized access
   UNSET request.jwt.claim.sub;
   SELECT * FROM public.transactions;  -- Should fail (no access)
   ```

4. **Deploy to Production**
   ```bash
   # Method 1: Via Supabase Dashboard
   # - SQL Editor > Paste migration > Run
   # - IMPORTANT: Test all policies before running

   # Method 2: Via CLI (if using supabase-cli)
   supabase migration new rls_update
   supabase migration up --experimental
   ```

5. **Verify in Production**
   ```bash
   -- Run verification queries
   SELECT * FROM pg_policies WHERE tablename = 'transactions';

   -- Verify RLS is enabled
   SELECT schemaname, tablename, rowsecurity
   FROM pg_tables
   WHERE tablename IN ('transactions', 'accounts', 'goals');
   ```

### 3.2 Schema Changes Process

#### Major Schema Changes

1. **Plan Migration**
   - Document current schema
   - Design new schema
   - Plan data migration steps
   - Identify potential data loss
   - Create rollback plan

2. **Test in Staging**
   ```sql
   -- In staging environment
   -- 1. Create backup
   -- 2. Run schema change
   -- 3. Verify data integrity
   -- 4. Test application with new schema
   -- 5. Document issues and fixes
   ```

3. **Create Minimal Migration**
   ```sql
   -- Good: Simple, focused change
   ALTER TABLE transactions ADD COLUMN updated_at TIMESTAMP;
   CREATE INDEX idx_transactions_updated_at ON transactions(updated_at);

   -- Bad: Multiple unrelated changes in one migration
   ALTER TABLE transactions ADD COLUMN updated_at TIMESTAMP;
   ALTER TABLE accounts ADD COLUMN description TEXT;
   MODIFY COLUMN category_id TYPE UUID;
   ```

4. **Use Backward-Compatible Changes**
   ```sql
   -- Good: Add optional column (application can handle both)
   ALTER TABLE transactions ADD COLUMN category_v2_id UUID;

   -- Bad: Rename column (breaks existing application)
   ALTER TABLE transactions RENAME COLUMN category_id TO category_v2_id;

   -- Good: Application can handle optional field
   ALTER TABLE transactions ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

   -- Bad: Rename column without migration period
   ALTER TABLE transactions DROP COLUMN old_field;
   ```

5. **Deploy with Zero Downtime**
   - Deploy new application code first (uses both old and new fields)
   - Apply schema change
   - Update application to use new field
   - Remove old field in future release

### 3.3 Migration Validation

#### Pre-Deployment Checklist

```bash
# Before running any migration:

1. [ ] Migration file created and reviewed
2. [ ] Tested in staging environment
3. [ ] Rollback plan documented
4. [ ] Data backup taken
5. [ ] All RLS policies verified
6. [ ] No index conflicts
7. [ ] Performance impact assessed
8. [ ] Application code updated for changes
9. [ ] Team notified of maintenance window
10. [ ] Monitoring alerts configured
```

#### Post-Deployment Validation

```sql
-- After migration completes:

-- Verify schema change
\d+ table_name

-- Verify row counts unchanged
SELECT COUNT(*) FROM table_name;

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- Verify indexes created
SELECT * FROM pg_indexes WHERE tablename = 'table_name';

-- Check for errors in postgres logs
SELECT * FROM postgres_logs
WHERE level = 'ERROR'
AND created_at > NOW() - INTERVAL '5 minutes';
```

### 3.4 Rollback Procedure

#### Data Backup Before Migrations

```bash
# Automated backup (Supabase does this)
# Manual backup before major changes:

1. Export data via Supabase dashboard:
   - Settings > Data Export
   - Download full backup
   - Store in secure location

2. Or via CLI:
   supabase db pull
   # Creates local schema snapshot
```

#### Rollback Process

```sql
-- If migration causes issues:

-- Method 1: Revert via SQL (if simple change)
-- Example: Remove added column
ALTER TABLE transactions DROP COLUMN updated_at;

-- Method 2: Restore from backup
-- Contact Supabase support if backup restore needed
-- Estimated time: 30-60 minutes

-- Method 3: Deploy previous application version
-- Revert to last known-good commit
git revert HEAD --no-edit
git push origin main
# CI/CD redeploys previous version

-- Communication
-- 1. Slack: #incidents channel
-- 2. Email: affected users
-- 3. Status page: public announcement
-- 4. Post-mortem: scheduled for within 24 hours
```

---

## 4. CI/CD Pipeline

### 4.1 GitHub Actions Workflow Details

#### Workflow: .github/workflows/ci.yml

**Triggers:**
- Push to `main` or `sprint-*` branches
- Pull requests to `main` or `sprint-*` branches

**Jobs:**

1. **Linting (ESLint)**
   ```bash
   - Runs: ESLint
   - Timeout: 5 minutes
   - Failure: Continues (non-blocking)
   - Output: Code style issues listed
   ```

2. **Type Checking**
   ```bash
   - Runs: TypeScript compiler (npx tsc --noEmit)
   - Timeout: 10 minutes
   - Failure: Blocks merge
   - Output: Type errors must be fixed
   ```

3. **Unit Tests**
   ```bash
   - Runs: Vitest with --run flag
   - Timeout: 15 minutes
   - Failure: Blocks merge
   - Coverage: 60% minimum (configurable)
   - Output: Test results in PR comment
   ```

4. **Build**
   ```bash
   - Runs: npm run build (Vite)
   - Timeout: 20 minutes
   - Failure: Blocks merge
   - Artifacts: Uploaded to GitHub (24hr retention)
   - Output: dist/ folder ready for deployment
   ```

5. **Security Scan**
   ```bash
   - Runs: npm audit
   - Timeout: 5 minutes
   - Failure: Continues (non-blocking)
   - Output: Vulnerability list (if any)
   ```

#### Workflow: .github/workflows/deploy-staging.yml

**Triggers:**
- Push to `develop` branch
- Manual workflow dispatch

**Jobs:**

1. **Build & Test** (same as CI)
2. **Deploy to Staging**
   ```bash
   - Uploads build artifacts to staging server
   - Sets environment variables
   - Restarts application service
   - Runs health checks
   ```
3. **Smoke Tests**
   ```bash
   - HTTP requests to staging endpoints
   - Login functionality
   - Basic feature validation
   ```
4. **Notifications**
   ```bash
   - Slack: #deployments channel
   - Success: Green checkmark + URL
   - Failure: Red X + error logs
   ```

#### Workflow: .github/workflows/deploy-production.yml

**Triggers:**
- Release tag (v*.*.*)
- Manual workflow dispatch (for emergency deployments)

**Jobs:**

1. **Build & Test** (same as CI)
2. **Blue Environment Deploy**
   ```bash
   - Build production bundle
   - Deploy to blue server (new version)
   - Set environment variables from secrets
   - Health check blue environment
   ```
3. **Smoke Tests on Blue**
   ```bash
   - Full test suite against blue environment
   - All staging tests + production-specific tests
   - 10 minute timeout
   ```
4. **Manual Approval Gate**
   ```bash
   - Requires approval from authorized users
   - Approval expires after 24 hours
   - Comments on PR with approval decision
   ```
5. **Green/Blue Traffic Switch**
   ```bash
   - Switch DNS/load balancer to blue
   - Verify traffic switching success
   - Monitor for 60 seconds
   ```
6. **Monitoring**
   ```bash
   - Continuous error rate monitoring
   - Automatic rollback if threshold exceeded
   - Slack notifications every 5 minutes
   ```
7. **Release Notes**
   ```bash
   - Create GitHub Release
   - Generate changelog from commits
   - Upload build artifacts
   - Send to team
   ```

### 4.2 Build Steps

#### Development Build
```bash
npm run dev
# Output: Dev server on http://localhost:3000
# Features: Hot module replacement, source maps
```

#### Production Build
```bash
npm run build
# Output: dist/ folder with optimized bundle
# Optimizations:
#   - JavaScript minification
#   - CSS minification
#   - Tree-shaking unused code
#   - Code splitting (automatic)
#   - Asset compression (gzip)
```

#### Build Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Build time | < 30s | ~15s |
| Bundle size | < 1MB | ~450KB |
| Main bundle | < 500KB | ~350KB |
| CSS bundle | < 100KB | ~50KB |
| Images | < 20 optimized | ~15 |

### 4.3 Test Execution

#### Unit Tests
```bash
npm run test
# Runner: Vitest
# Framework: React Testing Library + JSDOM
# Coverage: Vitest generates coverage report
# Output: Console + coverage/lcov-report/index.html
```

#### Test File Locations
```
src/test/
├── unit/
│   ├── components/
│   ├── services/
│   └── utils/
├── integration/
└── fixtures/
```

#### Test Requirements

**Minimum Coverage:**
- Statements: 60%
- Branches: 50%
- Functions: 60%
- Lines: 60%

**Required Tests:**
- All utility functions (100% coverage)
- Service layer (80%+ coverage)
- UI components (60%+ coverage)
- Complex business logic (100% coverage)

### 4.4 Artifact Storage

#### Build Artifacts

```bash
# Uploaded after successful build
# Retention: 24 hours (configurable)
# Size limit: 10GB per workflow

gh run download <run-id> -n build-artifacts -D ./dist
```

#### Test Reports

```bash
# Uploaded after test completion
# Formats: JSON, HTML, LCOV
# Available in: Actions > Artifacts

# Download:
gh run download <run-id> -n coverage-report
```

### 4.5 Deployment Triggers

#### Automatic Triggers

| Event | Workflow | Action |
|-------|----------|--------|
| Push to `main` | CI | Run tests, build |
| Push to `develop` | CI + Staging Deploy | Run tests, build, deploy to staging |
| Create release tag | CI + Prod Deploy | Run tests, build, await approval, deploy |
| Manual dispatch | Custom Workflow | Run specified workflow |

#### Manual Triggers

```bash
# Deploy to staging manually
gh workflow run deploy-staging.yml -r develop

# Deploy to production manually (emergency only)
gh workflow run deploy-production.yml -r main --input environment=production
```

### 4.6 Notification Setup

#### Slack Integration

1. **Create Slack App**
   ```bash
   # https://api.slack.com/apps
   # Click "Create New App" > "From scratch"
   # Name: SPFP Deployments
   # Workspace: your-workspace
   ```

2. **Configure Webhooks**
   ```bash
   # In Slack App settings:
   # Incoming Webhooks > Add New Webhook to Workspace
   # Select channel: #deployments
   # Copy Webhook URL
   ```

3. **Add to GitHub Secrets**
   ```bash
   gh secret set SLACK_WEBHOOK --body "https://hooks.slack.com/..."
   ```

4. **Send Notifications from Workflows**
   ```yaml
   - name: Notify Slack
     uses: slackapi/slack-github-action@v1
     with:
       webhook-url: ${{ secrets.SLACK_WEBHOOK }}
       payload: |
         {
           "text": "Deployment: ${{ job.status }}",
           "blocks": [
             {
               "type": "section",
               "text": {
                 "type": "mrkdwn",
                 "text": "*SPFP Deployment*\nStatus: ${{ job.status }}\nURL: https://..."
               }
             }
           ]
         }
   ```

#### Email Notifications

```bash
# Configure in GitHub Actions settings
# Settings > Notifications > Enable email alerts
# Alerts sent for:
#   - Workflow failures
#   - Required approval requests
#   - Deployment completions
```

---

## 5. Monitoring & Alerts

### 5.1 Key Metrics to Monitor

#### Application Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Error rate | < 0.1% | > 0.5% for 5min |
| API response time (p99) | < 500ms | > 1000ms for 5min |
| Page load time (p95) | < 2s | > 3s for 5min |
| User login success rate | > 99% | < 99% for 5min |
| Transaction processing success | > 99.9% | < 99% for 5min |

#### Infrastructure Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Database CPU | < 60% | > 80% |
| Database memory | < 70% | > 85% |
| Database connections | < 80% of limit | > 90% |
| Disk usage | < 60% | > 80% |
| Network bandwidth | < 70% of limit | > 85% |

#### Business Metrics

| Metric | Target | Monitor |
|--------|--------|---------|
| Daily active users | Trending up | > 10% drop |
| Transactions per day | Trending up | > 10% drop |
| Feature usage | Track by feature | Abandoned features |
| User retention (30-day) | > 40% | Alert if < 30% |

### 5.2 Alert Thresholds

#### Critical Alerts (Page On-Call)

```
Conditions for PagerDuty alert:
1. Error rate > 1% for > 5 minutes
2. API response time (p99) > 2000ms for > 10 minutes
3. Database connection failures > 10 per minute
4. HTTP 5xx errors > 20 per minute
5. Payment processing failure rate > 5%
```

#### Warning Alerts (Slack #incidents)

```
Conditions for Slack warning:
1. Error rate > 0.5% for > 5 minutes
2. API response time (p99) > 1000ms for > 5 minutes
3. Database CPU > 80% for > 5 minutes
4. Disk usage > 80%
5. High error rate in specific endpoint
```

### 5.3 Incident Response

#### Incident Classification

**Severity P1 (Critical)**
- System completely down
- All users affected
- Data loss or corruption risk
- Payment processing broken
- Response time: 5 minutes

**Severity P2 (High)**
- Major feature unavailable
- > 50% users affected
- Performance degradation > 50%
- Response time: 15 minutes

**Severity P3 (Medium)**
- Minor feature broken
- < 50% users affected
- Performance degradation 10-50%
- Response time: 1 hour

**Severity P4 (Low)**
- Non-critical bug
- Workaround available
- No user impact
- Response time: Next business day

#### Escalation Procedures

```
Initial Alert → On-Call Engineer → Triage → Escalate if P1/P2 → Incident Commander
                  (5min)          (10min)      (15min)         (20min)
```

#### Incident Runbooks

1. **High Error Rate**
   - Check Sentry for error patterns
   - Review recent deployments
   - Check database connectivity
   - Check external API status
   - Rollback if recent deploy

2. **Slow API Responses**
   - Check database query performance
   - Check database connections
   - Check memory usage
   - Review slow query logs
   - Consider restart or scaling

3. **Database Connection Errors**
   - Verify database is up
   - Check connection pool
   - Verify network connectivity
   - Check Supabase status
   - Restart application if necessary

4. **Authentication Failures**
   - Check Supabase Auth status
   - Verify Google OAuth configuration
   - Check JWT token generation
   - Review auth error logs
   - Clear browser cache and retry

### 5.4 Post-Incident Review

```markdown
# Incident Post-Mortem Template

**Incident:** [Title]
**Date/Time:** [Timestamp UTC]
**Duration:** [Start - End]
**Severity:** P1 / P2 / P3 / P4

## Timeline
- HH:MM: Alert triggered
- HH:MM: On-call engaged
- HH:MM: Root cause identified
- HH:MM: Fix deployed
- HH:MM: Monitoring normalized
- HH:MM: All clear

## Root Cause
[What actually happened]

## Impact
- Users affected: [X]
- Duration: [Y minutes]
- Data loss: Yes/No
- Revenue impact: $[X]

## Contributing Factors
1. [Factor 1]
2. [Factor 2]
3. [Factor 3]

## Corrective Actions
1. [Action 1] - Owner: [Name] - Due: [Date]
2. [Action 2] - Owner: [Name] - Due: [Date]

## Prevention
- [Prevention measure 1]
- [Prevention measure 2]

## Action Items for Next 30 Days
- [ ] Implement [monitoring/alerting/automation]
- [ ] Update [runbook/documentation]
- [ ] Add [test/validation]
```

### 5.5 On-Call Rotation

```
Week of Jan 27: John Doe (john@antigravity.com)
Week of Feb 03: Jane Smith (jane@antigravity.com)
Week of Feb 10: Mike Johnson (mike@antigravity.com)

On-call responsibilities:
- Monitor alerts 24/7
- Respond to critical incidents within 5 minutes
- Perform incident triage
- Execute runbooks
- Communicate status updates
- Document incident timeline
```

**Setup:**
```bash
# PagerDuty or similar
# Configure escalation policy
# Assign engineers to rotation
# Test alert routing
```

---

## 6. Rollback Procedures

### 6.1 How to Rollback

#### Application Rollback (Non-Database Changes)

```bash
# Step 1: Identify last known-good version
git log --oneline | head -10

# Step 2: Revert recent commits
git revert HEAD --no-edit
# OR for multiple commits
git revert HEAD~2..HEAD --no-edit

# Step 3: Force push (main only if emergency)
git push origin main
# CI/CD automatically redeploys previous version

# Step 4: Monitor error rate
# Check Sentry, logs, metrics
# Should return to normal within 5 minutes
```

#### Database Rollback (Schema Changes)

```bash
# If schema migration caused issues:

# Method 1: SQL Rollback (if prepared)
-- Go to Supabase SQL Editor
-- Run reverse migration from docs/migrations/
-- Example:
ALTER TABLE transactions DROP COLUMN updated_at;
DROP INDEX idx_transactions_updated_at;

-- Verify
SELECT * FROM transactions LIMIT 1;

# Method 2: Restore from Backup
-- Contact Supabase support
-- Request point-in-time recovery
-- Estimated time: 30-60 minutes
-- Data loss: Last 24 hours
```

#### Blue/Green Rollback (Automatic)

```
If monitoring detects issues post-deployment:
1. Error rate > 1% for > 5 minutes
2. Database connection failures
3. API timeout rate > 50%

Automatic rollback triggered:
1. Traffic switches back to green (previous version)
2. Incident created in PagerDuty
3. Slack notification sent to #incidents
4. Team notified via email
5. Post-mortem scheduled
```

### 6.2 When to Rollback

**Immediate Rollback (No Questions)**

- System down (HTTP 5xx > 50/min)
- Data loss or corruption detected
- Critical feature completely broken (login, payment)
- Security vulnerability exposed
- Database schema integrity compromised

**Evaluate Rollback (Within 15 minutes)**

- Error rate > 1% for > 5 minutes
- API latency P99 > 2000ms
- Database connection pool exhausted
- Memory usage > 90% for > 5 minutes

**Consider Hotfix (No Rollback)**

- Non-critical feature broken with workaround
- Performance degradation < 50%
- Limited user impact (< 10% of users)
- Hotfix can be deployed within 30 minutes

### 6.3 Rollback Testing

#### Test Rollback Process Monthly

```bash
# First Friday of month: Rollback drill

# Step 1: Tag current production version
git tag backup-production-v1.2.3

# Step 2: Create dummy commit
git commit --allow-empty -m "test: rollback drill"
git push origin main

# Step 3: Verify deployment
# Wait for CI/CD to complete
# Verify rollback triggers automated tests

# Step 4: Actually rollback
git revert HEAD --no-edit
git push origin main

# Step 5: Verify recovery
# Check error rates
# Verify data integrity
# Document any issues

# Step 6: Document findings
# Update rollback procedures
# Update runbooks if needed
# Share learnings with team
```

### 6.4 Rollback Communication

```
Template: Slack notification
Channel: #incidents

@channel Production Rollback Initiated
Severity: [P1/P2/P3]
Service: SPFP
Reason: [Root cause]
Impact: ~[X users] affected
Duration: [Y minutes]
Status: INVESTIGATING

Updates every 5 minutes in this thread 🧵
```

```
Template: Email notification
To: team@antigravity.com
Subject: [INCIDENT] SPFP Production Rollback

Timeline:
- 14:32 UTC: Alert triggered
- 14:35 UTC: Root cause identified
- 14:38 UTC: Rollback initiated
- 14:42 UTC: All clear

Next steps:
- Post-mortem scheduled for [Date/Time]
- Investigate root cause
- Implement preventive measures
```

---

## 7. Performance Monitoring

### 7.1 Lighthouse Scores

#### Target Scores (Lighthouse)

| Metric | Target | P1 if Below |
|--------|--------|-------------|
| Performance | > 85 | < 70 |
| Accessibility | > 90 | < 80 |
| Best Practices | > 90 | < 80 |
| SEO | > 90 | < 80 |

#### Monitor Lighthouse Metrics

```bash
# Run locally
npx lighthouse https://staging.spfp.app --view

# Automated in CI
# GitHub Actions: lighthouse-action
# Reports posted to PR comments
# Historical tracking in docs/performance/

# Production monitoring (via external service)
# Google PageSpeed Insights API
# Monthly reports to team
```

#### Performance Improvements

1. **Bundle Size Reduction**
   - Target: Keep main bundle < 400KB
   - Monitor: `npm run build` output
   - Reduce: Lazy load components, dynamic imports

2. **Image Optimization**
   - Format: Use WebP with fallbacks
   - Size: Compress all images
   - Lazy load: Intersection Observer API

3. **Code Splitting**
   - Vite automatic code splitting
   - Monitor in network tab (DevTools)
   - Target: Initial load < 50KB

### 7.2 Bundle Size Tracking

#### Track Bundle Size

```bash
# Analyze bundle
npm run build
du -sh dist/

# Expected sizes:
# - Main bundle: 300-400KB (gzipped: 80-120KB)
# - CSS bundle: 40-60KB (gzipped: 10-15KB)
# - Total assets: 500-700KB

# If bundle grows > 10%:
# 1. Investigate what changed
# 2. Use bundle analyzer:
#    npm install --save-dev rollup-plugin-bundle-analyzer
# 3. Review dependencies
# 4. Consider removing or replacing large packages
```

#### Automated Bundle Size Checks

```yaml
# In GitHub Actions
- name: Check bundle size
  run: |
    npm run build
    size=$(du -sk dist/ | cut -f1)
    max_size=512  # KB
    if [ $size -gt $max_size ]; then
      echo "❌ Bundle size ($size KB) exceeds limit ($max_size KB)"
      exit 1
    fi
```

### 7.3 API Response Times

#### Monitor Response Times

```
Endpoint Targets (p95):
- GET /auth/session: 100ms
- GET /transactions: 300ms
- POST /transactions: 200ms
- GET /dashboard: 500ms
- POST /ai/insights: 3000ms (Gemini call)
```

#### Track via Application

```typescript
// src/services/performanceService.ts
export const trackApiResponse = (endpoint: string, duration: number) => {
  // Send to monitoring service
  if (duration > THRESHOLD) {
    console.warn(`Slow API: ${endpoint} took ${duration}ms`);
  }
};
```

### 7.4 Database Query Performance

#### Monitor Slow Queries

```sql
-- Enable logging in Supabase
-- Settings > Logs > Query Performance

-- Identify slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- Add indexes if needed
CREATE INDEX idx_transactions_user_date
ON transactions(user_id, created_at DESC);
```

#### Target Query Times

| Query | Target (p99) | Alert |
|-------|-------------|-------|
| Single row lookup | 5ms | > 20ms |
| 100 row fetch | 50ms | > 200ms |
| 1000 row fetch | 500ms | > 1000ms |
| Aggregation query | 100ms | > 500ms |

### 7.5 Error Rates

#### Track Error Rate

```
Target: < 0.1% error rate across all endpoints

Calculate:
errors_5min = count of HTTP 5xx responses in last 5 minutes
requests_5min = total requests in last 5 minutes
error_rate = errors_5min / requests_5min * 100

Alert if error_rate > 0.5%
```

#### Error Rate by Endpoint

```
Monitor separately:
- Authentication: 0% error rate expected
- Transactions: < 0.1%
- AI Insights: < 1% (Gemini API limitations)
- File exports: < 0.5%
```

---

## 8. Security Checklist

### 8.1 Pre-Deployment Security Checklist

```
Before every deployment to production:

Database Security
[ ] RLS policies enabled on all tables
[ ] RLS policies tested with different user roles
[ ] No public tables without RLS
[ ] Service role key not exposed in frontend
[ ] Database password rotated in last 90 days

API Security
[ ] CORS configured to production domain only
[ ] Rate limiting enabled on API endpoints
[ ] Authentication required on all protected endpoints
[ ] JWT token expiration set (< 1 hour recommended)
[ ] Refresh token rotation implemented

Frontend Security
[ ] No secrets in source code
[ ] No API keys in JavaScript bundles
[ ] HTTPS enforced
[ ] CSP headers configured
[ ] X-Frame-Options set (DENY or SAMEORIGIN)

Secrets Management
[ ] All .env files in .gitignore
[ ] GitHub Secrets properly configured
[ ] No credentials in git history
[ ] Secrets not logged in CI/CD
[ ] Service accounts rotated regularly
```

### 8.2 RLS Policies Verification

#### Verify RLS Policies Enabled

```sql
-- Check RLS on all tables
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected output: all public tables should have rowsecurity = true
```

#### Test RLS Policies

```sql
-- Test policy isolation
-- As user 123:
SET request.jwt.claim.sub = '123';
SELECT id FROM transactions;
-- Result: Should see only user 123's transactions

-- As user 456:
SET request.jwt.claim.sub = '456';
SELECT id FROM transactions;
-- Result: Should see only user 456's transactions

-- As unauthenticated:
RESET request.jwt.claim.sub;
SELECT id FROM transactions;
-- Result: Should error (no access)
```

### 8.3 Dependency Auditing

#### Audit Dependencies

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Detailed report
npm audit --json | jq '.vulnerabilities'

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

#### Dependency Review in CI

```yaml
# Automated in GitHub Actions
- name: Dependency audit
  run: npm audit --audit-level=moderate
```

### 8.4 CORS Configuration

#### Configure CORS Headers

```typescript
// Supabase handles CORS automatically
// Add custom CORS headers if needed in reverse proxy

// For Vercel deployment:
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://spfp.app"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        }
      ]
    }
  ]
}
```

### 8.5 Rate Limiting

#### Enable Rate Limiting

```sql
-- If using custom backend
-- Implement rate limiting per user/IP

-- For frontend API calls:
-- Limit requests from client-side:
// src/services/apiService.ts
const rateLimit = {
  requests: 100,
  window: 60000 // 1 minute
};

// Check before making API call
if (requestCount > rateLimit.requests) {
  throw new Error('Rate limit exceeded');
}
```

---

## 9. Common Issues & Fixes

### 9.1 Build Failures

#### Issue: "Cannot find module" errors

**Symptoms:**
```
Error: Cannot find module '@/components/MyComponent'
```

**Solutions:**
```bash
# 1. Clear cache
rm -rf node_modules package-lock.json
npm install

# 2. Check path alias in tsconfig.json
# "@/*": ["./src/*"]

# 3. Check file exists
ls src/components/MyComponent.tsx

# 4. Verify import path
# ❌ import { Component } from '@/components'
# ✅ import { Component } from '@/components/MyComponent'
```

#### Issue: TypeScript errors during build

**Symptoms:**
```
error TS2339: Property 'X' does not exist on type 'Y'.
```

**Solutions:**
```bash
# 1. Run local type check
npx tsc --noEmit

# 2. Fix type errors in reported files
# See error message for file and line number

# 3. Add type definitions if needed
npm install --save-dev @types/package-name

# 4. Use type assertion only as last resort
const value = data as unknown as MyType;
```

### 9.2 Test Failures

#### Issue: Tests timeout

**Symptoms:**
```
Timeout: async test failed to complete in 5000ms
```

**Solutions:**
```bash
# 1. Increase timeout for specific test
it('should fetch data', async () => {
  // test code
}, 10000); // 10 second timeout

# 2. Check for unresolved promises
// Make sure all async operations complete

# 3. Mock external services
import { vi } from 'vitest';
vi.mock('@/services/geminiService');

# 4. Check for infinite loops
// Use debugger to step through test
```

#### Issue: "Cannot find module" in tests

**Solutions:**
```bash
# 1. Install test dependencies
npm install --save-dev vitest jsdom

# 2. Configure vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true
  }
});

# 3. Add setup file for test globals
npm install --save-dev @testing-library/jest-dom
```

### 9.3 Database Connection Issues

#### Issue: "Connection refused"

**Symptoms:**
```
Error: failed to connect to database
Error: ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
```bash
# 1. Check Supabase status
# https://status.supabase.com

# 2. Verify connection string
# Check VITE_SUPABASE_URL in .env.local

# 3. Test connection
npx supabase status

# 4. Check network/firewall
ping jqmlloimcgsfjhhbenzk.supabase.co

# 5. Restart application
npm run dev
```

#### Issue: "Authentication failed" to database

**Symptoms:**
```
Error: Failed to authenticate user
Error: JWT expired
```

**Solutions:**
```bash
# 1. Verify Supabase keys
# Check VITE_SUPABASE_ANON_KEY in .env.local

# 2. Regenerate keys if compromised
# Supabase console > Settings > API > Regenerate

# 3. Clear localStorage
localStorage.clear();

# 4. Logout and login again
# Should generate fresh JWT token
```

### 9.4 TypeScript Type Errors

#### Issue: "Cannot find type definition"

**Solutions:**
```bash
# Install type definitions
npm install --save-dev @types/node @types/react

# Or create types manually
// src/types/custom.d.ts
declare module 'package-name' {
  interface MyType {
    // type definition
  }
}
```

#### Issue: "Type 'X' has no properties in common with type 'Y'"

**Solutions:**
```typescript
// ❌ Wrong: incompatible types
const x: TypeA = valueOfTypeB;

// ✅ Right: convert types safely
const x: TypeA = {
  ...valueOfTypeB,
  // override incompatible fields
};

// Or use type assertion (use sparingly)
const x = valueOfTypeB as unknown as TypeA;
```

### 9.5 Performance Regressions

#### Issue: Build time increased

**Solutions:**
```bash
# 1. Analyze what changed
git log --oneline | head -5
git diff HEAD~1 HEAD

# 2. Check dependency size
npm ls | grep "heavy-package"

# 3. Review new imports
# Look for unoptimized packages

# 4. Consider lazy loading
// Before: import heavy from './heavy';
// After: const heavy = lazy(() => import('./heavy'));

# 5. Use bundle analyzer
npm install --save-dev rollup-plugin-bundle-analyzer
```

#### Issue: Application runs slow

**Solutions:**
```bash
# 1. Check browser DevTools
# Performance tab > Record > Analyze

# 2. Identify slow components
React.Profiler > Take measurements

# 3. Check database queries
Supabase > Logs > Query Performance

# 4. Optimize rendering
// Use memo for expensive components
const MyComponent = memo(({ data }) => {
  // component code
});

# 5. Lazy load features
const Component = lazy(() => import('./Component'));
```

---

## 10. Release Notes Template

### Release Notes Structure

```markdown
# SPFP Release v1.X.X

**Release Date:** YYYY-MM-DD
**Status:** [Stable | RC | Beta]
**Release Manager:** [Name]

## Highlights

- [Key feature 1]
- [Key improvement 1]
- [Critical fix 1]

## What's New

### Features

#### Feature Title (ID-123)
- Description of feature
- Benefits/use cases
- Screenshots/demo link

#### Another Feature
- ...

### Improvements

#### Performance Enhancement
- What improved: [X% faster]
- How: [Technical details]
- Impact: [User benefit]

#### UI/UX Improvements
- Updated [component] for better [usability]
- Improved accessibility scores to [X]

## Bug Fixes

### Critical Fixes
- Fixed: [Bug description] (#123)
  - Impact: [Who was affected]
  - Workaround: [If available]

### Other Fixes
- Fixed: [Bug] (#124)
- Fixed: [Bug] (#125)

## Breaking Changes

⚠️ **Important:** This release includes breaking changes

### Changed API Endpoints
```
GET /transactions → GET /api/v2/transactions
```

### Removed Features
- Removed: [Old feature] (replaced by [new feature])

### Database Schema Changes
- Added: `transactions.updated_at` field
- Migration: Run `npm run migrate` after upgrade

### Migration Instructions

1. **Backup your data**
   ```bash
   supabase db dump --local > backup.sql
   ```

2. **Pull latest changes**
   ```bash
   git pull origin main
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run migrations**
   ```bash
   npm run migrate
   ```

5. **Restart application**
   ```bash
   npm run build
   npm run preview
   ```

## Known Issues

### Issue: [Title]
- **Affected versions:** v1.X.X
- **Status:** [Open | In Progress | Will Fix in v1.X.X+1]
- **Workaround:** [If available]
- **Issue tracker:** [Link to issue]

### Issue: [Another issue]
- ...

## Security Updates

### CVE-YYYY-NNNNN: [Vulnerability]
- **Severity:** [Critical | High | Medium | Low]
- **Affected versions:** v1.0.0 - v1.X.X
- **Fixed in:** v1.X.X
- **Details:** [Brief description]
- **Action required:** Update to v1.X.X

## Deprecations

### Deprecation Notice
- `oldFunction()` is deprecated and will be removed in v2.0.0
- Migration: Use `newFunction()` instead
- Timeline: [Removal date]

## Performance Benchmarks

| Metric | v1.X-1.X | v1.X.X | Change |
|--------|----------|--------|--------|
| Page load (p95) | 2.5s | 2.0s | 20% ↓ |
| Bundle size | 450KB | 425KB | 5.5% ↓ |
| API response (p99) | 500ms | 350ms | 30% ↓ |

## Dependency Updates

### Updated
- React: 19.1.0 → 19.2.1
- TypeScript: 5.7.2 → 5.8.2
- @supabase/supabase-js: 2.88.0 → 2.89.0

### Added
- recharts: ^3.5.1 (new)

## Contributors

- [Name] (@github-handle)
- [Name] (@github-handle)

## Download & Installation

```bash
# Update via npm
npm update

# Or reinstall from scratch
npm install @antigravity/spfp@1.X.X
```

**GitHub Release:** [Link to release]
**Release Notes Full:** [Link to full changelog]
**Issues:** [Link to issue tracker]

---

## Support

- **Documentation:** [Link]
- **Community:** [Discord/Slack]
- **Email:** support@antigravity.com
- **Report Issues:** [GitHub Issues]

---

*SPFP DevOps Team*
```

### Release Checklist

```markdown
# Pre-Release Checklist for v1.X.X

- [ ] All tests passing in CI/CD
- [ ] All PR reviews completed
- [ ] Security audit passed
- [ ] Performance benchmarks acceptable
- [ ] Documentation updated
- [ ] Release notes drafted
- [ ] Database migration scripts prepared
- [ ] Rollback plan documented
- [ ] Team notified of release schedule
- [ ] Staging deployment successful
- [ ] User acceptance testing complete
- [ ] Production secrets configured
- [ ] Monitoring alerts configured
- [ ] On-call engineer assigned
- [ ] Communication templates prepared
- [ ] Release date confirmed with team

**Release approved by:** [Name]
**Release date/time:** [Date/Time UTC]
```

---

## Additional Resources

### Documentation Files

- `docs/architecture/tech-stack.md` - Technology stack overview
- `docs/architecture/coding-standards.md` - Code style guide
- `docs/migrations/` - Database migration scripts
- `docs/monitoring/` - Monitoring setup guides
- `docs/planning/` - Sprint roadmaps and planning

### External Links

- **Supabase Docs:** https://supabase.com/docs
- **React Docs:** https://react.dev
- **TypeScript Docs:** https://www.typescriptlang.org/docs
- **Vite Docs:** https://vitejs.dev
- **GitHub Actions:** https://docs.github.com/actions

### Tools & Services

- **Supabase:** https://supabase.com
- **GitHub:** https://github.com
- **Sentry:** https://sentry.io
- **Vercel:** https://vercel.com (if using)
- **Uptime Robot:** https://uptimerobot.com

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-27 | Initial runbook creation |

---

**Last Updated:** 2026-01-27
**Next Review:** 2026-02-27
**Owner:** DevOps Engineer (Gage)
