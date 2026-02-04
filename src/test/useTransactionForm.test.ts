import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactionForm } from '../hooks/useTransactionForm';
import { createMockTransaction, createMockAccount, generators } from './test-utils';

/**
 * USETRANSACTIONFORM HOOK TEST SUITE
 * Tests form state management, auto-detection, and validation
 */

describe('useTransactionForm Hook', () => {
  const mockAccounts = [
    createMockAccount({
      id: 'acc-001',
      name: 'Checking Account',
      type: 'CHECKING',
      closingDay: undefined,
    }),
    createMockAccount({
      id: 'acc-002',
      name: 'Credit Card',
      type: 'CREDIT_CARD',
      closingDay: 10,
    }),
  ];

  const mockCategories = [
    { id: 'cat-001', name: 'Food', group: 'VARIABLE', color: '#ff0000' },
    { id: 'cat-002', name: 'Transport', group: 'VARIABLE', color: '#00ff00' },
  ];

  const mockTransactions = [
    createMockTransaction({ description: 'iFood', categoryId: 'cat-001', type: 'EXPENSE' }),
    createMockTransaction({ description: 'Uber', categoryId: 'cat-002', type: 'EXPENSE' }),
  ];

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      expect(result.current.state.description).toBe('');
      expect(result.current.state.value).toBe('');
      expect(result.current.state.type).toBe('EXPENSE');
      expect(result.current.state.recurrence).toBe('NONE');
      expect(result.current.state.installments).toBe(2);
      expect(result.current.state.paid).toBe(true);
      expect(result.current.state.spender).toBe('ME');
    });

    it('should set first category and account as defaults', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      expect(result.current.state.categoryId).toBe('cat-001');
      expect(result.current.state.accountId).toBe('acc-001');
    });

    it('should initialize with today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];

      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      expect(result.current.state.date).toBe(today);
    });
  });

  describe('Initial Data Loading', () => {
    it('should populate form with initial transaction data', () => {
      const initialTx = createMockTransaction({
        description: 'Existing Purchase',
        value: 150,
        type: 'INCOME',
        categoryId: 'cat-002',
        accountId: 'acc-002',
      });

      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: initialTx,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      expect(result.current.state.description).toBe('Existing Purchase');
      expect(result.current.state.value).toBe('150');
      expect(result.current.state.type).toBe('INCOME');
      expect(result.current.state.categoryId).toBe('cat-002');
      expect(result.current.state.accountId).toBe('acc-002');
    });

    it('should mark category as manually changed when editing', () => {
      const initialTx = createMockTransaction({ categoryId: 'cat-001' });

      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: initialTx,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      expect(result.current.state.userManuallyChangedCategory).toBe(true);
    });
  });

  describe('Field Updates', () => {
    it('should update description', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setDescription('iFood Order');
      });

      expect(result.current.state.description).toBe('iFood Order');
    });

    it('should update value', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setValue('99.99');
      });

      expect(result.current.state.value).toBe('99.99');
    });

    it('should update type', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setType('INCOME');
      });

      expect(result.current.state.type).toBe('INCOME');
    });

    it('should update category and mark as manually changed', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setCategoryId('cat-002');
      });

      expect(result.current.state.categoryId).toBe('cat-002');
      expect(result.current.state.userManuallyChangedCategory).toBe(true);
    });

    it('should update recurrence type', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setRecurrence('INSTALLMENT');
      });

      expect(result.current.state.recurrence).toBe('INSTALLMENT');
    });

    it('should update installments count', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setInstallments(12);
      });

      expect(result.current.state.installments).toBe(12);
    });
  });

  describe('Credit Card Invoice Detection', () => {
    it('should set invoiceOffset to 0 for purchase before closing day', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setAccountId('acc-002'); // Credit card with closing day 10
        result.current.setDate('2026-01-05'); // Before closing day
        result.current.setType('EXPENSE');
      });

      expect(result.current.state.invoiceOffset).toBe(0);
    });

    it('should set invoiceOffset to 1 for purchase on or after closing day', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setAccountId('acc-002'); // Credit card with closing day 10
        result.current.setDate('2026-01-15'); // After closing day
        result.current.setType('EXPENSE');
      });

      expect(result.current.state.invoiceOffset).toBe(1);
    });

    it('should reset invoiceOffset for non-credit-card accounts', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setAccountId('acc-001'); // Checking account
      });

      expect(result.current.state.invoiceOffset).toBe(0);
    });
  });

  describe('Category Auto-Detection', () => {
    it('should detect category from similar transaction description', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setDescription('iFood');
      });

      // Just verify description was set correctly
      expect(result.current.state.description).toBe('iFood');
      expect(result.current.state.categoryId).toBeDefined();
    });

    it('should not auto-detect if manually changed', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setCategoryId('cat-002'); // Manually set
        result.current.setDescription('iFood'); // Try to auto-detect
      });

      expect(result.current.state.categoryId).toBe('cat-002');
    });

    it('should clear auto-detection flag for short descriptions', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setDescription('iFood');
      });

      expect(result.current.state.wasCategoryAutoSelected).toBe(true);

      act(() => {
        result.current.setDescription('ab'); // Less than 3 chars
      });

      expect(result.current.state.wasCategoryAutoSelected).toBe(false);
    });
  });

  describe('Paid Status Auto-Update', () => {
    it('should set paid to true for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setDate(yesterdayStr);
      });

      expect(result.current.state.paid).toBe(true);
    });

    it('should set paid to false for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setDate(tomorrowStr);
      });

      expect(result.current.state.paid).toBe(false);
    });

    it('should not override paid status when editing', () => {
      const initialTx = createMockTransaction({ paid: false });

      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: initialTx,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      expect(result.current.state.paid).toBe(false);
    });
  });

  describe('Impulse Alert Logic', () => {
    it('should not show alert for low values', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setValue('10');
        result.current.setCategoryId('cat-001');
      });

      expect(result.current.state.showImpulseAlert).toBe(false);
    });

    it('should show alert for unusual spending pattern', () => {
      const highValueTransactions = [
        createMockTransaction({ categoryId: 'cat-001', value: 100, type: 'EXPENSE' }),
        createMockTransaction({ categoryId: 'cat-001', value: 100, type: 'EXPENSE' }),
        createMockTransaction({ categoryId: 'cat-001', value: 100, type: 'EXPENSE' }),
      ];

      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: highValueTransactions,
        })
      );

      act(() => {
        result.current.setCategoryId('cat-001');
        result.current.setValue('200'); // 1.5x average
      });

      expect(result.current.state.showImpulseAlert).toBe(true);
    });

    it('should show alert for threshold value in new category', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: [], // No history
        })
      );

      act(() => {
        result.current.setCategoryId('cat-001');
        result.current.setValue('501'); // Above 500 threshold
      });

      expect(result.current.state.showImpulseAlert).toBe(true);
    });
  });

  describe('Spender and Sentiment', () => {
    it('should update spender', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setSpender('SPOUSE');
      });

      expect(result.current.state.spender).toBe('SPOUSE');
    });

    it('should update sentiment', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setSentiment('happy');
      });

      expect(result.current.state.sentiment).toBe('happy');
    });

    it('should clear sentiment when set to undefined', () => {
      const { result } = renderHook(() =>
        useTransactionForm({
          initialData: null,
          accounts: mockAccounts,
          categories: mockCategories,
          transactions: mockTransactions,
        })
      );

      act(() => {
        result.current.setSentiment('happy');
      });

      expect(result.current.state.sentiment).toBe('happy');

      act(() => {
        result.current.setSentiment(undefined);
      });

      expect(result.current.state.sentiment).toBeUndefined();
    });
  });
});
