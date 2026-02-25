# Handoff — Sessão 2026-02-25
# Criação dos Squads AIOS da Empresa SPFP

**Data:** 2026-02-25
**Tipo:** Framework Architecture — SPFP Company Squads
**Status:** ✅ COMPLETO — todos os squads criados, clones IA gerados, push realizado
**Commits:** `60129a5`, `540363d`

---

## O que foi feito

Esta sessão criou a **estrutura organizacional completa da empresa SPFP como squads AIOS**.
Cada squad tem seu próprio AI Head clonado por IA via MMOS Mind Mapper, com agentes
especializados, tasks detalhadas e workflows baseados nos PDFs do FigJam.

---

## Squads Criados

### 1. spfp-conselheiros
**Localização:** `squads/spfp-conselheiros/`
**Skill:** `/spfp-conselheiros`
**Função:** Mentores estratégicos externos — aconselham o CEO em decisões importantes.

| Conselheiro | Especialidade | Score | Clone |
|-------------|--------------|-------|-------|
| Alex Hormozi | Ofertas, monetização, crescimento | 94/100 | `outputs/minds/alex-hormozi/` |
| Steve Jobs | Produto, design, visão | 96/100 | `outputs/minds/steve-jobs/` |

**Agente:** `conselheiro.md` — multi-persona, ativa Hormozi ou Jobs conforme demanda
**Task:** `sessao-conselho.md`

---

### 2. spfp-marketing
**Localização:** `squads/spfp-marketing/`
**Skill:** `/spfp-marketing`
**AI Head:** Thiago Finch (clone, `outputs/minds/thiago-finch/`)

| Agente | Skill | Tasks |
|--------|-------|-------|
| marketing-chief | `/spfp-marketing` | Define estratégia, aprova calendário, distribui budget |
| social-media-manager | `:agents:social-media-manager` | create-content, schedule-posts, engage-community |
| media-buyer | `:agents:media-buyer` | create-campaign, optimize-ads, scale-winners |
| email-strategist | `:agents:email-strategist` | write-email, build-sequence, analyze-metrics |
| content-manager | `:agents:content-manager` | seo-research, content-planning, publish, report |
| research-analyst | `:agents:research-analyst` | competitor-analysis, trend-hunting, swipe-file |

**Workflow:** `marketing-campaign.md`
```
RESEARCH → QG1 → COPY → QG2 → [Social/Ads/Email] → Automation OPS → CONTEÚDO → QG3 → REPORTS → QG4 → SUCCESS
```

---

### 3. spfp-cs
**Localização:** `squads/spfp-cs/`
**Skill:** `/spfp-cs`
**AI Head:** Lincoln Murphy (clone, `outputs/minds/lincoln-murphy/`)

| Agente | Skill | Tasks |
|--------|-------|-------|
| cs-chief | `/spfp-cs` | Recebe demandas, distribui, acompanha, garante resultado |
| onboarding-specialist | `:agents:onboarding-specialist` | welcome-client, setup-account, first-value, handoff |
| suporte | `:agents:suporte` | ticket-triage, resolve, escalate |
| cs-retencao | `:agents:cs-retencao` | health-check, engagement, upsell-detection, churn-prevention |

**Workflow:** `customer-journey.md`

---

### 4. spfp-products
**Localização:** `squads/spfp-products/`
**Skill:** `/spfp-products`
**AI Head:** Marty Cagan (clone, `outputs/minds/marty-cagan/`)

| Agente | Skill | Tasks |
|--------|-------|-------|
| products-chief | `/spfp-products` | Define roadmap, prioriza backlog, valida qualidade |
| product-manager | `:agents:product-manager` | discovery, roadmap, spec, launch-coordination |
| content-creator | `:agents:content-creator` | research, create, review, publish-content |
| qa-experience | `:agents:qa-experience` | quality-check, test, feedback-loop, report-quality |

**Workflow:** `product-creation.md`
```
PM (Discovery→Roadmap→Spec) → QG1 → Creator (Research→Create) → QG2 → QA → QG3 → Publish → Launch → Feedback Loop
```

---

### 5. spfp-ops
**Localização:** `squads/spfp-ops/`
**Skill:** `/spfp-ops`
**AI Head:** Pedro Valerio (clone, `outputs/minds/pedro-valerio/`, score 90/100)

| Agente | Skill | Tasks |
|--------|-------|-------|
| ops-chief | `/spfp-ops` | Recebe demandas, distribui, conduz Quality Gates |
| process-mapper | `:agents:process-mapper` | discovery-process, create-process |
| architect | `:agents:architect` | design-architecture, design-executors, create-task-defs |
| automation-architect | `:agents:automation-architect` | design-workflow |
| qa | `:agents:qa` | design-qa-gates, execute-checklist |

**Workflow:** `build-process.md`
```
Process Mapper → QG1 → Architect → QG2 → Automation Architect → QG3 → QA → QG4 FINAL → ENTREGA
(Score >70% para avançar em cada gate — abaixo disso, volta ao ponto definido)
```

