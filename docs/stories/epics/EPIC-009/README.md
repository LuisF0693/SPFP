# EPIC-009 — CRM Empresa (Core)

## Objetivo
Criar um CRM interno da empresa SPFP estilo ClickUp diretamente dentro do SPFP, com navegação bidirecional com o CRM de Clientes. Squads, Boards e Tasks com Kanban visual. Agentes IA como membros responsáveis por tarefas.

## Visão Geral da Arquitetura

```
SPFP App
├── CRM Clientes (AdminCRM - existente)  ←→ aba bidirecional
└── CRM Empresa (novo - /empresa)
       ├── Squads (Marketing, Vendas, Ops, Admin...)
       │     └── Boards (projetos/listas dentro do squad)
       │           └── Tasks (cards com status, assignee, prioridade)
       │                 ├── Subtasks
       │                 ├── Comentários
       │                 └── Arquivos
       ├── Dashboard (visão geral de todos os squads)
       └── Membros (agentes IA + usuários humanos)
```

## Stories

| Story | Título | Status | Prioridade |
|-------|--------|--------|------------|
| 9.1 | Navegação bidirecional + layout base do CRM Empresa | Pending | Alta |
| 9.2 | Squads — espaços de trabalho com ícone e cor | Pending | Alta |
| 9.3 | Boards dentro de cada Squad | Pending | Alta |
| 9.4 | Tasks com Kanban visual (drag-and-drop) | Pending | Alta |
| 9.5 | Agentes como membros + assignee em tasks | Pending | Alta |

## Dependências
- `src/components/AdminCRM.tsx` — CRM de clientes (navegação bidirecional)
- `src/context/FinanceContext.tsx` ou novo `CompanyContext.tsx`
- Supabase: novas tabelas `squads`, `boards`, `tasks`, `task_comments`, `members`
- `src/types.ts` — novos tipos para CRM Empresa

## Resultado Esperado
- Seção "/empresa" dentro do SPFP com navegação integrada ao CRM de Clientes
- Squads configuráveis com nome, ícone e cor (ex: Marketing 🎯, Vendas 💰, Ops ⚙️)
- Boards dentro de cada Squad (ex: "Campanha Q1", "Pipeline Vendas")
- Kanban com colunas: Backlog → Em Andamento → Review → Concluído
- Drag-and-drop de cards entre colunas
- Agentes IA listados como membros, atribuíveis a tasks
