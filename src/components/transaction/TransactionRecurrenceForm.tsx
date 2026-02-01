import React from 'react';
import { Repeat, CalendarRange, CreditCard } from 'lucide-react';
import { formatCurrency, getMonthName } from '../../utils';

export type RecurrenceType = 'NONE' | 'INSTALLMENT' | 'REPEATED';

interface TransactionRecurrenceFormProps {
  recurrence: RecurrenceType;
  onRecurrenceChange: (type: RecurrenceType) => void;
  installments: number;
  onInstallmentsChange: (count: number) => void;
  value: number;
  date: string;
  accountType?: string;
  closingDay?: number;
  invoiceOffset: number;
  onInvoiceOffsetChange: (offset: number) => void;
  isCreditCardExpense: boolean;
}

export const TransactionRecurrenceForm: React.FC<TransactionRecurrenceFormProps> = ({
  recurrence,
  onRecurrenceChange,
  installments,
  onInstallmentsChange,
  value,
  date,
  accountType,
  closingDay,
  invoiceOffset,
  onInvoiceOffsetChange,
  isCreditCardExpense,
}) => {
  const getTargetDate = (baseDateStr: string, offset: number) => {
    const d = new Date(baseDateStr + 'T12:00:00');
    d.setMonth(d.getMonth() + offset);
    return d;
  };

  const targetInvoiceDate = getTargetDate(date, invoiceOffset);
  const targetMonthName = getMonthName(targetInvoiceDate.getMonth());
  const targetYear = targetInvoiceDate.getFullYear();

  const numericValue = value ? parseFloat(value.toString()) : 0;

  return (
    <>
      {/* Credit Card Invoice Section */}
      {isCreditCardExpense && (
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3 animate-fade-in">
          <div className="flex items-center space-x-2 text-slate-200 font-medium">
            <CalendarRange size={18} className="text-blue-400" />
            <span className="text-sm">Fatura em</span>
          </div>

          <div className="flex space-x-2">
            {[
              { label: 'Mês da compra', value: 0 },
              { label: 'Mês seguinte', value: 1 },
              { label: '2 meses', value: 2 },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onInvoiceOffsetChange(opt.value)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors border ${
                  invoiceOffset === opt.value
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 flex items-center bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
            <CreditCard size={12} className="mr-1.5" />
            <span>
              Cobrando na fatura de <strong className="text-slate-200">{targetMonthName}/{targetYear}</strong>
              {closingDay && (
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  Fechamento do cartão dia {closingDay}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Recurrence Section */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          recurrence !== 'NONE' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-slate-800/50 border-slate-700'
        }`}
      >
        <div className="flex items-center space-x-2 text-slate-200 font-medium mb-3">
          <Repeat
            size={18}
            className={recurrence !== 'NONE' ? 'text-blue-400' : 'text-slate-500'}
          />
          <span className="text-sm">Recorrência / Parcelamento</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => onRecurrenceChange('NONE')}
            aria-label="Transação única, sem recorrência"
            aria-pressed={recurrence === 'NONE'}
            className={`py-3 text-xs font-bold rounded-lg transition-colors min-h-[44px] ${
              recurrence === 'NONE'
                ? 'bg-slate-600 text-white shadow-lg'
                : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            Único
          </button>
          <button
            type="button"
            onClick={() => onRecurrenceChange('INSTALLMENT')}
            aria-label="Transação parcelada"
            aria-pressed={recurrence === 'INSTALLMENT'}
            className={`py-3 text-xs font-bold rounded-lg transition-colors min-h-[44px] ${
              recurrence === 'INSTALLMENT'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            Parcelado
          </button>
          <button
            type="button"
            onClick={() => onRecurrenceChange('REPEATED')}
            aria-label="Transação recorrente mensal"
            aria-pressed={recurrence === 'REPEATED'}
            className={`py-3 text-xs font-bold rounded-lg transition-colors min-h-[44px] ${
              recurrence === 'REPEATED'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            Fixo Mensal
          </button>
        </div>

        {recurrence !== 'NONE' && (
          <div className="animate-fade-in bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase">
                {recurrence === 'INSTALLMENT' ? 'Número de Parcelas' : 'Repetir por (meses)'}
              </label>
              <select
                value={installments}
                onChange={(e) => onInstallmentsChange(Number(e.target.value))}
                className="p-1 bg-slate-700/50 border border-slate-600 rounded text-sm font-bold text-slate-100 outline-none"
              >
                {[...Array(11)].map((_, i) => (
                  <option key={i} value={i + 2} className="bg-slate-800">
                    {i + 2}x
                  </option>
                ))}
                <option value={18} className="bg-slate-800">
                  18x
                </option>
                <option value={24} className="bg-slate-800">
                  24x
                </option>
                <option value={36} className="bg-slate-800">
                  36x
                </option>
                <option value={48} className="bg-slate-800">
                  48x
                </option>
              </select>
            </div>
            <div className="text-right">
              {recurrence === 'INSTALLMENT' ? (
                <p className="text-xs text-slate-400">
                  Serão criados <strong className="text-slate-200">{installments}</strong> lançamentos de{' '}
                  <strong className="text-blue-400">{formatCurrency(numericValue / installments)}</strong>
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Serão criados <strong className="text-slate-200">{installments}</strong> lançamentos de{' '}
                  <strong className="text-indigo-400">{formatCurrency(numericValue)}</strong>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
