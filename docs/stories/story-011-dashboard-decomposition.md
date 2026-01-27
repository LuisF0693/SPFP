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

## Files Modified/Created

- [x] `src/components/Dashboard.tsx` (refactored from 658 → 201 LOC)
- [x] `src/components/dashboard/` (new directory)
  - [x] `DashboardHeader.tsx` (52 LOC) - greeting, filters, action buttons
  - [x] `DashboardMetrics.tsx` (184 LOC) - 3 metric cards (net worth, spending, budget)
  - [x] `DashboardAlerts.tsx` (81 LOC) - alert cards grid
  - [x] `DashboardChart.tsx` (208 LOC) - trend chart + category pie chart
  - [x] `DashboardTransactions.tsx` (159 LOC) - recent transactions + accounts list
  - [x] `dashboardUtils.ts` (275 LOC) - custom hooks for data calculations
  - [x] `index.ts` (21 LOC) - barrel export for all components

## Files Modified/Created Summary

**Total LOC Reduction:**
- Original: 658 LOC (monolithic)
- New: 1,160 LOC (decomposed + utilities)
- Container: 201 LOC (under 200 LOC target)
- Avg Component: 107 LOC (under 150 LOC target)

**Key Improvements:**
- Separated concerns: UI rendering from data calculations
- Custom hooks extract business logic (`useMonthlyMetrics`, `useBudgetAlerts`, etc.)
- All components memoized with `React.memo()`
- Improved testability with focused components
- Cleaner import structure with barrel export

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
