import React, { useState } from 'react';
import { Shield, Edit2, Check, X } from 'lucide-react';
import { formatCurrency } from '../../utils';

interface EmergencyFundCardProps {
  idealAmount: number;
  currentAmount?: number;
  monthsOfExpenses?: number;
  onEditMonths?: (months: number) => void;
}

export const EmergencyFundCard: React.FC<EmergencyFundCardProps> = ({
  idealAmount,
  currentAmount = 0,
  monthsOfExpenses = 6,
  onEditMonths
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(monthsOfExpenses.toString());

  const progress = idealAmount > 0 ? Math.min((currentAmount / idealAmount) * 100, 100) : 0;
  const remaining = Math.max(idealAmount - currentAmount, 0);

  const handleSave = () => {
    const months = parseInt(editValue) || 6;
    if (onEditMonths) onEditMonths(months);
    setIsEditing(false);
  };

  return (
    <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
          <Shield size={20} className="text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">
              De acordo com seu estilo de vida atual, a reserva de emergência ideal para sua segurança é de:
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-blue-400">
              {formatCurrency(idealAmount)}
            </span>

            {/* Edit months */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-12 px-2 py-1 text-sm bg-slate-800 border border-slate-600 rounded text-white text-center"
                    min="1"
                    max="24"
                    autoFocus
                  />
                  <span className="text-xs text-slate-400">meses</span>
                  <button
                    onClick={handleSave}
                    className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1 text-slate-400 hover:bg-slate-700/50 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <span>{monthsOfExpenses} meses</span>
                  {onEditMonths && <Edit2 size={12} />}
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {currentAmount > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progresso</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">
                  Atual: <span className="text-blue-400">{formatCurrency(currentAmount)}</span>
                </span>
                <span className="text-slate-500">
                  Faltam: <span className="text-slate-300">{formatCurrency(remaining)}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
