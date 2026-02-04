import { describe, it, expect } from 'vitest';
import {
  validateTransaction,
  validateRequiredFields,
  validateDataConstraints,
  validateCategory,
  validateAccount,
  validateRecurrence,
  validateGroupIdConsistency,
  validateTransactionBatch,
  arAllTransactionsValid,
  getAllValidationErrors,
  sanitizeTransaction,
} from '../services/validationService';
import { Transaction, Account, Category } from '../types';

// Mock data
const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Nubank',
    type: 'CREDIT_CARD',
    owner: 'ME',
    balance: -1000,
    creditLimit: 5000,
  },
  {
    id: 'acc-2',
    name: 'Itaú',
    type: 'CHECKING',
    owner: 'ME',
    balance: 5000,
  },
];

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Alimentação', icon: 'fork', color: '#ef4444' },
  { id: 'cat-2', name: 'Transporte', icon: 'car', color: '#3b82f6' },
];

const validTransaction: Partial<Transaction> = {
  description: 'Compra no mercado',
  value: 150.50,
  date: new Date().toISOString(),
  type: 'EXPENSE',
  categoryId: 'cat-1',
  accountId: 'acc-1',
  recurrence: 'NONE',
  installments: 0,
  spender: 'ME',
  sentiment: 'neutral',
  paid: true,
};

