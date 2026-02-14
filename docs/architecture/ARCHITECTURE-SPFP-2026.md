# Arquitetura Técnica SPFP 2026

**Arquiteta:** Aria (AIOS Architect)
**Data:** 2026-02-14
**Versão:** 1.0

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SPFP 2026                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   EPIC-004   │  │   EPIC-001   │  │   EPIC-002   │  │   EPIC-003   │ │
│  │  Core Fixes  │  │   CRM v2     │  │Corporate HQ  │  │ AI Automation│ │
│  │   Sprint 1   │  │  Sprints 2-4 │  │  Sprints 5-7 │  │ Sprints 8-10 │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                         CAMADA DE APRESENTAÇÃO                           │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  React 19 + TypeScript + TailwindCSS + Recharts                     ││
│  │  • Componentes UI (src/components/)                                  ││
│  │  • Virtual Office (src/virtual-office/) - Pixi.js                   ││
│  │  • CRM Module (src/components/crm/) - NOVO                          ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                          CAMADA DE ESTADO                                │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Context API + Zustand                                               ││
│  │  • AuthContext (autenticação)                                        ││
│  │  • FinanceContext (dados financeiros)                                ││
│  │  • virtualOfficeStore (Zustand - escritório virtual)                ││
│  │  • crmStore (Zustand - CRM) - NOVO                                  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                         CAMADA DE SERVIÇOS                               │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Services (src/services/)                                            ││
│  │  • aiService.ts (Gemini AI)                                          ││
│  │  • ataService.ts - NOVO (Atas de reunião/investimentos)             ││
│  │  • emailService.ts - NOVO (Resend integration)                      ││
│  │  • storageService.ts - NOVO (Supabase Storage)                      ││
│  │  • automationService.ts - NOVO (MCP Playwright)                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                          CAMADA DE DADOS                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Supabase (PostgreSQL + Realtime + Storage + Auth)                  ││
│  │  • Tabelas existentes (transactions, accounts, etc.)                ││
│  │  • Novas tabelas (sent_atas, user_files, etc.)                      ││
│  │  • RLS Policies por user_id                                          ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                       INTEGRAÇÕES EXTERNAS                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Google Gemini│  │   Resend     │  │   WhatsApp   │  │MCP Playwright│ │
│  │    (AI)      │  │   (Email)    │  │ (Deep Links) │  │ (Automation) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Pastas Proposta

```
src/
├── components/
│   ├── ui/                      # Componentes UI reutilizáveis (existente)
│   ├── crm/                     # EPIC-001: Módulo CRM v2
│   │   ├── AtaEditor.tsx        # Editor de atas (reunião/investimentos)
│   │   ├── AtaPreview.tsx       # Preview da ata antes de enviar
│   │   ├── AtaHistory.tsx       # Histórico de atas enviadas
│   │   ├── TemplateEditor.tsx   # Editor de templates customizados
│   │   ├── FileManager.tsx      # Gerenciador de arquivos/slides
│   │   ├── FileUploader.tsx     # Upload drag & drop
│   │   ├── FileViewer.tsx       # Visualizador de PDF/imagens
│   │   ├── ClientProfile.tsx    # Perfil do cliente (redesign)
│   │   ├── ClientCard.tsx       # Card de cliente (redesign)
│   │   └── SendButtons.tsx      # Botões enviar email/whatsapp
│   ├── corporate-hq/            # EPIC-002: Escritório Virtual
│   │   ├── OfficeMap.tsx        # Mapa do escritório (CSS Grid)
│   │   ├── Department.tsx       # Componente de departamento
│   │   ├── DepartmentDashboard/ # Dashboards por departamento
│   │   │   ├── FinanceiroDash.tsx
│   │   │   ├── MarketingDash.tsx
│   │   │   ├── OperacionalDash.tsx
│   │   │   └── ComercialDash.tsx
│   │   ├── PipelineFeed.tsx     # Feed de atividades
│   │   ├── Kanban.tsx           # Board de tarefas
│   │   ├── SalesPipeline.tsx    # Pipeline de vendas
│   │   └── PostCalendar.tsx     # Calendário de posts
│   ├── automation/              # EPIC-003: AI Automation
│   │   ├── AutomationDashboard.tsx
│   │   ├── BrowserPreview.tsx
│   │   ├── ActionLog.tsx
│   │   ├── NavigationInput.tsx
│   │   ├── PermissionsPanel.tsx
│   │   └── ScreenshotGallery.tsx
│   ├── partnerships/            # Existente (corrigido)
│   ├── transaction/             # Existente
│   │   └── CategoryEditModal.tsx # EPIC-004: Editar categorias
│   └── ...                      # Outros componentes existentes
│
├── services/
│   ├── aiService.ts             # Existente (Gemini)
│   ├── ataService.ts            # NOVO: Geração e formatação de atas
│   ├── emailService.ts          # NOVO: Integração Resend
│   ├── whatsappService.ts       # NOVO: Deep links WhatsApp
│   ├── storageService.ts        # NOVO: Supabase Storage
│   ├── automationService.ts     # NOVO: MCP Playwright
│   └── ...                      # Serviços existentes
│
├── stores/                      # NOVO: Stores Zustand centralizados
│   ├── crmStore.ts              # Estado do CRM
│   ├── corporateHQStore.ts      # Estado do escritório virtual
│   └── automationStore.ts       # Estado da automação
│
├── hooks/
│   ├── usePartnerships.ts       # Existente (corrigido)
│   ├── useAtas.ts               # NOVO: Hook para atas
│   ├── useFiles.ts              # NOVO: Hook para arquivos
│   ├── useTasks.ts              # NOVO: Hook para tarefas (Kanban)
│   ├── useLeads.ts              # NOVO: Hook para leads (Pipeline)
│   └── usePosts.ts              # NOVO: Hook para posts (Marketing)
│
├── types/
│   ├── crm.ts                   # NOVO: Tipos do CRM
│   ├── corporate-hq.ts          # NOVO: Tipos do Corporate HQ
│   ├── automation.ts            # NOVO: Tipos da automação
│   └── ...                      # Tipos existentes
│
└── virtual-office/              # Existente (reutilizar para EPIC-002)
    ├── components/
    ├── store/
    └── ...
```

