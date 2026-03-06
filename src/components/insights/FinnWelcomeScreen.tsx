import React from 'react';
import { Sparkles, Loader2, Key } from 'lucide-react';
import { FinnAvatar } from '../FinnAvatar';

interface FinnWelcomeScreenProps {
  loading: boolean;
  hasToken: boolean;
  onStartDiagnosis: () => void;
}

/**
 * Initial "Gerar Diagnóstico" overlay shown before the first Finn interaction.
 * Extracted from Insights.tsx (TD-S3-003).
 */
export const FinnWelcomeScreen: React.FC<FinnWelcomeScreenProps> = ({
  loading,
  hasToken,
  onStartDiagnosis,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-md space-y-8 animate-fade-in">
        <FinnAvatar mode="advisor" size="xl" />

        <div className="space-y-4">
          <h2 className="text-3xl font-sans font-bold text-white leading-tight">
            Oi. Eu sou o Finn.
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Vou analisar seus dados, identificar padrões e te falar exatamente o que está
            acontecendo com seu dinheiro — sem enrolação.
          </p>
        </div>

        <button
          onClick={onStartDiagnosis}
          disabled={loading}
          data-testid="finn-start-diagnosis-btn"
          className="group relative w-full py-5 px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-800 text-white rounded-[1.5rem] font-bold shadow-2xl shadow-blue-500/20 transition-all active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <span className="flex items-center justify-center gap-3">
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Sparkles size={20} />
                Gerar Diagnóstico Financeiro
              </>
            )}
          </span>
        </button>

        {!hasToken && (
          <p className="text-amber-500/80 text-xs font-medium flex items-center justify-center gap-2">
            <Key size={14} /> Requer Chave de API habilitada
          </p>
        )}
      </div>
    </div>
  );
};
