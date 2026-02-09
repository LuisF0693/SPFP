# Design Specification - Pixel Art Virtual Office v2.0

**UX Designer:** Luna (AIOS UX)
**Data:** 2026-02-09
**Versao:** 1.0
**Status:** ESPECIFICACAO COMPLETA

---

## 1. Visao de Design

### 1.1 Conceito Visual

**Estilo:** Pixel Art Nostalgico + Moderno
**Inspiracao:** Gather.town, Pokemon, Stardew Valley, Zelda SNES
**Tom:** Profissional mas acolhedor, nostalgico mas funcional

### 1.2 Pilares de Design

| Pilar | Descricao | Aplicacao |
|-------|-----------|-----------|
| **Nostalgia** | Estilo retro 16-bit | Sprites, tiles, fontes pixel |
| **Clareza** | Informacao facil de ler | Labels, status, cores distintas |
| **Vida** | Sensacao de escritorio vivo | Animacoes, movimento, atividade |
| **Personalidade** | Cada agente e unico | Cores, acessorios, poses |

---

## 2. Paleta de Cores

### 2.1 Cores Base do Escritorio

```
PISOS E PAREDES
┌─────────────────────────────────────────────────┐
│  #2D2D44  │  #3D3D5C  │  #4A4A6A  │  #5C5C7A  │  Tons escuros (noite)
│  #E8E4D9  │  #D4CFC4  │  #C0BBB0  │  #ACA79C  │  Tons claros (dia)
│  #8B7355  │  #A08060  │  #B59070  │  #CAA080  │  Madeira
│  #6B5B95  │  #7B6BA5  │  #8B7BB5  │  #9B8BC5  │  Carpete roxo
└─────────────────────────────────────────────────┘

DEPARTAMENTOS (Cores de destaque)
┌─────────────────────────────────────────────────┐
│  Product     │  #FF8C42  │  Laranja quente      │
│  Engineering │  #4A90D9  │  Azul tech           │
│  Quality     │  #50C878  │  Verde confianca     │
│  Design      │  #E91E63  │  Rosa criativo       │
│  Operations  │  #9B59B6  │  Roxo organizacao    │
└─────────────────────────────────────────────────┘
```

### 2.2 Cores dos Agentes

| Agente | Cor Primaria | Cor Secundaria | Hex |
|--------|--------------|----------------|-----|
| **Dex** (Dev) | Azul | Branco | #4A90D9 |
| **Quinn** (QA) | Verde | Amarelo | #50C878 |
| **Aria** (Architect) | Roxo | Prata | #9B59B6 |
| **Morgan** (PM) | Laranja | Azul | #FF8C42 |
| **Sophie** (PO) | Rosa | Dourado | #E91E63 |
| **Max** (SM) | Amarelo | Preto | #F1C40F |
| **Luna** (UX) | Ciano | Rosa | #00BCD4 |
| **Atlas** (Analyst) | Vermelho | Branco | #E74C3C |
| **Nova** (Data) | Indigo | Verde | #3F51B5 |
| **Gage** (DevOps) | Cinza | Verde | #607D8B |

### 2.3 Cores de Status

```
STATUS INDICATORS
┌─────────────────────────────────────────────────┐
│  Idle      │  #808080  │  Cinza neutro         │
│  Working   │  #4CAF50  │  Verde ativo          │
│  Thinking  │  #FF9800  │  Laranja pensativo    │
│  Waiting   │  #2196F3  │  Azul aguardando      │
│  Error     │  #F44336  │  Vermelho alerta      │
│  Success   │  #8BC34A  │  Verde claro celebrar │
└─────────────────────────────────────────────────┘
```

---

## 3. Tipografia

### 3.1 Fontes Pixel Art

```css
/* Fonte principal para UI pixel */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

/* Fonte secundaria para texto legivel */
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

.pixel-font {
  font-family: 'Press Start 2P', monospace;
  image-rendering: pixelated;
  -webkit-font-smoothing: none;
}

.pixel-font-readable {
  font-family: 'VT323', monospace;
  font-size: 16px; /* Escala bem em pixel art */
}
```

### 3.2 Tamanhos

| Elemento | Fonte | Tamanho | Uso |
|----------|-------|---------|-----|
| Agent Name | Press Start 2P | 8px | Labels sobre sprites |
| Status Text | VT323 | 12px | Status indicators |
| Chat Bubble | VT323 | 10px | Mensagens curtas |
| Department | Press Start 2P | 10px | Labels de area |
| UI Headers | VT323 | 14px | Titulos de paineis |

