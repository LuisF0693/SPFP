# Pixel Art Virtual Office v2.0

Visualizacao 2D estilo pixel art do escritorio virtual AIOS usando Pixi.js WebGL.

## Quick Start

```bash
npm run dev
# Acessar: http://localhost:3000/virtual-office-v2
```

## Features

- **WebGL Rendering** - 60fps usando Pixi.js v8
- **Tile Map** - Escritorio com 6 departamentos + areas comuns
- **Pixel Art Agents** - 10 agentes com cores e acessorios unicos
- **Animacoes** - Idle, working, thinking, waiting
- **Chat Bubbles** - Baloes de fala com auto-dismiss
- **Mini-Map** - Navegacao rapida pelo escritorio
- **Keyboard Shortcuts** - H, +, -, 0, setas

## Controles

| Acao | Mouse | Teclado |
|------|-------|---------|
| Pan | Drag | Setas |
| Zoom | Scroll | +/- |
| Reset | Double-click | H |
| Zoom 100% | - | 0 |
| Selecionar | Click agente | - |
| Navegar | Click mini-map | - |

## Estrutura

```
virtual-office-v2/
├── PixelArtOffice.tsx    # Componente principal
├── components/           # Componentes React (MiniMap)
├── hooks/                # Hooks customizados
├── pixi/                 # Componentes Pixi.js
├── assets/               # Dados do mapa
└── types/                # TypeScript types
```

## Hooks Disponiveis

```tsx
import {
  usePixiApp,        // Pixi Application
  useTileMap,        // Dados do mapa
  useChatBubbles,    // Chat bubbles
  useCameraControls, // Camera suave
} from './virtual-office-v2';
```

## Documentacao

- [Handoff Session](../docs/sessions/2026-02/2026-02-09-pixel-art-office-mvp.md)
- [PRD](../docs/prd/pixel-art-office/02-morgan-prd.md)
- [Arquitetura](../docs/prd/pixel-art-office/04-aria-architecture.md)
- [Progresso](../docs/prd/pixel-art-office/07-implementation-progress.md)

## Status

**MVP COMPLETO** - Todos os 5 sprints implementados.

### Sprints
- [x] Sprint 0 - Setup Pixi.js
- [x] Sprint 1 - TileMap
- [x] Sprint 2 - Agentes
- [x] Sprint 3 - Animacoes
- [x] Sprint 4 - Chat Bubbles
- [x] Sprint 5 - Polish

## Proximos Passos

1. Assets pixel art reais
2. Integracao AIOS Bridge
3. Mais animacoes (walk, celebrate)
4. Efeitos sonoros
5. Mobile touch support
