---
task-id: design-qa-gates
agent: qa
inputs:
  - name: automacoes-configuradas
    description: Workflow automatizado aprovado no QG3 (output do design-workflow)
outputs:
  - description: Critérios de qualidade definidos + checklists de validação prontos para execução
ferramentas:
  - ClickUp
  - Notion
  - Sheets
---

## O que faz

- Define os critérios de qualidade do processo
- Define objetivamente o que é >70% vs <70%
- Cria checklists de validação por etapa
- Define pontos de verificação no fluxo
- Define o que bloqueia o avanço em cada gate
- Define quem tem autoridade para aprovar cada gate

## Não faz

- Definir o processo (Process Mapper faz)
- Criar automações (Automation Architect faz)
- Executar as tasks do processo
- Corrigir problemas encontrados

## Ferramentas

- **Notion**: Checklists documentados
- **Sheets**: Matriz de critérios com pesos
- **ClickUp**: Gates configurados no fluxo

## Como definir critérios objetivos

Critério ruim (subjetivo): "O processo está bem documentado"
Critério bom (objetivo): "Cada etapa tem input, output e executor definidos"

Critério ruim: "A automação funciona"
Critério bom: "A automação foi testada com usuário sem conhecimento do processo e funcionou sem intervenção"

## Template de checklist de gate

```
QUALITY GATE [N] — [Nome]
Threshold: >70% dos itens aprovados

CHECKLIST:
[ ] Item 1 — Peso: [1-3]
[ ] Item 2 — Peso: [1-3]
[ ] Item 3 — Peso: [1-3]
...

Score = (Soma pesos aprovados / Soma pesos totais) × 100
Aprovador: [Papel com autoridade]
Ponto de retorno se reprovado: [Etapa]
```
