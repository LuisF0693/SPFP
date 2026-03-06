import React from 'react';
import { FinnAvatar } from '../FinnAvatar';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
  finnTip?: string;
  className?: string;
}

/**
 * Componente reutilizavel de empty state.
 * Exibido quando uma secao nao tem dados ainda — orienta o usuario ao proximo passo.
 * So deve aparecer apos isInitialLoadComplete === true no FinanceContext.
 *
 * Uso:
 * <EmptyState
 *   title="Nenhuma transacao ainda"
 *   description="Adicione sua primeira transacao para comecar."
 *   ctaLabel="Adicionar transacao"
 *   onCta={() => navigate('/transactions/add')}
 *   finnTip="Quer saber como comecar? Me pergunte na aba Finn."
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  ctaLabel,
  onCta,
  finnTip,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {/* Ícone ou Finn avatar */}
      {icon ? (
        <div className="mb-4 text-gray-300 dark:text-gray-600">{icon}</div>
      ) : (
        <div className="mb-4">
          <FinnAvatar mode="partner" size="lg" showLabel={false} />
        </div>
      )}

      {/* Título */}
      <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">{title}</h3>

      {/* Descrição */}
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mb-6">
        {description}
      </p>

      {/* CTA */}
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="px-6 py-3 rounded-xl bg-blue-spfp text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg"
        >
          {ctaLabel}
        </button>
      )}

      {/* Dica do Finn */}
      {finnTip && (
        <p className="mt-6 text-xs text-teal-500 dark:text-teal-400 italic max-w-xs">
          💬 {finnTip}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