---

## 3. Novas Tabelas Supabase

### EPIC-001: CRM v2

```sql
-- Atas enviadas
CREATE TABLE sent_atas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID,
  client_name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('reuniao', 'investimentos')),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  content TEXT NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Templates customizados
CREATE TABLE custom_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('reuniao', 'investimentos')),
  name VARCHAR(100) NOT NULL DEFAULT 'Meu Template',
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Arquivos do usuário (metadata)
CREATE TABLE user_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('investimentos', 'planejamento', 'educacional', 'outros')),
  storage_path VARCHAR(500) NOT NULL,
  size_bytes INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### EPIC-002: Corporate HQ

```sql
-- Atividades do feed
CREATE TABLE corporate_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department VARCHAR(20) NOT NULL CHECK (department IN ('financeiro', 'marketing', 'operacional', 'comercial')),
  agent_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'idle', 'waiting', 'completed', 'error')),
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Posts de marketing
CREATE TABLE marketing_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'tiktok', 'youtube', 'twitter', 'other')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'posted', 'rejected')),
  scheduled_date DATE,
  posted_date TIMESTAMPTZ,
  image_url VARCHAR(500),
  metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tarefas operacionais (Kanban)
CREATE TABLE operational_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee VARCHAR(100),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads comerciais (Pipeline)
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

-- Metas comerciais
CREATE TABLE sales_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  target_value DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month)
);
```

### EPIC-003: AI Automation

```sql
-- Log de ações de automação
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('screenshot', 'navigate', 'click', 'fill', 'select')),
  target_url VARCHAR(500),
  selector VARCHAR(500),
  value TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'success', 'error')),
  error_message TEXT,
  screenshot_path VARCHAR(500),
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configurações de permissões
CREATE TABLE automation_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  require_confirmation BOOLEAN DEFAULT TRUE,
  allowed_domains TEXT[], -- Array de domínios permitidos
  max_actions_per_hour INTEGER DEFAULT 100,
  allow_navigation BOOLEAN DEFAULT TRUE,
  allow_clicks BOOLEAN DEFAULT FALSE,
  allow_typing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);
```

---

## 4. Dependências a Instalar

### EPIC-001: CRM v2

```bash
# Email
npm install resend

# PDF Viewer (já tem pdfjs-dist, mas adicionar wrapper React)
# Usar o pdfjs-dist existente

# Rich Text Editor (opcional, para edição de templates)
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

### EPIC-002: Corporate HQ

```bash
# Drag and Drop para Kanban/Pipeline
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Calendário para posts
npm install date-fns
# (Não precisa de lib pesada, usar CSS Grid + date-fns)

# Pixi.js já instalado para virtual-office
```

### EPIC-003: AI Automation

```bash
# MCP Playwright já configurado no ambiente
# Não precisa de dependência adicional no frontend
```

### Resumo de Dependências

