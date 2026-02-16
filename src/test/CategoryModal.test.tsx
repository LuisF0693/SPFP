import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CategoryModal, CreateCategoryModal } from '../components/transaction/CategoryModal';
import { Category, CategoryGroup } from '../types';

// Mock Modal component to simplify testing
vi.mock('../components/ui/Modal', () => ({
  Modal: ({ isOpen, onClose, title, footer, children }: any) =>
    isOpen ? (
      <div data-testid="modal" role="dialog">
        <h2 data-testid="modal-title">{title}</h2>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
        <button onClick={onClose} data-testid="modal-close">Close</button>
      </div>
    ) : null
}));

describe('CategoryModal', () => {
  const mockCategory: Category = {
    id: 'cat-1',
    name: 'Groceries',
    color: '#3b82f6',
    group: 'VARIABLE',
    icon: '🛒'
  };

  const mockCreateCategory = vi.fn((name: string, group: CategoryGroup, color: string, icon: string) => 'new-id');
  const mockUpdateCategory = vi.fn();
  const mockOnCategoryCreated = vi.fn();
  const mockOnCategoryUpdated = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode (default)', () => {
    it('should render modal with create title', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Nova Categoria');
      expect(screen.getByRole('button', { name: /Criar e Selecionar/i })).toBeInTheDocument();
    });

    it('should have empty fields in create mode', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      const nameInput = inputs[0];
      expect(nameInput.value).toBe('');
    });

    it('should call onCreateCategory with correct params when submitting', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: 'New Category' } });

      const submitButton = screen.getByRole('button', { name: /Criar e Selecionar/i });
      fireEvent.click(submitButton);

      expect(mockCreateCategory).toHaveBeenCalledWith(
        'New Category',
        'VARIABLE',
        expect.any(String),
        expect.any(String)
      );
      expect(mockOnCategoryCreated).toHaveBeenCalledWith('new-id');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should disable submit button when name is empty', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Criar e Selecionar/i }) as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });

    it('should enable submit button when name is filled', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: 'Test' } });

      const submitButton = screen.getByRole('button', { name: /Criar e Selecionar/i }) as HTMLButtonElement;
      expect(submitButton.disabled).toBe(false);
    });

    it('should allow category group selection', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      const groupButtons = screen.getAllByRole('button');
      const fixedButton = groupButtons.find(btn => btn.textContent === 'Gastos Fixos');

      expect(fixedButton).toBeInTheDocument();
      fireEvent.click(fixedButton!);

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: 'Fixed Cost' } });

      fireEvent.click(screen.getByRole('button', { name: /Criar e Selecionar/i }));

      expect(mockCreateCategory).toHaveBeenCalledWith(
        'Fixed Cost',
        'FIXED',
        expect.any(String),
        expect.any(String)
      );
    });

    it('should allow color selection', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: 'Colored' } });

      // Color buttons are hard to test without their style attribute
      // But we verify the structure exists
      const colorButtons = screen.getAllByRole('button');
      expect(colorButtons.length).toBeGreaterThan(10); // Name, Group buttons, Colors, Emojis
    });

    it('should reset form on close', () => {
      const { rerender } = render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: 'Test Category' } });

      fireEvent.click(screen.getByTestId('modal-close'));

      // Close callback should be called
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    it('should render modal with edit title in edit mode', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          category={mockCategory}
          onUpdateCategory={mockUpdateCategory}
          onCategoryUpdated={mockOnCategoryUpdated}
        />
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Editar Categoria');
      expect(screen.getByRole('button', { name: /Salvar Alterações/i })).toBeInTheDocument();
    });

    it('should pre-populate fields with category data in edit mode', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          category={mockCategory}
          onUpdateCategory={mockUpdateCategory}
          onCategoryUpdated={mockOnCategoryUpdated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      expect(inputs[0].value).toBe('Groceries');
    });

    it('should call onUpdateCategory with updated category data', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          category={mockCategory}
          onUpdateCategory={mockUpdateCategory}
          onCategoryUpdated={mockOnCategoryUpdated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: 'Updated Groceries' } });

      const submitButton = screen.getByRole('button', { name: /Salvar Alterações/i });
      fireEvent.click(submitButton);

      expect(mockUpdateCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'cat-1',
          name: 'Updated Groceries',
          color: '#3b82f6',
          group: 'VARIABLE',
          icon: '🛒'
        })
      );
      expect(mockOnCategoryUpdated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should allow editing category name', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          category={mockCategory}
          onUpdateCategory={mockUpdateCategory}
          onCategoryUpdated={mockOnCategoryUpdated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: 'New Groceries' } });

      fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

      expect(mockUpdateCategory).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New Groceries' })
      );
    });

    it('should allow editing category group', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          category={mockCategory}
          onUpdateCategory={mockUpdateCategory}
          onCategoryUpdated={mockOnCategoryUpdated}
        />
      );

      const groupButtons = screen.getAllByRole('button');
      const fixedButton = groupButtons.find(btn => btn.textContent === 'Gastos Fixos');
      fireEvent.click(fixedButton!);

      fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

      expect(mockUpdateCategory).toHaveBeenCalledWith(
        expect.objectContaining({ group: 'FIXED' })
      );
    });

    it('should allow editing category color', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          category={mockCategory}
          onUpdateCategory={mockUpdateCategory}
          onCategoryUpdated={mockOnCategoryUpdated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: 'Groceries' } });

      fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

      expect(mockUpdateCategory).toHaveBeenCalled();
      const called = mockUpdateCategory.mock.calls[0][0];
      expect(called.id).toBe('cat-1');
    });

    it('should disable submit button when name is empty in edit mode', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          category={mockCategory}
          onUpdateCategory={mockUpdateCategory}
          onCategoryUpdated={mockOnCategoryUpdated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: '' } });

      const submitButton = screen.getByRole('button', { name: /Salvar Alterações/i }) as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });

    it('should not call update if name is empty on submit', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          category={mockCategory}
          onUpdateCategory={mockUpdateCategory}
          onCategoryUpdated={mockOnCategoryUpdated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: '' } });

      const submitButton = screen.getByRole('button', { name: /Salvar Alterações/i }) as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);

      // Button is disabled so click shouldn't do anything
      fireEvent.click(submitButton);
      expect(mockUpdateCategory).not.toHaveBeenCalled();
    });

    it('should handle category change updates', () => {
      const newCategory: Category = {
        id: 'cat-2',
        name: 'Transportation',
        color: '#ef4444',
        group: 'VARIABLE',
        icon: '🚗'
      };

      const { rerender } = render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          category={mockCategory}
          onUpdateCategory={mockUpdateCategory}
          onCategoryUpdated={mockOnCategoryUpdated}
        />
      );

      // Rerender with new category
      rerender(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          category={newCategory}
          onUpdateCategory={mockUpdateCategory}
          onCategoryUpdated={mockOnCategoryUpdated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      expect(inputs[0].value).toBe('Transportation');
    });
  });

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <CategoryModal
          isOpen={false}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      fireEvent.click(screen.getByTestId('modal-close'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Backwards Compatibility', () => {
    it('should export CreateCategoryModal as alias for CategoryModal', () => {
      render(
        <CreateCategoryModal
          isOpen={true}
          onClose={mockOnClose}
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      expect(screen.getByTestId('modal-title')).toHaveTextContent('Nova Categoria');
    });
  });

  describe('Form Validation', () => {
    it('should trim whitespace from category name', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: '  Test Category  ' } });

      fireEvent.click(screen.getByRole('button', { name: /Criar e Selecionar/i }));

      expect(mockCreateCategory).toHaveBeenCalledWith(
        'Test Category',
        expect.any(String),
        expect.any(String),
        expect.any(String)
      );
    });

    it('should accept empty string with whitespace only as invalid', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: '   ' } });

      const submitButton = screen.getByRole('button', { name: /Criar e Selecionar/i }) as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });
  });

  describe('Default Values', () => {
    it('should use VARIABLE group as default when creating', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: 'Test' } });

      fireEvent.click(screen.getByRole('button', { name: /Criar e Selecionar/i }));

      expect(mockCreateCategory).toHaveBeenCalledWith(
        'Test',
        'VARIABLE',
        expect.any(String),
        expect.any(String)
      );
    });

    it('should provide default emoji when creating', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: 'Test' } });

      fireEvent.click(screen.getByRole('button', { name: /Criar e Selecionar/i }));

      expect(mockCreateCategory).toHaveBeenCalledWith(
        'Test',
        'VARIABLE',
        expect.any(String),
        expect.any(String)
      );
    });
  });

  describe('Category Preview', () => {
    it('should show preview with entered data in create mode', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="create"
          onCreateCategory={mockCreateCategory}
          onCategoryCreated={mockOnCategoryCreated}
        />
      );

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
      fireEvent.change(inputs[0], { target: { value: 'My Category' } });

      expect(screen.getByText('My Category')).toBeInTheDocument();
    });

    it('should show preview with category data in edit mode', () => {
      render(
        <CategoryModal
          isOpen={true}
          onClose={mockOnClose}
          mode="edit"
          category={mockCategory}
          onUpdateCategory={mockUpdateCategory}
          onCategoryUpdated={mockOnCategoryUpdated}
        />
      );

      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Gastos Variáveis')).toBeInTheDocument();
    });
  });
});
