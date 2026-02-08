# AIOS Virtual Office - Product Requirements Document

> **Document Type:** Brownfield Enhancement PRD
> **Version:** 1.1
> **Status:** APROVADO COM RESSALVAS
> **Created:** 2025-02-08
> **Updated:** 2025-02-08
> **Author:** Morgan (PM Agent)
> **PO Review:** Sophie (PO Agent) - Aprovado com Ressalvas

---

## PO Review Summary

| Reviewer | Decision | Date |
|----------|----------|------|
| Sophie (PO) | APROVADO COM RESSALVAS | 2025-02-08 |

### Conditions for Final Approval

| # | Condition | Owner | Status | Deadline |
|---|-----------|-------|--------|----------|
| 1 | Spike tecnico: React + Pixi.js + AIOS Bridge | Aria (Architect) | PENDENTE | Sprint 0 |
| 2 | Definir estrategia de assets (emojis/sprites/custom) | Luna (UX) | PENDENTE | Antes de Story 1.3 |
| 3 | Story 1.0 Mock Mode adicionada | Morgan (PM) | CONCLUIDO | v1.1 |
| 4 | Story 1.5 (Baloes) movida para Phase 2 | Morgan (PM) | CONCLUIDO | v1.1 |

### PO Recommendations

1. **Comece pelo Spike Tecnico** - Valide React + Pixi.js + AIOS Bridge antes de qualquer sprite
2. **Use Placeholders** - Emojis + circulos coloridos funcionam para validar UX
3. **MVP Real = Mapa + Agentes + Status + Clique** - Isso entrega 80% do valor

---

## 1. Executive Summary

### 1.1 Vision Statement

Criar um **escritorio virtual 2D isometrico** estilo Gather.town para visualizacao e interacao com os agentes AIOS em tempo real. Uma experiencia imersiva onde cada agente e representado por um avatar animado em seu departamento, reportando atividades e permitindo interacao direta com o usuario.

### 1.2 Product Goals

| ID | Goal | Success Metric |
|----|------|----------------|
| G1 | Visualizar todos os agentes AIOS trabalhando em tempo real | 100% dos agentes visiveis com status atualizado |
| G2 | Interagir com agentes atraves do escritorio virtual | < 2 cliques para iniciar conversa com qualquer agente |
| G3 | Monitorar progresso de tarefas de forma visual | Feed de atividades com latencia < 500ms |
| G4 | Criar senso de "equipe virtual" trabalhando junto | NPS de experiencia do usuario > 8/10 |
| G5 | Engajamento com o escritorio virtual | Session time > 5 minutos na primeira visita |

### 1.3 Background Context

O sistema AIOS (AI-Orchestrated System) possui 10+ agentes especializados que trabalham em tarefas de desenvolvimento de software. Atualmente, a interacao e puramente via CLI/terminal, sem representacao visual do "time" trabalhando.

Este projeto visa criar uma camada de visualizacao que:
- Humaniza os agentes AI atraves de avatares animados
- Organiza visualmente os agentes por departamentos
- Permite monitorar atividades em tempo real
- Facilita a atribuicao de tarefas via interface visual

---

## 2. Intro Project Analysis and Context

### 2.1 Analysis Source

- **Type:** IDE-based fresh analysis + User elicitation
- **Base Project:** SPFP (React 19 + TypeScript + Vite + TailwindCSS)
- **Integration:** New module standalone que se integra com AIOS Core

### 2.2 Current Project State

O projeto SPFP e uma aplicacao de planejamento financeiro pessoal. O AIOS Virtual Office sera desenvolvido como um **modulo separado** que pode ser acessado dentro do SPFP ou como aplicacao standalone.

**Tech Stack Existente (SPFP):**
- React 19 + TypeScript
- Vite como bundler
- TailwindCSS para estilizacao
- Supabase para backend (opcional para persistencia)

### 2.3 Available Documentation

| Document | Status | Notes |
|----------|--------|-------|
| Tech Stack Documentation | OK | docs/architecture/tech-stack.md |
| Source Tree/Architecture | OK | docs/architecture/source-tree.md |
| Coding Standards | OK | docs/architecture/coding-standards.md |
| AIOS Agent Definitions | OK | .aios-core/ e aios-core-main/ |

