# MMOS Mind Mapper Squad

**Version:** 1.0.0
**Author:** José Carlos Amorim / Synkra AIOS
**Slash Prefix:** `MmosMindMapper`
**Upstream of:** `clone-deploy`

---

## Overview

Pipeline completo de mapeamento cognitivo de pessoas reais. Coleta fontes, extrai os 8 layers do DNA Mental, sintetiza a persona, constrói a knowledge base e produz outputs prontos para o `clone-deploy`.

Pipeline: **Source Collection → Cognitive Analysis → Persona Synthesis → Knowledge Building → Validation**

---

## Architecture

```
              mmos-chief (Orchestrator)
                     |
        +------------+------------+
        |            |            |
   Phase 1      Phase 2      Phase 3-4
   source-      cognitive-   persona-
   collector    analyst      synthesizer
                             knowledge-
                             curator
                     |
                Phase 5
                mind-validator
                     |
              outputs/minds/{slug}/
```

---

## Agents (6 total)

| Agent | Role |
|-------|------|
| `mmos-chief` | Orchestrator — manages full mapping pipeline |
| `source-collector` | Research — gathers all source material |
| `cognitive-analyst` | Analysis — maps 8 DNA Mental layers |
| `persona-synthesizer` | Synthesis — creates system prompt + cognitive-spec |
| `knowledge-curator` | Knowledge — builds RAG-optimized knowledge base |
| `mind-validator` | Validation — readiness score + gap analysis |

---

## DNA Mental — 8 Cognitive Layers

| Layer | Name | What it captures |
|-------|------|-----------------|
| 1 | Knowledge Base | Áreas de expertise e domínio |
| 2 | Communication Style | Tom, vocabulário, metáforas |
| 3 | Behavioral Patterns | Padrões de decisão e ação |
| 4 | Values & Decisions | Hierarquia de valores e trade-offs |
| 5 | Meta Axioms | Crenças-raiz e obsessões centrais |
| 6 | Belief System | Visão de mundo estruturada |
| 7 | Identity Core | Singularidade cognitiva |
| 8 | Productive Paradoxes | Tensões criativas da persona |

---

## Output Structure (consumed by clone-deploy)

```
outputs/minds/{slug}/
├── system_prompts/
│   └── {slug}-system-prompt.md     ← identidade completa (2000-5000 tokens)
├── analysis/
│   ├── cognitive-spec.yaml          ← 8 layers estruturados
│   ├── layers-analysis.md           ← análise detalhada
│   └── evidence-map.md              ← evidências por layer
├── synthesis/
│   ├── worldview.md
│   ├── communication-style.md
│   └── signature-phrases.md
├── kb/
│   ├── core-principles.md
│   ├── mental-models.md
│   ├── key-ideas.md
│   └── notable-works.md
└── sources/
    ├── sources.yaml
    └── raw-excerpts.md
```

---

## Quick Start

```bash
# Ativar o orquestrador
/mmos-mind-mapper

# Pipeline completo (recomendado)
*map "Seth Godin"

# Pipeline rápido (30-60 min)
*map "Seth Godin" --quick

# Passo a passo
*collect seth_godin
*analyze seth_godin
*synthesize seth_godin
*build-kb seth_godin
*validate seth_godin

# Ver resultado
*output seth_godin

# Gerar handoff para clone-deploy
*handoff seth_godin
```

---

## Workflows (3 total)

| Workflow | Duration | Purpose |
|----------|---------|---------|
| `full-mapping` | 2-4h | Pipeline completo com todas as fases |
| `quick-profile` | 30-60min | Perfil rápido com fontes públicas |
| `enrich-mind` | 1-2h | Enriquecer mind existente |

---

## Downstream: clone-deploy

Após `*validate {slug}` com score >= 60:

```bash
# Ativar clone-deploy
/clone-deploy

# Diagnosticar mind (usa readiness-report.yaml gerado aqui)
*diagnose seth_godin

# Se aprovado, prosseguir com deploy
*ingest seth_godin → *build seth_godin → *deploy-whatsapp seth_godin
```

---

## Pack Structure

```
squads/mmos-mind-mapper/
├── agents/
│   ├── mmos-chief.md
│   ├── source-collector.md
│   ├── cognitive-analyst.md
│   ├── persona-synthesizer.md
│   ├── knowledge-curator.md
│   └── mind-validator.md
├── tasks/
│   ├── collect-sources.md
│   ├── analyze-layers.md
│   ├── synthesize-persona.md
│   ├── build-cognitive-spec.md
│   ├── build-knowledge-base.md
│   └── validate-mind.md
├── workflows/
│   ├── full-mapping.md
│   ├── quick-profile.md
│   └── enrich-mind.md
├── templates/
│   ├── system-prompt-template.md
│   ├── cognitive-spec-template.yaml
│   └── kb-file-template.md
├── checklists/
│   ├── mind-completeness-checklist.md
│   └── layer-coverage-checklist.md
├── data/
│   └── mmos-kb.md
├── config.yaml
└── README.md
```
