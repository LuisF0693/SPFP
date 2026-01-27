# Story 033: Write Integration Tests for Critical Flows

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 2
**Story ID:** STY-033
**Status:** READY FOR DEVELOPMENT
**Effort:** 18 hours
**Priority:** P1 HIGH
**Type:** Testing / Quality Assurance

## User Story

**As a** QA engineer
**I want** integration tests covering component + context + service interactions
**So that** data flows correctly through the entire stack

## Description

Write 30+ integration tests covering:
1. Auth flow (signup, login, logout)
2. Transaction flow (create, update, delete)
3. Supabase sync interaction
4. Context updates propagating to components
5. Error handling in integrated flows

**Reference:** Technical Debt ID: TEST-003

## Acceptance Criteria

- [ ] 30+ integration tests written and passing
- [ ] Auth flow tested (signup, login, logout)
- [ ] Transaction CRUD tested with context
- [ ] Supabase sync tested
- [ ] Error paths tested
- [ ] Coverage ≥ 60% for integrated components
- [ ] All tests in CI/CD

## Definition of Done

- [ ] Test files created in `src/test/integration/`
- [ ] All tests passing
- [ ] Coverage report shows ≥60%
- [ ] PR merged to main

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Setup integration test infrastructure | 3 | QA |
| Write auth flow tests | 3 | QA |
| Write transaction flow tests | 5 | QA |
| Write Supabase sync tests | 4 | QA |
| Write error path tests | 3 | QA |
| **Total** | **18** | - |

## Blockers & Dependencies

- **Blocked By:** Story 009 (unit test foundation)
- **Blocks:** Story 016 (E2E tests depend on this)
- **External Dependencies:** None

## Testing Strategy

- **Flow Test:** Auth → Create transaction → Sync → Verify
- **Isolation Test:** Multiple components can work together
- **Error Test:** Component handles service errors gracefully

## Files to Modify

- [ ] `src/test/integration/` directory (new)
- [ ] `src/test/integration/auth.test.ts` (new)
- [ ] `src/test/integration/transactions.test.ts` (new)
- [ ] `src/test/integration/sync.test.ts` (new)

---

**Created:** 2026-01-26
**Owner Assignment:** @qa / Senior QA
**Status:** READY FOR IMPLEMENTATION