### 2.4 Enhancement Scope Definition

**Enhancement Type:**
- [x] New Feature Addition
- [x] Integration with New Systems (Pixi.js engine)
- [ ] Major Feature Modification
- [ ] Performance/Scalability Improvements
- [ ] UI/UX Overhaul
- [ ] Technology Stack Upgrade
- [ ] Bug Fix and Stability Improvements

**Enhancement Description:**
Desenvolver um escritorio virtual 2D isometrico usando React + Pixi.js onde os agentes AIOS sao representados como avatares animados, organizados por departamentos, com capacidade de reportar atividades em tempo real e receber tarefas do usuario.

**Impact Assessment:**
- [x] Minimal Impact (isolated additions) - Modulo novo e isolado
- [ ] Moderate Impact
- [ ] Significant Impact
- [ ] Major Impact

---

## 3. User Personas

### 3.1 Primary Persona: Developer/Project Owner (MVP Focus)

| Attribute | Description |
|-----------|-------------|
| **Name** | Fernando (Usuario AIOS) |
| **Role** | Product Owner / Developer |
| **Goals** | Visualizar equipe AI trabalhando, atribuir tarefas, monitorar progresso |
| **Pain Points** | CLI-only e impessoal, dificil ver "big picture" da equipe |
| **Tech Comfort** | Alto - usa ferramentas de desenvolvimento diariamente |

### 3.2 Secondary Persona: Team Observer (Post-MVP)

> **PO Note:** Persona secundaria adiada para pos-MVP. Focar 100% na persona primaria.

| Attribute | Description |
|-----------|-------------|
| **Name** | Stakeholder Externo |
| **Role** | Cliente ou Gerente observando progresso |
| **Goals** | Entender quem esta trabalhando em que |
| **Pain Points** | Nao entende CLI, precisa de visualizacao amigavel |
| **Tech Comfort** | Medio - prefere interfaces visuais |

---

## 4. Use Cases

### 4.1 Core Use Cases

| UC-ID | Use Case | Actor | Priority |
|-------|----------|-------|----------|
| UC-01 | Visualizar Escritorio | User | Must Have |
| UC-02 | Ver Status do Agente | User | Must Have |
| UC-03 | Clicar para Interagir | User | Must Have |
| UC-04 | Ver Feed de Atividades | User | Must Have |
| UC-05 | Atribuir Tarefa ao Agente | User | Should Have |
| UC-06 | Navegar por Departamentos | User | Should Have |
| UC-07 | Personalizar Avatar | User | Could Have |
| UC-08 | Configurar Notificacoes | User | Could Have |

### 4.2 Use Case Details

#### UC-01: Visualizar Escritorio

**Trigger:** Usuario acessa o Virtual Office
**Preconditions:** Aplicacao carregada
**Flow:**
1. Sistema renderiza mapa 2D isometrico
2. Sistema posiciona avatares dos agentes por departamento
3. Sistema inicia animacoes de estado (idle/working)
4. Usuario visualiza escritorio completo

**Postconditions:** Mapa renderizado com todos os agentes visiveis

#### UC-03: Clicar para Interagir

**Trigger:** Usuario clica em um avatar de agente
**Preconditions:** Escritorio renderizado
**Flow:**
1. Usuario clica no avatar do agente
2. Sistema abre painel lateral com detalhes do agente
3. Painel mostra: nome, role, status atual, historico recente
4. Usuario pode iniciar conversa ou atribuir tarefa

**Postconditions:** Painel de interacao aberto

---

## 5. Requirements

### 5.1 Functional Requirements

