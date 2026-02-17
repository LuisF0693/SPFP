# EPIC-002: Corporate HQ - Arquitetura Técnica

**Arquiteta:** Aria (AIOS Architect Agent)
**Versão:** 1.0
**Data:** 2026-02-16
**Status:** PLANNING

---

## 1. Visão Geral da Arquitetura

### 1.1 Contexto
O Corporate HQ é um módulo de escritório virtual gamificado que permite visualizar e gerenciar departamentos da empresa de forma visual e engajadora.

### 1.2 Decisões Arquiteturais

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| Visual rendering | CSS Grid + SVG | Mais simples que Phaser.js, adequado para MVP, fácil iteração |
| Drag & Drop | @dnd-kit/core | Moderno, mantido ativamente, funciona com React 19, suporta touch |
| Gráficos | Recharts | Já instalado no projeto, adequado para dashboards |
| Estado Global | Zustand + React Context | Já instalado, usar contexto local para cada dashboard |
| Real-time | Supabase Realtime | Para feed de atividades e sincronização |

---

## 2. Estrutura de Componentes

### 2.1 Hierarquia de Componentes

```
src/components/corporate/
├── index.ts                      # Exports públicos
├── CorporateHQ.tsx               # Container principal (rota /corporate)
├── CorporateContext.tsx          # Context para estado compartilhado
│
├── map/
│   ├── OfficeMap.tsx             # Mapa 2D do escritório
│   ├── Department.tsx            # Área de departamento clicável
│   ├── DepartmentNPC.tsx        # Personagem NPC estático
│   ├── DepartmentHighlight.tsx  # Efeito hover/active
│   └── assets/
│       ├── desk.svg             # Mesa genérica
│       ├── chart-icon.svg       # Ícone gráficos (Financeiro)
│       ├── whiteboard.svg       # Quadro branco (Marketing)
│       ├── kanban-board.svg     # Board Kanban (Operacional)
│       └── pipeline-funnel.svg  # Funil vendas (Comercial)
│
├── feed/
│   ├── ActivityFeed.tsx         # Container do feed
│   ├── ActivityCard.tsx         # Card individual
│   ├── ActivityStatus.tsx       # Badge de status
│   ├── ApprovalGate.tsx         # Botões Aprovar/Rejeitar
│   └── ActivityDetailModal.tsx  # Detalhes expandidos
│
├── dashboards/
│   ├── DashboardLayout.tsx      # Layout padrão de dashboard
│   ├── DashboardHeader.tsx       # Cabeçalho com título e ações
│   │
│   ├── financial/
│   │   ├── FinancialDashboard.tsx
│   │   ├── SaldoCard.tsx
│   │   ├── ReceitaDespesaChart.tsx
│   │   ├── ContasList.tsx
│   │   ├── FluxoCaixaChart.tsx
│   │   └── DRESummary.tsx
│   │
│   ├── marketing/
│   │   ├── MarketingDashboard.tsx
│   │   ├── PostCalendar.tsx
│   │   ├── PostList.tsx
│   │   ├── PostCard.tsx
│   │   ├── CreatePostModal.tsx
│   │   ├── EditPostModal.tsx
│   │   └── EngagementMetrics.tsx
│   │
│   ├── operational/
│   │   ├── OperationalDashboard.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── TaskCard.tsx
│   │   ├── CreateTaskModal.tsx
│   │   └── TaskDetailModal.tsx
│   │
│   └── commercial/
│       ├── CommercialDashboard.tsx
│       ├── SalesPipeline.tsx
│       ├── PipelineColumn.tsx
│       ├── LeadCard.tsx
│       ├── CreateLeadModal.tsx
│       ├── LeadDetailModal.tsx
│       ├── SalesGoalProgress.tsx
│       └── ConversionFunnel.tsx
│
└── shared/
    ├── StatusBadge.tsx          # Badge de status reutilizável
    ├── EmojiIcon.tsx            # Wrapper para emojis com estilo
    ├── GlassCard.tsx            # Card com efeito glassmorphism
    └── AnimatedCounter.tsx      # Contador animado
```

### 2.2 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CorporateHQ                                  │
│  ┌──────────────────────────────────┐  ┌─────────────────────────┐ │
│  │           OfficeMap               │  │     ActivityFeed        │ │
│  │  ┌───────────┬───────────────┐    │  │  ┌─────────────────┐   │ │
│  │  │Financeiro │   Marketing   │    │  │  │ ActivityCard    │   │ │
│  │  │ Department│   Department  │    │  │  │ ├─StatusBadge   │   │ │
│  │  ├───────────┼───────────────┤    │  │  │ └─ApprovalGate  │   │ │
│  │  │Operacional│   Comercial   │    │  │  └─────────────────┘   │ │
│  │  │ Department│   Department  │    │  │  ...                   │ │
│  │  └───────────┴───────────────┘    │  └─────────────────────────┘ │
│  └──────────────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │      DashboardModal           │
                    │  ┌─────────────────────────┐  │
                    │  │  [Financial|Marketing|  │  │
                    │  │   Operational|Commercial]│  │
                    │  │       Dashboard          │  │
                    │  └─────────────────────────┘  │
                    └───────────────────────────────┘
