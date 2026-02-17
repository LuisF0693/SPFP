/**
 * Browser Preview Component
 * Displays captured screenshots with controls
 */

import { ScreenshotResult } from '@/services/automationService';

interface BrowserPreviewProps {
  screenshotData?: ScreenshotResult;
  loading?: boolean;
  onCapture: () => Promise<void>;
  error?: string;
}

export function BrowserPreview({
  screenshotData,
  loading = false,
  onCapture,
  error,
}: BrowserPreviewProps) {
  const handleCapture = async () => {
    try {
      await onCapture();
    } catch (err) {
      console.error('Erro ao capturar screenshot:', err);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      {/* Preview Area */}
      <div className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="aspect-video bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="text-sm text-slate-500">Capturando tela...</p>
            </div>
          ) : screenshotData ? (
            <img
              src={`data:image/png;base64,${screenshotData.data}`}
              alt="Browser screenshot"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="text-center text-slate-400">
              <div className="text-4xl mb-2">📸</div>
              <p>Nenhum screenshot capturado</p>
              <p className="text-xs mt-1">Clique em "Capturar Tela" para começar</p>
            </div>
          )}
        </div>
      </div>

      {/* Info & Controls */}
      <div className="p-4 space-y-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-700">
        {/* Timestamp */}
        {screenshotData && (
          <div className="text-xs text-slate-500">
            <span className="font-medium">Capturado em:</span> {formatTime(screenshotData.timestamp)}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
            <p className="text-sm text-red-800 dark:text-red-200">
              <span className="font-medium">⚠️ Erro:</span> {error}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleCapture}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                Capturando...
              </>
            ) : (
              <>
                <span>📸</span>
                Capturar Tela
              </>
            )}
          </button>

          {screenshotData && (
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = `data:image/png;base64,${screenshotData.data}`;
                link.download = `screenshot-${new Date().toISOString().split('T')[0]}.png`;
                link.click();
              }}
              disabled={loading}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              title="Baixar screenshot como PNG"
            >
              <span>⬇️</span>
              Download
            </button>
          )}
        </div>

        {/* Resolution Info */}
        {screenshotData && (
          <div className="text-xs text-slate-500">
            <span className="font-medium">Resolução:</span> {screenshotData.width}x{screenshotData.height}px
          </div>
        )}
      </div>
    </div>
  );
}
