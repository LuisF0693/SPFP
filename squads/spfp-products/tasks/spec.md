---
task-id: spec
agent: product-manager
inputs:
  - name: item-priorizado
    description: Item priorizado do roadmap com problema e oportunidade validados
outputs:
  - description: Spec completa com requisitos + critérios de aceite + briefing para Content Creator
ferramentas: [Notion, ClickUp]
---

## O que faz
- Documenta requisitos completos do produto/conteúdo a ser criado
- Define critérios de aceite claros e testáveis (o que significa "pronto"?)
- Cria briefing detalhado para o Content Creator começar a criar
- Define o que está IN e OUT do escopo
- Inclui referências, exemplos e materiais de apoio para o Creator
- Apresenta spec ao Head de Products para aprovação (Quality Gate 1)

## Não faz
- Criar o produto (Content Creator cria)
- Definir como implementar (apenas o que precisa ser feito)
- Aprovar a própria spec (Head de Products aprova)

## Ferramentas
- Notion (spec document)
- ClickUp (tarefa com critérios)

## Template de Spec

```markdown
## Spec: [Nome do Produto/Conteúdo]

### Contexto
[Por que estamos criando isso? Qual problema resolve?]

### Objetivo
[O que queremos que o aluno/cliente consiga fazer após isso?]

### Escopo

**IN (O que será criado):**
- [Item 1]
- [Item 2]

**OUT (O que NÃO será criado nessa versão):**
- [Item X]

### Estrutura proposta
[Outline/índice do produto — módulos, aulas, seções]

### Critérios de aceite (QA vai validar isso)
- [ ] [Critério 1 — específico e mensurável]
- [ ] [Critério 2]
- [ ] [Critério 3]

### Referências e materiais de apoio
- [Link/referência 1]
- [Link/referência 2]

### Deadline proposta
- Content Creator entrega: [data]
- QA review: [data]
- Publicação: [data]
```

## QUALITY GATE 1: Spec aprovada?
- **NÃO** → Refinar spec (Head de Products aponta o que melhorar)
- **SIM** → Content Creator começa a criar
