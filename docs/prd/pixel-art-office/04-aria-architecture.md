# Arquitetura Tecnica - Pixel Art Virtual Office v2.0

**Arquiteta:** Aria (AIOS Architect)
**Data:** 2026-02-09
**Versao:** 1.0
**Status:** APROVADO

---

## 1. Visao Geral da Arquitetura

### 1.1 Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              REACT APPLICATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PIXEL ART VIRTUAL OFFICE                          │   │
│  │  ┌─────────────────────┐     ┌────────────────────────────────┐     │   │
│  │  │                     │     │        REACT UI LAYER          │     │   │
│  │  │    PIXI.JS CANVAS   │     │  ┌──────────────────────────┐  │     │   │
│  │  │                     │     │  │  OfficeHeader.tsx        │  │     │   │
│  │  │  ┌───────────────┐  │     │  │  ActivityFeed.tsx        │  │     │   │
│  │  │  │  TileMap      │  │     │  │  AgentPanel.tsx          │  │     │   │
│  │  │  │  Layer        │  │     │  │  MiniMap.tsx (React)     │  │     │   │
│  │  │  └───────────────┘  │     │  │  ChatBubbleOverlay.tsx   │  │     │   │
│  │  │  ┌───────────────┐  │     │  └──────────────────────────┘  │     │   │
│  │  │  │  Sprites      │  │     │                                │     │   │
│  │  │  │  Layer        │  │     │  Controls: Pan, Zoom, Select   │     │   │
│  │  │  └───────────────┘  │     └────────────────────────────────┘     │   │
│  │  │  ┌───────────────┐  │                                            │   │
│  │  │  │  Labels/UI    │  │                                            │   │
│  │  │  │  Layer        │  │                                            │   │
│  │  │  └───────────────┘  │                                            │   │
│  │  └─────────────────────┘                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         ZUSTAND STORE                                │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │  │   agents    │ │   camera    │ │    map      │ │  settings   │    │   │
│  │  │   state     │ │   state     │ │   state     │ │   state     │    │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         AIOS BRIDGE                                  │   │
│  │         (Eventos: tool_start, tool_complete, agent_state)           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Decisoes Arquiteturais (ADRs)

| ADR | Decisao | Justificativa |
|-----|---------|---------------|
| ADR-001 | **Pixi.js v8** para rendering | WebGL performance, sprite batching, mature ecosystem |
| ADR-002 | **@pixi/react** para integracao | Permite componentes React declarativos para Pixi |
| ADR-003 | **Zustand** para state | Ja usado no projeto, leve, performatico |
| ADR-004 | **Tiled JSON** para mapas | Editor gratuito, formato padrao, facil de editar |
| ADR-005 | **Camadas separadas** | TileMap, Sprites, UI - facilita manutencao e z-order |
| ADR-006 | **React overlay** para UI complexa | Chat bubbles, panels, tooltips - melhor com React |

---

## 2. Stack Tecnologica

### 2.1 Dependencias Novas

```json
{
  "dependencies": {
    "pixi.js": "^8.0.0",
    "@pixi/react": "^8.0.0",
    "@pixi/spritesheet": "^8.0.0",
    "@pixi/tilemap": "^4.0.0"
  }
}
```

### 2.2 Ferramentas de Desenvolvimento

| Ferramenta | Uso | Link |
|------------|-----|------|
| **Tiled** | Editor de mapas | https://www.mapeditor.org/ |
| **TexturePacker** | Criar sprite sheets | https://www.codeandweb.com/texturepacker |
| **Aseprite** | Criar/editar pixel art | https://www.aseprite.org/ |

---

## 3. Estrutura de Arquivos

