# Story 005: Bootstrap Test Infrastructure (Vitest + React Testing Library)

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 0
**Story ID:** STY-005
**Status:** READY FOR DEVELOPMENT
**Effort:** 6 hours
**Priority:** P0 CRITICAL
**Type:** Infrastructure / Testing

## User Story

**As a** QA engineer
**I want** a working test infrastructure with Vitest and React Testing Library
**So that** unit and integration tests can be written and executed

## Description

Currently, test infrastructure is incomplete. This story:
1. Configure Vitest (test runner)
2. Setup React Testing Library (component testing)
3. Create test utilities and fixtures
4. Configure coverage reporting
5. Write first 10 test examples
6. Integrate with CI/CD

**Reference:** Technical Debt IDs: TEST-001, TEST-008

## Acceptance Criteria

- [ ] Vitest configured in `vite.config.ts`
- [ ] React Testing Library installed and working
- [ ] Test scripts in `package.json` (test, test:ui, test:coverage)
- [ ] Coverage reporting configured
- [ ] First 10 unit tests passing (business logic examples)
- [ ] Test utilities created (fixtures, mocks, helpers)
- [ ] Coverage report shows >10% (baseline)
- [ ] Code review: 2+ approvals
- [ ] All tests passing in CI/CD

## Definition of Done

- [ ] `vite.config.ts` updated with Vitest configuration
- [ ] `vitest.config.ts` created (if needed)
- [ ] Test utilities created in `src/test/`
- [ ] Example tests written (10+ tests)
- [ ] Coverage report generated and committed
- [ ] Documentation: testing guide created
- [ ] PR merged to main
- [ ] CI/CD running tests successfully

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Configure Vitest + RTL | 2 | QA |
| Create test utilities | 1.5 | QA |
| Write 10 example tests | 1.5 | QA |
| Configure coverage | 1 | QA |
| **Total** | **6** | - |

## Blockers & Dependencies

- **Blocked By:** Story 002 (TypeScript strict mode) - optional but recommended
- **Blocks:** All Sprint 1 testing stories
- **External Dependencies:** npm packages (vitest, @testing-library/react, jsdom)

## Testing Strategy

- **Setup Test:** Run `npm run test` → all tests pass
- **Coverage Test:** Generate report → confirms >5% coverage
- **CI/CD Test:** Tests pass in GitHub Actions

## Files to Modify

- [ ] `vite.config.ts` (add Vitest config)
- [ ] `vitest.config.ts` (new - if separate config needed)
- [ ] `package.json` (add test scripts)
- [ ] `src/test/` directory (create test utilities)
- [ ] `src/test/setup.ts` (test setup file - new)
- [ ] `src/test/mocks/` (mock utilities - new)
- [ ] Example test files (new)

## Notes & Recommendations

**Vitest Config Pattern:**
```typescript
// vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

**Test Utilities to Create:**
- Mock Supabase client
- Mock React Router
- Mock Context providers
- Fixture data builders

**Example Test Topics:**
- Utility function tests (formatting, calculations)
- Service tests (transaction logic)
- Component tests (simple UI components)

---

**Created:** 2026-01-26
**Owner Assignment:** @qa / Senior QA
**Status:** READY FOR IMPLEMENTATION
