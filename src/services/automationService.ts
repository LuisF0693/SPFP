/**
 * Automation Service
 * Handles browser automation via MCP Playwright
 * Features: screenshots, navigation, action logging
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ScreenshotResult {
  id: string;
  data: string; // base64
  timestamp: string;
  width: number;
  height: number;
  error?: string;
}

export interface AutomationAction {
  id: string;
  type: 'screenshot' | 'navigate' | 'click' | 'fill' | 'select';
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  timestamp: string;
  duration?: number;
  params?: Record<string, any>;
  details?: string;
}

// ============================================================================
// Service Implementation
// ============================================================================

class AutomationService {
  private actionHistory: AutomationAction[] = [];
  private readonly STORAGE_KEY = 'spfp_automation_history';
  private readonly MAX_HISTORY = 100;
  private readonly MCP_TIMEOUT = 30000; // 30 segundos

  constructor() {
    this.loadHistoryFromStorage();
  }

  /**
   * Captura screenshot do browser atual
   * @returns Promise<ScreenshotResult>
   */
  async captureScreenshot(): Promise<ScreenshotResult> {
    const actionId = crypto.randomUUID();
    const startTime = Date.now();

    const action: AutomationAction = {
      id: actionId,
      type: 'screenshot',
      status: 'running',
      timestamp: new Date().toISOString(),
    };

    this.recordAction(action);

    try {
      // Usar MCP Playwright para capturar screenshot
      const base64Image = await this.callMCPPlaywright(
        'mcp__playwright__browser_screenshot'
      );

      const duration = Date.now() - startTime;

      const result: ScreenshotResult = {
        id: actionId,
        data: base64Image,
        timestamp: action.timestamp,
        width: 1280,
        height: 720,
      };

      action.status = 'success';
      action.result = result;
      action.duration = duration;
      action.details = 'Screenshot capturado com sucesso';

      this.updateAction(action);

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMsg = error.message || 'Falha ao capturar screenshot';

      action.status = 'error';
      action.error = errorMsg;
      action.duration = duration;

      this.updateAction(action);

      throw new Error(`Falha ao capturar screenshot: ${errorMsg}`);
    }
  }

  /**
   * Retorna o histórico de ações
   */
  getActionHistory(): AutomationAction[] {
    return [...this.actionHistory];
  }

  /**
   * Limpa o histórico de ações
   */
  clearHistory(): void {
    this.actionHistory = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Registra uma ação no histórico
   */
  private recordAction(action: AutomationAction): void {
    this.actionHistory.unshift(action);
    if (this.actionHistory.length > this.MAX_HISTORY) {
      this.actionHistory = this.actionHistory.slice(0, this.MAX_HISTORY);
    }
    this.saveHistoryToStorage();
  }

  /**
   * Atualiza uma ação existente no histórico
   */
  private updateAction(action: AutomationAction): void {
    const index = this.actionHistory.findIndex((a) => a.id === action.id);
    if (index !== -1) {
      this.actionHistory[index] = action;
      this.saveHistoryToStorage();
    }
  }

  /**
   * Chama ferramenta MCP Playwright
   * Em produção, integra com o sistema MCP real
   */
  private async callMCPPlaywright(tool: string, params?: any): Promise<any> {
    // TODO: Integrar com MCP real quando disponível
    // Por enquanto, throw erro indicando que é necessário configurar MCP

    // Mock para desenvolvimento:
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[MCP Mock] Chamando ${tool}`, params);

      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock: retornar imagem base64 vazia (1x1 pixel transparente)
      return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==';
    }

    throw new Error('MCP Playwright não configurado. Contacte DevOps (@devops).');
  }

  /**
   * Salva histórico no localStorage
   */
  private saveHistoryToStorage(): void {
    try {
      const toStore = this.actionHistory.slice(0, this.MAX_HISTORY);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toStore));
    } catch (err) {
      console.warn('Erro ao salvar histórico de automação:', err);
    }
  }

  /**
   * Carrega histórico do localStorage
   */
  private loadHistoryFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.actionHistory = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Erro ao carregar histórico de automação:', err);
      this.actionHistory = [];
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const automationService = new AutomationService();

export default automationService;
