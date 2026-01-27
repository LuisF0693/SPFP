# SPFP 6-Week Sprint Roadmap

## Executive Overview

**Project:** Sistema de Planejamento Financeiro Pessoal (SPFP)
**Duration:** 6 weeks (42 days) | 3 developers
**Critical Path:** FinanceContext refactor (21 hours - bottleneck)
**Target:** Architecture stabilization, test coverage (1% → 80%), performance optimization

---

## Visual Timeline (6 Sprints)

```
WEEK 1        WEEK 2         WEEK 3         WEEK 4         WEEK 5         WEEK 6
(SPRINT 0)    (SPRINT 1)     (SPRINT 2)     (SPRINT 3)     (SPRINT 4)     (SPRINT 5)
└─────┬────────┬────┬────────┬─────┬─────────┬─────┬─────────┬─────┬────────┬──────────┘

Sprint 0 FOUNDATION        Sprint 1 DECOMPOSITION      Sprint 2 EXTRACTION        Sprint 3 OPTIMIZATION
├─ RLS Setup              ├─ Separate Account Logic   ├─ Split FinanceContext    ├─ Transaction Perfs
├─ TypeScript + ESLint    ├─ Split Goals Management   ├─ Extract Services        ├─ Dashboard Reflow
├─ Error Boundaries       ├─ Create Accounts Context  ├─ Initialize Tests        ├─ Caching Strategy
├─ CI/CD Pipeline         └─ Dashboard Decomposition  ├─ Implement 40% Coverage  └─ Load Testing
└─ Test Foundation                                    └─ Error Handling

Sprint 4 TESTING          Sprint 5 STABILIZATION
├─ Full Test Suite (80%)  ├─ Performance Tuning
├─ Integration Tests      ├─ Security Audit
├─ E2E Coverage           ├─ Documentation
├─ Performance Tests      ├─ Final QA
└─ Bug Fixes              └─ Go-Live Checklist
```

---

## Detailed Sprint Breakdown

### SPRINT 0: Foundation & Setup (Week 1) - 40 hours
**Goal:** Establish development infrastructure and code quality standards

```
MON    TUE    WED    THU    FRI    SAT    SUN
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ RLS  │ TS   │ Err  │ CI/  │Test  │ Buff │ Buff │
│Setup │Check │Bound │CD    │Foun  │ er   │ er   │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

**Deliverables:**
- Row-level security (RLS) policies configured
- TypeScript strict mode + ESLint enabled
- Error boundary components deployed
- CI/CD pipeline (GitHub Actions)
- Test infrastructure (Vitest + RTL setup)

**Completion:** Go/No-Go decision point

---

### SPRINT 1: Component Decomposition (Week 2) - 40 hours
**Goal:** Break monolithic components into reusable, focused units

```
MON      TUE        WED        THU          FRI       SAT    SUN
├─────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┼──────┼──────┤
│Acct │Acct  │Goals │Goals │Goals │Dash  │Dash  │Dash  │Buff  │ Buff │ Buff │
│Ext  │Test  │Ext   │Test  │Int   │Decomp│Test  │Int   │      │      │      │
└─────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

**Stories:**
1. Extract Account management into AccountsContext (6h)
2. Extract Goals management into GoalsContext (7h)
3. Decompose Dashboard component (8h)
4. Create Accounts list/form components (6h)
5. Integration testing & debugging (13h)

**Completion:** 40% test coverage achieved, Dashboard < 500 LOC

---

### SPRINT 2: State & Service Extraction (Week 3) - 42 hours
**Goal:** Split monolithic FinanceContext and extract service layer

```
MON       TUE       WED        THU        FRI        SAT    SUN
├───┬───┬───┬───┬────┬───┬───┬────┬───┬────┬───┬───┬───┼───┤
│FC │FC │FC │Svc│Svc │Svc│DB │Test│T  │Test│Int│Buff│...│
│Pt1│Pt2│Pt3│Ext│Ext │Org│Norm│Init│Cov│Impl│   │    │   │
└───┴───┴───┴───┴────┴───┴───┴────┴───┴────┴───┴───┴───┴───┘
```