---

## 4. Especificacao de Sprites

### 4.1 Dimensoes Base

```
SPRITE DIMENSIONS
┌─────────────────────────────────────────────────┐
│  Tile Size        │  32x32 pixels              │
│  Agent Sprite     │  32x48 pixels (largura x altura) │
│  Furniture        │  32x32 a 96x64 (variavel)  │
│  Decorations      │  16x16 a 32x32             │
│  Icons/UI         │  16x16 pixels              │
└─────────────────────────────────────────────────┘
```

### 4.2 Sprite Sheet dos Agentes

```
AGENT SPRITE SHEET LAYOUT (512x512 PNG)
┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│ D0 │ D1 │ D2 │ D3 │ L0 │ L1 │ L2 │ L3 │ R0 │ R1 │ R2 │ R3 │ U0 │ U1 │ U2 │ U3 │ ← Idle (4 dirs x 4 frames)
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ W0 │ W1 │ W2 │ W3 │ W4 │ W5 │ W6 │ W7 │    │    │    │    │    │    │    │    │ ← Walk (8 frames)
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
│ WK0│ WK1│ WK2│ WK3│ TH0│ TH1│ TH2│ TH3│ CE0│ CE1│ CE2│ CE3│ ER0│ ER1│    │    │ ← Work/Think/Celebrate/Error
├────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤

Cada AGENTE tem uma linha no sprite sheet.
Total: 10 agentes = 10 rows x 48px = 480px altura
```

### 4.3 Design Individual dos Agentes

#### Dex (Dev) - O Desenvolvedor

```
┌──────────────────────────────────────┐
│ Cor: Azul (#4A90D9)                  │
│ Cabelo: Curto, escuro, levemente     │
│         desarrumado                  │
│ Roupa: Hoodie azul, jeans            │
│ Acessorio: Headphones (sempre)       │
│ Expressao: Focado, determinado       │
│ Pose idle: Digitando no ar           │
│ Pose work: Codando intensamente      │
└──────────────────────────────────────┘

[Pixel Art Reference - 32x48]
    ████
   ██░░██
  ██░░░░██   ← Cabelo escuro
  ██●░●░██   ← Rosto
   ██▼▼██    ← Boca
  ████████   ← Headphones
 ██████████  ← Hoodie azul
 ██  ██  ██  ← Bracos
    ████     ← Corpo
   ██  ██    ← Pernas jeans
```

#### Quinn (QA) - A Testadora

```
┌──────────────────────────────────────┐
│ Cor: Verde (#50C878)                 │
│ Cabelo: Medio, ruivo, preso          │
│ Roupa: Camisa verde, calca social    │
│ Acessorio: Clipboard/tablet          │
│ Expressao: Atenta, analitica         │
│ Pose idle: Verificando lista         │
│ Pose work: Anotando bugs             │
└──────────────────────────────────────┘
```

#### Aria (Architect) - A Arquiteta

```
┌──────────────────────────────────────┐
│ Cor: Roxo (#9B59B6)                  │
│ Cabelo: Longo, preto, elegante       │
│ Roupa: Blazer roxo, calca preta      │
│ Acessorio: Blueprint/diagrama        │
│ Expressao: Pensativa, estrategica    │
│ Pose idle: Mao no queixo             │
│ Pose work: Desenhando diagrama       │
└──────────────────────────────────────┘
```

#### Morgan (PM) - O Product Manager

```
┌──────────────────────────────────────┐
│ Cor: Laranja (#FF8C42)               │
│ Cabelo: Curto, loiro, arrumado       │
│ Roupa: Camisa laranja, calca caqui   │
│ Acessorio: Notebook/laptop           │
│ Expressao: Comunicativo, energico    │
│ Pose idle: Gesticulando              │
│ Pose work: Apresentando              │
└──────────────────────────────────────┘
```

#### Sophie (PO) - A Product Owner

```
┌──────────────────────────────────────┐
│ Cor: Rosa (#E91E63)                  │
│ Cabelo: Medio, castanho, ondulado    │
│ Roupa: Blusa rosa, saia              │
│ Acessorio: Oculos fashion            │
│ Expressao: Visionaria, decidida      │
│ Pose idle: Observando horizonte      │
│ Pose work: Apontando direcao         │
└──────────────────────────────────────┘
```

#### Max (SM) - O Scrum Master

