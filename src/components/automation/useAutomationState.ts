/**
 * Hook de Estado para Automação
 * Gerencia screenshots, loading, erros e histórico
 */

import { useState, useCallback } from 'react';
import { automationService, ScreenshotResult, AutomationAction } from '@/services/automationService';

export interface AutomationState {
  latestScreenshot?: ScreenshotResult;
  loading: boolean;
  error?: string;
  history: AutomationAction[];
}

export interface UseAutomationReturn extends AutomationState {
  captureScreenshot: () => Promise<void>;
  clearError: () => void;
  clearHistory: () => void;
  getHistory: () => AutomationAction[];
}

/**
 * Hook para gerenciar estado de automação
 */
export function useAutomationState(): UseAutomationReturn {
  const [latestScreenshot, setLatestScreenshot] = useState<ScreenshotResult>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [history, setHistory] = useState<AutomationAction[]>([]);

  /**
   * Captura screenshot
   */
  const captureScreenshot = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await automationService.captureScreenshot();
      setLatestScreenshot(result);
      setHistory(automationService.getActionHistory());
    } catch (err: any) {
      const errorMsg =
        err.message ||
        'Erro desconhecido ao capturar screenshot. Verifique se o MCP Playwright está configurado.';
      setError(errorMsg);
      console.error('Erro ao capturar screenshot:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpa mensagem de erro
   */
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  /**
   * Limpa histórico
   */
  const clearHistory = useCallback(() => {
    automationService.clearHistory();
    setHistory([]);
    setLatestScreenshot(undefined);
  }, []);

  /**
   * Retorna histórico atualizado
   */
  const getHistory = useCallback(() => {
    return automationService.getActionHistory();
  }, []);

  return {
    latestScreenshot,
    loading,
    error,
    history,
    captureScreenshot,
    clearError,
    clearHistory,
    getHistory,
  };
}
