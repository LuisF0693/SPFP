import React, { useState, useMemo, useRef } from 'react';
import { Trash2, Edit2, Search, X } from 'lucide-react';
import { Category, CategoryGroup } from '../../types';
import { CategoryModal } from './CategoryModal';
import { DeleteCategoryModal } from './DeleteCategoryModal';
import { useToast } from '../../virtual-office/components/Toast';

interface CategoryManagementProps {
  categories: Category[];
  transactions?: any[];
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onAddCategory?: () => void;
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
  onDeleteCategory,
  onAddCategory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup | 'ALL'>('ALL');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      onDeleteCategory(categoryToDelete.id);
      success('Categoria deletada com sucesso!');
      setDeleteModalOpen(false);
      setCategoryToDelete(null);

      // Focus management: move to search input after delete
      searchInputRef.current?.focus();
    } catch (err) {
      error('Erro ao deletar categoria');
    } finally {
      setIsDeleting(false);
    }
  };

  const groups: (CategoryGroup | 'ALL')[] = ['ALL', 'FIXED', 'VARIABLE', 'INVESTMENT', 'INCOME'];

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            role="search"
            aria-label="Buscar categorias por nome"
            className="w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 hover:bg-slate-700/30 rounded"
              aria-label="Limpar busca"
              title="Limpar busca"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Group Filter */}
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              aria-pressed={selectedGroup === group}
              aria-label={`Filtrar por ${group === 'ALL' ? 'todas as categorias' : GROUP_LABELS[group as CategoryGroup]}`}
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
                      <div
                        className={`text-xs px-2 py-0.5 rounded border mt-1 ${GROUP_COLORS[category.group]}`}
                        aria-label={`Grupo: ${GROUP_LABELS[category.group]}`}
                      >
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

                {/* Action buttons - Always visible on mobile, hover on desktop */}
                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                    aria-label={`Editar categoria ${category.name}`}
                    title="Editar categoria"
                  >
                    <Edit2 size={14} aria-hidden="true" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                    aria-label={`Deletar categoria ${category.name}`}
                    title="Deletar categoria"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Deletar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📁</div>
          <p className="text-base font-medium text-slate-300 mb-2">
            {searchTerm || selectedGroup !== 'ALL'
              ? 'Nenhuma categoria encontrada'
              : 'Nenhuma categoria criada ainda'}
          </p>
          <p className="text-sm text-slate-500 mb-4">
            {searchTerm || selectedGroup !== 'ALL'
              ? 'Tente ajustar os filtros de busca'
              : 'Crie sua primeira categoria para começar a organizar suas finanças'}
          </p>
          {!searchTerm && selectedGroup === 'ALL' && onAddCategory && (
            <button
              onClick={onAddCategory}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm"
              aria-label="Criar nova categoria"
            >
              + Nova Categoria
            </button>
          )}
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

      {/* Delete Category Modal */}
      <DeleteCategoryModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        category={categoryToDelete}
        transactionCount={
          categoryToDelete ? getCategoryTransactionCount(categoryToDelete.id) : 0
        }
        isDeleting={isDeleting}
      />
    </div>
  );
};
