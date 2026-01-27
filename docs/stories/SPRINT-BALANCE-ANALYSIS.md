# SPRINT BALANCE ANALYSIS - Effort Distribution & Velocity

**Document:** PM Analysis Report
**Date:** 2026-01-26
**Team Size:** 2-3 developers per sprint

---

## Overview: Effort by Sprint

### Summary Table
| Sprint | Stories | Hours | Velocity Category | Days (1 dev) | Days (2 dev) | Days (3 dev) | Load Assessment |
|---|---|---|---|---|---|---|---|
| **0** | 5 | 22 | Light | 4.4 | 2.2 | 1.5 | ✓ IDEAL |
| **1** | 12 | 46-50 | Moderate | 9.2-10 | 4.6-5 | 3.1-3.3 | ✓ IDEAL |
| **2-3** | 18 | 76-79 | Heavy | 15.2-15.8 | 7.6-7.9 | 5.1-5.3 | ⚠️ PEAK (Critical) |
| **4** | 9 | 48-52 | Moderate | 9.6-10.4 | 4.8-5.2 | 3.2-3.5 | ✓ IDEAL |
| **5** | 6 | 38-41 | Moderate | 7.6-8.2 | 3.8-4.1 | 2.5-2.7 | ✓ IDEAL |
| **6** | 2 | 8-12 | Light | 1.6-2.4 | 0.8-1.2 | 0.5-0.8 | ✓ IDEAL |
| **TOTAL** | **50** | **335** | - | 67 | 33.5 | 22.3 | - |

**Assumptions:**
- Work day = 8 productive hours (excludes standup, comms)
- 1 week = 5 days (excludes planned time off)
- No major interruptions/support tickets

---

## Sprint 0: Bootstrap & Security (22 hours)

### Stories
| ID | Title | Hours | Effort | Owner |
|---|---|---|---|---|
| STY-001 | Implement RLS Policies | 4 | High | Backend |
| STY-002 | Enable TypeScript Strict Mode | 2 | Low | DevOps |
| STY-003 | Implement Error Boundaries | 4 | Medium | Frontend |
| STY-004 | Setup GitHub Actions CI/CD | 6 | High | DevOps |
| STY-005 | Bootstrap Test Infrastructure | 6 | High | QA |

### Analysis
**Duration:** 1 week (ideal)
**Team Composition:** 1 Senior Backend + 1 Senior DevOps + 1 Senior QA (3 developers)
**Load Per Developer:** 7.3h average
**Parallelization:** 100% - All stories are independent

### Critical Path
```
START → STY-004 (6h) → STY-005 (6h) → Ready for Sprint 1 testing
         (1.5 days)   (1.5 days)

STY-001 (4h) - parallel with above (1 day)
STY-002 (2h) - parallel with above (0.5 day)
STY-003 (4h) - parallel with above (1 day)

Total: ~2 days critical path, 5 days with parallelization
```

### Risks
- **LOW RISK:** All stories are independent foundation work
- No dependencies between stories
- DevOps tasks (STY-004) could block later work if not done early

### Velocity Forecast
- **Expected:** 22h completed ✓
- **Optimistic:** 22h completed (low effort variance)
- **Pessimistic:** 25h if CI/CD config complexity increases

---

## Sprint 1: Type Safety & Security (46-50 hours)

### Stories (Ready)
| ID | Title | Hours | Owner |
|---|---|---|---|
| STY-006 | Remove `as any` Type Casts | 4 | Full-Stack |
| STY-007 | Implement Error Recovery Patterns | 6 | Full-Stack |
| STY-008 | Implement Soft Delete Strategy | 2 | Database |
| STY-009 | Write 50+ Unit Tests | 25 | QA |

### Stories (Batch - In Summary)
| ID | Title | Hours | Owner |
|---|---|---|---|
| STY-027 | Add Audit Trail for Admin Impersonation | 6 | Backend |
| STY-028 | Implement Error Recovery Service | 2 | Backend |
| STY-030 | Create AI History Schema Extension | 3 | Backend |
| STY-036 | Create User Profiles Table | 3 | Backend |
| STY-037 | Create User Settings Table | 3 | Backend |
| STY-038 | Add Transaction Group Validation | 2 | Backend |
| STY-042 | Add AI Service Response Validation | 2 | Backend |
| STY-048 | Implement localStorage Debouncing | 3 | Full-Stack |

**Total Ready:** 37h
**Total Including Batch:** 37h + 24h = 61h (if all batch stories included)
**Realistic Mix:** 46-50h (core ready stories + 1-2 batch stories)

