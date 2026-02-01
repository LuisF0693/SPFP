import React from 'react';
import { TransactionType } from '../../types';

interface TransactionMetadataProps {
  spender: string;
  onSpenderChange: (spender: string) => void;
  sentiment?: string;
  onSentimentChange: (sentiment: string | undefined) => void;
  type: TransactionType;
  userProfile: {
    avatar?: string;
    hasSpouse: boolean;
    spouseName: string;
    spouseAvatar?: string;
    children: Array<{ id: string; name: string; avatar?: string }>;
  };
}

export const TransactionMetadata: React.FC<TransactionMetadataProps> = ({
  spender,
  onSpenderChange,
  sentiment,
  onSentimentChange,
  type,
  userProfile,
}) => {
  const sentimentOptions = [
    { emoji: '😊', label: 'Feliz', value: 'happy' },
    { emoji: '😐', label: 'Neutro', value: 'neutral' },
    { emoji: '😫', label: 'Estressado', value: 'stressed' },
    { emoji: '💸', label: 'Impulsivo', value: 'impulsive' },
    { emoji: '🍕', label: 'Conforto', value: 'comfort' },
  ];

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Quem gastou?</label>
        <div className="flex flex-wrap gap-3">
          {/* ME */}
          <button
            type="button"
            onClick={() => onSpenderChange('ME')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all ${
              spender === 'ME'
                ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
                : 'border-transparent bg-slate-800/50 text-slate-400'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 overflow-hidden">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} className="w-full h-full object-cover" alt="Me" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-400">EU</div>
              )}
            </div>
            <span className="text-xs font-bold">Eu</span>
          </button>

          {/* SPOUSE */}
          {userProfile.hasSpouse && (
            <button
              type="button"
              onClick={() => onSpenderChange('SPOUSE')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all ${
                spender === 'SPOUSE'
                  ? 'border-pink-500/50 bg-pink-500/10 text-pink-400'
                  : 'border-transparent bg-slate-800/50 text-slate-400'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-pink-500/20 overflow-hidden">
                {userProfile.spouseAvatar ? (
                  <img src={userProfile.spouseAvatar} className="w-full h-full object-cover" alt="Spouse" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-pink-400">C</div>
                )}
              </div>
              <span className="text-xs font-bold">{userProfile.spouseName || 'Cônjuge'}</span>
            </button>
          )}

          {/* CHILDREN */}
          {(userProfile.children || []).map((child: any) => (
            <button
              key={child.id}
              type="button"
              onClick={() => onSpenderChange(child.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all ${
                spender === child.id
                  ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                  : 'border-transparent bg-slate-800/50 text-slate-400'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-blue-500/20 overflow-hidden">
                {child.avatar ? (
                  <img src={child.avatar} className="w-full h-full object-cover" alt={child.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-400">
                    {child.name[0]}
                  </div>
                )}
              </div>
              <span className="text-xs font-bold">{child.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sentiment Selector */}
      {type === 'EXPENSE' && (
        <div className="animate-fade-in">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Como você se sente com essa compra?
          </label>
          <div className="flex bg-slate-800/50 p-2 rounded-2xl border border-slate-700/50 justify-between">
            {sentimentOptions.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => onSentimentChange(sentiment === s.value ? undefined : s.value)}
                aria-label={s.label}
                aria-pressed={sentiment === s.value}
                className={`flex flex-col items-center p-3 rounded-xl transition-all flex-1 min-h-[44px] min-w-[44px] justify-center ${
                  sentiment === s.value
                    ? 'bg-slate-700/50 shadow-lg border border-blue-500/30 scale-105'
                    : 'hover:bg-slate-700/30 opacity-50 hover:opacity-100'
                }`}
              >
                <span className="text-2xl mb-1" aria-hidden="true">
                  {s.emoji}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
