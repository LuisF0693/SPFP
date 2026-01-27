# Story 012: Decompose TransactionForm and Extract Recurrence Logic

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 3
**Story ID:** STY-012
**Status:** READY FOR DEVELOPMENT
**Effort:** 13 hours
**Priority:** P1 HIGH
**Type:** Refactor / Component Decomposition

## User Story

**As a** frontend engineer
**I want** to decompose the 641 LOC TransactionForm into focused sub-components
**So that** form logic is easier to understand and test

## Description

TransactionForm (641 LOC) with 20+ useState hooks combines form + recurrence wizard. Split into:
1. **TransactionForm.tsx** (<300 LOC) - form container
2. **TransactionFormFields.tsx** - date, amount, category, account
3. **RecurrenceWizard.tsx** - frequency, end date, installment logic
4. **transactionService.ts** - recurrence calculations + validation

**Reference:** Technical Debt IDs: SYS-002, SYS-017

## Acceptance Criteria

- [ ] TransactionForm.tsx <400 LOC total
- [ ] Recurrence logic moved to service/separate component
- [ ] No useState bloat (hook count reduced)
- [ ] Form still works for simple + recurring transactions
- [ ] All validation passes
- [ ] Tests for all form states
- [ ] Code review: 2+ approvals

## Definition of Done

- [ ] 3 new component files created
- [ ] transactionService extended
- [ ] Form tests updated
- [ ] Recurrence wizard tests added
- [ ] PR merged to main

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Design form architecture | 2 | Frontend |
| Extract form fields component | 3 | Frontend |
| Extract recurrence wizard | 4 | Frontend |
| Create/update service logic | 2 | Full-Stack |
| Write tests | 2 | QA |
| **Total** | **13** | - |

## Blockers & Dependencies

- **Blocked By:** Story 010 (context split)
- **Blocks:** Story 016 (validation layer)
- **External Dependencies:** None

## Testing Strategy

- **Component Test:** Form renders + submit works
- **Wizard Test:** Recurrence logic calculates correctly
- **Validation Test:** All validation rules work
- **Regression Test:** No existing functionality broken

## Files to Modify

- [ ] `src/components/TransactionForm.tsx` (refactor)
- [ ] `src/components/TransactionFormFields.tsx` (new)
- [ ] `src/components/RecurrenceWizard.tsx` (new)
- [ ] `src/services/transactionService.ts` (extend)
- [ ] Test files updated

## Notes & Recommendations

**Service Pattern for Recurrence:**
```typescript
export const transactionService = {
  calculateRecurrence: (freq, startDate, endDate) => {
    // Generate array of transaction dates
  },
  validateRecurrence: (data) => {
    // Validate frequency, installments, groupId
  },
};
```

---

**Created:** 2026-01-26
**Owner Assignment:** @dev / Frontend
**Status:** READY FOR IMPLEMENTATION