```
src/virtual-office-v2/
├── index.ts                      # Export principal
├── PixelArtOffice.tsx            # Componente principal
│
├── pixi/                         # Camada Pixi.js
│   ├── PixiCanvas.tsx            # Container Pixi + React
│   ├── TileMapLayer.tsx          # Renderiza tilemap
│   ├── AgentSprite.tsx           # Sprite de um agente
│   ├── AgentSpriteManager.tsx    # Gerencia todos os sprites
│   └── AnimationController.ts    # Controla animacoes
│
├── components/                   # UI React
│   ├── OfficeHeader.tsx          # Header com controles
│   ├── ChatBubbleOverlay.tsx     # Bubbles sobre o canvas
│   ├── NameLabelOverlay.tsx      # Labels dos agentes
│   ├── MiniMapPixel.tsx          # Mini-map pixel art
│   └── DepartmentLabels.tsx      # Labels dos departamentos
│
├── hooks/                        # Hooks customizados
│   ├── usePixiApp.ts             # Gerencia instancia Pixi
│   ├── useTileMap.ts             # Carrega e gerencia mapa
│   ├── useSpriteSheet.ts         # Carrega sprite sheets
│   ├── useAgentAnimations.ts     # Controla animacoes
│   └── useCameraControls.ts      # Pan/zoom no Pixi
│
├── store/                        # Estado
│   └── pixelOfficeStore.ts       # Extends virtualOfficeStore
│
├── assets/                       # Assets estaticos
│   ├── spritesheets/
│   │   ├── agents.json           # Spritesheet dos agentes
│   │   └── agents.png
│   ├── tiles/
│   │   ├── office-tileset.json   # Tileset do escritorio
│   │   └── office-tileset.png
│   └── maps/
│       └── office-map.json       # Mapa Tiled JSON
│
├── types/                        # Tipos TypeScript
│   ├── pixi.types.ts             # Tipos Pixi
│   ├── tilemap.types.ts          # Tipos do mapa
│   └── animation.types.ts        # Tipos de animacao
│
└── utils/                        # Utilitarios
    ├── spriteUtils.ts            # Helpers para sprites
    ├── tileUtils.ts              # Helpers para tiles
    └── coordinateUtils.ts        # Conversao de coordenadas
```

---

## 4. Componentes Principais

### 4.1 PixelArtOffice.tsx (Componente Raiz)

```typescript
// Estrutura do componente principal
interface PixelArtOfficeProps {
  width?: number;
  height?: number;
  onAgentSelect?: (agentId: AgentId) => void;
}

export function PixelArtOffice({ width = 1200, height = 800 }: PixelArtOfficeProps) {
  return (
    <div className="pixel-art-office">
      {/* Canvas Pixi.js */}
      <PixiCanvas width={width} height={height}>
        <TileMapLayer />
        <AgentSpriteManager />
      </PixiCanvas>

      {/* Overlays React */}
      <ChatBubbleOverlay />
      <NameLabelOverlay />
      <DepartmentLabels />

      {/* UI Controls */}
      <OfficeHeader />
      <MiniMapPixel />
    </div>
  );
}
```

### 4.2 PixiCanvas.tsx (@pixi/react)

```typescript
import { Stage, Container } from '@pixi/react';
import { Application } from 'pixi.js';

interface PixiCanvasProps {
  width: number;
  height: number;
  children: React.ReactNode;
}

export function PixiCanvas({ width, height, children }: PixiCanvasProps) {
  const { camera } = usePixelOfficeStore();

  return (
    <Stage
      width={width}
      height={height}
      options={{
        backgroundColor: 0x1a1a2e,
        antialias: false, // Pixel art precisa de edges crisp
        resolution: 1,
      }}
    >
      <Container
        x={camera.position.x}
        y={camera.position.y}
        scale={camera.zoom}
      >
        {children}
      </Container>
    </Stage>
  );
}
```

### 4.3 AgentSprite.tsx

```typescript
import { AnimatedSprite, Container, Text } from '@pixi/react';

interface AgentSpriteProps {
  agentId: AgentId;
  x: number;
  y: number;
  status: AgentStatus;
  direction: Direction;
}

export function AgentSprite({ agentId, x, y, status, direction }: AgentSpriteProps) {
  const textures = useSpriteTextures(agentId, status, direction);

  return (
    <Container x={x} y={y}>
      <AnimatedSprite
        textures={textures}
        animationSpeed={0.1}
        isPlaying={status !== 'idle'}
        anchor={0.5}
      />
      {/* Shadow */}
      <Graphics draw={drawShadow} />
    </Container>
  );
}
```

---

## 5. Sistema de Tiles e Mapa

### 5.1 Formato do Mapa (Tiled JSON)

