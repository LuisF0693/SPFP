# Story Index - Technical Debt Resolution Program (50+ Stories)

**Epic:** Technical Debt Resolution - SPFP
**Status:** APPROVED - Ready for Sprint Planning
**Created:** 2026-01-26
**Last Updated:** 2026-01-26

---

## Quick Navigation by Sprint

### Sprint 0: Bootstrap & Security (5 Stories, 35 hours)
| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| **STY-001** | [Implement RLS Policies on user_data Table](story-001-rls-policies.md) | 4h | P0 CRITICAL | READY |
| **STY-002** | [Enable TypeScript Strict Mode](story-002-typescript-strict-mode.md) | 2h | P0 CRITICAL | READY |
| **STY-003** | [Implement Global and Regional Error Boundaries](story-003-error-boundaries.md) | 4h | P0 CRITICAL | READY |
| **STY-004** | [Setup GitHub Actions CI/CD Pipeline](story-004-ci-cd-pipeline.md) | 6h | P0 CRITICAL | READY |
| **STY-005** | [Bootstrap Test Infrastructure (Vitest + RTL)](story-005-test-infrastructure.md) | 6h | P0 CRITICAL | READY |
| **Sprint 0 Total** | | **22h** | | |

### Sprint 1: Type Safety & Security (12 Stories, 65 hours)
| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| **STY-006** | [Remove All `as any` Type Casts](story-006-remove-type-casts.md) | 4h | P1 HIGH | READY |
| **STY-007** | [Implement Error Recovery Patterns](story-007-error-recovery.md) | 6h | P1 HIGH | READY |
| **STY-008** | [Implement Soft Delete Strategy](story-008-soft-delete.md) | 2h | P1 HIGH | READY |
| **STY-009** | [Write 50+ Unit Tests for Business Logic](story-009-unit-tests.md) | 25h | P1 HIGH | READY |
| **STY-027** | Add Audit Trail for Admin Impersonation | 6h | P1 HIGH | SUMMARY |
| **STY-028** | Implement Error Recovery Service | 2h | P2 MEDIUM | SUMMARY |
| **STY-030** | Create AI History Schema Extension | 3h | P1 HIGH | SUMMARY |
| **STY-035** | Implement Supabase Sync Error Recovery | 6h | P1 HIGH | SUMMARY |
| **STY-036** | Create User Profiles Table | 3h | P1 HIGH | SUMMARY |
| **STY-037** | Create User Settings Table | 3h | P1 HIGH | SUMMARY |
| **STY-038** | Add Transaction Group Validation | 2h | P1 HIGH | SUMMARY |
| **STY-042** | Add AI Service Response Validation | 2h | P1 HIGH | SUMMARY |
| **STY-043** | Implement useCallback Dependencies Audit | 2h | P3 LOW | SUMMARY |
| **STY-048** | Implement localStorage Debouncing | 3h | P2 MEDIUM | SUMMARY |
| **Sprint 1 Total** | | **65h** | | |

### Sprint 2-3: Architecture Refactoring (18 Stories, 111 hours)
**CRITICAL PATH SPRINT - Longest and most complex**

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| **STY-010** | [Split FinanceContext into 5 Sub-Contexts](story-010-finance-context-split.md) | 21h | **P0 CRITICAL** | READY |
| **STY-011** | [Decompose Dashboard Component (<200 LOC)](story-011-dashboard-decomposition.md) | 8h | P1 HIGH | READY |
| **STY-012** | [Decompose TransactionForm & Extract Recurrence](story-012-transaction-form-refactor.md) | 13h | P1 HIGH | READY |
| **STY-013** | [Decompose Accounts Component (<250 LOC)](story-013-accounts-component.md) | 10h | P1 HIGH | READY |
| **STY-020** | [Implement Transaction Validation Layer](story-020-validation-layer.md) | 5h | P2 MEDIUM | READY |
| **STY-023** | Extract Transaction List Optimization | 7h | P2 MEDIUM | SUMMARY |
| **STY-024** | Create Modal Abstraction Component | 7h | P2 MEDIUM | SUMMARY |
| **STY-025** | Setup Lazy Loading Infrastructure | 6h | P2 MEDIUM | SUMMARY |
| **STY-031** | Implement Real-Time Subscriptions | 8h | P1 HIGH | SUMMARY |
| **STY-032** | Write 30+ Integration Tests | 18h | P1 HIGH | SUMMARY |
| **STY-033** | [Write Integration Tests for Critical Flows](story-033-integration-tests.md) | 18h | P1 HIGH | READY |
| **STY-034** | Extract Insights Component Logic | 9h | P2 MEDIUM | SUMMARY |
| **STY-039** | Implement PDF Export Memory Optimization | 3h | P2 MEDIUM | SUMMARY |
| **STY-040** | Setup Performance Monitoring | 4h | P2 MEDIUM | SUMMARY |
| **STY-044** | Setup Lazy Loading for Routes | 3h | P2 MEDIUM | SUMMARY |
| **STY-047** | Add Batch Operations for Performance | 3h | P2 MEDIUM | SUMMARY |
| **STY-049** | Setup Security Headers + CSP | 4h | P1 HIGH | SUMMARY |
| **STY-050** | Create Final Integration & Smoke Tests | 8h | P1 HIGH | SUMMARY |
| **Sprint 2-3 Total** | | **111h** | | |