**Stories:**
1. Split FinanceContext Part 1 - Accounts/Goals (7h) **CRITICAL PATH**
2. Split FinanceContext Part 2 - Investments/Budget (7h) **CRITICAL PATH**
3. Split FinanceContext Part 3 - Patrimony/Reports (7h) **CRITICAL PATH**
4. Extract transaction service layer (6h)
5. Database normalization (4h)
6. Initialize 40% test coverage (4h)
7. Error handling & recovery (4h)

**Completion:** FinanceContext split complete, 60% test coverage, services extracted

---

### SPRINT 3: Performance & Optimization (Week 4) - 38 hours
**Goal:** Optimize rendering, caching, and database queries

```
MON       TUE       WED       THU       FRI       SAT    SUN
├───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┼───┤
│Txn│Txn│Dsh│Dsh│Rch│Cac│Cac│Load│Mem│Opt│Int│Perf│...│
│Opt│Test│Opt│Test│Opt│Str│Test│Test│Opt│Fin│Buff│   │
└───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

**Stories:**
1. Transaction list pagination & memoization (7h)
2. Dashboard re-render optimization (6h)
3. Recharts performance tuning (5h)
4. Caching strategy implementation (6h)
5. Load testing & profiling (6h)
6. Memory optimization (5h)
7. Integration & buffer (3h)

**Completion:** 70% test coverage, performance baseline established

---

### SPRINT 4: Testing & Quality (Week 5) - 40 hours
**Goal:** Achieve comprehensive test coverage and integration validation

```
MON      TUE       WED       THU       FRI       SAT    SUN
├───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┼───┤
│Int│Int│E2E│E2E│Perf│Perf│BugFix│Debug│QA│Buff│...│
│Test│Test│Test│Test│Test│Test│      │   │Pass│   │   │
└───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

**Stories:**
1. Integration test suite - Contexts (8h)
2. Integration test suite - Components (8h)
3. E2E test scenarios (8h)
4. Performance test suite (6h)
5. Bug fixes & edge cases (6h)
6. QA pass & final validation (4h)

**Completion:** 80% test coverage achieved, all integrations validated

---

### SPRINT 5: Stabilization & Launch (Week 6) - 36 hours
**Goal:** Final optimization, documentation, and production readiness

