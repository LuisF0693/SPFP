---
task-id: design-executors
agent: architect
inputs:
  - name: estrutura-definida
    description: Documento de arquitetura ClickUp (output do design-architecture)
outputs:
  - description: Matriz de responsabilidades — quem faz o quê, SLAs e escalation paths
ferramentas:
  - ClickUp
  - Notion
  - Sheets
---

## O que faz

- Define quem executa cada etapa do processo
- Define responsabilidades claras por papel (não por pessoa)
- Define handoffs entre executores
- Define SLAs por etapa (prazo máximo aceitável)
- Define escalation path (quem acionar quando travar)
- Garante que ninguém acumula duas funções distintas

## Não faz

- Criar automações (Automation Architect faz)
- Executar tarefas do processo
- Mapear o processo (Process Mapper faz)

## Ferramentas

- **Notion**: Matriz de responsabilidades
- **Sheets**: Tabela de SLAs e escalation
- **ClickUp**: Atribuição de roles

## Matriz de responsabilidades — formato

| Etapa | Executor | Input recebido | Output entregue | SLA | Escalation |
|-------|----------|----------------|-----------------|-----|------------|
| [Nome] | [Papel] | [De onde vem] | [Para onde vai] | [X horas/dias] | [Quem acionar] |

## Regra de ouro

> Ninguém faz duas funções. Se uma pessoa está em duas colunas como executor,
> é sinal de que o processo precisa ser redesenhado.
