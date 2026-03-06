# SPFP Database Schema Documentation
> Brownfield Discovery — Fase 2 | @data-engineer (Dara) | 2026-03-05

---

## Overview

| Item | Detalhe |
|------|---------|
| **Projeto** | SPFP (Sistema de Planejamento Financeiro Pessoal) |
| **Backend** | Supabase PostgreSQL |
| **Última Atualização** | 2026-03-04 |
| **Extensões** | pgvector (para Finn RAG — preparado) |
| **Total de Tabelas** | 52+ |
| **Total de Views** | 8+ |
| **Total de Functions** | 12+ |
| **Migrations** | 18 arquivos |

---

## Índice

1. [Core Financial Schema](#1-core-financial-schema)
2. [Investment & Wealth Management](#2-investment--wealth-management)
3. [Business & Corporate](#3-business--corporate)
4. [Automation & AI](#4-automation--ai)
5. [Payment Integration](#5-payment-integration)
6. [CRM & Marketing](#6-crm--marketing)
7. [Company Management](#7-company-management)
8. [Revenue & Products](#8-revenue--products)
9. [Legacy Tables](#9-legacy-tables)
10. [Views & Analytics](#10-views--analytics)
11. [Functions & Procedures](#11-functions--procedures)
12. [Entity Relationship Diagram](#12-entity-relationship-diagram)
13. [Security & RLS](#13-security--rls)
14. [Indexes Summary](#14-indexes-summary)
15. [Migrations Timeline](#15-migrations-timeline)

---

## 1. Core Financial Schema

### Table: `accounts`
Contas financeiras pessoais (corrente, poupança, investimento, etc.)

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| id | UUID | PK | gen_random_uuid() |
| user_id | UUID | FK→auth.users CASCADE | — |
| name | VARCHAR(255) | NOT NULL | — |
| type | VARCHAR(50) | CHECK (checking\|savings\|credit\|investment\|other) | — |
| balance | DECIMAL(19,2) | CHECK >= 0 | 0 |
| currency | VARCHAR(3) | — | 'BRL' |
| color | VARCHAR(7) | — | — |
| icon | VARCHAR(100) | — | — |
| created_at | TIMESTAMP | — | NOW() |
| updated_at | TIMESTAMP | — | NOW() |
| deleted_at | TIMESTAMP | nullable | NULL |

**Indexes:** `idx_accounts_user_id`, `idx_accounts_deleted_at`, `idx_accounts_user_type (user_id, type) WHERE deleted_at IS NULL`

**RLS:** SELECT/INSERT/UPDATE/DELETE → auth.uid() = user_id

**Triggers:** `update_accounts_updated_at` (BEFORE UPDATE)

---

### Table: `categories`
Categorias de transações (receita/despesa)

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| id | UUID | PK | gen_random_uuid() |
| user_id | UUID | FK→auth.users CASCADE | — |
| name | VARCHAR(255) | NOT NULL | — |
| icon | VARCHAR(100) | — | — |
| type | VARCHAR(50) | CHECK (income\|expense\|mixed) | — |
| color | VARCHAR(7) | — | — |
| order_index | INT | — | 0 |
| created_at | TIMESTAMP | — | NOW() |
| updated_at | TIMESTAMP | — | NOW() |
| deleted_at | TIMESTAMP | nullable | NULL |

**Indexes:** `idx_categories_user_id`, `idx_categories_type`, `idx_categories_deleted_at`, `idx_categories_user_order (user_id, order_index ASC) WHERE deleted_at IS NULL`

**Constraints:** UNIQUE (user_id, LOWER(name))

**RLS:** auth.uid() = user_id

---

### Table: `transactions`
Transações financeiras (receitas/despesas)

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| id | UUID | PK | gen_random_uuid() |
| user_id | UUID | FK→auth.users CASCADE | — |
| account_id | UUID | FK→accounts RESTRICT | — |
| category_id | UUID | FK→categories RESTRICT | — |
| description | VARCHAR(500) | — | — |
| amount | DECIMAL(19,2) | NOT NULL, CHECK > 0 | — |
| type | VARCHAR(50) | CHECK (INCOME\|EXPENSE) | — |
| date | DATE | NOT NULL | — |
| paid | BOOLEAN | — | false |
| group_id | UUID | FK→transaction_groups SET NULL | — |
| group_index | INT | — | — |
| spender | VARCHAR(50) | — | — |
| notes | TEXT | — | — |
| created_at | TIMESTAMP | — | NOW() |
| updated_at | TIMESTAMP | — | NOW() |
| deleted_at | TIMESTAMP | nullable | NULL |

**Indexes:** `idx_transactions_user_id`, `idx_transactions_account_id`, `idx_transactions_category_id`, `idx_transactions_date (date DESC)`, `idx_transactions_paid`, `idx_transactions_group_id`, `idx_transactions_deleted_at`, `idx_transactions_composite (user_id, date DESC, deleted_at)`, `idx_transactions_user_date_paid (user_id, date DESC, paid) WHERE deleted_at IS NULL`

**RLS:** auth.uid() = user_id

---

### Table: `transaction_groups`
Grupos de transações recorrentes ou parceladas

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| id | UUID | PK | gen_random_uuid() |
| user_id | UUID | FK→auth.users CASCADE | — |
| name | VARCHAR(255) | NOT NULL | — |
| type | VARCHAR(50) | CHECK (recurring\|installment\|other) | — |
| frequency | VARCHAR(50) | — | — |
| created_at | TIMESTAMP | — | NOW() |
| deleted_at | TIMESTAMP | nullable | NULL |

**Indexes:** `idx_transaction_groups_user_id`

**RLS:** auth.uid() = user_id

---

### Table: `goals`
Metas financeiras

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| id | UUID | PK | gen_random_uuid() |
| user_id | UUID | FK→auth.users CASCADE | — |
| name | VARCHAR(255) | NOT NULL | — |
| description | TEXT | — | — |
| target_amount | DECIMAL(19,2) | NOT NULL, CHECK > 0 | — |
| current_amount | DECIMAL(19,2) | CHECK >= 0 | 0 |
| deadline | DATE | — | — |
| category | VARCHAR(100) | — | — |
| priority | VARCHAR(50) | — | — |
| created_at | TIMESTAMP | — | NOW() |
| updated_at | TIMESTAMP | — | NOW() |
| deleted_at | TIMESTAMP | nullable | NULL |

**Indexes:** `idx_goals_user_id`, `idx_goals_deadline`, `idx_goals_user_deadline (user_id, deadline) WHERE deleted_at IS NULL`

**RLS:** auth.uid() = user_id

---

### Table: `category_budgets`
Limites mensais de gastos por categoria

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| id | UUID | PK | gen_random_uuid() |
| user_id | UUID | FK→auth.users CASCADE | — |
| category_id | UUID | FK→categories CASCADE | — |
| monthly_limit | DECIMAL(19,2) | NOT NULL | — |
| alert_threshold | DECIMAL(3,2) | — | 0.8 |
| created_at | TIMESTAMP | — | NOW() |
| updated_at | TIMESTAMP | — | NOW() |
| deleted_at | TIMESTAMP | nullable | NULL |

**Indexes:** `idx_category_budgets_user_id`, `idx_category_budgets_category_id`

**RLS:** auth.uid() = user_id

---

## 2. Investment & Wealth Management

### Table: `investments`
Portfolio de investimentos

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| id | UUID | PK | — |
| user_id | UUID | FK→auth.users | — |
| name | VARCHAR(255) | NOT NULL | — |
| ticker | VARCHAR(20) | — | — |
| type | VARCHAR(50) | CHECK (tesouro\|cdb\|lci\|lca\|renda_fixa\|acao\|stock\|reit\|fii\|etf\|fundo) | — |
| quantity | DECIMAL(18,8) | NOT NULL | — |
| average_price | DECIMAL(18,2) | NOT NULL | — |
| current_price | DECIMAL(18,2) | — | — |
| currency | VARCHAR(3) | — | 'BRL' |
| institution | VARCHAR(255) | — | — |
| rate | DECIMAL(8,4) | — | — |
| rate_type | VARCHAR(20) | CHECK (pre\|pos_cdi\|ipca) | — |
| maturity_date | DATE | — | — |
| liquidity | VARCHAR(20) | CHECK (D+0\|D+1\|D+30\|D+60\|D+90\|maturity) | — |
| goal_id | UUID | FK→goals SET NULL | — |
| is_retirement | BOOLEAN | — | FALSE |
| notes | TEXT | — | — |
| created_at | TIMESTAMPTZ | — | NOW() |
| updated_at | TIMESTAMPTZ | — | NOW() |

**Indexes:** `idx_investments_user_id`, `idx_investments_type`, `idx_investments_goal_id`, `idx_investments_is_retirement`

**RLS:** auth.uid() = user_id

---

### Table: `retirement_settings`
Parâmetros de planejamento de aposentadoria

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| user_id | UUID | FK→auth.users, UNIQUE | — |
| current_age | INT | CHECK (18-80) | 30 |
| retirement_age | INT | CHECK (30-100) | 65 |
| life_expectancy | INT | CHECK (60-120) | 100 |
| annual_return_rate | DECIMAL(5,2) | CHECK (0-50) | 8.0 |
| inflation_rate | DECIMAL(5,2) | CHECK (0-30) | 4.5 |
| monthly_contribution | DECIMAL(18,2) | — | 0 |
| desired_monthly_income | DECIMAL(18,2) | — | 0 |
| current_patrimony | DECIMAL(18,2) | — | 0 |

**RLS:** auth.uid() = user_id

---

### Table: `patrimony_items`
Ativos de patrimônio (imóveis, veículos, arte)

| Coluna | Tipo | Constraint |
|--------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK→auth.users CASCADE |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | — |
| type | VARCHAR(100) | — |
| value | DECIMAL(19,2) | NOT NULL |
| acquisition_date | DATE | — |
| acquisition_value | DECIMAL(19,2) | — |
| currency | VARCHAR(3) | DEFAULT 'BRL' |
| created_at | TIMESTAMP | — |
| updated_at | TIMESTAMP | — |
| deleted_at | TIMESTAMP | nullable |

**RLS:** auth.uid() = user_id

---

### Table: `partners_v2`
Parceiros de negócios para revenue sharing

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| id | UUID | PK | — |
| user_id | UUID | FK→auth.users | — |
| name | VARCHAR(255) | NOT NULL | — |
| email | VARCHAR(255) | — | — |
| phone | VARCHAR(50) | — | — |
| default_commission_rate | DECIMAL(5,2) | CHECK (0-100) | 50.0 |
| notes | TEXT | — | — |
| is_active | BOOLEAN | — | TRUE |
| created_at | TIMESTAMPTZ | — | — |
| updated_at | TIMESTAMPTZ | — | — |

**Indexes:** `idx_partners_v2_user_id`, `idx_partners_v2_is_active`

**RLS:** auth.uid() = user_id

---

### Table: `partnership_clients`
Clientes adquiridos via parceiros

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| id | UUID | PK | — |
| user_id | UUID | FK→auth.users | — |
| partner_id | UUID | FK→partners_v2 | — |
| client_name | VARCHAR(255) | NOT NULL | — |
| contract_value | DECIMAL(18,2) | NOT NULL, CHECK >= 0 | — |
| commission_rate | DECIMAL(5,2) | CHECK (0-100) | 50.0 |
| total_commission | DECIMAL(18,2) | GENERATED STORED | contract_value * commission_rate / 100 |
| my_share | DECIMAL(18,2) | GENERATED STORED | 50% split |
| partner_share | DECIMAL(18,2) | GENERATED STORED | 50% split |
| status | VARCHAR(20) | CHECK (pending\|paid\|cancelled) | — |
| closed_at | DATE | — | — |
| paid_at | TIMESTAMPTZ | — | — |
| notes | TEXT | — | — |

**Indexes:** `idx_partnership_clients_user_id`, `idx_partnership_clients_partner_id`, `idx_partnership_clients_status`, `idx_partnership_clients_closed_at`, `idx_partnership_clients_closed (user_id, closed_at) WHERE status = 'paid'`

**RLS:** auth.uid() = user_id

---

## 3. Business & Corporate

### Table: `corporate_activities`
Pipeline feed para automação corporativa

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| id | UUID | PK | — |
| user_id | UUID | FK→auth.users | — |
| department | VARCHAR(20) | CHECK (financeiro\|marketing\|operacional\|comercial) | — |
| agent_name | VARCHAR(100) | — | — |
| description | TEXT | — | — |
| status | VARCHAR(20) | CHECK (running\|idle\|waiting\|completed\|error) | 'running' |
| requires_approval | BOOLEAN | — | FALSE |
| approved_at | TIMESTAMPTZ | — | — |
| approved_by | UUID | FK→auth.users | — |
| metadata | JSONB | — | — |
| created_at | TIMESTAMPTZ | — | — |

**Indexes:** `idx_corporate_activities_user_id`, `idx_corporate_activities_department`, `idx_corporate_activities_status`, `idx_corporate_activities_created_at (DESC)`, `idx_corporate_activities_realtime (user_id, created_at DESC, status) WHERE deleted_at IS NULL`, `idx_corporate_activities_approval (user_id, status) WHERE requires_approval = true AND approved_at IS NULL`

**RLS:** Service role full access + users manage own activities

---

### Table: `operational_tasks`
Tarefas Kanban (todo, in_progress, done)

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| id | UUID | PK | — |
| user_id | UUID | FK→auth.users | — |
| title | VARCHAR(255) | NOT NULL | — |
| description | TEXT | — | — |
| status | VARCHAR(20) | CHECK (todo\|in_progress\|done) | 'todo' |
| priority | VARCHAR(10) | CHECK (low\|medium\|high) | 'medium' |
| assignee | VARCHAR(100) | — | — |
| due_date | DATE | — | — |
| completed_at | TIMESTAMPTZ | — | — |
| position | INT | — | 0 |
| tags | TEXT[] | — | '{}' |
| created_at | TIMESTAMPTZ | — | — |
| updated_at | TIMESTAMPTZ | — | — |
| deleted_at | TIMESTAMPTZ | nullable | — |

**Indexes:** `idx_operational_tasks_kanban (user_id, status, position DESC) WHERE deleted_at IS NULL`, `idx_operational_tasks_due_dates (user_id, due_date) WHERE status != 'done' AND deleted_at IS NULL`

**RLS:** auth.uid() = user_id

---

### Table: `sales_leads`
Pipeline de vendas (prospecting → closed_won/closed_lost)

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| id | UUID | PK | — |
| user_id | UUID | FK→auth.users | — |
| name | VARCHAR(255) | NOT NULL | — |
| company | VARCHAR(255) | — | — |
| email | VARCHAR(255) | — | — |
| phone | VARCHAR(50) | — | — |
| stage | VARCHAR(20) | CHECK (prospecting\|qualification\|proposal\|negotiation\|closed_won\|closed_lost) | 'prospecting' |
| value | DECIMAL(18,2) | CHECK >= 0 | 0 |
| probability | INT | CHECK (0-100) | 0 |
| source | VARCHAR(100) | — | — |
| notes | TEXT | — | — |
| next_action | TEXT | — | — |
| next_action_date | DATE | — | — |
| position | INT | — | 0 |
| lost_reason | TEXT | — | — |
| created_at | TIMESTAMPTZ | — | — |
| updated_at | TIMESTAMPTZ | — | — |
| closed_at | TIMESTAMPTZ | — | — |
| deleted_at | TIMESTAMPTZ | nullable | — |

**Indexes:** `idx_sales_leads_analysis (user_id, stage, probability DESC) WHERE deleted_at IS NULL`, `idx_sales_leads_value_analysis (user_id, value DESC) WHERE stage NOT IN ('closed_won', 'closed_lost') AND deleted_at IS NULL`

---

### Table: `sales_goals`
Metas mensais de vendas

| Coluna | Tipo | Constraint |
|--------|------|-----------|
| user_id | UUID | FK→auth.users |
| month | DATE | NOT NULL |
| target_value | DECIMAL(18,2) | NOT NULL, CHECK >= 0 |

**Constraints:** UNIQUE (user_id, month)

---

## 4. Automation & AI

### Table: `automation_logs`
Registro de ações de automação

| Coluna | Tipo | Constraint |
|--------|------|-----------|
| action_type | VARCHAR(50) | CHECK (screenshot\|navigate\|click\|fill\|select\|scroll) |
| status | VARCHAR(20) | CHECK (pending\|running\|success\|error) |
| duration_ms | INT | — |

**Retenção:** Logs > 90 dias limpos por `cleanup_old_automation_logs()`

---

### Table: `automation_permissions`
Configurações de automação por usuário

**Segurança:** `blocked_domains` inclui `*.bank.*`, `*.gov.*`, `login.*` por padrão

---

### Table: `ai_history`
Histórico de conversas com Finn

| Coluna | Tipo | Constraint |
|--------|------|-----------|
| user_id | UUID | FK→auth.users |
| prompt | TEXT | NOT NULL |
| response | TEXT | NOT NULL |
| metadata | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | — |

**Indexes:** `idx_ai_history_user_created (user_id, created_at DESC)`

**RLS:** Users podem ler/deletar próprio histórico

**Futuro:** RAG via pgvector embeddings

---

### Table: `finn_usage`
Rate limiting de mensagens Finn por mês/plano

| Coluna | Tipo | Constraint | Padrão |
|--------|------|-----------|--------|
| user_id | UUID | FK→auth.users | — |
| month | TEXT | — | 'YYYY-MM' |
| message_count | INT | — | 0 |

**Constraints:** UNIQUE (user_id, month)

**Rate Limits:**
| Plano | Msgs/Mês |
|-------|---------|
| Essencial | 10 |
| Wealth Mentor | 15 |

**RLS:** Service role full access (Edge Functions) + users own usage

---

## 5. Payment Integration

### Table: `stripe_sessions`
Sessões de checkout Stripe

| Coluna | Tipo | Constraint |
|--------|------|-----------|
| session_id | TEXT | UNIQUE, NOT NULL |
| price_id | TEXT | NOT NULL |
| status | TEXT | DEFAULT 'open' |
| amount | INT | — (centavos) |
| plan_type | TEXT | parcelado\|mensal |

---

### Table: `stripe_subscriptions`
Assinaturas recorrentes ativas

| Coluna | Tipo |
|--------|------|
| subscription_id | TEXT UNIQUE |
| customer_id | TEXT |
| price_id | TEXT |
| status | active\|past_due\|cancelled |

---

### Table: `user_access`
Controle de acesso por plano

| Coluna | Tipo | Padrão |
|--------|------|--------|
| user_id | UUID | UNIQUE |
| plan | INT | 99 (Essencial) \| 349 (Wealth) |
| plan_type | TEXT | parcelado\|mensal |
| expires_at | TIMESTAMP | NULL = recorrente |
| is_active | BOOLEAN | TRUE |

---

### Table: `stripe_audit_log`
Audit trail para transações Stripe via triggers:
- `stripe_sessions_audit`
- `stripe_subscriptions_audit`
- `user_access_audit`

---

## 6. CRM & Marketing

### Table: `sent_atas`
Documentos enviados (atas de reunião, resumos de investimento)

| Coluna | Tipo | Constraint |
|--------|------|-----------|
| client_id | UUID | **SEM FK** ⚠️ |
| type | VARCHAR(20) | CHECK (reuniao\|investimentos) |
| channel | VARCHAR(20) | CHECK (email\|whatsapp) |

**Issue:** `client_id` sem FK — ver DB-AUDIT.md Issue #1

---

### Table: `marketing_posts`
Posts de redes sociais

| Status | Plataformas |
|--------|------------|
| draft\|pending\|approved\|posted\|rejected | instagram\|linkedin\|tiktok\|youtube\|twitter\|facebook\|other |

---

### Table: `marketing_content`
Hub de conteúdo multi-plataforma

| Coluna | Tipo |
|--------|------|
| platform | TEXT[] — ['meta', 'youtube', 'tiktok'] |
| status | draft\|ready\|scheduled\|publishing\|published\|failed |
| created_by_agent | TEXT |

**RLS:** Users + Service role (para agentes)

---

### Table: `social_credentials`
Tokens de API de plataformas sociais (criptografados)

| Coluna | Tipo |
|--------|------|
| platform | meta\|youtube\|tiktok |
| access_token | TEXT (Encrypted) |
| refresh_token | TEXT (Encrypted) |

**Constraints:** UNIQUE (user_id, platform)

---

## 7. Company Management

### Table: `company_squads`
Espaços de equipe (como ClickUp Spaces)

### Table: `company_boards`
Listas dentro dos squads (como ClickUp Lists)

Colunas adicionadas em `20260303_company_boards_add_columns.sql`: `icon`, `color`

### Table: `company_tasks`
Tarefas individuais com Kanban

| Status | Prioridade |
|--------|-----------|
| TODO\|IN_PROGRESS\|REVIEW\|DONE | LOW\|MEDIUM\|HIGH\|URGENT |

**Issue:** `assignee_id` sem validação de membership no squad — ver DB-AUDIT.md Issue #2

### Table: `company_members`
Membros de squads (humanos + AI agents)

| Coluna | Tipo |
|--------|------|
| is_ai_agent | BOOLEAN |

**Constraints:** UNIQUE (user_id, squad_id)

### Table: `task_comments`
Comentários em tasks (humanos e agentes)

### Table: `task_activity_log`
Audit trail de mudanças em tasks

| action_type | Valores |
|-------------|--------|
| — | created\|status_changed\|commented\|assigned\|completed |

**RLS:** Service role full access para agentes

---

## 8. Revenue & Products

### Table: `company_revenue`
Registros de vendas (webhooks Stripe/Hotmart)

| Coluna | Tipo |
|--------|------|
| source | stripe\|hotmart |
| status | paid\|refunded\|cancelled\|pending |
| external_id | TEXT (Stripe/Hotmart ID) |

**Indexes:** `company_revenue_external_id_idx (user_id, source, external_id) UNIQUE WHERE external_id IS NOT NULL`

### Table: `company_products`
Catálogo de produtos das integrações

### Table: `webhook_logs`
Audit trail de webhooks recebidos

---

## 9. Legacy Tables

### Table: `leads`
Captura de leads da landing page

| Coluna | Tipo |
|--------|------|
| email | VARCHAR(100) UNIQUE |
| status | DEFAULT 'new' |

**RLS Especial:** Anonymous pode INSERT (captura sem login)

---

## 10. Views & Analytics

| View | Propósito |
|------|----------|
| `sales_pipeline_summary` | Métricas do pipeline por estágio |
| `partnership_summary_by_partner` | Receita por parceiro |
| `dashboard_metrics` | Snapshot diário de atividade financeira |
| `crm_health_check` | Métricas de engajamento CRM |
| `sales_health_check` | Saúde do pipeline de vendas |
| `operational_health_check` | Saúde de tarefas (todo/in_progress/done/overdue) |
| `marketing_health_check` | Saúde de campanhas (por status e plataforma) |
| `corporate_health_check` | Saúde de atividades corporativas |
| `agent_dashboard` | Dashboard de tarefas agrupado por agente |

---

## 11. Functions & Procedures

| Função | Propósito |
|--------|----------|
| `update_updated_at_column()` | Auto-update updated_at em BEFORE UPDATE |
| `soft_delete_user_data(user_id)` | Soft delete de dados do usuário |
| `restore_user_data(user_id)` | Restaura dados soft-deleted |
| `cleanup_old_automation_logs()` | Remove logs > 90 dias |
| `grant_user_access(user_id, plan, plan_type, expires_at)` | Concede/atualiza acesso ao plano |
| `user_has_access(user_id)` | BOOLEAN: usuário tem plano ativo? |
| `revoke_user_access(user_id)` | Revoga acesso |
| `create_agent_task(board_id, title, assignee_id, priority, ...)` | Cria task via agente (RPC) |
| `update_task_status(task_id, new_status, agent_id, comment)` | Atualiza status + loga atividade |
| `log_stripe_changes()` | Trigger de auditoria para tabelas Stripe |

---

## 12. Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase managed)
└────────┬────────┘
         │
         ├──► accounts ◄──────────────── transactions ◄─── categories
         │                                    │
         │                                    └──► transaction_groups
         │
         ├──► goals ◄────────────────── investments
         │
         ├──► retirement_settings
         │
         ├──► patrimony_items
         │
         ├──► partners_v2 ◄──────────── partnership_clients
         │
         ├──► category_budgets ────────► categories
         │
         ├──► company_squads ◄──────── company_boards ◄── company_tasks
         │         │                                           │
         │         └──► company_members              task_comments
         │                                           task_activity_log
         │
         ├──► operational_tasks
         ├──► sales_leads
         ├──► sales_goals
         ├──► corporate_activities
         │
         ├──► marketing_posts
         ├──► marketing_content
         ├──► social_credentials
         ├──► user_files
         │
         ├──► sent_atas (client_id sem FK ⚠️)
         ├──► custom_templates
         │
         ├──► automation_logs
         ├──► automation_permissions ◄── automation_permissions_audit
         │
         ├──► ai_history
         ├──► finn_usage
         │
         ├──► stripe_sessions
         ├──► stripe_subscriptions
         ├──► user_access
         ├──► stripe_audit_log
         │
         ├──► company_revenue
         ├──► company_products
         └──► webhook_logs
```

---

## 13. Security & RLS

### Padrão de RLS (todas as tabelas de dados)

```sql
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "{table}_select" ON {table_name}
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "{table}_insert" ON {table_name}
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "{table}_update" ON {table_name}
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "{table}_delete" ON {table_name}
  FOR DELETE USING (auth.uid() = user_id);
```

### Service Role (Edge Functions e agentes)

```sql
CREATE POLICY "{table}_service" ON {table_name}
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

Tabelas com service_role: `stripe_*`, `company_*`, `webhook_logs`, `marketing_content`, `social_credentials`, `automation_permissions_audit`

### Isolamento de Dados
- Cada usuário isolado via `auth.uid() = user_id`
- Impersonação admin via localStorage (não DB)
- RLS enforced na camada de banco

---

## 14. Indexes Summary

**Total:** 60+ indexes

| Categoria | Qtd | Status |
|-----------|-----|--------|
| User ID indexes | 37 | ✅ Completo |
| Composite indexes | 12 | ✅ Bom |
| Soft delete indexes | 8 | ✅ Bom |
| Unique indexes | 3 | ✅ Presente |
| Full text search | 0 | ⚠️ Ausente |
| Partial indexes | 8 | ✅ Bom |

---

## 15. Migrations Timeline

| Migration | Data | EPICs | Mudanças |
|-----------|------|-------|---------|
| 001_create_leads_table.sql | 2026-02-23 | Landing | leads + RLS |
| 001-add-rls-policies.sql | ~2026-02 | Core | RLS para user_data |
| 002-add-soft-delete.sql | ~2026-02 | Core | deleted_at + functions |
| 20250210_investments_portfolio.sql | 2025-02-10 | INVEST | investments, retirement_settings |
| 20250210_partnerships.sql | 2025-02-10 | PARTNER | partners_v2, views |
| 20250218_stripe_tables.sql | 2025-02-18 | PAYMENT | Stripe + user_access |
| 20260204_normalize_schema.sql | 2026-02-04 | NORM | Normalização 3NF (8 tabelas) |
| 20260214_spfp_2026_evolution.sql | 2026-02-14 | EPIC-001/002/003 | 13 tabelas novas (CRM, Corp, Automation) |
| 20260216_database_optimizations.sql | 2026-02-16 | EPIC-004 | 15+ indexes, soft delete, views |
| 20260302_ai_history.sql | 2026-03-02 | EPIC-005 | ai_history |
| 20260302_company_crm.sql | 2026-03-02 | EPIC-009 | company_squads/boards/tasks/members |
| 20260302_company_crm_agent_access.sql | 2026-03-02 | EPIC-010 | task_comments, RPCs para agentes |
| 20260302_company_revenue.sql | 2026-03-02 | EPIC-012 | company_revenue, products, webhooks |
| 20260302_marketing_hub.sql | 2026-03-02 | EPIC-011 | marketing_content, social_credentials |
| 20260303_company_boards_add_columns.sql | 2026-03-03 | EPIC-009 | icon, color em company_boards |
| 20260304_finn_usage.sql | 2026-03-04 | EPIC-013 | finn_usage rate limiting |
| COMBINED_SPFP_EVOLUTION_V2.sql | 2025-02-10 | COMBINE | Consolidação idempotente |

---

## 16. Limitações Conhecidas

1. **pgvector RAG não implementado** — DB pronto, UI pendente
2. **Real-time subscriptions incompletos** — FinanceContext não está ouvindo Supabase
3. **Soft delete não enforçado em RLS** — app deve filtrar `deleted_at IS NULL`
4. **Sem estratégia de particionamento** — tabelas grandes (transactions, logs) precisarão de RANGE
5. **Sem tabelas de archive** — registros soft-deleted ocupam espaço ativo
6. **Sem reconciliação de webhooks** — falhas em Stripe/Hotmart podem perder dados

---

> Produzido por @data-engineer (Dara) — Brownfield Discovery Fase 2
> 52+ tabelas | 60+ indexes | Score: 32/40 (80%)
