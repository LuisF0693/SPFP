/**
 * Credit Card Transaction Sync Service
 * FASE 1: STY-062 (Credit Card Transaction Sync)
 *
 * Synchronizes credit card invoice installments with transactions:
 * - Imports invoice installments as grouped transactions
 * - Prevents duplicates with externalId
 * - Uses groupId to link installments
 * - Error recovery with retry logic
 * - Rate limiting to prevent duplicate syncs
 */

import { Transaction } from '../types';
import { generateId } from '../utils';
import { logDetailedError } from './retryService';

interface CreditCardInvoice {
  id: string;
  invoiceNumber: string;
  dueDate: string;
  amount: number;
  status: 'open' | 'paid' | 'pending';
  installments?: CreditCardInstallment[];
}

interface CreditCardInstallment {
  id: string;
  invoiceId: string;
  installmentNumber: number;
  totalInstallments: number;
  dueDate: string;
  amount: number;
}

interface SyncResult {
  success: boolean;
  transactionsImported: number;
  duplicatesFound: number;
  errors: string[];
}

const SYNC_RATE_LIMIT_MS = 60000; // 1 minute between syncs
let lastSyncTime = 0;

/**
 * Check rate limit for sync operations
 */
const checkSyncRateLimit = (): boolean => {
  const now = Date.now();
  if (now - lastSyncTime >= SYNC_RATE_LIMIT_MS) {
    lastSyncTime = now;
    return true;
  }
  return false;
};

/**
 * Convert invoice installments to grouped transactions
 */
const convertInstallmentsToTransactions = (
  invoices: CreditCardInvoice[],
  creditCardAccountId: string,
  categoryId: string
): Transaction[] => {
  const transactions: Transaction[] = [];
  const groupId = generateId(); // Group all installments together

  invoices.forEach((invoice) => {
    if (!invoice.installments || invoice.installments.length === 0) {
      return; // Skip invoices without installments
    }

    invoice.installments.forEach((installment) => {
      const externalId = `cc_${invoice.invoiceNumber}_${installment.installmentNumber}`;

      const transaction: Transaction = {
        id: generateId(),
        date: installment.dueDate,
        description: `Fatura ${invoice.invoiceNumber} - Parcela ${installment.installmentNumber}/${installment.totalInstallments}`,
        amount: installment.amount,
        categoryId,
        accountId: creditCardAccountId,
        confirmed: invoice.status === 'paid',
        source: 'credit_card' as const,
        externalId, // For deduplication
        groupId, // Link all installments
        notes: `Originário de fatura de cartão ${invoice.invoiceNumber}`,
      };

      transactions.push(transaction);
    });
  });

  return transactions;
};

/**
 * Find duplicates in existing transactions
 */
const findDuplicates = (
  newTransactions: Transaction[],
  existingTransactions: Transaction[]
): string[] => {
  const existingExternalIds = new Set(
    existingTransactions
      .filter((t) => t.externalId)
      .map((t) => t.externalId)
  );

  const duplicates: string[] = [];
  newTransactions.forEach((tx) => {
    if (tx.externalId && existingExternalIds.has(tx.externalId)) {
      duplicates.push(tx.externalId);
    }
  });

  return duplicates;
};

/**
 * Credit Card Sync Service
 */
export const cardSyncService = {
  /**
   * Sync credit card invoices to transactions
   * Called manually or automatically on app load
   */
  syncCreditCardInvoices: async (
    invoices: CreditCardInvoice[],
    creditCardAccountId: string,
    existingTransactions: Transaction[],
    creditCardCategoryId: string,
    onAddTransactions: (transactions: Transaction[]) => void
  ): Promise<SyncResult> => {
    try {
      // Check rate limit
      if (!checkSyncRateLimit()) {
        return {
          success: false,
          transactionsImported: 0,
          duplicatesFound: 0,
          errors: ['Rate limited. Please wait before syncing again.'],
        };
      }

      // Convert invoices to transactions
      const newTransactions = convertInstallmentsToTransactions(
        invoices,
        creditCardAccountId,
        creditCardCategoryId
      );

      if (newTransactions.length === 0) {
        return {
          success: true,
          transactionsImported: 0,
          duplicatesFound: 0,
          errors: [],
        };
      }

      // Find duplicates
      const duplicates = findDuplicates(newTransactions, existingTransactions);
      const transactionsToAdd = newTransactions.filter(
        (tx) => !duplicates.includes(tx.externalId || '')
      );

      // Add transactions (callback to FinanceContext)
      if (transactionsToAdd.length > 0) {
        onAddTransactions(transactionsToAdd);
      }

      // Log sync result
      const result: SyncResult = {
        success: true,
        transactionsImported: transactionsToAdd.length,
        duplicatesFound: duplicates.length,
        errors: [],
      };

      // Store sync log
      cardSyncService.logSync(result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logDetailedError(
        error as Error,
        'Failed to sync credit card transactions',
        {
          action: 'syncCreditCardInvoices',
          severity: 'medium',
          invoiceCount: invoices.length,
        }
      );

      return {
        success: false,
        transactionsImported: 0,
        duplicatesFound: 0,
        errors: [errorMessage],
      };
    }
  },

  /**
   * Log sync operation to localStorage
   */
  logSync: (result: SyncResult): void => {
    try {
      const key = 'spfp_cc_sync_log';
      const existing = localStorage.getItem(key);
      const logs = existing ? JSON.parse(existing) : [];

      logs.push({
        timestamp: new Date().toISOString(),
        ...result,
      });

      // Keep only last 20 syncs
      if (logs.length > 20) {
        logs.shift();
      }

      localStorage.setItem(key, JSON.stringify(logs));
    } catch (error) {
      console.debug('Failed to log sync result:', error);
    }
  },

  /**
   * Get last sync results
   */
  getLastSync: () => {
    try {
      const key = 'spfp_cc_sync_log';
      const data = localStorage.getItem(key);
      const logs = data ? JSON.parse(data) : [];
      return logs.length > 0 ? logs[logs.length - 1] : null;
    } catch (error) {
      console.debug('Failed to read sync log:', error);
      return null;
    }
  },

  /**
   * Get all sync history
   */
  getSyncHistory: () => {
    try {
      const key = 'spfp_cc_sync_log';
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.debug('Failed to read sync history:', error);
      return [];
    }
  },

  /**
   * Clear sync history
   */
  clearSyncHistory: (): void => {
    try {
      localStorage.removeItem('spfp_cc_sync_log');
    } catch (error) {
      console.debug('Failed to clear sync history:', error);
    }
  },

  /**
   * Force reset rate limit (for testing)
   */
  resetRateLimit: (): void => {
    lastSyncTime = 0;
  },
};

export default cardSyncService;