### Team Composition
**Option A: 2 developers (ideal with reduced scope)**
- Senior Full-Stack + Senior QA
- Focus on ready stories (STY-006-009 = 37h)
- Duration: 2.5-2.75 weeks

**Option B: 3 developers (with batch expansion)**
- Senior Full-Stack + Senior Backend + Senior QA
- Core work (STY-006-009) + Batch expansion (STY-027-048)
- Duration: 2.5-3 weeks

### Load Analysis

**Option A (37h core):**
```
Dev 1 (Full-Stack): STY-006 (4h) + STY-007 (6h) + STY-008 (2h) = 12h (1.5 days)
Dev 2 (QA):         STY-009 (25h) = 25h (3.1 days)
Total: 18.5 hours per dev (~2.3 days each)
```

**Option B (61h with batch):**
```
Dev 1 (Full-Stack): STY-006 (4h) + STY-007 (6h) + STY-048 (3h) = 13h (1.6 days)
Dev 2 (Backend):    STY-027 (6h) + STY-028 (2h) + STY-030 (3h) + STY-036 (3h) + STY-037 (3h) + STY-038 (2h) + STY-042 (2h) = 21h (2.6 days)
Dev 3 (QA):         STY-008 (2h) + STY-009 (25h) = 27h (3.4 days)
Total: 20-27 hours per dev (~3 days each)
```

### Critical Dependencies
- **STY-005** (Test Infra) must be complete before STY-009
- **STY-002** (TS Strict) blocks STY-006 (but can parallel-ish)
- **STY-027-037 decisions** needed before Sprint planning

### Recommendation
**Execute Option A:** Focus on core ready stories (37h)
- Keep sprint focused and manageable
- Expand batch stories in Sprint 2 if team velocity allows
- Reduces risk of overload with undetailed work

---

## Sprint 2-3: Architecture Refactoring (76-79 hours) - CRITICAL PATH

### Stories (Ready)
| ID | Title | Hours | Sprint | Owner |
|---|---|---|---|---|
| STY-010 | **Split FinanceContext into 5 Sub-Contexts** | **21** | **2-3** | Architect |
| STY-011 | Decompose Dashboard Component | 8 | 3 | Full-Stack |
| STY-012 | Decompose TransactionForm | 13 | 3 | Full-Stack |
| STY-013 | Decompose Accounts Component | 10 | 3 | Full-Stack |
| STY-020 | Implement Transaction Validation Layer | 5 | 3 | Backend |
| STY-033 | Write Integration Tests (30+) | 18 | 3 | QA |

**Ready Total:** 75h

### Stories (Batch - In Summary)
| ID | Title | Hours | Owner |
|---|---|---|---|
| STY-023 | Extract Transaction List Optimization | 7 | Full-Stack |
| STY-024 | Create Modal Abstraction Component | 7 | Frontend |
| STY-025 | Setup Lazy Loading Infrastructure | 6 | Full-Stack |
| STY-029 | Add Database Connection Pooling | 3 | DevOps |
| STY-031 | Implement Real-Time Subscriptions | 8 | Backend |
| STY-032 | Write Integration Tests (30+) | 18 | QA |
| STY-034 | Extract Insights Component Logic | 9 | Frontend |
| STY-035 | Implement Supabase Sync Error Recovery | 6 | Backend |
| STY-040 | Implement PDF Export Memory Optimization | 3 | Full-Stack |

**Batch Total:** 67h

### Analysis: CRITICAL PATH PEAK

This is the **longest and most complex sprint** in the roadmap.

### The STY-010 Bottleneck (21h)

**Why it's critical:**
- FinanceContext is the core state management
- 613 LOC, 96 exports causing global re-renders
- Must be done before component decomposition
- Blocks STY-011, STY-012, STY-013, STY-033

**Timeline:**
```
Sprint Start (Day 1)
  ↓
STY-010 begins (1 Architect + 1-2 Full-Stack devs)
  ├─ Design context architecture (Day 1-2) = 2h
  ├─ Extract TransactionsContext (Day 2-4) = 5h
  ├─ Extract AccountsContext (Day 5-7) = 4h
  ├─ Extract GoalsContext (Day 7-9) = 4h
  ├─ Extract UIContext (Day 9-10) = 3h
  ├─ Snapshot tests + refactor (Day 10-11) = 3h
  └─ Code review + fixes (Day 11-12) = 1h
  ↓
STY-010 complete (Day 12 of sprint)
  ↓
STY-011, STY-012, STY-013 can begin (Day 12+)
```

