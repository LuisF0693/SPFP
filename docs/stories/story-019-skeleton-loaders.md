# Story 019: Implement Skeleton Loaders for Async States

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 4
**Story ID:** STY-019
**Status:** READY FOR DEVELOPMENT
**Effort:** 4 hours
**Priority:** P2 MEDIUM
**Type:** UX / Performance

## User Story

**As a** user
**I want** to see skeleton placeholders while data loads
**So that** the app feels faster and more responsive

## Description

Replace spinners with skeleton loaders showing content structure during async operations:
1. Create Skeleton component
2. Add skeleton loaders to Dashboard, TransactionList, Goals
3. Remove generic spinners
4. Improve perceived performance

**Reference:** Technical Debt ID: FE-012

## Acceptance Criteria

- [ ] Skeleton component created
- [ ] Dashboard uses skeleton during load
- [ ] TransactionList uses skeleton during load
- [ ] Goals uses skeleton during load
- [ ] Skeleton timing matches actual content load
- [ ] Tests verify skeleton behavior
- [ ] Code review: 2+ approvals

## Definition of Done

- [ ] Skeleton component created
- [ ] 3+ components using skeletons
- [ ] Spinners removed or hidden
- [ ] Tests updated
- [ ] PR merged to main

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Create Skeleton component | 1.5 | Frontend |
| Add to Dashboard | 0.75 | Frontend |
| Add to TransactionList | 0.75 | Frontend |
| Add to Goals | 0.75 | Frontend |
| Tests | 0.25 | QA |
| **Total** | **4** | - |

## Blockers & Dependencies

- **Blocked By:** Story 011 (Dashboard decomposition helps)
- **Blocks:** None
- **External Dependencies:** None

## Testing Strategy

- **Render Test:** Skeleton displays during loading
- **Content Test:** Skeleton replaced with content
- **Animation Test:** No janky transitions

## Files to Modify

- [ ] `src/components/ui/Skeleton.tsx` (new)
- [ ] `src/components/Dashboard.tsx`
- [ ] `src/components/TransactionList.tsx`
- [ ] `src/components/Goals.tsx`

---

**Created:** 2026-01-26
**Owner Assignment:** @dev / Frontend
**Status:** READY FOR IMPLEMENTATION
