# SPFP Go-Live Checklist - April 6, 2026

**Go-Live Date:** April 6, 2026
**System:** SPFP (Sistema de Planejamento Financeiro Pessoal)
**Scope:** Production launch with full financial data management, AI insights, and admin CRM
**Target Users:** Initial cohort + early adopters
**Estimated Impact:** 500+ active users day 1

---

## 1. PRE-GO-LIVE WEEK (March 30 - April 5)

### Code Freeze & Version Management
- [ ] **Code Freeze Date:** Friday, March 31, 2026 EOD (UTC-3)
- [ ] Tag release: `v1.0.0-final` on main branch
- [ ] Create release notes documenting all features, bug fixes, and known limitations
- [ ] Lock all dependencies (run `npm ci --frozen-lockfile` to verify)
- [ ] Document all environment variables required for production
- [ ] Backup production database schema and seed scripts
- [ ] Create rollback container images tagged as `spfp-v0.9.9-backup`

### Final Testing Window (Mon-Tue: April 1-2)
- [ ] Run full E2E test suite: `npm run test:e2e -- --reporter=html`
  - Target: All 50+ critical user journeys passing
  - Categories: Auth flow, transaction mgmt, budget tracking, AI insights, exports
- [ ] Run unit tests: `npm run test -- --coverage`
  - Target: >80% code coverage maintained
  - Focus: Context providers, services, utilities
- [ ] Run integration tests: `npm run test:integration`
  - Focus: Supabase sync, Gemini API fallbacks, auth flows
- [ ] Performance baseline testing:
  - [ ] Lighthouse CI: Target Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)
  - [ ] Bundle size analysis: `npm run build -- --analyze`
  - [ ] Database query performance: Check slow query logs
  - [ ] API response times: <500ms P95 for all endpoints
- [ ] Security scanning:
  - [ ] Run `npm audit` - zero critical vulnerabilities
  - [ ] OWASP ZAP scan on staging environment
  - [ ] Check for exposed API keys or secrets in code
  - [ ] Verify `.env` and `.env.local` are in `.gitignore`
- [ ] Accessibility testing:
  - [ ] WCAG AA compliance: Run axe DevTools on all major pages
  - [ ] Keyboard navigation: Tab through all interactive elements
  - [ ] Screen reader testing: Test with NVDA on Windows
- [ ] Browser & device compatibility:
  - [ ] Chrome/Edge (latest 2 versions)
  - [ ] Firefox (latest 2 versions)
  - [ ] Safari (latest 2 versions)
  - [ ] Mobile: iOS Safari, Chrome Android
- [ ] Data integrity validation:
  - [ ] Export/import transactions without loss
  - [ ] Verify recurring transaction calculations
  - [ ] Test goal progress tracking accuracy
  - [ ] Validate budget vs. actual calculations
  - [ ] Check investment cost basis calculations

### Stakeholder Notifications (Wed-Thu: April 3-4)
- [ ] Send go-live announcement to all team members
- [ ] Customer communication: Send user onboarding email to early access group
- [ ] Create status page: `status.spfp.app` with go-live schedule
- [ ] Prepare customer support documentation:
  - [ ] FAQ document
  - [ ] Getting started guide
  - [ ] Video tutorials (3-5 minute segments)
  - [ ] Support ticket escalation procedures
- [ ] Brief customer success team on top 10 anticipated questions
- [ ] Create incident communication templates for support team
- [ ] Schedule standby support coverage: 7am-11pm UTC-3 on launch day
- [ ] Notify executives and stakeholders: Share go-live briefing deck

### Rollback Plan Activation (Thu: April 4)
- [ ] Document rollback decision criteria:
  - [ ] Data loss detected in any transaction
  - [ ] Authentication failure affecting >10% of users
  - [ ] RLS policies failing (exposing cross-user data)
  - [ ] TypeScript/compilation errors in production
  - [ ] Performance degradation >50% vs. baseline
  - [ ] Gemini API consistently unavailable (>5 min)
