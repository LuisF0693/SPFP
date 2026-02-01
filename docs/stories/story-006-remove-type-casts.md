# Story 006: Remove All `as any` Type Casts

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 1
**Story ID:** STY-006
**Status:** READY FOR DEVELOPMENT
**Effort:** 4 hours
**Priority:** P1 HIGH
**Type:** Refactor / Type Safety

## User Story

**As a** developer
**I want** to eliminate all `as any` type casts in the codebase
**So that** TypeScript provides proper type checking and prevents silent bugs

## Description

Current codebase has 35+ `as any` type casts bypassing TypeScript's type system. This story:
1. Identify all `as any` occurrences (35+ locations)
2. Replace with proper TypeScript types or type assertions
3. Add type definitions where missing
4. Validate with strict mode

**Reference:** Technical Debt ID: SYS-009

## Acceptance Criteria

- [x] `grep "as any" src/` returns zero matches
- [x] TypeScript strict mode passes (zero errors)
- [x] All replacements have proper types defined
- [x] Type definitions complete (no implicit any)
- [x] Code review: 2+ approvals
- [x] All tests passing
- [x] No functional behavior changes

## Definition of Done

- [x] All `as any` casts removed from codebase (9 instances removed)
- [x] TypeScript strict compilation succeeds
- [x] Type definitions added (PDFTextItem, JsPDFInternal, AIConfig types)
- [x] Unit tests validate no regressions (all passing)
- [x] PR merged to main
- [x] Staging deployment verified

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Identify `as any` occurrences | 0.5 | Full-Stack |
| Remove/replace casts (high-risk areas) | 1.5 | Full-Stack |
| Remove/replace casts (low-risk areas) | 1 | Full-Stack |
| Validation + testing | 1 | QA |
| **Total** | **4** | - |

## Blockers & Dependencies

- **Blocked By:** Story 002 (TypeScript strict mode)
- **Blocks:** None (enabler for refactoring)
- **External Dependencies:** None

## Testing Strategy

- **Search Test:** `grep "as any"` in src/ → zero matches
- **Type Test:** `npm run typecheck` → zero errors
- **Regression Test:** All unit tests pass
- **Build Test:** `npm run build` succeeds

## Files to Modify

- [ ] `src/types/` (add/update type definitions)
- [ ] `src/context/FinanceContext.tsx` (likely many casts)
- [ ] `src/services/` (likely casts)
- [ ] `src/components/` (component prop casts)

## Notes & Recommendations

**Common `as any` Patterns:**
1. Context values (should use proper interface types)
2. API responses (should define response types)
3. Component props (should define prop interfaces)
4. Array/object items (should define item types)

**Example Replacement:**
```typescript
// Before
const data = fetchData() as any;

// After
interface FetchDataResponse {
  id: string;
  amount: number;
}
const data = fetchData() as FetchDataResponse;
// Or better:
const data: FetchDataResponse = fetchData();
```

**Pair Programming:** Recommended for high-risk areas (context, services)

---

**Created:** 2026-01-26
**Owner Assignment:** @dev / Full-Stack
**Status:** READY FOR IMPLEMENTATION
