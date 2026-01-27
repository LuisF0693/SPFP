import React from 'react';
import { X, LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface FormLayoutProps {
  title: string;
  icon?: LucideIcon;
  onClose: () => void;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isModal?: boolean;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

/**
 * Reusable FormLayout component
 * Consolidates common form structure in TransactionForm, GoalForm, InvestmentForm, PatrimonyForm
 * Eliminates 100+ lines of duplicate header/footer structure
 */
export const FormLayout: React.FC<FormLayoutProps> = ({
  title,
  icon: Icon,
  onClose,
  children,
  onSubmit,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  isModal = true,
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
}) => {
  const containerClass = isModal
    ? 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm'
    : '';

  const wrapperClass = isModal
    ? 'w-full max-w-lg bg-[#0f172a]/95 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden'
    : 'w-full';

  return (
    <div className={containerClass}>
      <form onSubmit={onSubmit} className={wrapperClass}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-800 ${headerClassName}`}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <Icon size={24} className="text-blue-500" />
              </div>
            )}
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={`p-6 space-y-6 max-h-[70vh] overflow-y-auto ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        <div className={`flex gap-3 p-6 border-t border-gray-800 bg-black/20 ${footerClassName}`}>
          <Button
            type="button"
            variant="ghost"
            size="md"
            fullWidth
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isLoading}
            loadingText={submitLabel}
            disabled={isLoading}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};
