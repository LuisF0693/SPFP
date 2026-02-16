# Story 016: Write E2E Tests for 6 Critical User Journeys

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 5
**Story ID:** STY-016
**Status:** READY FOR DEVELOPMENT
**Effort:** 20 hours
**Priority:** P1 HIGH
**Type:** Testing / Quality Assurance

## User Story

**As a** QA engineer
**I want** end-to-end tests for critical user workflows
**So that** deployment regressions are caught before production

## Description

Write comprehensive E2E tests using Playwright or Cypress for 6 critical journeys:
1. User signup + first transaction
2. Recurring transaction creation + management
3. CSV import + validation
4. Admin impersonation + audit trail
5. Multi-user data isolation (security)
6. AI insights generation + persistence

**Reference:** Technical Debt ID: TEST-004

## Acceptance Criteria

- [ ] 6 E2E test scripts written and passing
- [ ] Each test covers happy path + error cases
- [ ] Tests pass in CI/CD pipeline
- [ ] All critical paths validated
- [ ] Code review: 2+ approvals
- [ ] Tests run reliably (no flakiness)

## Definition of Done

- [ ] E2E test files created in `tests/` directory
- [ ] Playwright/Cypress configured
- [ ] Tests passing locally and in CI/CD
- [ ] Performance metrics captured
- [ ] PR merged to main
- [ ] Documented in testing guide

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| E2E test infrastructure setup | 3 | QA |
| Signup + transaction test | 3 | QA |
| Recurring transaction test | 3 | QA |
| CSV import test | 2.5 | QA |
| Admin impersonation test | 3 | QA |
| Multi-user isolation test | 2.5 | QA |
| AI insights test | 2 | QA |
| **Total** | **20** | - |

## Blockers & Dependencies

- **Blocked By:** Story 004 (CI/CD for test automation)
- **Blocks:** None (gating for production deployment)
- **External Dependencies:** Playwright/Cypress, staging environment

## Testing Strategy

- **Path Test:** Each journey executes end-to-end
- **Data Test:** Correct data persisted to database
- **Error Test:** Error paths handled gracefully
- **Isolation Test:** Multi-user data not leaked
- **Performance Test:** Critical actions complete <3s

## Files to Modify

- [ ] `tests/e2e/` directory (new)
- [ ] `tests/e2e/signup.spec.ts` (new)
- [ ] `tests/e2e/transactions.spec.ts` (new)
- [ ] `tests/e2e/import.spec.ts` (new)
- [ ] `tests/e2e/admin.spec.ts` (new)
- [ ] `tests/e2e/security.spec.ts` (new)
- [ ] `tests/e2e/insights.spec.ts` (new)

## Notes & Recommendations

**E2E Test Pattern (Playwright):**
```typescript
test('User signup and first transaction', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Sign Up');
  await page.fill('input[name=email]', 'test@example.com');
  await page.fill('input[name=password]', 'secure123');
  await page.click('button:has-text("Sign Up")');
  await page.waitForNavigation();
  // Verify signup successful
  expect(page).toHaveURL('/dashboard');
});
```

**Multi-User Isolation Test:**
```typescript
test('User A cannot see User B transactions', async ({
  browser
}) => {
  // Open 2 browsers: User A and User B
  // User A creates transaction
  // Switch to User B
  // Verify transaction not visible
});
```

---

**Created:** 2026-01-26
**Owner Assignment:** @qa / Senior QA
**Status:** READY FOR IMPLEMENTATION