```json
{
  "width": 40,
  "height": 30,
  "tilewidth": 32,
  "tileheight": 32,
  "layers": [
    {
      "name": "floor",
      "type": "tilelayer",
      "data": [1, 1, 1, 2, 2, ...]
    },
    {
      "name": "walls",
      "type": "tilelayer",
      "data": [0, 0, 5, 5, 0, ...]
    },
    {
      "name": "furniture",
      "type": "objectgroup",
      "objects": [
        { "name": "desk", "x": 128, "y": 96, "type": "desk_1" }
      ]
    },
    {
      "name": "departments",
      "type": "objectgroup",
      "objects": [
        { "name": "Product", "x": 0, "y": 0, "width": 320, "height": 256 }
      ]
    },
    {
      "name": "spawn_points",
      "type": "objectgroup",
      "objects": [
        { "name": "dex", "x": 160, "y": 128 },
        { "name": "quinn", "x": 480, "y": 128 }
      ]
    }
  ]
}
```

### 5.2 Tileset Specification

| Tile ID | Nome | Tipo | Walkable |
|---------|------|------|----------|
| 0 | empty | void | false |
| 1-5 | floor_* | floor | true |
| 6-10 | carpet_* | floor | true |
| 11-15 | wall_* | wall | false |
| 16-20 | window_* | wall | false |
| 21-30 | desk_* | furniture | false |
| 31-40 | chair_* | furniture | true |
| 41-50 | plant_* | decoration | false |

---

## 6. Sistema de Sprites e Animacoes

### 6.1 Sprite Sheet Structure

```
agents.png (512x512)
┌────────────────────────────────────────────┐
│ dex_idle_down_0  │ dex_idle_down_1  │ ...  │  Row 0: Dex
│ dex_walk_down_0  │ dex_walk_down_1  │ ...  │
│ dex_work_0       │ dex_work_1       │ ...  │
├────────────────────────────────────────────┤
│ quinn_idle_down_0│ quinn_idle_down_1│ ...  │  Row 1: Quinn
│ ...                                        │
└────────────────────────────────────────────┘
```

### 6.2 Sprite Sheet JSON (TexturePacker format)

```json
{
  "frames": {
    "dex_idle_down_0": {
      "frame": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "dex_idle_down_1": {
      "frame": { "x": 32, "y": 0, "w": 32, "h": 32 }
    }
  },
  "animations": {
    "dex_idle_down": ["dex_idle_down_0", "dex_idle_down_1"],
    "dex_walk_down": ["dex_walk_down_0", "dex_walk_down_1", "dex_walk_down_2", "dex_walk_down_3"],
    "dex_work": ["dex_work_0", "dex_work_1", "dex_work_2", "dex_work_3"]
  },
  "meta": {
    "image": "agents.png",
    "size": { "w": 512, "h": 512 },
    "scale": "1"
  }
}
```

### 6.3 Animation State Machine

```typescript
type AnimationState = 'idle' | 'walk' | 'work' | 'think' | 'celebrate' | 'error';
type Direction = 'up' | 'down' | 'left' | 'right';

interface AgentAnimationConfig {
  agentId: AgentId;
  state: AnimationState;
  direction: Direction;
  loop: boolean;
  speed: number;
}

// Mapeamento Status -> Animation
const STATUS_TO_ANIMATION: Record<AgentStatus, AnimationState> = {
  'idle': 'idle',
  'working': 'work',
  'thinking': 'think',
  'waiting': 'idle',
  'error': 'error'
};
```

---

## 7. Integracao com AIOS Bridge

### 7.1 Fluxo de Eventos

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  AIOS Bridge │───▶│   Zustand    │───▶│  Pixi.js     │───▶│   Visual     │
│    Event     │    │    Store     │    │   Renderer   │    │   Update     │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
     │                    │                    │                    │
     │  tool_start        │  setAgentStatus    │  updateSprite     │  Animation
     │  agent_state       │  addActivity       │  animateTo        │  ChatBubble
     │  tool_complete     │  updatePosition    │  showBubble       │  StatusIcon
