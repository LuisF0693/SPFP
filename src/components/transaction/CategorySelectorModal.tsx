import React, { useState, useMemo } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Category, CategoryGroup } from '../../types';

interface CategorySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedId: string;
  onSelect: (categoryId: string) => void;
  onCreateNew: () => void;
}

const GROUP_LABELS: Record<CategoryGroup, string> = {
  'FIXED': 'Gastos Fixos',
  'VARIABLE': 'Gastos Variáveis',
  'INVESTMENT': 'Investimentos',
  'INCOME': 'Renda'
};

const GROUP_ORDER: CategoryGroup[] = ['FIXED', 'VARIABLE', 'INVESTMENT', 'INCOME'];

export const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({
  isOpen,
  onClose,
  categories,
  selectedId,
  onSelect,
  onCreateNew
}) => {
  const [search, setSearch] = useState('');

  // Filter and group categories
  const groupedCategories = useMemo(() => {
    const filtered = categories.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );

    const grouped: Record<CategoryGroup, Category[]> = {
      FIXED: [],
      VARIABLE: [],
      INVESTMENT: [],
      INCOME: []
    };

    filtered.forEach(cat => {
      const group = cat.group || 'VARIABLE';
      if (grouped[group]) {
        grouped[group].push(cat);
      }
    });

    return grouped;
  }, [categories, search]);

  const handleSelect = (categoryId: string) => {
    onSelect(categoryId);
    onClose();
    setSearch('');
  };

  const handleCreateNew = () => {
    onCreateNew();
    setSearch('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Categoria"
      variant="dark"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none text-slate-100 placeholder-slate-500 focus:border-blue-500/50 transition-colors"
            autoFocus
          />
        </div>

        {/* Category Grid by Group */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {GROUP_ORDER.map((group) => {
            const items = groupedCategories[group];
            if (!items || items.length === 0) return null;

            return (
              <div key={group}>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                  {GROUP_LABELS[group]}
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {items.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelect(cat.id)}
                      className={`
                        flex flex-col items-center p-3 rounded-xl border-2
                        transition-all duration-200 hover:scale-[1.03] active:scale-95
                        ${selectedId === cat.id
                          ? 'border-blue-500 bg-blue-500/15 shadow-lg shadow-blue-500/20'
                          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-700/30'
                        }
                      `}
                    >
                      <span className="text-2xl mb-1">{cat.icon || '📦'}</span>
                      <span className={`
                        text-[10px] text-center leading-tight truncate w-full
                        ${selectedId === cat.id ? 'font-bold text-blue-400' : 'text-slate-400'}
                      `}>
                        {cat.name}
                      </span>
                      {selectedId === cat.id && (
                        <Check size={12} className="text-blue-400 mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* No results */}
          {Object.values(groupedCategories).every(arr => arr.length === 0) && (
            <div className="text-center py-8 text-slate-500">
              Nenhuma categoria encontrada
            </div>
          )}
        </div>

        {/* Create New Button */}
        <button
          type="button"
          onClick={handleCreateNew}
          className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
        >
          <Plus size={18} />
          Criar Nova Categoria
        </button>
      </div>
    </Modal>
  );
};
