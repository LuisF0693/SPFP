# Story 004: Setup GitHub Actions CI/CD Pipeline

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 0
**Story ID:** STY-004
**Status:** READY FOR DEVELOPMENT
**Effort:** 6 hours
**Priority:** P0 CRITICAL
**Type:** Infrastructure / DevOps

## User Story

**As a** developer
**I want** automated CI/CD checks on every PR
**So that** code quality and test failures are caught before merging

## Description

Currently, no CI/CD pipeline exists. This story sets up GitHub Actions to run on every PR:
1. Lint checks (ESLint)
2. Type checking (TypeScript --strict)
3. Unit tests (Vitest)
4. Build verification (npm run build)
5. Report results to PR

**Reference:** Technical Debt ID: TEST-006

## Acceptance Criteria

- [ ] GitHub Actions workflow created (`.github/workflows/ci.yml`)
- [ ] Lint checks run and report failures on PR
- [ ] Type checking runs (`npm run typecheck`)
- [ ] Unit tests run (Vitest)
- [ ] Build step succeeds
- [ ] All checks must pass before merge (status checks enabled)
- [ ] Pipeline runs on every PR and push to main
- [ ] Test coverage report generated
- [ ] Code review: 2+ approvals

## Definition of Done

- [ ] `.github/workflows/ci.yml` created and functional
- [ ] All checks passing on demo PR
- [ ] Branch protection rules enforce CI status checks
- [ ] Documentation: CI/CD runbook created
- [ ] Team aware of pipeline
- [ ] PR merged to main
- [ ] Workflow active and monitored

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Design workflow steps | 1 | DevOps |
| Create workflow YAML | 2 | DevOps |
| Configure branch protection | 1 | DevOps |
| Test workflow on demo PR | 1.5 | DevOps |
| Documentation | 0.5 | DevOps |
| **Total** | **6** | - |

## Blockers & Dependencies

- **Blocked By:** None
- **Blocks:** All subsequent PRs (workflow must be active)
- **External Dependencies:** GitHub Actions (native)

## Testing Strategy

- **Workflow Test:** Create test PR → verify all checks run
- **Failure Test:** Introduce lint error → verify CI catches it
- **Type Test:** Introduce type error → verify CI catches it

## Files to Modify

- [ ] `.github/workflows/ci.yml` (new)
- [ ] `docs/DEPLOYMENT.md` (add CI/CD section)
- [ ] `.github/settings.yml` (enable branch protection if using)

## Notes & Recommendations

**Workflow Steps:**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

**Branch Protection:** Require status checks before merge in Settings → Branches → Add rule for `main`.

---

**Created:** 2026-01-26
**Owner Assignment:** @devops / Senior
**Status:** READY FOR IMPLEMENTATION
