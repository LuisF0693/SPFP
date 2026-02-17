# STY-094: Navegação Básica via MCP Playwright

**Epic:** EPIC-003 - AI Automation
**PRD:** EPIC-003-AI-Automation.md
**Priority:** P2 BAIXA
**Effort:** 4h
**Status:** PENDING

---

## Descrição

Implementar funcionalidade para navegar para URLs específicas via MCP Playwright. Sistema deve validar URL, aguardar carregamento da página e capturar screenshot automaticamente após navegação.

## User Story

**Como** usuário do SPFP,
**Quero** pedir para a IA navegar para um site específico,
**Para que** ela possa coletar informações para mim automaticamente.

---

## Acceptance Criteria

- [ ] **AC-094.1:** Campo de input para URL disponível na interface
- [ ] **AC-094.2:** Botão "Navegar" presente e funcional
- [ ] **AC-094.3:** Validação de URL válida (não aceitar URLs inválidas)
- [ ] **AC-094.4:** Feedback visual de navegação em progresso
- [ ] **AC-094.5:** Screenshot capturado automaticamente após navegação bem-sucedida
- [ ] **AC-094.6:** Timeout de 30 segundos para carregamento da página
- [ ] **AC-094.7:** Erro tratado se página não carregar
- [ ] **AC-094.8:** URL armazenada no histórico de ações

---

## Technical Implementation

### Componente NavigationInput

```tsx
// src/components/automation/NavigationInput.tsx

interface NavigationInputProps {
  loading?: boolean;
  onNavigate: (url: string) => Promise<void>;
  error?: string;
}

export function NavigationInput({
  loading = false,
  onNavigate,
  error,
}: NavigationInputProps) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateURL = (urlString: string): boolean => {
    try {
      const parsed = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
      return !!parsed.hostname;
    } catch {
      return false;
    }
  };

  const handleNavigate = async () => {
    setValidationError('');

    if (!url.trim()) {
      setValidationError('Por favor, digite uma URL');
      return;
    }

    if (!validateURL(url)) {
      setValidationError('URL inválida');
      return;
    }

    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      await onNavigate(fullUrl);
    } catch (err: any) {
      setValidationError(err.message);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
          placeholder="https://example.com"
          disabled={loading}
          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        />
        <button
          onClick={handleNavigate}
          disabled={loading || !url.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Navegando...' : 'Navegar'}
        </button>
      </div>

      {validationError && (
        <p className="text-sm text-red-600">{validationError}</p>
      )}

      {error && (
        <p className="text-sm text-red-600">Erro: {error}</p>
      )}
    </div>
  );
}
```

### Extensão do AutomationService

```typescript
// src/services/automationService.ts (extensão)

interface NavigationResult {
  id: string;
  url: string;
  success: boolean;
  timestamp: string;
  screenshotId?: string;
  error?: string;
  loadTime?: number;
}

class AutomationService {
  private readonly NAVIGATION_TIMEOUT = 30000; // 30 segundos

  /**
   * Navega para URL e captura screenshot após carregamento
   * @param url URL para navegar
   * @returns Promise<NavigationResult>
   */
  async navigate(url: string): Promise<NavigationResult> {
    const action: AutomationAction = {
      id: crypto.randomUUID(),
      type: 'navigate',
      status: 'running',
      timestamp: new Date().toISOString(),
    };

    this.actionHistory.unshift(action);

    const startTime = Date.now();

    try {
      // Validar URL
      new URL(url);

      // Chamar MCP Playwright para navegar
      await this.callMCPPlaywright('mcp__playwright__browser_navigate', {
        url,
        timeout: this.NAVIGATION_TIMEOUT,
      });

      const loadTime = Date.now() - startTime;

      // Capturar screenshot automaticamente
      let screenshotId: string | undefined;
      try {
        const screenshot = await this.captureScreenshot();
        screenshotId = screenshot.id;
      } catch (err) {
        console.warn('Screenshot após navegação falhou:', err);
      }

      const result: NavigationResult = {
        id: action.id,
        url,
        success: true,
        timestamp: action.timestamp,
        screenshotId,
        loadTime,
      };

      action.status = 'success';
      action.result = result;

      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Falha ao navegar';

      action.status = 'error';
      action.error = errorMsg;

      const result: NavigationResult = {
        id: action.id,
        url,
        success: false,
        timestamp: action.timestamp,
        error: errorMsg,
      };

      throw result;
    }
  }
}
```

---

## Tasks

- [ ] 1. Criar componente `NavigationInput.tsx` com validação de URL
- [ ] 2. Estender `automationService.ts` com método `navigate()`
- [ ] 3. Implementar tratamento de timeout (30s)
- [ ] 4. Integrar captura automática de screenshot pós-navegação
- [ ] 5. Adicionar `NavigationInput` em `AutomationDashboard.tsx`
- [ ] 6. Implementar feedback visual de carregamento
- [ ] 7. Adicionar validação de URL no cliente
- [ ] 8. Testar com URLs válidas e inválidas

---

## Dependencies

- **Bloqueia:** STY-095 (Log precisa registrar navegações)
- **Bloqueado por:** STY-093 (Precisa do serviço de screenshot)

---

## Test Cases

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | URL válida | Digitar URL, clicar Navegar | Página carrega, screenshot capturado |
| 2 | URL sem protocolo | Digitar "google.com" | Sistema adiciona https:// |
| 3 | URL inválida | Digitar "xxxxxxx" | Erro de validação mostrado |
| 4 | Timeout | URL que leva > 30s | Timeout tratado, erro ao usuário |
| 5 | Histórico | Navegar 2x | Ambas as navegações no histórico |
| 6 | Screenshot automático | Navegar com sucesso | Screenshot vinculado à navegação |

---

## Definition of Done

- [ ] Componente NavigationInput criado e validando URLs
- [ ] Método navigate() implementado no automationService
- [ ] Timeout implementado (30s)
- [ ] Screenshot capturado automaticamente após navegação
- [ ] Feedback visual durante carregamento
- [ ] Erros tratados gracefully
- [ ] Histórico de ações atualizado
- [ ] TypeScript sem erros
- [ ] Testes unitários implementados
- [ ] PR aprovado

---

## File List

```
Created:
- src/components/automation/NavigationInput.tsx

Modified:
- src/services/automationService.ts (adicionar método navigate)
- src/components/automation/AutomationDashboard.tsx (integrar NavigationInput)
```

---

**Created by:** @sm (Max)
**Assigned to:** @dev
**Sprint:** EPIC-003 Sprint 2 (Fase 4.2)
