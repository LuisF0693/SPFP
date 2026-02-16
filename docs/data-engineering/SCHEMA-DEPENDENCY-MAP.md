# SCHEMA DEPENDENCY MAP
## SPFP Database 2026 - Visual Architecture

**Documento:** Schema Relationships e Dependencies
**Data:** 2026-02-16
**Versão:** 1.0

---

## 1. VISUAL SCHEMA DIAGRAM

### Core Relationship Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        auth.users (Supabase)                    │
│                     (Autenticação e Autorização)                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   ┌─────────────┐      ┌──────────────────┐
   │  Accounts   │      │  Categories      │
   │  (Contas)   │      │  (Categorias)    │
   │             │      │                  │
   │ - balance   │      │ - type (income/) │
   │ - type      │      │   expense/mixed  │
   └──────┬──────┘      └────────┬─────────┘
          │                      │
          │                      │
          └──────────┬───────────┘
                     │
                     ▼
            ┌──────────────────────┐
            │    Transactions      │
            │   (Transações)       │
            │                      │
            │ - amount             │
            │ - type (INCOME/EXP)  │
            │ - date               │
            │ - paid               │
            │ - group_id           │
            └──────────┬───────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │ Transaction Groups   │
            │ (Grupos de Trans)   │
            │                     │
            │ - type (recurring/) │
            │   installment       │
            └─────────────────────┘
```

---

## 2. FINANCIAL DOMAIN

### Assets & Investments

```
┌─────────────────────────────────────────┐
│          USER INVESTMENTS               │
│       (Carteira de Investimentos)       │
│                                         │
│ - asset_class (Acoes/FIIs/RF/etc)      │
│ - ticker                                │
│ - quantity                              │
│ - current_value                         │
│ - cost_basis                            │
└─────────────────────────────────────────┘
              │
              │ (Pode linkar com)
              │
       ┌──────▼───────┐
       │    Goals     │
       │   (Metas)    │
       │              │
       │ - deadline   │
       │ - target_amt │
       │ - current    │
       └──────────────┘
```

### Partnerships Revenue

```
┌──────────────────────────────┐
│      PARTNERS_V2             │
│   (Parceiros de Negócio)    │
│                              │
│ - name                       │
│ - default_commission_rate    │
│ - notes                      │
└──────────┬───────────────────┘
           │
           │ (1:N)
           │
           ▼
┌──────────────────────────────────┐
│   PARTNERSHIP_CLIENTS            │
│  (Clientes via Parcerias)       │
│                                  │
│ - client_name                    │
│ - contract_value                 │
│ - commission_rate                │
│ - total_commission (COMPUTED)    │
│ - my_share (COMPUTED)            │
│ - partner_share (COMPUTED)       │
│ - status (pending/paid/cancelled)│
└──────────────────────────────────┘

VIEWS:
├── partnership_summary_by_partner
└── partnership_monthly_revenue
```

---

## 3. CRM MODULE (EPIC-001)

### Atas System

```
┌─────────────────────────────┐
│      SENT_ATAS              │
│   (Atas Enviadas)           │
│                             │
│ - type: reuniao             │
│   investimentos             │
│ - channel: email, whatsapp  │
│ - recipient                 │
│ - content                   │
│ - sent_at (DESC for timeline)
└──────────┬──────────────────┘
           │
           │ (1:1 relationship)
           │
           ▼
┌──────────────────────────────┐
│   CUSTOM_TEMPLATES           │
│  (Templates Personalizados)  │
│                              │
│ - type: reuniao              │
│   investimentos              │
│ - name                       │
│ - content (rich text)        │
│ - is_default (UNIQUE)        │
└──────────────────────────────┘
```

### File Management

```
┌──────────────────────────────┐
│      USER_FILES              │
│   (Arquivos do Usuário)     │
│                              │
│ - name                       │
│ - category (investimentos/)  │
│   planejamento/educacional   │
│ - storage_path               │
│ - size_bytes (0-10MB)        │
│ - mime_type                  │
│ - is_favorite                │
│ - deleted_at (soft delete)   │
└──────────────────────────────┘
           │
           │ (Linked to)
           │
           ▼
    ┌──────────────────┐
    │ Supabase Storage │
    │  spfp-files      │
    │  bucket          │
    └──────────────────┘
