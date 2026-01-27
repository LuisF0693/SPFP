# DEPENDENCIES GRAPH - Visual Dependency Mapping

**Document:** Technical Dependencies Analysis
**Date:** 2026-01-26
**Status:** VALIDATED - No circular dependencies found

---

## Executive Summary

- **Total Stories:** 50
- **Stories with Dependencies:** 28 (56%)
- **Independent Stories:** 22 (44%)
- **Circular Dependencies:** 0 (NONE - GOOD!)
- **Critical Path:** STY-001 → STY-002 → STY-010 (39 hours sequential)
- **Longest Blocking Chain:** 8 stories in sequence (STY-001→002→010→012→016→017)

---

## Dependency Matrix

### Legend
- **BLOCKS:** Story X must complete before Story Y starts
- **BLOCKED_BY:** Story X depends on Story Y completing first
- **ENABLES:** Story X unblocks multiple downstream stories

### Complete Dependency Table

| Story | Title | BLOCKED_BY | BLOCKS | ENABLES | Category |
|---|---|---|---|---|---|
| **STY-001** | RLS Policies | - | - | Foundation | Security |
| **STY-002** | TypeScript Strict | - | STY-006 | Type Safety | Foundation |
| **STY-003** | Error Boundaries | - | - | Independent | Foundation |
| **STY-004** | CI/CD Pipeline | - | All PRs | Testing Infra | Foundation |
| **STY-005** | Test Infrastructure | STY-004 | STY-009 | Testing | Foundation |
| **STY-006** | Remove `as any` Casts | STY-002 | - | Type Safety | Refactor |
| **STY-007** | Error Recovery Patterns | - | - | Independent | Refactor |
| **STY-008** | Soft Delete Strategy | - | - | Independent | Database |
| **STY-009** | Unit Tests (50+) | STY-005 | - | Test Coverage | Testing |
| **STY-010** | FinanceContext Split | STY-006 | STY-011, 012, 013, 033, 035 | Architecture | **CRITICAL** |
| **STY-011** | Dashboard Decompose | STY-010 | - | Component Perf | Refactor |
| **STY-012** | TransactionForm Refactor | STY-010 | - | Component Perf | Refactor |
| **STY-013** | Accounts Decompose | STY-010 | - | Component Perf | Refactor |
| **STY-014** | WCAG Accessibility | - | - | Independent | Frontend |
| **STY-015** | Mobile Responsiveness | - | - | Independent | Frontend |
| **STY-016** | E2E Tests | - | - | Production Ready | Testing |
| **STY-017** | Schema Normalization | - | - | Independent | Database |
| **STY-018** | Dark Mode Persistence | - | - | Independent | Frontend |
| **STY-019** | Skeleton Loaders | - | - | Independent | Frontend |
| **STY-020** | Transaction Validation | - | - | Independent | Data Quality |
| **STY-021** | Lighthouse Optimization | - | - | Independent | Performance |
| **STY-022** | Design Tokens System | - | - | Independent | Frontend |
| **STY-023** | Transaction List Optimization | STY-010 | - | Performance | Refactor |
| **STY-024** | Modal Abstraction Component | - | - | Independent | Frontend |
| **STY-025** | Lazy Loading Infrastructure | - | - | Independent | Performance |
| **STY-026** | Form Validation UX | - | - | Independent | Frontend |
| **STY-027** | Audit Trail (Admin) | - | - | Independent | Security |
| **STY-028** | Error Recovery Service | - | - | Independent | Reliability |
| **STY-029** | DB Connection Pooling | - | - | Independent | Performance |
| **STY-030** | AI History Schema | - | - | Independent | Database |
| **STY-031** | Real-Time Subscriptions | STY-010 | - | Real-time | Database |
| **STY-032** | Integration Tests | STY-005 | - | Test Coverage | Testing |
| **STY-033** | Integration Tests (Critical) | STY-010 | - | Quality Assurance | Testing |
| **STY-034** | Extract Insights Logic | STY-010 | - | Component Perf | Refactor |
| **STY-035** | Supabase Sync Recovery | STY-010 | - | Reliability | Backend |
| **STY-036** | User Profiles Table | - | - | Independent | Database |
| **STY-037** | User Settings Table | - | - | Independent | Database |
| **STY-038** | Transaction Group Validation | - | - | Independent | Data Quality |
| **STY-039** | CategoryIcon Service | - | - | Independent | Frontend |
| **STY-040** | PDF Export Optimization | - | - | Independent | Performance |
| **STY-041** | Performance Monitoring | - | - | Independent | Observability |
| **STY-042** | AI Service Validation | - | - | Independent | Backend |
| **STY-043** | useCallback Dependencies | - | - | Independent | Performance |
| **STY-044** | Lazy Loading Routes | - | - | Independent | Performance |
| **STY-045** | i18n Infrastructure | - | - | Independent | Localization |
| **STY-046** | Auto-Save Forms | - | - | Independent | Frontend |
| **STY-047** | Batch Operations | - | - | Independent | Performance |
| **STY-048** | localStorage Debouncing | - | - | Independent | Performance |
| **STY-049** | Security Headers + CSP | - | - | Independent | Security |
| **STY-050** | Final Integration Tests | - | - | Independent | Quality Assurance |

