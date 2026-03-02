# Guia de Uso do CRM Empresa para Agentes IA

Este guia explica como os agentes AIOS do SPFP podem criar e atualizar tasks no CRM Empresa diretamente via Supabase MCP — sem n8n, sem API externa.

## Configuração

Os agentes devem usar a **service_role key** do Supabase para ter permissão de escrita. A anon key só serve para leitura pública.

```
SUPABASE_URL=https://jqmlloimcgsfjhhbenzk.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
```

## Operações Disponíveis

### 1. Criar Task via RPC

Use a função `create_agent_task` para criar tasks com uma única chamada:

```sql
SELECT create_agent_task(
  p_board_id    := 'uuid-do-board',
  p_title       := 'Criar post sobre planejamento financeiro',
  p_assignee_id := 'agent-marketing',
  p_assignee_name := 'Thiago Finch',
  p_priority    := 'HIGH',
  p_description := 'Post para Instagram sobre dicas de economia',
  p_agent_id    := 'agent-marketing',
  p_agent_name  := 'Thiago Finch'
);
```

Ou via Supabase JS client (service_role):
```typescript
const { data, error } = await supabase.rpc('create_agent_task', {
  p_board_id: 'uuid-do-board',
  p_title: 'Criar post sobre planejamento financeiro',
  p_assignee_id: 'agent-marketing',
  p_assignee_name: 'Thiago Finch',
  p_priority: 'HIGH',
  p_agent_id: 'agent-marketing',
  p_agent_name: 'Thiago Finch',
});
```

### 2. Atualizar Status de Task

```typescript
await supabase.rpc('update_task_status', {
  p_task_id: 'uuid-da-task',
  p_new_status: 'IN_PROGRESS',
  p_agent_id: 'agent-marketing',
  p_agent_name: 'Thiago Finch',
  p_comment: 'Iniciando pesquisa de referências para o post',
});
```

Status válidos: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`

### 3. Buscar Tasks do Agente

```typescript
const { data: myTasks } = await supabase
  .from('company_tasks')
  .select('*')
  .eq('assignee_id', 'agent-marketing')
  .neq('status', 'DONE')
  .order('priority', { ascending: false });
```

### 4. Adicionar Comentário

```typescript
await supabase.from('task_comments').insert({
  task_id: 'uuid-da-task',
  author_id: 'agent-marketing',
  author_name: 'Thiago Finch',
  author_avatar: '🎯',
  content: 'Concluí a pesquisa. Referências salvas em `/outputs/referencias-post.md`',
});
```

### 5. Ver Dashboard por Agente

```typescript
const { data } = await supabase
  .from('agent_dashboard')
  .select('*')
  .eq('assignee_id', 'agent-marketing');
```

## IDs dos Agentes SPFP

| ID | Nome | Squad | Avatar |
|----|------|-------|--------|
| `agent-marketing` | Thiago Finch | Marketing | 🎯 |
| `agent-vendas` | Alex Hormozi | Vendas | 💰 |
| `agent-ops` | Pedro Valerio | OPS | ⚙️ |
| `agent-admin` | Sheryl Sandberg | Admin | 🏛️ |
| `agent-produtos` | Marty Cagan | Produtos | 📦 |
| `agent-cs` | Lincoln Murphy | CS | 💬 |

## Boas Práticas para Agentes

1. **Sempre logar ações**: Use `update_task_status` com `p_comment` para registrar o que foi feito
2. **Definir assignee**: Sempre atribuir tasks com o `assignee_id` do agente responsável
3. **Prioridade correta**: URGENT=bloqueante, HIGH=entrega esta semana, MEDIUM=sprint atual, LOW=backlog
4. **Comentários ricos**: Incluir outputs reais (resultados, links, análises) nos comentários de tasks
5. **Status em tempo real**: Atualizar status ao iniciar (`IN_PROGRESS`), concluir (`DONE`) ou bloquear (`REVIEW`)
