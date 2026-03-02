# EPIC-012 — Integrações Financeiras da Empresa

## Objetivo
Integrar Stripe e Hotmart ao CRM Empresa via webhooks → Supabase, exibindo vendas, receita e dados de produtos em tempo real no dashboard financeiro da empresa.

## Fluxo de Integração

```
Stripe / Hotmart
    ↓ webhook (evento de venda, pagamento, cancelamento)
Supabase Edge Function (receptor de webhook)
    ↓
Tabela `company_revenue` no Supabase
    ↓
Dashboard financeiro da empresa no CRM
    ↓
Agentes têm acesso aos dados de vendas via Supabase MCP
```

## Stories

| Story | Título | Status | Prioridade |
|-------|--------|--------|------------|
| 12.1 | Stripe webhook → Supabase (vendas em tempo real) | Pending | Alta |
| 12.2 | Hotmart webhook → Supabase (cursos e produtos digitais) | Pending | Alta |
| 12.3 | Revenue dashboard no CRM Empresa | Pending | Alta |

## Dependências
- EPIC-009 concluído (CRM Empresa Core)
- Stripe account + webhook secret
- Hotmart account + webhook credentials
- Supabase Edge Functions habilitadas
- Tabelas: `company_revenue`, `company_products`, `company_customers`

## Resultado Esperado
- Cada venda no Stripe aparece no CRM em tempo real (produto, valor, cliente, status)
- Cada venda no Hotmart (curso) aparece no CRM com dados do aluno
- Dashboard com: MRR, ARR, vendas do dia/mês, churn rate, produtos top
- Agentes de Vendas e CS têm acesso a esses dados via Supabase MCP
