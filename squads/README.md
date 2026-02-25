# SPFP Company Squads — AIOS

Estrutura organizacional da empresa SPFP implementada como squads AIOS.
Cada squad tem um AI Head clonado por IA via MMOS Mind Mapper, agentes
especializados, tasks detalhadas e workflows baseados em diagramas reais.

---

## Visão Geral

```
CEO (usuário)
│
├── 🏛️ spfp-conselheiros  — Alex Hormozi + Steve Jobs
│
├── 📣 spfp-marketing      — Thiago Finch (AI Head)
│   ├── Social Media Manager
│   ├── Media Buyer (Tráfego Pago)
│   ├── Email Strategist
│   ├── Content Manager (SEO)
│   └── Research Analyst
│
├── 💰 spfp-vendas         — Alex Hormozi (AI Head)
│   ├── SDR
│   ├── Closer
│   └── Analista de Vendas
│
├── 💚 spfp-cs             — Lincoln Murphy (AI Head)
│   ├── Onboarding Specialist
│   ├── Suporte N1/N2/N3
│   └── CS Retenção
│
├── 🚀 spfp-products       — Marty Cagan (AI Head)
│   ├── Product Manager
│   ├── Content Creator
│   └── QA Experience
│
├── 📋 spfp-admin          — Sheryl Sandberg (AI Head)
│   ├── Financeiro
│   ├── RH/People
│   ├── Jurídico
│   ├── Facilities
│   └── Compliance
│
└── ⚙️ spfp-ops            — Pedro Valerio (AI Head)
    ├── Process Mapper
    ├── Architect
    ├── Automation Architect
    └── QA
```

---

## Squads

### 🏛️ spfp-conselheiros
Mentores estratégicos externos. Aconselham o CEO em decisões importantes.
- **Skill:** `/spfp-conselheiros`
- **Personas:** Alex Hormozi (ofertas/monetização) | Steve Jobs (produto/visão)
- **Clones:** score 94 e 96/100

### 📣 spfp-marketing
Squad de marketing completo. Estratégia, conteúdo, tráfego pago e email.
- **Skill:** `/spfp-marketing`
- **AI Head:** Thiago Finch
- **Workflow:** Marketing Campaign (4 Quality Gates)

### 💚 spfp-cs
Customer Success. Onboarding, suporte e retenção de clientes.
- **Skill:** `/spfp-cs`
- **AI Head:** Lincoln Murphy
- **Workflow:** Customer Journey

### 🚀 spfp-products
Produto digital e infoprodutos. Discovery, criação e qualidade.
- **Skill:** `/spfp-products`
- **AI Head:** Marty Cagan
- **Workflow:** Product Creation (3 Quality Gates)

### 💰 spfp-vendas
Squad de Vendas consultivo. Pipeline MQL→SQL→Fechamento com Grand Slam Offer.
- **Skill:** `/spfp-vendas`
- **AI Head:** Alex Hormozi (clone 94/100)
- **Workflow:** Sales Pipeline (3 Quality Gates)
- **Agentes:** SDR, Closer, Analista de Vendas

### 📋 spfp-admin
Squad de Administração. Backoffice completo: Financeiro, RH, Jurídico, Facilities, Compliance.
- **Skill:** `/spfp-admin`
- **AI Head:** Sheryl Sandberg (clone MMOS 92/100 — COO Meta/Google)
- **Workflow:** Admin Operations (Triage → Executa → QG Aprovação → Entrega)
- **Agentes:** Financeiro, RH/People, Jurídico, Facilities, Compliance

### ⚙️ spfp-ops
Arquitetos de processos. Mapeamento, arquitetura ClickUp, automações e QA.
- **Skill:** `/spfp-ops`
- **AI Head:** Pedro Valerio
- **Workflow:** Build Process (4 Quality Gates)
- **Analogia:** "Ops = arquiteto da casa. Os outros squads = construtores."

---

## Como Usar

```bash
# Ativar squad completo (fala com o AI Head)
/spfp-marketing
/spfp-vendas
/spfp-cs
/spfp-products
/spfp-admin
/spfp-ops
/spfp-conselheiros

# Ativar agente específico
/spfp-marketing:agents:media-buyer
/spfp-vendas:agents:sdr
/spfp-vendas:agents:closer
/spfp-vendas:agents:analista-vendas
/spfp-cs:agents:onboarding-specialist
/spfp-products:agents:product-manager
/spfp-admin:agents:financeiro
/spfp-admin:agents:rh-people
/spfp-admin:agents:juridico
/spfp-admin:agents:facilities
/spfp-admin:agents:compliance
/spfp-ops:agents:process-mapper
```

---

## Clones IA (outputs/minds/)

| Clone | Squad | Score |
|-------|-------|-------|
| `alex-hormozi/` | Conselheiros | 94/100 |
| `steve-jobs/` | Conselheiros | 96/100 |
| `thiago-finch/` | Marketing | — |
| `lincoln-murphy/` | CS | — |
| `marty-cagan/` | Products | — |
| `pedro-valerio/` | OPS | 90/100 |
| `sheryl-sandberg/` | Admin | 92/100 |

---

## Squads Externos Integrados

| Squad | Localização | Função |
|-------|-----------|--------|
| clone-deploy | `squads/clone-deploy/` | Deploy de clones IA em plataformas |
| mmos-mind-mapper | `squads/mmos-mind-mapper/` | Upstream: gera os clones IA |

---

*Criado em 2026-02-25 | Ver handoff completo em `docs/sessions/2026-02/HANDOFF-2026-02-25-SPFP-SQUADS.md`*