```

### 7.2 Event Handlers

```typescript
// No pixelOfficeStore.ts
function handleBridgeEvent(event: AIOSInboundEvent) {
  switch (event.type) {
    case 'tool_start':
      // Atualiza status do agente
      setAgentStatus(event.agentId, 'working', event.description);
      // Mostra chat bubble
      showChatBubble(event.agentId, event.toolName, event.description);
      // Trigger animacao de trabalho
      setAgentAnimation(event.agentId, 'work');
      break;

    case 'tool_complete':
      // Animacao de sucesso/erro
      setAgentAnimation(event.agentId, event.success ? 'celebrate' : 'error');
      // Atualiza bubble
      updateChatBubble(event.agentId, event.summary);
      break;

    case 'agent_state':
      setAgentStatus(event.agentId, event.status);
      setAgentAnimation(event.agentId, STATUS_TO_ANIMATION[event.status]);
      break;
  }
}
```

---

## 8. Sistema de Camera

### 8.1 Camera State

```typescript
interface PixelCameraState {
  x: number;           // Pan X (pixels)
  y: number;           // Pan Y (pixels)
  zoom: number;        // Zoom level (0.5 - 2.0)
  targetX: number;     // Para animacao suave
  targetY: number;
  targetZoom: number;
}

const CAMERA_BOUNDS = {
  minX: -400,
  maxX: 400,
  minY: -300,
  maxY: 300,
  minZoom: 0.5,
  maxZoom: 2.0
};
```

### 8.2 Camera Controls

```typescript
// useCameraControls.ts
export function useCameraControls(canvasRef: RefObject<HTMLDivElement>) {
  const { camera, panCamera, zoomCamera } = usePixelOfficeStore();

  // Pan com drag
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => { /* start drag */ };
    const handleMouseMove = (e: MouseEvent) => { /* pan */ };
    const handleMouseUp = () => { /* end drag */ };

    // Attach listeners
  }, []);

  // Zoom com scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.1;
      zoomCamera(delta, e.clientX, e.clientY);
    };
    // Attach listener
  }, []);

  return { camera };
}
```

---

## 9. Chat Bubbles System

### 9.1 Bubble Component

```typescript
// ChatBubbleOverlay.tsx
interface ChatBubble {
  id: string;
  agentId: AgentId;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'error';
}

export function ChatBubbleOverlay() {
  const { bubbles, camera } = usePixelOfficeStore();
  const agents = useAgentPositions();

  return (
    <div className="chat-bubble-overlay">
      {bubbles.map(bubble => {
        const agent = agents[bubble.agentId];
        const screenPos = worldToScreen(agent.position, camera);

        return (
          <div
            key={bubble.id}
            className="chat-bubble pixel-font"
            style={{
              left: screenPos.x,
              top: screenPos.y - 60,
              transform: 'translateX(-50%)'
            }}
          >
            {truncate(bubble.message, 50)}
          </div>
        );
      })}
    </div>
  );
}
```

### 9.2 Bubble Styling (Pixel Art)

```css
.chat-bubble {
  position: absolute;
  background: #ffffff;
  border: 2px solid #333333;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 10px;
  font-family: 'Press Start 2P', monospace; /* Pixel font */
  image-rendering: pixelated;
  box-shadow: 2px 2px 0 #333333;
  max-width: 150px;
  animation: bubble-appear 0.2s ease-out;
}

.chat-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #333333;
}
```

---

## 10. Performance Optimizations

### 10.1 Estrategias

| Tecnica | Implementacao | Ganho Esperado |
|---------|---------------|----------------|
| **Sprite Batching** | Pixi.js faz automaticamente | 10x menos draw calls |
| **Texture Atlasing** | Um PNG para todos os sprites | Menos texture swaps |
| **Culling** | Nao renderizar fora da viewport | -30% GPU |
| **Animation Pooling** | Reutilizar AnimatedSprites | -20% memory |
| **Lazy Loading** | Carregar assets sob demanda | -50% load time inicial |

### 10.2 Metricas de Performance

```typescript
// PerformanceMonitor.ts
interface PerformanceMetrics {
  fps: number;
  memory: number;
  drawCalls: number;
  spriteCount: number;
  loadTime: number;
}

