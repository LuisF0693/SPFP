---
task-id: discovery
agent: product-manager
inputs:
  - name: oportunidade-ou-feedback
    description: Oportunidade identificada, feedback de Experiência (clientes/alunos), ou dado de analytics
outputs:
  - description: Ideia validada + necessidades mapeadas + decisão de avançar ou descartar
ferramentas: [Notion, entrevistas, Hotjar, Mixpanel]
---

## O que faz
- Identifica a oportunidade ou problema a resolver
- Pesquisa necessidades reais dos clientes (entrevistas, dados de uso)
- Valida se a ideia resolve um problema real ou é só suposição
- Analisa dados de engajamento e comportamento no produto
- Define se a oportunidade merece entrar no roadmap
- Documenta: problema, evidências, solução hipótese, próximos passos

## Não faz
- Criar o produto sem validar primeiro
- Escrever spec sem ter o problema bem definido
- Aprovar ideia baseado em opinião sem dados

## Ferramentas
- Notion (documentação)
- Hotjar / Mixpanel (dados de comportamento)
- Entrevistas com clientes (descoberta qualitativa)
- Google Analytics (dados quantitativos)

## Template de Discovery

```markdown
## Discovery — [Nome da Oportunidade]

### Problema identificado
[Descreva o problema que clientes/alunos estão tendo]

### Evidências
- [Dado quantitativo: ex. 40% dos usuários abandonam na tela X]
- [Dado qualitativo: ex. 3 entrevistas mostraram que...]
- [Feedback: ex. CS reportou que clientes pedem X com frequência]

### Hipótese de solução
[O que acreditamos que vai resolver esse problema]

### Perguntas a responder antes de construir
1. [Pergunta de validação 1]
2. [Pergunta de validação 2]

### Decisão
☐ Avançar para Roadmap
☐ Precisa de mais validação
☐ Descartar (motivo: X)
```
