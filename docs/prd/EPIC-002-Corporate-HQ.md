# PRD: EPIC-002 - Corporate HQ

**Product Manager:** Morgan (AIOS PM Agent)
**Versao:** 1.0
**Data:** 2026-02-14
**Prioridade:** MEDIA
**Sprint Estimado:** 5-7 (6-10 semanas)

---

## 1. Objetivo

Criar um escritorio virtual gamificado onde o usuario pode visualizar e gerenciar todos os departamentos da sua empresa de forma visual e engajadora, incluindo visualizacao de agentes IA trabalhando em tempo real.

### Inspiracao

Sistema inspirado no **OPES Big Brother** - uma interface que mostra um escritorio em pixel art onde agentes de IA trabalham em diferentes departamentos, com um feed lateral mostrando atividades em tempo real.

### Problemas a Resolver

1. **Visao Fragmentada:** Dados de diferentes areas da empresa espalhados em diferentes ferramentas
2. **Falta de Engajamento:** Dashboards tradicionais sao entediantes
3. **Invisibilidade da IA:** Usuario nao ve o que agentes estao fazendo
4. **Complexidade:** Pequenos empresarios nao tem tempo para aprender ferramentas complexas

---

## 2. Escopo

### 2.1 Incluso - MVP (In Scope)

| ID | Item | Tipo |
|----|------|------|
| F002.1 | Mapa estatico do escritorio (4 departamentos) | Feature |
| F002.2 | Clique em departamento abre dashboard | Feature |
| F002.3 | Pipeline Feed de atividades | Feature |
| F002.4 | Dashboard Financeiro | Feature |
| F002.5 | Dashboard Marketing | Feature |
| F002.6 | Dashboard Operacional | Feature |
| F002.7 | Dashboard Comercial | Feature |
| F002.8 | Personagens estaticos representando agentes | Visual |

### 2.2 Excluso - MVP (Out of Scope - Fase Futura)

- Avatar do usuario que se move
- Animacoes de personagens andando
- Visualizacao real-time de agentes Claude Code
- Integracao com Claude Code para mostrar acoes
- Chat entre agentes
- Customizacao do mapa
- Multiplayer (ver outros usuarios)

---

## 3. Requisitos Funcionais

### RF-001: Mapa do Escritorio Virtual

**Descricao:** Interface visual 2D top-down mostrando um escritorio com 4 departamentos distintos.

**Criterios de Aceitacao:**
- [ ] AC-001.1: Mapa renderizado em tela cheia (ou area principal)
- [ ] AC-001.2: 4 areas visiveis: Financeiro, Marketing, Operacional, Comercial
- [ ] AC-001.3: Cada area tem visual distinto (cores, mobilia)
- [ ] AC-001.4: Personagens NPC estaticos em cada departamento
- [ ] AC-001.5: Labels identificando cada departamento
- [ ] AC-001.6: Hover em departamento mostra highlight
- [ ] AC-001.7: Clique em departamento abre modal/drawer com dashboard
- [ ] AC-001.8: Responsivo (adapta para telas menores)

**Layout do Mapa:**
```
+------------------------------------------------------------------+
|                        CORPORATE HQ                               |
+------------------------------------------------------------------+
|                          |                                        |
|      FINANCEIRO          |           MARKETING                    |
|    [Mesa] [Graficos]     |      [Mesa] [Quadro posts]            |
|      👤 CFO              |           👤 CMO                       |
|                          |                                        |
|--------------------------|----------------------------------------|
|                          |                                        |
|      OPERACIONAL         |           COMERCIAL                    |
|    [Mesa] [Kanban]       |      [Mesa] [Pipeline]                 |
|      👤 COO              |           👤 CSO                       |
|                          |                                        |
+------------------------------------------------------------------+
|  [Pipeline Feed - Lateral ou inferior]                           |
+------------------------------------------------------------------+
```

**Tecnologia:**
- Opcao A: CSS Grid + SVG (mais simples, menor curva)
- Opcao B: HTML Canvas (mais flexivel)
- Opcao C: Phaser.js (game engine, mais complexo)

**Recomendacao:** Comecar com Opcao A (CSS + SVG) para MVP, migrar para Phaser se necessario.

---

### RF-002: Pipeline Feed

**Descricao:** Feed lateral mostrando atividades dos departamentos em tempo real.