- [ ] Create rollback runbook:
  - [ ] Step 1: Declare incident (Slack: #incident-response)
  - [ ] Step 2: Revert to `spfp-v0.9.9-backup` container
  - [ ] Step 3: Restore database from April 5 backup
  - [ ] Step 4: Verify auth and data access
  - [ ] Step 5: Communicate rollback to users (status page)
  - [ ] Step 6: Post-incident review within 24h
- [ ] Test rollback procedure on staging environment
- [ ] Verify backup recovery time objective (RTO): <15 minutes
- [ ] Verify backup recovery point objective (RPO): <1 hour
- [ ] Store rollback decision matrix in `docs/deployment/ROLLBACK-MATRIX.md`
- [ ] Brief engineering team on rollback procedures
- [ ] Verify database backup integrity: Run `pg_dump` validation

### Monitoring Setup (Thu-Fri: April 4-5)
- [ ] Configure Sentry for error tracking:
  - [ ] Set release to `v1.0.0`
  - [ ] Enable JS error monitoring
  - [ ] Set up alerts for >5 errors/minute
- [ ] Configure cloud monitoring:
  - [ ] CPU utilization alerts (>80%)
  - [ ] Memory utilization alerts (>85%)
  - [ ] Disk space alerts (>90% full)
  - [ ] Database connection pool exhaustion
- [ ] Set up analytics:
  - [ ] Google Analytics 4: Verify all page views tracked
  - [ ] Custom events: Track feature usage (transactions, budgets, insights)
  - [ ] Conversion funnel: Sign-up → First transaction → Insights used
- [ ] Configure logging aggregation:
  - [ ] CloudWatch: All API logs
  - [ ] Supabase logs: Auth, database, real-time events
  - [ ] Frontend errors: Sentry + custom logger
- [ ] Create monitoring dashboard:
  - [ ] Real-time user count (Google Analytics)
  - [ ] API error rate (CloudWatch)
  - [ ] Gemini API availability (Sentry)
  - [ ] Database performance (RDS metrics)
  - [ ] Infrastructure metrics (CPU, memory, disk)
- [ ] Set up on-call rotation: 24h coverage for first 72h post-launch
- [ ] Verify alerting channels:
  - [ ] Slack: #incident-response
  - [ ] Email: on-call@spfp.app
  - [ ] Phone: SMS backup for critical alerts
- [ ] Load test on production infrastructure:
  - [ ] Simulate 500 concurrent users for 30 minutes
  - [ ] Verify no database connection pool exhaustion
  - [ ] Check real-time sync stability under load
  - [ ] Monitor Gemini API rate limits

---

## 2. GO-LIVE DAY CHECKLIST (April 6, 2026)

### 6:00 AM - 8:00 AM UTC-3: Morning Standby
- [ ] All hands in Slack #incident-response channel
- [ ] Infrastructure team: Verify all systems operational
  - [ ] Supabase cluster health
  - [ ] Container registry accessible
  - [ ] CDN cache purged
  - [ ] Database backups current
- [ ] DevOps: Verify monitoring dashboards active
- [ ] Product: Final approval from stakeholders to proceed

### 8:00 AM - 10:00 AM UTC-3: Database Migrations
- [ ] Run pre-production schema validation:
  - [ ] Execute migration scripts on staging: `npm run migrate:staging`
  - [ ] Verify no errors in migration logs
  - [ ] Validate data integrity after migration
- [ ] Production migration execution:
  - [ ] Create production database backup: `pg_dump > spfp_20260406_pre-launch.sql`
  - [ ] Execute migrations: `npm run migrate:production`
  - [ ] Verify schema matches expected state
  - [ ] Test user creation in production
  - [ ] Verify RLS policies are applied correctly
- [ ] Seed production data (if needed):
  - [ ] Load initial categories, account types
  - [ ] Verify sample data structure (do NOT add production user data)
- [ ] Validate data access:
  - [ ] Create test user, verify isolation from other users
  - [ ] Test RLS: User A cannot access User B's transactions
  - [ ] Verify admin impersonation works correctly

### 9:00 AM - 11:00 AM UTC-3: Feature Flags & Configuration
- [ ] Enable all production features:
  - [ ] Transaction management: ENABLED
  - [ ] Budget tracking: ENABLED
  - [ ] Investment management: ENABLED
  - [ ] Goals tracking: ENABLED
  - [ ] AI Insights: ENABLED (with rate limiting)
  - [ ] Admin CRM: ENABLED (restricted to admins only)
  - [ ] PDF/CSV exports: ENABLED
  - [ ] Recurring transactions: ENABLED
- [ ] Verify environment variables:
  - [ ] GEMINI_API_KEY: Set and valid
  - [ ] SUPABASE_URL: Production endpoint
  - [ ] SUPABASE_ANON_KEY: Production key
  - [ ] GOOGLE_OAUTH_CLIENT_ID: Correct for production domain
  - [ ] NODE_ENV: `production`
  - [ ] BUILD_TARGET: `production` (optimized bundle)
- [ ] Configure rate limiting:
  - [ ] API calls: 100 req/min per user
  - [ ] Gemini API: 10 requests/minute (Google Gemini quotas)
  - [ ] Auth attempts: 5 failed attempts → 15 min lockout
  - [ ] Transaction upload: Max 1000 transactions/import
- [ ] Disable debug logging:
  - [ ] Remove `console.log` outputs (or set log level to ERROR only)
  - [ ] Disable verbose Supabase logging
- [ ] Verify feature gating:
  - [ ] Non-admin users cannot access `/admin` route
  - [ ] Free tier users: Limited to 50 transactions/month (if applicable)
  - [ ] Premium features: Show upgrade prompts if applicable

### 10:00 AM - 12:00 PM UTC-3: Monitoring Alerts Activation
- [ ] Verify all monitoring systems operational:
  - [ ] Sentry: Receiving events, alerts configured
  - [ ] CloudWatch: Metrics streaming, dashboards visible
  - [ ] Google Analytics: Event tracking active
  - [ ] Status page: All systems showing "Operational"
- [ ] Test alert channels:
  - [ ] Send test alert to #incident-response Slack channel
  - [ ] Verify on-call engineer receives email alert
  - [ ] Verify SMS backup receives critical alerts
- [ ] Set up incident response protocols:
  - [ ] On-call rotation documented in Slack topic
  - [ ] Escalation path: Eng Lead → Product Manager → CTO
  - [ ] Communication template posted in Slack
- [ ] Configure alert thresholds:
  - [ ] Error rate: Alert if >1% of requests fail
  - [ ] API latency: Alert if P95 >1000ms
  - [ ] Database: Alert if connections >80 of max 100
  - [ ] Gemini API: Alert if availability <99.5% in 5 min window
  - [ ] Disk space: Alert if >85% full
- [ ] Verify monitoring dashboards:
  - [ ] Main dashboard accessible to team
  - [ ] Real-time user activity visible
  - [ ] Error trends visible (should be zero at launch)

### 11:00 AM - 12:00 PM UTC-3: Support Team Briefing
- [ ] Conduct 30-minute support team sync:
  - [ ] Review FAQ and common issues
  - [ ] Demo all major features (transactions, budgets, insights)
  - [ ] Practice troubleshooting common problems
  - [ ] Discuss escalation procedures
- [ ] Distribute support materials:
  - [ ] FAQ document (printed + digital)
  - [ ] Getting started guide
  - [ ] Troubleshooting flowchart
  - [ ] Contact tree (who to escalate to)
- [ ] Brief product team:
  - [ ] User onboarding journey walkthrough
  - [ ] Key analytics we'll be tracking
  - [ ] What constitutes a critical issue
- [ ] Load support systems:
  - [ ] Open support ticket system
  - [ ] Set up email aliases for incoming requests
  - [ ] Prepare Slack channel for customer questions (#support-chat)

### 12:00 PM UTC-3: LAUNCH DECISION GATE
- [ ] **Go/No-Go Decision Meeting** (15 minutes)
  - [ ] Engineering Lead: All systems green? Proceed Y/N
  - [ ] Product Owner: Feature set complete? Proceed Y/N
  - [ ] DevOps Lead: Monitoring active, rollback ready? Proceed Y/N
  - [ ] QA Lead: Test coverage >80%, critical tests passing? Proceed Y/N
  - [ ] CTO/Decision Maker: Final sign-off? Proceed Y/N
  - [ ] **Required:** All 5 stakeholders must agree to proceed
- [ ] If **NO**: Document blockers, set rollback time, communicate delay to users
- [ ] If **YES**: Proceed to deployment

### 1:00 PM - 2:00 PM UTC-3: Deployment
- [ ] Build production artifacts:
  - [ ] Run `npm run build` on clean branch
  - [ ] Verify output: No TypeScript errors, bundle size <5MB gzipped
  - [ ] Generate build hash for versioning
- [ ] Create production container image:
  - [ ] Build Docker image: `docker build -t spfp:v1.0.0 .`
  - [ ] Run security scan: `trivy image spfp:v1.0.0`
  - [ ] Push to container registry: `docker push spfp:v1.0.0`
- [ ] Deploy to production:
  - [ ] Update Kubernetes manifest with v1.0.0 image
  - [ ] Apply rolling update (no downtime)
  - [ ] Verify all replicas healthy
  - [ ] Check pod logs for startup errors
- [ ] Verify deployment:
  - [ ] Health check: `GET /api/health` returns 200
  - [ ] Database connection: Verify auth endpoints functional
  - [ ] Static assets: Verify CSS, JS loading correctly
  - [ ] API endpoints: Spot-check 3+ critical endpoints
- [ ] Warm up caches:
  - [ ] Pre-load common queries in Redis (if applicable)
  - [ ] Seed CDN edge caches with static assets
  - [ ] Verify first requests have reasonable latency

### 2:00 PM - 4:00 PM UTC-3: Critical Path Testing
- [ ] Execute critical user journeys on production:
  - [ ] **Auth Flow:** Email sign-up → Verify email → Login → Dashboard
  - [ ] **Transaction:** Create account → Add transaction → View in list → Export CSV
  - [ ] **Budget:** Create budget → Add expenses → View vs. actual → Get insights
  - [ ] **Goals:** Create goal → Add goal transactions → Track progress
  - [ ] **Admin:** Login as admin → Impersonate user → View user data → Exit impersonation
- [ ] Verify data persistence:
  - [ ] Create transaction → Refresh page → Still visible (localStorage + Supabase sync)
  - [ ] Create budget → Sign out/in → Budget visible
  - [ ] Create goal → Wait 5 seconds → Real-time sync completes
- [ ] Test error recovery:
  - [ ] Create transaction with invalid data → Show error message
  - [ ] Disconnect network → App shows offline state → Reconnect → Sync resumes
  - [ ] Gemini API timeout → Show error → Retry available
- [ ] Spot-check performance:
  - [ ] Dashboard loads in <2 seconds
  - [ ] Transaction list with 100+ items renders smoothly
  - [ ] Report generation completes in <5 seconds
  - [ ] No console errors or warnings

### 3:00 PM - 5:00 PM UTC-3: Rollback Readiness
- [ ] Verify rollback decision criteria documented and communicated
- [ ] Confirm rollback team assembled:
  - [ ] DevOps engineer on standby
  - [ ] Database admin available
  - [ ] Engineering lead available
- [ ] Test rollback on staging environment:
  - [ ] Revert to v0.9.9-backup container
  - [ ] Restore database from backup
  - [ ] Verify users can access old version
  - [ ] Verify data intact
- [ ] Document actual rollback execution time
- [ ] Store rollback decision matrix where all can see it

### 4:00 PM - 6:00 PM UTC-3: Communication Channels Active
- [ ] Open all communication channels:
  - [ ] #incident-response Slack channel: On high alert
  - [ ] #support-chat: Ready to answer customer questions
  - [ ] Status page: Go-live announcement posted
  - [ ] Email support: On-call team monitoring incoming requests
- [ ] Customer notifications:
  - [ ] Send go-live email to early access users with login link
  - [ ] Post on social media: SPFP is now live!
  - [ ] Notify stakeholders: Soft launch beginning
- [ ] Create incident response runbook:
  - [ ] **Incident Detection:** Error rate spike, user reports, monitoring alert
  - [ ] **Triage:** Is it blocking? What's the impact?
  - [ ] **Decision:** Fix forward or rollback?
  - [ ] **Communication:** Update status page every 5 minutes
- [ ] Prepare incident templates:
  - [ ] "We're investigating an issue with [feature]"
  - [ ] "We've identified the issue and are deploying a fix"
  - [ ] "We're rolling back to ensure data integrity"

### 5:00 PM - 8:00 PM UTC-3: Monitoring & Observation
- [ ] Watch monitoring dashboard continuously:
  - [ ] Refresh every 2-5 minutes
  - [ ] Look for: Error spikes, latency increases, failed requests
  - [ ] Monitor Sentry: Any new error patterns?
  - [ ] Check Google Analytics: User flows as expected?
- [ ] Monitor support channels:
  - [ ] #support-chat: Respond to customer questions within 15 minutes
  - [ ] Email: Respond to support tickets within 30 minutes
  - [ ] Log all issues in incident tracker
- [ ] Database monitoring:
  - [ ] Connection count stable <50 of 100 max
  - [ ] Query performance acceptable (no slow queries)
  - [ ] Replication lag <1 second (if applicable)
- [ ] API performance:
  - [ ] Response times stable around baseline
  - [ ] No increase in error rates
  - [ ] Rate limiting working (no users throttled unexpectedly)
- [ ] Real-time sync monitoring:
  - [ ] Supabase subscriptions stable
  - [ ] No websocket connection drops
  - [ ] Updates syncing within 2 seconds

### 6:00 PM - 10:00 PM UTC-3: Critical Observation Period
- [ ] Maintain continuous monitoring:
  - [ ] Engineering lead online
  - [ ] DevOps on-call available
  - [ ] Support team handling incoming requests
  - [ ] Daily stand-up sync at 7pm UTC-3 (15 minutes)
- [ ] Track key metrics:
  - [ ] Unique users: Reaching expected numbers?
  - [ ] Transaction volume: Growing steadily?
  - [ ] Error rate: Staying <1%?
  - [ ] API latency: Stable around baseline?
- [ ] Prepare for peak load:
  - [ ] Monitor during typical evening usage spike
  - [ ] Verify system handles concurrent users
  - [ ] Check for any performance degradation
- [ ] Review incident log:
  - [ ] Any issues encountered?
  - [ ] All issues resolved?
  - [ ] Any data concerns?

### 8:00 PM - 10:00 PM UTC-3: Evening Status Review
- [ ] Team sync call (30 minutes):
  - [ ] Engineering: Any issues discovered? Assessment of system stability.
  - [ ] Support: What are users asking about? Any confusion?
  - [ ] Product: Metrics looking good? User feedback positive?
  - [ ] DevOps: Infrastructure performing well?
- [ ] Update status page:
  - [ ] All systems operational
  - [ ] Brief summary of launch metrics
  - [ ] Link to customer support resources
- [ ] Document any issues:
  - [ ] Minor issues: Log for post-launch triage
  - [ ] Major issues: Assess rollback necessity
- [ ] Extend support hours if needed:
  - [ ] Keep support team online until 11pm UTC-3
  - [ ] Rotate engineers to maintain 24h coverage

---

## 3. POST-GO-LIVE (24-Hour Window, April 6-7)

### 10:00 PM April 6 - 6:00 AM April 7: Night Watch
- [ ] Maintain on-call coverage:
  - [ ] Engineering lead on-call
  - [ ] DevOps on-call
  - [ ] Alert response target: <5 minutes
- [ ] Monitor key metrics (hourly checks):
  - [ ] Error rate: Should be <1%
  - [ ] API latency P95: Should be <500ms
  - [ ] Database performance: No connection issues
  - [ ] User count: Steady growth or plateau expected?
- [ ] Respond to any incidents immediately
- [ ] Document all issues discovered

### 6:00 AM - 9:00 AM April 7: Morning Status Review
- [ ] Review 24-hour metrics:
  - [ ] Total unique users onboarded
  - [ ] Total transactions created
  - [ ] Total errors encountered
  - [ ] Worst-case error (describe it)
  - [ ] API availability: Target 99.9%+
- [ ] Assess system health:
  - [ ] No data loss detected
  - [ ] No security incidents
  - [ ] No RLS policy violations
  - [ ] No authentication failures
  - [ ] No Gemini API outages
- [ ] Collect user feedback:
  - [ ] Check #support-chat for common complaints
  - [ ] Triage issues: Critical vs. Minor
  - [ ] Identify UX friction points
- [ ] Team debrief (30 minutes):
  - [ ] What went well
  - [ ] What was challenging
  - [ ] Any surprises
  - [ ] Action items for next sprint

### Health Metrics Monitoring (First 24 Hours)
- [ ] **User Engagement:**
  - [ ] Daily Active Users (DAU): Track growth
  - [ ] Session length: Average session >5 minutes?
  - [ ] Feature adoption: % using transactions, budgets, insights
  - [ ] Return rate: Users coming back next day?

- [ ] **Performance Tracking:**
  - [ ] Largest transaction list: 100+ items load in <2 seconds?
  - [ ] Dashboard render time: <1 second on average
  - [ ] Report generation: <5 seconds
  - [ ] Chart rendering: Smooth animations

- [ ] **Error Monitoring:**
  - [ ] Critical errors: 0 expected
  - [ ] Non-critical errors: <10 expected
  - [ ] Error types: Auth, API, UI rendering, data validation
  - [ ] User impact: How many users affected by each error?

- [ ] **Data Integrity Checks:**
  - [ ] No duplicate transactions
  - [ ] No missing transactions
  - [ ] Budget calculations accurate
  - [ ] Goal progress tracking correct
  - [ ] Investment cost basis accurate
  - [ ] Recurring transaction generation correct

- [ ] **Infrastructure Metrics:**
  - [ ] CPU utilization: <70% average
  - [ ] Memory utilization: <60% average
  - [ ] Disk space: >20% free
  - [ ] Database connections: <50 of 100 max
  - [ ] Network latency: <100ms P95

### User Feedback Collection (First 24 Hours)
- [ ] Actively monitor support channels:
  - [ ] Review all support tickets
  - [ ] Respond to all questions within 1 hour
  - [ ] Log feedback in feedback tracker
- [ ] Identify top 5 issues:
  - [ ] What's confusing users?
  - [ ] What features are most used?
  - [ ] Where are users getting stuck?
- [ ] Prepare hotfix PRs for critical issues
- [ ] Plan follow-up communication (features, improvements)

### 24-Hour Go-Live Assessment
- [ ] All success criteria met? (See section 4)
- [ ] Any critical issues requiring hotfix?
- [ ] Any issues requiring rollback decision?
- [ ] Is system ready for general release (removing early access restrictions)?
- [ ] Post-launch review scheduled for April 8 (48h post-launch)

---

## 4. SUCCESS CRITERIA

All of the following must be true at launch for "successful launch":

### Security & Data Protection
- [ ] **RLS Policies Enforced:** 100% - User A cannot read User B's data
  - Verification: Query User B's transactions as User A → Returns empty or error
  - Automated test: `test/security/rls-isolation.test.ts` passing
  - No cross-user data leakage in logs or error messages

- [ ] **Zero Data Loss:** 0% - No transactions, budgets, or goals deleted unexpectedly
  - Verification: Compare database record count before/after launch
  - Automated backup validation every hour
  - Audit log showing all data modifications

- [ ] **Authentication Secure:** All auth methods working without exposing tokens
  - Google OAuth: Tokens never logged or exposed in frontend
  - Email/password: Passwords hashed with bcrypt (server-side)
  - Session tokens: Secure, HTTP-only, limited lifetime
  - Verification: Security scan passes with 0 critical vulns

### Code Quality & Stability
- [ ] **Test Coverage >80%:** Unit tests covering critical paths
  - `npm run test -- --coverage` reports >80%
  - Critical services covered: aiService, FinanceContext, AuthContext, validators
  - Focus areas: Auth, transaction CRUD, budget calculations, data export
  - Acceptance: CI/CD shows green checkmark

- [ ] **TypeScript Strict Mode:** No `any` casts, all types explicit
  - `npm run typecheck` returns 0 errors
  - No `@ts-ignore` comments in production code
  - All function parameters typed
  - All API responses typed

- [ ] **Zero Critical Bugs:** No P0 or P1 issues in production
  - Definition of P0: Data loss, security breach, >50% user blocking, data corruption
  - Definition of P1: Feature completely broken, affects >10% of users
  - Verification: Bug tracker shows 0 critical/high priority issues
  - Monitoring: Sentry shows no repeated error patterns

### Accessibility & Compliance
- [ ] **WCAG AA Passed:** All major pages compliant with WCAG 2.1 AA
  - Dashboard, Transaction Form, Goals, Budget, Accounts pages
  - Verification: axe DevTools scan = 0 violations
  - Keyboard navigation: All interactive elements accessible via Tab key
  - Color contrast: All text >4.5:1 contrast ratio
  - Alternative text: All images have alt text
  - Screen reader tested: NVDA on Windows tested on 3+ pages

- [ ] **Mobile Responsive:** Works on iOS and Android
  - Viewport: Renders correctly on 320px - 1920px width
  - Touch targets: All buttons >44px minimum
  - Forms: Mobile-friendly input fields, no horizontal scroll
  - Testing: iPhone 14, Pixel 6, Samsung Galaxy tested
  - Verified with Chrome DevTools device emulation

### Performance
- [ ] **<3 Second TTI (Time to Interactive):** Achieved on Lighthouse
  - Dashboard loads and is interactive in <3 seconds (3G throttled)
  - First transaction page interactive in <3 seconds
  - Verification: `npm run build` + Lighthouse CI passes
  - Tool: Lighthouse CLI with standard 4G throttle profile

- [ ] **<100ms Render Time:** React components render smoothly
  - Transaction list with 100+ items: Smooth scrolling, no jank
  - Dashboard widgets: Render in <100ms
  - Charts: Render in <500ms (acceptable for complex visualization)
  - Verification: React DevTools Profiler shows <100ms for most renders

- [ ] **Core Web Vitals Passed:**
  - LCP (Largest Contentful Paint): <2.5 seconds
  - FID (First Input Delay): <100ms
  - CLS (Cumulative Layout Shift): <0.1
  - Verification: Lighthouse score >90, all metrics green

### User Experience & Features
- [ ] **All Core Features Working:** Every planned feature functional
  - Transactions: Create, read, update, delete, search, filter, export
  - Budgets: Create, track, get alerts, view vs. actual
  - Goals: Create, track progress, calculate requirements
  - Investments: Add, track cost basis, view performance
  - Accounts: Create, manage, view balance, reconcile
  - AI Insights: Generate, display, respond to follow-ups
  - Admin CRM: Admin can impersonate users, manage clients
  - Reports: Generate PDF, email, view trends

- [ ] **User Onboarding Smooth:** New users reach "first value" quickly
  - Sign-up: Completed in <2 minutes
  - First transaction: Created within 5 minutes of login
  - Value moment: User sees at least one insight or budget within 10 minutes
  - No critical friction points
  - Verification: Customer success team observes 3+ new users completing flow

- [ ] **Error Messages Clear:** Users understand what went wrong
  - Invalid inputs: Show specific field errors
  - API errors: Show user-friendly message (not technical details)
  - Network errors: Show offline state, suggest retry
  - No blank error modals or cryptic messages

### Infrastructure & Operations
- [ ] **API Availability >99.5%:** Service healthy and accessible
  - Measured over first 24 hours post-launch
  - Includes all critical endpoints (auth, transactions, budgets, insights)
  - Verification: Uptime monitoring tool shows >99.5%
  - No more than 1 minute of unplanned downtime

- [ ] **Database Integrity:** All data consistent and queryable
  - No orphaned records
  - Foreign key constraints satisfied
  - Indexes optimized (queries <500ms P95)
  - Backup successful (verified restore works)
  - Verification: Database integrity checks pass

- [ ] **Monitoring Active:** All systems observable
  - Sentry: Error tracking active, alerts working
  - CloudWatch: Metrics and logs flowing
  - Google Analytics: Page views and events tracking
  - Status page: Public status visible, updating correctly
  - Logs: Central logging aggregation working

---

## 5. RISK RUNBOOK

### Incident: RLS Policies Failing (Data Leak Risk)

**Trigger:** User reports seeing another user's transactions, OR Sentry shows RLS errors

**Severity:** CRITICAL - Immediate rollback required

**Response Steps:**
1. **Confirm Issue** (2 minutes)
   - Can you reproduce? Try accessing other user's data
   - Check RLS policies in Supabase console
   - Search Sentry for "RLS" errors

2. **Immediate Action** (1 minute)
   - Declare CRITICAL incident
   - Post to #incident-response: "CRITICAL: RLS Policy Failure - Rolling back immediately"
   - Begin rollback procedure (see section 2, "Rollback Readiness")

3. **Execute Rollback** (5-10 minutes)
   - Stop production deployment
   - Revert to v0.9.9-backup container
   - Restore database from April 5 backup
   - Verify old version does NOT have issue
   - Update status page: "Rolled back due to data protection issue"

4. **Root Cause Analysis** (Post-incident)
   - Did RLS policy update fail to apply?
   - Was SQL migration wrong?
   - Did code introduce bypassing of RLS?
   - Run test: `npm run test:e2e -- security/rls-isolation.test.ts`

5. **Fix Forward or Stabilize**
   - If fixable: Deploy fix immediately, test thoroughly, re-deploy
   - If not: Stay on v0.9.9-backup, notify users of delay

---

### Incident: TypeScript Errors in Production (Compilation Failure)

**Trigger:** Sentry shows runtime TypeScript errors, OR app won't load

**Severity:** CRITICAL - Immediate rollback likely required

**Response Steps:**
1. **Confirm Issue** (1 minute)
   - Check: Does app load? Can you sign in?
   - Open browser console: Any TypeScript/compilation errors?
   - Check Sentry: What's the error message?

2. **Decision: Fix or Rollback** (5 minutes)
   - Is it in one feature only? Maybe disable feature flag
   - Does it block all users? Must rollback
   - Can you fix in <10 minutes? Maybe ship hotfix
   - **Otherwise: Rollback immediately**

3. **If Rollback Required:**
   - Follow rollback procedure (section 2)
   - Revert to v0.9.9-backup
   - Verify app loads in old version
   - Update status page

4. **If Hotfix Required:**
   - Create fix on new branch
   - Run `npm run typecheck` - must pass with 0 errors
   - Run `npm run build` - must complete without errors
   - Merge to main and deploy
   - Verify fix in production

5. **Post-Incident:**
   - Why wasn't this caught in testing? CI/CD failure?
   - Add regression test to prevent recurrence

---

### Incident: Tests Failing (Quality Gate Broken)

**Trigger:** CI/CD shows test failures before launch, OR tests fail post-launch

**Severity:** HIGH - Block deployment until resolved

**Response Steps:**
1. **Before Launch:** If tests failing → DO NOT launch
   - Run `npm run test` locally
   - Run `npm run typecheck`
   - Run `npm run lint`
   - **All must pass before going live**

2. **Post-Launch:** If tests fail in production environment
   - Determine: Are tests flaky or is code broken?
   - Try running test 3x: If passes 2/3, probably flaky
   - Flaky test: Document, file issue, add retry logic
   - Real failure: Fix code, run all tests, re-deploy

3. **Test Coverage Checks:**
   - Run `npm run test -- --coverage`
   - If coverage drops below 80%: Fail and block deployment
   - Add tests for new code until threshold met

4. **Root Cause Analysis:**
   - Did test environment differ from prod?
   - Did you change code without running tests?
   - Do tests need updating (false positives)?

---

### Incident: Performance Degradation (Slow Responses)

**Trigger:** API latency spike, user reports slow loading, Lighthouse score drops

**Severity:** HIGH - Impacts user experience, potential rollback if severe

**Response Steps:**
1. **Confirm Degradation** (2 minutes)
   - Check CloudWatch: What's the latency trend?
   - Compare to baseline: Is this >50% slower than expected?
   - User reports: How many users affected?
   - Check specific slow queries: Any new slow database queries?

2. **Identify Cause** (5-10 minutes)
   - Is it database-related?
     - Run `EXPLAIN ANALYZE` on slow queries
     - Check indexes: Are all expected indexes present?
     - Check connection pool: Is it exhausted?
   - Is it API code?
     - Review Sentry: Any new errors?
     - Check logs: Any suspiciously slow operations?
   - Is it frontend?
     - Open DevTools: How long to first paint?
     - Check bundle size: Did it increase unexpectedly?

3. **Immediate Actions:**
   - If database bottleneck: Check if replication lag high, restart if needed
   - If API bottleneck: Restart API server, check for memory leaks
   - If frontend bottleneck: Clear CDN cache, force browsers to reload

4. **Decision: Rollback or Fix Forward**
   - If >50% slower: Consider rollback
   - If fixable in <30 minutes: Try fix forward
   - Otherwise: Rollback to stable version

5. **Post-Incident:**
   - Why wasn't this caught in load testing?
   - Add performance regression test to CI/CD
   - Implement continuous performance monitoring

---

### Incident: Gemini API Unavailable (AI Features Down)

**Trigger:** Gemini API timeout, 429 (rate limit), 503 (service unavailable)

**Severity:** MEDIUM - AI features broken, but core app works

**Response Steps:**
1. **Confirm Outage** (1 minute)
   - Try Gemini API directly (use test prompt)
   - Check Google Cloud status page
   - Check Sentry: Are users getting errors?

2. **User Communication** (2 minutes)
   - Post to #support-chat: "AI Insights experiencing temporary issues"
   - Update status page: "AI Features: Investigating"
   - Show friendly message in app: "AI Insights temporarily unavailable"

3. **Temporary Workaround:**
   - Disable Insights feature via feature flag
   - Users can still use all core features
   - Show message: "Check back in X minutes"

4. **Wait for Google to Recover:**
   - Most outages resolve within 5-10 minutes
   - Re-enable feature once API responds
   - Update status page: "Resolved"

5. **Post-Incident:**
   - Implement rate limit handling in aiService.ts
   - Add timeout handling (retry with exponential backoff)
   - Consider fallback to cached responses
   - Document retry logic in service

**Note:** Gemini API downtime should NOT trigger rollback. Core features work fine without it.

---

### Incident: Data Loss Detected (Data Integrity)

**Trigger:** User reports missing transactions, OR audit logs show unexpected deletes

**Severity:** CRITICAL - Immediate investigation required

**Response Steps:**
1. **Freeze Everything** (1 minute)
   - STOP accepting new data (if possible)
   - Post to #incident-response: "CRITICAL: Data loss detected - investigating"
   - Disable write operations if necessary

2. **Investigate** (5 minutes)
   - What data is missing? Exact date/time/user?
   - Check database transaction logs: Was DELETE executed?
   - Check soft delete flags: Is data still there but marked deleted?
   - Review Sentry: Any errors during this time period?

3. **Assess Damage** (5 minutes)
   - How much data lost?
   - How many users affected?
   - Is it recoverable from backup?

4. **Immediate Recovery** (5-15 minutes)
   - If small amount: Restore from backup, re-import into current DB
   - If large amount: Rollback entire deployment to April 5 backup
   - Verify data restored: User can see transactions again

5. **Root Cause Analysis:**
   - Was there a bad migration script?
   - Did code have unintended DELETE logic?
   - Was backup corrupt?
   - Do we have audit logs of what happened?

6. **Communication:**
   - Email affected users: We've restored your data
   - Offer explanation of what happened (honest)
   - Provide extra support if needed

---

### Incident: High Error Rate (>5% Errors)

**Trigger:** Sentry shows spike in error rate, monitoring alert fires

**Severity:** HIGH - May indicate systemic issue

**Response Steps:**
1. **Investigate Error Pattern** (5 minutes)
   - Open Sentry: What are the top errors?
   - Are they all the same error, or different?
   - When did they start?
   - Which users affected?

2. **Categorize Errors:**
   - **User Input Errors** (e.g., invalid transaction): Expected, not a bug
   - **API Errors** (e.g., 500 from Supabase): Indicates backend problem
   - **Code Errors** (e.g., undefined is not a function): Bug in production

3. **Respond Based on Type:**
   - **User Input:** No action, errors are normal
   - **API Errors:** Check Supabase status, restart if needed, consider rollback if persistent
   - **Code Errors:** Deploy hotfix or rollback

4. **Communication:**
   - Update status page if >1% of requests affected
   - Respond to support tickets
   - Log incident for post-mortem

---

## 6. ESCALATION PROCEDURES

### Escalation Hierarchy

```
Level 1: On-Call Engineer
├─ Detection (monitoring alert)
├─ Triage (is it critical?)
└─ First response (notify team, stabilize if possible)

Level 2: Engineering Lead
├─ Assess severity
├─ Decide: Fix forward or rollback?
├─ Coordinate technical response
└─ Keep Product informed

Level 3: Product Manager
├─ Make business decision
├─ Update customers
├─ Decide: Delay feature launch?
└─ Coordinate post-mortem

Level 4: CTO / Decision Maker
├─ Make final rollback decision
├─ Approve emergency deployments
└─ Escalate to C-suite if needed
```

### Response Time Targets

| Severity | Detection | First Response | Resolution |
|----------|-----------|-----------------|-----------|
| P0 (Critical) | <1 min | <5 min | <15 min |
| P1 (High) | <5 min | <15 min | <1 hour |
| P2 (Medium) | <15 min | <30 min | <4 hours |
| P3 (Low) | <1 hour | <2 hours | <24 hours |

### Alerting Channels

- **Slack:** #incident-response (all team members)
- **Email:** on-call@spfp.app (primary on-call engineer)
- **SMS:** +55 [emergency phone] (critical incidents only)
- **Status Page:** status.spfp.app (customer communication)

### Incident Communication Template

```
[INCIDENT ALERT] Severity: [P0/P1/P2/P3]
Title: [Brief description of issue]
Status: INVESTIGATING
Impact: [What features affected, how many users]
ETA: [Expected time to resolution]
Action: [What we're doing right now]

Updates:
- [Timestamp] Initial report received
- [Timestamp] Root cause identified: [What happened]
- [Timestamp] Fix deployed / Rollback completed
- [Timestamp] Verified resolved
```

---

## 7. APPROVAL SIGN-OFFS

All stakeholders must acknowledge they have read and approved this checklist.

### Engineering Lead Sign-Off
- [ ] I have reviewed all code, tests, and deployment scripts
- [ ] TypeScript passes strict mode, tests >80% coverage
- [ ] I confirm we are ready to deploy to production
- [ ] I understand the rollback procedures and am available on-call

**Name:** ________________________  **Date:** ____________

**Signature:** ________________________

---

### Product Owner Sign-Off
- [ ] All planned features for v1.0.0 are complete and tested
- [ ] User onboarding flow is smooth
- [ ] Success metrics are defined and observable
- [ ] I am available during launch day for decision-making

**Name:** ________________________  **Date:** ____________

**Signature:** ________________________

---

### DevOps Lead Sign-Off
- [ ] Infrastructure is provisioned and tested
- [ ] All monitoring and alerting systems are active
- [ ] Database backups and restoration are verified
- [ ] Rollback procedure is documented and tested
- [ ] I am available on-call for 72 hours post-launch

**Name:** ________________________  **Date:** ____________

**Signature:** ________________________

---

### QA Lead Sign-Off
- [ ] Test coverage >80%, all critical tests passing
- [ ] E2E tests for all critical user journeys passing
- [ ] Security testing (OWASP, RLS isolation) passed
- [ ] Performance testing (Lighthouse, TTI) passed
- [ ] Accessibility testing (WCAG AA) passed

**Name:** ________________________  **Date:** ____________

**Signature:** ________________________

---

### CFO / Financial Approval Sign-Off
- [ ] Budget allocated for infrastructure costs
- [ ] Business impact assessment complete
- [ ] User support budget approved
- [ ] Final approval to proceed with launch

**Name:** ________________________  **Date:** ____________

**Signature:** ________________________

---

## Final Go-Live Decision

**Go-Live Date:** April 6, 2026
**Target Launch Time:** 12:00 PM UTC-3
**Go/No-Go Decision Time:** 11:45 AM UTC-3

All 5 sign-offs above are REQUIRED before proceeding.

**CTO FINAL AUTHORIZATION:**

- [ ] I have reviewed all sign-offs
- [ ] I have confidence in the team and systems
- [ ] I authorize launch to proceed as scheduled

**CTO Name:** ________________________  **Date:** ____________

**CTO Signature:** ________________________

---

**Document Created:** January 27, 2026
**Last Updated:** January 27, 2026
**Status:** DRAFT - Ready for stakeholder review
**Next Review:** February 15, 2026 (6 weeks pre-launch)