| Pacote | Versão | Épico | Propósito |
|--------|--------|-------|-----------|
| resend | ^2.0.0 | EPIC-001 | Envio de emails |
| @tiptap/* | ^2.0.0 | EPIC-001 | Editor de templates (opcional) |
| @dnd-kit/* | ^6.0.0 | EPIC-002 | Drag & drop |
| date-fns | ^3.0.0 | EPIC-002 | Manipulação de datas |

---

## 5. Decisões Arquiteturais

### DA-001: State Management

**Decisão:** Usar **Zustand** para novos módulos, manter **Context API** para estado global existente.

**Justificativa:**
- Zustand já usado no virtual-office (consistência)
- Mais simples que Redux
- Melhor performance (sem re-renders desnecessários)
- Context API já funciona bem para FinanceContext/AuthContext

**Padrão:**
```typescript
// stores/crmStore.ts
import { create } from 'zustand';

interface CRMStore {
  atas: Ata[];
  files: UserFile[];
  addAta: (ata: Ata) => void;
  // ...
}

export const useCRMStore = create<CRMStore>((set) => ({
  // ...
}));
```

---

### DA-002: Componentização

**Decisão:** Criar componentes específicos por módulo, reutilizar UI base.

**Estrutura:**
```
components/
├── ui/           # Componentes genéricos (Button, Modal, Card, etc.)
├── crm/          # Componentes específicos do CRM
├── corporate-hq/ # Componentes do escritório virtual
└── automation/   # Componentes de automação
```

**Regras:**
1. Componentes em `ui/` são 100% reutilizáveis (sem lógica de negócio)
2. Componentes específicos importam de `ui/`
3. Máximo 300 linhas por componente (dividir se maior)

---

### DA-003: API/Backend

**Decisão:** Usar **Supabase Edge Functions** para lógica server-side.

**Casos de uso:**
- Envio de email (Resend API key protegida)
- Webhooks
- Processamento assíncrono

**Estrutura:**
```
supabase/
├── functions/
│   ├── send-email/
│   │   └── index.ts
│   └── ...
└── migrations/
    └── *.sql
```

---

### DA-004: Storage de Arquivos

**Decisão:** Usar **Supabase Storage** com buckets organizados por categoria.

**Estrutura:**
```
bucket: spfp-files
├── {user_id}/
│   ├── investimentos/
│   ├── planejamento/
│   ├── educacional/
│   ├── outros/
│   └── screenshots/  # Para EPIC-003
```

**Políticas:**
- RLS: usuário só acessa seus arquivos
- Limite: 10MB por arquivo
- Quota: 500MB por usuário (tier grátis)

---

### DA-005: Real-time

**Decisão:** Usar **Supabase Realtime** para Pipeline Feed.

**Implementação:**
```typescript
// Hook para atividades em tempo real
export function useActivities() {
  useEffect(() => {
    const channel = supabase
      .channel('corporate-activities')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'corporate_activities' },
        (payload) => addActivity(payload.new)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
}
```

---

### DA-006: Escritório Virtual (EPIC-002)

**Decisão:** Começar com **CSS Grid + SVG** para MVP, reutilizar estrutura existente em `virtual-office/`.

**Justificativa:**
- Pixi.js já configurado, mas CSS é mais simples para MVP estático
- Evita complexidade desnecessária na primeira versão
- Migrar para Pixi.js na fase de animações

**Fases:**
1. **MVP (Sprint 5):** CSS Grid com áreas clicáveis
2. **Evolução (Sprint 6-7):** Adicionar Pixi.js para animações
3. **Futuro:** Movimento de avatar, NPCs animados

---

### DA-007: Integração MCP Playwright (EPIC-003)

**Decisão:** Criar service wrapper que abstrai chamadas MCP.

**Padrão:**
```typescript
// services/automationService.ts
class AutomationService {
  private permissions: AutomationPermissions;

  async screenshot(): Promise<string> {
    if (!this.permissions.enabled) throw new Error('Automation disabled');
    // Chamar MCP Playwright
    return await mcp_playwright_screenshot();
  }

  async navigate(url: string): Promise<void> {
    if (!this.isAllowedDomain(url)) throw new Error('Domain not allowed');
    // ...
  }
}
```

---

## 6. Padrões de Código

### Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componentes | PascalCase | `AtaEditor.tsx` |
| Hooks | camelCase com "use" | `useAtas.ts` |
| Services | camelCase | `ataService.ts` |
| Stores | camelCase com "Store" | `crmStore.ts` |
| Types | PascalCase | `Ata`, `UserFile` |
| Tabelas SQL | snake_case | `sent_atas` |
| Colunas SQL | snake_case | `created_at` |

### Estrutura de Componente

```typescript
// components/crm/AtaEditor.tsx
import { useState } from 'react';
import { Button } from '../ui/Button';
import { useCRMStore } from '../../stores/crmStore';
import type { Ata } from '../../types/crm';

interface AtaEditorProps {
  clientId: string;
  type: 'reuniao' | 'investimentos';
  onSave: (ata: Ata) => void;
  onCancel: () => void;
}

export function AtaEditor({ clientId, type, onSave, onCancel }: AtaEditorProps) {
  // Estado local
  const [content, setContent] = useState('');

  // Store global
  const { templates } = useCRMStore();

  // Handlers
  const handleSave = async () => { /* ... */ };

  // Render
  return (
    <div className="...">
      {/* ... */}
    </div>
  );
}
```

### Error Handling

```typescript
// Usar o errorRecovery existente
import { withErrorRecovery } from '../services/errorRecovery';

