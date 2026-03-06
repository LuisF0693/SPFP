# Clone Deploy Squad

**Version:** 1.0.0
**Author:** MMOS Team
**Slash Prefix:** `cloneDeploy`
**Compatibility:** AIOS-FULLSTACK v4+

---

## Overview

Full-stack squad for deploying mental clones with RAG pipelines to multiple channels. Takes minds processed by MMOS Mind Mapper and deploys them as production-ready chatbots powered by Supabase pgvector hybrid search, with persona fidelity scoring and real-time monitoring.

Pipeline: **Mind Ingestion -> RAG Setup -> Clone Engine -> Multi-Channel Deploy -> Monitoring**

---

## Architecture

```
                    clone-deploy-chief (Orchestrator)
                           |
              +------------+------------+
              |                         |
     Tier 0: Diagnosis          Tier 1: Execution
     clone-diagnostician        rag-architect
                                clone-builder
                                deploy-engineer
                                       |
                          +------------+------------+
                          |            |            |
                   Tier 3: Specialists
                   whatsapp-    telegram-    webapp-
                   specialist   specialist   specialist
```

---

## Agents (8 total)

| Agent | Role |
|-------|------|
| `clone-deploy-chief` | Squad orchestrator - routes requests and manages full pipeline |
| `clone-diagnostician` | Evaluates mind quality and readiness for deployment |
| `rag-architect` | Designs RAG pipeline - chunking, embeddings, hybrid search |
| `clone-builder` | Creates clone engine with system prompt and persona tuning |
| `deploy-engineer` | Handles Docker, EasyPanel, CI/CD, and multi-channel deployment |
| `whatsapp-specialist` | WhatsApp integration via UazAPI - webhooks, message handling |
| `telegram-specialist` | Telegram integration via Bot API - webhooks, commands |
| `webapp-specialist` | Web App integration - REST API, chat widget, frontend |

---

## Tasks (8 total)

| Task | Purpose |
|------|---------|
| `diagnose-mind` | Validate mind readiness and source quality for deployment |
| `ingest-mind` | Process sources and create RAG chunks in Supabase pgvector |
| `build-clone` | Create clone engine with system prompt and persona configuration |
| `deploy-whatsapp` | Deploy clone bot on WhatsApp via UazAPI |
| `deploy-telegram` | Deploy clone bot on Telegram via Bot API |
| `deploy-webapp` | Deploy clone as REST API with embeddable chat widget |
| `test-fidelity` | Run fidelity benchmark tests across 6 dimensions |
| `monitor-health` | Health check and conversation analytics monitoring |

---

## Workflows (3 total)

| Workflow | Purpose |
|----------|---------|
| `full-pipeline` | End-to-end from mind ingestion to deployed clone |
| `deploy-multi-channel` | Deploy existing clone to multiple channels in sequence |
| `clone-quality-check` | Validate clone fidelity and iterate on improvements |

---

## Checklists

| Checklist | Purpose |
|-----------|---------|
| `pre-deploy-checklist` | Validate all prerequisites before deployment |
| `fidelity-checklist` | Score clone fidelity across 6 dimensions |
| `production-readiness-checklist` | Final production validation before go-live |

---

## Quick Start

```bash
# Activate the squad orchestrator
@clone-deploy:clone-deploy-chief

# Run full pipeline
@clone-deploy:clone-deploy-chief *route "Deploy naval_ravikant to WhatsApp"

# Individual tasks
@clone-deploy:clone-diagnostician *diagnose naval_ravikant
@clone-deploy:rag-architect *ingest naval_ravikant
@clone-deploy:clone-builder *build naval_ravikant
@clone-deploy:deploy-engineer *deploy-whatsapp naval_ravikant

# Test fidelity
@clone-deploy:clone-builder *test-fidelity naval_ravikant

# Monitor health
@clone-deploy:deploy-engineer *monitor naval_ravikant
```

---

## Dependencies

| Dependency | Purpose | Required |
|------------|---------|----------|
| `mmos-mind-mapper` | Mind creation (cognitive architecture) | Yes |
| `etl-data-collector` | Source gathering and collection | Optional |
| Supabase | pgvector storage for RAG embeddings | Yes |
| UazAPI | WhatsApp channel integration | For WhatsApp |
| Telegram Bot API | Telegram channel integration | For Telegram |
| EasyPanel | Docker deployment and hosting | Yes |

---

## Environment Variables

```bash
# LLM
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
CLAUDE_MODEL=claude-sonnet-4-20250514

# Supabase (RAG storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Mind config
DEFAULT_MIND_SLUG=naval_ravikant

# WhatsApp (UazAPI)
UAZAPI_BASE_URL=https://your-instance.uazapi.com
UAZAPI_TOKEN=...
OWNER_PHONE=5511999999999

# Telegram
TELEGRAM_BOT_TOKEN=...
```

---

## Pack Structure

```
squads/clone-deploy/
├── agents/
│   ├── clone-deploy-chief.md
│   ├── clone-diagnostician.md
│   ├── rag-architect.md
│   ├── clone-builder.md
│   ├── deploy-engineer.md
│   ├── whatsapp-specialist.md
│   ├── telegram-specialist.md
│   └── webapp-specialist.md
├── tasks/
│   ├── diagnose-mind.md
│   ├── ingest-mind.md
│   ├── build-clone.md
│   ├── deploy-whatsapp.md
│   ├── deploy-telegram.md
│   ├── deploy-webapp.md
│   ├── test-fidelity.md
│   └── monitor-health.md
├── workflows/
│   ├── full-pipeline.md
│   ├── deploy-multi-channel.md
│   └── clone-quality-check.md
├── checklists/
│   ├── pre-deploy-checklist.md
│   ├── fidelity-checklist.md
│   └── production-readiness-checklist.md
├── templates/
│   ├── system-prompt-template.md
│   ├── env-template.md
│   └── dockerfile-template.md
├── data/
│   └── clone-deploy-kb.md
├── docs/
├── config.yaml
└── README.md
```
