# Exemplos de Uso do CRM por Squad

## Squad Marketing (Thiago Finch — 🎯)

```typescript
// Criar task de conteúdo
await supabase.rpc('create_agent_task', {
  p_board_id: '<board-conteudo-organico>',
  p_title: 'Post: 5 erros financeiros que impedem riqueza',
  p_assignee_id: 'agent-marketing',
  p_assignee_name: 'Thiago Finch',
  p_priority: 'HIGH',
  p_description: 'Carrossel para Instagram. Referência: pesquisa de objeções do mês.',
  p_agent_id: 'agent-marketing',
  p_agent_name: 'Thiago Finch',
});

// Reportar campanha concluída
await supabase.rpc('update_task_status', {
  p_task_id: '<task-id>',
  p_new_status: 'DONE',
  p_agent_id: 'agent-marketing',
  p_agent_name: 'Thiago Finch',
  p_comment: 'Campanha publicada. CPL: R$12,40. CTR: 3.2%. Relatório completo em /outputs/campanha-jan.pdf',
});
```

## Squad Vendas (Alex Hormozi — 💰)

```typescript
// Criar task de follow-up
await supabase.rpc('create_agent_task', {
  p_board_id: '<board-pipeline>',
  p_title: 'Follow-up: Lead João Silva (R$2.400/mês)',
  p_assignee_id: 'agent-vendas',
  p_assignee_name: 'Alex Hormozi',
  p_priority: 'URGENT',
  p_description: 'Lead qualificado. Interesse em plano anual. Fazer proposta personalizada.',
  p_agent_id: 'agent-vendas',
  p_agent_name: 'Alex Hormozi',
});
```

## Squad OPS (Pedro Valerio — ⚙️)

```typescript
// Criar task de processo
await supabase.rpc('create_agent_task', {
  p_board_id: '<board-processos>',
  p_title: 'Mapear processo de onboarding de novos clientes',
  p_assignee_id: 'agent-ops',
  p_assignee_name: 'Pedro Valerio',
  p_priority: 'MEDIUM',
  p_description: 'Do primeiro contato ao primeiro acesso no SPFP. Identificar gargalos.',
  p_agent_id: 'agent-ops',
  p_agent_name: 'Pedro Valerio',
});
```

## Squad CS (Lincoln Murphy — 💬)

```typescript
// Criar alerta de churn
await supabase.rpc('create_agent_task', {
  p_board_id: '<board-retencao>',
  p_title: 'ALERTA: Cliente Maria Costa — Risco Alto de Churn',
  p_assignee_id: 'agent-cs',
  p_assignee_name: 'Lincoln Murphy',
  p_priority: 'URGENT',
  p_description: 'Health score: 32. Último login: 15 dias atrás. Agendar check-in urgente.',
  p_agent_id: 'agent-cs',
  p_agent_name: 'Lincoln Murphy',
});
```

## Buscar Histórico de Atividade

```typescript
// Últimas 50 ações dos agentes no CRM
const { data: activities } = await supabase
  .from('task_activity_log')
  .select(`
    *,
    company_tasks (title, status, board_id)
  `)
  .order('created_at', { ascending: false })
  .limit(50);
```

## Dashboard Consolidado

```typescript
// Ver todas as tasks de todos os agentes
const { data: dashboard } = await supabase
  .from('agent_dashboard')
  .select('*')
  .order('assignee_name');

// Resultado:
// [
//   { assignee_id: 'agent-marketing', assignee_name: 'Thiago Finch', status: 'IN_PROGRESS', task_count: 3 },
//   { assignee_id: 'agent-vendas', assignee_name: 'Alex Hormozi', status: 'TODO', task_count: 7 },
//   ...
// ]
```
