import { describe, it, expect } from 'vitest';
import {
  getInvoiceValue,
  calculateLimitUsage,
  findNextDueCard,
  calculateDaysUntilDue,
  getRecentCardTransactions,
  getCardCategoryData,
  getAccountTypeLabel,
  calculateCardBalance,
  validateAccountData,
  calculateCardStatistics,
  getNextDueDateInfo,
} from '../services/accountService';
import { Account, Transaction, Category, AccountOwner } from '../types';

// Mock data
const mockToday = new Date('2026-02-02');

const mockCategories: Category[] = [
  { id: '1', name: 'Alimentação', icon: 'fork', color: '#ef4444' },
  { id: '2', name: 'Transporte', icon: 'car', color: '#3b82f6' },
  { id: '3', name: 'Transferências', icon: 'send', color: '#10b981' },
];

const mockCreditCards: Account[] = [
  {
    id: 'card-1',
    name: 'Nubank',
    type: 'CREDIT_CARD',
    owner: 'ME',
    balance: -1500,
    creditLimit: 5000,
    lastFourDigits: '1234',
    network: 'MASTERCARD',
    dueDay: 10,
    closingDay: 5,
    color: '#8b5cf6',
  },
  {
    id: 'card-2',
    name: 'Inter',
    type: 'CREDIT_CARD',
    owner: 'ME',
    balance: -2000,
    creditLimit: 8000,
    lastFourDigits: '5678',
    network: 'VISA',
    dueDay: 20,
    closingDay: 15,
    color: '#f97316',
  },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    accountId: 'card-1',
    description: 'Restaurante',
    value: 150,
    date: new Date('2026-02-01').toISOString(),
    type: 'EXPENSE',
    categoryId: '1',
  },
  {
    id: '2',
    accountId: 'card-1',
    description: 'Uber',
    value: 50,
    date: new Date('2026-02-02').toISOString(),
    type: 'EXPENSE',
    categoryId: '2',
  },
  {
    id: '3',
    accountId: 'card-2',
    description: 'Supermercado',
    value: 300,
    date: new Date('2026-02-02').toISOString(),
    type: 'EXPENSE',
    categoryId: '1',
  },
  {
    id: '4',
    accountId: 'card-1',
    description: 'Salário',
    value: 5000,
    date: new Date('2026-02-02').toISOString(),
    type: 'INCOME',
    categoryId: '3',
  },
];

