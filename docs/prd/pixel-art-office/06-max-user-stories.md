# User Stories & Sprint Backlog - Pixel Art Virtual Office v2.0

**Scrum Master:** Max (AIOS SM)
**Data:** 2026-02-09
**Sprint Duration:** 1 semana
**Team Velocity:** ~20 story points/sprint

---

## 1. Epics

### Epic 1: Fundacao Pixi.js (Setup)
> Como desenvolvedor, preciso configurar a infraestrutura Pixi.js para renderizar o escritorio pixel art.

### Epic 2: Mapa do Escritorio
> Como usuario, quero ver um escritorio 2D pixel art para visualizar o ambiente de trabalho dos agentes.

### Epic 3: Agentes como Sprites
> Como usuario, quero ver cada agente AIOS como um personagem pixel art unico para identificar e humanizar a equipe.

### Epic 4: Status e Animacoes
> Como usuario, quero ver animacoes quando os agentes trabalham para entender visualmente o que esta acontecendo.

### Epic 5: UI e Interacao
> Como usuario, quero interagir com o escritorio (pan, zoom, selecionar) para explorar o ambiente.

### Epic 6: Chat Bubbles
> Como usuario, quero ver baloes de chat mostrando o que cada agente esta fazendo para acompanhar o trabalho.

---

## 2. User Stories Detalhadas

### SPRINT 0 - Setup e POC (Spike)

---

#### US-001: Setup Pixi.js no projeto
**Epic:** Fundacao Pixi.js
**Pontos:** 3
**Responsavel:** Dex

**Historia:**
> Como desenvolvedor, quero configurar Pixi.js e @pixi/react no projeto para comecar a renderizar graficos 2D.

**Criterios de Aceitacao:**
```gherkin
DADO que o projeto SPFP existe
QUANDO eu instalo pixi.js e @pixi/react
ENTAO as dependencias devem ser adicionadas ao package.json
E o TypeScript deve reconhecer os tipos
E nenhum erro de build deve ocorrer
```

**Tarefas:**
- [ ] npm install pixi.js @pixi/react
- [ ] Configurar tipos TypeScript
- [ ] Criar pasta src/virtual-office-v2/
- [ ] Verificar build sem erros

**Definition of Done:**
- [ ] Dependencias instaladas
- [ ] Build passa
- [ ] Sem warnings no console

---

#### US-002: POC - Renderizar canvas Pixi
**Epic:** Fundacao Pixi.js
**Pontos:** 5
**Responsavel:** Dex

**Historia:**
> Como desenvolvedor, quero criar um componente que renderiza um canvas Pixi.js para validar a integracao.

**Criterios de Aceitacao:**
```gherkin
DADO que Pixi.js esta instalado
QUANDO eu renderizo o componente PixiCanvas
ENTAO um canvas WebGL deve aparecer na tela
E deve ter dimensoes 1200x800
E deve ter background color configuravel
```

**Tarefas:**
- [ ] Criar PixiCanvas.tsx
- [ ] Integrar com @pixi/react Stage
- [ ] Testar em diferentes browsers
- [ ] Medir FPS baseline

**Definition of Done:**
- [ ] Canvas renderiza
- [ ] 60fps em Chrome/Firefox/Safari
- [ ] Memory < 50MB

---

### SPRINT 1 - Mapa e Tiles

---

#### US-003: Carregar tileset do escritorio
**Epic:** Mapa do Escritorio
**Pontos:** 5
**Responsavel:** Dex

**Historia:**
> Como desenvolvedor, quero carregar o tileset PNG do escritorio para usar na renderizacao do mapa.

**Criterios de Aceitacao:**
```gherkin
DADO que o arquivo office-tileset.png existe em assets/
QUANDO o componente inicializa
ENTAO o tileset deve ser carregado como textura Pixi
E deve estar disponivel para uso em tiles
E o carregamento deve levar < 1s
```

**Tarefas:**
- [ ] Criar/obter tileset placeholder (256x256 PNG)
- [ ] Criar useTileset.ts hook
- [ ] Implementar carregamento async
- [ ] Adicionar loading state

**Definition of Done:**
- [ ] Tileset carrega sem erros
- [ ] Texturas disponiveis
- [ ] Loading indicator funciona

---

#### US-004: Renderizar mapa base com tiles
**Epic:** Mapa do Escritorio
**Pontos:** 8
**Responsavel:** Dex

**Historia:**
> Como usuario, quero ver o piso do escritorio renderizado como tiles pixel art para ter contexto visual.

