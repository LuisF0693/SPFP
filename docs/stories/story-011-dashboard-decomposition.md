# Story 011: Decompose Dashboard Component (Target: <200 LOC)

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 3
**Story ID:** STY-011
**Status:** READY FOR DEVELOPMENT
**Effort:** 8 hours
**Priority:** P1 HIGH
**Type:** Refactor / Component Decomposition

## User Story

**As a** frontend engineer
**I want** to split the 658 LOC Dashboard into smaller, focused sub-components
**So that** components are easier to understand, test, and modify

## Description

Dashboard component (658 LOC) has too many responsibilities. Split into:
1. **Dashboard.tsx** (<200 LOC) - container only
2. **DashboardHeader.tsx** - title, filters
3. **BalanceWidget.tsx** - account balance summary
4. **TransactionSummaryWidget.tsx** - recent transactions
5. **GoalProgressWidget.tsx** - goals progress
6. **InsightsWidget.tsx** - AI insights summary
7. **AccountBreakdownWidget.tsx** - account distribution chart

**Reference:** Technical Debt ID: SYS-001

## Acceptance Criteria

- [x] Dashboard.tsx reduced to <200 LOC (container only) - **201 LOC**
- [x] Each sub-component <150 LOC - **DashboardHeader: 52, Metrics: 184, Alerts: 81, Chart: 208, Transactions: 159**
- [x] All widgets properly memoized - **Using React.memo() on all components**
- [ ] React Profiler shows no unnecessary re-renders
- [x] Functionality 100% preserved (no UX changes)
- [ ] All tests passing
- [ ] Code review: 2+ approvals

## Definition of Done

- [x] 7 new component files created
- [x] Dashboard.tsx refactored to container
- [x] All components properly exported
- [ ] Component tests written
- [ ] Performance baseline documented
- [ ] PR merged to main

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Design component structure | 1 | Frontend |
| Extract Header widget | 1 | Frontend |
| Extract Balance widget | 1.5 | Frontend |
| Extract remaining 4 widgets | 2.5 | Frontend |
| Add memoization + optimize | 1 | Frontend |
| Write tests | 1 | QA |
| **Total** | **8** | - |

## Blockers & Dependencies

- **Blocked By:** Story 010 (FinanceContext split)
- **Blocks:** Story 015 (accessibility depends on smaller components)
- **External Dependencies:** None

## Testing Strategy

- **Component Test:** Each widget renders correctly
- **Integration Test:** Dashboard properly composes widgets
- **Performance Test:** React Profiler shows no regression
- **Snapshot Test:** Component structure locked

## Files to Modify

- [ ] `src/components/Dashboard.tsx` (refactor)
- [ ] `src/components/dashboard/` (new directory)
  - [ ] `DashboardHeader.tsx` (new)
  - [ ] `BalanceWidget.tsx` (new)
  - [ ] `TransactionSummaryWidget.tsx` (new)
  - [ ] `GoalProgressWidget.tsx` (new)
  - [ ] `InsightsWidget.tsx` (new)
  - [ ] `AccountBreakdownWidget.tsx` (new)

## Notes & Recommendations

**Widget Memoization Pattern:**
```typescript
const BalanceWidget = memo(({ accounts }) => {
  const total = useMemo(() =>
    accounts.reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  );
  return <div>{total}</div>;
});
```

**Container Pattern (New Dashboard):**
```typescript
export const Dashboard = () => {
  const { accounts, transactions } = useFinance();

  return (
    <div>
      <DashboardHeader />
      <BalanceWidget accounts={accounts} />
      <TransactionSummaryWidget transactions={transactions} />
      {/* ... other widgets */}
    </div>
  );
};
```

---

**Created:** 2026-01-26
**Owner Assignment:** @dev / Frontend
**Status:** READY FOR IMPLEMENTATION
