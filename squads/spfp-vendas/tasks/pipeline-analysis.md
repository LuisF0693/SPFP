# Task: Pipeline Analysis
**Agente:** Analista de Vendas
**Input:** Dados do CRM (pipeline atual)
**Output:** Gargalos identificados + taxas de conversão por etapa + recomendações

---

## Objetivo
Identificar onde o pipeline está travando e recomendar ações específicas de desbloqueio.

## Análise por Etapa

Para cada etapa do funil, calcular:
1. Volume de leads/deals
2. Taxa de conversão para próxima etapa
3. Tempo médio em cada etapa (velocity)
4. Deals parados há mais de X dias (flag de risco)

## Gargalo Detection

Um gargalo existe quando:
- Taxa de conversão cai > 20% abaixo da meta estabelecida
- Mais de 30% dos deals em uma etapa estão parados há > 5 dias
- Velocity aumenta > 50% em relação à semana anterior

## Output Esperado

```
ANÁLISE DE PIPELINE — [data]

FUNIL ATUAL
MQL recebidos: X
SQLs gerados: X (X% conversão — meta: 40%)
Calls agendadas: X (X% — meta: 60%)
Propostas enviadas: X (X% — meta: 70%)
Negociações ativas: X (X% — meta: 60%)
Vendas fechadas: X (X% — meta: 50%)

GARGALOS IDENTIFICADOS
1. [etapa] — taxa X% vs meta Y% — causa provável: [hipótese]
2. [etapa] — X deals parados há > 5 dias

DEALS EM RISCO
- [Deal A] — parado em [etapa] por [X dias] — ação sugerida: [ação]
- [Deal B] — parado em [etapa] por [X dias] — ação sugerida: [ação]

RECOMENDAÇÕES
1. [ação específica com agente responsável e prazo]
2. [ação específica com agente responsável e prazo]
```

## Critérios de Done
- [ ] Taxas de conversão calculadas para todas as etapas
- [ ] Gargalos identificados e priorizados
- [ ] Deals em risco listados com ação sugerida
- [ ] Relatório entregue ao Head de Vendas