**Criterios de Aceitacao:**
```gherkin
DADO que o tileset esta carregado
QUANDO o mapa e renderizado
ENTAO deve exibir uma grade de tiles 40x30
E cada tile deve ter 32x32 pixels
E os tiles devem formar um piso coerente
```

**Tarefas:**
- [ ] Criar TileMapLayer.tsx
- [ ] Implementar grid rendering
- [ ] Carregar mapa JSON (Tiled format)
- [ ] Renderizar camada de piso

**Definition of Done:**
- [ ] Mapa renderiza corretamente
- [ ] Tiles alinhados sem gaps
- [ ] Performance 60fps

---

#### US-005: Renderizar paredes e mobilia
**Epic:** Mapa do Escritorio
**Pontos:** 5
**Responsavel:** Dex

**Historia:**
> Como usuario, quero ver paredes, mesas e decoracao no escritorio para ter um ambiente completo.

**Criterios de Aceitacao:**
```gherkin
DADO que o piso esta renderizado
QUANDO as camadas adicionais carregam
ENTAO paredes devem aparecer nos limites
E mobilia deve estar posicionada nas areas
E decoracao (plantas, quadros) deve ser visivel
```

**Tarefas:**
- [ ] Adicionar camada de paredes ao mapa
- [ ] Adicionar camada de mobilia
- [ ] Implementar z-ordering correto
- [ ] Ajustar posicoes conforme layout

**Definition of Done:**
- [ ] Todas as camadas renderizam
- [ ] Z-order correto (piso < mobilia < agentes)
- [ ] Visual coerente

---

#### US-006: Demarcar departamentos visualmente
**Epic:** Mapa do Escritorio
**Pontos:** 3
**Responsavel:** Dex

**Historia:**
> Como usuario, quero ver os departamentos demarcados com cores diferentes para entender a organizacao.

**Criterios de Aceitacao:**
```gherkin
DADO que o mapa esta renderizado
QUANDO olho para as diferentes areas
ENTAO Product deve ter tom laranja
E Engineering deve ter tom azul
E Quality deve ter tom verde
E Design deve ter tom rosa
E Operations deve ter tom roxo
```

**Tarefas:**
- [ ] Usar tiles de carpete coloridos por dept
- [ ] Adicionar labels de departamento
- [ ] Posicionar labels corretamente

**Definition of Done:**
- [ ] 5 departamentos visiveis
- [ ] Cores distintas
- [ ] Labels legiveis

---

### SPRINT 2 - Agentes e Sprites

---

#### US-007: Carregar sprite sheet dos agentes
**Epic:** Agentes como Sprites
**Pontos:** 5
**Responsavel:** Dex

**Historia:**
> Como desenvolvedor, quero carregar o sprite sheet com todos os agentes para renderiza-los no mapa.

**Criterios de Aceitacao:**
```gherkin
DADO que o arquivo agents.png existe
QUANDO o componente inicializa
ENTAO o sprite sheet deve ser carregado
E as animacoes devem ser parseadas do JSON
E cada agente deve ter suas texturas disponiveis
```

**Tarefas:**
- [ ] Criar/obter sprite sheet placeholder
- [ ] Criar useSpriteSheet.ts hook
- [ ] Parsear animacoes do JSON
- [ ] Mapear frames por agente

**Definition of Done:**
- [ ] Sprite sheet carrega
- [ ] 10 agentes com texturas
- [ ] Animacoes mapeadas

---

#### US-008: Renderizar sprites dos agentes
**Epic:** Agentes como Sprites
**Pontos:** 8
**Responsavel:** Dex

**Historia:**
> Como usuario, quero ver cada agente AIOS como um personagem pixel art no seu departamento.

**Criterios de Aceitacao:**
```gherkin
DADO que os sprites estao carregados
QUANDO o mapa renderiza
ENTAO Dex deve aparecer em Engineering
E Quinn deve aparecer em Quality
E cada agente deve ter aparencia unica
E os sprites devem ter 32x48 pixels
```

**Tarefas:**
- [ ] Criar AgentSprite.tsx
- [ ] Criar AgentSpriteManager.tsx
- [ ] Posicionar agentes por departamento
- [ ] Aplicar cores/acessorios unicos

**Definition of Done:**
- [ ] 10 agentes renderizam
- [ ] Posicoes corretas
- [ ] Visual unico por agente

---

