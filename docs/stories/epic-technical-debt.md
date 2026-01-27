# Epic: Technical Debt Resolution - SPFP

**Epic ID:** EPIC-001
**Status:** APPROVED - Ready for Sprint Planning
**Created:** 2026-01-26
**Version:** 1.0 - FINAL

---

## Epic Overview

| Field | Value |
|-------|-------|
| **Portuguese Title** | Resolução de Débitos Técnicos - SPFP |
| **English Title** | Technical Debt Resolution Program - SPFP |
| **Objective** | Transform SPFP from unstable MVP to production-grade architecture |
| **Timeline** | 6 weeks (Sprint 0-5) with 3 developers |
| **Effort** | 335 hours (estimated ±20%) |
| **Team Size** | 3 FTE (1 architect, 1 full-stack, 1 QA/frontend specialist) |
| **Investment** | R$ 50.250 (at R$ 150/hour) |
| **Expected ROI** | 5.95:1 (R$ 302K net gain in 6 months) |
| **Risk Level** | MEDIUM (executable with daily tracking) |

---

## Business Value & Impact

### Strategic Importance

This epic directly enables:
- **🔒 Security & Compliance:** GDPR/LGPD compliance (RLS policies), audit trails, soft delete
- **📈 Scalability:** 10x user growth (5K→50K+), database normalization, real-time sync
- **⚡ Velocity:** 2x features per sprint (from 3-4 to 6-8), reduced firefighting
- **👥 User Experience:** Mobile-responsive, accessible (WCAG AA), <3s TTI
- **🛡️ Stability:** 90% fewer bugs, zero data leaks, error boundaries
- **💰 Revenue:** +R$ 30K/month (15% user retention improvement)

### Business Case Summary

| Metric | Baseline | Target | Impact |
|--------|----------|--------|--------|
| **Users (6mo projection)** | 500 | 1,500 | +200% growth enabled |
| **Churn Rate** | 15% | 10% | -5pp (retention +33%) |
| **Feature Velocity** | 3-4 features/sprint | 6-8 features/sprint | +100% productivity |
| **Bug Escape Rate** | 5-8 bugs/release | <1 bug/release | -90% regressions |
| **Time-to-Feature** | 5-7 days | 2-3 days | -60% TTM |
| **Lighthouse Score** | 40 | 90+ | +125% performance |
| **WCAG Compliance** | 0/100 | AA (90+/100) | Legal compliance |
| **Production Incidents** | Unknown | <1/month | -80% estimated |

**Net Economic Benefit (6 months):** R$ 302.350 gain = **6:1 ROI**

---

## Success Criteria

### Acceptance Criteria (Epic Level)

- [ ] All 7 critical (P0) debts resolved and tested
- [ ] Test coverage >80% (business logic unit tests)
- [ ] Zero WCAG accessibility violations (WCAG 2.1 AA baseline)
- [ ] Mobile responsive (tested on 5+ devices, breakpoints: 320px, 640px, 768px, 1024px)
- [ ] Performance SLOs validated (TTI <3s, interaction <100ms, bundle <300KB)
- [ ] Type safety: zero `as any` casts remaining
- [ ] RLS policies deployed and validated (multi-user isolation confirmed)
- [ ] All 335 estimated hours tracked and within ±20% variance
- [ ] 50+ stories created and prioritized per sprint breakdown
- [ ] Zero data loss during database migrations
- [ ] CI/CD pipeline green on all PRs

### Quality Gates (Definition of Done per Sprint)

**Sprint 0 (Bootstrap):** Security + Infrastructure
- [ ] RLS policies verified in staging (user data isolation test passes)
- [ ] TypeScript strict mode compilation zero errors (`npx tsc --strict`)
- [ ] GitHub Actions CI/CD executing on all PRs
- [ ] Error boundaries active (global + regional, verified no app crashes on component error)
- [ ] Test infrastructure operational (Vitest + React Testing Library running, first 10 tests passing)

**Sprint 1 (Type Safety):** Type Safety + Database Foundation + Unit Tests
- [ ] Zero `as any` type casts remaining in codebase
- [ ] All critical error paths have proper recovery (no silent failures)
- [ ] Unit test coverage ≥40%
- [ ] Soft delete strategy implemented (`deleted_at` field, logic in queries)
- [ ] Audit trail functional (interaction_logs table + RLS tracking)

**Sprint 2-3 (Architecture):** FinanceContext Refactor + Component Decomposition
- [ ] FinanceContext split into 5 sub-contexts (AuthContext, TransactionsContext, AccountsContext, GoalsContext, UIContext)
- [ ] Each sub-context exports <30 items
- [ ] Dashboard component <200 LOC (container only)
- [ ] TransactionForm <400 LOC (logic extracted to services)
- [ ] Accounts component <250 LOC
- [ ] All components appropriately memoized (no unnecessary re-renders verified by React Profiler)
- [ ] Test coverage ≥70%
- [ ] No re-render regression (baseline vs refactored measured)

**Sprint 4 (Frontend Polish):** Accessibility + Mobile + E2E Foundation
- [ ] WCAG 2.1 AA audit passes zero violations (verified with axe DevTools)
- [ ] Mobile responsive tested on 5+ physical devices
- [ ] Lighthouse score ≥90 across categories (performance, accessibility, best practices)
- [ ] Dark mode persists across browser refresh
- [ ] Keyboard navigation 100% functional
- [ ] Screen reader support for critical flows
- [ ] E2E test infrastructure operational (Playwright/Cypress setup)

**Sprint 5-6 (Database + Final):** Normalization + E2E Tests + Performance
- [ ] Schema normalization designed and migrated (transactions, accounts, goals separated)
- [ ] Foreign key constraints active
- [ ] E2E tests covering 6+ critical journeys (signup→transaction, recurring management, CSV import, admin impersonation, isolation, insights)
- [ ] Performance baselines documented and SLOs validated:
  - [ ] Bundle <300KB (target <250KB)
  - [ ] TTI <3s on 3G Fast
  - [ ] Dashboard re-render <100ms
  - [ ] Filter 1000+ items <500ms