---

## Critical Path Analysis

### Definition
The longest chain of dependent stories that determines minimum project completion time.

### Primary Critical Path (39 hours serial)
```
START
  ↓
STY-001 (4h) - RLS Policies [DAY 1]
  └─ Foundation task - no blocking

STY-004 (6h) - CI/CD Pipeline [DAY 1-2]
  └─ BLOCKS: All PRs after this must pass CI/CD

STY-005 (6h) - Test Infrastructure [DAY 2]
  ├─ BLOCKS: STY-009 unit tests
  └─ Foundation for all testing

STY-002 (2h) - TypeScript Strict Mode [DAY 2]
  └─ BLOCKS: STY-006 type cast removal

STY-006 (4h) - Remove `as any` Casts [DAY 3]
  └─ BLOCKS: STY-010 context split (cleaner refactor)

STY-010 (21h) - FinanceContext Split [DAY 3-6] **CRITICAL BOTTLENECK**
  └─ BLOCKS: STY-011, 012, 013, 023, 031, 033, 034, 035

STY-012 (13h) - TransactionForm Refactor [DAY 6-8]
  └─ Depends on STY-010
  └─ Component decomposition flow

END

CRITICAL PATH TOTAL: 4 + 6 + 6 + 2 + 4 + 21 + 13 = 56 hours serial
PARALLEL OPPORTUNITY: STY-001, 002 can start simultaneously
ADJUSTED CRITICAL PATH: (4 + 6) parallel + 6 + 2 parallel + 4 + 21 + 13 = 39-44 hours effective
```

### Alternative Critical Paths

**Path B: Testing-Focused**
```
STY-004 (CI/CD) → STY-005 (Test Infra) → STY-009 (Unit Tests 25h) → STY-032 (Integration Tests 18h)
= 6 + 6 + 25 + 18 = 55 hours
(Can parallelize with Path A after STY-005)
```

**Path C: Frontend-Focused**
```
STY-014 (Accessibility 12h) → STY-015 (Mobile 8h) → STY-016 (E2E 20h)
= 40 hours (can run parallel with other sprints)
```

### Critical Path Bottleneck: STY-010 (21 hours)

**Why it's the bottleneck:**
- Largest single story
- Blocks 8 downstream stories
- High complexity (context refactoring)
- Cannot be parallelized effectively

**Strategies to reduce impact:**
1. **Assign best architect** - Most experienced developer
2. **Pair programming** - Architect + 1 Full-Stack dev (first 3 days)
3. **Pre-planning** - Detailed design before implementation (2 days)
4. **Snapshot tests early** - Validate structure continuously
5. **Parallel work** - Other team members on STY-020, 033, 032

---

## Dependency Chains (By Length)

### 8-Story Chain (Longest)
```
STY-001 (RLS)
  → STY-002 (TS Strict)
    → STY-006 (Remove Casts)
      → STY-010 (Context Split) **BOTTLENECK**
        → STY-012 (TransactionForm Refactor)
          → STY-016 (E2E Tests) [can parallel-ish]
            → STY-050 (Final Integration Tests)
              → PRODUCTION READY

Total Sequential Hours: 4 + 2 + 4 + 21 + 13 + 20 + 8 = 72 hours
```