### Team Structure for Sprint 2-3 (Must have 3-4 people)

**Option A: 3 Senior Developers**
```
Lead Architect:  STY-010 (21h) - FULL FOCUS
Full-Stack Dev 1: STY-011 (8h) + STY-012 (13h) = 21h (waits for STY-010)
Full-Stack Dev 2: STY-020 (5h) + STY-033 (18h) = 23h (runs parallel)

Total: 65h / 3 devs = 21.7h per dev (~2.7 days)
Critical Path: 21h (STY-010) + 21h (STY-011+12) = 42h serial = 5.25 days
```

**Option B: 4 Senior Developers (Recommended)**
```
Architect:       STY-010 (21h) - FULL FOCUS
Full-Stack Dev 1: STY-011 (8h) + STY-023 (7h) + STY-025 (6h) = 21h
Full-Stack Dev 2: STY-012 (13h) + STY-024 (7h) = 20h
Backend/QA:      STY-013 (10h) + STY-020 (5h) + STY-033 (18h) = 33h (2 people)

Total: 95h / 4 devs = 23.75h per dev (~3 days)
Better load distribution, enables batch story integration
```

### Parallelization Strategy

```
Sprint 2-3 (2 weeks = 10 days)

Timeline:
├─ Days 1-3:   STY-010 design phase + STY-020, STY-033 begin (other devs start)
├─ Days 3-6:   STY-010 extraction phase (3-4 devs busy) + STY-033 tests written
├─ Days 6-9:   STY-010 testing phase + STY-011/012/013 full parallelization
├─ Days 9-10:  STY-033 completion, batch stories finalized
└─ Days 10+:   Code review, integration fixes, final testing
```

### Load Assessment: ⚠️ PEAK

**Effort:** 76-79h (vs 22-50h in other sprints)
**Team Size Requirement:** 3-4 developers (mandatory)
**Duration:** 2 weeks minimum
**Risk Level:** HIGH (critical path, complexity)

**If understaffed (2 devs):**
- Sprint will take 4-5 weeks
- STY-010 still blocks other work
- Not recommended

### Velocity Forecast
- **With 3 devs:** 22-23 days (4-5 weeks including testing)
- **With 4 devs:** 16-18 days (3.2-3.6 weeks ideal)
- **Best case:** 14 days (if STY-010 goes perfectly)
- **Worst case:** 21 days (if STY-010 needs major rework)

---

## Sprint 4: Frontend Polish & UX (48-52 hours)

### Stories (Ready)
| ID | Title | Hours | Owner |
|---|---|---|---|
| STY-014 | Implement WCAG 2.1 Accessibility | 12 | Frontend |
| STY-015 | Implement Mobile Responsiveness | 8 | Frontend |
| STY-018 | Implement Dark Mode Persistence | 4 | Frontend |
| STY-019 | Implement Skeleton Loaders | 4 | Frontend |
| STY-021 | Optimize Performance to Lighthouse ≥90 | 5 | Full-Stack |

**Ready Total:** 33h

### Stories (Batch)
| ID | Title | Hours | Owner |
|---|---|---|---|
| STY-026 | Implement Form Validation UX Improvements | 3 | Frontend |
| STY-041 | Setup Performance Monitoring (Sentry) | 4 | DevOps |
| STY-045 | Create i18n Infrastructure | 8 | Full-Stack |
| STY-046 | Implement Auto-Save for Forms | 4 | Frontend |

**Batch Total:** 19h
**Overall:** 33-52h depending on batch inclusion

### Team Composition
**Recommended: 2-3 Frontend Developers**

```
Dev 1 (Frontend Lead): STY-014 (12h) + STY-015 (8h) = 20h (2.5 days)
Dev 2 (Frontend):      STY-018 (4h) + STY-019 (4h) + STY-026 (3h) = 11h (1.4 days)
Dev 3 (Full-Stack):    STY-021 (5h) + STY-045 (8h) + STY-046 (4h) = 17h (2.1 days)

OR

Dev 1 (Frontend):      STY-014 (12h) + STY-018 (4h) = 16h (2 days)
Dev 2 (Frontend):      STY-015 (8h) + STY-019 (4h) + STY-026 (3h) = 15h (1.9 days)
Dev 3 (DevOps):        STY-041 (4h) + STY-045 (8h) + STY-021 (5h) = 17h (2.1 days)
```

### Load Assessment: ✓ IDEAL

