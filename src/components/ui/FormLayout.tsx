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

  const formId = `form-${title.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`;
  const titleId = `${formId}-title`;

  return (
    <div className={containerClass} role={isModal ? 'presentation' : undefined}>
      <form
        id={formId}
        onSubmit={onSubmit}
        className={wrapperClass}
        aria-labelledby={titleId}
        noValidate
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-800 ${headerClassName}`}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2.5 bg-blue-500/10 rounded-xl" aria-hidden="true">
                <Icon size={24} className="text-blue-500" />
              </div>
            )}
            <h2 id={titleId} className="text-xl font-bold text-white">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <fieldset className={`p-6 space-y-6 max-h-[70vh] overflow-y-auto ${contentClassName}`} form={formId}>
          <legend className="sr-only">{title}</legend>
          {children}
        </fieldset>

        {/* Footer */}
        <div className={`flex gap-3 p-6 border-t border-gray-800 bg-black/20 ${footerClassName}`}>
          <Button
            type="button"
            variant="ghost"
            size="md"
            fullWidth
            onClick={onClose}
            aria-label={cancelLabel}
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
            aria-label={submitLabel}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};