const result = await withErrorRecovery(
  () => supabase.from('sent_atas').insert(ata),
  'Salvar ata',
  { maxRetries: 2, userId: user?.id }
);
```

---

## 7. Fluxos de Dados

### EPIC-001: Envio de Ata

```
┌─────────┐     ┌───────────┐     ┌────────────┐     ┌─────────┐
│ Cliente │────>│ AtaEditor │────>│ AtaPreview │────>│ Confirm │
└─────────┘     └───────────┘     └────────────┘     └────┬────┘
                                                          │
                    ┌─────────────────────────────────────┘
                    │
          ┌────────┴────────┐
          │                 │
    ┌─────▼─────┐    ┌─────▼──────┐
    │  Email    │    │  WhatsApp  │
    │  Service  │    │  Service   │
    └─────┬─────┘    └─────┬──────┘
          │                │
    ┌─────▼─────┐    ┌─────▼──────┐
    │  Resend   │    │ Deep Link  │
    │   API     │    │  wa.me/... │
    └─────┬─────┘    └─────┬──────┘
          │                │
          └───────┬────────┘
                  │
            ┌─────▼─────┐
            │ sent_atas │
            │  (Supabase)│
            └───────────┘
```

### EPIC-002: Pipeline Feed Real-time

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ User Action │────>│ Supabase DB  │────>│ Realtime WS  │
│ (CRUD)      │     │ (INSERT/etc) │     │ (Broadcast)  │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                    ┌────────────┘
                                    │
                              ┌─────▼──────┐
                              │ useFeed()  │
                              │   Hook     │
                              └─────┬──────┘
                                    │
                              ┌─────▼──────┐
                              │ PipelineFeed│
                              │ Component   │
                              └────────────┘
```

---

## 8. Checklist de Implementação

### EPIC-004 (Sprint 1)
- [x] Bug parceiros corrigido
- [ ] Modal editar categorias
- [ ] Validação duplicatas

### EPIC-001 (Sprints 2-4)
- [ ] Migration SQL (sent_atas, custom_templates, user_files)
- [ ] Service: ataService.ts
- [ ] Service: emailService.ts (Resend)
- [ ] Service: storageService.ts
- [ ] Store: crmStore.ts
- [ ] Component: AtaEditor
- [ ] Component: AtaPreview
- [ ] Component: FileManager
- [ ] Component: ClientProfile (redesign)
- [ ] Supabase Edge Function: send-email

### EPIC-002 (Sprints 5-7)
- [ ] Migration SQL (todas as tabelas)
- [ ] Store: corporateHQStore.ts
- [ ] Component: OfficeMap (CSS Grid MVP)
- [ ] Component: DepartmentDashboard/*
- [ ] Component: PipelineFeed
- [ ] Component: Kanban
- [ ] Component: SalesPipeline
- [ ] Hook: useActivities (Realtime)

### EPIC-003 (Sprints 8-10)
- [ ] Migration SQL (automation_logs, automation_permissions)
- [ ] Service: automationService.ts
- [ ] Store: automationStore.ts
- [ ] Component: AutomationDashboard
- [ ] Component: BrowserPreview
- [ ] Component: PermissionsPanel

---

## 9. Riscos Técnicos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade do editor de atas | Média | Médio | Começar com textarea, TipTap depois |
| Performance do Kanban com muitos itens | Baixa | Médio | Virtualização com react-window |
| Limite de storage Supabase | Média | Médio | Compressão de imagens, quotas |
| MCP Playwright instável | Média | Alto | Fallback, retry logic |
| Real-time sobrecarregado | Baixa | Alto | Rate limiting, batching |

---

*Documento criado por Aria (AIOS Architect) - 2026-02-14*
