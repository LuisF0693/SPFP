# Story 010: Split FinanceContext into 5 Sub-Contexts (CRITICAL PATH)

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 2-3
**Story ID:** STY-010
**Status:** READY FOR DEVELOPMENT
**Effort:** 21 hours
**Priority:** P0 CRITICAL
**Type:** Refactor / Architecture

## User Story

**As a** architect
**I want** to split the monolithic FinanceContext into 5 domain-specific contexts
**So that** components re-render only when relevant data changes (performance + maintainability)

## Description

Current FinanceContext (613 LOC, 96 exports) manages 9 domains causing global re-renders. This story splits into:
1. **AuthContext** (keep existing)
2. **TransactionsContext** (transactions, grouping, recurrence)
3. **AccountsContext** (accounts, balances, categories)
4. **GoalsContext** (goals, investments, patrimony)
5. **UIContext** (dashboard layout, theme, modals)

Each sub-context exports <30 items.

**Reference:** Technical Debt ID: SYS-006

## Acceptance Criteria

- [ ] 5 sub-contexts created and functional
- [ ] Each sub-context exports < 30 items
- [ ] All components refactored to use appropriate sub-contexts
- [ ] Snapshot tests locked (state structure documented)
- [ ] No re-render regression (React Profiler validates)
- [ ] All tests passing
- [ ] Code review: 2+ approvals (architecture sign-off required)
- [ ] Staging deployment verified

## Definition of Done

- [ ] New context files created:
  - `src/context/TransactionsContext.tsx`
  - `src/context/AccountsContext.tsx`
  - `src/context/GoalsContext.tsx`
  - `src/context/UIContext.tsx`
- [ ] Old `FinanceContext.tsx` kept but simplified (proxies to sub-contexts for backward compatibility)
- [ ] All components updated to import specific contexts
- [ ] Snapshot tests created for each context
- [ ] PR merged to main
- [ ] Documented in architecture guide

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Design context architecture (spec) | 2 | Architect |
| Extract TransactionsContext | 5 | Full-Stack |
| Extract AccountsContext | 4 | Full-Stack |
| Extract GoalsContext | 4 | Full-Stack |
| Extract UIContext | 3 | Full-Stack |
| Write context snapshot tests | 3 | QA |
| **Total** | **21** | - |

## Blockers & Dependencies

- **Blocked By:** Story 006 (type safety required for clean refactor)
- **Blocks:** Stories 013-017 (component decomposition depends on this)
- **External Dependencies:** None
- **Critical Path:** Yes - longest single task in epic

## Testing Strategy

- **Snapshot Test:** Each context state structure locked
- **Behavior Test:** Context mutations work correctly
- **Integration Test:** Component + context interaction works
- **Performance Test:** React Profiler shows reduced re-renders
- **Regression Test:** No functionality broken

## Files to Modify

- [ ] `src/context/TransactionsContext.tsx` (new)
- [ ] `src/context/AccountsContext.tsx` (new)
- [ ] `src/context/GoalsContext.tsx` (new)
- [ ] `src/context/UIContext.tsx` (new)
- [ ] `src/context/FinanceContext.tsx` (refactor to wrapper)
- [ ] `src/context/index.ts` (export all contexts)
- [ ] `src/test/context/` (new snapshot tests)
- [ ] All component imports (update context usage)

## Notes & Recommendations

**Context Design Pattern:**
```typescript
// TransactionsContext.tsx
interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  // ... 19 more items
}

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error('useTransactions must be in provider');
  return context;
};
```

**Migration Strategy:**
1. Create new contexts alongside old FinanceContext
2. Update components one by one
3. Keep old FinanceContext as wrapper (backward compat) until all components migrated
4. Final cleanup: remove old context

**High Risk Areas:**
- State restoration (ensure all fields migrated)
- localStorage sync (key names may change)
- Performance regression (test with React Profiler)

**Risk Mitigation:**
- Snapshot tests for state structure
- Feature flag for gradual rollout
- Rollback procedure: git revert (immediate)

---

**Created:** 2026-01-26
**Owner Assignment:** @architect / @dev (Full-Stack)
**Status:** READY FOR IMPLEMENTATION
**Status Note:** CRITICAL PATH - This blocks component decomposition in Sprint 3