**Criterios de Aceitacao:**
- [ ] AC-002.1: Feed posicionado na lateral direita (ou inferior em mobile)
- [ ] AC-002.2: Scroll infinito de atividades
- [ ] AC-002.3: Cada atividade mostra: agente, hora, descricao, status
- [ ] AC-002.4: Status badges: RUNNING (verde), IDLE (cinza), WAITING (amarelo)
- [ ] AC-002.5: Filtro por departamento
- [ ] AC-002.6: Novas atividades aparecem no topo com animacao
- [ ] AC-002.7: Clicar em atividade expande detalhes
- [ ] AC-002.8: Gates de aprovacao com botoes Aprovar/Rejeitar

**Formato de Mensagem:**
```
+------------------------------------------+
| 👤 CFO                           10:45   |
| Analisando fluxo de caixa do mes...      |
| [RUNNING 🟢]                             |
+------------------------------------------+
| 👤 CMO                           10:42   |
| Post do Instagram aprovado.              |
| [COMPLETED ✓]                            |
+------------------------------------------+
| 👤 COO                           10:40   |
| Aguardando aprovacao para publicar       |
| [WAITING ⏳]  [Aprovar] [Rejeitar]       |
+------------------------------------------+
```

**Modelo de Dados:**
```typescript
interface ActivityFeedItem {
  id: string;
  department: 'financeiro' | 'marketing' | 'operacional' | 'comercial';
  agent_name: string;
  agent_role: string;
  description: string;
  status: 'running' | 'idle' | 'waiting' | 'completed' | 'error';
  requires_approval: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}
```

---

### RF-003: Dashboard Financeiro

**Descricao:** Dashboard com metricas financeiras da empresa ao clicar no departamento Financeiro.

**Criterios de Aceitacao:**
- [ ] AC-003.1: Modal/Drawer abre ao clicar em "Financeiro"
- [ ] AC-003.2: Receita vs Despesa (grafico de barras mensal)
- [ ] AC-003.3: Saldo atual (card destaque)
- [ ] AC-003.4: Contas a pagar (lista com vencimentos)
- [ ] AC-003.5: Contas a receber (lista com datas)
- [ ] AC-003.6: Fluxo de caixa projetado (proximo 3 meses)
- [ ] AC-003.7: DRE simplificado (receita - custos - despesas = lucro)
- [ ] AC-003.8: Filtro por periodo

**Metricas Principais:**
```
+------------------------------------------------------------------+
| FINANCEIRO                                           [X] Fechar  |
+------------------------------------------------------------------+
|                                                                  |
|  💰 Saldo Atual        📈 Receita Mes      📉 Despesa Mes        |
|  R$ 45.230,00          R$ 28.500,00        R$ 18.200,00          |
|                                                                  |
+------------------------------------------------------------------+
|  [Grafico Receita vs Despesa - ultimos 6 meses]                  |
+------------------------------------------------------------------+
|                                                                  |
|  Contas a Pagar (5)              Contas a Receber (3)            |
|  - Aluguel    R$ 2.500  15/02    - Cliente A  R$ 5.000  20/02   |
|  - Internet   R$ 200    20/02    - Cliente B  R$ 3.200  25/02   |
|                                                                  |
+------------------------------------------------------------------+
```

---

### RF-004: Dashboard Marketing

**Descricao:** Dashboard com metricas e gestao de conteudo de marketing.

**Criterios de Aceitacao:**
- [ ] AC-004.1: Modal/Drawer abre ao clicar em "Marketing"
- [ ] AC-004.2: Calendario de posts (mes atual)
- [ ] AC-004.3: Lista de criativos com status (Rascunho, Aprovado, Postado)
- [ ] AC-004.4: Metricas de engajamento (se integrado)
- [ ] AC-004.5: Criar novo post (titulo, descricao, data, plataforma)
- [ ] AC-004.6: Upload de imagem do criativo
- [ ] AC-004.7: Aprovar/Rejeitar posts pendentes

**Status de Posts:**
- 📝 Rascunho (cinza)
- ⏳ Aguardando Aprovacao (amarelo)
- ✅ Aprovado (verde)
- 📤 Postado (azul)
- ❌ Rejeitado (vermelho)