#### US-009: Exibir name labels sobre os agentes
**Epic:** Agentes como Sprites
**Pontos:** 3
**Responsavel:** Dex

**Historia:**
> Como usuario, quero ver o nome de cada agente flutuando sobre seu sprite para identificar quem e quem.

**Criterios de Aceitacao:**
```gherkin
DADO que um agente esta renderizado
QUANDO olho para o sprite
ENTAO o nome deve aparecer acima (ex: "Dex")
E o status deve aparecer ao lado (ex: "[Working]")
E a fonte deve ser legivel (pixel font)
```

**Tarefas:**
- [ ] Criar NameLabelOverlay.tsx
- [ ] Posicionar labels sobre sprites
- [ ] Adicionar status ao lado do nome
- [ ] Aplicar fonte pixel art

**Definition of Done:**
- [ ] Labels visiveis
- [ ] Nomes corretos
- [ ] Status atualiza

---

### SPRINT 3 - Animacoes e Bridge

---

#### US-010: Implementar animacao idle
**Epic:** Status e Animacoes
**Pontos:** 5
**Responsavel:** Dex

**Historia:**
> Como usuario, quero ver os agentes em repouso com uma animacao suave de respiracao para sentir que estao vivos.

**Criterios de Aceitacao:**
```gherkin
DADO que um agente esta com status "idle"
QUANDO observo o sprite
ENTAO deve haver uma animacao suave de respiracao
E a animacao deve ter 4 frames
E deve fazer loop continuo
```

**Tarefas:**
- [ ] Implementar AnimationController.ts
- [ ] Criar animacao idle (4 frames)
- [ ] Aplicar efeito de breathing
- [ ] Loop automatico

**Definition of Done:**
- [ ] Animacao idle funciona
- [ ] Smooth 60fps
- [ ] Todos os agentes idle animam

---

#### US-011: Implementar animacao working
**Epic:** Status e Animacoes
**Pontos:** 5
**Responsavel:** Dex

**Historia:**
> Como usuario, quero ver os agentes trabalhando com animacao de digitacao para entender que estao ativos.

**Criterios de Aceitacao:**
```gherkin
DADO que um agente esta com status "working"
QUANDO observo o sprite
ENTAO deve haver animacao de digitacao
E pequenas particulas de "codigo" podem subir
E a animacao deve ser mais rapida que idle
```

**Tarefas:**
- [ ] Criar animacao work (4 frames)
- [ ] Implementar transicao idle -> work
- [ ] Adicionar particulas opcionais
- [ ] Ajustar velocidade

**Definition of Done:**
- [ ] Animacao working funciona
- [ ] Transicao suave
- [ ] Diferenca visual clara de idle

---

#### US-012: Integrar com AIOS Bridge
**Epic:** Status e Animacoes
**Pontos:** 8
**Responsavel:** Dex

**Historia:**
> Como usuario, quero que os sprites atualizem em tempo real quando a Bridge envia eventos.

**Criterios de Aceitacao:**
```gherkin
DADO que a Bridge esta conectada
QUANDO um evento tool_start chega para "dex"
ENTAO o sprite do Dex deve mudar para animacao working
E a mudanca deve ocorrer em < 500ms

QUANDO um evento agent_stop chega
ENTAO o sprite deve voltar para idle
```

**Tarefas:**
- [ ] Conectar ao useAIOSBridge existente
- [ ] Mapear eventos para animacoes
- [ ] Implementar transicoes de estado
- [ ] Testar com mock mode

**Definition of Done:**
- [ ] Eventos processados
- [ ] Animacoes respondem
- [ ] Latencia < 500ms

---

### SPRINT 4 - UI, Camera e Chat Bubbles

---

#### US-013: Implementar pan do mapa
**Epic:** UI e Interacao
**Pontos:** 5
**Responsavel:** Dex

**Historia:**
> Como usuario, quero arrastar o mapa para navegar pelo escritorio.

**Criterios de Aceitacao:**
```gherkin
DADO que estou visualizando o escritorio
QUANDO arrasto com o mouse (click + drag)
ENTAO o mapa deve mover na direcao do arraste
E o movimento deve ser suave (60fps)
E deve haver limites (nao sair do mapa)
```

**Tarefas:**
- [ ] Criar useCameraControls.ts
- [ ] Implementar mouse drag
- [ ] Adicionar limites de pan
- [ ] Suavizar movimento

**Definition of Done:**
- [ ] Pan funciona
- [ ] Limites respeitados
- [ ] 60fps durante pan

---

