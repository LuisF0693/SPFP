# Spike Tecnico: AIOS Virtual Office

> **Document Type:** Technical Spike / Architecture Decision Record
> **Status:** COMPLETED
> **Date:** 2025-02-08
> **Author:** Aria (Architect Agent)
> **Related PRD:** docs/prd/aios-virtual-office-prd.md

---

## Executive Summary

| Area | Viabilidade | Risco | Recomendacao |
|------|-------------|-------|--------------|
| React + Pixi.js | **GO** | Baixo | @pixi/react v8 oficial |
| AIOS Bridge | **GO** | Medio | Claude Code Hooks + File Watcher |
| Arquitetura Geral | **GO** | Medio | Arquitetura hibrida proposta |

**RECOMENDACAO FINAL: GO**

O projeto e tecnicamente viavel. A integracao React + Pixi.js tem suporte oficial. A comunicacao com Claude Code pode ser feita via Hooks + File-based events.

---

## 1. React + Pixi.js Integration

### 1.1 Analise de Viabilidade

**Status: GO**

O PixiJS lancou oficialmente o [@pixi/react v8](https://pixijs.com/blog/pixi-react-v8-live) em 2024, construido especificamente para:
- **React 19** (nosso projeto usa React 19.2.1)
- **PixiJS v8** com suporte a WebGPU
- **Vite** como bundler (compativel)

### 1.2 Arquitetura Recomendada

```
+--------------------------------------------------+
|                  VirtualOffice.tsx                |
|  +--------------------------------------------+  |
|  |              <Application>                 |  |
|  |  +--------------------------------------+  |  |
|  |  |           <Container>                |  |  |
|  |  |  +--------+  +--------+  +--------+  |  |  |
|  |  |  | Sprite |  | Sprite |  | Sprite |  |  |  |
|  |  |  | Agent1 |  | Agent2 |  | Agent3 |  |  |  |
|  |  |  +--------+  +--------+  +--------+  |  |  |
|  |  +--------------------------------------+  |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
```

### 1.3 POC: React + Pixi.js Component

```typescript
// src/virtual-office/components/OfficeCanvas.tsx
import { Application, Container, Sprite, Text } from '@pixi/react';
import { useCallback, useState } from 'react';

interface Agent {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'idle' | 'working' | 'thinking';
}

interface OfficeCanvasProps {
  agents: Agent[];
  onAgentClick: (agentId: string) => void;
}

export function OfficeCanvas({ agents, onAgentClick }: OfficeCanvasProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleAgentClick = useCallback((agentId: string) => {
    setSelectedAgent(agentId);
    onAgentClick(agentId);
  }, [onAgentClick]);

  return (
    <Application
      width={window.innerWidth * 0.7}
      height={window.innerHeight}
      background={0x1a1a2e}
      resizeTo={window}
    >
      <Container>
        {agents.map((agent) => (
          <Container key={agent.id} x={agent.x} y={agent.y}>
            {/* Agent Avatar (placeholder - emoji or sprite) */}
            <Text
              text={getAgentEmoji(agent.status)}
              style={{ fontSize: 48 }}
              anchor={0.5}
              eventMode="static"
              cursor="pointer"
              pointerdown={() => handleAgentClick(agent.id)}
            />
            {/* Agent Name */}
            <Text
              text={agent.name}
              y={40}
              style={{ fontSize: 14, fill: 0xffffff }}
              anchor={0.5}
            />
            {/* Status Badge */}
            <StatusBadge status={agent.status} />
          </Container>
        ))}
      </Container>
    </Application>
  );
}

function getAgentEmoji(status: string): string {
  const emojis: Record<string, string> = {
    idle: '😊',
    working: '💻',
    thinking: '🤔',
  };
  return emojis[status] || '😊';
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, number> = {
    idle: 0x888888,
    working: 0x00ff00,
    thinking: 0xffff00,
  };
  // Implementar como Graphics circle
  return null; // Placeholder
}
```

### 1.4 Dependencias Necessarias

```bash
npm install pixi.js @pixi/react
```

**Bundle Impact Estimado:** ~150KB gzipped (Pixi.js core)

### 1.5 Configuracao Vite

Adicionar ao `vite.config.ts`:

```typescript
// No manualChunks
if (id.includes('node_modules/pixi')) {
  return 'pixi-vendor';
}
```

### 1.6 Riscos e Mitigacoes

| Risco | Probabilidade | Mitigacao |
|-------|---------------|-----------|
| Memory leaks no canvas | Media | Cleanup no useEffect unmount |
| Performance com muitos sprites | Baixa | Sprite pooling, max 15 agentes |
| Conflito com React 19 | Baixa | @pixi/react v8 suporta oficialmente |

---

## 2. AIOS Bridge - Comunicacao com Claude Code

### 2.1 Opcoes Analisadas

| Opcao | Viabilidade | Complexidade | Latencia |
|-------|-------------|--------------|----------|
| WebSocket Server | Media | Alta | < 100ms |
| Claude Code Hooks | **Alta** | Media | < 500ms |
| File-based Events | Alta | Baixa | < 1s |
| Polling API | Alta | Baixa | 1-5s |

### 2.2 Recomendacao: Claude Code Hooks + File Watcher

**Status: GO**

Baseado na [documentacao oficial de hooks](https://code.claude.com/docs/en/hooks-guide), podemos:

1. **Hook `PostToolUse`**: Captura quando um agente termina uma acao
2. **Hook `Stop`**: Captura quando o agente finaliza resposta
3. **Hook `Notification`**: Captura alertas do Claude

### 2.3 Arquitetura Proposta

```
+-------------------+     +-------------------+     +-------------------+
|   Claude Code     |     |   Event Bridge    |     |  Virtual Office   |
|   (CLI/Terminal)  |     |   (File-based)    |     |   (React App)     |
+--------+----------+     +--------+----------+     +--------+----------+
         |                         |                         |
         | 1. Agent executes       |                         |
         |    tool/action          |                         |
         |                         |                         |
         | 2. PostToolUse Hook     |                         |
         +------------------------>|                         |
         |    writes event.json    |                         |
         |                         | 3. File Watcher         |
         |                         |    detects change       |
         |                         +------------------------>|
         |                         |                         |
         |                         |    4. Update UI state   |
         |                         |                         |
         |                         | 5. User clicks agent    |
         |                         |<------------------------+
         | 6. Read command.json    |                         |
         |<------------------------+                         |
         |                         |                         |
         | 7. Execute task         |                         |
         +------------------------>|                         |
```

### 2.4 Implementacao do Hook (Claude Code Side)

Criar `.claude/hooks.json`:

```json
{
  "hooks": [
    {
      "event": "PostToolUse",
      "type": "command",
      "command": "node .claude/scripts/emit-event.js"
    },
    {
      "event": "Stop",
      "type": "command",
      "command": "node .claude/scripts/emit-stop.js"
    }
  ]
}
```

Script `.claude/scripts/emit-event.js`:

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read stdin (event data from Claude Code)
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  const eventData = JSON.parse(input);

  const event = {
    timestamp: Date.now(),
    type: 'tool_complete',
    agent: detectAgent(eventData),
    tool: eventData.tool_name,
    status: 'completed',
    summary: eventData.tool_input?.description || 'Task completed'
  };

  // Write to events file (Virtual Office will watch this)
  const eventsPath = path.join(__dirname, '../../.aios-events/events.jsonl');
  fs.appendFileSync(eventsPath, JSON.stringify(event) + '\n');

  // Exit 0 = success, don't block Claude
  process.exit(0);
});

