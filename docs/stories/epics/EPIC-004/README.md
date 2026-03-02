# EPIC-004 — Lançamentos v2

## Objetivo
Corrigir bug crítico na edição de transações parceladas/fixas mensais e adicionar funcionalidade de edição em lote para múltiplos lançamentos.

## Stories

| Story | Título | Status | Prioridade |
|-------|--------|--------|------------|
| 4.1 | BUG FIX: Edição de parcelado/fixo não exclui entrada original ao mover para mês seguinte | Pending | CRÍTICA |
| 4.2 | Edição em lote: alterar categoria, conta e cartão de múltiplos lançamentos | Pending | Alta |

## Dependências
- `FinanceContext.tsx` — funções de edição de transações
- `TransactionList.tsx` — UI de lançamentos
- `TransactionForm.tsx` — formulário de edição

## Resultado Esperado
- Bug corrigido: mover parcelado/fixo para mês seguinte exclui o original e cria o novo
- Usuário pode selecionar múltiplos lançamentos e alterar categoria, conta ou cartão em lote