**Effort:** 33-52h
**Team Size:** 2-3 developers
**Duration:** 1 week (ready stories), 1.5 weeks (with batch)
**Parallelization:** 100% - All stories independent
**Risk:** LOW - Mature team, well-understood scope

---

## Sprint 5: Backend & E2E Testing (38-41 hours)

### Stories (Ready)
| ID | Title | Hours | Owner |
|---|---|---|---|
| STY-016 | Write E2E Tests for 6 Critical Journeys | 20 | QA |
| STY-017 | Design & Implement Schema Normalization | 16 | Database |

**Ready Total:** 36h

### Stories (Batch)
| ID | Title | Hours | Owner |
|---|---|---|---|
| STY-022 | Implement Design Tokens System | 5 | Frontend |
| STY-024 | Create Modal Abstraction Component | 7 | Frontend |
| STY-025 | Setup Lazy Loading Infrastructure | 6 | Full-Stack |
| STY-044 | Setup Lazy Loading for Routes | 3 | Frontend |
| STY-047 | Add Batch Operations for Performance | 3 | Backend |
| STY-049 | Setup Security Headers + CSP | 4 | DevOps |

**Batch Total:** 28h
**Overall:** 36-64h depending on batch inclusion

### Team Composition
**Recommended: 3-4 Developers**

```
QA Lead:         STY-016 (20h) - Full focus on E2E tests
Database Dev:    STY-017 (16h) - Full focus on schema
Full-Stack Dev 1: STY-022 (5h) + STY-024 (7h) + STY-025 (6h) = 18h
DevOps/Backend:  STY-044 (3h) + STY-047 (3h) + STY-049 (4h) = 10h

Total: 64h / 4 devs = 16h per dev (~2 days)
```

### Load Assessment: ✓ IDEAL

**Effort:** 36-64h
**Team Size:** 3-4 developers
**Duration:** 1-1.5 weeks
**Parallelization:** ~80% (STY-016 and STY-017 can run in parallel with others)
**Risk:** MEDIUM - E2E testing can be flaky, needs debugging

---

## Sprint 6: Final Push & Production Ready (8-12 hours)

### Stories (Ready)
| ID | Title | Hours | Owner |
|---|---|---|---|
| STY-050 | Create Final Integration & Smoke Tests | 8 | QA |

**Ready Total:** 8h

### Stories (Batch)
None - this is the final sprint

### Team Composition
**Recommended: 1-2 Developers**

```
QA Lead: STY-050 (8h) - Final validation
Support: Code review, deployment prep

OR just QA lead solo (1 day)
```

### Load Assessment: ✓ LIGHT

**Effort:** 8h
**Team Size:** 1-2 developers
**Duration:** 1 day
**Parallelization:** N/A - Single story
**Risk:** LOW - Final validation, rollback ready

---

## Overall Effort Summary

### By Effort Level
| Level | Sprints | Hours | Days (3 dev avg) |
|---|---|---|---|
| **Light** | 0, 6 | 30 | 3-4 days |
| **Moderate** | 1, 4, 5 | 135 | 13-15 days |
| **Heavy** | 2-3 | 76-79 | 8-10 days |
| **TOTAL** | - | 335 | 24-29 days (3 devs) |

### Timeline Scenarios

**Scenario A: 3 Full-Time Developers (Recommended)**
- Sprint 0: 1 week
- Sprint 1: 2 weeks
- Sprint 2-3: 3-4 weeks (critical path peak)
- Sprint 4: 1 week
- Sprint 5: 1-1.5 weeks
- Sprint 6: 1 day
- **Total:** 8-9.5 weeks (2 months)

**Scenario B: 2 Full-Time Developers**
- Sprint 0: 1 week
- Sprint 1: 2.5 weeks
- Sprint 2-3: 4-5 weeks (stretched due to STY-010)
- Sprint 4: 1.5 weeks
- Sprint 5: 2 weeks
- Sprint 6: 1 day
- **Total:** 12-14 weeks (3 months) - **NOT RECOMMENDED**

**Scenario C: 4 Full-Time Developers**
- Sprint 0: 1 week (can parallelize even more)
- Sprint 1: 1.5-2 weeks
- Sprint 2-3: 2.5-3 weeks (better parallelization)
- Sprint 4: 1 week
- Sprint 5: 1 week
- Sprint 6: 1 day
- **Total:** 7-8 weeks (1.5-2 months) - **OPTIMAL**

---

## Resource Allocation Recommendations

### Minimum Viable Team (For 8-9 week delivery)
- **1 Senior Architect** (full-time)
- **2 Senior Full-Stack Developers** (full-time)
- **1 Senior QA/Database** (full-time, split focus)
- **1 DevOps Engineer** (50% time, shared with other projects)

