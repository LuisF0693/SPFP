# AIOS Virtual Office - User Guide

> **Version:** 1.0 MVP
> **Last Updated:** 2025-02-08
> **Status:** Production Ready

---

## Overview

O AIOS Virtual Office e um escritorio virtual 2D onde voce pode visualizar e interagir com os agentes AIOS em tempo real. Cada agente e representado por um avatar com emoji, organizado por departamento.

---

## Acesso

**URL:** `/virtual-office`
**Permissao:** Apenas admins

---

## Interface

### Layout Principal

```
+------------------------------------------------------------------+
|  AIOS Virtual Office                    [Mock Mode] [Status]      |
+------------------------------------------------------------------+
|                                                      |            |
|  +----------+ +----------+ +----------+ +----------+ | Activity   |
|  | PRODUCT  | |ENGINEERING| | QUALITY  | |  DESIGN  | | Feed      |
|  | Morgan   | | Dex      | | Quinn    | | Luna     | |            |
|  | Sophie   | | Aria     | |          | |          | | - Event 1  |
|  | Max      | | Nova     | |          | |          | | - Event 2  |
|  +----------+ +----------+ +----------+ +----------+ | - Event 3  |
|                                                      |            |
|  +--------------------------------------------------+ |            |
|  |                    OPERATIONS                     | |            |
|  |    Atlas          Gage          Orion            | |            |
|  +--------------------------------------------------+ |            |
+------------------------------------------------------------------+
```

### Componentes

1. **Header:** Titulo, status de conexao, toggle mock mode
2. **Departamentos:** 5 areas coloridas com agentes
3. **Avatars:** Emojis animados com status visual
4. **Activity Feed:** Timeline de atividades (sidebar direita)
5. **Agent Panel:** Detalhes ao clicar em um agente

---

## Agentes

| Agente | Emoji | Departamento | Role |
|--------|-------|--------------|------|
| Orion | 👑 | Operations | Master Orchestrator |
| Morgan | 👔 | Product | Product Manager |
| Sophie | 👁️ | Product | Product Owner |
| Max | 📋 | Product | Scrum Master |
| Dex | 💻 | Engineering | Developer |
| Aria | 🏗️ | Engineering | Architect |
| Nova | 🔧 | Engineering | Data Engineer |
| Quinn | 🧪 | Quality | QA Engineer |
| Luna | 🎨 | Design | UX Designer |
| Atlas | 📊 | Operations | Analyst |
| Gage | 🚀 | Operations | DevOps |

---

## Estados Visuais

| Estado | Cor Badge | Animacao | Significado |
|--------|-----------|----------|-------------|
| idle | Cinza | Breathing | Agente disponivel |
| working | Verde | Typing | Executando tarefa |
| thinking | Amarelo | Balanco | Processando/analisando |
| waiting | Cinza claro | Nenhuma | Aguardando input |
| error | Vermelho | Shake | Erro na execucao |

---

## Modos de Operacao

### Mock Mode (Padrao)

- Simula atividades aleatorias dos agentes
- Util para demonstracao e desenvolvimento
- Toggle no header para ativar/desativar

### Real Mode (Conectado)

- Recebe eventos reais do Claude Code via hooks
- Requer configuracao dos hooks (ver abaixo)
- Indicator verde "Connected" quando ativo

---

## Interacoes

### Clicar em Agente

Abre painel lateral com:
- Avatar grande e informacoes
- Status atual
- Ultimas 5 atividades
- Botao "Assign Task"

### Clicar em Atividade (Feed)

Destaca o agente correspondente no mapa.

### Assign Task

1. Clique no agente
2. Clique em "Assign Task"
3. Digite a descricao da tarefa
4. Agente muda para status "working"

---

## Configuracao de Hooks (Real Mode)

Para receber eventos reais do Claude Code:

### 1. Hooks Disponiveis

Os scripts de hook estao em `.claude/scripts/`:

- `emit-event.js` - Emite eventos de ferramentas (PostToolUse)
- `emit-stop.js` - Emite eventos de parada (Stop)

### 2. Configurar hooks.json

Criar/editar `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "type": "command",
        "command": "node .claude/scripts/emit-event.js"
      }
    ],
    "Stop": [
      {
        "type": "command",
        "command": "node .claude/scripts/emit-stop.js"
      }
    ]
  }
}
```

### 3. Iniciar Dev Server

```bash
npm run dev
```

O Vite plugin serve os eventos em `/api/aios-events`.

### 4. Desativar Mock Mode

No Virtual Office, clique em "Disable Mock" para conectar aos eventos reais.

---

## Arquitetura Tecnica

### Stack

- React 19 + TypeScript
- Zustand (state management)
- TailwindCSS (styling)
- Vite plugin (serve eventos)

### Fluxo de Dados

```
Claude Code
    |
    v
Hooks (PostToolUse/Stop)
    |
    v
.aios-events/events.jsonl
    |
    v
Vite Plugin (/api/aios-events)
    |
    v
useAIOSBridge (polling 500ms)
    |
    v
Zustand Store
    |
    v
React Components
```

### Arquivos Principais

```
src/virtual-office/
├── components/
│   ├── VirtualOffice.tsx   # Main container
│   ├── AgentAvatar.tsx     # Avatar component
│   ├── DepartmentArea.tsx  # Department section
│   ├── ActivityFeed.tsx    # Activity sidebar
│   └── AgentPanel.tsx      # Agent detail panel
├── bridge/
│   ├── useAIOSBridge.ts    # Polling hook
│   ├── MockBridge.ts       # Mock generator
│   └── EventTypes.ts       # Type definitions
├── store/
│   └── virtualOfficeStore.ts
├── data/
│   └── agents.ts           # Agent configs
└── types/
    └── index.ts
```

---

## Troubleshooting

### "Disconnected" Status

1. Verifique se o dev server esta rodando
2. Verifique se `.aios-events/` existe
3. Tente ativar Mock Mode para testar

### Eventos nao aparecem

1. Verifique se os hooks estao configurados
2. Verifique se o arquivo `events.jsonl` esta sendo escrito
3. Verifique o console do browser para erros

### Performance lenta

1. O arquivo `events.jsonl` rotaciona automaticamente apos 1000 eventos
2. Limite de 50 atividades no feed
3. Polling a cada 500ms (ajustavel)

---

## Roadmap (Phase 2+)

- [ ] Baloes de fala com atividade atual
- [ ] Pan/zoom do mapa
- [ ] Mini-mapa
- [ ] Chat integrado com agente
- [ ] Pixel art sprites
- [ ] Sons e musica ambiente
- [ ] Metricas por departamento

---

*Documentacao criada por Dex (Developer Agent) - 2025-02-08*
