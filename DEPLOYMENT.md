# SPFP Deployment Guide

This document describes the deployment process, release management, and production procedures for SPFP.

## Table of Contents

1. [Overview](#overview)
2. [Environments](#environments)
3. [Release Process](#release-process)
4. [Deployment Procedures](#deployment-procedures)
5. [Rollback Procedures](#rollback-procedures)
6. [Monitoring & Alerts](#monitoring--alerts)
7. [Security Checklist](#security-checklist)
8. [Troubleshooting](#troubleshooting)

## Overview

SPFP uses a structured release process aligned with sprint-based development:

- **Sprint 0**: Foundation & Setup
- **Sprint 1**: Security & Types
- **Sprint 2-3**: Architecture & Core
- **Sprint 4**: Frontend Development
- **Sprint 5-6**: Database & Integration

Each sprint produces a release that goes through staging before production deployment.

## Environments

### Development

**Access**: Local machine or dev branch
**Purpose**: Feature development and testing
**Database**: Local Supabase instance or staging

```bash
npm run dev
# Runs on http://localhost:3000
```

### Staging

**Access**: Staging URL (to be configured)
**Purpose**: Pre-production validation
**Database**: Staging Supabase instance
**Users**: QA team, Product team, select beta users

**Deployment:**
```bash
npm run build
# Deploy to staging hosting (AWS, Vercel, Netlify, etc.)
```

### Production

**Access**: https://spfp.app (to be configured)
**Purpose**: Live user environment
**Database**: Production Supabase instance
**Users**: All end users

**Deployment:**
```bash
npm run build
# Deploy to production hosting with CDN
```

## Release Process

### 1. Release Planning

Before each sprint release:

1. **Review Completed Stories**
   - Check all sprint stories in `docs/stories/`
   - Verify acceptance criteria are met
   - Confirm testing is complete

2. **Create Release Checklist**
   ```markdown
   Release: v0.1.0 (Sprint 1)

   - [ ] All stories completed and tested
   - [ ] Breaking changes documented
   - [ ] Migrations prepared
   - [ ] Environment variables updated
   - [ ] Staging deployment successful
   - [ ] Product sign-off received
   - [ ] Security review passed
   ```

3. **Create Release Branch**
   ```bash
   git checkout -b release/v0.1.0 main
   ```

### 2. Pre-Release Tasks

```bash
# 1. Update version in package.json
npm version minor --no-git-tag-version

# 2. Update CHANGELOG.md
# Document all changes, bug fixes, new features

# 3. Run full test suite
npm run test

# 4. Type check
npx tsc --noEmit

# 5. Build preview
npm run build
npm run preview
```

### 3. Release to Staging

```bash
# 1. Commit release changes
git add .
git commit -m "chore: prepare release v0.1.0"

# 2. Push to release branch
git push origin release/v0.1.0

# 3. Create PR to main
gh pr create --title "Release: v0.1.0" \
  --body "Release Sprint 1: Security & Types"

# 4. Get approval
# Wait for reviews and CI to pass

# 5. Merge to main
gh pr merge --squash

# 6. Deploy to staging
# Use deployment script or manual process
./scripts/deploy-staging.sh v0.1.0
```

### 4. Staging Validation

**QA Testing (1-2 days)**
- [ ] Core features work as designed
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Performance acceptable
- [ ] Accessibility compliance
- [ ] Cross-browser testing

**Product Validation**
- [ ] User workflows completed successfully
- [ ] Data accuracy verified
- [ ] Reports generated correctly
- [ ] Export (PDF/CSV) functions work

**Security Validation**
- [ ] Authentication flows work
- [ ] Authorization is enforced
- [ ] Sensitive data is masked
- [ ] API keys are not exposed

### 5. Production Release

```bash
# 1. Create release tag
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0

# 2. Create GitHub Release
gh release create v0.1.0 \
  --title "SPFP v0.1.0" \
  --notes "Sprint 1 release with security improvements"

# 3. Deploy to production
./scripts/deploy-production.sh v0.1.0

# 4. Verify deployment
# Test critical paths in production
# Monitor logs and alerts

# 5. Announce release
# Notify users via email/changelog
```

## Deployment Procedures

### Automated Deployment (GitHub Actions)

The CI/CD pipeline automatically tests all commits:

```yaml
Trigger: Push to main or PR
├── Lint Check (TypeScript)
├── Unit Tests (Vitest)
├── Build Verification
├── Security Scan (npm audit)
└── Deploy to Production (if main branch)
```

**Requirements for automatic deployment:**
- All tests pass
- Type checking succeeds
- No linting errors
- Security audit passes (no high vulnerabilities)

### Manual Deployment

If automated deployment is not available:

```bash
# 1. Build the application
npm install
npm run build

# 2. Run tests one more time
npm test

# 3. Deploy build output (dist/) to hosting
# Option A: AWS S3 + CloudFront
aws s3 sync dist/ s3://spfp-production/ --delete
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"

# Option B: Vercel
vercel --prod

# Option C: Netlify
netlify deploy --prod --dir=dist

# Option D: Docker
docker build -t spfp:v0.1.0 .
docker push spfp:v0.1.0
# Kubernetes deployment follows
```

### Environment Setup

**Staging Environment Variables** (`.env.staging`)
```bash
VITE_API_URL=https://staging-api.spfp.app
VITE_SUPABASE_URL=https://staging-supabase-url.com
VITE_SUPABASE_KEY=staging-key
GEMINI_API_KEY=staging-gemini-key
NODE_ENV=production
```

**Production Environment Variables** (`.env.production`)
```bash
VITE_API_URL=https://api.spfp.app
VITE_SUPABASE_URL=https://production-supabase-url.com
VITE_SUPABASE_KEY=production-key
GEMINI_API_KEY=production-gemini-key
NODE_ENV=production
```

### Database Migrations

For schema changes:

```bash
# 1. Create migration in Supabase
supabase migration new add_transactions_table

# 2. Write migration SQL
# migrations/YYYYMMDDHHMMSS_add_transactions_table.sql

# 3. Test locally
supabase db reset
npm test

# 4. Apply to staging
supabase db push --remote staging

# 5. Validate on staging
# Test affected features

# 6. Apply to production
supabase db push --remote production

# 7. Monitor for issues
# Check logs, database performance
```

## Rollback Procedures

### Quick Rollback

If critical issues are discovered immediately after deployment:

```bash
# 1. Identify the previous stable version
git tag | grep v

# 2. Rollback using version tag
./scripts/deploy-production.sh v0.0.9

# 3. Verify rollback
# Test critical paths
# Check monitoring dashboards

# 4. Communicate incident
# Notify team and users
# Document what went wrong
```

### Partial Rollback

If only certain features are affected:

```bash
# 1. Identify affected feature
# E.g., investment tracking

# 2. Temporarily disable feature
# Set feature flag to false
# Hide UI elements

# 3. Deploy hotfix
git checkout -b hotfix/fix-investment-bug main
# Make fixes
npm test
git push
gh pr create  # Get approval
# Deploy

# 4. Re-enable feature in next release
```

### Database Rollback

If database changes cause issues:

```bash
# 1. Identify problematic migration
# E.g., V2__add_column.sql

# 2. Create rollback migration
supabase migration new rollback_add_column

# 3. In migration file
ALTER TABLE transactions DROP COLUMN new_column;

# 4. Test locally
supabase db reset

# 5. Apply to production
supabase db push --remote production

# 6. Verify data integrity
SELECT COUNT(*) FROM transactions;
```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Application Health**
   - Response time (< 2 seconds)
   - Error rate (< 0.1%)
   - Uptime (99.9%)

2. **Database Health**
   - Connection count
   - Query performance
   - Disk usage
   - Row counts

3. **User Activity**
   - Active users
   - Feature usage
   - Error frequency
   - User feedback

### Monitoring Setup

```bash
# 1. Set up error tracking (Sentry)
npm install @sentry/react
# Configure in src/main.tsx

# 2. Set up analytics (Google Analytics)
npm install react-ga4
# Configure in src/main.tsx

# 3. Set up performance monitoring
# Use browser DevTools and Supabase dashboard

# 4. Set up logging
# Check Supabase logs, Docker logs, server logs
```

### Alert Rules

| Alert | Condition | Action |
|-------|-----------|--------|
| High Error Rate | > 1% errors | Page on-call engineer |
| Slow Response | > 5s avg | Review and optimize |
| Database Down | Unavailable | Failover/restore |
| High Traffic | > 2x normal | Scale resources |
| Security Issue | CVE detected | Immediate hotfix |

## Security Checklist

Before every production deployment:

- [ ] No API keys or secrets in code
- [ ] Environment variables properly configured
- [ ] CORS headers configured correctly
- [ ] Authentication flows tested
- [ ] Authorization rules validated
- [ ] HTTPS enabled
- [ ] Security headers set (CSP, X-Frame-Options, etc.)
- [ ] Dependencies updated and audited
- [ ] SQL injection protections in place
- [ ] XSS protections enabled
- [ ] CSRF tokens implemented
- [ ] Rate limiting configured
- [ ] Sensitive data encrypted
- [ ] Logs sanitized (no passwords, tokens)
- [ ] Security team sign-off received

## Troubleshooting

### Build Fails

```bash
# 1. Clear cache
rm -rf node_modules dist
npm install

# 2. Check Node version
node --version  # Should be 18+

# 3. Check for TypeScript errors
npx tsc --noEmit

# 4. Run with verbose output
npm run build -- --debug
```

### Tests Fail

```bash
# 1. Run tests locally
npm test

# 2. Check for environment setup
echo $GEMINI_API_KEY

# 3. Reset test cache
npm test -- --clearCache

# 4. Run specific test
npm test -- transactions.test.ts
```

### Deployment Fails

```bash
# 1. Check deployment logs
# AWS CloudWatch, Vercel, Netlify dashboard

# 2. Verify environment variables
echo $VITE_SUPABASE_URL

# 3. Check build artifact
ls -lah dist/

# 4. Test locally with production config
NODE_ENV=production npm run preview
```

### Application Crashes in Production

```bash
# 1. Check error logs
# Browser console, Sentry, server logs

# 2. Review recent changes
git log --oneline -10

# 3. Check database connectivity
# Verify Supabase status

# 4. Check API rate limits
# Verify Gemini API quota

# 5. Rollback if critical
./scripts/deploy-production.sh previous-version
```

### Performance Issues

```bash
# 1. Analyze bundle size
npm run build -- --analyze

# 2. Profile in browser DevTools
# Performance tab, Profiler

# 3. Check database queries
# Supabase query performance

# 4. Check network requests
# Network tab, filter slow requests

# 5. Optimize or rollback
# Code splitting, lazy loading, etc.
```

## Release Calendar

| Sprint | Version | Dates | Status |
|--------|---------|-------|--------|
| Sprint 0 | v0.1.0 | Jan 26 - Feb 9 | In Progress |
| Sprint 1 | v0.2.0 | Feb 9 - Feb 23 | Planned |
| Sprint 2-3 | v0.3.0 | Feb 23 - Mar 9 | Planned |
| Sprint 4 | v0.4.0 | Mar 9 - Mar 23 | Planned |
| Sprint 5-6 | v1.0.0 | Mar 23 - Apr 6 | Planned |

---

For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).
For contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).
