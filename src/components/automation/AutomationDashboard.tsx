/**
 * Automation Dashboard
 * Main container for browser automation features
 */

import { useAutomationState } from './useAutomationState';
import { BrowserPreview } from './BrowserPreview';

export function AutomationDashboard() {
  const { latestScreenshot, loading, error, history, captureScreenshot, clearError } =
    useAutomationState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🤖</span>
            Automação de Browser
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Capture screenshots e automate tarefas no seu browser com IA
          </p>
        </div>

        {/* Alert Banner */}
        {error && (
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                  ⚠️ Aviso Importante
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  {error}
                </p>
              </div>
              <button
                onClick={clearError}
                className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium text-sm"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview - Takes 2 columns on desktop */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Visualização do Browser
              </h2>
              <BrowserPreview
                screenshotData={latestScreenshot}
                loading={loading}
                onCapture={captureScreenshot}
                error={error}
              />
            </div>
          </div>

          {/* Sidebar - Info & Stats */}
          <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Status
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Capturando
                  </span>
                  <span className="text-sm font-mono">
                    {loading ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Ativo
                      </span>
                    ) : (
                      <span className="text-slate-500">Parado</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Screenshots
                  </span>
                  <span className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {history.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Sucesso
                  </span>
                  <span className="text-sm font-mono font-semibold text-green-600 dark:text-green-400">
                    {history.filter((a) => a.status === 'success').length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Erros
                  </span>
                  <span className="text-sm font-mono font-semibold text-red-600 dark:text-red-400">
                    {history.filter((a) => a.status === 'error').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg shadow-sm p-4 space-y-2">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                💡 Dica
              </h3>
              <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                Cada screenshot é automaticamente salvo no histórico de ações. Você pode visualizar todos os
                detalhes da execução mais tarde.
              </p>
            </div>

            {/* Feature List */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Funcionalidades
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5">✓</span>
                  <span>Screenshots em base64</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">◯</span>
                  <span>Navegação para URLs (em breve)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">◯</span>
                  <span>Cliques automatizados (em breve)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">◯</span>
                  <span>Preenchimento de formulários (em breve)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Actions */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Ações Recentes
            </h2>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.slice(0, 5).map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm">📸</span>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {action.type === 'screenshot' ? 'Screenshot' : action.type}
                      </div>
                      <div className="text-slate-500">
                        {new Date(action.timestamp).toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-xs ${
                      action.status === 'success'
                        ? 'text-green-600 dark:text-green-400'
                        : action.status === 'error'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-500'
                    }`}
                  >
                    {action.status === 'success'
                      ? '✓'
                      : action.status === 'error'
                        ? '✗'
                        : '⏳'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coming Soon - Other Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center opacity-50">
            <div className="text-2xl mb-2">🔗</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Navegação</h3>
            <p className="text-xs text-slate-500">Em desenvolvimento (STY-094)</p>
          </div>
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 text-center opacity-50">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Log Completo</h3>
            <p className="text-xs text-slate-500">Em desenvolvimento (STY-095)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
