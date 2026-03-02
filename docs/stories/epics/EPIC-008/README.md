# EPIC-008 — Consultor IA v2

## Objetivo
Evoluir o módulo de Insights/Consultor IA com prompts rápidos sugeridos, contexto financeiro automático injetado no prompt e histórico de conversas navegável.

## Stories

| Story | Título | Status | Prioridade |
|-------|--------|--------|------------|
| 8.1 | Chips de prompts rápidos sugeridos | Pending | Alta |
| 8.2 | Contexto financeiro automático no prompt | Pending | Alta |
| 8.3 | Histórico de conversas navegável | Pending | Média |

## Dependências
- `src/components/Insights.tsx` — componente principal
- `src/services/aiService.ts` — integração Gemini
- `src/services/aiHistoryService.ts` — persistência de histórico
- `src/context/FinanceContext.tsx` — dados financeiros para contexto

## Resultado Esperado
- Chips de perguntas frequentes acima do input (ex: "Como está meu orçamento?", "Onde posso economizar?")
- Resumo do mês atual (receita, gasto, saldo, maior despesa) injetado automaticamente no prompt do Gemini
- Aba de histórico mostrando conversas anteriores com data e resumo, com opção de retomar