```
MON       TUE       WED       THU       FRI       SAT    SUN
├───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┼───┤
│Perf│Perf│Sec│Docs│Docs│E2E│Bench│Deploy│Ready│...│
│Tune│Bench│Audit│Final│Deploy│Final│Final│Staging│Check│ │
└───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

**Stories:**
1. Performance tuning & benchmarking (8h)
2. Security audit & hardening (6h)
3. Documentation completion (6h)
4. E2E deployment testing (6h)
5. Final QA & bug fixes (6h)
6. Go-live checklist (4h)

**Completion:** Production-ready, 80% coverage, benchmarks published

---

## Critical Path Analysis

```
┌─────────────────────────────────────────────────────┐
│ CRITICAL PATH: FinanceContext Split (21 hours)      │
├─────────────────────────────────────────────────────┤
│ Sprint 2: Days 1-3 (21 hours total)                 │
│                                                      │
│ ├─ Part 1: Accounts/Goals (7h) - BLOCKER            │
│ ├─ Part 2: Investments/Budget (7h) - BLOCKER        │
│ └─ Part 3: Patrimony/Reports (7h) - BLOCKER         │
│                                                      │
│ Blocks: Service extraction, component decomposition │
│ Dependencies: RLS, TS setup, error boundaries       │
│ Slack: 3 days (buffer for unexpected issues)        │
└─────────────────────────────────────────────────────┘
```

### Parallel Work Streams

While FinanceContext split happens in Sprint 2:

**Stream A (Months 1-3):** Component Decomposition
- Dashboard breakdown (Week 2)
- Transaction components (Week 3)
- Forms & modals (Week 3-4)

**Stream B (Months 2-4):** Database Normalization
- Schema review (Week 2)
- Supabase table optimization (Week 3)
- Migration testing (Week 4)

**Stream C (Months 3-5):** UX & Performance
- Transaction list perf (Week 4)
- Dashboard rendering (Week 4)
- Charts optimization (Week 4-5)

---

## Success Criteria by Sprint

| Sprint | Metric | Target | Current |
|--------|--------|--------|---------|
| **0** | CI/CD pipeline | Passing | Not started |
| | TS strict mode | Enabled | Partial |
| **1** | Test coverage | 40% | 1% |
| | Dashboard LOC | < 500 | 613 |
| **2** | FinanceContext split | Complete | Monolithic |
| | Test coverage | 60% | 40% |
| **3** | Component perf | < 100ms render | Unoptimized |
| | Test coverage | 70% | 60% |
| **4** | Test coverage | 80% | 70% |
| | Integration tests | Complete | Partial |
| **5** | Production ready | Yes | In progress |
| | Documentation | 100% | Partial |

---

## Risk Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| FinanceContext split delays | 15 days | Medium | Start Sprint 1 early prep |
| Test framework issues | 5 days | Low | Spike test setup in Sprint 0 |
| Performance regressions | 10 days | Medium | Profile weekly, establish baselines |
| Supabase schema conflicts | 7 days | Medium | Lock schema in Sprint 1 |
| Team context loss | 8 days | Low | Daily standups, wiki updates |
| Browser compatibility | 5 days | Low | Test on 2+ browsers weekly |

---

## Resource Allocation

**Recommended Team Composition:**
- 1 Architect (design split, oversee refactor)
- 1 Full-stack Dev (components + state)
- 1 QA/Frontend Specialist (tests + perf)

**Estimated Effort:** 236 developer-hours across 6 weeks

---

## Key Milestones & Gates

1. **Sprint 0 Exit Gate** (End of Week 1)
   - [ ] CI/CD passing
   - [ ] TypeScript strict mode
   - [ ] Test infrastructure ready
   - **Go/No-Go Decision**

2. **Sprint 1 Exit Gate** (End of Week 2)
   - [ ] 40% test coverage
   - [ ] Dashboard < 500 LOC
   - [ ] Account/Goals contexts created

3. **Sprint 2 Exit Gate** (End of Week 3)
   - [ ] FinanceContext split complete
   - [ ] 60% test coverage
   - [ ] Services extracted

4. **Sprint 3 Exit Gate** (End of Week 4)
   - [ ] Performance benchmarks established
   - [ ] 70% test coverage
   - [ ] Caching strategy working

5. **Sprint 4 Exit Gate** (End of Week 5)
   - [ ] 80% test coverage
   - [ ] All integration tests passing
   - [ ] E2E scenarios validated

6. **Sprint 5 Exit Gate** (End of Week 6)
   - [ ] Production ready
   - [ ] Documentation complete
   - [ ] Go-live checklist signed off

---

## Detailed Sprint Files

- **[SPRINT-0-DETAILED.md](./SPRINT-0-DETAILED.md)** - Week 1 daily breakdown
- **[CRITICAL-PATH-ANALYSIS.md](./CRITICAL-PATH-ANALYSIS.md)** - Dependency chain & bottlenecks
- **[RESOURCE-ALLOCATION.md](./RESOURCE-ALLOCATION.md)** - Team structure & skills
- **[SUCCESS-METRICS.md](./SUCCESS-METRICS.md)** - Tracking & monitoring

---

**Last Updated:** January 2026
**Status:** Ready for Kickoff
**Prepared by:** Product & Architecture Team