```

---

## 4. CORPORATE HQ MODULE (EPIC-002)

### Department Activities Feed

```
┌────────────────────────────────────┐
│   CORPORATE_ACTIVITIES             │
│   (Feed de Atividades)             │
│                                    │
│ - department (financeiro/marketing │
│   operacional/comercial)           │
│ - agent_name                       │
│ - description                      │
│ - status (running/idle/waiting/    │
│           completed/error)         │
│ - requires_approval                │
│ - approved_at, approved_by         │
│ - metadata JSONB (contextual)      │
│ - created_at DESC (for realtime)   │
└────────────────────────────────────┘
        │    │    │    │
        │    │    │    └─ Department: COMERCIAL
        │    │    └────── Department: OPERACIONAL
        │    └─────────── Department: MARKETING
        └──────────────── Department: FINANCEIRO
```

### Sales Pipeline

```
┌──────────────────────────────┐     ┌───────────────────────┐
│      SALES_LEADS             │────▶│   SALES_GOALS         │
│    (Pipeline de Vendas)      │     │  (Metas Comerciais)   │
│                              │     │                       │
│ - name                       │     │ - month (DATE)        │
│ - company                    │     │ - target_value        │
│ - email, phone               │     │                       │
│ - stage (prospecting/        │     │ UNIQUE(user_id, month)│
│   qualification/proposal/    │     └───────────────────────┘
│   negotiation/closed_won/    │
│   closed_lost)               │
│ - value (DECIMAL, >= 0)      │
│ - probability (0-100%)       │
│ - position (for drag/drop)   │
│ - next_action_date           │
│ - deleted_at (soft delete)   │
└──────────────────────────────┘

VIEWS:
└── sales_pipeline_summary
```

### Task Management (Kanban)

```
┌──────────────────────────────┐
│   OPERATIONAL_TASKS          │
│    (Tarefas Operacionais)    │
│                              │
│ - status (todo/in_progress/  │
│   done)                      │
│ - priority (low/medium/high) │
│ - assignee (STRING)          │
│ - position (for Kanban order)│
│ - tags TEXT[]                │
│ - due_date                   │
│ - completed_at               │
│ - deleted_at (soft delete)   │
└──────────────────────────────┘

Layout Kanban (by position):
┌──────────┬──────────┬──────────┐
│   TODO   │  PROGRESS│   DONE   │
│ (sort by │ (sort by │(sort by  │
│ position)│ position)│ position)│
└──────────┴──────────┴──────────┘

VIEWS:
└── tasks_summary
```

### Marketing Calendar

```
┌──────────────────────────────┐
│    MARKETING_POSTS           │
│  (Posts de Marketing)        │
│                              │
│ - platform (instagram/       │
│   linkedin/tiktok/youtube/   │
│   twitter/facebook/other)    │
│ - status (draft/pending/     │
│   approved/posted/rejected)  │
│ - scheduled_date (for cal)   │
│ - posted_date                │
│ - image_url                  │
│ - metrics JSONB              │
│   {likes, comments, reach}   │
│ - rejection_reason           │
│ - deleted_at (soft delete)   │
└──────────────────────────────┘

VIEWS:
└── posts_by_platform
```

---

## 5. AUTOMATION MODULE (EPIC-003)

### Action Logging

```
┌──────────────────────────────┐
│    AUTOMATION_LOGS           │
│  (Log de Ações de IA)        │
│                              │
│ - action_type (screenshot/   │
│   navigate/click/fill/select)│
│ - target_url                 │
│ - selector (CSS)             │
│ - value (filled text)        │
│ - status (pending/running/   │
│   success/error)             │
│ - error_message              │
│ - screenshot_path            │
│ - duration_ms                │
│ - created_at DESC (timeline) │
│ - NO DELETE (immutable)      │
│ - NO UPDATE (immutable)      │
│ - Retention: 90 days         │
└──────────────────────────────┘
           │
           │ (Logs of actions from)
           │
           ▼
┌──────────────────────────────┐
│  AUTOMATION_PERMISSIONS      │
│  (Configurações de Segurança)│
│                              │
│ - enabled (DEFAULT false)    │
│ - require_confirmation       │
│ - allowed_domains TEXT[]     │
│ - blocked_domains TEXT[]     │
│   {*.bank.*, *.gov.*}        │
│ - max_actions_per_hour (100) │
│ - allow_navigation           │
│ - allow_clicks               │
│ - allow_typing               │
│ - UNIQUE(user_id)            │
└──────────────────────────────┘
           │
           │ (Audited by)
           │
           ▼
