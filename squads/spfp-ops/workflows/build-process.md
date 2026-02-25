# Workflow: Build Process
# Squad OPS — SPFP

## Visão Geral

O Build Process é o workflow principal do Squad OPS. Transforma qualquer demanda
de processo em um sistema documentado, arquitetado, automatizado e validado.

**Analogia:** Ops = arquiteto da casa. Outros squads = pedreiros, encanadores, eletricistas.
O OPS desenha a planta. Os outros constroem seguindo ela.

---

## Fluxo Completo

```
INÍCIO: Demanda de processo de qualquer squad

═══════════════════════════════════════
PHASE 1 — PROCESS MAPPER
═══════════════════════════════════════

[1] discovery-process
    Input:  Pedido de mapeamento (squad via OPS Chief)
    Output: Documento do processo atual mapeado
    Agent:  process-mapper
    Tools:  Figma, Notion, Miro, Loom, Google Docs
    ↓

[2] create-process
    Input:  Documento de discovery
    Output: Fluxograma do processo novo
    Agent:  process-mapper
    Tools:  Figma, Notion, Miro
    ↓

╔═══════════════════════════════════╗
║   QUALITY GATE 1 — Score >70%?   ║
╠═══════════════════════════════════╣
║ YES → continua para ARCHITECT     ║
║ NO  → volta para discovery-process║
╚═══════════════════════════════════╝

═══════════════════════════════════════
PHASE 2 — ARCHITECT
═══════════════════════════════════════

[3] design-architecture
    Input:  Fluxograma aprovado no QG1
    Output: Estrutura definida (pastas, listas, campos, status)
    Agent:  architect
    Tools:  ClickUp, Notion, Google Drive, Sheets
    ↓

[4] design-executors
    Input:  Estrutura definida
    Output: Matriz de responsabilidades (quem faz o quê + SLAs)
    Agent:  architect
    Tools:  ClickUp, Notion, Sheets
    ↓

[5] create-task-defs
    Input:  Matriz de responsabilidades
    Output: Task definitions documentadas (input/output/critérios)
    Agent:  architect
    Tools:  ClickUp, Notion, Markdown
    ↓

╔═══════════════════════════════════╗
║   QUALITY GATE 2 — Score >70%?   ║
╠═══════════════════════════════════╣
║ YES → continua para AUTO ARCHITECT║
║ NO  → volta para design-architecture║
╚═══════════════════════════════════╝

═══════════════════════════════════════
PHASE 3 — AUTOMATION ARCHITECT
═══════════════════════════════════════

[6] design-workflow
    Input:  Task definitions aprovadas no QG2
    Output: Automações configuradas e testadas
    Agent:  automation-architect
    Tools:  ClickUp Automations, N8N, Webhooks, APIs
    ↓

╔══════════════════════════════════════╗
║  QUALITY GATE 3 FINAL — Score >70%? ║
╠══════════════════════════════════════╣
║ YES → continua para QA              ║
║ NO  → volta para create-task-defs   ║
╚══════════════════════════════════════╝

═══════════════════════════════════════
PHASE 4 — QA
═══════════════════════════════════════

[7] design-qa-gates
    Input:  Automações configuradas aprovadas no QG3
    Output: Critérios de qualidade + checklists de validação
    Agent:  qa
    Tools:  ClickUp, Notion, Sheets
    ↓

[8] execute-checklist
    Input:  Checklists definidos
    Output: Processo validado ou lista de correções
    Agent:  qa
    Tools:  ClickUp, Notion, Sheets
    ↓

╔══════════════════════════════════════╗
║  QUALITY GATE 4 FINAL — Score >70%? ║
╠══════════════════════════════════════╣
║ YES → ✅ ENTREGA ao squad solicitante║
║ NO  → volta para ponto falho         ║
╚══════════════════════════════════════╝

✅ ENTREGA
```

---

## Quality Gates

| Gate | Threshold | Aprovado → | Reprovado → |
|------|-----------|-----------|-------------|
| QG1 | >70% | Architect | volta Discovery |
| QG2 | >70% | Automation Architect | volta Architecture |
| QG3 | >70% | QA | volta Task Definitions |
| QG4 FINAL | >70% | ENTREGA | volta ponto falho |

---

## Como calcular o score dos gates

```
Score = (Itens aprovados / Total de itens) × 100

Exemplo: 8 de 10 itens aprovados = 80% → PASSA
         6 de 10 itens aprovados = 60% → REPROVA → volta
```

---

## Acionamento do workflow

Para iniciar o Build Process, qualquer squad deve contatar o OPS Chief com:
1. Nome do processo a construir/melhorar
2. Squad solicitante e responsável
3. Objetivo do processo (qual problema resolve)
4. Prazo esperado

O OPS Chief analisa, confirma o escopo e aciona o Process Mapper para iniciar.