#### US-014: Implementar zoom do mapa
**Epic:** UI e Interacao
**Pontos:** 5
**Responsavel:** Dex

**Historia:**
> Como usuario, quero usar scroll para dar zoom no mapa para ver detalhes ou visao geral.

**Criterios de Aceitacao:**
```gherkin
DADO que estou visualizando o escritorio
QUANDO uso scroll do mouse
ENTAO o mapa deve ampliar (scroll up) ou reduzir (scroll down)
E o zoom deve ser entre 50% e 200%
E deve manter 60fps
```

**Tarefas:**
- [ ] Implementar wheel handler
- [ ] Aplicar zoom no container Pixi
- [ ] Respeitar limites min/max
- [ ] Zoom centralizado no cursor

**Definition of Done:**
- [ ] Zoom funciona
- [ ] Limites 50-200%
- [ ] Centralizado no cursor

---

#### US-015: Renderizar chat bubbles
**Epic:** Chat Bubbles
**Pontos:** 8
**Responsavel:** Dex

**Historia:**
> Como usuario, quero ver baloes de chat mostrando o que cada agente esta fazendo.

**Criterios de Aceitacao:**
```gherkin
DADO que um agente inicia uma tool
QUANDO o evento tool_start chega
ENTAO um balao deve aparecer proximo ao agente
E deve mostrar "Reading config.ts..." (exemplo)
E deve desaparecer apos 5 segundos
```

**Tarefas:**
- [ ] Criar ChatBubbleOverlay.tsx
- [ ] Posicionar bubbles sobre agentes
- [ ] Estilizar com pixel art look
- [ ] Implementar timeout de 5s

**Definition of Done:**
- [ ] Bubbles aparecem
- [ ] Posicao correta
- [ ] Auto-hide apos 5s

---

#### US-016: Selecionar agente ao clicar
**Epic:** UI e Interacao
**Pontos:** 3
**Responsavel:** Dex

**Historia:**
> Como usuario, quero clicar em um agente para ver detalhes no painel lateral.

**Criterios de Aceitacao:**
```gherkin
DADO que estou visualizando o escritorio
QUANDO clico em um sprite de agente
ENTAO o agente deve ficar selecionado (highlight)
E o painel lateral deve abrir com detalhes
E o AgentPanel existente deve ser reutilizado
```

**Tarefas:**
- [ ] Adicionar click handler nos sprites
- [ ] Implementar highlight visual
- [ ] Integrar com AgentPanel existente
- [ ] Testar selecao/deselecao

**Definition of Done:**
- [ ] Click seleciona
- [ ] Highlight visivel
- [ ] Panel abre

---

### SPRINT 5 - Polish e Testes

---

#### US-017: Adicionar loading state
**Epic:** UI e Interacao
**Pontos:** 3
**Responsavel:** Dex

**Historia:**
> Como usuario, quero ver um indicador de loading enquanto os assets carregam.

**Criterios de Aceitacao:**
```gherkin
DADO que acesso o Virtual Office
QUANDO os assets estao carregando
ENTAO deve aparecer um spinner/progress
E deve mostrar % de carregamento
E deve desaparecer quando pronto
```

**Tarefas:**
- [ ] Criar LoadingOverlay.tsx
- [ ] Trackear progresso de assets
- [ ] Transicao suave para mapa

**Definition of Done:**
- [ ] Loading aparece
- [ ] Progress visivel
- [ ] Transicao suave

---

#### US-018: Otimizar performance
**Epic:** Fundacao Pixi.js
**Pontos:** 5
**Responsavel:** Dex

**Historia:**
> Como usuario, quero que o escritorio rode a 60fps sem travamentos.

**Criterios de Aceitacao:**
```gherkin
DADO que o escritorio esta renderizado
QUANDO navego pelo mapa
ENTAO o FPS deve ser >= 60
E a memoria deve ser < 100MB
E nao deve haver jank/stutter
```

**Tarefas:**
- [ ] Implementar sprite culling
- [ ] Otimizar texture batching
- [ ] Verificar memory leaks
- [ ] Profiling com DevTools

**Definition of Done:**
- [ ] 60fps estavel
- [ ] < 100MB memoria
- [ ] Sem memory leaks

---

#### US-019: Testes de integracao
**Epic:** Fundacao Pixi.js
**Pontos:** 5
**Responsavel:** Quinn

**Historia:**
> Como desenvolvedor, quero testes automatizados para garantir que nada quebra.

