# STY-093: Capturar Screenshot via MCP Playwright

**Epic:** EPIC-003 - AI Automation
**PRD:** EPIC-003-AI-Automation.md
**Priority:** P2 BAIXA
**Effort:** 6h
**Status:** PENDING

---

## Descrição

Implementar funcionalidade para capturar screenshots do browser do usuário via MCP Playwright. O screenshot deve ser capturado em base64, exibido na UI em menos de 2 segundos e armazenado no histórico da sessão.

## User Story

**Como** usuário do SPFP,
**Quero** capturar um screenshot do meu browser via IA,
**Para que** eu possa compartilhar ou analisar o conteúdo da tela.

---

## Acceptance Criteria

- [ ] **AC-093.1:** Botão "Capturar Tela" disponível na interface AutomationDashboard
- [ ] **AC-093.2:** Screenshot capturado via MCP Playwright (mcp__playwright__browser_screenshot)
- [ ] **AC-093.3:** Imagem exibida na UI em < 2 segundos
- [ ] **AC-093.4:** Resolução mínima de 1280x720 pixels
- [ ] **AC-093.5:** Feedback visual de loading durante captura
- [ ] **AC-093.6:** Erro tratado gracefully se browser não disponível
- [ ] **AC-093.7:** Screenshot armazenado em base64 no estado da aplicação
- [ ] **AC-093.8:** Timestamp registrado com cada captura

---

## Technical Implementation

### Estrutura de Arquivos

```
src/services/
├── automationService.ts        # Serviço principal de automação

src/components/automation/
├── AutomationDashboard.tsx     # Container principal
├── BrowserPreview.tsx          # Visualização do screenshot
└── useAutomationState.ts       # Hook de estado da automação
```

### Serviço de Automação

```typescript
// src/services/automationService.ts

export interface ScreenshotResult {
  id: string;
  data: string;                 // base64
  timestamp: string;
  width: number;
  height: number;
  error?: string;
}

export interface AutomationAction {
  id: string;
  type: 'screenshot' | 'navigate' | 'click' | 'fill';
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  timestamp: string;
}

class AutomationService {
  private actionHistory: AutomationAction[] = [];

  /**
   * Captura screenshot do browser atual
   * @returns Promise<ScreenshotResult>
   */
  async captureScreenshot(): Promise<ScreenshotResult> {
    const action: AutomationAction = {
      id: crypto.randomUUID(),
      type: 'screenshot',
      status: 'running',
      timestamp: new Date().toISOString(),
    };

    this.actionHistory.unshift(action);

    try {
      // Usar MCP Playwright
      const base64Image = await this.callMCPPlaywright('mcp__playwright__browser_screenshot');

      const result: ScreenshotResult = {
        id: action.id,
        data: base64Image,
        timestamp: action.timestamp,
        width: 1280,
        height: 720,
      };

      action.status = 'success';
      action.result = result;

      return result;
    } catch (error: any) {
      action.status = 'error';
      action.error = error.message;

      throw new Error(`Falha ao capturar screenshot: ${error.message}`);
    }
  }

  getActionHistory(): AutomationAction[] {
    return this.actionHistory;
  }

  private async callMCPPlaywright(tool: string): Promise<any> {
    // Será implementado com integração MCP real
    throw new Error('MCP Playwright não configurado ainda');
  }
}

export const automationService = new AutomationService();
```

### Componente BrowserPreview

```tsx
// src/components/automation/BrowserPreview.tsx

interface BrowserPreviewProps {
  screenshotData?: string;
  loading?: boolean;
  timestamp?: string;
  onCapture: () => Promise<void>;
}

export function BrowserPreview({
  screenshotData,
  loading = false,
  timestamp,
  onCapture,
}: BrowserPreviewProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded flex items-center justify-center overflow-hidden">
        {loading ? (
          <div className="animate-pulse text-slate-500">
            Capturando tela...
          </div>
        ) : screenshotData ? (
          <img
            src={`data:image/png;base64,${screenshotData}`}
            alt="Browser screenshot"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-slate-400">
            Nenhum screenshot capturado
          </div>
        )}
      </div>

      {timestamp && (
        <p className="text-sm text-slate-500 mt-2">
          Capturado em: {new Date(timestamp).toLocaleString('pt-BR')}
        </p>
      )}

      <button
        onClick={onCapture}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Capturando...' : 'Capturar Tela'}
      </button>
    </div>
  );
}
```

---

## Tasks

- [ ] 1. Criar arquivo `src/services/automationService.ts` com interface base
- [ ] 2. Implementar método `captureScreenshot()` com tratamento de erro
- [ ] 3. Criar hook `useAutomationState.ts` para gerenciar estado
- [ ] 4. Criar componente `BrowserPreview.tsx`
- [ ] 5. Integrar botão "Capturar Tela" em `AutomationDashboard.tsx`
- [ ] 6. Adicionar feedback visual de loading
- [ ] 7. Implementar localStorage para histórico
- [ ] 8. Testar captura com MCP Playwright (real ou mock)

---

## Dependencies

- **Bloqueia:** STY-094 (Navegação usa screenshots), STY-095 (Log precisa de histórico)
- **Bloqueado por:** Nenhum (pode começar independente)

---

## Test Cases

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Captura bem-sucedida | Clicar "Capturar Tela" | Screenshot exibido em < 2s |
| 2 | MCP indisponível | MCP retorna erro | Erro tratado, mensagem ao usuário |
| 3 | Timeout | Captura leva > 30s | Timeout tratado gracefully |
| 4 | Histórico | Capturar 3x | Todas as 3 aparecem no histórico |
| 5 | Base64 válido | Salvar screenshot | Imagem carrega corretamente |

---

## Definition of Done

- [ ] Serviço automationService criado e testado
- [ ] Componente BrowserPreview renderiza corretamente
- [ ] Botão "Capturar Tela" funciona (mock ou real)
- [ ] Feedback de loading implementado
- [ ] Erros tratados com mensagens ao usuário
- [ ] Screenshots armazenados em histórico (localStorage)
- [ ] TypeScript sem erros
- [ ] Testes unitários cobrem casos principais
- [ ] PR aprovado

---

## File List

```
Created:
- src/services/automationService.ts
- src/components/automation/BrowserPreview.tsx
- src/components/automation/useAutomationState.ts

Modified:
- src/components/automation/AutomationDashboard.tsx (integração de BrowserPreview)
```

---

**Created by:** @sm (Max)
**Assigned to:** @dev
**Sprint:** EPIC-003 Sprint 1 (Foundation - Fase 4.1)