| ID | Requirement | Priority | Complexity |
|----|-------------|----------|------------|
| FR0 | Modo Mock para desenvolvimento sem AIOS conectado | Must Have | Medium |
| FR1 | Renderizar mapa 2D isometrico do escritorio usando Pixi.js | Must Have | High |
| FR2 | Exibir avatares animados para cada agente AIOS (10 agentes) | Must Have | High |
| FR3 | Organizar agentes visualmente em 5 departamentos | Must Have | Medium |
| FR4 | Mostrar estados visuais do agente (idle, working, thinking) | Must Have | Medium |
| FR5 | Exibir baloes de fala com atividade atual do agente | Should Have | Medium |
| FR6 | Abrir painel de detalhes ao clicar em agente | Must Have | Medium |
| FR7 | Exibir feed/timeline lateral de atividades | Must Have | Medium |
| FR8 | Receber updates de atividade em tempo real via events | Must Have | High |
| FR9 | Permitir atribuir tarefa ao agente via painel | Should Have | Medium |
| FR10 | Notificar quando tarefa e concluida | Should Have | Low |
| FR11 | Navegar pelo mapa com pan/zoom | Should Have | Medium |
| FR12 | Avatar do usuario pode se mover pelo mapa | Could Have | High |
| FR13 | Chat integrado com agente pelo escritorio | Could Have | High |
| FR14 | Historico completo de tarefas por agente | Should Have | Medium |
| FR15 | Metricas de produtividade por departamento | Could Have | Medium |
| FR16 | Sons e musica ambiente do escritorio | Could Have | Low |
| FR17 | Personalizacao de avatares | Could Have | Medium |
| FR18 | Tema dia/noite automatico | Could Have | Low |

### 5.2 Non-Functional Requirements

| ID | Requirement | Target | Rationale |
|----|-------------|--------|-----------|
| NFR1 | Performance de renderizacao | 60 FPS com 15+ sprites | Experiencia fluida |
| NFR2 | Latencia de updates | < 500ms | Sensacao de tempo real |
| NFR3 | Tempo de carregamento inicial | < 3s | UX responsiva |
| NFR4 | Resolucao minima suportada | 1280x720 | Maioria dos monitores |
| NFR5 | Memoria maxima | < 200MB | Nao impactar sistema |
| NFR6 | Offline capability | Funcionar sem internet | Desenvolvimento local |
| NFR7 | Extensibilidade | Adicionar agentes sem rebuild | Manutencao facil |
| NFR8 | Acessibilidade | Keyboard navigation basica | Inclusao |

### 5.3 Compatibility Requirements

| ID | Requirement | Description |
|----|-------------|-------------|
| CR1 | React Compatibility | Integrar com React 19 existente via componente |
| CR2 | AIOS Event System | Consumir eventos do sistema AIOS via bridge |
| CR3 | TailwindCSS | UI panels usando Tailwind existente |
| CR4 | TypeScript | Todo codigo tipado com TS strict |

---

## 6. User Interface Enhancement Goals

### 6.1 Visual Design Direction

**Style:** 2D Isometrico estilo Gather.town
**Palette:** Cores vibrantes por departamento
**Mood:** Profissional mas amigavel, como um escritorio moderno de tech

### 6.2 Department Layout

```
+---------------------------------------------------------------------+
|                        AIOS VIRTUAL OFFICE                           |
+---------------+---------------+---------------+---------------------+
|   PRODUCT     |  ENGINEERING  |    QUALITY    |     DESIGN          |
|   ---------   |  -----------  |    -------    |     ------          |
|   Morgan      |   Dex         |   Quinn       |    Luna             |
|   (PM)        |   (Dev)       |   (QA)        |    (UX)             |
|               |               |               |                     |
|   Sophie      |   Aria        |               |                     |
|   (PO)        |   (Architect) |               |                     |
|               |               |               |                     |
|   Max         |   Nova        |               |                     |
|   (SM)        |   (Data Eng)  |               |                     |
+---------------+---------------+---------------+---------------------+
|                         OPERATIONS                                   |
|   Atlas (Analyst)     Gage (DevOps)     Orion (Master)              |
+---------------------------------------------------------------------+
```

### 6.3 Agent Visual States

| State | Animation | Visual Indicator |
|-------|-----------|------------------|
| Idle | Breathing suave, olhar ao redor | Nenhum badge |
| Working | Digitando, movimento ativo | Badge verde pulsante |
| Thinking | Bolha de pensamento, mao no queixo | Badge amarelo |
| Waiting | Parado, olhando para frente | Badge cinza |
| Error | Gesture de confusao | Badge vermelho |