┌──────────────────────────────┐
│ AUTOMATION_PERMISSIONS_AUDIT │
│  (Auditoria de Mudanças)    │
│                              │
│ - changed_at                 │
│ - changed_by                 │
│ - change_type                │
│ - previous_value             │
│ - new_value                  │
└──────────────────────────────┘
```

---

## 6. CORE TABLES (Existing Infrastructure)

### Data Structure

```
auth.users (Supabase Auth)
    │
    └──▶ All tables have user_id FK
         ├── ON DELETE CASCADE
         └── RLS Policy: auth.uid() = user_id

accounts (tipos: checking/savings/credit/investment/other)
├── balance >= 0 CHECK
├── soft_delete: deleted_at
└── INDEX: (user_id, type) WHERE deleted_at IS NULL

categories (tipos: income/expense/mixed)
├── order_index (customizable order)
├── soft_delete: deleted_at
├── UNIQUE: (user_id, LOWER(name))
└── INDEX: (user_id, order_index) WHERE deleted_at IS NULL

transactions (core transactions)
├── account_id → accounts (RESTRICT)
├── category_id → categories (RESTRICT)
├── group_id → transaction_groups (SET NULL)
├── soft_delete: deleted_at
└── COMPOSITE INDEX: (user_id, date DESC, deleted_at)

transaction_groups (recurring/installment grouping)
├── soft_delete: NO (cleanup via cascading)
└── Cleanup: DELETE when no transactions reference it

goals (financial goals)
├── soft_delete: deleted_at
├── deadline DATE
└── INDEX: (user_id, deadline)

investments (asset portfolio)
├── asset_class VARCHAR
├── ticker VARCHAR
├── quantity, current_value, cost_basis
└── Computed: gain/loss, % return
```

---

## 7. DEPENDENCY HIERARCHY

### Level 0: Core (auth.users)
```
auth.users ← Supabase managed
```

### Level 1: Base Tables (directly reference users)
```
accounts, categories, transaction_groups, goals,
investments, partners_v2, sent_atas, custom_templates,
user_files, corporate_activities, marketing_posts,
operational_tasks, sales_leads, sales_goals,
automation_logs, automation_permissions
```

### Level 2: Dependent Tables (reference Level 1)
```
transactions ← accounts, categories, transaction_groups
partnership_clients ← partners_v2
```

### Level 3: Audit Tables (reference Level 2)
```
automation_permissions_audit ← automation_permissions
```

---

## 8. VIEWS DEPENDENCY TREE

### Analytics Views

```
Views (Input: Tables)
├── partnership_summary_by_partner
│   ├── partners_v2
│   └── partnership_clients
│
├── partnership_monthly_revenue
│   └── partnership_clients
│
├── sales_pipeline_summary
│   └── sales_leads
│
├── tasks_summary
│   └── operational_tasks
│
├── posts_by_platform
│   └── marketing_posts
│
├── dashboard_metrics
│   └── transactions
│
├── crm_health_check
│   └── sent_atas
│
├── corporate_health_check
│   └── corporate_activities
│
├── sales_health_check
│   └── sales_leads
│
├── operational_health_check
│   └── operational_tasks
│
└── marketing_health_check
    └── marketing_posts
```

---

## 9. INDEX STRATEGY

### Index Type Distribution

```
40% - Single Column (user_id filters)
│  ├── user_id
│  ├── deleted_at
│  ├── status
│  ├── type
│  └── platform

40% - Composite (multi-column optimization)
│  ├── (user_id, date DESC, deleted_at)
│  ├── (user_id, status, position DESC)
│  ├── (user_id, type, sent_at DESC)
│  ├── (user_id, created_at DESC, status)
│  └── (user_id, stage, probability DESC)

15% - Specialized (specific queries)
│  ├── (user_id, order_index ASC)
│  ├── (user_id, deadline)
│  └── (user_id, value DESC)

5% - Functional (generated/computed)
   └── Unique constraints
