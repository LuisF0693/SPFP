# Critical Path Analysis: SPFP 6-Week Refactor

## Executive Summary

The **FinanceContext refactor (21 hours)** is the critical path that constrains the entire project timeline. This monolithic context must be split into independent sub-contexts before component decomposition and service extraction can proceed efficiently.

**Timeline Impact:** 21 hours on critical path = ~3 days with 3 developers = 1 week of elapsed time

---

## Critical Path Definition

```
┌──────────────────────────────────────────────────────────────┐
│ CRITICAL PATH: FinanceContext Split (21h)                    │
│                                                               │
│ Sprint 2 - Days 1-3 (sequential blocking tasks)              │
│                                                               │
│ ├─ [7h] FinanceContext Part 1: Accounts & Goals              │
│ │       └─ Extract account CRUD operations                   │
│ │       └─ Extract goals management                          │
│ │       └─ Create AccountsContext provider                   │
│ │       └─ Create GoalsContext provider                      │
│ │       └─ Test state consistency                            │
│ │                                                             │
│ ├─ [7h] FinanceContext Part 2: Investments & Budget          │
│ │       └─ Extract investment operations                     │
│ │       └─ Extract budget management                         │
│ │       └─ Create InvestmentsContext                         │
│ │       └─ Create BudgetContext                              │
│ │       └─ Test cross-context dependencies                   │
│ │                                                             │
│ └─ [7h] FinanceContext Part 3: Patrimony & Reports           │
│         └─ Extract patrimony calculations                    │
│         └─ Extract reports generation                        │
│         └─ Create PatrimonyContext                           │
│         └─ Create ReportsContext                             │
│         └─ Test aggregate calculations                       │
│                                                               │
│ ⚠️  ALL TASKS ARE SEQUENTIAL (cannot parallelize)             │
│ ⚠️  Part 1 must complete before Part 2                        │
│ ⚠️  Part 2 must complete before Part 3                        │
│ ⚠️  Blocks: Service extraction, Component decomposition       │
└──────────────────────────────────────────────────────────────┘
```

---

## Dependency Chain

### Level 1: Foundation (Sprint 0)
```
                    ┌─────────────────────┐
                    │ Sprint 0 Foundation  │
                    ├─────────────────────┤
                    │ • RLS Setup         │
                    │ • TS Strict Mode    │
                    │ • Error Boundaries  │
                    │ • CI/CD Pipeline    │
                    │ • Test Framework    │
                    └────────────┬────────┘
                                 │
                                 ▼ (dependency met)
```

### Level 2: Decomposition (Sprint 1)
```
                    ┌────────────────────────────┐
                    │ Sprint 1: Decomposition    │
                    ├────────────────────────────┤
                    │ • Dashboard breakdown      │
                    │ • Account components       │
                    │ • Goals components         │
                    │ • Initial tests (40%)      │
                    └────────────┬───────────────┘
                                 │
                                 ▼ (prepares ground)
```