### 6.4 UI Components

| Component | Location | Description |
|-----------|----------|-------------|
| Office Map | Center (70%) | Mapa isometrico principal |
| Activity Feed | Right sidebar (30%) | Timeline de atividades |
| Agent Panel | Modal/Overlay | Detalhes ao clicar no agente |
| Department Tabs | Top | Navegacao rapida por departamento |
| Mini-map | Bottom-right | Visao geral do escritorio |

---

## 7. Technical Constraints and Integration Requirements

### 7.1 Technology Stack

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Frontend Framework | React | 19.x | Existing in SPFP |
| 2D Engine | Pixi.js | 8.x | Isometric rendering |
| Animation | @pixi/spine ou sprite sheets | Latest | Character animations |
| State Management | Zustand ou Context | - | Lightweight |
| Real-time Events | EventEmitter / Custom Bridge | - | AIOS integration |
| Styling | TailwindCSS | 3.x | Existing in SPFP |
| Build | Vite | 6.x | Existing in SPFP |

### 7.2 Integration Architecture

```
+--------------------------------------------------------------+
|                     User Interface Layer                      |
|  +-----------------+  +-----------------+  +--------------+   |
|  |   Office Map    |  |  Activity Feed  |  | Agent Panel  |   |
|  |   (Pixi.js)     |  |   (React)       |  |  (React)     |   |
|  +--------+--------+  +--------+--------+  +------+-------+   |
+-----------|--------------------|------------------|------------+
            |                    |                  |
            v                    v                  v
+--------------------------------------------------------------+
|                    State Management Layer                     |
|  +----------------------------------------------------------+ |
|  |                Virtual Office Store                       | |
|  |  - agents: Agent[]                                        | |
|  |  - activities: Activity[]                                 | |
|  |  - departments: Department[]                              | |
|  |  - selectedAgent: Agent | null                            | |
|  |  - mockMode: boolean                                      | |
|  +----------------------------------------------------------+ |
+--------------------------------------------------------------+
            |
            v
+--------------------------------------------------------------+
|                    Integration Layer                          |
|  +----------------------------------------------------------+ |
|  |                   AIOS Bridge                             | |
|  |  - EventEmitter for activity updates                      | |
|  |  - Task assignment API                                    | |
|  |  - Agent status polling/subscription                      | |
|  |  - Mock data provider (when AIOS unavailable)             | |
|  +----------------------------------------------------------+ |
+--------------------------------------------------------------+
            |
            v
+--------------------------------------------------------------+
|                    AIOS Core (External)                       |
|  +-----------------+  +-----------------+  +--------------+   |
|  |  Claude Code    |  |  Agent System   |  | Task Manager |   |
|  +-----------------+  +-----------------+  +--------------+   |
+--------------------------------------------------------------+
```

### 7.3 File Structure (Proposed)

```
src/
+-- virtual-office/
    +-- components/
    |   +-- VirtualOffice.tsx       # Main container
    |   +-- OfficeMap.tsx           # Pixi.js canvas
    |   +-- AgentSprite.tsx         # Individual agent sprite
    |   +-- DepartmentArea.tsx      # Department visual area
    |   +-- ActivityFeed.tsx        # Right sidebar
    |   +-- AgentPanel.tsx          # Agent detail modal
    |   +-- SpeechBubble.tsx        # Activity bubble (Phase 2)
    +-- engine/
    |   +-- PixiApp.ts              # Pixi application setup
    |   +-- IsometricGrid.ts        # Isometric math utilities
    |   +-- SpriteManager.ts        # Sprite loading/caching
    |   +-- AnimationController.ts  # Animation state machine
    +-- store/
    |   +-- virtualOfficeStore.ts   # Zustand store
    +-- bridge/
    |   +-- AIOSBridge.ts           # AIOS integration
    |   +-- MockBridge.ts           # Mock data for development
    |   +-- EventTypes.ts           # Event type definitions
    +-- data/
    |   +-- agents.ts               # Agent definitions
    |   +-- departments.ts          # Department layouts
    |   +-- mockActivities.ts       # Mock activity data
    +-- assets/
    |   +-- sprites/                # Character spritesheets
    |   +-- tiles/                  # Floor/wall tiles
    |   +-- ui/                     # UI icons
    +-- types/
        +-- virtualOffice.types.ts  # TypeScript types
```

