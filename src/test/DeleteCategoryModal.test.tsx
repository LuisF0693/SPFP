import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteCategoryModal } from '../components/transaction/DeleteCategoryModal';
import { Category } from '../types';

// Mock Modal component
vi.mock('../components/ui/Modal', () => ({
  Modal: ({ isOpen, onClose, title, children, footer }: any) =>
    isOpen ? (
      <div data-testid="modal" role="dialog">
        <h2 data-testid="modal-title">{title}</h2>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
      </div>
    ) : null,
}));

describe('DeleteCategoryModal', () => {
  const mockCategory: Category = {
    id: 'cat-1',
    name: 'Groceries',
    color: '#10b981',
    group: 'VARIABLE',
    icon: '🛒',
  };

  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <DeleteCategoryModal
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
        />
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should render modal with correct title', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
        />
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent(
        'Deletar Categoria'
      );
    });

    it('should display category information (name, icon, color)', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
        />
      );

      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('🛒')).toBeInTheDocument();
    });

    it('should display category ID preview', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
        />
      );

      expect(screen.getByText(/ID: cat-1/)).toBeInTheDocument();
    });

    it('should render cancel and confirm buttons', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
        />
      );

      expect(screen.getByRole('button', { name: /Cancelar/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sim, Deletar Categoria/ })).toBeInTheDocument();
    });
  });

  describe('No Transactions (Safe Delete)', () => {
    it('should show warning message for deletion', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
        />
      );

      expect(
        screen.getByText(/Esta ação não pode ser desfeita/)
      ).toBeInTheDocument();
    });

    it('should enable confirm button when no transactions exist', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
        />
      );

      const confirmBtn = screen.getByRole('button', {
        name: /Sim, Deletar Categoria/,
      });
      expect(confirmBtn).not.toBeDisabled();
    });

    it('should call onConfirm when confirm button is clicked (no transactions)', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
        />
      );

      const confirmBtn = screen.getByRole('button', {
        name: /Sim, Deletar Categoria/,
      });
      fireEvent.click(confirmBtn);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('With Transactions (Blocking Acknowledgment)', () => {
    const TRANSACTION_COUNT = 3;

    it('should show transaction count warning', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={TRANSACTION_COUNT}
        />
      );

      expect(
        screen.getByText(/Aviso: Esta categoria está em uso/)
      ).toBeInTheDocument();
      expect(screen.getByText(/3 transações ainda estão atribuídas/)).toBeInTheDocument();
    });

    it('should show acknowledgment checkbox', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={TRANSACTION_COUNT}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('should disable confirm button when transactions exist and checkbox unchecked', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={TRANSACTION_COUNT}
        />
      );

      const confirmBtn = screen.getByRole('button', {
        name: /Sim, Deletar Categoria/,
      });
      expect(confirmBtn).toBeDisabled();
    });

    it('should enable confirm button when checkbox is checked', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={TRANSACTION_COUNT}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      fireEvent.click(checkbox);

      const confirmBtn = screen.getByRole('button', {
        name: /Sim, Deletar Categoria/,
      });
      expect(confirmBtn).not.toBeDisabled();
    });

    it('should call onConfirm only when checkbox is checked', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={TRANSACTION_COUNT}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      fireEvent.click(checkbox);

      const confirmBtn = screen.getByRole('button', {
        name: /Sim, Deletar Categoria/,
      });
      fireEvent.click(confirmBtn);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should show plural form for multiple transactions', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={2}
        />
      );

      expect(screen.getByText(/2 transações ainda estão atribuídas/)).toBeInTheDocument();
    });

    it('should show singular form for single transaction', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={1}
        />
      );

      expect(screen.getByText(/1 transação ainda está atribuída/)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should disable buttons when isDeleting is true', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
          isDeleting={true}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /Cancelar/ });
      const confirmBtn = screen.getByRole('button', { name: /Deletando/ });

      expect(cancelBtn).toBeDisabled();
      expect(confirmBtn).toBeDisabled();
    });

    it('should show loading text when deleting', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
          isDeleting={true}
        />
      );

      expect(screen.getByText(/Deletando/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
        />
      );

      const cancelBtn = screen.getByRole('button', { name: /Cancelar/ });
      fireEvent.click(cancelBtn);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should uncheck acknowledgment checkbox when modal reopens', () => {
      const { rerender } = render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={3}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);

      // Close modal
      rerender(
        <DeleteCategoryModal
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={3}
        />
      );

      // Reopen modal
      rerender(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={3}
        />
      );

      const newCheckbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(newCheckbox.checked).toBe(false);
    });
  });

  describe('Accessibility (ARIA)', () => {
    it('should have proper ARIA labels on buttons', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
        />
      );

      expect(screen.getByRole('button', { name: /Cancelar exclusão/ })).toBeInTheDocument();
    });

    it('should have aria-label on checkbox', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={3}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label');
    });

    it('should have modal with ARIA attributes', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={0}
        />
      );

      const modal = screen.getByTestId('modal');
      expect(modal).toHaveAttribute('role', 'dialog');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null category gracefully', () => {
      const { container } = render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={null}
          transactionCount={0}
        />
      );

      // Should render nothing when category is null
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    it('should support async onConfirm', async () => {
      const asyncOnConfirm = vi.fn(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 100);
          })
      );

      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={asyncOnConfirm}
          category={mockCategory}
          transactionCount={0}
        />
      );

      const confirmBtn = screen.getByRole('button', {
        name: /Sim, Deletar Categoria/,
      });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(asyncOnConfirm).toHaveBeenCalled();
      });
    });

    it('should handle large transaction counts', () => {
      render(
        <DeleteCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          category={mockCategory}
          transactionCount={9999}
        />
      );

      expect(
        screen.getByText(/9999 transações ainda estão atribuídas/)
      ).toBeInTheDocument();
    });
  });
});
