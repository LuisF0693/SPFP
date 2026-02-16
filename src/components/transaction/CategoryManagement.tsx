import React, { useState, useMemo } from 'react';
import { Trash2, Edit2, Search } from 'lucide-react';
import { Category, CategoryGroup } from '../../types';
import { CategoryModal } from './CategoryModal';
import { useToast } from '../../virtual-office/components/Toast';

interface CategoryManagementProps {
  categories: Category[];
  transactions?: any[];
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

const GROUP_LABELS: Record<CategoryGroup, string> = {
  'FIXED': 'Gastos Fixos',
  'VARIABLE': 'Gastos Variáveis',
  'INVESTMENT': 'Investimentos',
  'INCOME': 'Renda'
};

const GROUP_COLORS: Record<CategoryGroup, string> = {
  'FIXED': 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  'VARIABLE': 'bg-purple-500/20 border-purple-500/50 text-purple-400',
  'INVESTMENT': 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
  'INCOME': 'bg-green-500/20 border-green-500/50 text-green-400'
};

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  transactions = [],
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup | 'ALL'>('ALL');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { success, warning, error } = useToast();

  // Filter categories based on search and group
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedGroup === 'ALL' || cat.group === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [categories, searchTerm, selectedGroup]);

  // Count transactions using each category
  const getCategoryTransactionCount = (categoryId: string): number => {
    return transactions.filter((t: any) => t.categoryId === categoryId).length;
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleUpdateCategory = (category: Category) => {
    onUpdateCategory(category);
    setEditingCategory(null);
    setIsModalOpen(false);
    success('Categoria atualizada com sucesso!');
  };

  const handleDeleteCategory = (categoryId: string) => {
    const transactionCount = getCategoryTransactionCount(categoryId);

    if (transactionCount > 0) {
      warning(
        `${transactionCount} transação(ões) usam esta categoria. Deseja deletar mesmo assim?`,
        5000
      );
    }

    onDeleteCategory(categoryId);
    setDeleteConfirmId(null);
    success('Categoria deletada com sucesso!');
  };

  const groups: (CategoryGroup | 'ALL')[] = ['ALL', 'FIXED', 'VARIABLE', 'INVESTMENT', 'INCOME'];

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>

        {/* Group Filter */}
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedGroup === group
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              {group === 'ALL' ? 'Todas' : GROUP_LABELS[group as CategoryGroup]}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredCategories.map((category) => {
            const transactionCount = getCategoryTransactionCount(category.id);

            return (
              <div
                key={category.id}
                className="group p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-slate-600/50 transition-all"
              >
                {/* Header: Icon and Name */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: `${category.color}20`, borderColor: category.color, borderWidth: 2 }}
                    >
                      {category.icon || '📦'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-100 truncate">
                        {category.name}
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded border mt-1 ${GROUP_COLORS[category.group]}`}>
                        {GROUP_LABELS[category.group]}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color indicator bar */}
                <div
                  className="h-1 rounded-full mb-3"
                  style={{ backgroundColor: category.color }}
                />

                {/* Transaction count */}
                {transactionCount > 0 && (
                  <div className="text-xs text-slate-500 mb-3">
                    {transactionCount} transação{transactionCount > 1 ? 's' : ''}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                    title="Editar categoria"
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(deleteConfirmId === category.id ? null : category.id)}
                    className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                    title="Deletar categoria"
                  >
                    <Trash2 size={14} />
                    Deletar
                  </button>
                </div>

                {/* Delete confirmation */}
                {deleteConfirmId === category.id && (
                  <div className="mt-3 p-3 bg-red-600/20 border border-red-500/50 rounded-lg">
                    <p className="text-xs text-red-300 mb-2">
                      Tem certeza? {transactionCount > 0 && `${transactionCount} transação(ões) serão afetadas.`}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="flex-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-all"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-medium rounded transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <div className="text-3xl mb-2">📁</div>
          <p className="text-sm">
            {searchTerm || selectedGroup !== 'ALL'
              ? 'Nenhuma categoria encontrada com esses filtros'
              : 'Nenhuma categoria disponível'}
          </p>
        </div>
      )}

      {/* Category Modal for editing */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        mode="edit"
        category={editingCategory || undefined}
        allCategories={categories}
        onUpdateCategory={handleUpdateCategory}
        onCategoryUpdated={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
      />
    </div>
  );
};
