import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategoryManagement } from '../components/transaction/CategoryManagement';
import { Category } from '../types';

// Mock child components
vi.mock('../components/transaction/CategoryModal', () => ({
  CategoryModal: ({ isOpen, onClose, onUpdateCategory }: any) =>
    isOpen ? (
      <div data-testid="category-modal" role="dialog">
        <button onClick={onClose} data-testid="modal-close">
          Close Modal
        </button>
        <button
          onClick={() =>
            onUpdateCategory({ id: 'cat-1', name: 'Updated', color: '#fff', group: 'FIXED' })
          }
          data-testid="modal-submit"
        >
          Update
        </button>
      </div>
    ) : null,
}));

vi.mock('../components/transaction/DeleteCategoryModal', () => ({
  DeleteCategoryModal: ({ isOpen, onClose, onConfirm }: any) =>
    isOpen ? (
      <div data-testid="delete-modal" role="dialog">
        <button onClick={onClose} data-testid="delete-modal-close">
          Cancel Delete
        </button>
        <button onClick={onConfirm} data-testid="delete-modal-confirm">
          Confirm Delete
        </button>
      </div>
    ) : null,
}));

vi.mock('../../virtual-office/components/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('CategoryManagement', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Groceries',
      color: '#10b981',
      group: 'VARIABLE',
      icon: '🛒',
    },
    {
      id: 'cat-2',
      name: 'Utilities',
      color: '#3b82f6',
      group: 'FIXED',
      icon: '💡',
    },
    {
      id: 'cat-3',
      name: 'Stocks',
      color: '#8b5cf6',
      group: 'INVESTMENT',
      icon: '📈',
    },
    {
      id: 'cat-4',
      name: 'Salary',
      color: '#06b6d4',
      group: 'INCOME',
      icon: '💰',
    },
  ];

  const mockTransactions = [
    { id: 't-1', categoryId: 'cat-1', description: 'Shopping', value: 50 },
    { id: 't-2', categoryId: 'cat-1', description: 'Farmers market', value: 30 },
    { id: 't-3', categoryId: 'cat-2', description: 'Electric bill', value: 120 },
  ];

  const mockOnUpdateCategory = vi.fn();
  const mockOnDeleteCategory = vi.fn();
  const mockOnAddCategory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render category grid', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      mockCategories.forEach((cat) => {
        expect(screen.getByText(cat.name)).toBeInTheDocument();
      });
    });

    it('should render search input with correct attributes', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const searchInput = screen.getByRole('search');
      expect(searchInput).toHaveAttribute('aria-label', 'Buscar categorias por nome');
      expect(searchInput).toHaveAttribute('placeholder', 'Buscar categoria...');
    });

    it('should display transaction counts for categories with transactions', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      expect(screen.getByText('2 transações')).toBeInTheDocument(); // cat-1
      expect(screen.getByText('1 transação')).toBeInTheDocument(); // cat-2
    });

    it('should not display transaction count for categories without transactions', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      // cat-3 and cat-4 have no transactions, so their count should not appear
      const countElements = screen.queryAllByText(/transação/);
      expect(countElements.length).toBe(2); // Only cat-1 and cat-2
    });
  });

  describe('Search Functionality', () => {
    it('should filter categories by search term', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const searchInput = screen.getByRole('search') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Groceries' } });

      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.queryByText('Utilities')).not.toBeInTheDocument();
      expect(screen.queryByText('Stocks')).not.toBeInTheDocument();
    });

    it('should show empty state when no categories match search', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const searchInput = screen.getByRole('search');
      fireEvent.change(searchInput, { target: { value: 'NonexistentCategory' } });

      expect(screen.getByText('Nenhuma categoria encontrada')).toBeInTheDocument();
      expect(screen.getByText('Tente ajustar os filtros de busca')).toBeInTheDocument();
    });

    it('should clear search with clear button', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const searchInput = screen.getByRole('search') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Groceries' } });

      expect(searchInput.value).toBe('Groceries');

      // Find and click clear button
      const clearButton = screen.getByRole('button', { name: /Limpar busca/ });
      expect(clearButton).toBeInTheDocument();
      fireEvent.click(clearButton);

      expect(searchInput.value).toBe('');
      expect(screen.getByText('Utilities')).toBeInTheDocument();
    });

    it('should show clear button only when search term exists', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      expect(screen.queryByRole('button', { name: /Limpar busca/ })).not.toBeInTheDocument();

      const searchInput = screen.getByRole('search');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(screen.getByRole('button', { name: /Limpar busca/ })).toBeInTheDocument();
    });
  });

  describe('Group Filter', () => {
    it('should filter categories by group', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const variableGroupBtn = screen.getByRole('button', {
        name: /Filtrar por Gastos Variáveis/,
      });
      fireEvent.click(variableGroupBtn);

      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.queryByText('Utilities')).not.toBeInTheDocument();
      expect(screen.queryByText('Stocks')).not.toBeInTheDocument();
      expect(screen.queryByText('Salary')).not.toBeInTheDocument();
    });

    it('should show all categories when "Todas" (ALL) is selected', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      // Start with a filtered view
      const fixedBtn = screen.getByRole('button', { name: /Filtrar por Gastos Fixos/ });
      fireEvent.click(fixedBtn);

      // Switch back to all
      const allBtn = screen.getByRole('button', { name: /Filtrar por todas/ });
      fireEvent.click(allBtn);

      mockCategories.forEach((cat) => {
        expect(screen.getByText(cat.name)).toBeInTheDocument();
      });
    });

    it('should support multiple group filters', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const groups = ['Todas', 'Gastos Fixos', 'Gastos Variáveis', 'Investimentos', 'Renda'];
      groups.forEach((group) => {
        expect(screen.getByRole('button', { name: new RegExp(group) })).toBeInTheDocument();
      });
    });
  });

  describe('Edit Functionality', () => {
    it('should open category modal when edit button is clicked', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /Editar categoria/ });
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId('category-modal')).toBeInTheDocument();
    });

    it('should close modal when close button is clicked', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /Editar categoria/ });
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId('category-modal')).toBeInTheDocument();

      const closeBtn = screen.getByTestId('modal-close');
      fireEvent.click(closeBtn);

      expect(screen.queryByTestId('category-modal')).not.toBeInTheDocument();
    });

    it('should call onUpdateCategory when form is submitted', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /Editar categoria/ });
      fireEvent.click(editButtons[0]);

      const submitBtn = screen.getByTestId('modal-submit');
      fireEvent.click(submitBtn);

      expect(mockOnUpdateCategory).toHaveBeenCalled();
    });
  });

  describe('Delete Functionality', () => {
    it('should open delete modal when delete button is clicked', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /Deletar categoria/ });
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    });

    it('should close delete modal when cancel is clicked', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /Deletar categoria/ });
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();

      const cancelBtn = screen.getByTestId('delete-modal-close');
      fireEvent.click(cancelBtn);

      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });

    it('should call onDeleteCategory when delete is confirmed', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /Deletar categoria/ });
      fireEvent.click(deleteButtons[0]);

      const confirmBtn = screen.getByTestId('delete-modal-confirm');
      fireEvent.click(confirmBtn);

      expect(mockOnDeleteCategory).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no categories exist', () => {
      render(
        <CategoryManagement
          categories={[]}
          transactions={[]}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      expect(
        screen.getByText('Nenhuma categoria criada ainda')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Crie sua primeira categoria para começar a organizar suas finanças')
      ).toBeInTheDocument();
    });

    it('should show empty state with actionable CTA when onAddCategory provided', () => {
      render(
        <CategoryManagement
          categories={[]}
          transactions={[]}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
          onAddCategory={mockOnAddCategory}
        />
      );

      const addBtn = screen.getByRole('button', { name: /Nova Categoria/ });
      expect(addBtn).toBeInTheDocument();
    });

    it('should not show add button when onAddCategory not provided', () => {
      render(
        <CategoryManagement
          categories={[]}
          transactions={[]}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      expect(screen.queryByRole('button', { name: /Nova Categoria/ })).not.toBeInTheDocument();
    });

    it('should call onAddCategory when button is clicked', () => {
      render(
        <CategoryManagement
          categories={[]}
          transactions={[]}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
          onAddCategory={mockOnAddCategory}
        />
      );

      const addBtn = screen.getByRole('button', { name: /Nova Categoria/ });
      fireEvent.click(addBtn);

      expect(mockOnAddCategory).toHaveBeenCalled();
    });

    it('should hide add button when filtered results are empty', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
          onAddCategory={mockOnAddCategory}
        />
      );

      const searchInput = screen.getByRole('search');
      fireEvent.change(searchInput, { target: { value: 'NonexistentCategory' } });

      expect(screen.queryByRole('button', { name: /Nova Categoria/ })).not.toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should render action buttons (always visible on mobile)', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /Editar categoria/ });
      const deleteButtons = screen.getAllByRole('button', { name: /Deletar categoria/ });

      expect(editButtons.length).toBe(mockCategories.length);
      expect(deleteButtons.length).toBe(mockCategories.length);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on all interactive elements', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      expect(screen.getByRole('search')).toHaveAttribute('aria-label');
      const filterButtons = screen.getAllByRole('button').filter(
        (btn) => btn.getAttribute('aria-label')?.includes('Filtrar')
      );
      expect(filterButtons.length).toBeGreaterThan(0);
    });

    it('should have group badges with accessible labels', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={mockTransactions}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      const groupBadges = screen.getAllByText(/Gastos|Investimentos|Renda/);
      expect(groupBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle categories with special characters in names', () => {
      const specialCategories: Category[] = [
        {
          id: 'cat-special',
          name: 'R&D 🚀',
          color: '#ff0000',
          group: 'VARIABLE',
          icon: '🔬',
        },
      ];

      render(
        <CategoryManagement
          categories={specialCategories}
          transactions={[]}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      expect(screen.getByText('R&D 🚀')).toBeInTheDocument();
    });

    it('should handle very long category names', () => {
      const longCategories: Category[] = [
        {
          id: 'cat-long',
          name: 'This is a very long category name that might cause issues with the layout',
          color: '#ff0000',
          group: 'VARIABLE',
          icon: '📦',
        },
      ];

      render(
        <CategoryManagement
          categories={longCategories}
          transactions={[]}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      expect(
        screen.getByText(
          'This is a very long category name that might cause issues with the layout'
        )
      ).toBeInTheDocument();
    });

    it('should handle zero transactions', () => {
      render(
        <CategoryManagement
          categories={mockCategories}
          transactions={[]}
          onUpdateCategory={mockOnUpdateCategory}
          onDeleteCategory={mockOnDeleteCategory}
        />
      );

      expect(screen.queryByText(/transação/)).not.toBeInTheDocument();
    });
  });
});
