/**
 * Navigation Input Component
 * Allows users to navigate to URLs with validation and error handling
 */

import { useState } from 'react';

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

  /**
   * Valida se uma string é uma URL válida
   */
  const validateURL = (urlString: string): boolean => {
    try {
      // Adicionar protocolo se não houver
      const withProtocol = urlString.startsWith('http') ? urlString : `https://${urlString}`;
      const parsed = new URL(withProtocol);
      return !!parsed.hostname;
    } catch {
      return false;
    }
  };

  /**
   * Trata clique no botão Navegar
   */
  const handleNavigate = async () => {
    setValidationError('');

    if (!url.trim()) {
      setValidationError('Por favor, digite uma URL');
      return;
    }

    if (!validateURL(url)) {
      setValidationError('URL inválida. Exemplo: example.com ou https://example.com');
      return;
    }

    try {
      // Adicionar protocolo se necessário
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      await onNavigate(fullUrl);
      setUrl(''); // Limpar input após sucesso
    } catch (err: any) {
      // Erro é tratado pelo componente pai
      setValidationError(err.error || err.message || 'Erro ao navegar');
    }
  };

  /**
   * Trata Enter no input
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && url.trim()) {
      handleNavigate();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input Field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setValidationError(''); // Limpar erro ao editar
          }}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com ou example.com"
          disabled={loading}
          className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          autoComplete="off"
        />
        <button
          onClick={handleNavigate}
          disabled={loading || !url.trim()}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-w-max"
        >
          {loading ? (
            <>
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              Navegando...
            </>
          ) : (
            <>
              <span>🔗</span>
              Navegar
            </>
          )}
        </button>
      </div>

      {/* Error Messages */}
      {validationError && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
          <p className="text-sm text-red-800 dark:text-red-200">
            <span className="font-medium">⚠️ Erro de validação:</span> {validationError}
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
          <p className="text-sm text-red-800 dark:text-red-200">
            <span className="font-medium">✗ Falha na navegação:</span> {error}
          </p>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-slate-500 dark:text-slate-400">
        <p>💡 Dica: Digite uma URL e pressione Enter ou clique em Navegar</p>
      </div>
    </div>
  );
}
