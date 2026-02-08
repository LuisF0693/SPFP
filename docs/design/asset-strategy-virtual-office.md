# Asset Strategy: AIOS Virtual Office

> **Document Type:** Design Decision
> **Status:** APPROVED
> **Date:** 2025-02-08
> **Author:** Luna (UX Designer Agent)
> **Blocks:** Story 1.3 (Avatares dos Agentes)

---

## Decisao Final

### Abordagem: **HIBRIDA com CSS Avatars + Emoji MVP**

| Fase | Abordagem | Quando |
|------|-----------|--------|
| **MVP (Phase 1)** | CSS-based avatars com emojis de role | Stories 1.0-1.7 |
| **Polish (Phase 2)** | Upgrade para pixel art sprites | Pos-MVP |

**Justificativa:**
1. Zero bloqueio para desenvolvimento - pode comecar HOJE
2. Avatares CSS sao animaveis (scale, rotate, opacity)
3. Emojis dao personalidade imediata
4. Upgrade para sprites e incremental, nao requer refactor

---

## Especificacoes Tecnicas MVP

### 1. Avatar Base (CSS-based)

```
+---------------------------+
|     Status Badge (12px)   |  <- Canto superior direito
|  +---------------------+  |
|  |                     |  |
|  |   Circular Avatar   |  |  <- 64x64px
|  |   (Cor Depto + Emoji)|  |
|  |                     |  |
|  +---------------------+  |
|      Nome do Agente       |  <- 12px, branco
|        (Role)             |  <- 10px, cinza
+---------------------------+
```

### 2. Tamanhos

| Elemento | Tamanho | Notas |
|----------|---------|-------|
| Avatar Container | 64x64px | Area clicavel |
| Emoji | 32px | Centralizado |
| Status Badge | 12x12px | Canto superior direito |
| Nome | 12px | Abaixo do avatar |
| Role | 10px | Abaixo do nome |

### 3. Cores por Departamento

```typescript
const DEPARTMENT_COLORS = {
  product: {
    primary: '#4A90D9',    // Azul
    secondary: '#3A7BC8',
    glow: 'rgba(74, 144, 217, 0.4)'
  },
  engineering: {
    primary: '#50C878',    // Verde
    secondary: '#40B868',
    glow: 'rgba(80, 200, 120, 0.4)'
  },
  quality: {
    primary: '#FF6B6B',    // Vermelho
    secondary: '#EE5A5A',
    glow: 'rgba(255, 107, 107, 0.4)'
  },
  design: {
    primary: '#FFA500',    // Laranja
    secondary: '#EE9400',
    glow: 'rgba(255, 165, 0, 0.4)'
  },
  operations: {
    primary: '#9B59B6',    // Roxo
    secondary: '#8A48A5',
    glow: 'rgba(155, 89, 182, 0.4)'
  }
};
```

### 4. Emojis por Agente

| Agente | Emoji | Departamento | Cor |
|--------|-------|--------------|-----|
| Orion | 👑 | Operations | Roxo |
| Morgan | 👔 | Product | Azul |
| Sophie | 👁️ | Product | Azul |
| Max | 📋 | Product | Azul |
| Dex | 💻 | Engineering | Verde |
| Aria | 🏗️ | Engineering | Verde |
| Nova | 🔧 | Engineering | Verde |
| Quinn | 🧪 | Quality | Vermelho |
| Luna | 🎨 | Design | Laranja |
| Atlas | 📊 | Operations | Roxo |
| Gage | 🚀 | Operations | Roxo |

### 5. Status Badges

| Status | Cor | Animacao |
|--------|-----|----------|
| idle | Cinza (#888) | Nenhuma |
| working | Verde (#00FF00) | Pulse 1s |
| thinking | Amarelo (#FFFF00) | Pulse 2s |
| waiting | Cinza claro (#AAA) | Nenhuma |
| error | Vermelho (#FF0000) | Shake |

### 6. Animacoes CSS

```css
/* Idle - Breathing suave */
@keyframes breathing {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Working - Digitando */
@keyframes typing {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-2px); }
  75% { transform: translateY(2px); }
}

/* Thinking - Balanco suave */
@keyframes thinking {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

/* Status badge pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

/* Error shake */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}
```

---

## Componente React: AgentAvatar

```typescript
// src/virtual-office/components/AgentAvatar.tsx

interface AgentAvatarProps {
  agent: {
    id: string;
    name: string;
    role: string;
    emoji: string;
    department: Department;
    status: AgentStatus;
  };
  onClick?: () => void;
  selected?: boolean;
}

export function AgentAvatar({ agent, onClick, selected }: AgentAvatarProps) {
  const colors = DEPARTMENT_COLORS[agent.department];

  return (
    <div
      className={`
        relative cursor-pointer transition-all duration-200
        ${selected ? 'scale-110' : 'hover:scale-105'}
      `}
      onClick={onClick}
    >
      {/* Avatar Circle */}
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center
          ${getAnimationClass(agent.status)}
        `}
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          boxShadow: selected ? `0 0 20px ${colors.glow}` : 'none'
        }}
      >
        <span className="text-3xl">{agent.emoji}</span>
      </div>

      {/* Status Badge */}
      <div
        className={`
          absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900
          ${getStatusClass(agent.status)}
        `}
      />

      {/* Name & Role */}
      <div className="text-center mt-1">
        <p className="text-xs text-white font-medium">{agent.name}</p>
        <p className="text-[10px] text-gray-400">{agent.role}</p>
      </div>
    </div>
  );
}