describe('accountService', () => {
  describe('getInvoiceValue', () => {
    it('should calculate invoice value for current month', () => {
      const value = getInvoiceValue('card-1', mockTransactions);
      expect(value).toBe(200); // 150 + 50
    });

    it('should return 0 for card with no expenses', () => {
      const value = getInvoiceValue('card-3', mockTransactions);
      expect(value).toBe(0);
    });

    it('should not include income transactions', () => {
      const value = getInvoiceValue('card-1', mockTransactions);
      expect(value).toBe(200); // excludes 5000 income
    });

    it('should filter by current month and year', () => {
      const januaryTransaction: Transaction = {
        id: '5',
        accountId: 'card-1',
        description: 'January expense',
        value: 1000,
        date: new Date('2026-01-15').toISOString(),
        type: 'EXPENSE',
        categoryId: '1',
      };

      const value = getInvoiceValue('card-1', [
        ...mockTransactions,
        januaryTransaction,
      ]);
      expect(value).toBe(200); // January transaction excluded
    });
  });

  describe('calculateLimitUsage', () => {
    it('should calculate usage percentage', () => {
      const usage = calculateLimitUsage(2500, 10000);
      expect(usage).toBe(25);
    });

    it('should return 0 when limit is 0', () => {
      const usage = calculateLimitUsage(500, 0);
      expect(usage).toBe(0);
    });

    it('should handle 100% usage', () => {
      const usage = calculateLimitUsage(5000, 5000);
      expect(usage).toBe(100);
    });
  });

  describe('findNextDueCard', () => {
    it('should find next due card by date', () => {
      const next = findNextDueCard(mockCreditCards, mockToday);
      expect(next?.id).toBe('card-1'); // day 10 is before day 20
    });

    it('should skip cards without due day', () => {
      const cardsWithoutDue: Account[] = [
        { ...mockCreditCards[0], dueDay: undefined },
        mockCreditCards[1],
      ];
      const next = findNextDueCard(cardsWithoutDue, mockToday);
      expect(next?.id).toBe('card-2');
    });

    it('should return undefined if no cards have due day', () => {
      const cardsWithoutDue: Account[] = mockCreditCards.map(c => ({
        ...c,
        dueDay: undefined,
      }));
      const next = findNextDueCard(cardsWithoutDue, mockToday);
      expect(next).toBeUndefined();
    });

    it('should handle next month when due date passed', () => {
      const futureDateToday = new Date('2026-02-25');
      const next = findNextDueCard(mockCreditCards, futureDateToday);
      // Day 10 next month is closer than day 20
      expect(next?.id).toBe('card-1');
    });
  });

  describe('calculateDaysUntilDue', () => {
    it('should calculate days until due date', () => {
      const days = calculateDaysUntilDue(10, mockToday);
      expect(days).toBe(8); // Feb 10 - Feb 2 = 8 days
    });

    it('should return 0 for undefined due day', () => {
      const days = calculateDaysUntilDue(undefined, mockToday);
      expect(days).toBe(0);
    });

    it('should calculate for next month if due day passed', () => {
      const futureDateToday = new Date('2026-02-15');
      const days = calculateDaysUntilDue(10, futureDateToday);
      expect(days).toBe(23); // Mar 10 - Feb 15
    });
  });

  describe('getRecentCardTransactions', () => {
    it('should return recent card transactions', () => {
      const recent = getRecentCardTransactions(
        ['card-1', 'card-2'],
        mockTransactions
      );
      expect(recent).toHaveLength(3);
      expect(recent[0].id).toBe('3'); // most recent
    });

    it('should not include income transactions', () => {
      const recent = getRecentCardTransactions(
        ['card-1', 'card-2'],
        mockTransactions
      );
      expect(recent.every(t => t.type === 'EXPENSE')).toBe(true);
    });

    it('should respect limit parameter', () => {
      const recent = getRecentCardTransactions(
        ['card-1', 'card-2'],
        mockTransactions,
        2
      );
      expect(recent).toHaveLength(2);
    });

    it('should return empty array for empty card list', () => {
      const recent = getRecentCardTransactions([], mockTransactions);
      expect(recent).toHaveLength(0);
    });
  });

  describe('getCardCategoryData', () => {
    it('should group expenses by category', () => {
      const data = getCardCategoryData(
        ['card-1', 'card-2'],
        mockTransactions,
        mockCategories,
        mockToday
      );
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].value).toBeGreaterThanOrEqual(data[1]?.value || 0);
    });

    it('should include category color and icon', () => {
      const data = getCardCategoryData(
        ['card-1'],
        mockTransactions,
        mockCategories,
        mockToday
      );
      expect(data.some(d => d.color)).toBe(true);
      expect(data.some(d => d.icon)).toBe(true);
    });

    it('should not include income transactions', () => {
      const data = getCardCategoryData(
        ['card-1'],
        mockTransactions,
        mockCategories,
        mockToday
      );
      const totalValue = data.reduce((acc, d) => acc + d.value, 0);
      expect(totalValue).toBe(200); // only expenses
    });

    it('should limit to top 3 categories', () => {
      const manyTransactions: Transaction[] = [
        ...mockTransactions,
        {
          id: '6',
          accountId: 'card-1',
          description: 'Test',
          value: 100,
          date: new Date('2026-02-02').toISOString(),
          type: 'EXPENSE',
          categoryId: '3',
        },
      ];
      const data = getCardCategoryData(
        ['card-1'],
        manyTransactions,
        mockCategories,
        mockToday
      );
      expect(data.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getAccountTypeLabel', () => {
    it('should return correct labels', () => {
      expect(getAccountTypeLabel('CHECKING')).toBe('Conta Corrente');
      expect(getAccountTypeLabel('CREDIT_CARD')).toBe('Cartão de Crédito');
      expect(getAccountTypeLabel('CASH')).toBe('Dinheiro');
      expect(getAccountTypeLabel('INVESTMENT')).toBe('Investimento');
    });
  });

  describe('calculateCardBalance', () => {
    it('should calculate card balance correctly', () => {
      const balance = calculateCardBalance(mockCreditCards[0]);
      expect(balance.used).toBe(1500);
      expect(balance.available).toBe(3500);
      expect(balance.percent).toBe(30);
    });

    it('should handle 0 limit', () => {
      const card = { ...mockCreditCards[0], creditLimit: 0 };
      const balance = calculateCardBalance(card);
      expect(balance.percent).toBe(0);
    });

    it('should handle negative balance', () => {
      const card = { ...mockCreditCards[0], balance: -500 };
      const balance = calculateCardBalance(card);
      expect(balance.used).toBe(500);
    });
  });

  describe('validateAccountData', () => {
    it('should validate valid account', () => {
      const result = validateAccountData({
        name: 'Nubank',
        type: 'CREDIT_CARD',
        creditLimit: 5000,
        dueDay: 10,
        closingDay: 5,
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty name', () => {
      const result = validateAccountData({
        name: '',
        type: 'CREDIT_CARD',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Nome'))).toBe(true);
    });

    it('should validate credit card required fields', () => {
      const result = validateAccountData({
        name: 'Test',
        type: 'CREDIT_CARD',
        creditLimit: 0,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Limite'))).toBe(true);
    });

    it('should validate due day range', () => {
      const result = validateAccountData({
        name: 'Test',
        type: 'CREDIT_CARD',
        creditLimit: 5000,
        dueDay: 32,
        closingDay: 5,
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('vencimento'))).toBe(true);
    });
  });

  describe('calculateCardStatistics', () => {
    it('should calculate correct statistics', () => {
      const stats = calculateCardStatistics(mockCreditCards, mockTransactions);
      expect(stats.totalInvoices).toBe(500); // 200 + 300
      expect(stats.totalLimit).toBe(13000); // 5000 + 8000
      expect(stats.totalAvailable).toBe(12500); // 13000 - 500
      expect(stats.limitUsage).toBeCloseTo(3.85, 1);
    });

    it('should handle empty credit cards', () => {
      const stats = calculateCardStatistics([], mockTransactions);
      expect(stats.totalInvoices).toBe(0);
      expect(stats.totalLimit).toBe(0);
      expect(stats.totalAvailable).toBe(0);
      expect(stats.limitUsage).toBe(0);
    });
  });

  describe('getNextDueDateInfo', () => {
    it('should return display and days for valid card', () => {
      const info = getNextDueDateInfo(mockCreditCards[0], mockToday);
      expect(info.display).toBe('Dia 10');
      expect(info.daysUntil).toBe(8);
    });

    it('should return default when card is undefined', () => {
      const info = getNextDueDateInfo(undefined, mockToday);
      expect(info.display).toBe('Sem faturas');
      expect(info.daysUntil).toBe(0);
    });

    it('should return default when due day is undefined', () => {
      const card = { ...mockCreditCards[0], dueDay: undefined };
      const info = getNextDueDateInfo(card, mockToday);
      expect(info.display).toBe('Sem faturas');
      expect(info.daysUntil).toBe(0);
    });
  });
});
