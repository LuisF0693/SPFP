---
task-id: feedback-loop
agent: qa-experience
inputs:
  - name: feedback-experiencia
    description: Feedback de clientes/alunos coletado após lançamento e uso do produto
outputs:
  - description: Feedback organizado por prioridade e impacto → entregue ao PM para decidir
ferramentas: [Google Forms, Typeform, Intercom, Notion]
---

## O que faz
- Coleta feedback de clientes/alunos sobre o produto (pesquisas, NPS, comentários)
- Organiza feedback por categoria (didática, conteúdo, técnico, experiência)
- Classifica por frequência (quantos alunos tiveram esse problema?)
- Classifica por impacto (quanto esse problema afeta o resultado do aluno?)
- Remove feedbacks únicos e subjetivos sem base para ação
- Apresenta para o PM com recomendação de prioridade

## Não faz
- Implementar mudanças com base no feedback (PM decide, Creator implementa)
- Ignorar feedbacks negativos repetidos
- Criar dashboard automatizado (pede OPS)

## Ferramentas
- Google Forms / Typeform (pesquisas de satisfação)
- Intercom (feedback espontâneo)
- Notion (organização e categorização)

## Ciclo de coleta de feedback

```
Semana 1 pós-lançamento: pesquisa de primeiros passos
Mês 1 completo: pesquisa de NPS + satisfação geral
Trimestral: review completo do produto com alunos ativos
```

## Template de organização de feedback

```markdown
## Feedback Loop — [Nome do Produto] — [Período]

### Resumo
- Total de respondentes: X
- NPS: X (Promotores: X%, Neutros: X%, Detratores: X%)
- Taxa de conclusão: X%

### Principais feedbacks positivos (manter)
1. [Feedback frequente 1] — X menções
2. [Feedback frequente 2] — X menções

### Principais problemas identificados (priorizado)
| Prioridade | Problema | Frequência | Impacto | Recomendação |
|-----------|---------|-----------|---------|-------------|
| Alta | [Problema 1] | X alunos | Alto | [Ação sugerida] |
| Média | [Problema 2] | X alunos | Médio | [Ação sugerida] |

### Próximo passo sugerido para o PM
[Recomendação direta de qual problema atacar primeiro]
```