describe('validationService', () => {
  describe('validateRequiredFields', () => {
    it('should pass with all required fields', () => {
      const result = validateRequiredFields(validTransaction);
      expect(result).toEqual([]);
    });

    it('should fail without description', () => {
      const tx = { ...validTransaction, description: '' };
      const result = validateRequiredFields(tx);
      expect(result).toContain('Descrição é obrigatória');
    });

    it('should fail without value', () => {
      const tx = { ...validTransaction, value: undefined };
      const result = validateRequiredFields(tx);
      expect(result).toContain('Valor deve ser maior que zero');
    });

    it('should fail with zero value', () => {
      const tx = { ...validTransaction, value: 0 };
      const result = validateRequiredFields(tx);
      expect(result).toContain('Valor deve ser maior que zero');
    });

    it('should fail without date', () => {
      const tx = { ...validTransaction, date: undefined };
      const result = validateRequiredFields(tx);
      expect(result).toContain('Data é obrigatória');
    });

    it('should fail without type', () => {
      const tx = { ...validTransaction, type: undefined };
      const result = validateRequiredFields(tx);
      expect(result).toContain('Tipo de transação inválido (INCOME ou EXPENSE)');
    });

    it('should fail with invalid type', () => {
      type PartialTransactionWithInvalidType = Omit<typeof validTransaction, 'type'> & { type: string };
      const tx: PartialTransactionWithInvalidType = { ...validTransaction, type: 'INVALID' };
      const result = validateRequiredFields(tx);
      expect(result).toContain('Tipo de transação inválido (INCOME ou EXPENSE)');
    });

    it('should fail without categoryId', () => {
      const tx = { ...validTransaction, categoryId: undefined };
      const result = validateRequiredFields(tx);
      expect(result).toContain('Categoria é obrigatória');
    });

    it('should fail without accountId', () => {
      const tx = { ...validTransaction, accountId: undefined };
      const result = validateRequiredFields(tx);
      expect(result).toContain('Conta é obrigatória');
    });
  });

  describe('validateDataConstraints', () => {
    it('should pass with valid constraints', () => {
      const result = validateDataConstraints(validTransaction);
      expect(result).toEqual([]);
    });

    it('should fail with negative value', () => {
      const tx = { ...validTransaction, value: -100 };
      const result = validateDataConstraints(tx);
      expect(result).toContain('Valor não pode ser negativo');
    });

    it('should fail with extremely large value', () => {
      const tx = { ...validTransaction, value: 1000000000 };
      const result = validateDataConstraints(tx);
      expect(result).toContain('Valor não pode exceder R$ 999.999.999');
    });

    it('should fail with invalid date', () => {
      const tx = { ...validTransaction, date: 'invalid-date' };
      const result = validateDataConstraints(tx);
      expect(result).toContain('Data inválida');
    });

    it('should fail with date too far in past', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 51);
      const tx = { ...validTransaction, date: pastDate.toISOString() };
      const result = validateDataConstraints(tx);
      expect(result).toContain('Data não pode ser anterior a 50 anos atrás');
    });

    it('should fail with date too far in future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 11);
      const tx = { ...validTransaction, date: futureDate.toISOString() };
      const result = validateDataConstraints(tx);
      expect(result).toContain('Data não pode ser superior a 10 anos no futuro');
    });

    it('should fail with description too long', () => {
      const tx = { ...validTransaction, description: 'a'.repeat(501) };
      const result = validateDataConstraints(tx);
      expect(result).toContain('Descrição não pode ter mais de 500 caracteres');
    });

    it('should fail with invalid sentiment', () => {
      type PartialTransactionWithInvalidSentiment = Omit<typeof validTransaction, 'sentiment'> & { sentiment: string };
      const tx: PartialTransactionWithInvalidSentiment = { ...validTransaction, sentiment: 'invalid' };
      const result = validateDataConstraints(tx);
      expect(result).toContain('Sentimento inválido');
    });

    it('should fail with invalid spender', () => {
      type PartialTransactionWithInvalidSpender = Omit<typeof validTransaction, 'spender'> & { spender: string };
      const tx: PartialTransactionWithInvalidSpender = { ...validTransaction, spender: 'INVALID' };
      const result = validateDataConstraints(tx);
      expect(result).toContain('Pagador inválido');
    });
  });

  describe('validateCategory', () => {
    it('should pass with valid category', () => {
      const result = validateCategory('cat-1', mockCategories);
      expect(result).toEqual([]);
    });

    it('should fail with non-existent category', () => {
      const result = validateCategory('cat-999', mockCategories);
      expect(result).toContain('Categoria com ID "cat-999" não encontrada');
    });

    it('should fail without category', () => {
      const result = validateCategory('', mockCategories);
      expect(result).toContain('Categoria é obrigatória');
    });
  });

  describe('validateAccount', () => {
    it('should pass with valid account', () => {
      const result = validateAccount('acc-1', mockAccounts);
      expect(result).toEqual([]);
    });

    it('should fail with non-existent account', () => {
      const result = validateAccount('acc-999', mockAccounts);
      expect(result).toContain('Conta com ID "acc-999" não encontrada');
    });

    it('should fail without account', () => {
      const result = validateAccount('', mockAccounts);
      expect(result).toContain('Conta é obrigatória');
    });
  });

  describe('validateRecurrence', () => {
    it('should pass with NONE recurrence', () => {
      const result = validateRecurrence('NONE', 0);
      expect(result).toEqual([]);
    });

    it('should pass with valid INSTALLMENT', () => {
      const result = validateRecurrence('INSTALLMENT', 12);
      expect(result).toEqual([]);
    });

    it('should pass with valid REPEATED', () => {
      const result = validateRecurrence('REPEATED', 6);
      expect(result).toEqual([]);
    });

    it('should fail with invalid recurrence type', () => {
      const result = validateRecurrence('INVALID', 0);
      expect(result).toContain('Tipo de recorrência inválido (NONE, INSTALLMENT ou REPEATED)');
    });

    it('should fail with installments < 2 for INSTALLMENT', () => {
      const result = validateRecurrence('INSTALLMENT', 1);
      expect(result).toContain('Número de parcelações deve ser no mínimo 2');
    });

    it('should fail with installments > 999', () => {
      const result = validateRecurrence('REPEATED', 1000);
      expect(result).toContain('Número de parcelações não pode exceder 999');
    });

    it('should fail with installments > 360 for INSTALLMENT', () => {
      const result = validateRecurrence('INSTALLMENT', 361);
      expect(result).toContain('Parcelamentos não podem exceder 360 meses (30 anos)');
    });
  });

  describe('validateGroupIdConsistency', () => {
    it('should pass without groupId', () => {
      const result = validateGroupIdConsistency([], '');
      expect(result.isValid).toBe(true);
    });

    it('should pass with consistent groupId', () => {
      const txs: Transaction[] = [
        { ...validTransaction, id: '1', groupId: 'group-1' } as Transaction,
        { ...validTransaction, id: '2', groupId: 'group-1' } as Transaction,
      ];
      const result = validateGroupIdConsistency(txs, 'group-1');
      expect(result.isValid).toBe(true);
    });

    it('should pass when no transactions have groupId', () => {
      const txs: Transaction[] = [];
      const result = validateGroupIdConsistency(txs, 'group-1');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateTransaction (main)', () => {
    it('should pass with completely valid transaction', () => {
      const result = validateTransaction(validTransaction, mockAccounts, mockCategories);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should catch multiple validation errors', () => {
      const invalidTx = {
        description: '',
        value: -100,
        categoryId: 'cat-999',
        accountId: 'acc-999',
      };
      const result = validateTransaction(invalidTx, mockAccounts, mockCategories);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateTransactionBatch', () => {
    it('should validate multiple transactions', () => {
      const transactions = [validTransaction, validTransaction];
      const results = validateTransactionBatch(transactions, mockAccounts, mockCategories);
      expect(results).toHaveLength(2);
      expect(results.every(r => r.isValid)).toBe(true);
    });

    it('should handle mixed valid/invalid transactions', () => {
      const invalidTx = { ...validTransaction, value: -100 };
      const transactions = [validTransaction, invalidTx];
      const results = validateTransactionBatch(transactions, mockAccounts, mockCategories);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
    });
  });

  describe('arAllTransactionsValid', () => {
    it('should return true if all valid', () => {
      const transactions = [validTransaction, validTransaction];
      const result = arAllTransactionsValid(transactions, mockAccounts, mockCategories);
      expect(result).toBe(true);
    });

    it('should return false if any invalid', () => {
      const invalidTx = { ...validTransaction, value: -100 };
      const transactions = [validTransaction, invalidTx];
      const result = arAllTransactionsValid(transactions, mockAccounts, mockCategories);
      expect(result).toBe(false);
    });
  });

  describe('getAllValidationErrors', () => {
    it('should return errors by index', () => {
      const invalidTx = { ...validTransaction, value: -100 };
      const transactions = [validTransaction, invalidTx, validTransaction];
      const errors = getAllValidationErrors(transactions, mockAccounts, mockCategories);
      expect(errors[1]).toBeDefined();
      expect(errors[0]).toBeUndefined();
      expect(errors[2]).toBeUndefined();
    });
  });

  describe('sanitizeTransaction', () => {
    it('should trim description', () => {
      const tx = { ...validTransaction, description: '  test  ' };
      const result = sanitizeTransaction(tx);
      expect(result.description).toBe('test');
    });

    it('should make value absolute', () => {
      const tx = { ...validTransaction, value: -100 };
      const result = sanitizeTransaction(tx);
      expect(result.value).toBe(100);
    });

    it('should handle missing value', () => {
      const tx = { ...validTransaction, value: undefined };
      const result = sanitizeTransaction(tx);
      expect(result.value).toBe(0);
    });
  });
});
