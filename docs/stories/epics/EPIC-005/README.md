# EPIC-005 — Dados Isolados por Cliente + Metas Reais

## Objetivo
Garantir que dados sensíveis (aposentadoria, insights de IA) sejam isolados por cliente, e que as metas financeiras usem dados reais do mês atual em vez de médias calculadas.

## Stories

| Story | Título | Status | Prioridade |
|-------|--------|--------|------------|
| 5.1 | Aposentadoria: dados inputados salvos e isolados por cliente | Pending | Alta |
| 5.2 | Insights: histórico de insights salvo e isolado por cliente | Pending | Alta |
| 5.3 | Metas Financeiras: usar renda e gasto REAL do mês atual | Pending | Alta |

## Dependências
- `Retirement.tsx` — componente de aposentadoria
- `Insights.tsx` — componente de insights IA
- `Goals.tsx` — componente de metas financeiras
- `FinanceContext.tsx` — estado global e sync Supabase
- Supabase: tabelas para persistência dos dados por cliente

## Resultado Esperado
- Cada cliente tem seus dados de aposentadoria salvos e não visíveis para outros clientes
- Cada cliente tem seu histórico de insights IA salvo
- Metas financeiras mostram renda e gasto do mês atual (não média histórica)