### Sprint 4: Frontend Polish & E2E Foundation (9 Stories, 55 hours)

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| **STY-014** | [Implement WCAG 2.1 Level AA Accessibility](story-014-wcag-accessibility.md) | 12h | P1 HIGH | READY |
| **STY-015** | [Implement Mobile Responsiveness (4 Breakpoints)](story-015-mobile-responsiveness.md) | 8h | P1 HIGH | READY |
| **STY-016** | [Write E2E Tests for 6 Critical Journeys](story-016-e2e-tests.md) | 20h | P1 HIGH | READY |
| **STY-018** | [Implement Dark Mode Persistence](story-018-dark-mode-persistence.md) | 4h | P2 MEDIUM | READY |
| **STY-019** | [Implement Skeleton Loaders](story-019-skeleton-loaders.md) | 4h | P2 MEDIUM | READY |
| **STY-021** | [Optimize Performance to Lighthouse ≥90](story-021-lighthouse-optimization.md) | 5h | P1 HIGH | READY |
| **STY-026** | Implement Form Validation UX Improvements | 3h | P2 MEDIUM | SUMMARY |
| **STY-041** | Setup Performance Monitoring | 4h | P2 MEDIUM | SUMMARY |
| **STY-045** | Create i18n Infrastructure | 8h | P2 MEDIUM | SUMMARY |
| **STY-046** | Implement Auto-Save for Forms | 4h | P2 MEDIUM | SUMMARY |
| **Sprint 4 Total** | | **55h** | | |

### Sprint 5-6: Database Normalization & Final Polish (15 Stories, 69 hours)

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| **STY-017** | [Design and Implement Schema Normalization](story-017-database-normalization.md) | 16h | P1 HIGH | READY |
| **STY-022** | [Implement Design Tokens System](story-022-design-tokens.md) | 5h | P2 MEDIUM | READY |
| **STY-024** | Create Modal Abstraction Component (if not done) | 7h | P2 MEDIUM | SUMMARY |
| **STY-025** | Setup Lazy Loading Infrastructure (if not done) | 6h | P2 MEDIUM | SUMMARY |
| **STY-029** | Add Database Connection Pooling | 3h | P2 MEDIUM | SUMMARY |
| **STY-039** | Implement PDF Export Memory Optimization | 3h | P2 MEDIUM | SUMMARY |
| **STY-040** | Setup Performance Monitoring | 4h | P2 MEDIUM | SUMMARY |
| **STY-044** | Setup Lazy Loading for Routes | 3h | P2 MEDIUM | SUMMARY |
| **STY-047** | Add Batch Operations for Performance | 3h | P2 MEDIUM | SUMMARY |
| **STY-049** | Setup Security Headers + CSP | 4h | P1 HIGH | SUMMARY |
| **STY-050** | Create Final Integration & Smoke Tests | 8h | P1 HIGH | SUMMARY |
| **Sprint 5-6 Total** | | **69h** | | |

---

## Stories by Priority

### P0 CRITICAL (Blocking Production)
1. **STY-001:** RLS Policies (4h)
2. **STY-002:** TypeScript Strict Mode (2h)
3. **STY-003:** Error Boundaries (4h)
4. **STY-004:** CI/CD Pipeline (6h)
5. **STY-005:** Test Infrastructure (6h)
6. **STY-010:** FinanceContext Split (21h) - CRITICAL PATH

### P1 HIGH (Sprint Priorities)
- STY-006 through STY-009 (Type Safety & Testing, 37h)
- STY-011 through STY-016 (Components & E2E, 71h)
- STY-020, STY-027, STY-030-031, STY-035-038, STY-042, STY-049-050

### P2 MEDIUM (Polish & Optimization)
- STY-018, STY-019, STY-021, STY-022-026, STY-029, STY-039-046, STY-048

### P3 LOW (Nice-to-have)
- STY-043 (useCallback Dependencies)

---

## Stories by Category

### System & Architecture (20 stories)
STY-001, 002, 003, 004, 006, 007, 010-013, 020, 023, 024, 028, 034, 043

### Database (11 stories)
STY-001, 008, 017, 027, 029-031, 035-038

### Frontend/UX (20 stories)
STY-003, 011, 012, 014, 015, 018, 019, 021, 022, 024-026, 039-040, 044-046

### Testing & Quality (8 stories)
STY-004, 005, 009, 016, 032-033, 050

---

## Critical Path & Dependencies

