# EPIC-006 — Objetivos v2

## Objetivo
Melhorar o módulo de Metas Financeiras com edição de metas existentes, suporte a imagem/foto como capa e gerenciamento do ciclo de vida (arquivar, concluir).

## Stories

| Story | Título | Status | Prioridade |
|-------|--------|--------|------------|
| 6.1 | Editar meta existente | Pending | Alta |
| 6.2 | Foto/imagem como capa da meta | Pending | Média |
| 6.3 | Arquivar e concluir metas | Pending | Média |

## Dependências
- `src/components/Goals.tsx` — componente principal de metas
- `src/context/FinanceContext.tsx` — estado global (goals)
- `src/types.ts` — interface `Goal`
- Supabase Storage — para upload de imagens (Story 6.2)

## Resultado Esperado
- Usuário pode editar nome, valor-alvo, prazo e ícone de metas já criadas
- Metas podem ter foto personalizada como capa
- Metas concluídas vão para aba "Concluídas" sem sumir do histórico