function detectAgent(data) {
  // Logic to detect which agent is active based on context
  // Could read from session state or infer from tool patterns
  return 'dev'; // placeholder
}
```

### 2.5 Implementacao do Bridge (React Side)

```typescript
// src/virtual-office/bridge/AIOSBridge.ts
import { useEffect, useState, useCallback } from 'react';

interface AIOSEvent {
  timestamp: number;
  type: 'tool_start' | 'tool_complete' | 'agent_stop' | 'status_change';
  agent: string;
  tool?: string;
  status: string;
  summary?: string;
}

interface AIOSBridgeConfig {
  eventsPath: string;
  pollInterval: number;
  onEvent: (event: AIOSEvent) => void;
}

export function useAIOSBridge(config: AIOSBridgeConfig) {
  const [connected, setConnected] = useState(false);
  const [lastEventTime, setLastEventTime] = useState(0);

  // In browser, we need a local server to watch files
  // Option 1: Vite dev server middleware
  // Option 2: Separate Node.js watcher server
  // Option 3: Polling via fetch to a local API

  useEffect(() => {
    const pollEvents = async () => {
      try {
        // Fetch events from local dev server endpoint
        const response = await fetch(`/api/aios-events?since=${lastEventTime}`);
        if (response.ok) {
          const events: AIOSEvent[] = await response.json();
          events.forEach(config.onEvent);
          if (events.length > 0) {
            setLastEventTime(events[events.length - 1].timestamp);
          }
          setConnected(true);
        }
      } catch (error) {
        setConnected(false);
      }
    };

    const interval = setInterval(pollEvents, config.pollInterval);
    pollEvents(); // Initial poll

    return () => clearInterval(interval);
  }, [config.pollInterval, lastEventTime]);

  return { connected };
}
```

### 2.6 Vite Plugin para Servir Eventos

```typescript
// vite-plugin-aios-events.ts
import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function aiosEventsPlugin(): Plugin {
  const eventsPath = path.resolve('.aios-events/events.jsonl');

  return {
    name: 'aios-events',
    configureServer(server) {
      server.middlewares.use('/api/aios-events', (req, res) => {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const since = parseInt(url.searchParams.get('since') || '0');

        try {
          if (!fs.existsSync(eventsPath)) {
            res.setHeader('Content-Type', 'application/json');
            res.end('[]');
            return;
          }

          const content = fs.readFileSync(eventsPath, 'utf-8');
          const events = content
            .split('\n')
            .filter(Boolean)
            .map(line => JSON.parse(line))
            .filter(event => event.timestamp > since);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(events));
        } catch (error) {
          res.statusCode = 500;
          res.end('[]');
        }
      });
    }
  };
}
```

### 2.7 Resposta as Questoes Abertas

**Q2: WebSocket vs Polling para eventos?**

**Resposta: Polling via Vite Middleware**

- WebSocket seria ideal para latencia < 100ms, mas adiciona complexidade
- Claude Code hooks escrevem em arquivo, nao em WebSocket
- Polling a cada 500ms via Vite middleware e suficiente para o caso de uso
- Latencia efetiva: 500ms-1s (dentro do requisito NFR2)

**Q4: Integracao com Claude Code hooks?**

**Resposta: Sim, via PostToolUse e Stop hooks**

- Hooks sao a forma oficial de integrar com Claude Code
- Usamos `PostToolUse` para capturar acoes dos agentes
- Usamos `Stop` para saber quando agente terminou
- Escrevemos eventos em arquivo JSONL que o React App le via polling

---

## 3. Interface de Eventos (EventTypes)

### 3.1 Tipos de Eventos

```typescript
// src/virtual-office/bridge/EventTypes.ts

