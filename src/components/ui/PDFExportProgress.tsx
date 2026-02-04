import React from 'react';
import { FileDown, CheckCircle, AlertCircle } from 'lucide-react';

export interface PDFExportProgressProps {
  isOpen: boolean;
  progress: number; // 0-100
  status: string;
  error?: string | null;
}

/**
 * Modal component to show PDF export progress with status messages
 * and automatic dismissal on completion.
 */
export const PDFExportProgress: React.FC<PDFExportProgressProps> = ({
  isOpen,
  progress,
  status,
  error
}) => {
  if (!isOpen) {
    return null;
  }

  const isComplete = progress === 100;
  const hasError = !!error;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-up">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {hasError ? (
            <AlertCircle className="text-red-500" size={48} />
          ) : isComplete ? (
            <CheckCircle className="text-emerald-500 animate-bounce" size={48} />
          ) : (
            <FileDown className="text-blue-500 animate-pulse" size={48} />
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
          {hasError ? 'Erro na Exportação' : isComplete ? 'PDF Gerado!' : 'Gerando PDF...'}
        </h2>

        {/* Status Message */}
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
          {error || status || 'Processando...'}
        </p>

        {/* Progress Bar */}
        {!hasError && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              {progress}%
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mt-6">
          {isComplete && (
            <button
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors"
              onClick={() => window.location.reload()}
            >
              Fechar
            </button>
          )}
          {hasError && (
            <button
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