### 7.4 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Pixi.js learning curve | Medium | Medium | Start with simple sprites, iterate |
| Performance with many animations | Medium | High | Sprite pooling, LOD system |
| AIOS Bridge complexity | High | High | **SPIKE TECNICO ANTES DO MVP** |
| Asset creation (sprites) | High | Medium | **DEFINIR ESTRATEGIA ANTES DE 1.3** |
| Real-time sync issues | Medium | Medium | Optimistic UI + reconciliation |

---

## 8. Epic and Story Structure

### 8.1 Epic Approach Decision

**Decision:** Single Epic com stories sequenciais
**Rationale:** O Virtual Office e uma feature coesa que deve ser entregue incrementalmente, mas todas as partes contribuem para um unico objetivo: visualizacao do escritorio virtual.

### 8.2 Recommended Story Order (PO Approved)

```
Sprint 0 (Pre-requisites):
  - Spike Tecnico: AIOS Bridge viability
  - Asset Strategy Decision

Phase 1 MVP:
  1.0 -> 1.1 -> 1.8 -> 1.2 -> 1.3 -> 1.4 -> 1.5 -> 1.6

Justificativa:
  - 1.0 (Mock Mode) permite desenvolvimento independente
  - 1.8 (Bridge) deve vir cedo para validar viabilidade tecnica
  - Se Bridge falhar, o projeto muda completamente
```

---

## Epic 1: AIOS Virtual Office MVP

**Epic Goal:** Entregar um escritorio virtual funcional onde usuarios podem visualizar agentes trabalhando, ver atividades em tempo real, e interagir com agentes atraves de cliques.

**Integration Requirements:**
- Integrar com sistema de eventos AIOS
- Manter compatibilidade com React 19 + Vite
- Usar TailwindCSS para componentes de UI

**Total MVP Story Points:** 44 (reduzido de 49)

---

### Story 1.0: Mock Mode para Desenvolvimento (NEW)

**As a** developer,
**I want** um modo mock que simula atividades dos agentes,
**so that** eu possa desenvolver e testar sem precisar do AIOS conectado.

**Acceptance Criteria:**

1. AC1: Flag `mockMode` no store ativa/desativa modo mock
2. AC2: MockBridge gera atividades aleatorias dos agentes
3. AC3: Agentes mudam de estado automaticamente (idle -> working -> thinking)
4. AC4: Mock gera eventos de tarefa inicio/progresso/conclusao
5. AC5: UI toggle para ativar/desativar mock mode
6. AC6: Mock data realista baseado nos agentes AIOS reais

**Integration Verification:**

- IV1: Aplicacao funciona 100% sem AIOS conectado
- IV2: Transicao suave entre mock e modo real
- IV3: Nenhum erro quando AIOS esta offline

**Story Points:** 5

---

### Story 1.1: Setup do Projeto e Engine Pixi.js

**As a** developer,
**I want** configurar o ambiente Pixi.js integrado com React,
**so that** eu tenha a base para renderizar o escritorio 2D.

**Acceptance Criteria:**

1. AC1: Pixi.js 8.x instalado e configurado no projeto
2. AC2: Componente React wrapper para Pixi Application funcionando
3. AC3: Canvas responsivo que preenche area designada
4. AC4: Hot reload funcionando com Pixi durante desenvolvimento
5. AC5: TypeScript types configurados para Pixi.js

**Integration Verification:**

- IV1: npm run dev funciona sem erros apos instalacao
- IV2: Existing SPFP routes continuam funcionando
- IV3: Build de producao inclui Pixi.js corretamente

**Story Points:** 5

---

### Story 1.2: Mapa Isometrico Base

**As a** user,
**I want** ver um mapa 2D isometrico do escritorio,
**so that** eu tenha um espaco visual para os agentes.

**Acceptance Criteria:**

1. AC1: Grid isometrico renderizado com tiles de chao
2. AC2: 5 areas de departamento visualmente distintas
3. AC3: Cores diferentes por departamento
4. AC4: Labels de departamento visiveis
5. AC5: Mapa centralizado na viewport inicial