```
┌──────────────────────────────────────┐
│ Cor: Amarelo (#F1C40F)               │
│ Cabelo: Careca/raspado               │
│ Roupa: Camiseta amarela, jeans       │
│ Acessorio: Post-its na mao           │
│ Expressao: Facilitador, calmo        │
│ Pose idle: Organizando board         │
│ Pose work: Movendo post-its          │
└──────────────────────────────────────┘
```

#### Luna (UX) - A Designer

```
┌──────────────────────────────────────┐
│ Cor: Ciano (#00BCD4)                 │
│ Cabelo: Curto, colorido (ciano)      │
│ Roupa: Camiseta artistica, jeans     │
│ Acessorio: Tablet de desenho         │
│ Expressao: Criativa, expressiva      │
│ Pose idle: Desenhando no ar          │
│ Pose work: Criando interface         │
└──────────────────────────────────────┘
```

#### Atlas (Analyst) - A Analista

```
┌──────────────────────────────────────┐
│ Cor: Vermelho (#E74C3C)              │
│ Cabelo: Longo, preto, rabo de cavalo │
│ Roupa: Camisa vermelha, calca preta  │
│ Acessorio: Graficos flutuantes       │
│ Expressao: Concentrada, analitica    │
│ Pose idle: Analisando dados          │
│ Pose work: Gerando relatorio         │
└──────────────────────────────────────┘
```

#### Nova (Data Engineer) - A Engenheira de Dados

```
┌──────────────────────────────────────┐
│ Cor: Indigo (#3F51B5)                │
│ Cabelo: Curto, preto, moderno        │
│ Roupa: Jaqueta indigo, calca tech    │
│ Acessorio: Icone de database         │
│ Expressao: Tecnica, precisa          │
│ Pose idle: Conectando dados          │
│ Pose work: Pipeline fluindo          │
└──────────────────────────────────────┘
```

#### Gage (DevOps) - O DevOps Engineer

```
┌──────────────────────────────────────┐
│ Cor: Cinza (#607D8B)                 │
│ Cabelo: Medio, castanho, barba       │
│ Roupa: Camiseta tech, cargo pants    │
│ Acessorio: Terminal flutuante        │
│ Expressao: Pragmatico, confiavel     │
│ Pose idle: Monitorando servers       │
│ Pose work: Deploy em progresso       │
└──────────────────────────────────────┘
```

---

## 5. Layout do Mapa

### 5.1 Dimensoes do Escritorio

```
OFFICE MAP LAYOUT (40 tiles x 30 tiles = 1280x960 pixels)

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐    │
│   │   ENTRADA   │  │    LOUNGE/CAFE      │  │     SALA DE REUNIAO     │    │
│   │   [Porta]   │  │  ☕ 🛋️ 🪴           │  │  📊 [Mesa Grande]       │    │
│   │             │  │  [Sofa] [Mesa]      │  │  [Cadeiras ao redor]    │    │
│   └─────────────┘  └─────────────────────┘  └─────────────────────────┘    │
│                                                                             │
│   ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐    │
│   │   PRODUCT   │  │    ENGINEERING      │  │        QUALITY          │    │
│   │             │  │                     │  │                         │    │
│   │ 🍊 Morgan   │  │ 💙 Dex    💜 Nova   │  │    💚 Quinn             │    │
│   │ 💗 Sophie   │  │ ⬜ Gage             │  │                         │    │
│   │             │  │                     │  │                         │    │
│   │ [Mesas]     │  │ [Mesas+Monitores]   │  │ [Mesa+Ferramentas]      │    │
│   └─────────────┘  └─────────────────────┘  └─────────────────────────┘    │
│                                                                             │
│   ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐    │
│   │   DESIGN    │  │   DATA/ANALYTICS    │  │      OPERATIONS         │    │
│   │             │  │                     │  │                         │    │
│   │ 🩵 Luna     │  │ ❤️ Atlas            │  │    💛 Max               │    │
│   │ 💜 Aria     │  │                     │  │                         │    │
│   │             │  │                     │  │                         │    │
│   │ [Prancheta] │  │ [Monitors+Charts]   │  │ [Kanban Board]          │    │
│   └─────────────┘  └─────────────────────┘  └─────────────────────────┘    │
│                                                                             │
│   [Plantas] [Decoracao] [Janelas com vista]                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Tiles do Mapa (Tileset)

```
TILESET ORGANIZATION (256x256 PNG, 8x8 tiles)