**Modelo de Dados:**
```typescript
interface MarketingPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  platform: 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'other';
  status: 'draft' | 'pending' | 'approved' | 'posted' | 'rejected';
  scheduled_date?: string;
  posted_date?: string;
  image_url?: string;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  created_at: string;
  updated_at: string;
}
```

---

### RF-005: Dashboard Operacional

**Descricao:** Dashboard com gestao de tarefas e processos operacionais.

**Criterios de Aceitacao:**
- [ ] AC-005.1: Modal/Drawer abre ao clicar em "Operacional"
- [ ] AC-005.2: Kanban board com colunas: A Fazer, Em Progresso, Concluido
- [ ] AC-005.3: Criar nova tarefa (titulo, descricao, prioridade, responsavel)
- [ ] AC-005.4: Drag & drop entre colunas
- [ ] AC-005.5: Filtro por prioridade (Alta, Media, Baixa)
- [ ] AC-005.6: Contador de tarefas por coluna
- [ ] AC-005.7: Data de vencimento com alerta visual

**Layout Kanban:**
```
+------------------------------------------------------------------+
| OPERACIONAL                                          [X] Fechar  |
+------------------------------------------------------------------+
| [+ Nova Tarefa]                      Filtro: [Todas ▼]           |
+------------------------------------------------------------------+
|   A FAZER (4)    |  EM PROGRESSO (2)  |   CONCLUIDO (8)          |
|------------------|--------------------|-----------------------   |
| [Tarefa 1]  🔴   | [Tarefa 5]    🟡   | [Tarefa 9]    ✓         |
| [Tarefa 2]  🟡   | [Tarefa 6]    🟢   | [Tarefa 10]   ✓         |
| [Tarefa 3]  🟢   |                    | ...                      |
| [Tarefa 4]  🔴   |                    |                          |
+------------------------------------------------------------------+
```

---

### RF-006: Dashboard Comercial

**Descricao:** Dashboard com pipeline de vendas e gestao de leads.

**Criterios de Aceitacao:**
- [ ] AC-006.1: Modal/Drawer abre ao clicar em "Comercial"
- [ ] AC-006.2: Pipeline visual (Prospeccao → Qualificacao → Proposta → Negociacao → Fechado)
- [ ] AC-006.3: Adicionar novo lead
- [ ] AC-006.4: Mover lead entre estagios (drag & drop)
- [ ] AC-006.5: Valor total por estagio
- [ ] AC-006.6: Taxa de conversao entre estagios
- [ ] AC-006.7: Meta do mes vs Realizado
- [ ] AC-006.8: Detalhes do lead ao clicar

**Layout Pipeline:**
```
+------------------------------------------------------------------+
| COMERCIAL                                            [X] Fechar  |
+------------------------------------------------------------------+
| Meta: R$ 50.000    Realizado: R$ 32.500 (65%)    [+ Novo Lead]   |
+------------------------------------------------------------------+
| Prospeccao | Qualificacao | Proposta | Negociacao | Fechado      |
|   (12)     |     (5)      |   (3)    |    (2)     |   (4)        |
| R$ 48.000  |  R$ 22.000   | R$ 15.000|  R$ 8.000  | R$ 32.500    |
|------------|--------------|----------|------------|--------------|
| [Lead A]   | [Lead E]     | [Lead H] | [Lead J]   | [Lead L] ✓   |
| [Lead B]   | [Lead F]     | [Lead I] | [Lead K]   | [Lead M] ✓   |
| [Lead C]   | [Lead G]     |          |            | ...          |
| [Lead D]   |              |          |            |              |
+------------------------------------------------------------------+
```

**Modelo de Dados:**
```typescript
interface SalesLead {
  id: string;
  user_id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number; // 0-100%
  source?: string;
  notes?: string;
  next_action?: string;
  next_action_date?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}
```

---

## 4. Requisitos Nao-Funcionais

### RNF-001: Performance
- Mapa carrega em < 2 segundos
- Feed atualiza sem lag perceptivel
- Dashboards abrem em < 500ms

### RNF-002: Responsividade
- Desktop: Layout completo com feed lateral
- Tablet: Feed abaixo do mapa
- Mobile: Navegacao por tabs entre mapa e feed

### RNF-003: Acessibilidade
- Navegacao por teclado nos departamentos
- Labels descritivos para screen readers
- Cores com contraste adequado