**Integration Verification:**

- IV1: Renderizacao mantem 60 FPS
- IV2: Sem memory leaks apos resize da janela
- IV3: Funciona em 1280x720 minimo

**Story Points:** 8

---

### Story 1.3: Avatares dos Agentes

**PREREQUISITE:** Asset Strategy must be defined by Luna (UX)

**As a** user,
**I want** ver avatares representando cada agente AIOS,
**so that** eu possa identificar visualmente quem esta trabalhando.

**Acceptance Criteria:**

1. AC1: 10 sprites de agentes renderizados no mapa
2. AC2: Cada agente posicionado em seu departamento correto
3. AC3: Sprites com animacao basica de "idle" (breathing)
4. AC4: Nome do agente visivel abaixo do avatar
5. AC5: Icone/emoji do role visivel no avatar

**Asset Strategy Options:**
- Option A: Emojis grandes (rapido, funcional)
- Option B: Sprites prontos (ex: craftpix.net)
- Option C: Custom sprites (mais demorado)

**Integration Verification:**

- IV1: Sprites carregam em < 1s
- IV2: Animacoes nao impactam FPS
- IV3: Posicoes persistem apos pan/zoom

**Story Points:** 8

---

### Story 1.4: Estados Visuais dos Agentes

**As a** user,
**I want** ver diferentes estados visuais dos agentes (working, thinking, idle),
**so that** eu saiba o que cada agente esta fazendo.

**Acceptance Criteria:**

1. AC1: Estado "idle" com animacao suave
2. AC2: Estado "working" com animacao de digitacao + badge verde
3. AC3: Estado "thinking" com bolha de pensamento + badge amarelo
4. AC4: Transicoes suaves entre estados (fade)
5. AC5: Estados atualizaveis via API/store

**Integration Verification:**

- IV1: Mudanca de estado < 100ms
- IV2: Memoria estavel durante transicoes
- IV3: Estados refletem corretamente dados do store

**Story Points:** 5

---

### Story 1.5: Painel de Detalhes do Agente

**As a** user,
**I want** clicar em um agente e ver seus detalhes em um painel,
**so that** eu possa ver mais informacoes e iniciar interacao.

**Acceptance Criteria:**

1. AC1: Clicar em agente abre painel lateral (slide-in)
2. AC2: Painel mostra: avatar grande, nome, role, departamento
3. AC3: Painel mostra status atual e atividade
4. AC4: Painel mostra historico das ultimas 5 atividades
5. AC5: Botao "Atribuir Tarefa" visivel no painel
6. AC6: Clicar fora fecha o painel

**Integration Verification:**

- IV1: Painel usa TailwindCSS (consistencia visual)
- IV2: Animacao de abertura < 200ms
- IV3: Dados do agente atualizados em real-time

**Story Points:** 5

---

### Story 1.6: Feed de Atividades

**As a** user,
**I want** ver um feed lateral com todas as atividades dos agentes,
**so that** eu tenha uma visao geral do que esta acontecendo.

**Acceptance Criteria:**

1. AC1: Sidebar direita com lista de atividades
2. AC2: Cada item mostra: avatar mini, agente, acao, timestamp
3. AC3: Novas atividades aparecem no topo com animacao
4. AC4: Scroll para ver atividades antigas
5. AC5: Clicar em atividade destaca o agente no mapa
6. AC6: Limite de 50 atividades visiveis (virtualizacao)

**Integration Verification:**

- IV1: Feed atualiza em < 500ms
- IV2: Scroll suave mesmo com muitas atividades
- IV3: Nao consome memoria excessiva

**Story Points:** 5

---

### Story 1.7: AIOS Bridge - Integracao de Eventos

**CRITICAL:** Spike tecnico deve ser realizado ANTES desta story

**As a** developer,
**I want** integrar o Virtual Office com o sistema de eventos do AIOS,
**so that** as atividades dos agentes aparecam em tempo real.

**Acceptance Criteria:**