```

---

## 10. RLS POLICY MATRIX

### Policy Types Applied

| Tabela | SELECT | INSERT | UPDATE | DELETE | Notes |
|--------|--------|--------|--------|--------|-------|
| accounts | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| categories | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| transactions | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| goals | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| investments | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| partners_v2 | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| partnership_clients | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| sent_atas | ✅ | ✅ | ❌ | ✅ | Immutable (no update) |
| custom_templates | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| user_files | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| corporate_activities | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| marketing_posts | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| operational_tasks | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| sales_leads | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| sales_goals | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| automation_logs | ✅ | ✅ | ❌ | ❌ | Read-only (audit trail) |
| automation_permissions | ✅ | ✅ | ✅ | ✅ | Full CRUD |
| automation_permissions_audit | ✅ | ❌ | ❌ | ❌ | Read-only (audit) |

**Policy Formula:**
```sql
FOR SELECT USING (auth.uid() = user_id)
FOR INSERT WITH CHECK (auth.uid() = user_id)
FOR UPDATE USING (auth.uid() = user_id)    -- if applicable
FOR DELETE USING (auth.uid() = user_id)    -- if applicable
```

---

## 11. SOFT DELETE STRATEGY

### Soft Delete Implementation

```
Implementado (deleted_at TIMESTAMP):
├── accounts
├── categories
├── transactions
├── goals
├── investments
├── sent_atas (NOVO)
├── user_files (NOVO)
├── operational_tasks (NOVO)
└── sales_leads (NOVO)

NÃO Implementado (Intencional):
├── partners_v2 (pequeno volume)
├── custom_templates (versionado via updated_at)
├── corporate_activities (imutável em realtime)
├── marketing_posts (histórico importante)
├── sales_goals (referência histórica)
├── automation_logs (auditoria, imutável)
└── automation_permissions (config, auditoria separada)

Query Pattern:
WHERE deleted_at IS NULL  -- Always filter soft-deletes
```

---

## 12. DATA FLOW DIAGRAMS

### EPIC-001: CRM v2 - Ata Creation Flow

```
┌─────────────────┐
│  User interacts │
│   via UI        │
└────────┬────────┘
         │
    ┌────▼──────────────────────────┐
    │ Component: AtaEditor.tsx       │
    │ (React component)              │
    └────┬─────────────────────────┘
         │
         ├──▶ Load template from custom_templates
         │
         ├──▶ User fills form
         │    ├─ type (reuniao/investimentos)
         │    ├─ client_id
         │    ├─ content
         │    └─ recipient
         │
         ├──▶ Preview in AtaPreview.tsx
         │
         └──▶ Send (Email or WhatsApp)
                │
         ┌──────┴──────┐
         │             │
         ▼             ▼
    ┌─────────┐   ┌──────────┐
    │  Email  │   │ WhatsApp │
    │ (Resend)│   │(Deep Link)
    └────┬────┘   └─────┬────┘
         │              │
         └──────┬───────┘
                │
                ▼
    ┌──────────────────────┐
    │ INSERT INTO          │
    │ sent_atas            │
    │ (table with audit)   │
    └──────────────────────┘
```

### EPIC-002: Corporate HQ - Pipeline Feed Flow (Realtime)

```
┌──────────────────────────┐
│  Department Action       │
│  (ex: Create lead)       │
└────────┬─────────────────┘
         │
         ▼
    ┌──────────────────┐
    │ INSERT INTO      │
    │ sales_leads      │
    └────┬─────────────┘
         │
         ▼
    Supabase Realtime
    (POSTGRES_CHANGES)
         │
         ▼
    ┌─────────────────────────────┐
    │ Webhook triggers:           │
    │ INSERT → corporate_activity │
    │ (new activity record)       │
    └────┬────────────────────────┘
         │
         ▼
    Broadcast to WebSocket
    connected clients
         │
         ▼
    ┌──────────────────────┐
    │ React Component:     │
    │ PipelineFeed.tsx     │
    │ receives update      │
    │ in real-time < 100ms │
    └──────────────────────┘
```

### EPIC-003: AI Automation - Log & Control Flow

```
┌──────────────────────┐
│  User enables       │
│  automation         │
└────────┬────────────┘
         │
         ▼
    Check automation_permissions
    ├─ enabled = TRUE
    ├─ require_confirmation = TRUE/FALSE
    └─ allowed_domains matches
         │
         ✅ Pass
         │
         ▼
    ┌─────────────────────────┐
    │ MCP Playwright Action   │
    │ (navigate/screenshot)   │
    └────┬────────────────────┘
         │
         ▼
    ┌──────────────────────┐
    │ INSERT INTO          │
    │ automation_logs      │
    │ (immutable record)   │
    └────┬─────────────────┘
         │
         ├──▶ action_type: 'navigate'
         ├──▶ status: 'success'/'error'
         ├──▶ duration_ms: timing data
         └──▶ created_at: audit trail

    ├─ Error? Log in audit
    │
    └─ INSERT audit record
        → automation_permissions_audit