**Criterios de Aceitacao:**
```gherkin
DADO que o codigo esta implementado
QUANDO rodo npm run test
ENTAO testes de componentes devem passar
E testes de hooks devem passar
E coverage deve ser > 80% em areas criticas
```

**Tarefas:**
- [ ] Criar testes para hooks
- [ ] Criar testes para componentes
- [ ] Testar integracao com Bridge
- [ ] Verificar coverage

**Definition of Done:**
- [ ] Todos os testes passam
- [ ] Coverage > 80%
- [ ] CI/CD passa

---

#### US-020: Code review e documentacao
**Epic:** Fundacao Pixi.js
**Pontos:** 3
**Responsavel:** Quinn

**Historia:**
> Como desenvolvedor, quero codigo revisado e documentado para manutencao futura.

**Criterios de Aceitacao:**
```gherkin
DADO que a implementacao esta completa
QUANDO o codigo e revisado
ENTAO deve seguir padroes do projeto
E deve ter comentarios em partes complexas
E README deve explicar como usar
```

**Tarefas:**
- [ ] Code review completo
- [ ] Adicionar comentarios
- [ ] Atualizar README
- [ ] Documentar arquitetura

**Definition of Done:**
- [ ] Review aprovado
- [ ] Documentacao atualizada
- [ ] Sem TODOs pendentes

---

## 3. Sprint Backlog

### Sprint 0 - Setup (3 dias)
| Story | Pontos | Owner |
|-------|--------|-------|
| US-001 | 3 | Dex |
| US-002 | 5 | Dex |
| **Total** | **8** | |

### Sprint 1 - Mapa (1 semana)
| Story | Pontos | Owner |
|-------|--------|-------|
| US-003 | 5 | Dex |
| US-004 | 8 | Dex |
| US-005 | 5 | Dex |
| US-006 | 3 | Dex |
| **Total** | **21** | |

### Sprint 2 - Agentes (1 semana)
| Story | Pontos | Owner |
|-------|--------|-------|
| US-007 | 5 | Dex |
| US-008 | 8 | Dex |
| US-009 | 3 | Dex |
| **Total** | **16** | |

### Sprint 3 - Animacoes (1 semana)
| Story | Pontos | Owner |
|-------|--------|-------|
| US-010 | 5 | Dex |
| US-011 | 5 | Dex |
| US-012 | 8 | Dex |
| **Total** | **18** | |

### Sprint 4 - UI/Camera (1 semana)
| Story | Pontos | Owner |
|-------|--------|-------|
| US-013 | 5 | Dex |
| US-014 | 5 | Dex |
| US-015 | 8 | Dex |
| US-016 | 3 | Dex |
| **Total** | **21** | |

### Sprint 5 - Polish (1 semana)
| Story | Pontos | Owner |
|-------|--------|-------|
| US-017 | 3 | Dex |
| US-018 | 5 | Dex |
| US-019 | 5 | Quinn |
| US-020 | 3 | Quinn |
| **Total** | **16** | |

---

## 4. Resumo

| Sprint | Foco | Pontos | Duracao |
|--------|------|--------|---------|
| 0 | Setup + POC | 8 | 3 dias |
| 1 | Mapa/Tiles | 21 | 1 semana |
| 2 | Agentes | 16 | 1 semana |
| 3 | Animacoes | 18 | 1 semana |
| 4 | UI/Camera | 21 | 1 semana |
| 5 | Polish | 16 | 1 semana |
| **Total** | | **100** | **~5 semanas** |

---

## 5. Definition of Ready (DoR) Checklist

Uma story esta **Ready** quando:
- [ ] Descricao clara em formato user story
- [ ] Criterios de aceitacao em Gherkin
- [ ] Tarefas tecnicas listadas
- [ ] Pontos estimados
- [ ] Dependencias identificadas
- [ ] Assets necessarios disponiveis (ou placeholders)

---

## 6. Definition of Done (DoD) Checklist

Uma story esta **Done** quando:
- [ ] Codigo implementado e funcionando
- [ ] Testes escritos e passando
- [ ] Code review aprovado
- [ ] Sem bugs conhecidos
- [ ] Performance dentro do target
- [ ] Documentacao atualizada (se necessario)

---

**Documento de User Stories & Sprint Backlog**
**Criado por:** Max (AIOS Scrum Master)
**Data:** 2026-02-09

**Status: PRONTO PARA SPRINT PLANNING**

---

*"Uma boa user story conta uma historia que todos entendem - do PO ao dev ao usuario."* - Max
