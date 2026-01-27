# Story 003: Implement Global and Regional Error Boundaries

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 0
**Story ID:** STY-003
**Status:** READY FOR DEVELOPMENT
**Effort:** 4 hours
**Priority:** P0 CRITICAL
**Type:** Feature / Error Handling

## User Story

**As a** user
**I want** the app to gracefully handle component errors
**So that** a crash in one component doesn't crash the entire application

## Description

Currently, no error boundaries exist. Any component error crashes the entire app. This story implements:
1. **Global Error Boundary** (in Layout.tsx) - catches all unhandled errors
2. **Regional Error Boundaries** - Dashboard, TransactionForm, Insights (graceful fallback)
3. **Error logging** - log errors to console + monitoring service (prepared for Sentry)
4. **Recovery UI** - shows user-friendly message + retry button

**Reference:** Technical Debt IDs: SYS-020, FE-015

## Acceptance Criteria

- [ ] Global error boundary component created in Layout.tsx
- [ ] Regional error boundaries in Dashboard, TransactionForm, Insights
- [ ] Error logging to console with context
- [ ] Graceful UI fallback (not a blank white screen)
- [ ] Manual test: throw Error in component → caught by boundary
- [ ] Component error → sibling components still render
- [ ] App remains interactive (navigation works)
- [ ] Code review: 2+ approvals
- [ ] All tests passing

## Definition of Done

- [ ] ErrorBoundary component created (`src/components/ui/ErrorBoundary.tsx`)
- [ ] Layout.tsx wrapped with global boundary
- [ ] Dashboard, TransactionForm, Insights wrapped with regional boundaries
- [ ] Error logging functional (monitored in console)
- [ ] Manual testing confirms error containment
- [ ] PR merged to main
- [ ] Deployed to staging

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Create ErrorBoundary component | 1.5 | Frontend |
| Add global boundary (Layout) | 0.5 | Frontend |
| Add regional boundaries (3 components) | 1 | Frontend |
| Test error handling | 1 | QA |
| **Total** | **4** | - |

## Blockers & Dependencies

- **Blocked By:** None
- **Blocks:** None (independent)
- **External Dependencies:** React error boundary API (native)

## Testing Strategy

- **Component Test:** ErrorBoundary catches thrown Error
- **Integration Test:** Boundary logs error + shows fallback UI
- **Manual Test:** Inject error in Dashboard → verify other components work
- **Regression Test:** No page crashes on component error

## Files to Modify

- [ ] `src/components/ui/ErrorBoundary.tsx` (new - reusable component)
- [ ] `src/components/Layout.tsx` (wrap with global boundary)
- [ ] `src/components/Dashboard.tsx` (wrap with regional boundary)
- [ ] `src/components/TransactionForm.tsx` (wrap with regional boundary)
- [ ] `src/components/Insights.tsx` (wrap with regional boundary)
- [ ] `src/test/ErrorBoundary.test.tsx` (new - unit tests)

## Notes & Recommendations

**Implementation Pattern:**
```typescript
// ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    this.setState({ hasError: true });
  }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**Future Enhancement:** Integrate Sentry error tracking (prepared, not implemented in this story)

---

**Created:** 2026-01-26
**Owner Assignment:** @dev / Frontend
**Status:** READY FOR IMPLEMENTATION