```

---

## 13. CONSTRAINTS SUMMARY

### CHECK Constraints (Data Validation)

```
accounts.balance >= 0
  ← Prevent negative balance

transactions.amount > 0
  ← Require positive amounts

partnership_clients.commission_rate BETWEEN 0 AND 100
  ← Valid percentage

partnership_clients.contract_value >= 0
  ← Non-negative values

sales_leads.probability BETWEEN 0 AND 100
  ← Valid probability

sales_leads.value >= 0
  ← Non-negative deal values

sales_goals.target_value >= 0
  ← Non-negative goals

user_files.size_bytes BETWEEN 1 AND 10485760
  ← Between 1 byte and 10MB

automation_permissions.max_actions_per_hour >= 0
  ← Non-negative rate limit

sent_atas.type IN ('reuniao', 'investimentos')
  ← Valid ata type

sent_atas.channel IN ('email', 'whatsapp')
  ← Valid channel

custom_templates.type IN ('reuniao', 'investimentos')
  ← Valid template type

operational_tasks.status IN ('todo', 'in_progress', 'done')
  ← Valid kanban status

operational_tasks.priority IN ('low', 'medium', 'high')
  ← Valid priority

sales_leads.stage IN (...)
  ← Valid pipeline stage

automation_logs.action_type IN (...)
  ← Valid automation action

automation_logs.status IN (...)
  ← Valid action status

corporate_activities.status IN (...)
  ← Valid activity status

marketing_posts.platform IN (...)
  ← Valid social platform

marketing_posts.status IN (...)
  ← Valid post status
```

### UNIQUE Constraints

```
categories.UNIQUE(user_id, LOWER(name))
  ← No duplicate categories per user (case-insensitive)

custom_templates.UNIQUE(user_id, type) WHERE is_default = true
  ← Only one default template per type per user

sales_goals.UNIQUE(user_id, month)
  ← One goal per month per user

automation_permissions.UNIQUE(user_id)
  ← One permission config per user
```

---

## 14. STORAGE & SCALABILITY NOTES

### Per-Epic Storage Estimates

```
EPIC-001 (CRM v2):
├── sent_atas: 1KB per ata × 100 atas/user/year = 100KB/year
├── custom_templates: 5KB × 5 templates = 25KB
└── user_files: Supabase Storage (limit: 500MB/user)
    Total: ~500MB/user (storage-bound)

EPIC-002 (Corporate HQ):
├── corporate_activities: 1KB × 500 activities = 500KB/user
├── marketing_posts: 500B + image URL × 50 posts = 25KB
├── operational_tasks: 500B × 500 tasks = 250KB
└── sales_leads: 1KB × 100 leads = 100KB
    Total: ~1MB/user (very manageable)

EPIC-003 (AI Automation):
├── automation_logs: 500B × 1000 logs/month × 3mo = 1.5MB
│   (90-day retention, auto-cleanup)
└── automation_permissions: 1KB × 1/user = negligible
    Total: ~1.5MB/user (auto-cleaned)

TOTAL DATABASE: 2-3MB/user (very scalable)
PLUS Storage: 500MB/user (Supabase quota)
```

---

## 15. MIGRATION PATH DEPENDENCIES

### Execution Order (Recommended)

```
Phase 0: Existing
├── ✅ 20260204_normalize_schema.sql
└── ✅ 20250210_partnerships.sql

Phase 1: Migrations
├── ✅ 20260214_spfp_2026_evolution.sql
└── ⏳ 20260216_database_optimizations.sql (NEXT)

Phase 2: Features
├── EPIC-004: Core Fixes (categories edit, partners fix)
├── EPIC-001: CRM v2 (atas, templates, files)
├── EPIC-002: Corporate HQ (activities, tasks, leads, posts)
└── EPIC-003: AI Automation (logs, permissions)

Phase 3: Enhancements
├── Real-time subscriptions (Supabase Realtime)
├── Views for analytics
├── Cleanup functions (logs retention)
└── Monitoring setup
```

---

**Documento Completo**
**Nova (Data Engineer - AIOS)**
**2026-02-16**