Row 0: Pisos
┌────┬────┬────┬────┬────┬────┬────┬────┐
│flr1│flr2│flr3│cpt1│cpt2│cpt3│wod1│wod2│
└────┴────┴────┴────┴────┴────┴────┴────┘

Row 1: Paredes
┌────┬────┬────┬────┬────┬────┬────┬────┐
│wl_t│wl_b│wl_l│wl_r│wl_c│win1│win2│door│
└────┴────┴────┴────┴────┴────┴────┴────┘

Row 2: Mobilia (mesas)
┌────┬────┬────┬────┬────┬────┬────┬────┐
│dsk1│dsk2│dsk3│dsk4│mnt1│mnt2│chr1│chr2│
└────┴────┴────┴────┴────┴────┴────┴────┘

Row 3: Mobilia (outros)
┌────┬────┬────┬────┬────┬────┬────┬────┐
│sof1│sof2│tbl1│tbl2│shf1│shf2│cab1│cab2│
└────┴────┴────┴────┴────┴────┴────┴────┘

Row 4: Decoracao
┌────┬────┬────┬────┬────┬────┬────┬────┐
│plt1│plt2│plt3│pic1│pic2│lmp1│lmp2│rug1│
└────┴────┴────┴────┴────┴────┴────┴────┘

Row 5: Tech
┌────┬────┬────┬────┬────┬────┬────┬────┐
│srv1│srv2│prn1│cof1│wtr1│brd1│brd2│tv_1│
└────┴────┴────┴────┴────┴────┴────┴────┘
```

---

## 6. Animacoes

### 6.1 Animation Frames

| Animacao | Frames | Duracao | Loop |
|----------|--------|---------|------|
| **idle** | 4 | 1.0s | Sim |
| **walk** | 8 | 0.8s | Sim |
| **work** | 4 | 0.6s | Sim |
| **think** | 4 | 1.2s | Sim |
| **celebrate** | 6 | 0.8s | Nao |
| **error** | 4 | 0.6s | Nao |

### 6.2 Transicoes de Estado

```
STATE TRANSITION DIAGRAM

         ┌──────────────────────────────────────────┐
         │                                          │
         ▼                                          │
     ┌───────┐    tool_start    ┌─────────┐        │
     │ IDLE  │ ───────────────▶ │ WORKING │        │
     └───────┘                  └─────────┘        │
         ▲                           │             │
         │                           │             │
         │      tool_complete        ▼             │
         │   ┌─────────────┐   ┌──────────┐       │
         │   │  CELEBRATE  │◀──│ THINKING │       │
         │   └─────────────┘   └──────────┘       │
         │         │                 │             │
         │         │    error        ▼             │
         │         │           ┌─────────┐        │
         └─────────┴──────────▶│  ERROR  │────────┘
                               └─────────┘
```

### 6.3 Efeitos Visuais

```css
/* Breathing animation para idle */
@keyframes sprite-breathe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

/* Bounce para celebrate */
@keyframes sprite-celebrate {
  0%, 100% { transform: translateY(0) scale(1); }
  25% { transform: translateY(-8px) scale(1.1); }
  50% { transform: translateY(-4px) scale(1); }
  75% { transform: translateY(-6px) scale(1.05); }
}