### Level 3: CRITICAL PATH - State Extraction (Sprint 2)
```
╔═════════════════════════════════════════════════════════════╗
║         SPRINT 2: FINANCE CONTEXT SPLIT (CRITICAL PATH)     ║
║                                                              ║
║  Task 1: FC Part 1 (Accounts & Goals) - 7h                 ║
║  ┌──────────────────────────────────────┐                  ║
║  │ • Separate account state (1h)        │                  ║
║  │ • Separate goals state (1h)          │                  ║
║  │ • Create AccountsContext (2h)        │                  ║
║  │ • Create GoalsContext (1.5h)         │                  ║
║  │ • Test & debug (1.5h)                │                  ║
║  └──────────────────────────────────────┘                  ║
║              ▼ MUST COMPLETE BEFORE                        ║
║                                                              ║
║  Task 2: FC Part 2 (Investments & Budget) - 7h             ║
║  ┌──────────────────────────────────────┐                  ║
║  │ • Separate investments state (1h)    │                  ║
║  │ • Separate budget state (1h)         │                  ║
║  │ • Create InvestmentsContext (2h)     │                  ║
║  │ • Create BudgetContext (1.5h)        │                  ║
║  │ • Test cross-dependencies (1.5h)     │                  ║
║  └──────────────────────────────────────┘                  ║
║              ▼ MUST COMPLETE BEFORE                        ║
║                                                              ║
║  Task 3: FC Part 3 (Patrimony & Reports) - 7h              ║
║  ┌──────────────────────────────────────┐                  ║
║  │ • Separate patrimony state (1h)      │                  ║
║  │ • Separate reports state (1h)        │                  ║
║  │ • Create PatrimonyContext (2h)       │                  ║
║  │ • Create ReportsContext (1.5h)       │                  ║
║  │ • Test aggregates (1.5h)             │                  ║
║  └──────────────────────────────────────┘                  ║
║                                                              ║
║  ⏱️  TOTAL DURATION: 3 days (21 hours)                      ║
║  ⚠️  CANNOT BE PARALLELIZED                                ║
║  🔴 BLOCKS ALL DOWNSTREAM WORK                             ║
╚═════════════════════════════════════════════════════════════╝
```

### Level 4: Blocked Tasks (Sprint 2-3)
```
                    ┌─────────────────────────┐
                    │ Cannot Start Until CP    │
                    │ Is Complete:            │
                    ├─────────────────────────┤
                    │ • Service extraction    │
                    │ • Component refactoring │
                    │ • Dashboard optimization│
                    │ • Transaction perf      │
                    └─────────────────────────┘
```

---

## Why It's Critical

### Current State (Monolithic)
```
FinanceContext (1200+ LOC)
│
├─ Account operations (150 LOC)
├─ Goals operations (120 LOC)
├─ Investment operations (180 LOC)
├─ Budget operations (130 LOC)
├─ Patrimony calculations (200 LOC)
├─ Reports generation (100 LOC)
├─ Common hooks (200 LOC)
├─ localStorage sync (300 LOC)
└─ Supabase sync (400 LOC)
```

### Problems with Monolithic Context

1. **State Bloat:** Any change to one domain (e.g., accounts) requires re-rendering all consumers
2. **Testing Nightmare:** Cannot test account operations in isolation
3. **Cognitive Load:** Developers must understand 1200+ LOC to make changes
4. **Performance:** All listeners subscribe to entire context; every state change triggers re-renders
5. **Refactoring Risk:** Cannot extract services until context is split

### Why Sequential (Cannot Parallelize)

1. **Shared State Dependencies:**
   - Goals may reference accounts (foreign key relationship)
   - Reports may aggregate investments + patrimony
   - Budget may reference categories from accounts

2. **TypeScript Constraints:**
   - Types must be updated together
   - Interface changes cascade
   - Cannot have duplicate type definitions

3. **Migration Complexity:**
   - localStorage keys must map correctly
   - Supabase state must sync consistently
   - Old components must work with new contexts

**Result:** Must split sequentially to maintain integrity

---

## Detailed Timeline

### Critical Path (21 hours)

