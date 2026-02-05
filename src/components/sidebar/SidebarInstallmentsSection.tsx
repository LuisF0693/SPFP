/**
 * SidebarInstallmentsSection Component (STY-052)
 * Displays grouped installment plans with progress
 *
 * Features:
 * - Installment name + description
 * - Progress: "[2/12]" format
 * - Monthly payment amount
 * - Status: Color-coded by progress (blue/green/amber)
 * - Next due date
 * - Sorted by due date
 *
 * Design: docs/design/FASE-1-MOCKUPS.md (Installments Section Details)
 */

import React, { useMemo, memo, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { mockInstallments, formatCurrency, getInstallmentProgressColor } from '../../constants/mockSidebarData';
import { colorTokens } from '../../styles/tokens';

/**
 * Progress Bar for Installments
 */
interface InstallmentProgressBarProps {
  current: number;
  total: number;
  percentage: number;
}

const InstallmentProgressBar: React.FC<InstallmentProgressBarProps> = memo(({
  current,
  total,
  percentage
}) => {
  const colorClass = getInstallmentProgressColor(percentage);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-medium text-slate-400">
          [{current}/{total}]
        </span>
        <span className="text-xs font-bold text-slate-300">
          {Math.round(percentage)}%
        </span>
      </div>
      <div
        className={`w-full h-2 rounded-full bg-slate-700 overflow-hidden ${colorClass} transition-all duration-300`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Parcelamento em progresso: ${current} de ${total} (${Math.round(percentage)}%)`}
      >
        <div
          className={`h-full ${colorClass} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
});

InstallmentProgressBar.displayName = 'InstallmentProgressBar';

/**
 * Installment Item Component
 */
interface InstallmentItemProps {
  name: string;
  description: string;
  current: number;
  total: number;
  amount: number;
  nextDueDate: string;
  percentage: number;
  onClick: (installmentId: string) => void;
}

const InstallmentItem: React.FC<InstallmentItemProps> = memo(({
  name,
  description,
  current,
  total,
  amount,
  nextDueDate,
  percentage,
  onClick
}) => {
  const formattedDate = new Date(nextDueDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  });

  return (
    <button
      onClick={() => onClick(name)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(name);
        }
      }}
      className="w-full p-3 rounded-lg transition-all duration-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 group text-left"
      aria-label={`${name}: ${current} de ${total} parcelas, ${formatCurrency(amount)} por mês, vence em ${formattedDate}`}
    >
      {/* Header: Name and Amount */}
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-100 truncate">
            {name}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {description}
          </p>
        </div>
        <span className="text-sm font-semibold text-emerald-400 flex-shrink-0 ml-2">
          {formatCurrency(amount)}
        </span>
      </div>

      {/* Progress Bar */}
      <InstallmentProgressBar
        current={current}
        total={total}
        percentage={percentage}
      />

      {/* Due Date */}
      <div className="flex items-center gap-2 mt-2 px-1 text-xs text-slate-400">
        <Calendar size={12} />
        <span>Próximo: {formattedDate}</span>
      </div>
    </button>
  );
});

InstallmentItem.displayName = 'InstallmentItem';

/**
 * SidebarInstallmentsSection Component
 * Shows active installment plans with progress
 */
export const SidebarInstallmentsSection: React.FC = memo(() => {
  const sortedInstallments = useMemo(() => {
    return [...mockInstallments]
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
      .slice(0, 4); // Show max 4 installments
  }, []);

  const handleInstallmentClick = useCallback((installmentName: string) => {
    // TODO: Navigate to installment details
    console.log('Installment clicked:', installmentName);
  }, []);

  return (
    <div className="space-y-2">
      {sortedInstallments.length === 0 ? (
        <div
          className="p-4 rounded-lg text-center"
          style={{
            backgroundColor: colorTokens.slate[800],
            color: colorTokens.slate[400]
          }}
        >
          <p className="text-sm">Nenhum parcelamento ativo</p>
        </div>
      ) : (
        sortedInstallments.map((installment) => (
          <InstallmentItem
            key={installment.id}
            name={installment.name}
            description={installment.description}
            current={installment.currentInstallment}
            total={installment.totalInstallments}
            amount={installment.monthlyAmount}
            nextDueDate={installment.nextDueDate}
            percentage={installment.progressPercentage}
            onClick={handleInstallmentClick}
          />
        ))
      )}

      {/* Link to view all installments */}
      <button
        onClick={() => window.location.href = '/transactions'}
        className="w-full mt-3 p-2 text-center text-xs font-medium text-blue-400 hover:text-blue-300 rounded-lg transition-colors duration-200 hover:bg-blue-500/10"
        aria-label="Ver todos os parcelamentos"
      >
        Ver Todos os Parcelamentos →
      </button>
    </div>
  );
});

SidebarInstallmentsSection.displayName = 'SidebarInstallmentsSection';

export default SidebarInstallmentsSection;
