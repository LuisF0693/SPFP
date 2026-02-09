# PRD - Pixel Art Virtual Office v2.0

**Product Manager:** Morgan (AIOS PM)
**Data:** 2026-02-09
**Versao:** 1.0
**Status:** Draft - Aguardando Validacao PO

---

## 1. Visao do Produto

### 1.1 Declaracao de Visao

Transformar o AIOS Virtual Office em uma experiencia imersiva estilo **Gather.town**, onde os agentes de IA sao representados como personagens pixel art em um escritorio 2D interativo, permitindo que usuarios visualizem, interajam e colaborem com seus agentes de forma intuitiva e engajante.

### 1.2 Problema que Resolve

| Problema Atual | Solucao Proposta |
|----------------|------------------|
| Visualizacao abstrata dos agentes | Avatares pixel art com personalidade |
| Falta de contexto espacial | Mapa 2D com departamentos e areas |
| Interacao limitada | Movimento, chat, proximidade |
| Experiencia generica | Ambiente nostalgico e imersivo |

### 1.3 Proposta de Valor

> "Seu time de IA ganha vida em um escritorio virtual pixel art - veja seus agentes trabalhando, interaja em tempo real e sinta-se parte de uma equipe real."

---

## 2. Personas e Usuarios

### 2.1 Persona Primaria: Tech Lead / Dev Manager

**Nome:** Carlos, 32 anos
**Cargo:** Tech Lead
**Contexto:** Gerencia equipe de desenvolvimento com suporte de agentes AIOS

**Necessidades:**
- Visualizar rapidamente o status de todos os agentes
- Entender qual agente esta trabalhando em que
- Interagir facilmente para atribuir tarefas
- Sentir conexao com a equipe virtual

**Frustracao atual:**
- "Os agentes parecem abstratos, quero ve-los como colegas"

### 2.2 Persona Secundaria: Solo Developer

**Nome:** Ana, 28 anos
**Cargo:** Full-stack Developer
**Contexto:** Trabalha sozinha com varios agentes AIOS

**Necessidades:**
- Ambiente de trabalho menos solitario
- Visualizacao clara de quem faz o que
- Experiencia gamificada e divertida

---

## 3. Features e Escopo

### 3.1 MVP (Milestone 1) - "O Escritorio Ganha Vida"

| ID | Feature | Descricao | Prioridade |
|----|---------|-----------|------------|
| F001 | **Mapa Pixel Art** | Escritorio 2D com tiles 32x32, departamentos demarcados | Must Have |
| F002 | **Agent Sprites** | Cada agente AIOS como personagem pixel art animado | Must Have |
| F003 | **Status Visual** | Indicadores visuais de idle/working/thinking nos sprites | Must Have |
| F004 | **Name Labels** | Nome do agente flutuando sobre o sprite | Must Have |
| F005 | **Departamentos** | Areas visuais: Product, Engineering, Quality, Design, Ops | Must Have |
| F006 | **AIOS Bridge** | Integracao com eventos existentes (tool_start, agent_state) | Must Have |
| F007 | **Camera Control** | Pan e zoom no mapa (como hoje) | Must Have |

### 3.2 Release 1.1 - "Interatividade"

| ID | Feature | Descricao | Prioridade |
|----|---------|-----------|------------|
| F008 | **User Avatar** | Avatar do usuario movimentavel pelo mapa | Should Have |
| F009 | **Collision System** | Nao atravessar paredes e mobilia | Should Have |
| F010 | **Chat Bubbles** | Baloes de fala mostrando atividade atual | Should Have |
| F011 | **Animacoes Ricas** | Digitando, pensando, conversando, celebrando | Should Have |
| F012 | **Mini-map** | Visao geral do escritorio (upgrade do atual) | Should Have |

### 3.3 Release 1.2 - "Personalizacao"

| ID | Feature | Descricao | Prioridade |
|----|---------|-----------|------------|
| F013 | **Avatar Customizer** | Escolher aparencia do avatar do usuario | Could Have |
| F014 | **Mobilia Interativa** | Clicar em objetos para acoes (whiteboard, TV) | Could Have |
| F015 | **Som Ambiente** | Musica lofi, sons de teclado, notificacoes | Could Have |
| F016 | **Temas de Mapa** | Diferentes estilos de escritorio | Could Have |

### 3.4 Futuro - "Colaboracao Avancada"

| ID | Feature | Descricao | Prioridade |
|----|---------|-----------|------------|
| F017 | **Map Editor** | Admin pode editar layout do escritorio | Won't Have (now) |
| F018 | **Multiplayer** | Multiplos usuarios no mesmo mapa | Won't Have (now) |
| F019 | **Video Chat** | Integracao WebRTC em areas especificas | Won't Have (now) |

