# PRD: EPIC-003 - AI Automation

**Product Manager:** Morgan (AIOS PM Agent)
**Versao:** 1.0
**Data:** 2026-02-14
**Prioridade:** BAIXA (Fase 4)
**Sprint Estimado:** 8-10 (4-6 semanas)

---

## 1. Objetivo

Integrar o MCP Playwright para permitir que agentes de IA visualizem e interajam com o browser do usuario, automatizando tarefas repetitivas e coletando informacoes de forma autonoma.

### Visao de Longo Prazo

Criar uma camada de automacao onde agentes IA podem:
1. Ver o que o usuario ve no browser
2. Executar acoes como clicar, digitar, navegar
3. Coletar dados de paginas web
4. Automatizar fluxos de trabalho

### Problemas a Resolver

1. **Tarefas Repetitivas:** Usuario perde tempo com acoes manuais no browser
2. **Coleta de Dados:** Extrair informacoes de sites e leva tempo
3. **Demonstracoes:** Criar tutoriais e demos manualmente e trabalhoso
4. **Invisibilidade:** Usuario nao ve o que a IA poderia fazer por ele

---

## 2. Escopo

### 2.1 Incluso - MVP (In Scope)

| ID | Item | Tipo |
|----|------|------|
| F003.1 | Captura de screenshot do browser | Feature |
| F003.2 | Visualizacao de screenshot na UI | Feature |
| F003.3 | Navegacao basica (ir para URL) | Feature |
| F003.4 | Log de acoes executadas | Feature |
| F003.5 | Permissoes de acesso | Seguranca |

### 2.2 Excluso - MVP (Out of Scope)

- Automacao complexa de formularios
- Scraping massivo de dados
- Integracao com Corporate HQ (fase futura)
- Execucao autonoma sem supervisao
- Multiplas abas simultaneas
- Login automatico em sites

---

## 3. Requisitos Funcionais

### RF-001: Captura de Screenshot

**Descricao:** Permitir que a IA capture screenshots do browser atual.

**Criterios de Aceitacao:**
- [ ] AC-001.1: Botao "Capturar Tela" disponivel na interface
- [ ] AC-001.2: Screenshot capturado via MCP Playwright
- [ ] AC-001.3: Imagem exibida na UI em < 2 segundos
- [ ] AC-001.4: Resolucao adequada para visualizacao (1280x720 min)
- [ ] AC-001.5: Feedback de loading durante captura
- [ ] AC-001.6: Erro tratado se browser nao disponivel

**Fluxo:**
```
Usuario clica "Capturar Tela"
    ↓
Sistema chama mcp__playwright__browser_screenshot
    ↓
Imagem retornada em base64
    ↓
Exibida na UI como preview
```

---

### RF-002: Visualizacao de Screenshot

**Descricao:** Exibir screenshots capturados em uma area dedicada da interface.

**Criterios de Aceitacao:**
- [ ] AC-002.1: Area de preview com imagem do screenshot
- [ ] AC-002.2: Zoom in/out na imagem
- [ ] AC-002.3: Historico de screenshots recentes (ultimos 10)
- [ ] AC-002.4: Download do screenshot como PNG
- [ ] AC-002.5: Timestamp de quando foi capturado

**UI:**
```
+------------------------------------------------------------------+
| AI Automation - Browser View                                      |
+------------------------------------------------------------------+
|                                                                  |
|  +----------------------------------------------------------+   |
|  |                                                          |   |
|  |              [Screenshot do Browser]                      |   |
|  |                                                          |   |
|  |                                                          |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  Capturado: 14/02/2026 10:45:23                                 |
|                                                                  |
|  [Capturar Nova]  [Zoom +]  [Zoom -]  [Download]                |
|                                                                  |
+------------------------------------------------------------------+
|  Historico:                                                      |
|  [Thumb 1] [Thumb 2] [Thumb 3] [Thumb 4] [Thumb 5]              |
+------------------------------------------------------------------+
```

---

### RF-003: Navegacao Basica

**Descricao:** Permitir que a IA navegue para URLs especificas.

