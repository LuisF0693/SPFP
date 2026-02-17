# EPIC-001: CRM v2 - User Stories

## Summary

8 user stories created for EPIC-001 (CRM v2 modernization and feature expansion).

**Status:** All Draft - Ready for @po validation (10-point checklist)
**Total Points:** 73 points
**Timeline:** 2-4 sprints (4-8 weeks)

---

## Stories Created

| ID | Title | Sprint | Points | Status |
|----|-------|--------|--------|--------|
| **1.1** | Modernizar UI/UX do CRM | 2 | 8 | Draft |
| **1.2** | Criar Sistema de Atas de Reunião | 3 | 13 | Draft |
| **1.3** | Criar Sistema de Atas de Investimentos | 3 | 13 | Draft |
| **1.4** | Integrar Envio por Email | 4 | 8 | Draft |
| **1.5** | Integrar Envio por WhatsApp | 4 | 5 | Draft |
| **1.6** | Implementar Templates Editáveis | 4 | 8 | Draft |
| **1.7** | Implementar Aba de Arquivos/Slides | 4 | 13 | Draft |
| **1.8** | Implementar Histórico de Atas Enviadas | 4 | 5 | Draft |

---

## Dependencies Chain

```
US-101 (UI) ─┬─> US-102 (Meeting Minutes)
             │    ├─> US-104 (Email)
             │    └─> US-108 (History)
             │
             └─> US-103 (Investment Minutes)
                  ├─> US-104 (Email)
                  └─> US-108 (History)

US-106 (Templates) ──> Uses US-102 & US-103
US-105 (WhatsApp) ──> Uses US-102 & US-103
US-107 (Files) ─────> Independent
```

---

## Acceptance Criteria Summary

Each story includes:
- ✅ Clear title and user story format (Como/Quero/Para)
- ✅ 5-7+ acceptance criteria with checkboxes
- ✅ Scope (IN/OUT sections)
- ✅ Technical notes with implementation approach
- ✅ File list for changes
- ✅ Definition of Done
- ✅ Dependencies and business value
- ✅ Risks and mitigations
- ✅ Change log entry

---

## Mapped to EPIC-001 Requirements

| Epic Requirement | Story |
|------------------|-------|
| RF-001: Modernizar UI/UX | US-101 |
| RF-002: Atas de Reunião | US-102 |
| RF-003: Atas de Investimentos | US-103 |
| RF-004: Email | US-104 |
| RF-005: WhatsApp | US-105 |
| RF-006: Templates | US-106 |
| RF-007: Arquivos/Slides | US-107 |
| RF-008: Histórico | US-108 |

---

## Next Steps

1. **@po validates** (via `*validate-story-draft` workflow)
   - Runs 10-point checklist
   - Provides GO/NO-GO decision
   - Updates Status to Ready if approved

2. **@dev implements** (via story development cycle)
   - Selects story (must be Ready)
   - Updates File List as progress
   - Creates PR with changes

3. **@qa gates** (via QA gate checklist)
   - Reviews code quality
   - Verifies acceptance criteria
   - PASS/CONCERNS/FAIL verdict

---

## Notes

- All stories follow Synkra AIOS story template
- Each story includes Technical Notes with file structure and services
- Estimated breakdown provided (points distributed across tasks)
- Ready for development immediately after validation
- No dependencies on other epics (EPIC-004 should be complete)

---

**Created:** 2026-02-17
**By:** @sm (Max) - Scrum Master
**Mode:** YOLO (batch creation, no interruptions)
