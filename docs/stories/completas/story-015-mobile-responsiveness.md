# Story 015: Implement Mobile Responsiveness (4 Breakpoints)

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 4
**Story ID:** STY-015
**Status:** READY FOR DEVELOPMENT
**Effort:** 8 hours
**Priority:** P1 HIGH
**Type:** Frontend / Mobile

## User Story

**As a** mobile user
**I want** the app to display correctly on all screen sizes
**So that** I can manage finances on phone, tablet, and desktop

## Description

App currently breaks on mobile (modals overflow, charts don't adapt, text too small). Implement responsive design:
1. 4 breakpoints: xs(320px), sm(640px), md(768px), lg(1024px)
2. Responsive grids, modals, forms
3. Mobile-optimized chart rendering (ResponsiveContainer)
4. Touch-friendly interactions (44px minimum targets)

**Reference:** Technical Debt ID: FE-002

## Acceptance Criteria

- [ ] Tested on 5+ physical devices (iOS/Android/desktop)
- [ ] Modals stack on mobile (<768px)
- [ ] Charts adapt to screen width
- [ ] Touch targets ≥ 44x44px (WCAG standard)
- [ ] Text readable without horizontal scroll
- [ ] Forms fit in viewport
- [ ] Lighthouse mobile score ≥ 90
- [ ] Code review: 2+ approvals

## Definition of Done

- [ ] Responsive Tailwind classes applied
- [ ] Modals refactored for mobile
- [ ] Charts use ResponsiveContainer
- [ ] Physical device testing completed
- [ ] Lighthouse scores verified
- [ ] PR merged to main

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Responsive grid implementation | 2 | Frontend |
| Modal mobile refactoring | 2 | Frontend |
| Chart/component adaptation | 2 | Frontend |
| Physical device testing | 2 | QA |
| **Total** | **8** | - |

## Blockers & Dependencies

- **Blocked By:** Story 011-013 (component decomposition helps)
- **Blocks:** None
- **External Dependencies:** Physical devices for testing

## Testing Strategy

- **Device Test:** Test on iPhone 12, iPhone SE, Samsung Galaxy, iPad
- **Emulator Test:** Chrome DevTools mobile emulation
- **Responsive Test:** Resize browser to all breakpoints
- **Lighthouse Test:** Mobile performance ≥ 90

## Files to Modify

- [ ] All component files (add responsive Tailwind classes)
- [ ] `src/components/ui/Modal.tsx` (stack on mobile)
- [ ] Chart components (add ResponsiveContainer)
- [ ] Forms (responsive layout)

## Notes & Recommendations

**Responsive Pattern:**
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {/* Cards stack on mobile, 2 cols on sm, 3 cols on md+ */}
</div>
```

**Modal Pattern:**
```typescript
<div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:left-1/2
                md:transform md:-translate-x-1/2">
  {/* Stacks at bottom on mobile, centered modal on md+ */}
</div>
```

---

**Created:** 2026-01-26
**Owner Assignment:** @dev / Frontend
**Status:** READY FOR IMPLEMENTATION