**Criterios de Aceitacao:**
- [ ] AC-003.1: Campo de input para URL
- [ ] AC-003.2: Botao "Navegar"
- [ ] AC-003.3: Validacao de URL valida
- [ ] AC-003.4: Feedback de navegacao em progresso
- [ ] AC-003.5: Screenshot automatico apos navegacao
- [ ] AC-003.6: Timeout de 30 segundos para carregamento
- [ ] AC-003.7: Erro tratado se pagina nao carregar

**Fluxo:**
```
Usuario digita URL
    ↓
Clica "Navegar"
    ↓
Sistema chama mcp__playwright__browser_navigate
    ↓
Aguarda pagina carregar
    ↓
Captura screenshot automaticamente
    ↓
Exibe resultado
```

---

### RF-004: Log de Acoes

**Descricao:** Manter registro de todas as acoes de automacao executadas.

**Criterios de Aceitacao:**
- [ ] AC-004.1: Lista de acoes executadas com timestamp
- [ ] AC-004.2: Tipo de acao (screenshot, navigate, click, etc)
- [ ] AC-004.3: Status (success, error, pending)
- [ ] AC-004.4: Detalhes da acao (URL, elemento, etc)
- [ ] AC-004.5: Filtro por tipo de acao
- [ ] AC-004.6: Limpar historico

**Formato do Log:**
```
+------------------------------------------------------------------+
| Historico de Acoes                              [Limpar]         |
+------------------------------------------------------------------+
| 10:45:23 | NAVIGATE | https://example.com         | ✓ Success   |
| 10:45:25 | SCREENSHOT | Captura apos navegacao    | ✓ Success   |
| 10:44:10 | SCREENSHOT | Captura manual            | ✓ Success   |
| 10:43:55 | NAVIGATE | https://invalid            | ✗ Error     |
+------------------------------------------------------------------+
```

---

### RF-005: Permissoes de Acesso

**Descricao:** Sistema de permissoes para controlar o que a IA pode fazer.

**Criterios de Aceitacao:**
- [ ] AC-005.1: Toggle para habilitar/desabilitar automacao
- [ ] AC-005.2: Confirmacao antes de executar acoes
- [ ] AC-005.3: Whitelist de dominios permitidos (opcional)
- [ ] AC-005.4: Limite de acoes por sessao
- [ ] AC-005.5: Log de seguranca para auditoria

**Configuracao:**
```typescript
interface AutomationPermissions {
  enabled: boolean;
  requireConfirmation: boolean;
  allowedDomains: string[]; // vazio = todos permitidos
  maxActionsPerSession: number;
  allowNavigation: boolean;
  allowClicks: boolean;
  allowTyping: boolean;
}
```

---

## 4. Requisitos Nao-Funcionais

### RNF-001: Performance
- Screenshot capturado em < 3 segundos
- Navegacao completa em < 30 segundos
- UI responsiva durante operacoes

### RNF-002: Seguranca
- Nenhuma credencial armazenada
- Nao executar em sites bancarios por padrao
- Log de todas as acoes para auditoria
- Confirmacao explicita do usuario

### RNF-003: Confiabilidade
- Retry automatico em falhas transientes
- Fallback se MCP indisponivel
- Estado preservado entre sessoes

---

## 5. Arquitetura Tecnica

### 5.1 Integracao MCP Playwright

**Ferramentas Disponiveis (conforme mcp-usage.md):**
```
mcp__playwright__browser_navigate  - Navegar para URL
mcp__playwright__browser_screenshot - Capturar tela
mcp__playwright__browser_click     - Clicar em elemento
mcp__playwright__browser_fill      - Preencher campo
mcp__playwright__browser_select    - Selecionar opcao
```

### 5.2 Servico de Automacao