---

## 4. User Stories (Alto Nivel)

### 4.1 MVP Stories

```
US001: Como usuario, quero ver um escritorio 2D pixel art para me sentir
       em um ambiente de trabalho real.

US002: Como usuario, quero ver cada agente AIOS como um personagem pixel
       art para humanizar minha equipe de IA.

US003: Como usuario, quero ver animacoes quando um agente esta trabalhando
       para entender visualmente o que esta acontecendo.

US004: Como usuario, quero ver o nome e status de cada agente sobre seu
       sprite para identificar rapidamente quem e quem.

US005: Como usuario, quero ver os departamentos demarcados visualmente
       para entender a organizacao da equipe.

US006: Como usuario, quero fazer pan/zoom no mapa para navegar pelo
       escritorio.
```

### 4.2 Release 1.1 Stories

```
US007: Como usuario, quero mover meu avatar pelo escritorio para me sentir
       presente no ambiente.

US008: Como usuario, quero ver baloes de chat mostrando o que cada agente
       esta fazendo para acompanhar o trabalho.

US009: Como usuario, quero ver um mini-map para ter visao geral e navegar
       rapidamente.
```

---

## 5. Requisitos Tecnicos

### 5.1 Stack Aprovada (Recomendacao Atlas)

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Rendering** | Pixi.js v8 | Performance WebGL, sprite batching |
| **React Bridge** | @pixi/react | Integracao nativa com React |
| **State** | Zustand | Ja usado no projeto |
| **Assets** | TexturePacker | Sprite sheets otimizados |
| **Map Format** | Tiled JSON | Editor de mapas open-source |

### 5.2 Especificacoes de Assets

#### Sprites dos Agentes

| Agente | Sprite Base | Cores | Acessorio |
|--------|-------------|-------|-----------|
| Dex (Dev) | Humano M | Azul | Headphones |
| Quinn (QA) | Humano F | Verde | Clipboard |
| Aria (Architect) | Humano F | Roxo | Blueprint |
| Morgan (PM) | Humano M | Laranja | Notebook |
| Sophie (PO) | Humano F | Rosa | Visao |
| Max (SM) | Humano M | Amarelo | Post-its |
| Luna (UX) | Humano F | Ciano | Palette |
| Atlas (Analyst) | Humano F | Vermelho | Charts |
| Nova (Data) | Humano F | Indigo | Database |
| Gage (DevOps) | Humano M | Cinza | Terminal |

#### Animacoes por Agente (4 direcoes x N frames)

| Animacao | Frames | Uso |
|----------|--------|-----|
| idle | 2 | Parado, respirando |
| walk | 4 | Movendo entre posicoes |
| work | 4 | Digitando no computador |
| think | 3 | Mao no queixo, pensando |
| celebrate | 4 | Task concluida com sucesso |
| error | 2 | Expressao de problema |

#### Tiles do Mapa

| Categoria | Quantidade | Exemplos |
|-----------|------------|----------|
| Pisos | 10 | Carpete roxo, madeira, concreto |
| Paredes | 8 | Parede lisa, janela, porta |
| Mobilia | 25 | Mesa, cadeira, sofa, estante |
| Decoracao | 15 | Planta, quadro, luminaria |
| Tech | 10 | Computador, monitor, server |

### 5.3 Mapa do Escritorio (Layout Inicial)