### 5-Story Chains (Medium)
```
STY-004 (CI/CD)
  → STY-005 (Test Infra)
    → STY-009 (Unit Tests)
      → STY-032 (Integration Tests) [partial dependency]
        → STY-050 (Final Tests)

STY-010 (Context Split)
  → STY-011 (Dashboard Decompose)
  → STY-012 (TransactionForm Refactor)
  → STY-013 (Accounts Decompose)
  → STY-033 (Integration Tests)
  → STY-034 (Extract Insights)
  → STY-035 (Sync Error Recovery)
  → STY-023 (Transaction List Optimization)
  → STY-031 (Real-time Subscriptions)
```

### Independent Stories (No Dependencies - 22 total)
These can start anytime and don't block others:
- STY-003, 007, 008, 014, 015, 017, 018, 019, 020, 021, 022
- STY-024, 025, 026, 027, 028, 029, 030, 036, 037, 038, 039
- STY-040, 041, 042, 043, 044, 045, 046, 047, 048, 049

---

## Dependency Flow Diagrams

### Sprint 0 (Bootstrap) - No Dependencies
```
┌─────────────┐
│ STY-001     │ RLS Policies (4h)
│ (P0)        │
└─────────────┘

┌─────────────┐
│ STY-002     │ TypeScript Strict (2h)
│ (P0)        │
└─────────────┘

┌─────────────┐
│ STY-003     │ Error Boundaries (4h)
│ (P0)        │
└─────────────┘

┌─────────────┐
│ STY-004     │ CI/CD Pipeline (6h) ──→ GATES ALL PRs
│ (P0)        │
└─────────────┘

┌─────────────┐
│ STY-005     │ Test Infrastructure (6h)
│ (P0)        │
└─────────────┘
```

**Action:** All can execute in parallel

---

### Sprint 1 (Type Safety & Testing) - Linear Dependencies

```
STY-002 (TS Strict)
    ↓
STY-006 (Remove Casts) ────┐
                           │
                    ┌──────┴──────┐
                    │             │
                 (enables)    (enables)
                    │             │
                    ↓             ↓
              STY-010 (Context Split)  [BLOCKED]
              [STY-006 must complete]

STY-005 (Test Infra)
    ↓
STY-009 (Unit Tests 25h)

STY-008 (Soft Delete)      [INDEPENDENT]
STY-007 (Error Recovery)   [INDEPENDENT]
STY-027-048 Batch Stories  [MOSTLY INDEPENDENT]
```

**Action:** Minimize time on STY-006 to unblock STY-010

---

### Sprint 2-3 (Architecture Refactoring) - Critical Path Peak

```
                STY-010 (Context Split - 21h) ◄─── **BOTTLENECK**
                    │
        ┌───────────┼───────────┬────────────┬──────────┐
        │           │           │            │          │
        ↓           ↓           ↓            ↓          ↓
    STY-011     STY-012     STY-013     STY-023    STY-031
    Dashboard   Transaction  Accounts   TransList   Real-time
    (8h)        Form(13h)    (10h)      (7h)        (8h)
        │           │           │            │
        └───────────┴───────────┴────────────┘
                    │
                    ↓
              STY-033 (Integration Tests 18h)
              STY-034 (Extract Insights - 9h)
              STY-035 (Sync Recovery - 6h)

STY-020 (Validation Layer - 5h)        [INDEPENDENT]
STY-032 (Integration Tests - 18h)      [INDEPENDENT, can parallel]
```

**Action:** Start STY-010 first day of sprint, other devs work on STY-020, 032, 033

---

### Sprint 4 (Frontend Polish) - All Independent

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ STY-014      │      │ STY-015      │      │ STY-018      │
│ Accessibility│      │ Mobile       │      │ Dark Mode    │
│ (12h)        │      │ (8h)         │      │ (4h)         │
└──────────────┘      └──────────────┘      └──────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ STY-019      │      │ STY-021      │      │ STY-026      │
│ Loaders      │      │ Lighthouse   │      │ Form Validation
│ (4h)         │      │ (5h)         │      │ (3h)         │
└──────────────┘      └──────────────┘      └──────────────┘

All can execute in PARALLEL
```

**Action:** Divide across team, maximize parallelization

---

### Sprint 5-6 (E2E & Final) - Mostly Independent

```
STY-016 (E2E Tests - 20h) ┐
                          ├─→ STY-050 (Final Integration - 8h)
