# Analise de Requisitos - Pixel Art Virtual Office

**Analista:** Atlas (AIOS Analyst)
**Data:** 2026-02-09
**Status:** Em Andamento
**Referencia:** Gather.town Style Virtual Office

---

## 1. Analise da Imagem de Referencia

### 1.1 Elementos Visuais Identificados

| Categoria | Elementos | Detalhes |
|-----------|-----------|----------|
| **Personagens** | Avatares pixel art | "You", "Ulrien, Steven", "Brad", "Alison", "Sam, Morgan" |
| **Departamentos** | Areas demarcadas | "Product team", "CX team" |
| **Mobilia** | Mesas, cadeiras, sofas | Workstations com computadores |
| **Decoracao** | Plantas, quadros, estantes | Vasos, arvores, livros |
| **Lazer** | Mesa de ping-pong | Area de descanso |
| **Infraestrutura** | Janelas, portas, pisos | Diferentes texturas por area |

### 1.2 Caracteristicas Visuais

- **Estilo:** Pixel art 2D top-down (vista de cima)
- **Resolucao tiles:** 32x32 pixels (padrao Gather.town)
- **Paleta de cores:** Tons pasteis, roxo, bege, verde
- **Perspectiva:** Isometrica simplificada
- **Animacoes:** Idle, walking, working (personagens)

### 1.3 Elementos de UI

- Labels flutuantes com nomes sobre avatares
- Baloes de chat (speech bubbles)
- Indicadores de status (online/working)
- Demarcacao de areas/departamentos

---

## 2. Benchmark - Gather.town

### 2.1 Features Principais (Pesquisa)

| Feature | Descricao | Prioridade p/ AIOS |
|---------|-----------|-------------------|
| **Spatial Audio** | Audio 3D baseado em proximidade | Media |
| **Video Chat** | Video integrado ao avatar | Baixa (fora escopo) |
| **Custom Objects** | Objetos interativos customizaveis | Alta |
| **Tile System** | Grid 32x32 pixels | Alta |
| **Avatar Customization** | Personalizacao de personagem | Alta |
| **Interactive Areas** | Zonas com funcoes especiais | Media |

### 2.2 Especificacoes Tecnicas Gather

- Tiles: 32x32 pixels
- Sprites: Multiplos frames para animacao
- Objetos: Interativos e nao-interativos
- Mapas: JSON-based tilemap