```typescript
// src/services/automationService.ts

interface AutomationAction {
  id: string;
  type: 'navigate' | 'screenshot' | 'click' | 'fill' | 'select';
  params: Record<string, any>;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  timestamp: string;
}

class AutomationService {
  private permissions: AutomationPermissions;
  private actionHistory: AutomationAction[] = [];

  async navigate(url: string): Promise<void>;
  async screenshot(): Promise<string>; // base64
  async click(selector: string): Promise<void>;
  async fill(selector: string, value: string): Promise<void>;

  getHistory(): AutomationAction[];
  clearHistory(): void;
}
```

### 5.3 Componentes React

```
src/components/automation/
├── AutomationDashboard.tsx    # Container principal
├── BrowserPreview.tsx         # Visualizacao do screenshot
├── ActionLog.tsx              # Historico de acoes
├── NavigationInput.tsx        # Input de URL
├── PermissionsPanel.tsx       # Configuracao de permissoes
└── ScreenshotGallery.tsx      # Galeria de capturas
```

---

## 6. Dependencias

| Dependencia | Tipo | Status |
|-------------|------|--------|
| MCP Playwright | Infraestrutura | Configurado |
| EPIC-001 CRM v2 | Prerequisito | Em planejamento |
| EPIC-002 Corporate HQ | Opcional | Em planejamento |

---

## 7. Riscos

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| MCP Playwright instavel | Media | Alto | Fallback, retry |
| Usuario usa para scraping abusivo | Baixa | Alto | Rate limiting, ToS |
| Complexidade maior que esperado | Alta | Medio | MVP minimo |
| Seguranca comprometida | Baixa | Alto | Permissoes rigorosas |

---

## 8. Metricas de Sucesso

| Metrica | Baseline | Target |
|---------|----------|--------|
| Screenshots capturados/semana | 0 | 20+ |
| Navegacoes executadas/semana | 0 | 10+ |
| Erros de automacao | N/A | < 5% |
| Usuarios usando feature | 0% | 30% |

---

## 9. Fases de Entrega

### Fase 4.1: Screenshot Basico (Sprint 8)
- Captura de screenshot
- Visualizacao na UI
- Historico basico

### Fase 4.2: Navegacao (Sprint 9)
- Input de URL
- Navegacao automatica
- Screenshot apos navegacao

### Fase 4.3: Permissoes e Log (Sprint 10)
- Sistema de permissoes
- Log completo de acoes
- Configuracoes de seguranca

---

## 10. User Stories

### US-301: Capturar Tela
**Como** usuario
**Quero** capturar um screenshot do meu browser via IA
**Para que** eu possa compartilhar ou analisar o conteudo

### US-302: Navegar para Site
**Como** usuario
**Quero** pedir para a IA navegar para um site
**Para que** ela possa coletar informacoes para mim

### US-303: Ver Historico
**Como** usuario
**Quero** ver o historico de acoes da IA
**Para que** eu saiba o que foi feito

### US-304: Controlar Permissoes
**Como** usuario
**Quero** controlar o que a IA pode fazer no meu browser
**Para que** eu me sinta seguro

---

## 11. Consideracoes de Seguranca

### 11.1 Restricoes Padrao

- **Sites Bancarios:** Bloqueados por padrao
- **Credenciais:** Nunca armazenadas ou logadas
- **Dados Sensiveis:** Screenshots nao salvos permanentemente
- **Rate Limiting:** Max 100 acoes por hora

### 11.2 Consentimento

- Usuario deve habilitar explicitamente
- Aviso claro sobre o que a IA pode fazer
- Opcao de desabilitar a qualquer momento

### 11.3 Auditoria

- Todas as acoes logadas com timestamp
- IP e sessao registrados
- Logs retidos por 30 dias

---

## 12. Integracao Futura com Corporate HQ

**Visao:** Na fase futura, quando usuario executar comandos no Claude Code, os agentes do Corporate HQ poderao:

1. Mostrar animacao de "trabalhando" no mapa
2. Exibir screenshots no Pipeline Feed
3. Atualizar status em tempo real
4. Permitir aprovacao de acoes via interface

**Dependencias:**
- WebSocket para comunicacao real-time
- API de eventos entre Claude Code e SPFP
- Sistema de filas para acoes pendentes

---

*PRD criado por Morgan (AIOS PM) - 2026-02-14*