- [ ] Zero performance regressions >10% from baseline

---

## Problem Statement

### Current State (Baseline)

SPFP is a robust personal financial management application with solid visual foundation (React 19 + TailwindCSS glassmorphism) but **critical technical debts blocking scalability, regulatory compliance, and developer productivity:**

| Issue | Baseline | Impact |
|-------|----------|--------|
| **Test Coverage** | ~1% | Refactors extremely risky, regressions unpredictable |
| **FinanceContext** | 613 LOC, 96 exports, 9 domains | Global re-renders, slow feature velocity |
| **Large Components** | Dashboard (658), TransactionForm (641), Accounts (647) LOC | Hard to understand, maintain, test |
| **Accessibility (WCAG)** | 0/100 compliance | 15% population excluded (disabilities), legal risk |
| **Mobile Responsive** | Broken (modals overflow, charts don't adapt) | 30-40% mobile users abandon |
| **Type Safety** | 35+ `as any` casts | Silent bugs, unsafe refactoring |
| **RLS Policies** | Missing on user_data table | Any authenticated user can read all user data (GDPR violation) |
| **Error Handling** | 45 catch blocks with only console.error | App crashes unpredictably, no recovery |
| **Database Schema** | JSON blobs (not normalized) | Impossible to scale, inefficient queries |
| **Real-time Sync** | None (polling only) | User experience laggy, data stale |
| **Performance** | TTI estimated >5s on 3G | Users abandon before page loads |

### Why Now? (Urgency)

1. **Regulatory Blocking:** RLS missing violates LGPD Artigos 6,7 and GDPR Artigo 32. Any audit/customer will demand fix. Risk: R$ 500K-2M fines + litigation.
2. **Commercial Blocker:** Cannot scale beyond 5K users, cannot sell to enterprises (require compliance), cannot attract institutional investors.
3. **Velocity Compound:** Each month without fixing, débitos compound. 1-2 sprints/month currently lost to firefighting (R$ 80K/month in salaries).
4. **Developer Burnout:** Low code quality → churn risk in engineering team.

### Risks of Inaction

- **6-month exposure:** ~R$ 850K in compounded costs (GDPR fines, churn, lost revenue, paralysis)
- **Impossible growth:** Hard cap at 5K-10K users
- **Regulatory action:** GDPR/LGPD compliance audit will expose RLS violation
- **User churn:** Poor UX (mobile + accessibility) + bugs drive -30% to -50% churn

---

## Solution Design

### Architectural Approach

#### 1. Security First (Sprint 0-1)
- Implement RLS policies on all sensitive tables (user_data, ai_history)
- Enable TypeScript strict mode (foundation for safety)
- Add global + regional error boundaries
- Deploy CI/CD pipeline for automated validation

#### 2. Type Safety & Testing Foundation (Sprint 1-2)
- Remove all `as any` casts (enable strict type checking)
- Implement error recovery patterns (proper catch handling)
- Bootstrap comprehensive test infrastructure (40% coverage minimum)
- Add soft delete strategy for GDPR compliance

#### 3. Architecture Refactoring (Sprint 2-3, CRITICAL PATH)
- **Split FinanceContext** into 5 domain-specific contexts:
  - `AuthContext` (already separate, keep)
  - `TransactionsContext` (transactions, grouping, recurrence)
  - `AccountsContext` (accounts, balances, categories)
  - `GoalsContext` (goals, investments, patrimony)
  - `UIContext` (dashboard layout, theme, modals)
- Extract business logic into services layer:
  - `transactionService.ts` (grouping, recurrence, validation)
  - `accountService.ts` (balance calculations, categories)
  - `investmentService.ts` (market data, projections)
  - `reportService.ts` (aggregations, insights)
- Decompose large components (<200 LOC target):
  - Dashboard (container only, sub-components for each widget)
  - TransactionForm (split: form controller, recurrence wizard, validation)
  - Accounts (list + form separated)
  - TransactionList (filters, sorting as separate concerns)

#### 4. Frontend Polish (Sprint 4)
- WCAG 2.1 AA compliance:
  - 150+ `aria-*` attributes (roles, labels, descriptions)
  - Full keyboard navigation
  - Focus management + visible focus indicators
  - Screen reader support
- Mobile responsiveness:
  - 4 breakpoints: xs(320px), sm(640px), md(768px), lg(1024px)
  - Responsive modals (stack on mobile)
  - Recharts ResponsiveContainer
  - Touch-friendly interactions (44px minimum targets)
- Performance optimization:
  - Lighthouse >90 target
  - Skeleton loaders for async states
  - Dark mode persistence
  - Bundle analysis + lazy loading setup

#### 5. Database Evolution (Sprint 5-6)
- Maintain current JSON blob storage (no breaking changes until migration)
- Add abstraction layer (`dataLayer.ts`) to enable gradual normalization
- Create normalized schema alongside (transactions, accounts, goals tables)
- Implement data migration scripts with rollback procedures
- Add indexes on critical paths (user_id, created_at, transaction dates)
- Real-time subscriptions setup (Supabase Realtime)

---

## Sprint Breakdown & Roadmap

### Sprint 0: Bootstrap & Security (Week 1)
**Duration:** 5-6 calendar days
**Team:** 3 developers (1 backend, 1 full-stack, 1 QA)
**Focus:** P0 blockers + infrastructure
**Effort:** 35 hours

#### Stories/Tasks
| ID | Description | Effort | Owner | Done Criteria |
|----|-------------|--------|-------|---------------|
| EPIC-001-S0-001 | Implement RLS policies on user_data table (GDPR blocking) | 4h | Backend | SQL test confirms user isolation |
| EPIC-001-S0-002 | Create 3 critical database indexes (user_data.user_id, created_at, ai_history.user_id) | 2h | Backend | EXPLAIN ANALYZE confirms performance |
| EPIC-001-S0-003 | Enable TypeScript strict mode (remove allowJs, implicit any) | 2h | Full-stack | `npx tsc --strict` passes zero errors |
| EPIC-001-S0-004 | Add global error boundary component (Layout.tsx) | 2h | Frontend | Component error caught, app continues |
| EPIC-001-S0-005 | Add regional error boundaries (Dashboard, TransactionForm, Insights) | 2h | Frontend | Component-specific errors don't crash app |
| EPIC-001-S0-006 | Setup GitHub Actions CI/CD pipeline (lint, test, build) | 6h | DevOps | Pipeline executes on every PR, reports status |
| EPIC-001-S0-007 | Bootstrap Vitest + React Testing Library setup | 6h | QA | First 10 unit tests passing, coverage report generated |
| EPIC-001-S0-008 | Configure ESLint + Prettier (automated formatting) | 1h | DevOps | Pre-commit hook blocks unformatted code |
| EPIC-001-S0-009 | Record performance baseline metrics | 2h | Full-stack | Bundle size, TTI, memory usage documented |

**Acceptance Criteria:**
- [ ] RLS policies verified in staging environment
- [ ] TypeScript strict mode compiles zero errors
- [ ] GitHub Actions pipeline green on all PRs
- [ ] Error boundaries active (verified no app crashes)
- [ ] Test infrastructure operational (first tests passing)
- [ ] Performance baseline documented

**Risk Mitigation:**
- RLS policy testing: Create dedicated test user isolation test
- TypeScript strict mode: Use `@ts-ignore` only where documented + approved
- CI/CD setup: Test locally before pushing (prevent failed pipelines)

**Dependencies:** None (all parallel)

---

### Sprint 1: Type Safety & Security (Weeks 2-3)
**Duration:** 10 calendar days
**Team:** 3-4 developers
**Focus:** Type safety, error recovery, database foundation, unit tests
**Effort:** 65 hours

#### Stories/Tasks (3 Parallel Streams)

**Stream A - Database & Security (15 hours)**
| ID | Description | Effort | Owner | Done Criteria |
|----|-------------|--------|-------|---------------|
| EPIC-001-S1-A1 | Add soft delete strategy (deleted_at field, scope queries) | 2h | Backend | Queries filter `deleted_at IS NULL` automatically |
| EPIC-001-S1-A2 | Extend ai_history schema (add model, tokens, error_message fields) | 2h | Backend | Schema migration applied, queries work |
| EPIC-001-S1-A3 | Add transaction group validation (FK constraints, orphan checks) | 2h | Backend | Orphan groups detected, validation in queries |
| EPIC-001-S1-A4 | Implement audit trail for admin impersonation (interaction_logs) | 3h | Backend | Each admin action logged with timestamp, user_id |
| EPIC-001-S1-A5 | Create user_profiles + user_settings tables (NEW) | 4h | Backend | Tables created, initial data migrated |

**Stream B - Type Safety & Error Handling (12 hours)**
| ID | Description | Effort | Owner | Done Criteria |
|----|-------------|--------|-------|---------------|
| EPIC-001-S1-B1 | Remove all `as any` type casts (SYS-009) | 4h | Full-stack | `grep "as any" src/` returns zero matches |
| EPIC-001-S1-B2 | Implement error recovery patterns in catch blocks | 6h | Full-stack | All 45 catch blocks have proper recovery (no console.error only) |
| EPIC-001-S1-B3 | Fix aiService ChatMessage type (no 'system' role for Gemini) | 2h | Full-stack | Gemini API calls succeed without type errors |

**Stream C - Testing (33 hours)**
| ID | Description | Effort | Owner | Done Criteria |
|----|-------------|--------|-------|---------------|
| EPIC-001-S1-C1 | Write 50+ unit tests for business logic (utilities, services) | 25h | QA | Coverage ≥40%, tests passing in CI/CD |
| EPIC-001-S1-C2 | Setup integration test infrastructure (test utilities, fixtures) | 8h | QA | Test utils documented, reusable fixtures created |

**Acceptance Criteria:**
- [ ] Zero `as any` casts in codebase
- [ ] All error paths have proper recovery
- [ ] Unit test coverage ≥40%
- [ ] Database schema fully extended (soft delete + audit trail)
- [ ] RLS policies validated (no data leakage between users)

**Dependencies:**
- Sprint 0 must complete first (TypeScript strict mode, test infrastructure)
- Database changes independent (can run in parallel)
- Type safety enables safe refactoring in Sprint 2

**Risk Mitigation:**
- Type cast removal: Use pair programming for high-risk refactors
- Error handling: Code review required for all catch blocks
- Test coverage: Automated CI/CD gate (fail if coverage drops)

---

### Sprint 2-3: Architecture Refactoring (Weeks 4-7)
**Duration:** 28 calendar days
**Team:** 4-5 developers (CRITICAL PATH)
**Focus:** FinanceContext decomposition (21h bottleneck), component refactoring
**Effort:** 111 hours

#### CRITICAL PATH: FinanceContext Split (21h, MUST COMPLETE FIRST)

| ID | Description | Effort | Owner | Done Criteria |
|----|-------------|--------|-------|---------------|
| EPIC-001-S2-CP1 | Design 5-context architecture (specification document) | 2h | Architect | Architecture document approved, dependency graph clear |
| EPIC-001-S2-CP2 | Extract TransactionsContext (state + 20 actions) | 5h | Full-stack | Tests passing, old context calls refactored to new |
| EPIC-001-S2-CP3 | Extract AccountsContext (state + 15 actions) | 4h | Full-stack | Tests passing, all account operations work |
| EPIC-001-S2-CP4 | Extract GoalsContext (state + 10 actions, includes investments + patrimony) | 4h | Full-stack | Tests passing, goals/investments/patrimony work |
| EPIC-001-S2-CP5 | Extract UIContext (theme, dashboard layout, modals) | 3h | Full-stack | Theme persistence works, dashboard widgets configurable |
| EPIC-001-S2-CP6 | Write FinanceContext sub-context unit tests (snapshot + behavior) | 3h | QA | Snapshots locked, behavior tests passing |

**Parallel Work (After SYS-006 foundation)**

**Stream A - Component Decomposition (42 hours, AFTER SYS-006)**
| ID | Description | Effort | Owner | Done Criteria |
|----|-------------|--------|-------|---------------|
| EPIC-001-S2-A1 | Refactor Dashboard (<200 LOC container, sub-components) | 8h | Frontend | Component <200 LOC, all widgets render correctly |
| EPIC-001-S2-A2 | Refactor TransactionForm (<400 LOC, extract recurrence wizard) | 13h | Frontend | Form <400 LOC, recurrence logic in service, tests passing |
| EPIC-001-S2-A3 | Refactor Accounts component (<250 LOC, separate list + form) | 10h | Frontend | Component <250 LOC, list/form can toggle independently |
| EPIC-001-S2-A4 | Optimize TransactionList (memoization, filters extracted) | 7h | Frontend | Memoization eliminates unnecessary re-renders (React Profiler confirms) |
| EPIC-001-S2-A5 | Write component decomposition tests (behavior + snapshots) | 4h | QA | All new components have tests, coverage >70% |

**Stream B - Services Extraction (20 hours, PARALLEL)**
| ID | Description | Effort | Owner | Done Criteria |
|----|-------------|--------|-------|---------------|
| EPIC-001-S2-B1 | Extract transaction service (grouping, recurrence, validation) | 6h | Full-stack | All transaction business logic in service, components use it |
| EPIC-001-S2-B2 | Extract account service (balance calculations, categories) | 5h | Full-stack | Balance calculations tested, correct for all account types |
| EPIC-001-S2-B3 | Implement transaction validation layer (groupId consistency, data integrity) | 5h | Full-stack | Validation catches all invalid states, returns proper errors |
| EPIC-001-S2-B4 | Refactor Supabase sync (error recovery, exponential backoff) | 4h | Full-stack | Sync retries on failure, logs recoverable errors |

**Stream C - Testing (20 hours, PARALLEL)**
| ID | Description | Effort | Owner | Done Criteria |
|----|-------------|--------|-------|---------------|
| EPIC-001-S2-C1 | Write service unit tests (50+ tests for business logic) | 10h | QA | Coverage >80% for services, edge cases tested |
| EPIC-001-S2-C2 | Write component integration tests (context + component interaction) | 10h | QA | Tests verify context changes propagate to components correctly |

**Acceptance Criteria:**
- [ ] FinanceContext split complete (critical path completed on schedule or early)
- [ ] Each sub-context has <30 exports
- [ ] All components decomposed <250 LOC (Dashboard <200)
- [ ] Service layer extraction complete (business logic centralized)
- [ ] Test coverage ≥70%
- [ ] No re-render regressions (React Profiler baseline vs new)
- [ ] All 335+ stories implemented working without major blockers

**Critical Dependencies:**
1. SYS-006 must complete before component decomposition starts
2. Sprint 1 must complete (type safety enables safe refactoring)
3. Services extraction can run in parallel with context split

**Risk Mitigation:**
- **FinanceContext split risk:** Snapshot tests for every context reducer, staged rollout (feature flag if needed)
- **Re-render regression:** React DevTools Profiler baseline before/after refactor
- **Test coverage:** Automated CI gate (fail if coverage drops below 70%)
- **Scope creep:** Track effort daily, escalate if >25h estimated (vs 21h)

---

### Sprint 4: Frontend Polish & E2E Foundation (Weeks 8-9)
**Duration:** 14 calendar days
**Team:** 3-4 developers
**Focus:** Accessibility, mobile, performance, E2E infrastructure
**Effort:** 55 hours

#### Stories/Tasks

| ID | Description | Effort | Owner | Done Criteria |
|----|-------------|--------|-------|---------------|
| EPIC-001-S4-001 | WCAG accessibility audit (initial assessment with axe DevTools) | 4h | Frontend | Audit document with violations list |
| EPIC-001-S4-002 | Implement WCAG attributes (150+ aria-*, roles, labels, descriptions) | 6h | Frontend | axe audit shows zero violations on critical components |
| EPIC-001-S4-003 | Implement keyboard navigation (Tab, Enter, Escape work throughout app) | 4h | Frontend | All interactive elements keyboard accessible, Tab order logical |
| EPIC-001-S4-004 | Implement focus management + visible focus indicators | 2h | Frontend | Focus clearly visible, no keyboard trap, SR announces focus |
| EPIC-001-S4-005 | Mobile responsiveness audit (breakpoints, modals, charts) | 4h | Frontend | Responsive design document, issues logged |
| EPIC-001-S4-006 | Refactor modals for mobile (stack on small screens, touch-friendly) | 3h | Frontend | Modals display correctly on 320px+ screens |
| EPIC-001-S4-007 | Fix ResponsiveContainer in Recharts (charts adapt to mobile) | 1h | Frontend | Charts render correctly on all breakpoints |
| EPIC-001-S4-008 | Test on 5+ physical devices (iOS, Android, desktop browsers) | 2h | Frontend/QA | Testing report with devices + results |
| EPIC-001-S4-009 | Implement dark mode persistence (localStorage sync) | 4h | Frontend | Dark mode preference persists across refresh |
| EPIC-001-S4-010 | Implement skeleton loaders (async states) | 4h | Frontend | Loading skeletons replace spinners, smoother UX |
| EPIC-001-S4-011 | Lighthouse optimization (performance, best practices) | 5h | Frontend | Lighthouse score ≥90 across categories |
| EPIC-001-S4-012 | Setup E2E test infrastructure (Playwright or Cypress) | 8h | QA | E2E tests runnable locally + in CI/CD |
| EPIC-001-S4-013 | Write integration tests for critical flows | 8h | QA | Tests cover auth, transactions, goals workflows |

**Acceptance Criteria:**
- [ ] WCAG 2.1 AA audit passes zero violations (axe DevTools verified)
- [ ] Mobile responsive on 5+ tested devices
- [ ] Lighthouse score ≥90
- [ ] Dark mode persists across sessions
- [ ] Keyboard navigation 100% functional
- [ ] E2E test infrastructure operational
- [ ] Integration tests cover critical flows

**Dependencies:**
- Sprint 2-3 must complete (component decomposition enables accessibility implementation)
- Can run in parallel with Sprint 3 if needed

**Risk Mitigation:**
- **WCAG compliance:** Regular audits with axe, manual testing with NVDA screen reader
- **Mobile testing:** Use physical devices + emulators (not just browser zoom)
- **Performance regression:** Lighthouse CI gate (fail if score <85 or regression >10%)

---

### Sprint 5-6: Database Normalization & E2E (Weeks 10-13)
**Duration:** 21 calendar days
**Team:** 3 developers
**Focus:** Schema normalization, E2E tests, final polish
**Effort:** 69 hours

#### Stories/Tasks (3 Parallel Streams)

**Stream A - Database Evolution (20 hours)**
| ID | Description | Effort | Owner | Done Criteria |
|----|-------------|--------|-------|---------------|
| EPIC-001-S5-A1 | Design normalized schema (transactions, accounts, goals tables) | 4h | Backend | Schema document approved, migration plan clear |
| EPIC-001-S5-A2 | Create data migration scripts (JSON blob → normalized, with rollback) | 5h | Backend | Scripts tested in staging, rollback procedure documented |
| EPIC-001-S5-A3 | Execute migration in staging (dry-run, verify data integrity) | 3h | Backend | All data migrated correctly, counts match |
| EPIC-001-S5-A4 | Add foreign key constraints (transactions → accounts/categories/goals) | 2h | Backend | Constraints active, prevent orphans |
| EPIC-001-S5-A5 | Implement batch operations + connection pooling | 3h | Backend | Batch queries significantly faster, pooling active |
| EPIC-001-S5-A6 | Setup real-time subscriptions (Supabase Realtime on critical tables) | 3h | Backend | Subscriptions active, data syncs real-time |

**Stream B - E2E Tests & Validation (28 hours)**
| ID | Description | Effort | Owner | Done Criteria |
|----|-------------|--------|-------|---------------|
| EPIC-001-S5-B1 | Write E2E test: User signup + first transaction | 4h | QA | Test passes, journey fully automated |
| EPIC-001-S5-B2 | Write E2E test: Recurring transaction management (12-installment) | 4h | QA | Test covers creation, modification, deletion of recurring group |
| EPIC-001-S5-B3 | Write E2E test: CSV import validation + sync | 4h | QA | Import, validation, database sync all tested |
| EPIC-001-S5-B4 | Write E2E test: Admin impersonation + audit trail | 4h | QA | Admin action logged, audit trail accessible |
| EPIC-001-S5-B5 | Write E2E test: Multi-user isolation (security) | 3h | QA | User A cannot see User B data (RLS enforced) |
| EPIC-001-S5-B6 | Write E2E test: AI insights generation + persistence | 2h | QA | Insights call works, results persisted |
| EPIC-001-S5-B7 | E2E regression testing (run suite, document results) | 3h | QA | All tests passing, performance recorded |

**Stream C - Polish & Final (21 hours, PARALLEL)**
| ID | Description | Effort | Owner | Done Criteria |
|----|-------------|--------|-------|---------------|
| EPIC-001-S5-C1 | Implement design tokens (colors, spacing, typography) | 5h | Frontend | Token file created, components use tokens consistently |
| EPIC-001-S5-C2 | Create modal abstraction component (reduce duplication) | 7h | Frontend | Modal base component extracted, 4+ implementations use it |
| EPIC-001-S5-C3 | Setup lazy loading component infrastructure | 6h | Frontend | Dynamic imports working, bundle size reduced |
| EPIC-001-S5-C4 | Form validation UX improvements (inline feedback, error clarity) | 3h | Frontend | Forms show clear validation messages, inline |

**Acceptance Criteria:**
- [ ] Schema normalized (transactions, accounts, goals separated)
- [ ] Data migration completed successfully in staging
- [ ] Foreign key constraints active
- [ ] E2E tests cover 6+ critical journeys (all passing)
- [ ] Performance SLOs validated:
  - [ ] Bundle <300KB (target <250KB)
  - [ ] TTI <3s on 3G Fast
  - [ ] Dashboard re-render <100ms
  - [ ] Filter 1000+ items <500ms
- [ ] Zero data loss during migration
- [ ] All E2E tests passing in CI/CD

**Dependencies:**
- Sprint 4 must mostly complete (E2E infrastructure from Sprint 4)
- Database changes can run in parallel

**Risk Mitigation:**
- **Data migration:** Test thoroughly in staging, backup before production
- **E2E tests:** Run in isolated environment, use test data
- **Performance:** Automated CI/CD gates (fail if regression >10%)

---

## Team & Roles

### Recommended Team Composition

| Role | Person | Sprints | Key Responsibilities | Seniority |
|------|--------|---------|----------------------|-----------|
| **Architect** | TBD | 0-3, 5 | System design, FinanceContext split guidance, DB schema, refactoring decisions | Senior (8+ years) |
| **Full-Stack Dev** | TBD | 1-6 | Components, services, database, refactoring, business logic | Senior/Mid (4+ years) |
| **QA/Frontend Specialist** | TBD | 0-6 | Test infrastructure, E2E tests, accessibility, performance, mobile testing | Senior/Mid (3+ years) |
| **DevOps (Part-time)** | TBD | 0, 1, 6 | CI/CD setup, deployment, infrastructure | Mid (3+ years) |

### Availability & Allocation

| Sprint | Phase | Dev 1 (Arch) | Dev 2 (Full-Stack) | Dev 3 (QA/Frontend) | DevOps |
|--------|-------|---------|----------|----------|--------|
| **0** | Bootstrap | 100% | 100% | 100% | 30% (CI/CD setup) |
| **1** | Type Safety | 50% | 100% | 100% | 10% |
| **2-3** | Critical Path | 100% (SYS-006 guidance) | 100% | 100% | 10% |
| **4** | Polish | 20% | 80% | 100% | 5% |
| **5-6** | Final | 40% | 60% | 100% | 5% |

---

## Dependencies & Critical Path

### Dependency Graph

```
BLOQUEANTES (Must complete first):
  1. DB-001 (RLS policies)        ← Security foundation
  2. TEST-001 + TEST-007          ← Infrastructure enables validation
  3. SYS-006 (FinanceContext)     ← Blocks all component refactoring

INDEPENDENTES (Can run in parallel):
  ├── DB-003, DB-004, DB-005, DB-007, DB-008, DB-009 (DB foundation)
  ├── SYS-008, SYS-009, SYS-011-015, SYS-018, SYS-019 (Various fixes)
  ├── FE-011, FE-012, FE-013, FE-015, FE-017, FE-018, FE-020 (FE work)
  └── TEST-002, TEST-003 (Unit + integration tests)

PÓS-REFACTOR (Depend on SYS-006):
  ├── SYS-001 (Dashboard decomposition)
  ├── SYS-002 + SYS-017 (TransactionForm refactor)
  ├── SYS-003 (Accounts refactor)
  ├── SYS-004 (TransactionList optimization)
  ├── SYS-005 (Insights refactor)
  └── SYS-007 (Admin impersonation refactor)

ACCESSIBILITY (Depend on component refactoring):
  ├── FE-001 (Accessibility - easier on smaller components)
  ├── FE-002 (Mobile - easier on modular components)
  └── TEST-004 (E2E - better after architecture stable)

LAST (Sprint 5+):
  ├── DB-002 (Schema normalization)
  ├── FE-004 (Lazy loading)
  ├── FE-009 (Design tokens)
  └── FE-019 (i18n)
```

### Critical Path Timeline

```
Sprint 0 (1 week):
  ├─ RLS policies (4h)         ✓ Non-blocking prereq
  ├─ TypeScript strict (2h)    ✓ Non-blocking prereq
  ├─ Test setup (6h)           ✓ REQUIRED
  └─ Error boundaries (4h)     ✓ Safety net

Sprint 1 (2 weeks):
  ├─ Unit tests (25h)          → Test coverage 40%
  ├─ Type safety (10h)         → Enable refactoring
  └─ Database (15h)            → Foundation ready

Sprint 2-3 (4 weeks) ← CRITICAL PATH:
  ├─ SYS-006 (21h)            ✓ BLOCKER - sequential
  │   └─ FinanceContext split completes
  ├─ Component decomposition (42h) ✓ Starts after SYS-006
  ├─ Service extraction (20h)  ✓ Parallel with context
  └─ Tests (20h)              → Coverage 70%

Sprint 4 (2 weeks):
  ├─ Accessibility (12h)
  ├─ Mobile (12h)
  ├─ E2E infrastructure (8h)
  └─ Performance (8h)

Sprint 5-6 (3 weeks):
  ├─ Schema normalization (20h)
  ├─ E2E tests (28h)
  ├─ Polish (21h)
  └─ Final validation

TOTAL CRITICAL PATH: ~110 hours minimum (SYS-006 = 21h bottleneck)
WITH 3 PEOPLE PARALLELIZING: 6 weeks
WITH 1 PERSON SERIAL: 26 weeks (NOT RECOMMENDED)
```

---

## Risk Management

### Critical Risks (Showstoppers)

| Risk | Probability | Severity | Impact | Mitigation |
|------|-------------|----------|--------|-----------|
| **FinanceContext split introduces infinite re-renders** | 15% | CRITICAL | Blocks App | Snapshot tests for each sub-context; staged rollout with feature flag |
| **RLS bypass discovered post-production** | 3% | CRITICAL | Data leak | Security audit pre-deploy; Supabase RLS tester; role verification tests |
| **Data loss during schema normalization** | 5% | CRITICAL | Complete failure | Backup before migration; dry-run in staging; rollback procedure |
| **Component refactoring breaks existing features** | 20% | HIGH | Regression | Comprehensive tests before refactoring; pair programming for high-risk components |
| **Performance regression >20%** | 15% | HIGH | UX worse | Lighthouse CI with fail gate; React Profiler before/after; bundle analyzer |

**Escalation:** If showstopper occurs:
1. Immediately halt sprint work
2. Create dedicated debug task
3. Pair architecture + affected dev
4. Revert if fix >4 hours
5. Root cause analysis + prevention

### High Risks (Delayers - 1-2 week impact)

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| **FinanceContext split complexity >25h estimated** | 20% | Daily standup check; pair programming; architectural sync |
| **Test coverage progress lags behind schedule** | 15% | Hire contract QA specialist; add 4th dev |
| **Accessibility audit finds >50 violations** | 10% | Hire contract A11y specialist; extend Sprint 4 |
| **Mobile testing reveals major layout issues** | 12% | Test on devices early (Sprint 2, not Sprint 4); use responsive design patterns |
| **Database migration script bugs** | 8% | Test in staging with clone of prod data; dry-run before live |

### Medium Risks (Manageable)

| Risk | Mitigation |
|------|-----------|
| **Type cast removal finds unexpected dependencies** | Type checking tools; incremental refactoring |
| **Error handling changes introduce new bugs** | Error path testing; error monitoring (Sentry) |
| **Component memoization over-optimizes** | React Profiler validation; performance testing |
| **E2E test flakiness** | Retry logic; test isolation; Playwright wait strategies |

---

## Metrics & Monitoring

### Key Performance Indicators (KPIs)

#### Quality Metrics

| Metric | Baseline | Target | Sprint Achieved | Pass Criteria |
|--------|----------|--------|-----------------|---------------|
| **Test Coverage (Unit)** | 1% | 80% | S1: 40%, S2: 70%, S5: 80%+ | CI/CD gate |
| **Type Safety** | 35 `as any` | 0 | S1: 0 | `grep "as any"` = 0 |
| **Component Size** | 658 LOC | <200 LOC | S3: Achieved | Code review |
| **FinanceContext Exports** | 96 | <30/context | S3: Achieved | Static analysis |
| **Error Handling** | 45 console.error | 100% recovery | S1: 100% | Code review + tests |
| **WCAG Compliance** | 0/100 | AA (90+) | S4: Achieved | axe audit |
| **Lighthouse Score** | 40 | 90+ | S4: Achieved | Lighthouse CI |
| **Bundle Size** | ~300KB | <250KB | S5: <300KB | Webpack analyzer |

#### Performance Metrics

| Metric | Baseline | Target | Validation |
|--------|----------|--------|-----------|
| **Time-to-Interactive (TTI)** | ~5s (est.) | <3s (3G Fast) | Lighthouse CI |
| **First Contentful Paint** | Unknown | <1.5s | WebPageTest |
| **Dashboard Re-render** | Unknown | <100ms per action | React Profiler |
| **Filter 1000 Items** | Unknown | <500ms | Performance test |
| **PDF Export (500 items)** | Unknown | <2s, <50MB memory | Stress test |

#### Business Metrics

| Metric | Current | 6-Month Target | Tracked By |
|--------|---------|-----------------|-----------|
| **Team Velocity** | 3-4 features/sprint | 6-8 features/sprint | Sprint planning |
| **Bug Escape Rate** | 5-8 bugs/release | <1 bug/release | QA metrics |
| **Time-to-Feature** | 5-7 days | 2-3 days | Sprint tracking |
| **Churn Reduction** | 15% baseline | 10% (target) | Metrics dashboard |
| **Mobile Users** | -30% vs desktop | +15% improvement | Analytics |
| **Production Incidents** | Unknown | <1/month | Monitoring |

### Burndown & Tracking

- **Daily Standup:** What's done, blockers, scope changes
- **Burndown Chart:** Hours remaining vs ideal (per sprint)
- **Metrics Dashboard:** Automated CI/CD reporting (coverage, bundle, performance)
- **Weekly Review:** Velocity, risk register, timeline adjusted if needed
- **Post-Sprint Retrospective:** What went well, improvements, lessons learned

---

## Deliverables & Artifacts

### Per Sprint

1. **Code Deliverables**
   - Merged PRs (all changes committed, reviewed, tested)
   - Updated documentation (architecture, API changes)
   - Test coverage reports (with diffs)
   - Performance baseline reports

2. **Documentation**
   - Sprint summary (what shipped, what didn't, why)
   - Architecture documents (context diagrams, decision logs)
   - Test reports (coverage, E2E results)
   - Performance reports (bundle analysis, Lighthouse scores)

3. **Artifacts**
   - Sprint review slides (demo for stakeholders)
   - Retrospective notes (team learnings)
   - Updated burndown chart
   - Risk register (updated)

### Final Deliverables (End of Epic)

1. **Codebase**
   - All 335+ stories completed
   - >80% test coverage
   - Zero `as any` casts
   - <200 LOC components
   - RLS policies deployed
   - E2E tests for 6+ critical journeys

2. **Documentation**
   - Architecture guide (5 contexts, service layer)
   - API documentation (all exports)
   - Database schema diagram (normalized)
   - Deployment guide (RLS, migrations, infrastructure)
   - Performance baseline report (with SLOs)
   - WCAG compliance report
   - Security audit clearance

3. **Training & Handoff**
   - Code walkthrough for new team members
   - Testing strategy guide
   - Troubleshooting runbook
   - Incident response procedures

---

## Go-Live Plan

### Pre-Production (Sprint 6 completion)

- **Week 1:** Deploy to staging environment
- **Week 2:** Security audit sign-off (RLS, data isolation)
- **Week 3:** Performance validation (SLOs met)
- **Week 4:** E2E regression testing (all tests passing)

### Production Deployment (Target: 2026-04-06)

**Strategy:** Blue-Green Deployment (zero downtime)

1. **Preparation (Day 1)**
   - [ ] Database backup (Supabase automated snapshots)
   - [ ] Infrastructure readiness check (capacity, monitoring)
   - [ ] Team standby (dev + ops 24h after deployment)

2. **Deployment (Day 1, Evening)**
   - [ ] Deploy green environment with new code
   - [ ] Smoke tests (critical paths working)
   - [ ] Switch DNS/load balancer to green (instant, reversible)
   - [ ] Monitor for 1 hour (error rates, performance)

3. **Rollback Window (Days 1-2)**
   - [ ] If issues: revert to blue environment (<5 minutes)
   - [ ] Keep green available for 24 hours
   - [ ] Debug & replan if rollback triggered

4. **Stabilization (Days 2-7)**
   - [ ] Monitor metrics (error rates, performance, user reports)
   - [ ] Patch critical bugs (if any)
   - [ ] Decommission blue environment (end of week)

### Post-Launch

| Period | Focus | Metrics |
|--------|-------|---------|
| **Month 1** | Stability + bug fixes | <1 production incident/day |
| **Month 2** | Feature backlog resumption | Velocity back to 6-8 features/sprint |
| **Month 3** | Performance optimization | Fine-tune queries, caching, monitoring |

---

## Success Criteria (Acceptance by Stakeholders)

### Technical Sign-Off

- [ ] @architect: Architecture refactoring complete + approved
- [ ] @backend: Database changes + RLS validated + approved
- [ ] @frontend: Accessibility + mobile + performance complete + approved
- [ ] @qa: Test coverage >80% + E2E tests passing + approved
- [ ] @devops: Deployment ready + monitoring configured + approved
- [ ] Security: RLS policies + audit trail + compliance review + approved

### Business Sign-Off

- [ ] @pm: Timeline/scope delivered as planned + approved
- [ ] @po: Product vision achieved + approved
- [ ] @sales: Ready for new customer onboarding + approved
- [ ] Investors: ROI validated + approved

### Key Metrics Validation

- [ ] Bundle <300KB ✓
- [ ] TTI <3s ✓
- [ ] Test coverage >80% ✓
- [ ] WCAG AA compliance ✓
- [ ] Zero production incidents (30 days) ✓
- [ ] Velocity 6-8 features/sprint ✓

---

## Budget & Resource Allocation

### Investment Breakdown

| Category | Hours | Cost (R$ 150/h) | Notes |
|----------|-------|-----------------|-------|
| **Sprint 0 - Bootstrap** | 35 | R$ 5.250 | Infrastructure foundation |
| **Sprint 1 - Security** | 65 | R$ 9.750 | Type safety + database |
| **Sprint 2-3 - Architecture** | 111 | R$ 16.650 | Critical path (FinanceContext) |
| **Sprint 4 - Polish** | 55 | R$ 8.250 | Accessibility + mobile |
| **Sprint 5-6 - Final** | 69 | R$ 10.350 | Normalization + E2E |
| **TOTAL** | **335** | **R$ 50.250** | 6 weeks, 3 FTE |

### Contingency

- **Buffer:** 20% of hours (67h) reserved for unknowns
- **Escalation:** If any sprint overruns >20%, add 4th developer (mid-level)
- **Cost overrun threshold:** >R$ 60K triggers stakeholder review

### Resource Costs

- **Salaries (6 weeks):** R$ 35K (3 devs × 2 weeks average R$ 6K/dev/week)
- **Infrastructure:** R$ 3K (Supabase, monitoring, CI/CD)
- **Tools & Services:** R$ 2.250 (testing tools, licenses)
- **Contingency (10%):** R$ 7K
- **TOTAL PROGRAM COST:** ~R$ 47.250 (vs R$ 50.250 labor estimate)

---

## Related Documents & References

### Architecture & Design

- `docs/prd/technical-debt-assessment.md` — Detailed technical debt inventory
- `docs/reports/TECHNICAL-DEBT-REPORT.md` — Executive summary for stakeholders
- `CLAUDE.md` — Project guidelines and conventions

### Stories & Tasks

- `docs/stories/epic-sprint-0-bootstrap.md` (created after this)
- `docs/stories/epic-sprint-1-security.md` (created after this)
- `docs/stories/epic-sprint-2-3-architecture.md` (created after this)
- `docs/stories/epic-sprint-4-frontend.md` (created after this)
- `docs/stories/epic-sprint-5-6-final.md` (created after this)

### Standards & Guidelines

- WCAG 2.1 Level AA: https://www.w3.org/WAI/WCAG21/quickref/
- Accessibility Testing: https://www.w3.org/WAI/test-evaluate/
- React Performance: https://react.dev/reference/react#performance
- TypeScript Strict Mode: https://www.typescriptlang.org/tsconfig#strict
- Playwright E2E: https://playwright.dev/
- Testing Library: https://testing-library.com/

---

## Communication Plan

### Stakeholders

| Role | Frequency | Format | Owner |
|------|-----------|--------|-------|
| **Board/Investors** | Weekly | Summary slide (metrics) | @pm |
| **Product Owner** | Daily standup + Sprint review | Slack + meeting | @pm |
| **Tech Lead** | Daily standup + Sprint retro | Slack + meeting | @architect |
| **Team** | Daily standup + 2x weekly sync | Slack + meeting | @pm |
| **QA/Testing** | Weekly | Test report + metrics | @qa |

### Escalation Path

1. **Blocker discovered** → Immediate: Slack message to @architect + @pm
2. **1-2 day delay** → Daily: Note in standup, flag in burndown
3. **>1 week risk** → Escalation: Team meeting + risk register update
4. **Showstopper** → Executive: All hands, sprint pause, decision point

---

## Conclusion

This epic represents a **comprehensive, 6-week refactoring program** to transform SPFP from an unstable MVP into a production-grade architecture. With 335 hours of focused work, 3 experienced developers, and a clear roadmap, we will resolve all 7 critical technical debts, achieve >80% test coverage, and unlock 10x scalability.

**Expected Outcome:** A robust, compliant, performant financial management platform ready for enterprise sales and 50K+ users.

**Investment:** R$ 50.250
**ROI:** 5.95:1 (R$ 302K net gain in 6 months)
**Timeline:** 6 weeks (or 12 weeks with 2 devs)
**Start Date:** 2026-02-23 (Sprint 0 kickoff)
**Go-Live:** 2026-04-06

---

## Appendix: Sprint Stories Index

All 50+ stories will be created in FASE 10b following this epic. Each story will:

- Reference this epic (EPIC-001)
- Inherit acceptance criteria and success metrics
- Include detailed tasks and test cases
- Have assigned effort estimates (±20%)
- Track dependencies and blockers
- Report weekly progress in burndown chart

**See:** `docs/stories/` directory for individual sprint epics and stories.

---

**Document:** Epic Technical Debt Resolution v1.0
**Created:** 2026-01-26
**By:** @pm (Morgan - Product Manager), Synkra AIOS
**Status:** APPROVED - Ready for Sprint Planning (FASE 10b)
**Next Action:** Create Sprint 0-6 story documents (FASE 10b)