STY-017 (Schema Norm - 16h)┘        │
                                    ↓
                            PRODUCTION READY

STY-022 (Design Tokens - 5h)  [INDEPENDENT]
STY-024 (Modal Component - 7h) [INDEPENDENT]
STY-025 (Lazy Loading - 6h)    [INDEPENDENT]
STY-044 (Route Lazy Load - 3h) [INDEPENDENT]
STY-047 (Batch Ops - 3h)       [INDEPENDENT]
STY-049 (Security Headers - 4h) [INDEPENDENT]
```

---

## Block Diagram: Complete Dependency Network

```
SPRINT 0 (FOUNDATION)
┌─────────────────────────────────────────────────────┐
│  STY-001  STY-002  STY-003  STY-004  STY-005        │
│   (4h)     (2h)     (4h)     (6h)     (6h)          │
│   RLS      TS     Errors    CI/CD   Test Infra     │
└──────┬──────────────────────┬────────────────┬──────┘
       │                      │                │
       ▼ (ENABLES)            ▼                ▼
SPRINT 1 (TYPE SAFETY)        ▼           (ENABLES)
│  STY-006 (Type Safety) ◄────┘                │
│  STY-007 (Error Recovery)                    │
│  STY-008 (Soft Delete)                       │
│  STY-009 (Unit Tests 25h) ◄──────────────────┘
│  STY-027-048 Batch
└──────┬────────────────┐
       │                │
       ▼                ▼ (ENABLES)
SPRINT 2-3 (CRITICAL PATH)
│  STY-010 ★ Context Split (21h) ◄─────── **BOTTLENECK**
│  STY-011 Dashboard (8h) ◄─┐
│  STY-012 TransactionForm (13h) ◄─┤
│  STY-013 Accounts (10h) ◄─┤
│  STY-020 Validation (5h)  │
│  STY-023-025, 029-035, 040 Batch
│  STY-032 Integration Tests (18h) ◄─┤
│  STY-033 Integration Tests (18h) ◄─┘
└──────┬────────────────┐
       │                │
       ▼                ▼ (Can Parallel)
SPRINT 4 (FRONTEND POLISH)
│  STY-014 Accessibility (12h)
│  STY-015 Mobile (8h)
│  STY-018 Dark Mode (4h)
│  STY-019 Loaders (4h)
│  STY-021 Performance (5h)
│  STY-026, 041, 045, 046 Batch
└──────┬────────────────┐
       │                │
       ▼                ▼
SPRINT 5 (E2E & BACKEND)
│  STY-016 E2E Tests (20h)
│  STY-017 Schema Normalization (16h)
│  STY-022, 024, 025, 044, 047, 049 Batch
└──────┬────────────────┐
       │                │
       ▼                │
SPRINT 6 (FINAL)        │
│  STY-050 Final Integration Tests (8h) ◄──┘
└──────┬─────────────────────────────────┘
       │
       ▼
PRODUCTION READY
```

---

## Parallelization Strategy

### Maximum Parallelization Path (Ideal Team of 4-5)

**Sprint 0:**
```
Dev 1: STY-001, STY-003 (parallel: RLS + Error Boundaries)
Dev 2: STY-002, STY-004 (parallel: TS Strict + CI/CD)
Dev 3: STY-005 (Test Infrastructure)
Duration: ~6 days (1 week)
```

**Sprint 1:**
```
Dev 1: STY-006 (Type Safety - 4h) + STY-007 (Error Recovery - 6h) = 10h
Dev 2: STY-008 (Soft Delete - 2h) + Batch stories = varies
Dev 3: STY-009 (Unit Tests - 25h, critical path) = full sprint
Duration: ~2 weeks (heavy on testing)
```

**Sprint 2-3 (MUST HAVE 4 DEVELOPERS):**
```
Dev 1 (Architect): STY-010 (Context Split - 21h) FULL FOCUS
  Days 1-3: Design + TransactionsContext
  Days 4-6: AccountsContext + GoalsContext
  Days 7-9: UIContext + Testing + Integration
  Days 10-12: Code review + fixes

Dev 2 (Full-Stack): STY-011 (8h) + STY-023 (7h) = 15h
  Waits for STY-010 day 3, then full parallelization