**Analogia:** Ops = arquiteto da casa. Os outros squads = pedreiros, encanadores, eletricistas.

---

## Clones IA Gerados (MMOS Mind Mapper)

Todos em `outputs/minds/{slug}/`:

| Clone | Domínio | Score | System Prompt |
|-------|---------|-------|---------------|
| Alex Hormozi | Ofertas, monetização, crescimento | 94/100 | `alex-hormozi/system_prompts/alex-hormozi-clone.md` |
| Steve Jobs | Produto, design, visão | 96/100 | `steve-jobs/system_prompts/steve-jobs-clone.md` |
| Thiago Finch | Performance marketing | — | `thiago-finch/system_prompts/thiago-finch-clone.md` |
| Lincoln Murphy | Customer Success | — | `lincoln-murphy/system_prompts/lincoln-murphy-clone.md` |
| Marty Cagan | Product Discovery | — | `marty-cagan/system_prompts/marty-cagan-clone.md` |
| Pedro Valerio | OPS, processos, automações | 90/100 | `pedro-valerio/system_prompts/pedro-valerio-clone.md` |

---

## Skill Files Criados

```
.claude/commands/
├── spfp-conselheiros.md
├── spfp-marketing.md
│   └── agents/
│       ├── social-media-manager.md
│       ├── media-buyer.md
│       ├── email-strategist.md
│       ├── content-manager.md
│       └── research-analyst.md
├── spfp-cs.md
│   └── agents/
│       ├── onboarding-specialist.md
│       ├── suporte.md
│       └── cs-retencao.md
├── spfp-products.md
│   └── agents/
│       ├── product-manager.md
│       ├── content-creator.md
│       └── qa-experience.md
└── spfp-ops.md
    └── agents/
        ├── process-mapper.md
        ├── architect.md
        ├── automation-architect.md
        └── qa.md
```

---

## Como Usar

### Ativar um squad completo
```
/spfp-conselheiros     → abre sessão de conselho estratégico
/spfp-marketing        → Thiago Finch como AI Head de Marketing
/spfp-cs               → Lincoln Murphy como AI Head de CS
/spfp-products         → Marty Cagan como AI Head de Products
/spfp-ops              → Pedro Valerio como AI Head de OPS
```

### Ativar um agente especializado diretamente
```
/spfp-marketing:agents:media-buyer
/spfp-cs:agents:onboarding-specialist
/spfp-products:agents:product-manager
/spfp-ops:agents:process-mapper
```

### Solicitar trabalho ao Squad OPS
Qualquer squad pode pedir ao OPS para construir ou melhorar um processo:
1. Acionar `/spfp-ops`
2. Descrever o processo a construir/melhorar
3. OPS Chief conduz o Build Process (4 fases + 4 Quality Gates)
4. Recebe o pacote documentado ao final

---

## Arquivos-chave por Squad

| Squad | squad.yaml | Chief | Workflow |
|-------|-----------|-------|---------|
| Conselheiros | `squads/spfp-conselheiros/squad.yaml` | `agents/conselheiro.md` | `tasks/sessao-conselho.md` |
| Marketing | `squads/spfp-marketing/squad.yaml` | `agents/marketing-chief.md` | `workflows/marketing-campaign.md` |
| CS | `squads/spfp-cs/squad.yaml` | `agents/cs-chief.md` | `workflows/customer-journey.md` |
| Products | `squads/spfp-products/squad.yaml` | `agents/products-chief.md` | `workflows/product-creation.md` |
| OPS | `squads/spfp-ops/squad.yaml` | `agents/ops-chief.md` | `workflows/build-process.md` |

---

## PDFs de Referência Utilizados

| PDF | Usado para |
|-----|-----------|
| `Squad OPS.pdf` | Estrutura de agentes e tasks do Squad OPS |
| `WORKFLOW BUILD PROCESS .pdf` | Workflow exato com Quality Gates do OPS |
| `WORKFLOW MARKETING CAMPAIGN.pdf` | Workflow exato do Squad Marketing |
| `WORKFLOW PRODUCT CREATION.pdf` | Workflow exato do Squad Products |

Todos em `D:\Projetos\Arquivos para projetos\`

---

## Próximos Passos Sugeridos

1. **Testar os squads** — Ativar cada `/spfp-{squad}` e validar que o clone carrega corretamente
2. **Squad Vendas** — Há PDFs disponíveis (`Squad Vendas.pdf`, `WORKFLOW SALES PIPELINE.pdf`)
3. **Squad Administração** — `Squad Administração.pdf` + `WORKFLOW ADMIN OPERATIONS.pdf` disponíveis
4. **Preencher `conselheiros-kb.md`** — Adicionar contexto real do negócio para os conselheiros
5. **Integrar OPS com outros squads** — Usar Build Process para formalizar os processos de cada squad

---

*Documentado por Orion (AIOS Master) — 2026-02-25*
