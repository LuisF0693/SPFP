# 📋 Histórias Pendentes

**Total:** 14 histórias aguardando execução

## Overview

Esta pasta contém todas as histórias que estão **pendentes de desenvolvimento**, organizadas por epic e prioridade.

---

## 📌 Prioritized Roadmap

### UX Restructure Sprint (STY-052 to STY-062)
**Status:** READY - Inicia após aprovação QA de STY-051
**Total Effort:** ~51 horas
**Priority:** P0-P1 ALTA

| ID | Título | Effort | Prioridade | Bloqueador |
|----|--------|--------|-----------|-----------|
| **STY-052** | Aba de Parcelamentos | 12h | P0 CRÍTICA | STY-051 QA |
| **STY-053** | Aposentadoria vs Objetivos | 6h | P1 ALTA | STY-051 QA |
| **STY-054** | Aba de Aquisição | 10h | P1 ALTA | STY-051 QA |
| **STY-055** | Redesign de Relatórios | 6h | P2 MÉDIA | - |
| **STY-056** | 🐛 Card Owner Bug (Fix) | 2h | P0 CRÍTICA | - |
| **STY-057** | Transações do Proprietário Cartão | 3h | P1 ALTA | STY-056 |
| **STY-058** | Emojis no Formulário | 3h | P2 MÉDIA | - |
| **STY-059** | Remover Projeções | 1h | P2 MÉDIA | - |
| **STY-060** | Redesign do Formulário | 8h | P1 ALTA | - |
| **STY-061** | Redesign de Aposentadoria | 6h | P1 ALTA | STY-053 |
| **STY-062** | Goals & Budget Integration | 5h | P1 ALTA | - |

### Execution Order
```
Week 1: STY-051 QA → STY-052 + STY-056 (Bloqueadores resolvem)
Week 2: STY-057 + STY-053 (Depende STY-056, STY-051)
Week 3: STY-054 + STY-060 (Parallelizáveis)
Week 4: STY-055 + STY-058 + STY-059 + STY-061 (Final polish)
```

---

### EPIC-001: CRM v2 (Customer Relationship Management)
**Status:** 🟢 READY FOR SPRINT 2 KICKOFF (Feb 19, 2026)
**Total:** 89 story points | 190 developer-hours | 3 Sprints (4 semanas)

#### Sprint 2: Foundation & UI (Feb 19 - Mar 5)
- **S1.1:** Setup CRM Module & Navigation [8 pts] ⬅️ **BLOCKER**
- **S1.2:** Client Dashboard List [13 pts]
- **S1.3:** Client Profile Overview [8 pts]
- **S1.4:** Meeting Notes Modal (MVP) [5 pts]

#### Sprint 3: Core Features (Mar 5 - 12)
- **S1.5:** Upload Client Files [8 pts]
- **S1.6:** Meeting History & Communication [13 pts] ⚡ CRITICAL PATH
- **S1.7:** Investment Notes [8 pts]
- **S1.8:** Health Score Calculation [5 pts]
- **S1.9:** Edit Client Modal [3 pts]

#### Sprint 4: Polish & Integration (Mar 12 - 26)
- **S1.10:** Custom Template Management [5 pts]
- **S1.11:** Permissions & Access Control [5 pts]
- **S1.12:** Dashboard Integration [8 pts]

### Timeline
- **Feb 19:** Sprint 2 Kickoff
- **Mar 5:** Sprint 3 Kickoff
- **Mar 12:** Sprint 4 Kickoff
- **Mar 26:** Go-live EPIC-001 CRM v2

### Dependencies
✅ Database schema ready
✅ Resend API configured (for emails)
✅ Type definitions complete
⏳ Awaiting: STY-051 QA approval before kickoff

---

### EPIC-004: Core Fixes (Technical Debt)
**Status:** 🔄 IN PROGRESS
**Focus:** Category Validation

| Fix | Título | Status | Prioridade |
|-----|--------|--------|-----------|
| F004.1 | Validação de Nome | ✅ COMPLETE | P0 |
| F004.2 | Case-insensitive Comparison | ✅ COMPLETE | P0 |
| F004.3 | Erro Inline | ✅ COMPLETE | P0 |
| F004.4 | **Validação Completa** | 🔄 IN PROGRESS | P0 |

---

## 📊 Summary

| Categoria | Histórias | Esforço Total | Status |
|-----------|-----------|--------------|--------|
| UX Restructure | STY-052-062 | ~51h | READY (bloqueado por QA STY-051) |
| EPIC-001 CRM | S1.1-S1.12 (12 stories) | 190h | READY (kickoff Feb 19) |
| EPIC-004 Fixes | F004.1-F004.4 | In progress | IN PROGRESS |
| **TOTAL** | **14+** | **~240h** | |

---

## 🚀 Next Actions

### Imediato (Hoje - Feb 16)
1. ✅ Organizar pastas de documentação (DONE)
2. ⏳ Executar QA manual de STY-051 (18 test cases)

### Próximo (Feb 17-18)
3. Finalizar aprovação QA de STY-051
4. Merge STY-051 para main
5. Preparar ambiente EPIC-001 Sprint 2
6. Setup Resend API, confirmações de infraestrutura

### Sprint 2 Kickoff (Feb 19)
7. Daily standups (4 semanas intensas)
8. S1.1 blocker story (CRM Module Setup)
9. Parallelizar S1.2-S1.4 based on S1.1 completion

---

## 📚 Documentation

- **EPIC-001 Roadmap:** `pendentes/EPIC-001-PRIORITIZED-ROADMAP.md`
- **EPIC-001 Quick Ref:** `pendentes/EPIC-001-QUICK-REFERENCE.md`
- **EPIC-004 Details:** `pendentes/EPIC-004-Core-Fixes-stories.md`
- **Main Index:** `../INDEX.md`

---

**Last Updated:** 2026-02-16
**Critical Path:** STY-051 QA → EPIC-001 Sprint 2 (Feb 19)
**Status:** Ready for execution 🎯