```
SPRINT 2 - WEEK 3
┌────────────────────────────────────────────────────────────┐

DAY 1 (Mon) - FC Part 1: Accounts & Goals (7 hours)
│
├─ 08:00-09:00  Analysis & Planning (1h)
│  ├─ Review FinanceContext state shape
│  ├─ Identify account-related operations
│  ├─ Map dependencies
│  └─ Create extraction checklist
│
├─ 09:00-10:00  AccountsContext Extraction (1h)
│  ├─ Create src/context/AccountsContext.tsx
│  ├─ Extract account state: accounts[], activeAccount
│  ├─ Extract methods: addAccount, updateAccount, deleteAccount
│  ├─ Export useAccounts() hook
│  └─ Update FinanceContext import
│
├─ 10:00-11:00  GoalsContext Extraction (1h)
│  ├─ Create src/context/GoalsContext.tsx
│  ├─ Extract goals state: goals[]
│  ├─ Extract methods: addGoal, updateGoal, deleteGoal
│  ├─ Export useGoals() hook
│  └─ Handle goal-account references
│
├─ 11:00-13:00  Integration & Testing (2h)
│  ├─ Create AccountsContext + GoalsContext providers
│  ├─ Update App.tsx to wrap new contexts
│  ├─ Test with existing components
│  ├─ Fix state sync issues
│  └─ Verify localStorage still works
│
├─ 13:00-14:00  Lunch & Buffer (1h)
│
├─ 14:00-15:00  Component Updates (1h)
│  ├─ Update Accounts.tsx to use AccountsContext
│  ├─ Update Goals.tsx to use GoalsContext
│  ├─ Remove duplicate state management
│  └─ Verify components render correctly
│
├─ 15:00-16:30  Testing & Debugging (1.5h)
│  ├─ Write unit tests for contexts
│  ├─ Test edge cases: empty states, updates, deletes
│  ├─ Debug any rendering issues
│  └─ Verify cross-context data consistency
│
└─ 16:30-17:00  Daily Standup & Documentation (0.5h)
   └─ Document state of FinanceContext (1093 LOC remaining)

STATUS: ✓ Part 1 Complete
NEXT: Part 2 depends on Part 1 passing tests

┌────────────────────────────────────────────────────────────┐

DAY 2 (Tue) - FC Part 2: Investments & Budget (7 hours)
│
├─ 08:00-09:00  Review & Planning (1h)
│  ├─ Verify Part 1 stability overnight
│  ├─ Review investments & budget operations
│  ├─ Identify cross-dependencies with accounts
│  └─ Create extraction checklist
│
├─ 09:00-10:00  InvestmentsContext Extraction (1h)
│  ├─ Create src/context/InvestmentsContext.tsx
│  ├─ Extract investments state: investments[]
│  ├─ Extract methods: addInvestment, updateInvestment, deleteInvestment
│  ├─ Export useInvestments() hook
│  └─ Handle account references (foreign key)
│
├─ 10:00-11:00  BudgetContext Extraction (1h)
│  ├─ Create src/context/BudgetContext.tsx
│  ├─ Extract budget state: budgets[], categories[]
│  ├─ Extract methods: addBudget, updateBudget, deleteBudget
│  ├─ Export useBudget() hook
│  └─ Keep categories for now (shared by transactions)
│
├─ 11:00-13:00  Integration & Testing (2h)
│  ├─ Create InvestmentsContext + BudgetContext providers
│  ├─ Add providers to App.tsx nesting
│  ├─ Test with Investments.tsx & Budget.tsx
│  ├─ Test account → investment references
│  ├─ Test budget → category references
│  ├─ Verify localStorage sync
│  └─ Fix any cross-context issues
│
├─ 13:00-14:00  Lunch & Buffer (1h)
│
├─ 14:00-15:00  Component Updates (1h)
│  ├─ Update Investments.tsx to use InvestmentsContext
│  ├─ Update Budget.tsx to use BudgetContext
│  ├─ Remove duplicate state management
│  └─ Verify rendering
│
├─ 15:00-16:30  Testing & Debugging (1.5h)
│  ├─ Write unit tests for InvestmentsContext
│  ├─ Write unit tests for BudgetContext
│  ├─ Test cross-context interactions
│  ├─ Verify account → investment links
│  ├─ Debug any issues
│  └─ Run full component suite
│
└─ 16:30-17:00  Daily Standup & Documentation (0.5h)
   └─ Document state of FinanceContext (763 LOC remaining)

STATUS: ✓ Part 2 Complete
NEXT: Part 3 depends on Part 2 passing tests

┌────────────────────────────────────────────────────────────┐

DAY 3 (Wed) - FC Part 3: Patrimony & Reports (7 hours)
│
├─ 08:00-09:00  Review & Planning (1h)
│  ├─ Verify Part 2 stability
│  ├─ Review patrimony & reports operations
│  ├─ Identify dependencies on previous contexts
│  └─ Create extraction checklist
│
├─ 09:00-10:00  PatrimonyContext Extraction (1h)
│  ├─ Create src/context/PatrimonyContext.tsx
│  ├─ Extract patrimony state: patrimonyRecords[]
│  ├─ Extract methods: addPatrimony, updatePatrimony, deletePatrimony
│  ├─ Export usePatrimony() hook
│  └─ Handle account + investment references
│
├─ 10:00-11:00  ReportsContext Extraction (1h)
│  ├─ Create src/context/ReportsContext.tsx
│  ├─ Extract reports state: reports[]
│  ├─ Extract methods: generateReport, deleteReport
│  ├─ Export useReports() hook
│  └─ Implement cross-context aggregation (accounts+investments+patrimony)
│
├─ 11:00-13:00  Integration & Testing (2h)
│  ├─ Create PatrimonyContext + ReportsContext providers
│  ├─ Add to App.tsx with proper nesting order
│  ├─ Test with Patrimony.tsx & Reports.tsx
│  ├─ Test aggregation across contexts
│  ├─ Verify localStorage for all contexts
│  ├─ Test Supabase sync still working
│  └─ Fix any integration issues
│
├─ 13:00-14:00  Lunch & Buffer (1h)
│
├─ 14:00-15:00  Full Integration Test (1h)
│  ├─ Update Patrimony.tsx to use PatrimonyContext
│  ├─ Update Reports.tsx to use ReportsContext
│  ├─ Remove all FinanceContext dependencies (except common hooks)
│  └─ Verify all components rendering correctly
│
├─ 15:00-16:30  Testing & Debugging (1.5h)
│  ├─ Write unit tests for PatrimonyContext
│  ├─ Write unit tests for ReportsContext
│  ├─ Test aggregation accuracy
│  ├─ Test localStorage consistency across all contexts
│  ├─ Verify Supabase sync
│  ├─ Run full test suite (target: 60% coverage)
│  └─ Document remaining FinanceContext
│
└─ 16:30-17:00  Critical Path Completion (0.5h)
   └─ ✅ CRITICAL PATH COMPLETE
      - FinanceContext split successfully
      - All sub-contexts working
      - Tests passing
      - Ready for service extraction

END SPRINT 2, DAY 3: CRITICAL PATH COMPLETE
```

