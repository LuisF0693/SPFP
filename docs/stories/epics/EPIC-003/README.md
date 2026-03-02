# EPIC-003 — Cartões de Crédito v2 + Parcelamentos

## Objetivo
Evoluir o módulo de cartões de crédito para suportar cartões virtuais com limite compartilhado, e melhorar drasticamente a visualização da aba Parcelamentos com status visuais, agrupamento por cartão, e visualização mensal/anual.

## Stories

| Story | Título | Status | Prioridade |
|-------|--------|--------|------------|
| 3.1 | Cartões virtuais com limite de crédito compartilhado | Pending | Alta |
| 3.2 | Parcelamentos: status visual (verde=pago, vermelho=atrasado) | Pending | Alta |
| 3.3 | Parcelamentos: sub-abas por cartão | Pending | Alta |
| 3.4 | Parcelamentos: visualização mensal e anual | Pending | Média |
| 3.5 | Parcelamentos: limite total do cartão como barra de meta | Pending | Média |

## Dependências
- Supabase schema de cartões (tabela `accounts` com tipo `credit_card`)
- Componente `Installments.tsx` existente
- Componente `CreditCardDisplay.tsx` existente

## Resultado Esperado
- Usuário pode criar cartões virtuais vinculados ao cartão físico com limite único
- Aba Parcelamentos mostra status colorido, agrupa por cartão e permite navegação mensal/anual