### RNF-004: Escalabilidade
- Suportar 1000+ atividades no feed (paginacao)
- Suportar 500+ tarefas no Kanban
- Suportar 200+ leads no pipeline

---

## 5. Assets Visuais

### 5.1 Estilo Visual

**Paleta de Cores:**
- Background: #0F172A (dark blue)
- Financeiro: #10B981 (emerald)
- Marketing: #8B5CF6 (violet)
- Operacional: #F59E0B (amber)
- Comercial: #3B82F6 (blue)

**Personagens (NPCs):**
- CFO: Terno, graficos na mesa
- CMO: Casual criativo, post-its coloridos
- COO: Organizado, checklist na mao
- CSO: Headset, telefone

**Mobiliario:**
- Mesas de escritorio
- Computadores
- Quadros brancos
- Plantas decorativas
- Cadeiras de escritorio

### 5.2 Opcoes de Implementacao Visual

**Opcao A: CSS Ilustrado (Recomendado para MVP)**
- Usar divs estilizadas com CSS
- Icones de Lucide React para elementos
- Emojis para personagens
- Facil de implementar e iterar

**Opcao B: SVG Customizado**
- Criar ilustracoes em Figma/Illustrator
- Exportar como SVG
- Mais bonito, mais trabalho

**Opcao C: Pixel Art (Estilo OPES)**
- Usar sprite sheets
- Phaser.js ou Pixi.js
- Mais complexo, visual unico

---

## 6. Modelo de Dados Completo

```sql
-- Atividades do feed
CREATE TABLE corporate_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  department VARCHAR(20) NOT NULL,
  agent_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'running',
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Posts de marketing
CREATE TABLE marketing_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  platform VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  scheduled_date DATE,
  posted_date TIMESTAMPTZ,
  image_url VARCHAR(500),
  metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tarefas operacionais
CREATE TABLE operational_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo',
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  assignee VARCHAR(100),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads comerciais
CREATE TABLE sales_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  stage VARCHAR(20) NOT NULL DEFAULT 'prospecting',
  value DECIMAL(18, 2) NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 0,
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
  user_id UUID NOT NULL REFERENCES auth.users(id),
  month DATE NOT NULL, -- Primeiro dia do mes
  target_value DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 7. Dependencias

| Dependencia | Tipo | Status |
|-------------|------|--------|
| EPIC-001 CRM v2 | Prerequisito | Em planejamento |
| Supabase Realtime | Infraestrutura | Disponivel |
| react-beautiful-dnd | Biblioteca | A instalar |
| Recharts | Biblioteca | Ja instalado |

---

## 8. Riscos

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Complexidade visual alta | Alta | Alto | MVP com CSS simples |
| Performance com muitos dados | Media | Medio | Paginacao, virtualizacao |
| Escopo cresce demais | Alta | Alto | Manter MVP rigido |
| Integracao real-time complexa | Media | Medio | Feed estatico primeiro |

---

## 9. Fases de Entrega

### Fase 3.1: Mapa Base (Sprint 5)
- Estrutura do mapa com 4 areas
- Visual basico CSS
- Clique abre placeholder

### Fase 3.2: Dashboards (Sprint 6)
- Dashboard Financeiro
- Dashboard Comercial (Pipeline)
- Dados mockados primeiro

### Fase 3.3: Feed e Kanban (Sprint 7)
- Pipeline Feed funcional
- Dashboard Marketing
- Dashboard Operacional (Kanban)
- Integracoes completas

---

## 10. User Stories Principais

### US-201: Ver Escritorio
**Como** empresario
**Quero** ver minha empresa como um escritorio virtual
**Para que** eu tenha uma visao clara e engajadora dos departamentos

### US-202: Acessar Departamento
**Como** empresario
**Quero** clicar em um departamento e ver suas metricas
**Para que** eu tenha acesso rapido as informacoes que preciso

### US-203: Gerenciar Pipeline
**Como** empresario
**Quero** ver e gerenciar meus leads de vendas visualmente
**Para que** eu acompanhe o progresso comercial

### US-204: Ver Atividades
**Como** empresario
**Quero** ver um feed de atividades dos departamentos
**Para que** eu saiba o que esta acontecendo em tempo real

---

*PRD criado por Morgan (AIOS PM) - 2026-02-14*