/* Shake para error */
@keyframes sprite-error {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

/* Particles para working */
.working-particles {
  /* Pequenos pixels subindo (codigo/dados) */
}
```

---

## 7. UI Elements

### 7.1 Chat Bubble Design

```
CHAT BUBBLE (Pixel Art Style)

     ┌─────────────────────────┐
     │░░░░░░░░░░░░░░░░░░░░░░░░░│ ← Borda 2px preta
     │░ Reading config.ts... ░│ ← Fundo branco
     │░░░░░░░░░░░░░░░░░░░░░░░░░│ ← Texto VT323 10px
     └───────────┬─────────────┘
                 │ ← Seta triangular
                 ▼

Cores por tipo:
- Info: Borda preta, fundo branco
- Success: Borda verde, fundo verde claro
- Error: Borda vermelha, fundo vermelho claro
```

### 7.2 Name Labels

```
NAME LABEL DESIGN

   ┌─────────────────┐
   │ ● Dex [Working] │  ← Status dot + Nome + Status
   └─────────────────┘

   ● Verde = Working
   ○ Cinza = Idle
   ◉ Laranja = Thinking
   ✕ Vermelho = Error
```

### 7.3 Department Labels

```
DEPARTMENT HEADER

  ╔═══════════════════════╗
  ║    🔧 ENGINEERING     ║  ← Emoji + Nome
  ╚═══════════════════════╝
       └── Cor do dept ──┘
```

### 7.4 Mini-Map

```
MINI-MAP (150x100 pixels, canto inferior direito)

┌─────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓░░░░░▓░░░░░░░░░▓░░░░░░░░░▓│ ← Areas em miniatura
│▓░●░░░▓░●░░●░░░░▓░░●░░░░░░▓│ ← Agentes como dots
│▓░░░░░▓░░░░░░░░░▓░░░░░░░░░▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓░░░░░▓░░░░░░░░░▓░░░░░░░░░▓│
│▓░●░░░▓░░●░░░░░░▓░░░●░░░░░▓│
│▓░░░░░▓░░░░░░░░░▓░░░░░░░░░▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│      [  Viewport  ]       │ ← Retangulo da camera
└─────────────────────────────┘
```

---

## 8. Assets Checklist

### 8.1 Sprites Necessarios

| Asset | Dimensao | Frames | Prioridade |
|-------|----------|--------|------------|
| Dex sprite sheet | 512x48 | 32 | MVP |
| Quinn sprite sheet | 512x48 | 32 | MVP |
| Aria sprite sheet | 512x48 | 32 | MVP |
| Morgan sprite sheet | 512x48 | 32 | MVP |
| Sophie sprite sheet | 512x48 | 32 | MVP |
| Max sprite sheet | 512x48 | 32 | MVP |
| Luna sprite sheet | 512x48 | 32 | MVP |
| Atlas sprite sheet | 512x48 | 32 | MVP |
| Nova sprite sheet | 512x48 | 32 | MVP |
| Gage sprite sheet | 512x48 | 32 | MVP |

### 8.2 Tileset Necessario

| Asset | Dimensao | Tiles | Prioridade |
|-------|----------|-------|------------|
| Floor tiles | 256x32 | 8 | MVP |
| Wall tiles | 256x32 | 8 | MVP |
| Furniture | 256x128 | 32 | MVP |
| Decorations | 128x64 | 16 | MVP |
| Tech items | 128x32 | 8 | MVP |

### 8.3 UI Assets

| Asset | Formato | Prioridade |
|-------|---------|------------|
| Chat bubble 9-patch | PNG | MVP |
| Status icons (5) | PNG 16x16 | MVP |
| Department banners | PNG | MVP |
| Mini-map frame | PNG | v1.1 |

---

## 9. Acessibilidade

### 9.1 Consideracoes

| Aspecto | Implementacao |
|---------|---------------|
| **Contraste** | Minimo 4.5:1 para texto |
| **Cores** | Nao depender so de cor (usar icones) |
| **Fonte** | Tamanho minimo 8px (pixel font) |
| **Animacoes** | Respeitar prefers-reduced-motion |
| **Keyboard** | Navegacao por WASD/setas |

### 9.2 Color Blind Safe

```
STATUS COLORS (Com simbolos)
- Working: Verde + Icone ▶
- Idle: Cinza + Icone ●
- Thinking: Laranja + Icone ◐
- Error: Vermelho + Icone ✕
- Success: Verde claro + Icone ✓
```

---

## 10. Assets Open Source Recomendados

### 10.1 Para Placeholder/Referencia

| Fonte | Link | Uso |
|-------|------|-----|
| **OpenGameArt** | opengameart.org | Tiles e sprites |
| **itch.io Assets** | itch.io/game-assets | Sprite sheets |
| **Kenney** | kenney.nl | UI e tiles |
| **LPC Sprites** | lpc.opengameart.org | Characters |

### 10.2 Ferramentas Gratuitas

| Ferramenta | Link | Uso |
|------------|------|-----|
| **Piskel** | piskelapp.com | Criar sprites |
| **Tiled** | mapeditor.org | Criar mapas |
| **GIMP** | gimp.org | Editar assets |

---

## 11. Aprovacao

| Papel | Nome | Status | Data |
|-------|------|--------|------|
| UX Designer | Luna | **APROVADO** | 2026-02-09 |

---

**Documento de Design Specification**
**Criado por:** Luna (AIOS UX Designer)
**Data:** 2026-02-09

**Status: PRONTO PARA DESENVOLVIMENTO DE ASSETS**

---

*"Design pixel art nao e sobre limitacao, e sobre expressao maxima com recursos minimos."* - Luna
