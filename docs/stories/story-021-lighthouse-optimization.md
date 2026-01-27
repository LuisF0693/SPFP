# Story 021: Optimize Performance to Lighthouse Score ≥90

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 4
**Story ID:** STY-021
**Status:** READY FOR DEVELOPMENT
**Effort:** 5 hours
**Priority:** P1 HIGH
**Type:** Performance

## User Story

**As a** user
**I want** the app to load fast and be responsive
**So that** I can access my finances quickly

## Description

Optimize for Lighthouse metrics:
1. Reduce bundle size (<300KB target)
2. Code splitting/lazy loading
3. Image optimization
4. Render blocking resources
5. Network bottlenecks

**Reference:** Technical Debt ID: FE-004

## Acceptance Criteria

- [ ] Lighthouse score ≥90 (performance, best practices)
- [ ] Bundle size <300KB
- [ ] TTI <3s on 3G Fast
- [ ] FCP <1.5s
- [ ] CLS <0.1
- [ ] Code review: 2+ approvals

## Definition of Done

- [ ] Performance optimized
- [ ] Lighthouse report generated
- [ ] Metrics documented
- [ ] PR merged to main

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Bundle analysis | 1 | Frontend |
| Code splitting | 1.5 | Frontend |
| Image optimization | 1 | Frontend |
| Render blocking removal | 1 | Frontend |
| Testing + documentation | 0.5 | QA |
| **Total** | **5** | - |

## Blockers & Dependencies

- **Blocked By:** None
- **Blocks:** None
- **External Dependencies:** Lighthouse, webpack-bundle-analyzer

## Testing Strategy

- **Lighthouse Test:** Score ≥90 across categories
- **Bundle Test:** <300KB total
- **Performance Test:** TTI, FCP, CLS meet SLOs

## Files to Modify

- [ ] `vite.config.ts` (code splitting config)
- [ ] Component files (lazy loading)
- [ ] Image files (optimization)

---

**Created:** 2026-01-26
**Owner Assignment:** @dev / Frontend
**Status:** READY FOR IMPLEMENTATION
