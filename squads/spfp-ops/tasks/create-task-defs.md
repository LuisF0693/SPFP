---
task-id: create-task-defs
agent: architect
inputs:
  - name: matriz-responsabilidades
    description: Matriz de responsabilidades com executores e SLAs (output do design-executors)
outputs:
  - description: Task definitions documentadas — contrato entre etapas com input, output e critérios
ferramentas:
  - ClickUp
  - Notion
  - Markdown
---

## O que faz

- Cria a definição completa de cada task do processo
- Define inputs e outputs de cada task
- Define critérios de aceite (como sabe que está pronto)
- Define dependências entre tasks
- Define o que bloqueia o avanço (veto conditions)
- Documenta exemplos concretos de "done"

## Não faz

- Criar automações (Automation Architect faz)
- Executar as tasks (quem opera o processo faz)
- Implementar no ClickUp (só documenta a especificação)

## Ferramentas

- **Notion**: Task definitions documentadas
- **ClickUp**: Templates de task
- **Markdown**: Formato de documentação

## Template de task definition

```markdown
## Task: [Nome da Task]

**Executor:** [Papel responsável]
**Input:** [O que chega e de onde vem]
**Output:** [O que sai e para onde vai]
**SLA:** [Prazo máximo]

### Critério de aceite
- [ ] Item 1 verificável
- [ ] Item 2 verificável
- [ ] Item 3 verificável

### Veto condition (o que bloqueia avançar)
- Condição A não atendida
- Condição B faltando

### Dependências
- Depende de: [Task anterior]
- Bloqueia: [Task seguinte]

### Exemplo de done
[Caso real ou hipotético de como fica quando está completo]
```

## Output esperado

Uma task definition para cada etapa do processo, no formato acima,
pronta para ser passada ao Automation Architect configurar os triggers.
