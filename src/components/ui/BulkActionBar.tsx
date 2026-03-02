import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, X, Tag, Wallet, CreditCard, CheckSquare, Square } from 'lucide-react';
import { Transaction, Category, Account } from '../../types';
import { Modal } from './Modal';

interface BulkActionBarProps {
  selectedIds: Set<string>;
  filteredTransactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onApplyCategory: (categoryId: string) => void;
  onApplyAccount: (accountId: string) => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onClear: () => void;
}

type BulkEditMode = 'categoria' | 'conta' | 'cartao';

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedIds,
  filteredTransactions,
  categories,
  accounts,
  onApplyCategory,
  onApplyAccount,
  onDelete,
  onSelectAll,
  onClear,
}) => {
  const [editMode, setEditMode] = useState<BulkEditMode | null>(null);
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || '');
  const [selectedAccId, setSelectedAccId] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const creditCards = accounts.filter(a => a.type === 'CREDIT_CARD');
  const regularAccounts = accounts.filter(a => a.type !== 'CREDIT_CARD');
  const count = selectedIds.size;
  const allSelected = filteredTransactions.length > 0 && count === filteredTransactions.length;

  // Reset account selection when modal opens
  useEffect(() => {
    if (editMode) setSelectedAccId('');
  }, [editMode]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApply = () => {
    if (editMode === 'categoria') {
      onApplyCategory(selectedCatId);
      const cat = categories.find(c => c.id === selectedCatId);
      showToast(`${count} lançamento${count > 1 ? 's' : ''} movido${count > 1 ? 's' : ''} para "${cat?.name}"`);
    } else if (editMode === 'conta' || editMode === 'cartao') {
      if (!selectedAccId) return;
      onApplyAccount(selectedAccId);
      const acc = accounts.find(a => a.id === selectedAccId);
      showToast(`${count} lançamento${count > 1 ? 's' : ''} movido${count > 1 ? 's' : ''} para "${acc?.name}"`);
    }
    setEditMode(null);
  };

  const modalTitle: Record<BulkEditMode, string> = {
    categoria: 'Alterar Categoria',
    conta: 'Mover para Conta',
    cartao: 'Mover para Cartão',
  };

  const modalDescription: Record<BulkEditMode, string> = {
    categoria: `Selecione a nova categoria para os ${count} lançamentos selecionados.`,
    conta: `Selecione a conta de destino para os ${count} lançamentos selecionados.`,
    cartao: `Selecione o cartão de crédito para os ${count} lançamentos selecionados.`,
  };

  const canApply =
    editMode === 'categoria'
      ? !!selectedCatId
      : !!selectedAccId;

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[60] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-2 animate-fade-in">
          ✓ {toast}
        </div>
      )}

      {/* Floating action bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1e293b] border border-gray-700 shadow-2xl rounded-2xl px-3 py-2.5 flex items-center gap-1 flex-wrap max-w-[95vw] animate-fade-in">
        {/* Counter */}
        <span className="text-white font-bold text-sm px-2 whitespace-nowrap">
          {count} selecionado{count > 1 ? 's' : ''}
        </span>

        <div className="h-5 w-px bg-gray-700 mx-1" />

        {/* Select all toggle */}
        <button
          onClick={onSelectAll}
          title={allSelected ? 'Desmarcar todos' : 'Selecionar todos do mês'}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors text-xs font-semibold whitespace-nowrap"
        >
          {allSelected ? <Square size={14} /> : <CheckSquare size={14} />}
          {allSelected ? 'Desmarcar' : 'Todos do mês'}
        </button>

        <div className="h-5 w-px bg-gray-700 mx-1" />

        {/* Categoria */}
        <button
          onClick={() => setEditMode('categoria')}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-blue-700/30 rounded-lg text-blue-300 transition-colors text-xs font-bold whitespace-nowrap"
        >
          <Tag size={14} /> Categoria
        </button>

        {/* Conta */}
        <button
          onClick={() => setEditMode('conta')}
          disabled={regularAccounts.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-purple-700/30 rounded-lg text-purple-300 transition-colors text-xs font-bold whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Wallet size={14} /> Conta
        </button>

        {/* Cartão */}
        <button
          onClick={() => setEditMode('cartao')}
          disabled={creditCards.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-pink-700/30 rounded-lg text-pink-300 transition-colors text-xs font-bold whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CreditCard size={14} /> Cartão
        </button>

        <div className="h-5 w-px bg-gray-700 mx-1" />

        {/* Delete */}
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors text-xs font-bold whitespace-nowrap"
        >
          <Trash2 size={14} /> Excluir
        </button>

        {/* Clear */}
        <button
          onClick={onClear}
          title="Cancelar seleção"
          className="p-1.5 hover:bg-gray-700 rounded-full text-gray-400 ml-1"
        >
          <X size={15} />
        </button>
      </div>

      {/* Bulk Edit Modal */}
      {editMode && (
        <Modal
          isOpen={true}
          onClose={() => setEditMode(null)}
          title={modalTitle[editMode]}
          size="sm"
          variant="dark"
        >
          <p className="text-sm text-gray-400 mb-5">{modalDescription[editMode]}</p>

          {editMode === 'categoria' && (
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4 pr-1">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCatId(c.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                    selectedCatId === c.id
                      ? 'bg-blue-600/30 border border-blue-500/50 text-white'
                      : 'bg-[#1e293b] border border-transparent hover:border-gray-600 text-gray-300'
                  }`}
                >
                  <span className="text-lg">{c.icon || '📦'}</span>
                  <span className="font-semibold text-sm">{c.name}</span>
                  {selectedCatId === c.id && (
                    <span className="ml-auto text-blue-400 text-xs font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {editMode === 'conta' && (
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4 pr-1">
              {regularAccounts.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Nenhuma conta disponível.</p>
              ) : (
                regularAccounts.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAccId(a.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      selectedAccId === a.id
                        ? 'bg-purple-600/30 border border-purple-500/50 text-white'
                        : 'bg-[#1e293b] border border-transparent hover:border-gray-600 text-gray-300'
                    }`}
                  >
                    <Wallet size={16} className="text-purple-400 flex-shrink-0" />
                    <span className="font-semibold text-sm">{a.name}</span>
                    {selectedAccId === a.id && (
                      <span className="ml-auto text-purple-400 text-xs font-bold">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {editMode === 'cartao' && (
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4 pr-1">
              {creditCards.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Nenhum cartão de crédito cadastrado.</p>
              ) : (
                creditCards.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAccId(a.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      selectedAccId === a.id
                        ? 'bg-pink-600/30 border border-pink-500/50 text-white'
                        : 'bg-[#1e293b] border border-transparent hover:border-gray-600 text-gray-300'
                    }`}
                  >
                    <CreditCard size={16} className="text-pink-400 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">{a.name}</div>
                      {a.lastFourDigits && (
                        <div className="text-xs text-gray-500">••••{a.lastFourDigits}</div>
                      )}
                    </div>
                    {selectedAccId === a.id && (
                      <span className="ml-auto text-pink-400 text-xs font-bold">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setEditMode(null)}
              className="flex-1 py-3 text-gray-400 font-bold hover:bg-[#1e293b] rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              disabled={!canApply}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Edit2 size={14} className="inline mr-2" />
              Aplicar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};