1. AC1: Bridge recebe eventos de inicio de tarefa
2. AC2: Bridge recebe eventos de progresso de tarefa
3. AC3: Bridge recebe eventos de conclusao de tarefa
4. AC4: Bridge recebe eventos de mudanca de estado do agente
5. AC5: Events disparam atualizacoes no store
6. AC6: Fallback para MockBridge se eventos nao disponiveis

**Integration Verification:**

- IV1: Latencia de eventos < 500ms
- IV2: Sem perda de eventos durante picos
- IV3: Graceful degradation se AIOS offline

**Story Points:** 8

---

## Phase 2 Stories

### Story 2.1: Baloes de Fala (Moved from MVP)

**As a** user,
**I want** ver baloes de fala mostrando o que cada agente esta fazendo,
**so that** eu entenda a atividade atual sem precisar clicar.

**Acceptance Criteria:**

1. AC1: Balao de fala aparece acima do agente quando ativo
2. AC2: Texto do balao mostra atividade resumida (max 50 chars)
3. AC3: Balao desaparece apos 5s de inatividade
4. AC4: Multiplos baloes nao se sobrepoem
5. AC5: Animacao de entrada/saida do balao

**Integration Verification:**

- IV1: Baloes nao afetam performance
- IV2: Z-index correto (baloes acima de sprites)
- IV3: Texto legivel em todas as resolucoes

**Story Points:** 5

---

### Story 2.2: Navegacao e Zoom

**As a** user,
**I want** navegar pelo mapa com pan e zoom,
**so that** eu possa focar em areas especificas.

**Acceptance Criteria:**

1. AC1: Pan com drag do mouse
2. AC2: Zoom com scroll wheel
3. AC3: Limites de zoom (min/max)
4. AC4: Limites de pan (nao sair do mapa)
5. AC5: Mini-mapa mostrando posicao atual
6. AC6: Double-click para centralizar em agente

**Integration Verification:**

- IV1: Pan/zoom fluido a 60 FPS
- IV2: Nao afeta performance de animacoes
- IV3: Estado de camera persiste durante sessao

**Story Points:** 5

---

### Story 2.3: Atribuicao de Tarefas

**As a** user,
**I want** atribuir tarefas a um agente pelo painel,
**so that** eu possa delegar trabalho visualmente.

**Acceptance Criteria:**

1. AC1: Botao "Atribuir Tarefa" abre modal de input
2. AC2: Modal tem campo de texto para descricao da tarefa
3. AC3: Dropdown para prioridade (low/medium/high)
4. AC4: Botao confirmar envia tarefa para o agente
5. AC5: Feedback visual de sucesso/erro
6. AC6: Agente muda para estado "working" apos atribuicao

**Integration Verification:**

- IV1: Integracao com sistema de tasks AIOS
- IV2: Tarefa aparece no feed de atividades
- IV3: Estado do agente atualiza corretamente

**Story Points:** 5

---

## 9. Delivery Phases

### Sprint 0: Pre-requisites (CRITICAL)

**Goal:** Validar viabilidade tecnica antes de iniciar MVP
**Deliverables:**
- Spike: React + Pixi.js integration POC
- Spike: AIOS Bridge communication test
- Decision: Asset strategy (emojis vs sprites vs custom)

**Exit Criteria:**
- Pixi.js renderiza dentro de React component
- Conseguimos receber/enviar eventos para Claude Code
- Asset strategy definida e documentada

---

### Phase 1: MVP (Stories 1.0 - 1.7)

**Goal:** Escritorio funcional com visualizacao e feed
**Total Story Points:** 44
**Deliverables:**
- Mock mode para desenvolvimento
- Mapa isometrico renderizado
- 10 agentes com avatares animados
- Estados visuais (idle/working/thinking)
- Painel de detalhes
- Feed de atividades
- Integracao basica com AIOS

---

### Phase 2: Enhanced Interaction (Stories 2.1 - 2.3 + extras)

**Goal:** Navegacao e interacao completa
**Deliverables:**
- Baloes de fala
- Pan/zoom do mapa
- Mini-mapa
- Atribuicao de tarefas
- Chat integrado com agente

---

### Phase 3: Polish & Features (v1.1+)