Total: 3.5 FTE

### Optimal Team (For 7-8 week delivery)
- **1 Senior Architect** (full-time on STY-010 weeks 3-4, then 50%)
- **2 Senior Full-Stack Developers** (full-time)
- **1 Senior Frontend Developer** (full-time weeks 5-6, then 50%)
- **1 Senior QA Engineer** (full-time)
- **1 Backend Database Specialist** (full-time weeks 3-4, then 50%)
- **1 DevOps Engineer** (75% time)

Total: 5.25 FTE

### Resource Constraints
- **Peak Load:** Sprint 2-3 requires 4+ developers (non-negotiable)
- **Critical Skill:** Architect expertise for STY-010 (cannot be junior)
- **QA Requirement:** Experienced QA for E2E tests (STY-016)
- **Database:** Schema normalization (STY-017) needs database expert

---

## Risk Mitigation Strategies

### Sprint 0 (Low Risk)
- No interventions needed
- Proceed as planned

### Sprint 1 (Medium Risk)
- **STY-009 Variance:** Daily standup on unit test progress
- **Watch:** Type cast removal (STY-006) - pair program if struggling
- **Mitigation:** Have backup refactoring tasks ready if unit tests run fast

### Sprint 2-3 (HIGH RISK) - CRITICAL PATH
**Risks:**
1. STY-010 complexity underestimated (21h)
2. localStorage migration issues surface
3. Import location updates miss coverage
4. Component refactoring cascades

**Mitigations:**
- Assign most experienced architect to STY-010
- Pair program first 3 days of context split
- Create automated "as any" detection script to find missed casts
- Test context updates thoroughly with snapshot tests
- Have rollback ready (git revert capability)
- Daily architect reviews of refactoring progress
- Consider feature flag for gradual rollout after merge

### Sprint 4 (Low-Medium Risk)
- **Watch:** Lighthouse optimization (STY-021) - can be bikeshedding prone
- **Mitigation:** Define specific metrics upfront (>90 score)
- **Risk:** Mobile responsiveness (STY-015) cross-browser issues
- **Mitigation:** Test on real devices, not just Chrome DevTools

### Sprint 5 (Medium Risk)
- **Watch:** E2E test flakiness (STY-016)
- **Mitigation:** Extensive local testing before CI run
- **Risk:** Schema normalization complexity (STY-017)
- **Mitigation:** Have database expert review schema before implementation

### Sprint 6 (Low Risk)
- Final smoke tests should catch any production issues
- Rollback procedure in place

---

## Velocity Tracking

### Sprint 0 Target: 22h
- Baseline setting
- Expect 100% velocity

### Sprint 1 Target: 37-46h
- Depends on batch story expansion
- Conservative: 37h (ready stories only)
- Target: 95% velocity

### Sprint 2-3 Target: 75-79h
- Highest complexity
- Target: 90% velocity (expect 4h buffer)

### Sprint 4 Target: 33-52h
- Moderate complexity
- Target: 100% velocity

### Sprint 5 Target: 36-64h
- Depends on batch completion
- Target: 95% velocity

### Sprint 6 Target: 8h
- Final validation
- Target: 100% velocity

---

## Conclusion

**SPRINT BALANCE: VALIDATED ✓**

The 335-hour effort is well-distributed across 6 sprints with manageable load per sprint except for the critical Sprint 2-3 peak. A team of 3-4 developers can complete the roadmap in 7-9 weeks.

### Key Takeaways
1. **Sprint 0:** Bootstrap phase - 1 week, any senior devs
2. **Sprint 1:** Type safety - 2 weeks, 2-3 devs
3. **Sprint 2-3:** CRITICAL PATH - 3-4 weeks, 4 devs required, architect must lead
4. **Sprint 4:** Frontend polish - 1 week, 2-3 frontend devs
5. **Sprint 5:** E2E + schema - 1-1.5 weeks, 3-4 devs
6. **Sprint 6:** Final push - 1 day, 1-2 devs

**Recommended Approach:**
- Start Sprint 0 immediately with 3 developers
- Plan batch story expansion during Sprint 1
- Assign dedicated architect to STY-010 starting Sprint 2
- Scale team to 4 developers for Sprint 2-3 peak
- Reduce to 2-3 developers for Sprints 4-5

---

**Document Owner:** @pm (Morgan)
**Version:** 1.0 FINAL
**Approved:** 2026-01-26

