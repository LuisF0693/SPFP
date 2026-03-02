# EPIC-010 — Agentes IA Integrados ao CRM Empresa

## Objetivo
Permitir que os agentes AIOS (Claude Code) interajam diretamente com o CRM Empresa via Supabase MCP — criando tasks, atualizando status, adicionando comentários e outputs — sem necessidade de n8n ou automações externas.

## Visão do Fluxo

```
Agente AIOS (ex: @spfp-marketing)
    ↓
Supabase MCP (acesso direto às tabelas)
    ↓
Cria task no Board "Campanha Q1" → status "Em Andamento"
    ↓
Salva output (conteúdo criado) como comentário na task
    ↓
Atualiza status → "Review"
    ↓
Aparece no CRM Empresa em tempo real
```

## Stories

| Story | Título | Status | Prioridade |
|-------|--------|--------|------------|
| 10.1 | Schema Supabase otimizado para acesso de agentes | Pending | Alta |
| 10.2 | Agentes criam e atualizam tasks via Supabase MCP | Pending | Alta |
| 10.3 | Feed de atividade dos agentes no CRM | Pending | Média |

## Dependências
- EPIC-009 concluído (CRM Empresa Core)
- Supabase MCP configurado no projeto
- Tabelas: `tasks`, `task_comments`, `task_activity_log`
- Agentes AIOS: squads do SPFP (marketing, vendas, ops, admin, produtos, cs)

## Resultado Esperado
- Agentes podem criar tasks, atualizar status e adicionar comentários via Supabase MCP direto
- Feed de atividade mostra ações dos agentes em tempo real no CRM
- Cada agente tem identidade visual no CRM (avatar, nome, squad)
- Zero dependência de n8n — tudo via Claude Code + Supabase
