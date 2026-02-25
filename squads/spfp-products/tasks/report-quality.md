---
task-id: report-quality
agent: qa-experience
inputs:
  - name: metricas-qualidade
    description: Dados de qualidade do produto do período (NPS, taxa de conclusão, satisfação)
outputs:
  - description: Relatório de qualidade com métricas, tendências e recomendações
ferramentas: [Hotmart Analytics, Google Sheets, NPS tools]
---

## O que faz
- Coleta métricas de qualidade do produto no período
- Calcula: NPS, taxa de conclusão, satisfação por módulo, taxa de abandono
- Identifica tendências (melhorando ou piorando?)
- Compara com meta e com período anterior
- Gera relatório para Head de Products e PM

## Não faz
- Criar dashboard técnico automatizado (pede OPS)
- Tomar decisões de produto (QA reporta, PM e Head decidem)

## Ferramentas
- Hotmart Analytics (dados de acesso e conclusão)
- Google Sheets (consolidação)
- NPS tools (satisfação)

## Métricas de qualidade monitoradas

| Métrica | Meta SPFP | Frequência |
|---------|-----------|-----------|
| NPS do produto | > 50 | Mensal |
| Taxa de conclusão (curso) | > 60% | Mensal |
| Taxa de abandono na aula 1 | < 20% | Mensal |
| Satisfação geral (1-5) | > 4.2 | Mensal |
| Taxa de reembolso | < 5% | Mensal |

## Formato do relatório

```markdown
## Relatório de Qualidade — [Produto] — [Mês/Ano]

### NPS: [Score] ([trend vs. mês anterior])
### Taxa de conclusão: [%] ([trend])
### Satisfação geral: [X/5]

### Destaques positivos
- [O que está indo bem]

### Alertas
- [O que precisa de atenção]

### Recomendações para próxima versão
- [3 melhorias priorizadas]
```