### BLOCKER STORIES (Must Complete First)
1. **STY-001:** RLS Policies (security foundation)
2. **STY-004:** CI/CD Pipeline (enables automated validation)
3. **STY-005:** Test Infrastructure (enables test writing)
4. **STY-010:** FinanceContext Split (21h bottleneck - blocks component refactoring)

### DEPENDENT CHAINS
- Sprint 0 → Sprint 1 (type safety foundation)
- Sprint 1 → Sprint 2-3 (STY-010 gates component work)
- Sprint 2-3 → Sprint 4 (smaller components easier to make accessible)
- Sprint 4 → Sprint 5-6 (architecture stable before E2E testing)

---

## Effort Distribution

### By Type
| Category | Stories | Hours | % |
|----------|---------|-------|---|
| **Refactoring** | 13 | 130 | 39% |
| **Testing** | 8 | 100 | 30% |
| **Features** | 15 | 70 | 21% |
| **Infrastructure** | 14 | 35 | 10% |
| **TOTAL** | **50** | **335** | 100% |

### By Sprint
| Sprint | Stories | Hours | Velocity |
|--------|---------|-------|----------|
| **0** | 5 | 22 | Light (foundation) |
| **1** | 12 | 65 | Heavy (foundation + work) |
| **2-3** | 18 | 111 | CRITICAL PATH (FinanceContext) |
| **4** | 9 | 55 | Medium (parallel work) |
| **5-6** | 15 | 69 | Heavy (final push) |
| **TOTAL** | **50** | **335** | |

---

## Status Codes

| Code | Meaning |
|------|---------|
| **READY** | Fully detailed story file created |
| **SUMMARY** | In summary file (needs individual creation) |
| **TEMPLATE** | Batch file for reference |

---

## Next Steps

1. **Review Stories:** Product team reviews priorities
2. **Refine Estimates:** Team adjusts effort estimates
3. **Assign Owners:** Team members assigned to stories
4. **Create Detailed Stories:** Convert SUMMARY stories to individual files if needed
5. **Sprint Planning:** Start Sprint 0 immediately

---

## Contacts & References

- **Epic Document:** `docs/stories/epic-technical-debt.md`
- **Technical Debt Assessment:** `docs/prd/technical-debt-assessment.md`
- **Project Guidelines:** `CLAUDE.md`

---

## NEW: UX Restructure Sprint (9 Stories, 51 hours)

**Epic:** UX Restructure - Sidebar e Navegação
**PRD:** [PRD-UX-RESTRUCTURE-SIDEBAR](../prd/PRD-UX-RESTRUCTURE-SIDEBAR.md)
**Status:** READY - Prioridade Imediata
**Created:** 2026-02-06

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| **STY-051** | [Reestruturar Sidebar com Seções Colapsáveis](story-051-sidebar-restructure.md) | 8h | P0 CRÍTICA | READY |
| **STY-052** | [Implementar Aba de Parcelamentos](story-052-installments-page.md) | 12h | P0 CRÍTICA | READY |
| **STY-053** | [Separar Aposentadoria de Objetivos](story-053-retirement-separate.md) | 6h | P1 ALTA | READY |
| **STY-054** | [Implementar Aba de Aquisição](story-054-acquisition-page.md) | 10h | P1 ALTA | READY |
| **STY-055** | [Redesign dos Relatórios](story-055-reports-redesign.md) | 6h | P2 MÉDIA | READY |
| **STY-056** | [Bug Fix: Proprietário Duplicado Cartão](story-056-card-owner-bug.md) | 2h | P0 CRÍTICA | READY |
| **STY-057** | [Bug Fix: Nome do Dono em Lançamentos](story-057-card-owner-transactions.md) | 3h | P1 ALTA | READY |
| **STY-058** | [UI: Emojis no Formulário de Lançamentos](story-058-emoji-in-transaction-form.md) | 3h | P2 MÉDIA | READY |
| **STY-059** | [Remover Aba de Projeções](story-059-remove-projections.md) | 1h | P2 MÉDIA | READY |
| **UX Sprint Total** | | **51h** | | |

### UX Sprint Execution Order:
1. **Week 1:** STY-051 (Sidebar) + STY-056 (Bug cartão)
2. **Week 2:** STY-052 (Parcelamentos) + STY-057 (Bug lançamentos)
3. **Week 3:** STY-053 (Aposentadoria) + STY-054 (Aquisição)
4. **Week 4:** STY-055 (Relatórios) + STY-058 (Emojis) + STY-059 (Remove Projeções)

---

**Total Stories Created:** 59
**Total Estimated Effort:** 386 hours
**Recommended Timeline:** 6-8 weeks (3 developers) | 12-14 weeks (2 developers)
**Expected Go-Live:** 2026-04-06

---

**Created by:** @pm (Morgan - Product Manager), Synkra AIOS
**Last Updated:** 2026-02-06
**Status:** APPROVED - UX Sprint Added