export type AgentId =
  | 'orion' | 'morgan' | 'sophie' | 'max'
  | 'dex' | 'aria' | 'nova' | 'quinn'
  | 'luna' | 'atlas' | 'gage';

export type AgentStatus = 'idle' | 'working' | 'thinking' | 'waiting' | 'error';

export interface AgentStateEvent {
  type: 'agent_state';
  timestamp: number;
  agentId: AgentId;
  status: AgentStatus;
  activity?: string;
}

export interface ToolStartEvent {
  type: 'tool_start';
  timestamp: number;
  agentId: AgentId;
  toolName: string;
  description?: string;
}

export interface ToolCompleteEvent {
  type: 'tool_complete';
  timestamp: number;
  agentId: AgentId;
  toolName: string;
  success: boolean;
  summary?: string;
  duration?: number;
}

export interface TaskAssignedEvent {
  type: 'task_assigned';
  timestamp: number;
  agentId: AgentId;
  taskDescription: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AgentStopEvent {
  type: 'agent_stop';
  timestamp: number;
  agentId: AgentId;
  summary?: string;
}

export type AIOSEvent =
  | AgentStateEvent
  | ToolStartEvent
  | ToolCompleteEvent
  | TaskAssignedEvent
  | AgentStopEvent;

// Outbound events (Virtual Office -> Claude Code)
export interface CommandEvent {
  type: 'command';
  timestamp: number;
  targetAgent: AgentId;
  command: string;
  args?: Record<string, unknown>;
}
```

### 3.2 Mapeamento Agente -> Departamento

```typescript
// src/virtual-office/data/agents.ts

export const AGENTS: Record<AgentId, AgentConfig> = {
  orion: {
    id: 'orion',
    name: 'Orion',
    role: 'Master Orchestrator',
    department: 'operations',
    emoji: '👑',
    position: { x: 500, y: 400 }
  },
  morgan: {
    id: 'morgan',
    name: 'Morgan',
    role: 'Product Manager',
    department: 'product',
    emoji: '👔',
    position: { x: 100, y: 100 }
  },
  sophie: {
    id: 'sophie',
    name: 'Sophie',
    role: 'Product Owner',
    department: 'product',
    emoji: '👁️',
    position: { x: 100, y: 180 }
  },
  max: {
    id: 'max',
    name: 'Max',
    role: 'Scrum Master',
    department: 'product',
    emoji: '📋',
    position: { x: 100, y: 260 }
  },
  dex: {
    id: 'dex',
    name: 'Dex',
    role: 'Developer',
    department: 'engineering',
    emoji: '💻',
    position: { x: 250, y: 100 }
  },
  aria: {
    id: 'aria',
    name: 'Aria',
    role: 'Architect',
    department: 'engineering',
    emoji: '🏗️',
    position: { x: 250, y: 180 }
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    role: 'Data Engineer',
    department: 'engineering',
    emoji: '🔧',
    position: { x: 250, y: 260 }
  },
  quinn: {
    id: 'quinn',
    name: 'Quinn',
    role: 'QA Engineer',
    department: 'quality',
    emoji: '🧪',
    position: { x: 400, y: 100 }
  },
  luna: {
    id: 'luna',
    name: 'Luna',
    role: 'UX Designer',
    department: 'design',
    emoji: '🎨',
    position: { x: 550, y: 100 }
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    role: 'Analyst',
    department: 'operations',
    emoji: '📊',
    position: { x: 300, y: 400 }
  },
  gage: {
    id: 'gage',
    name: 'Gage',
    role: 'DevOps',
    department: 'operations',
    emoji: '🚀',
    position: { x: 400, y: 400 }
  }
};

export type Department = 'product' | 'engineering' | 'quality' | 'design' | 'operations';

export const DEPARTMENTS: Record<Department, DepartmentConfig> = {
  product: { name: 'Product', color: 0x4a90d9, bounds: { x: 50, y: 50, w: 150, h: 250 } },
  engineering: { name: 'Engineering', color: 0x50c878, bounds: { x: 200, y: 50, w: 150, h: 250 } },
  quality: { name: 'Quality', color: 0xff6b6b, bounds: { x: 350, y: 50, w: 150, h: 150 } },
  design: { name: 'Design', color: 0xffa500, bounds: { x: 500, y: 50, w: 150, h: 150 } },
  operations: { name: 'Operations', color: 0x9b59b6, bounds: { x: 250, y: 350, w: 300, h: 100 } }
};
```

---

## 4. Arquitetura Final Proposta

### 4.1 Diagrama de Componentes

```
+------------------------------------------------------------------+
|                        AIOS Virtual Office                        |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------------+     +-----------------------------+   |
|  |    UI Layer (React)    |     |      State Layer (Zustand)  |   |
|  +------------------------+     +-----------------------------+   |
|  | VirtualOffice.tsx      |     | virtualOfficeStore.ts       |   |
|  | +------------------+   |     | - agents: AgentState[]      |   |
|  | | OfficeCanvas     |   |<--->| - activities: Activity[]    |   |
|  | | (Pixi.js)        |   |     | - selectedAgent: string     |   |
|  | +------------------+   |     | - mockMode: boolean         |   |
|  | +------------------+   |     +-----------------------------+   |
|  | | ActivityFeed     |   |                  ^                    |
|  | | (React)          |   |                  |                    |
|  | +------------------+   |                  |                    |
|  | +------------------+   |     +-----------------------------+   |
|  | | AgentPanel       |   |     |     Bridge Layer            |   |
|  | | (React)          |   |     +-----------------------------+   |
|  | +------------------+   |     | AIOSBridge.ts               |   |
|  +------------------------+     | - useAIOSBridge() hook      |   |
|                                 | - pollEvents()              |   |
|                                 | - sendCommand()             |   |
|                                 +-------------+---------------+   |
|                                               |                   |
+-----------------------------------------------|-------------------+
                                                |
                        +------ Polling --------+
                        |       (500ms)
                        v
+------------------------------------------------------------------+
|                     Vite Dev Server                               |
+------------------------------------------------------------------+
| /api/aios-events  <-- aiosEventsPlugin reads .aios-events/       |
+------------------------------------------------------------------+
                        ^
                        | File Write
                        |
+------------------------------------------------------------------+
|                     Claude Code Hooks                             |
+------------------------------------------------------------------+
| PostToolUse -> emit-event.js -> .aios-events/events.jsonl        |
| Stop        -> emit-stop.js  -> .aios-events/events.jsonl        |
+------------------------------------------------------------------+
```

### 4.2 Fluxo de Dados

```
1. Usuario chama agente no Claude Code terminal
   |
   v
2. Claude Code executa ferramentas (Bash, Read, Write, etc.)
   |
   v
3. Hook PostToolUse dispara, executa emit-event.js
   |
   v
4. emit-event.js escreve evento em .aios-events/events.jsonl
   |
   v
5. Vite plugin detecta mudanca no proximo poll (500ms)
   |
   v
6. React app recebe evento via /api/aios-events
   |
   v
7. Zustand store atualiza estado do agente
   |
   v
8. Pixi.js re-renderiza avatar com novo estado
   |
   v
9. ActivityFeed mostra nova atividade
```

---

## 5. Riscos e Mitigacoes

| ID | Risco | Probabilidade | Impacto | Mitigacao |
|----|-------|---------------|---------|-----------|
| R1 | Hooks nao disparam corretamente | Media | Alto | Testar hooks isoladamente antes de integrar |
| R2 | Latencia > 500ms | Baixa | Medio | Reduzir poll interval para 250ms se necessario |
| R3 | File locking no events.jsonl | Baixa | Medio | Usar append-only, rotacionar arquivo periodicamente |
| R4 | Memory leak no Pixi.js | Media | Alto | Cleanup no unmount, usar @pixi/react lifecycle |
| R5 | Identificar agente ativo incorretamente | Alta | Medio | Adicionar metadata de agente no hook context |
| R6 | CSP bloqueia Pixi.js WebGL | Baixa | Alto | Ja temos 'unsafe-eval' no CSP, WebGL deve funcionar |

---

## 6. Checklist de Implementacao

### Sprint 0 Tasks

- [ ] Instalar `pixi.js` e `@pixi/react`
- [ ] Criar componente POC com canvas basico
- [ ] Criar `.claude/hooks.json` com PostToolUse
- [ ] Criar `.claude/scripts/emit-event.js`
- [ ] Criar `vite-plugin-aios-events.ts`
- [ ] Testar fluxo end-to-end com evento mock
- [ ] Validar performance (60 FPS) com 10 sprites

### Criterios de Sucesso do Spike

| Criterio | Target | Como Validar |
|----------|--------|--------------|
| Pixi.js renderiza no React | Funciona | Canvas visivel com 1 sprite |
| Hot reload funciona | Funciona | Editar componente, ver mudanca |
| Hook escreve evento | Funciona | Arquivo events.jsonl atualizado |
| React le evento | < 1s | Console.log mostra evento |
| Performance | 60 FPS | Chrome DevTools FPS meter |

---

## 7. Conclusao e Recomendacao

### Decisao Final: **GO**

O projeto AIOS Virtual Office e **tecnicamente viavel** com a arquitetura proposta:

1. **React + Pixi.js**: Suporte oficial via @pixi/react v8 para React 19
2. **AIOS Bridge**: Claude Code Hooks + File-based events + Polling
3. **Latencia**: < 1s (aceitavel para o caso de uso)
4. **Complexidade**: Media, mas gerenciavel

### Proximos Passos

1. **Luna (UX)**: Definir asset strategy (emojis vs sprites)
2. **Dex (Dev)**: Implementar Sprint 0 tasks
3. **Aria (Architect)**: Revisar implementacao apos Sprint 0

---

## Referencias

- [PixiJS React v8 Official Release](https://pixijs.com/blog/pixi-react-v8-live)
- [PixiJS React Documentation](https://react.pixijs.io/)
- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Claude Code Hooks Mastery](https://github.com/disler/claude-code-hooks-mastery)

---

*Spike tecnico realizado por Aria (Architect Agent) - 2025-02-08*
