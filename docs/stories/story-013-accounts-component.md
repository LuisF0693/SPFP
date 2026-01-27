# Story 013: Decompose Accounts Component (Target: <250 LOC)

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 3
**Story ID:** STY-013
**Status:** READY FOR DEVELOPMENT
**Effort:** 10 hours
**Priority:** P1 HIGH
**Type:** Refactor / Component Decomposition

## User Story

**As a** frontend engineer
**I want** to split the 647 LOC Accounts component into list and form
**So that** each concern is independently testable and modifiable

## Description

Accounts component mixes list display + add/edit form. Split into:
1. **Accounts.tsx** (<150 LOC) - container
2. **AccountsList.tsx** - table/list display
3. **AccountForm.tsx** - add/edit form in modal
4. **accountService.ts** - balance calculations, validation

**Reference:** Technical Debt ID: SYS-003

## Acceptance Criteria

- [ ] Accounts.tsx <250 LOC (container + composition)
- [ ] AccountsList <200 LOC
- [ ] AccountForm <200 LOC
- [ ] Add/edit workflows work correctly
- [ ] Balance calculations accurate
- [ ] Tests for all workflows
- [ ] Code review: 2+ approvals

## Definition of Done

- [ ] 3 component files created/refactored
- [ ] Service logic extracted
- [ ] Tests updated
- [ ] Deployed to staging
- [ ] PR merged to main

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Design structure | 1 | Frontend |
| Extract list component | 2.5 | Frontend |
| Extract form component | 2.5 | Frontend |
| Create service layer | 2 | Full-Stack |
| Write tests | 2 | QA |
| **Total** | **10** | - |

## Blockers & Dependencies

- **Blocked By:** Story 010 (context split)
- **Blocks:** None directly
- **External Dependencies:** None

## Testing Strategy

- **List Test:** Accounts display correctly, sorting works
- **Form Test:** Add/edit functionality works
- **Service Test:** Balance calculations accurate
- **Integration Test:** List + form work together

## Files to Modify

- [ ] `src/components/Accounts.tsx` (refactor)
- [ ] `src/components/AccountsList.tsx` (new)
- [ ] `src/components/AccountForm.tsx` (new)
- [ ] `src/services/accountService.ts` (extend/create)

## Notes & Recommendations

**Service Pattern:**
```typescript
export const accountService = {
  calculateBalance: (account, transactions) => {
    // Sum transactions for account
  },
  validateAccount: (data) => {
    // Validate required fields
  },
};
```

---

**Created:** 2026-01-26
**Owner Assignment:** @dev / Frontend
**Status:** READY FOR IMPLEMENTATION