```
┌─────────────────────────────────────────────────────────────┐
│  ENTRADA     │    LOUNGE/CAFE    │       SALA REUNIAO       │
│   [porta]    │  [sofa][mesa]     │  [mesa grande][cadeiras] │
├──────────────┼───────────────────┼──────────────────────────┤
│              │                   │                          │
│   PRODUCT    │    ENGINEERING    │         QUALITY          │
│  [Morgan]    │  [Dex][Nova]      │      [Quinn]             │
│  [Sophie]    │  [Gage]           │                          │
│              │                   │                          │
├──────────────┼───────────────────┼──────────────────────────┤
│              │                   │                          │
│   DESIGN     │    DATA/ANALYST   │       OPERATIONS         │
│  [Luna]      │  [Atlas]          │      [Max]               │
│  [Aria]      │                   │                          │
│              │                   │                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Metricas de Sucesso

### 6.1 KPIs do Produto

| Metrica | Baseline | Target MVP | Target v1.2 |
|---------|----------|------------|-------------|
| **Tempo no Virtual Office** | 2 min/sessao | 5 min | 10 min |
| **Interacoes com agentes** | 3/sessao | 8 | 15 |
| **NPS do feature** | N/A | 30 | 50 |
| **Performance (FPS)** | N/A | 60fps | 60fps |

### 6.2 Metricas Tecnicas

| Metrica | Target |
|---------|--------|
| Bundle size adicional | < 500KB |
| Memory usage | < 100MB |
| Load time (assets) | < 2s |
| First paint | < 1s |

---

## 7. Riscos e Mitigacoes

| # | Risco | Prob. | Impacto | Mitigacao |
|---|-------|-------|---------|-----------|
| R1 | Assets pixel art demoram para criar | Alta | Alto | Usar assets open-source como placeholder |
| R2 | Performance ruim com muitos sprites | Media | Alto | Sprite batching, LOD, culling |
| R3 | Pixi.js tem curva de aprendizado | Media | Medio | Spike tecnico de 2 dias antes |
| R4 | Integracao com bridge complexa | Baixa | Medio | Bridge ja existe e funciona |
| R5 | Scope creep | Media | Medio | MVP bem definido, PO valida |

---

## 8. Cronograma Proposto

### 8.1 Timeline

```
Semana 1: [Arquitetura + Design]
├── Aria: Arquitetura tecnica, POC Pixi.js
├── Luna: Sprite sheets dos agentes (placeholders)
└── Luna: Tilemap do escritorio

Semana 2: [Desenvolvimento Core]
├── Dex: Setup Pixi.js + React
├── Dex: Sistema de tiles e mapa
├── Dex: Renderizacao de sprites
└── Quinn: Setup testes

Semana 3: [Features MVP]
├── Dex: Animacoes e movimento
├── Dex: Integracao AIOS Bridge
├── Dex: Camera e mini-map
└── Quinn: Testes de integracao

Semana 4: [Polish + Release]
├── Dex: Bug fixes
├── Luna: Assets finais
├── Quinn: QA completo
└── Deploy MVP
```

### 8.2 Milestones

| Milestone | Data Target | Entregaveis |
|-----------|-------------|-------------|
| M0: Kick-off | Dia 1 | PRD aprovado, arquitetura definida |
| M1: POC | Dia 5 | Pixi.js renderizando sprites basicos |
| M2: Alpha | Dia 12 | Mapa + agentes + animacoes basicas |
| M3: Beta | Dia 18 | Bridge integrado, MVP funcional |
| M4: Release | Dia 22 | MVP em producao |

---

## 9. Dependencias

### 9.1 Dependencias Internas

| Dependencia | Owner | Status |
|-------------|-------|--------|
| AIOS Bridge | Existente | OK |
| Zustand Store | Existente | OK |
| Virtual Office atual | Existente | Sera substituido |

### 9.2 Dependencias Externas

| Dependencia | Tipo | Risco |
|-------------|------|-------|
| Pixi.js v8 | npm package | Baixo |
| @pixi/react | npm package | Baixo |
| Assets pixel art | Criacao/compra | Medio |
| Tiled map editor | Ferramenta | Baixo |

---

## 10. Aprovacoes Necessarias

| Papel | Nome | Status | Data |
|-------|------|--------|------|
| Product Owner | Sophie | Pendente | - |
| Tech Lead | Aria | Pendente | - |
| Scrum Master | Max | Pendente | - |

---

## 11. Anexos

### A. Referencias Visuais

- Imagem de referencia: Gather.town screenshot
- Estilo: Pixel art nostalgico (Pokemon, Zelda)
- Paleta: Tons pasteis, confortaveis

### B. Links Uteis

- [Analise Atlas](./01-atlas-analysis.md)
- [PixiJS Docs](https://pixijs.com/)
- [Tiled Map Editor](https://www.mapeditor.org/)
- [OpenGameArt](https://opengameart.org/) - Assets gratuitos

### C. Glossario

| Termo | Definicao |
|-------|-----------|
| **Tile** | Unidade basica do mapa (32x32 pixels) |
| **Sprite** | Imagem 2D animavel de um personagem/objeto |
| **Sprite Sheet** | Imagem contendo multiplos frames de animacao |
| **Tilemap** | Grade de tiles formando o mapa completo |

---

**Documento criado por Morgan (AIOS PM)**
**Proxima etapa:** Sophie (PO) - Validacao e Aprovacao

---

## Historico de Versoes

| Versao | Data | Autor | Mudancas |
|--------|------|-------|----------|
| 1.0 | 2026-02-09 | Morgan | Criacao inicial baseada na analise Atlas |