**Fontes:**
- [Gather Town Reviews - G2](https://www.g2.com/products/gather-town-gather/reviews)
- [Custom Objects - Gather Support](https://support.gather.town/hc/en-us/articles/15909788073236-Custom-Objects)
- [Gather Nostalgic Vision - Wix](https://www.wix.com/studio/blog/gathers-nostalgic-metaverse-vision-is-nothing-like-metas)

---

## 3. Requisitos Funcionais

### 3.1 MVP (Minimo Viavel)

- [ ] **RF001** - Renderizar mapa 2D pixel art do escritorio
- [ ] **RF002** - Exibir agentes AIOS como sprites animados
- [ ] **RF003** - Movimento suave dos agentes entre posicoes
- [ ] **RF004** - Labels com nome e status sobre cada agente
- [ ] **RF005** - Departamentos visualmente demarcados
- [ ] **RF006** - Indicador de status (idle/working/thinking)
- [ ] **RF007** - Integracao com AIOS Bridge existente

### 3.2 Features Completas

- [ ] **RF008** - Usuario pode mover seu avatar pelo mapa
- [ ] **RF009** - Sistema de colisao (nao atravessar paredes/mesas)
- [ ] **RF010** - Chat bubbles ao lado dos agentes
- [ ] **RF011** - Animacoes de trabalho (digitando, pensando)
- [ ] **RF012** - Som ambiente e efeitos sonoros
- [ ] **RF013** - Mini-map do escritorio
- [ ] **RF014** - Customizacao do avatar do usuario

### 3.3 Features Avancadas (Futuro)

- [ ] **RF015** - Editor de mapa (admin)
- [ ] **RF016** - Objetos interativos (whiteboard, TV)
- [ ] **RF017** - Salas de reuniao privadas
- [ ] **RF018** - Integracao video (WebRTC)

---

## 4. Requisitos Nao-Funcionais

### 4.1 Performance

| Metrica | Target | Critico |
|---------|--------|---------|
| **FPS** | 60fps | 30fps min |
| **Memory** | < 100MB | < 200MB |
| **Load Time** | < 3s | < 5s |
| **Sprite Count** | 50+ simultaneos | 20 min |

### 4.2 Compatibilidade

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Desktop: Windows, macOS, Linux
- Resolucoes: 1280x720 ate 4K
- Mobile: Nao prioritario (futuro)

### 4.3 Acessibilidade

- Labels de texto legiveis
- Contraste adequado
- Navegacao por teclado (WASD/setas)

---

## 5. Analise Tecnica

### 5.1 Stack Recomendada

| Opcao | Pros | Cons | Recomendacao |
|-------|------|------|--------------|
| **Pixi.js + React** | Performance, React-friendly, Bem documentado | Curva de aprendizado | **RECOMENDADO** |
| **Phaser 3** | Game engine completo, Tilemap nativo | Peso maior, Menos React-friendly | Alternativa |
| **Canvas puro** | Leve, Controle total | Muito trabalho manual | Nao recomendado |
| **HTML/CSS** | Simples | Performance ruim p/ muitos sprites | Atual (limita) |

### 5.2 Arquitetura Proposta

```
┌─────────────────────────────────────────────────┐
│                   React App                      │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  Pixi.js     │  │   React Components       │ │
│  │  Canvas      │  │   (UI, Panels, Controls) │ │
│  └──────────────┘  └──────────────────────────┘ │
├─────────────────────────────────────────────────┤
│              Zustand Store                       │
│  (agents, map, camera, user, settings)          │
├─────────────────────────────────────────────────┤
│              AIOS Bridge                         │
│  (eventos de agentes em tempo real)             │
└─────────────────────────────────────────────────┘
```

### 5.3 Assets Necessarios

| Asset | Tipo | Quantidade | Formato |
|-------|------|------------|---------|
| **Agent Sprites** | Sprite sheet | 10 agentes x 4 direcoes x 3 frames | PNG 32x32 |
| **Tiles Base** | Tileset | ~50 tiles (piso, parede, etc) | PNG 32x32 |
| **Mobilia** | Objetos | ~30 objetos (mesa, cadeira, etc) | PNG variavel |
| **Decoracao** | Objetos | ~20 itens (plantas, quadros) | PNG variavel |
| **UI Elements** | Sprites | ~10 (bubbles, labels, icons) | PNG/SVG |

**Fontes Tecnicas:**
- [PixiJS Official](https://pixijs.com/)
- [PixiJS + React Guide](https://adamemery.dev/articles/pixi-react)
- [Sprite Sheets Tutorial](https://www.codeandweb.com/texturepacker/tutorials/how-to-create-sprite-sheets-and-animations-with-pixijs)

---

## 6. Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| **Performance baixa** | Media | Alto | Usar Pixi.js, otimizar sprites |
| **Assets demorados** | Alta | Alto | Usar assets open-source inicial |
| **Complexidade tecnica** | Media | Medio | Implementar em fases |
| **Integracao AIOS** | Baixa | Medio | Bridge ja existe |

---

## 7. Estimativa de Esforco

### 7.1 Por Fase

| Fase | Responsavel | Estimativa |
|------|-------------|------------|
| PRD Detalhado | Morgan (PM) | 1-2 dias |
| Validacao PO | Sophie (PO) | 0.5 dia |
| Arquitetura | Aria (Architect) | 1-2 dias |
| Design/Assets | Luna (UX) | 3-5 dias |
| User Stories | Max (SM) | 1 dia |
| Implementacao | Dex (Dev) | 5-10 dias |
| QA/Review | Quinn (QA) | 2-3 dias |

### 7.2 Total Estimado

- **MVP:** 2-3 semanas
- **Completo:** 4-6 semanas

---

## 8. Proximos Passos

1. **Morgan (PM)** - Criar PRD detalhado com features prioritizadas
2. **Sophie (PO)** - Validar e aprovar escopo MVP
3. **Aria (Architect)** - Definir arquitetura tecnica com Pixi.js
4. **Luna (UX)** - Iniciar design do mapa e sprites
5. **Max (SM)** - Quebrar em user stories

---

## 9. Referencias

### Pesquisa
- [Gather Town - G2 Reviews](https://www.g2.com/products/gather-town-gather/reviews)
- [Gather Custom Objects](https://support.gather.town/hc/en-us/articles/15909788073236-Custom-Objects)
- [SoWork AI Virtual HQ](https://skywork.ai/skypage/en/Beyond-Gather-Town:-My-Deep-Dive-into-SoWork,-the-AI-Powered-Virtual-HQ/1975067703573671936)

### Tecnico
- [PixiJS Official](https://pixijs.com/)
- [PixiJS + React](https://blog.logrocket.com/getting-started-pixijs-react-create-canvas/)
- [Learning PixiJS](https://github.com/kittykatattack/learningPixi)
- [Sprite Sheets for PixiJS](https://www.codeandweb.com/texturepacker/tutorials/how-to-create-sprite-sheets-and-animations-with-pixijs)

---

**Documento gerado por Atlas (AIOS Analyst)**
**Proxima etapa:** Morgan (PM) - PRD Detalhado
