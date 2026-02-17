/**
 * Hook de Estado para Automação
 * Gerencia screenshots, loading, erros e histórico
 */

import { useState, useCallback } from 'react';
import { automationService, ScreenshotResult, AutomationAction, NavigationResult } from '@/services/automationService';

export interface AutomationState {
  latestScreenshot?: ScreenshotResult;
  loading: boolean;
  error?: string;
  history: AutomationAction[];
  navigationInProgress: boolean;
}

export interface UseAutomationReturn extends AutomationState {
  captureScreenshot: () => Promise<void>;
  navigate: (url: string) => Promise<void>;
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
  const [navigationInProgress, setNavigationInProgress] = useState(false);

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
   * Navega para URL e captura screenshot automaticamente
   */
  const navigate = useCallback(async (url: string) => {
    setNavigationInProgress(true);
    setError(undefined);

    try {
      const result = await automationService.navigate(url);

      // Atualizar histórico e screenshot
      setHistory(automationService.getActionHistory());

      // Se capturou screenshot, carregar
      if (result.screenshotId) {
        const allActions = automationService.getActionHistory();
        const screenshotAction = allActions.find(
          (a) => a.id === result.screenshotId && a.type === 'screenshot'
        );
        if (screenshotAction && screenshotAction.result) {
          setLatestScreenshot(screenshotAction.result);
        }
      }
    } catch (err: any) {
      const errorMsg = err.error || err.message || 'Erro ao navegar para a URL';
      setError(errorMsg);
      console.error('Erro ao navegar:', err);
    } finally {
      setNavigationInProgress(false);
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
    navigationInProgress,
    captureScreenshot,
    navigate,
    clearError,
    clearHistory,
    getHistory,
  };
}
