import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { cardInvoiceService } from '../services/cardInvoiceService';
import { InvoiceStatus, InstallmentStatus } from '../types/creditCard';
import * as retryService from '../services/retryService';

// Mock retry service
vi.mock('../services/retryService', () => ({
  retryWithBackoff: vi.fn(async (operation) => operation()),
  detectErrorType: vi.fn(),
  isRetryable: vi.fn()
}));

// Mock error recovery
vi.mock('../services/errorRecovery', () => ({
  errorRecovery: {
    captureContext: vi.fn(() => ({})),
    logError: vi.fn()
  }
}));

describe('cardInvoiceService', () => {
  beforeEach(() => {
    cardInvoiceService.invalidateCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cardInvoiceService.invalidateCache();
  });

  describe('fetchCardInvoices', () => {
    it('should fetch and return mock invoices when Supabase is unavailable', async () => {
      const cardId = 'card_123';
      const result = await cardInvoiceService.fetchCardInvoices({ cardId, months: 12 });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(12);
      expect(result[0].cardId).toBe(cardId);
    });

    it('should return invoices with correct structure', async () => {
      const cardId = 'card_123';
      const result = await cardInvoiceService.fetchCardInvoices({ cardId, months: 3 });

      expect(result.length).toBe(3);

      result.forEach(invoice => {
        expect(invoice.id).toBeDefined();
        expect(invoice.cardId).toBe(cardId);
        expect(invoice.invoiceNumber).toBeDefined();
        expect(invoice.dueDate).toBeDefined();
        expect(invoice.amount).toBeGreaterThan(0);
        expect(invoice.status).toMatch(/open|pending|paid|overdue|closed/);
        expect(Array.isArray(invoice.installments)).toBe(true);
        expect(Array.isArray(invoice.futureInstallments)).toBe(true);
      });
    });

    it('should respect months parameter', async () => {
      const cardId = 'card_123';

      const result6 = await cardInvoiceService.fetchCardInvoices({ cardId, months: 6 });
      expect(result6.length).toBe(6);

      const result3 = await cardInvoiceService.fetchCardInvoices({ cardId, months: 3 });
      expect(result3.length).toBe(3);
    });

    it('should use default 12 months when not specified', async () => {
      const cardId = 'card_123';
      const result = await cardInvoiceService.fetchCardInvoices({ cardId });

      expect(result.length).toBe(12);
    });
  });

  describe('Caching', () => {
    it('should cache invoice data', async () => {
      const cardId = 'card_123';
      const params = { cardId, months: 12 };

      const result1 = await cardInvoiceService.fetchCardInvoices(params);
      const cached = cardInvoiceService.getCachedInvoices(cardId, 12);

      expect(cached).toBeDefined();
      expect(cached).toEqual(result1);
    });

    it('should return cached data on subsequent requests', async () => {
      const cardId = 'card_123';
      const params = { cardId, months: 12 };

      const result1 = await cardInvoiceService.fetchCardInvoices(params);
      const result2 = await cardInvoiceService.fetchCardInvoices(params);

      expect(result1).toEqual(result2);
      expect(result1).toBe(result2); // Same reference
    });

    it('should have different cache entries for different months', async () => {
      const cardId = 'card_123';

      const result6 = await cardInvoiceService.fetchCardInvoices({ cardId, months: 6 });
      const result12 = await cardInvoiceService.fetchCardInvoices({ cardId, months: 12 });

      expect(result6.length).toBe(6);
      expect(result12.length).toBe(12);

      const stats = cardInvoiceService.getCacheStats();
      expect(stats.size).toBe(2);
    });

    it('should invalidate cache for specific card', async () => {
      const cardId = 'card_123';
      const params = { cardId, months: 12 };

      await cardInvoiceService.fetchCardInvoices(params);
      expect(cardInvoiceService.getCachedInvoices(cardId, 12)).toBeDefined();

      cardInvoiceService.invalidateCache(cardId);
      expect(cardInvoiceService.getCachedInvoices(cardId, 12)).toBeNull();
    });

    it('should clear entire cache when no cardId provided', async () => {
      const cardId1 = 'card_123';
      const cardId2 = 'card_456';

      await cardInvoiceService.fetchCardInvoices({ cardId: cardId1, months: 12 });
      await cardInvoiceService.fetchCardInvoices({ cardId: cardId2, months: 12 });

      expect(cardInvoiceService.getCacheStats().size).toBe(2);

      cardInvoiceService.invalidateCache();
      expect(cardInvoiceService.getCacheStats().size).toBe(0);
    });

    it('should return null for uncached invoices', async () => {
      const cached = cardInvoiceService.getCachedInvoices('card_999', 12);
      expect(cached).toBeNull();
    });
  });

  describe('Calculations', () => {
    it('should calculate total amount owed', async () => {
      const cardId = 'card_123';
      const invoices = await cardInvoiceService.fetchCardInvoices({ cardId, months: 3 });

      const totalOwed = cardInvoiceService.calculateTotalOwed(invoices);

      expect(totalOwed).toBeGreaterThanOrEqual(0);

      // Verify calculation
      const expectedTotal = invoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
      expect(totalOwed).toBe(expectedTotal);
    });

    it('should return 0 for empty invoice array', () => {
      const totalOwed = cardInvoiceService.calculateTotalOwed([]);
      expect(totalOwed).toBe(0);
    });

    it('should get open invoices', async () => {
      const cardId = 'card_123';
      const invoices = await cardInvoiceService.fetchCardInvoices({ cardId, months: 12 });

      const openInvoices = cardInvoiceService.getOpenInvoices(invoices);

      expect(openInvoices.length).toBeGreaterThan(0);
      openInvoices.forEach(inv => {
        expect([InvoiceStatus.OPEN, InvoiceStatus.PENDING]).toContain(inv.status);
      });
    });

    it('should get overdue invoices', async () => {
      const cardId = 'card_123';
      const invoices = await cardInvoiceService.fetchCardInvoices({ cardId, months: 12 });

      const overdueInvoices = cardInvoiceService.getOverdueInvoices(invoices);

      // Verify overdue invoices have past due dates
      const today = new Date();
      overdueInvoices.forEach(inv => {
        const dueDate = new Date(inv.dueDate);
        expect(dueDate.getTime()).toBeLessThan(today.getTime());
      });
    });

    it('should calculate total owed correctly with paid amounts', async () => {
      const cardId = 'card_123';
      const invoices = await cardInvoiceService.fetchCardInvoices({ cardId, months: 1 });

      const totalOwed = cardInvoiceService.calculateTotalOwed(invoices);
      const manualSum = invoices.reduce((sum, inv) => {
        return sum + (inv.amount - inv.paidAmount);
      }, 0);

      expect(totalOwed).toBe(manualSum);
    });
  });

  describe('Cache Statistics', () => {
    it('should report correct cache statistics', async () => {
      const cardId1 = 'card_123';
      const cardId2 = 'card_456';

      await cardInvoiceService.fetchCardInvoices({ cardId: cardId1, months: 6 });
      await cardInvoiceService.fetchCardInvoices({ cardId: cardId1, months: 12 });
      await cardInvoiceService.fetchCardInvoices({ cardId: cardId2, months: 12 });

      const stats = cardInvoiceService.getCacheStats();

      expect(stats.size).toBe(3);
      expect(Array.isArray(stats.entries)).toBe(true);
      expect(stats.entries.length).toBe(3);
    });

    it('should include entry keys in statistics', async () => {
      const cardId = 'card_123';
      await cardInvoiceService.fetchCardInvoices({ cardId, months: 12 });

      const stats = cardInvoiceService.getCacheStats();

      expect(stats.entries.some(entry => entry.includes('card_123'))).toBe(true);
      expect(stats.entries.some(entry => entry.includes('12'))).toBe(true);
    });
  });

  describe('Configuration Options', () => {
    it('should accept custom configuration', async () => {
      const cardId = 'card_123';
      const customConfig = {
        cacheTTL: 7200000, // 2 hours
        maxRetries: 5,
        timeoutMs: 10000
      };

      const result = await cardInvoiceService.fetchCardInvoices(
        { cardId, months: 3 },
        customConfig
      );

      expect(result).toBeDefined();
      expect(result.length).toBe(3);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across multiple fetches', async () => {
      const cardId = 'card_123';
      const params = { cardId, months: 6 };

      const result1 = await cardInvoiceService.fetchCardInvoices(params);
      const result2 = await cardInvoiceService.fetchCardInvoices(params);

      expect(result1.length).toBe(result2.length);
      result1.forEach((inv, idx) => {
        expect(inv.id).toBe(result2[idx].id);
        expect(inv.amount).toBe(result2[idx].amount);
      });
    });

    it('should have invoices in descending date order', async () => {
      const cardId = 'card_123';
      const invoices = await cardInvoiceService.fetchCardInvoices({ cardId, months: 12 });

      for (let i = 0; i < invoices.length - 1; i++) {
        const date1 = new Date(invoices[i].statementDate);
        const date2 = new Date(invoices[i + 1].statementDate);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    });
  });

  describe('Type Safety', () => {
    it('should return properly typed invoice objects', async () => {
      const cardId = 'card_123';
      const invoices = await cardInvoiceService.fetchCardInvoices({ cardId, months: 1 });

      const invoice = invoices[0];

      expect(typeof invoice.id).toBe('string');
      expect(typeof invoice.cardId).toBe('string');
      expect(typeof invoice.amount).toBe('number');
      expect(typeof invoice.paidAmount).toBe('number');
      expect(typeof invoice.status).toBe('string');
      expect(Array.isArray(invoice.installments)).toBe(true);
      expect(Array.isArray(invoice.futureInstallments)).toBe(true);
    });

    it('should have valid status values', async () => {
      const cardId = 'card_123';
      const invoices = await cardInvoiceService.fetchCardInvoices({ cardId, months: 3 });

      const validStatuses = Object.values(InvoiceStatus);

      invoices.forEach(inv => {
        expect(validStatuses).toContain(inv.status);
      });
    });
  });
});
