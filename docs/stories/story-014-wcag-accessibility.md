# Story 014: Implement WCAG 2.1 Level AA Accessibility

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 4
**Story ID:** STY-014
**Status:** READY FOR DEVELOPMENT
**Effort:** 12 hours
**Priority:** P1 HIGH
**Type:** Accessibility / Compliance

## User Story

**As a** person with disabilities
**I want** the app to be fully accessible with screen readers and keyboard navigation
**So that** I can independently manage my finances

## Description

Implement WCAG 2.1 Level AA compliance:
1. Add 150+ `aria-*` attributes (roles, labels, descriptions)
2. Implement keyboard navigation (Tab, Enter, Escape)
3. Focus management (visible indicators, trapping in modals)
4. Screen reader support (landmarks, headings, live regions)
5. Color contrast validation

**Reference:** Technical Debt IDs: FE-001, FE-016

## Acceptance Criteria

- [ ] axe DevTools audit shows zero violations on critical paths
- [ ] Keyboard navigation 100% functional (Tab order correct)
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader announces all interactive elements
- [ ] No keyboard traps (can Tab out of any component)
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Tests verify accessibility
- [ ] Code review: 2+ approvals

## Definition of Done

- [ ] WCAG attributes added to all components
- [ ] Keyboard navigation tested (NVDA + JAWS if possible)
- [ ] Focus management implemented in modals
- [ ] Lighthouse accessibility score ≥ 95
- [ ] axe audit passes zero violations
- [ ] PR merged to main
- [ ] Staging verified

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| WCAG attribute implementation | 6 | Frontend |
| Keyboard navigation setup | 2 | Frontend |
| Focus management + indicators | 2 | Frontend |
| Testing + audit | 2 | QA |
| **Total** | **12** | - |

## Blockers & Dependencies

- **Blocked By:** Story 011-013 (component decomposition)
- **Blocks:** None
- **External Dependencies:** axe DevTools, screen reader for testing

## Testing Strategy

- **axe Audit:** Zero violations on all pages
- **Keyboard Test:** All features accessible via Tab + Enter
- **Screen Reader Test:** NVDA/JAWS announces correctly
- **Color Contrast:** All text meets WCAG standards

## Files to Modify

- [ ] All component files (add aria-* attributes)
- [ ] `src/components/ui/Modal.tsx` (focus management)
- [ ] `src/styles/` (focus indicator styling)
- [ ] Test files (add accessibility assertions)

## Notes & Recommendations

**ARIA Attributes to Add:**
- `role="navigation"`, `role="button"`, `role="tablist"`
- `aria-label` for icon buttons
- `aria-describedby` for help text
- `aria-live` for dynamic content updates
- `aria-hidden` for decorative elements

**Focus Management Pattern:**
```typescript
const modalRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  modalRef.current?.focus();
  return () => previousFocus?.focus();
}, [isOpen]);
```

---

**Created:** 2026-01-26
**Owner Assignment:** @dev / Frontend
**Status:** READY FOR IMPLEMENTATION