---

## Parallel Work Streams

While Sprint 2 is executing the critical path, parallel teams can work on:

### Stream A: Component Decomposition (Sprint 1-2)
**Owner:** Full-stack Dev (side-by-side with CP)

```
Timeline:
Sprint 1 (Week 2)
├─ Dashboard decomposition started
├─ Create TransactionForm components
├─ Create TransactionList components
└─ Create Accounts components

Sprint 2 (Week 3) - Continues during CP
├─ Continue component work (while CP happens)
├─ Refactor components to use new contexts
├─ Update imports as contexts become available
└─ Test integration with new context structure
```

### Stream B: Database Normalization (Sprint 2-3)
**Owner:** Architect (planning in Sprint 1, executing Sprint 2-3)

```
Timeline:
Sprint 1 (Week 2)
├─ Schema audit
├─ Identify normalization opportunities
├─ Plan migrations
└─ Design new table structure

Sprint 2 (Week 3) - In parallel with CP
├─ Create Supabase migrations
├─ Test on staging database
├─ Document changes
└─ Prepare rollback plan

Sprint 3 (Week 4)
├─ Deploy migrations to production
├─ Monitor data consistency
├─ Optimize indices
└─ Performance baseline
```

### Stream C: UX & Performance Planning (Sprint 2-3)
**Owner:** QA Specialist (research & planning)

```
Timeline:
Sprint 2 (Week 3)
├─ Profile current performance
├─ Identify bottlenecks
├─ Research optimization techniques
├─ Create performance test suite
└─ Document baseline metrics

Sprint 3 (Week 4)
├─ Implement optimizations
├─ Transaction list pagination
├─ Dashboard memoization
├─ Recharts tuning
└─ Measure improvements
```

---

## Risk Mitigation Strategy

### Risk: Context Split Introduces Bugs

