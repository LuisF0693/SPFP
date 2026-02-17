import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Loader } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Category } from '../../types';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  category: Category | null;
  transactionCount: number;
  isDeleting?: boolean;
}

/**
 * Delete Category Modal - Dedicated confirmation dialog with safety checks
 * WCAG 2.1 AA accessible with full ARIA labels, keyboard shortcuts, and focus management
 *
 * Features:
 * - Shows category icon, name, color, and group
 * - Blocking acknowledgment when transactions exist (checkbox required)
 * - Loading state during deletion
 * - Keyboard shortcuts (Enter to confirm, ESC to cancel)
 * - Full accessibility (ARIA labels, focus trap)
 */
export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  category,
  transactionCount,
  isDeleting = false,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Reset acknowledgment when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAcknowledged(false);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts (Enter to confirm, already handled by Modal for ESC)
  useEffect(() => {
    if (!isOpen || !confirmButtonRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter key to confirm (only if confirm button is enabled)
      if (e.key === 'Enter' && !isDeleting) {
        const isConfirmEnabled =
          transactionCount === 0 || (transactionCount > 0 && acknowledged);
        if (isConfirmEnabled && confirmButtonRef.current) {
          e.preventDefault();
          handleConfirm();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, transactionCount, acknowledged]);

  const handleConfirm = async () => {
    // Prevent multiple clicks
    if (isDeleting) return;

    // Validate acknowledgment if transactions exist
    if (transactionCount > 0 && !acknowledged) return;

    await onConfirm();
  };

  if (!category) return null;

  const hasTransactions = transactionCount > 0;
  const canConfirm = !isDeleting && (hasTransactions ? acknowledged : true);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deletar Categoria"
      size="md"
      variant="dark"
      ariaLabel="Confirmação para deletar categoria"
    >
      <div className="space-y-4">
        {/* Category Preview */}
        <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              backgroundColor: `${category.color}20`,
              borderColor: category.color,
              borderWidth: 2,
            }}
          >
            {category.icon || '📦'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-100">
              {category.name}
            </div>
            <div className="text-xs text-slate-400">
              ID: {category.id.substring(0, 8)}...
            </div>
          </div>
        </div>

        {/* Warning Section */}
        {hasTransactions ? (
          <div className="space-y-3">
            {/* Transaction Count Warning */}
            <div className="p-4 bg-yellow-600/20 border border-yellow-500/50 rounded-xl flex gap-3">
              <AlertTriangle
                size={20}
                className="text-yellow-400 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-yellow-300 mb-1">
                  ⚠️ Aviso: Esta categoria está em uso
                </p>
                <p className="text-xs text-yellow-200/80">
                  <strong>{transactionCount}</strong> transação
                  {transactionCount > 1 ? 's' : ''} ainda{' '}
                  {transactionCount > 1 ? 'estão' : 'está'} atribuída
                  {transactionCount > 1 ? 's' : ''} a esta categoria. Deletar
                  a categoria não afetará as transações (elas ficarão sem
                  categoria).
                </p>
              </div>
            </div>

            {/* Acknowledgment Checkbox */}
            <label className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
              <input
                ref={checkboxRef}
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                disabled={isDeleting}
                aria-label="Confirmar que entendo o que vai acontecer com as transações"
                className="mt-1.5 w-5 h-5 cursor-pointer accent-yellow-500"
              />
              <span className="text-xs text-slate-300">
                Entendo que as transações ficarão sem categoria, e desejo
                continuar com a exclusão
              </span>
            </label>
          </div>
        ) : (
          /* No Transactions - Just Warning */
          <div className="p-4 bg-red-600/20 border border-red-500/50 rounded-xl flex gap-3">
            <AlertTriangle
              size={20}
              className="text-red-400 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-red-300 mb-1">
                Esta ação não pode ser desfeita
              </p>
              <p className="text-xs text-red-200/80">
                Você está prestes a deletar permanentemente a categoria "
                <strong>{category.name}</strong>". Esta ação é irreversível.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-100 text-sm font-medium rounded-lg transition-all"
            aria-label="Cancelar exclusão de categoria"
          >
            Cancelar
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              canConfirm
                ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                : 'bg-red-600/50 text-red-300/50 cursor-not-allowed'
            }`}
            aria-label={`Confirmar exclusão de categoria${
              hasTransactions && !acknowledged ? ' (desabilitado)' : ''
            }`}
          >
            {isDeleting && (
              <>
                <Loader size={16} className="animate-spin" aria-hidden="true" />
                Deletando...
              </>
            )}
            {!isDeleting && 'Sim, Deletar Categoria'}
          </button>
        </div>

        {/* Keyboard Shortcut Hint */}
        <p className="text-xs text-slate-500 text-center pt-2">
          💡 Dica: Pressione <kbd className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">ESC</kbd> para cancelar
          {canConfirm && (
            <>
              {' '}ou <kbd className="px-2 py-0.5 bg-slate-700 rounded text-slate-300">ENTER</kbd> para confirmar
            </>
          )}
        </p>
      </div>
    </Modal>
  );
};
