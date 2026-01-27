# Story 009: Write 50+ Unit Tests for Business Logic

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 1
**Story ID:** STY-009
**Status:** READY FOR DEVELOPMENT
**Effort:** 25 hours
**Priority:** P1 HIGH
**Type:** Testing

## User Story

**As a** QA engineer
**I want** comprehensive unit test coverage for business logic
**So that** critical functionality is validated and regressions are caught early

## Description

Write 50+ unit tests targeting business logic (utilities, services, hooks) to achieve 40%+ coverage:
1. Transaction calculations (balance, grouping)
2. Category operations
3. Account operations
4. Utility functions (formatting, validation)
5. Context reducer logic

**Reference:** Technical Debt ID: TEST-002

## Acceptance Criteria

- [ ] 50+ unit tests written and passing
- [ ] Coverage ≥ 40% (baseline)
- [ ] Tests cover happy path + error cases
- [ ] All tests in CI/CD
- [ ] Code review: 2+ approvals
- [ ] Coverage report committed

## Definition of Done

- [ ] Test files created in `src/test/`
- [ ] Coverage report > 40%
- [ ] All tests passing in CI/CD
- [ ] PR merged to main

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Write utility tests | 8 | QA |
| Write service tests | 10 | QA |
| Write context/hook tests | 5 | QA |
| Integration test base | 2 | QA |
| **Total** | **25** | - |

## Blockers & Dependencies

- **Blocked By:** Story 005 (test infrastructure)
- **Blocks:** Story 012 (integration tests depend on unit foundation)
- **External Dependencies:** Test data fixtures

## Testing Strategy

- **Coverage Test:** Coverage ≥ 40%
- **Test Quality:** Tests have clear assertions
- **Error Coverage:** Tests cover success + error paths

## Files to Modify

- [ ] `src/test/utils.test.ts` (new)
- [ ] `src/test/services/` (new directory)
- [ ] `src/test/context/` (new directory)

## Notes & Recommendations

**Test Coverage Areas:**
1. **Utilities (10 tests):** Date formatting, calculations, validators
2. **Services (20 tests):** Transaction, account, category logic
3. **Context (15 tests):** Reducer logic, state updates
4. **Hooks (5 tests):** Custom hooks behavior

**Target Test Topics:**
- Transaction grouping logic
- Recurring transaction calculations
- Account balance updates
- Category organization
- CSV import validation

---

**Created:** 2026-01-26
**Owner Assignment:** @qa / Senior QA
**Status:** READY FOR IMPLEMENTATION
