import React from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { FinnAvatar } from '../FinnAvatar';

interface QuickChip {
  text: string;
  icon: string;
}

interface FinnBlocked {
  reason: 'rate_limit' | 'no_plan';
  message: string;
}

interface FinnInputAreaProps {
  hasGeneratedInsight: boolean;
  userMessageCount: number;
  quickChips: QuickChip[];
  loading: boolean;
  inputValue: string;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  finnBlocked: FinnBlocked | null;
  onSend: (text?: string) => void;
  onInputChange: (value: string) => void;
}

/**
 * Bottom input bar for the Finn chat interface.
 * Contains quick prompt chips, textarea, send button and the blocked-plan overlay.
 * Extracted from Insights.tsx (TD-S3-003).
 */
export const FinnInputArea: React.FC<FinnInputAreaProps> = ({
  hasGeneratedInsight,
  userMessageCount,
  quickChips,
  loading,
  inputValue,
  inputRef,
  finnBlocked,
  onSend,
  onInputChange,
}) => {
  return (
    <div className="p-8 glass rounded-b-[2.5rem] shadow-2xl relative" data-testid="insights-input-area">
      {/* Quick prompt chips */}
      {hasGeneratedInsight && userMessageCount === 0 && (
        <div className="flex flex-wrap gap-2 mb-4 max-w-4xl mx-auto">
          {quickChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => onSend(chip.text)}
              disabled={loading}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all font-medium flex items-center gap-1.5 disabled:opacity-40"
            >
              <span>{chip.icon}</span>{chip.text}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-4 items-end max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={
              !hasGeneratedInsight
                ? 'Aguardando Finn preparar seu diagnóstico...'
                : 'Pergunte ao Finn sobre suas finanças...'
            }
            disabled={loading || !hasGeneratedInsight}
            className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] p-5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all resize-none min-h-[64px] max-h-[200px] scrollbar-hide text-sm"
            rows={1}
            data-testid="insights-chat-input"
          />
          <div className="absolute right-4 bottom-5 flex items-center gap-2">
            <MessageSquare size={18} className="text-gray-600" />
          </div>
        </div>
        <button
          onClick={() => onSend()}
          disabled={loading || !inputValue.trim() || !hasGeneratedInsight}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:bg-gray-800 text-white rounded-[1.5rem] flex items-center justify-center transition-all shadow-xl shadow-blue-500/20 active:scale-95 group"
          data-testid="insights-send-btn"
        >
          <Send size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>

      {/* Blocked overlay (no plan or rate limit) */}
      {finnBlocked && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-30 px-6 text-center rounded-b-[2.5rem]">
          <div className="p-6 glass rounded-2xl border border-[#1B85E3]/30 space-y-4 max-w-sm">
            <FinnAvatar mode="advisor" size="lg" className="mx-auto" />
            <p className="text-white font-bold text-lg">
              {finnBlocked.reason === 'no_plan'
                ? 'Finn é exclusivo para assinantes'
                : 'Limite do mês atingido'}
            </p>
            <p className="text-gray-400 text-sm">{finnBlocked.message}</p>
            <a
              href="/#pricing"
              className="block w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
              style={{ background: '#1B85E3' }}
            >
              {finnBlocked.reason === 'no_plan' ? 'Ver planos' : 'Fazer upgrade'}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