function getAnimationClass(status: AgentStatus): string {
  const animations: Record<AgentStatus, string> = {
    idle: 'animate-breathing',
    working: 'animate-typing',
    thinking: 'animate-thinking',
    waiting: '',
    error: 'animate-shake'
  };
  return animations[status];
}

function getStatusClass(status: AgentStatus): string {
  const classes: Record<AgentStatus, string> = {
    idle: 'bg-gray-500',
    working: 'bg-green-500 animate-pulse',
    thinking: 'bg-yellow-500 animate-pulse',
    waiting: 'bg-gray-400',
    error: 'bg-red-500 animate-shake'
  };
  return classes[status];
}
```

---

## Layout do Escritorio

### Grid Isometrico Simplificado

Para MVP, usar grid retangular com perspectiva leve (nao isometrico completo):

```
+------------------------------------------------------------------+
|                         AIOS VIRTUAL OFFICE                       |
+------------------------------------------------------------------+
|                                                                    |
|  +-------------+  +-------------+  +-------------+  +-------------+|
|  |   PRODUCT   |  | ENGINEERING |  |   QUALITY   |  |   DESIGN    ||
|  |-------------|  |-------------|  |-------------|  |-------------||
|  | 👔 Morgan   |  | 💻 Dex      |  | 🧪 Quinn    |  | 🎨 Luna     ||
|  | 👁️ Sophie   |  | 🏗️ Aria     |  |             |  |             ||
|  | 📋 Max      |  | 🔧 Nova     |  |             |  |             ||
|  +-------------+  +-------------+  +-------------+  +-------------+|
|                                                                    |
|  +----------------------------------------------------------------+|
|  |                        OPERATIONS                               ||
|  |     📊 Atlas          🚀 Gage          👑 Orion                 ||
|  +----------------------------------------------------------------+|
|                                                                    |
+------------------------------------------------------------------+
```

### Cores de Fundo por Area

```typescript
const DEPARTMENT_BACKGROUNDS = {
  product: 'rgba(74, 144, 217, 0.1)',
  engineering: 'rgba(80, 200, 120, 0.1)',
  quality: 'rgba(255, 107, 107, 0.1)',
  design: 'rgba(255, 165, 0, 0.1)',
  operations: 'rgba(155, 89, 182, 0.1)'
};
```

---

## Upgrade Path (Phase 2)

### Opcao A: Pixel Art Sprites

**Fontes recomendadas:**
- [itch.io Office Assets](https://itch.io/game-assets/tag-office/tag-pixel-art)
- [PixelLab AI Generator](https://www.pixellab.ai/) - Gerar sprites customizados
- [Piskel](https://www.piskelapp.com/) - Editor gratuito para criar sprites

**Especificacoes para sprites:**
- Tamanho: 64x64px por frame
- Frames por estado: 4-8 frames
- Formato: PNG spritesheet
- Estados necessarios: idle (4f), working (8f), thinking (4f)

### Opcao B: SVG Avatars Customizados

Criar avatares vetoriais com:
- Rostos distintos para cada agente
- Cores do departamento
- Acessorios que representam o role

---

## Checklist de Implementacao

### MVP (Desbloqueado AGORA)

- [ ] Criar componente AgentAvatar.tsx
- [ ] Definir DEPARTMENT_COLORS no theme
- [ ] Criar animacoes CSS (breathing, typing, etc.)
- [ ] Implementar status badges
- [ ] Testar em dark mode

### Phase 2

- [ ] Pesquisar/criar pixel art sprites
- [ ] Implementar spritesheet loader
- [ ] Substituir emojis por sprites
- [ ] Adicionar mais frames de animacao

---

## Decisao de Design: Glassmorphism

Manter consistencia com SPFP usando glassmorphism nos paineis:

```css
.office-panel {
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

---

## Conclusao

**Status: DESBLOQUEADO**

A estrategia hibrida permite:
1. Iniciar desenvolvimento IMEDIATAMENTE com avatares CSS + emojis
2. Visual funcional e atraente para MVP
3. Path claro para upgrade com sprites no futuro
4. Zero custo inicial
5. Consistente com design system do SPFP (glassmorphism, dark mode)

---

*Asset Strategy definida por Luna (UX Designer Agent) - 2025-02-08*