**Probability:** Medium
**Impact:** High (delays downstream work)
**Mitigation:**
1. Comprehensive state shape testing
2. localStorage/Supabase sync verification
3. Component integration tests
4. Staged rollout (one context at a time)

### Risk: Cross-Context Dependencies Complex

**Probability:** Medium
**Impact:** High (scope creep)
**Mitigation:**
1. Map dependencies before starting
2. Create integration helpers (e.g., useAccountAndGoals)
3. Document dependency chain
4. Test cross-context interactions

### Risk: Performance Regression

**Probability:** Low
**Impact:** Medium (needs optimization)
**Mitigation:**
1. Measure baseline metrics now
2. Profile after each context split
3. Implement useMemo where needed
4. Test with larger datasets

### Risk: Team Context Loss

**Probability:** Low
**Impact:** Medium (slower debugging)
**Mitigation:**
1. Daily documentation updates
2. Architecture decision records
3. Code comments for complex logic
4. Pair programming on tricky parts

---

## Success Criteria for Critical Path

| Criterion | Definition | Owner | Check |
|-----------|-----------|-------|-------|
| **Part 1 Passing** | Accounts & Goals contexts work independently | Full-stack Dev | Run tests |
| **Part 2 Passing** | Investments & Budget contexts integrate correctly | Full-stack Dev | Run tests |
| **Part 3 Passing** | Patrimony & Reports aggregate correctly | Full-stack Dev | Run tests |
| **No Regressions** | All existing features still work | QA Specialist | Component tests |
| **State Consistency** | localStorage & Supabase in sync | QA Specialist | Verification tests |
| **Test Coverage** | 60% coverage achieved | QA Specialist | Coverage report |
| **Documentation** | Architecture decisions recorded | Architect | ADR files |

---

## Post-Critical Path Blockers Unblock

Once Critical Path completes (EOD Day 3, Sprint 2):

```
├─ ✅ Service Extraction can begin
│  ├─ Transaction service (Sprint 2 Day 4+)
│  ├─ Report generation service
│  ├─ Calculation service
│  └─ Supabase service abstraction
│
├─ ✅ Component Refactoring can proceed
│  ├─ Update imports to new contexts
│  ├─ Remove FinanceContext dependencies
│  ├─ Optimize rendering
│  └─ Test updated components
│
├─ ✅ Dashboard Optimization can begin
│  ├─ Implement memoization
│  ├─ Widget-level state management
│  ├─ Lazy loading
│  └─ Performance profiling
│
└─ ✅ Downstream Sprints can finalize plans
   ├─ Sprint 3 execution can begin immediately
   ├─ Sprint 4 test plan finalized
   ├─ Sprint 5 launch preparation
   └─ Go-live coordination
```

---

## Monitoring & Adjustments

### Daily Checkpoints
- **09:00:** Daily standup on critical path progress
- **12:00:** Mid-point check, buffer burn rate
- **16:30:** End-of-day review, next day prep
- **17:00:** Document state, commit changes

### Escalation Triggers
- **If > 30 min behind schedule:** Add context-domain specialist
- **If test failures appear:** Debug immediately, pair if needed
- **If scope creep evident:** Defer to Sprint 3, document in backlog
- **If unexpected dependencies found:** Replan sequencing, extend timeline

### Buffer Burndown
- **3-day schedule** with **4-day window** = 1 day buffer
- If critical path takes 4 days → still finish by EOW
- If exceeds 4 days → triggers extended timeline & replanning

---

## Conclusion

The FinanceContext split is the critical constraining factor for this project. At 21 hours of sequential work, it cannot be parallelized. However, strategic planning and simultaneous work streams elsewhere (components, DB, UX) ensure the project moves forward on all fronts.

**Key Takeaway:** The team should enter Sprint 2 with a clear definition of the 3 context splits, full-day focus on the critical path, and supporting teams ready to integrate changes as each part completes.

---

**Last Updated:** January 2026
**Critical Path Owner:** Full-stack Developer + Architect
**Support:** QA Specialist for testing, DevOps for environment issues