```

---

## 3. Dependências e Bibliotecas

### 3.1 Dependências a Instalar

```bash
# Drag and Drop (para Kanban e Pipeline)
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Tipos TypeScript (se necessário)
npm install -D @types/uuid
```

### 3.2 Dependências Existentes (Reutilizar)

| Biblioteca | Versão | Uso no EPIC-002 |
|------------|--------|-----------------|
| react | ^19.2.1 | Core |
| recharts | ^3.5.1 | Gráficos financeiros e métricas |
| lucide-react | ^0.556.0 | Ícones |
| @supabase/supabase-js | ^2.89.0 | Backend + Realtime |
| zustand | ^5.0.11 | Estado global |
| react-router-dom | ^7.11.0 | Roteamento |

---

## 4. Modelo de Dados - Supabase

### 4.1 Schema SQL

```sql
-- =====================================================
-- EPIC-002: Corporate HQ - Database Schema
-- =====================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Tabela: corporate_activities
-- Feed de atividades dos departamentos
-- =====================================================
CREATE TABLE corporate_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department VARCHAR(20) NOT NULL CHECK (department IN ('financeiro', 'marketing', 'operacional', 'comercial')),
  agent_name VARCHAR(100) NOT NULL,
  agent_role VARCHAR(100),
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'idle', 'waiting', 'completed', 'error')),
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_corporate_activities_user ON corporate_activities(user_id);
CREATE INDEX idx_corporate_activities_department ON corporate_activities(user_id, department);
CREATE INDEX idx_corporate_activities_status ON corporate_activities(user_id, status);
CREATE INDEX idx_corporate_activities_created ON corporate_activities(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE corporate_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON corporate_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON corporate_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON corporate_activities FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_corporate_activities_updated_at
  BEFORE UPDATE ON corporate_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Tabela: marketing_posts
-- Posts de marketing
-- =====================================================
CREATE TABLE marketing_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'tiktok', 'youtube', 'other')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'posted', 'rejected')),
  scheduled_date DATE,
  posted_date TIMESTAMPTZ,
  image_url VARCHAR(500),
  image_storage_path VARCHAR(500),
  metrics JSONB DEFAULT '{"likes": 0, "comments": 0, "shares": 0, "reach": 0}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_marketing_posts_user ON marketing_posts(user_id);
CREATE INDEX idx_marketing_posts_status ON marketing_posts(user_id, status);
CREATE INDEX idx_marketing_posts_scheduled ON marketing_posts(user_id, scheduled_date);