**Goal:** Experiencia premium
**Deliverables:**
- Avatar do usuario com movimento
- Sons e musica ambiente
- Personalizacao de avatares
- Metricas por departamento
- Tema dia/noite

---

## 10. Success Criteria

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Render Performance | 60 FPS sustained | Chrome DevTools |
| Activity Latency | < 500ms | Network timing |
| Load Time | < 3s initial | Lighthouse |
| Agent Visibility | 100% agents visible | Manual QA |
| User Interaction | < 2 clicks to interact | User testing |
| Crash Rate | 0% during normal use | Error monitoring |
| **Session Engagement** | > 5 min first visit | Analytics |

---

## 11. Risks and Mitigations

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| Pixi.js complexity | Medium | High | POC com sprites simples primeiro |
| Asset creation | High | Medium | **DEFINIR ESTRATEGIA NO SPRINT 0** |
| AIOS integration | High | High | **SPIKE TECNICO NO SPRINT 0** |
| Performance | Medium | High | Profile continuo, sprite pooling |
| Scope creep | Medium | Medium | MVP strict, features em phases |

---

## 12. Open Questions

| ID | Question | Owner | Status | Priority | Resolution |
|----|----------|-------|--------|----------|------------|
| Q1 | Usar spritesheets prontos ou criar custom? | Luna (UX) | **RESOLVED** | BLOCKER para Story 1.3 | **Hibrido: CSS Avatars + Emojis (MVP), Sprites (Phase 2)** - Ver docs/design/asset-strategy-virtual-office.md |
| Q2 | WebSocket vs polling para eventos? | Aria (Architect) | **RESOLVED** | Sprint 0 Spike | **Polling via Vite Middleware (500ms)** - Ver spike-aios-virtual-office.md |
| Q3 | Persistir estado do escritorio em Supabase? | Nova (Data) | Open | Phase 2 | - |
| Q4 | Integracao com Claude Code hooks? | Gage (DevOps) | **RESOLVED** | Sprint 0 Spike | **Sim, via PostToolUse e Stop hooks** - Ver spike-aios-virtual-office.md |

---

## 13. Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Initial draft | 2025-02-08 | 1.0 | PRD created based on Atlas analysis | Morgan (PM) |
| PO Review | 2025-02-08 | 1.1 | Added Story 1.0 Mock Mode, moved Baloes to Phase 2, added PO conditions, reordered stories, added engagement metric | Morgan (PM) based on Sophie (PO) review |
| Spike Tecnico | 2025-02-08 | 1.2 | Spike completo: GO para React+Pixi.js e AIOS Bridge. Q2 e Q4 resolvidas. | Aria (Architect) |
| Asset Strategy | 2025-02-08 | 1.3 | Asset strategy definida: CSS Avatars + Emojis (MVP), Sprites (Phase 2). Q1 resolvida. | Luna (UX) |

---

## 14. Approvals

| Role | Name | Decision | Date | Notes |
|------|------|----------|------|-------|
| Analyst | Atlas | APPROVED | 2025-02-08 | Analysis complete |
| PM | Morgan | APPROVED | 2025-02-08 | PRD v1.1 complete |
| PO | Sophie | APPROVED WITH CONDITIONS | 2025-02-08 | See conditions above |
| Architect | Aria | **GO - APPROVED** | 2025-02-08 | Spike completo: docs/architecture/spike-aios-virtual-office.md |
| UX | Luna | **APPROVED** | 2025-02-08 | Asset strategy: docs/design/asset-strategy-virtual-office.md |
| Dev | Dex | PENDING | - | Feasibility assessment |

---

**Document Status:** APROVADO COM RESSALVAS

**Next Steps:**
1. ~~[CRITICAL] Aria (Architect) - Spike tecnico AIOS Bridge~~ **DONE - GO**
2. ~~[CRITICAL] Luna (UX) - Definir asset strategy~~ **DONE - CSS Avatars + Emojis**
3. [READY] **TODAS AS STORIES DESBLOQUEADAS** - Dev pode iniciar MVP completo

---

*Generated by Morgan (PM Agent) - AIOS Virtual Office PRD v1.1*
*Updated with Sophie (PO) review conditions*