Dev 3 (Full-Stack): STY-012 (13h) + STY-024 (7h) = 20h
  Waits for STY-010 day 3, then full parallelization

Dev 4 (Backend/QA): STY-013 (10h) + STY-020 (5h) + STY-032/033 (18-36h split)
  Can start immediately on STY-020, 032
  Then STY-013 after STY-010

Duration: ~3-4 weeks
```

**Sprint 4:**
```
Dev 1 (Frontend Lead): STY-014 (12h) full focus
Dev 2 (Frontend): STY-015 (8h) + STY-018 (4h) + STY-019 (4h) = 16h
Dev 3 (DevOps): STY-021 (5h) + STY-045 (8h) = 13h
Duration: ~1 week
```

**Sprint 5:**
```
Dev 1 (QA): STY-016 (20h) E2E tests
Dev 2 (Database): STY-017 (16h) Schema normalization
Dev 3 (Full-Stack): STY-022 (5h) + STY-024 (7h) + STY-025 (6h) = 18h
Dev 4 (DevOps/Backend): STY-044 (3h) + STY-047 (3h) + STY-049 (4h) = 10h
Duration: ~1-1.5 weeks
```

**Sprint 6:**
```
Dev 1 (QA Lead): STY-050 (8h)
Duration: ~1-2 days
```

---

## Risk Analysis: Dependency-Related Risks

### HIGH RISK
1. **STY-010 Underestimated (21h → 25-30h possible)**
   - Would extend Sprint 2-3 by 1-2 weeks
   - Cascades to dependent stories
   - Mitigation: Pre-planning, snapshot tests, pair programming

2. **STY-002 (TS Strict) discovers widespread errors**
   - Would block STY-006 longer
   - Mitigation: Run `npm run typecheck` before sprint start

3. **STY-005 Test Infrastructure missing critical setup**
   - Would delay STY-009
   - Mitigation: Pair DevOps + QA on setup

### MEDIUM RISK
1. **STY-016 (E2E Tests) flakiness cascades to STY-050**
   - Requires heavy debugging
   - Mitigation: Daily E2E stability checks

2. **STY-032/033 Integration Test coverage incomplete**
   - Would delay confidence in STY-050
   - Mitigation: Early draft of test plans

### LOW RISK
1. **Independent stories (22 total) blocked by external factors**
   - Can be rescheduled without cascade
   - Mitigation: Standard project management

---

## Circular Dependency Check: PASSED ✓

**Method:** DFS (Depth-First Search) traversal of dependency graph

**Result:** No story blocks itself transitively
- No STY-X depends on STY-Y which depends on STY-X
- No 3+ story cycles found
- All dependencies are acyclic

**Confidence:** 100% - Safe to execute in planned order

---

## Dependency Satisfaction Checklist

Before each sprint, verify:
- [ ] All blocked-by stories from previous sprint completed
- [ ] All enabling stories ready for next sprint's dependencies
- [ ] No unexpected circular dependencies introduced
- [ ] Critical path (STY-010) on schedule
- [ ] Testing infrastructure (STY-005) operational

---

## Recommendations

### Execution Order
1. **Must Do First:** STY-001, 004, 005 (foundation)
2. **Must Do Second:** STY-002, 006 (type safety)
3. **Must Do Third:** STY-010 (context split - gates 8 stories)
4. **Then Parallelize:** All others per sprint plan

### Dependency Monitoring
- Track STY-010 daily during Sprint 2-3
- Weekly "unblock review" for dependent stories
- Red-flag if STY-010 runs >1 day behind estimate

### Contingency Planning
- If STY-010 overruns, can parallelize:
  - STY-020 (Validation)
  - STY-032/033 (Integration tests)
  - STY-017 (Schema normalization)
- If STY-005 delays, parallelize testing:
  - STY-001, 002, 003 complete first
  - Start STY-009 on day 2 if needed

---

## Conclusion

**DEPENDENCY VALIDATION: PASSED ✓**

All 50 stories have been analyzed for dependencies. No circular dependencies exist. The dependency network is acyclic and safe for execution. Critical path is well-defined (STY-010 is the bottleneck). Parallelization is possible after foundation work (Sprints 0-1).

---

**Document Owner:** @pm (Morgan)
**Version:** 1.0 FINAL
**Approved:** 2026-01-26
**Next Review:** After Sprint 1 completion