-- RLS
ALTER TABLE marketing_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own posts"
  ON marketing_posts FOR ALL
  USING (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_marketing_posts_updated_at
  BEFORE UPDATE ON marketing_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Tabela: operational_tasks
-- Tarefas do Kanban operacional
-- =====================================================
CREATE TABLE operational_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  assignee VARCHAR(100),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_operational_tasks_user ON operational_tasks(user_id);
CREATE INDEX idx_operational_tasks_status ON operational_tasks(user_id, status);
CREATE INDEX idx_operational_tasks_position ON operational_tasks(user_id, status, position);

-- RLS
ALTER TABLE operational_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
  ON operational_tasks FOR ALL
  USING (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_operational_tasks_updated_at
  BEFORE UPDATE ON operational_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Tabela: sales_leads
-- Leads do pipeline comercial
-- =====================================================
CREATE TABLE sales_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  stage VARCHAR(20) NOT NULL DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  value DECIMAL(18, 2) NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  source VARCHAR(100),
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_sales_leads_user ON sales_leads(user_id);
CREATE INDEX idx_sales_leads_stage ON sales_leads(user_id, stage);
CREATE INDEX idx_sales_leads_position ON sales_leads(user_id, stage, position);

-- RLS
ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own leads"
  ON sales_leads FOR ALL
  USING (auth.uid() = user_id);

-- Trigger
CREATE TRIGGER update_sales_leads_updated_at
  BEFORE UPDATE ON sales_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Tabela: sales_goals
-- Metas comerciais mensais
-- =====================================================
CREATE TABLE sales_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- Primeiro dia do mês
  target_value DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Index
CREATE INDEX idx_sales_goals_user_month ON sales_goals(user_id, month);

-- RLS
ALTER TABLE sales_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON sales_goals FOR ALL
  USING (auth.uid() = user_id);
```

### 4.2 TypeScript Interfaces

```typescript
// src/types/corporate.ts

// ===============================
// Corporate Activities (Feed)
// ===============================
export type Department = 'financeiro' | 'marketing' | 'operacional' | 'comercial';
export type ActivityStatus = 'running' | 'idle' | 'waiting' | 'completed' | 'error';

export interface CorporateActivity {
  id: string;
  user_id: string;
  department: Department;
  agent_name: string;
  agent_role?: string;
  description: string;
  status: ActivityStatus;
  requires_approval: boolean;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ===============================
// Marketing Posts
// ===============================
export type Platform = 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'other';
export type PostStatus = 'draft' | 'pending' | 'approved' | 'posted' | 'rejected';

export interface PostMetrics {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
}

export interface MarketingPost {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  platform: Platform;
  status: PostStatus;
  scheduled_date?: string;
  posted_date?: string;
  image_url?: string;
  image_storage_path?: string;
  metrics?: PostMetrics;
  created_at: string;
  updated_at: string;
}

// ===============================
// Operational Tasks (Kanban)
// ===============================
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface OperationalTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  due_date?: string;
  completed_at?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

// ===============================
// Sales Leads (Pipeline)
// ===============================
export type LeadStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface SalesLead {
  id: string;
  user_id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  stage: LeadStage;
  value: number;
  probability: number;
  source?: string;
  notes?: string;
  next_action?: string;
  next_action_date?: string;
  position: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

// ===============================
// Sales Goals
// ===============================
export interface SalesGoal {
  id: string;
  user_id: string;
  month: string; // YYYY-MM-01
  target_value: number;
  created_at: string;
}
```

---

## 5. Estado e Contexto

### 5.1 CorporateContext

```typescript
// src/components/corporate/CorporateContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface CorporateContextValue {
  // Map state
  selectedDepartment: Department | null;
  setSelectedDepartment: (dept: Department | null) => void;

  // Feed state
  feedFilter: Department | 'all';
  setFeedFilter: (filter: Department | 'all') => void;

  // Real-time subscriptions
  isRealtimeConnected: boolean;
}

const CorporateContext = createContext<CorporateContextValue | null>(null);

export function CorporateProvider({ children }: { children: ReactNode }) {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [feedFilter, setFeedFilter] = useState<Department | 'all'>('all');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  return (
    <CorporateContext.Provider value={{
      selectedDepartment,
      setSelectedDepartment,
      feedFilter,
      setFeedFilter,
      isRealtimeConnected,
    }}>
      {children}
    </CorporateContext.Provider>
  );
}

export function useCorporate() {
  const context = useContext(CorporateContext);
  if (!context) {
    throw new Error('useCorporate must be used within CorporateProvider');
  }
  return context;
}
```

### 5.2 Zustand Store (Opcional)

```typescript
// src/stores/corporateStore.ts
import { create } from 'zustand';

interface CorporateState {
  // Activities
  activities: CorporateActivity[];
  addActivity: (activity: CorporateActivity) => void;
  updateActivity: (id: string, updates: Partial<CorporateActivity>) => void;

  // Tasks
  tasks: OperationalTask[];
  setTasks: (tasks: OperationalTask[]) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;

  // Leads
  leads: SalesLead[];
  setLeads: (leads: SalesLead[]) => void;
  moveLead: (id: string, newStage: LeadStage) => void;

  // Posts
  posts: MarketingPost[];
  setPosts: (posts: MarketingPost[]) => void;
}

export const useCorporateStore = create<CorporateState>((set) => ({
  activities: [],
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities].slice(0, 100) // Keep last 100
  })),
  updateActivity: (id, updates) => set((state) => ({
    activities: state.activities.map(a => a.id === id ? { ...a, ...updates } : a)
  })),

  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  moveTask: (id, newStatus) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status: newStatus } : t)
  })),

  leads: [],
  setLeads: (leads) => set({ leads }),
  moveLead: (id, newStage) => set((state) => ({
    leads: state.leads.map(l => l.id === id ? { ...l, stage: newStage } : l)
  })),

  posts: [],
  setPosts: (posts) => set({ posts }),
}));
```

---

## 6. Integração com Supabase Realtime

### 6.1 Subscription para Activities Feed

```typescript
// src/services/corporateService.ts
import { supabase } from '@/supabase';

export function subscribeToActivities(
  userId: string,
  onActivity: (activity: CorporateActivity) => void
) {
  return supabase
    .channel('corporate-activities')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'corporate_activities',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onActivity(payload.new as CorporateActivity);
      }
    )
    .subscribe();
}

