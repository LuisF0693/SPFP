# Story 018: Implement Dark Mode Persistence

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 4
**Story ID:** STY-018
**Status:** READY FOR DEVELOPMENT
**Effort:** 4 hours
**Priority:** P2 MEDIUM
**Type:** Feature / UX

## User Story

**As a** user
**I want** my dark mode preference to persist across browser sessions
**So that** I don't have to re-select my theme every time I visit

## Description

Dark mode exists but preference resets on page refresh. This story:
1. Persist theme preference to localStorage
2. Sync theme with system preference (prefers-color-scheme)
3. Respect user override (explicit selection)
4. No flash of wrong theme on load

**Reference:** Technical Debt ID: FE-011

## Acceptance Criteria

- [ ] Theme preference persists across refresh
- [ ] System theme respected if no user preference
- [ ] No flash of wrong theme on page load
- [ ] User can override system preference
- [ ] All pages use consistent theme
- [ ] Code review: 2+ approvals

## Definition of Done

- [ ] localStorage implementation added
- [ ] Theme provider updated
- [ ] No FOUC (Flash of Unstyled Content)
- [ ] Tests verify persistence
- [ ] PR merged to main

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Implement localStorage theme | 1.5 | Frontend |
| System preference detection | 1 | Frontend |
| FOUC prevention | 1 | Frontend |
| Tests | 0.5 | QA |
| **Total** | **4** | - |

## Blockers & Dependencies

- **Blocked By:** None
- **Blocks:** None
- **External Dependencies:** None

## Testing Strategy

- **Persistence Test:** Set theme → refresh → verify theme persists
- **System Test:** Disable user preference → verify system theme used
- **FOUC Test:** No flash of wrong theme on load

## Files to Modify

- [ ] `src/context/UIContext.tsx` (add theme persistence)
- [ ] `src/components/ThemeProvider.tsx` (update if exists)
- [ ] `src/main.tsx` (prevent FOUC)

---

**Created:** 2026-01-26
**Owner Assignment:** @dev / Frontend
**Status:** READY FOR IMPLEMENTATION