export function usePerformanceMonitor(app: Application) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>();

  useEffect(() => {
    const ticker = app.ticker;
    ticker.add(() => {
      setMetrics({
        fps: ticker.FPS,
        memory: performance.memory?.usedJSHeapSize / 1024 / 1024,
        drawCalls: app.renderer.renderingToScreen ? 1 : 0,
        spriteCount: countSprites(app.stage),
        loadTime: performance.now()
      });
    });
  }, [app]);

  return metrics;
}
```

---

## 11. Migracao do Sistema Atual

### 11.1 Estrategia de Migracao

```
FASE 1: Coexistencia
├── VirtualOffice.tsx (atual) continua funcionando
├── PixelArtOffice.tsx (novo) em desenvolvimento
└── Feature flag para alternar

FASE 2: Migracao Gradual
├── Reutilizar: virtualOfficeStore.ts (estender)
├── Reutilizar: AIOS Bridge (sem mudancas)
├── Reutilizar: tipos (AgentId, AgentStatus, etc)
└── Novo: Camada Pixi.js completa

FASE 3: Substituicao
├── PixelArtOffice.tsx se torna padrao
├── VirtualOffice.tsx movido para /legacy
└── Cleanup de codigo antigo
```

### 11.2 Reutilizacao de Codigo

| Componente | Acao | Justificativa |
|------------|------|---------------|
| `virtualOfficeStore.ts` | **Estender** | Adicionar estado de mapa e animacoes |
| `AIOS Bridge` | **Manter** | Ja funciona bem |
| `types/index.ts` | **Manter** | AgentId, Department, etc |
| `data/agents.ts` | **Estender** | Adicionar sprite configs |
| `ActivityFeed.tsx` | **Manter** | Pode ser reutilizado |
| `AgentPanel.tsx` | **Manter** | Pode ser reutilizado |
| Componentes visuais | **Substituir** | Novo sistema Pixi.js |

---

## 12. Plano de Implementacao Tecnica

### 12.1 Sprint 0 (Preparacao)

- [ ] Setup Pixi.js e @pixi/react
- [ ] POC: Renderizar sprite simples
- [ ] POC: Carregar tilemap
- [ ] Validar performance baseline

### 12.2 Sprint 1 (Core)

- [ ] PixiCanvas.tsx
- [ ] TileMapLayer.tsx
- [ ] Carregar mapa JSON
- [ ] Renderizar tiles

### 12.3 Sprint 2 (Agentes)

- [ ] AgentSprite.tsx
- [ ] AnimationController.ts
- [ ] Integrar com Bridge
- [ ] Status visual

### 12.4 Sprint 3 (UI)

- [ ] ChatBubbleOverlay.tsx
- [ ] NameLabelOverlay.tsx
- [ ] Camera controls
- [ ] MiniMap

### 12.5 Sprint 4 (Polish)

- [ ] Performance tuning
- [ ] Testes
- [ ] Bug fixes
- [ ] Deploy

---

## 13. Checklist de Aprovacao Tecnica

### 13.1 Requisitos Atendidos

- [x] Stack compativel com projeto existente (React + TS)
- [x] Integracao com Zustand store existente
- [x] Integracao com AIOS Bridge existente
- [x] Performance target definido (60fps, <100MB)
- [x] Estrategia de migracao sem breaking changes
- [x] Assets format definido (TexturePacker + Tiled)

### 13.2 Aprovacao

| Papel | Nome | Status | Data |
|-------|------|--------|------|
| Architect | Aria | **APROVADO** | 2026-02-09 |
| Tech Lead | Aria | **APROVADO** | 2026-02-09 |

---

## 14. Referencias

### Documentacao

- [Pixi.js v8 Docs](https://pixijs.com/8.x/guides)
- [@pixi/react Docs](https://github.com/pixijs/pixi-react)
- [Tiled Map Editor](https://doc.mapeditor.org/)
- [TexturePacker](https://www.codeandweb.com/texturepacker/documentation)

### Exemplos

- [Pixi.js + React Example](https://codesandbox.io/s/pixi-react-example)
- [2D Game with Pixi.js](https://github.com/kittykatattack/learningPixi)

---

**Documento de Arquitetura Tecnica**
**Aprovado por:** Aria (AIOS Architect)
**Data:** 2026-02-09

**Status: APROVADO PARA IMPLEMENTACAO**

---

*"Boa arquitetura nao e sobre usar as tecnologias mais novas, mas sobre fazer as escolhas certas para o problema certo."* - Aria