export function subscribeToTasks(
  userId: string,
  onChange: (tasks: OperationalTask[]) => void
) {
  return supabase
    .channel('operational-tasks')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'operational_tasks',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        const { data } = await supabase
          .from('operational_tasks')
          .select('*')
          .eq('user_id', userId)
          .order('position');
        if (data) onChange(data);
      }
    )
    .subscribe();
}
```

---

## 7. Roteamento

### 7.1 Nova Rota

```typescript
// src/App.tsx (adicionar)
import CorporateHQ from '@/components/corporate/CorporateHQ';

// Dentro de <Routes>
<Route
  path="/corporate"
  element={
    <PrivateRoute>
      <CorporateProvider>
        <CorporateHQ />
      </CorporateProvider>
    </PrivateRoute>
  }
/>
```

### 7.2 Sidebar Navigation

```typescript
// Adicionar ao navItems existente
{
  id: 'corporate',
  label: 'Corporate HQ',
  emoji: '🏢',
  path: '/corporate'
}
```

---

## 8. Roadmap de Sprints

### Sprint 5: Foundation (Mapa Base)
**Duração:** 1 semana
**Stories:** STY-086

| Dia | Tarefa |
|-----|--------|
| 1 | Setup estrutura de pastas, tipos TypeScript |
| 2 | Implementar OfficeMap com grid 2x2 |
| 3 | Implementar Department com hover/active |
| 4 | Criar assets SVG básicos |
| 5 | Integrar com Layout, adicionar rota |
| 6 | Testes e refinamentos visuais |
| 7 | Review e merge |

**Entregável:** Mapa visual funcional com 4 departamentos clicáveis

---

### Sprint 6: Dashboards Core
**Duração:** 1-2 semanas
**Stories:** STY-088, STY-091 (paralelo)

| Semana | Story | Tarefas |
|--------|-------|---------|
| 1A | STY-088 Financeiro | Dashboard com Recharts, integração FinanceContext |
| 1B | STY-091 Comercial | Pipeline com @dnd-kit, schema sales_leads |
| 2 | Finalização | Testes, bugs, polimento visual |

**Entregáveis:**
- Dashboard Financeiro com gráficos funcionais
- Pipeline de Vendas com drag & drop

---

### Sprint 7: Feed e Dashboards Restantes
**Duração:** 1-2 semanas
**Stories:** STY-087, STY-089, STY-090

| Semana | Story | Tarefas |
|--------|-------|---------|
| 1A | STY-087 Feed | ActivityFeed com Supabase Realtime |
| 1B | STY-089 Marketing | Calendário, CRUD de posts |
| 2 | STY-090 Operacional | Kanban com @dnd-kit |

**Entregáveis:**
- Feed de atividades em tempo real
- Dashboard Marketing com calendário
- Kanban Operacional funcional

---

## 9. Métricas de Sucesso

### 9.1 Performance

| Métrica | Target | Como Medir |
|---------|--------|------------|
| Mapa carregamento | < 2s | Lighthouse |
| Dashboard abertura | < 500ms | Performance API |
| Feed scroll | 60fps | Chrome DevTools |
| Drag & drop | < 16ms frame | React DevTools Profiler |

### 9.2 Qualidade

| Métrica | Target |
|---------|--------|
| Cobertura de testes | > 70% |
| Lighthouse Score | > 80 |
| TypeScript strict | 100% |
| Acessibilidade | WCAG 2.1 AA |

---

## 10. Riscos Técnicos

| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| @dnd-kit incompatível com React 19 | Baixa | Verificar compatibilidade antes, testar em POC |
| Supabase Realtime latência | Média | Fallback para polling a cada 5s |
| Performance com 1000+ atividades | Média | Virtualização com react-window |
| Conflitos de merge com EPIC-001 | Alta | Desenvolver em branch separado, merge após EPIC-001 |

---

## 11. Checklist de Implementação

### Pré-Desenvolvimento
- [ ] Instalar dependências (@dnd-kit/core, @dnd-kit/sortable)
- [ ] Criar branch `feature/epic-002-corporate-hq`
- [ ] Executar schema SQL no Supabase
- [ ] Criar tipos TypeScript

### Sprint 5
- [ ] Estrutura de pastas criada
- [ ] OfficeMap implementado
- [ ] Department implementado
- [ ] Rota /corporate funcionando
- [ ] Sidebar atualizado

### Sprint 6
- [ ] FinancialDashboard completo
- [ ] CommercialDashboard completo
- [ ] Drag & drop funcional
- [ ] Integração com FinanceContext

### Sprint 7
- [ ] ActivityFeed com Realtime
- [ ] MarketingDashboard completo
- [ ] OperationalDashboard completo
- [ ] Todos os testes passando

---

**Documento criado por:** Aria (AIOS Architect)
**Data:** 2026-02-16
**Status:** Ready for Review