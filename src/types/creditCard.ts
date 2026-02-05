/**
 * Credit Card Invoice Types & Interfaces
 *
 * Complete type definitions for STY-058 (Card Invoice Service)
 * and STY-060 (Current & Future Installments Display)
 *
 * Organized for type safety, validation, and API contracts
 */

// ============================================================================
// 1. ENUMS - Status & Classification
// ============================================================================

/**
 * Invoice Status
 * - OPEN: Invoice issued, payment due
 * - PAID: All items paid
 * - PARTIAL: Some items paid
 * - OVERDUE: Past due date, unpaid
 */
export enum InvoiceStatus {
  OPEN = 'OPEN',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE'
}

/**
 * Installment Status
 * - PENDING: Unpaid, before due date
 * - PAID: Successfully paid
 * - OVERDUE: Past due date, unpaid
 * - CANCELLED: Voided/refunded
 */
export enum InstallmentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

/**
 * Invoice Source (data origin)
 */
export enum InvoiceSource {
  MANUAL = 'manual',
  CSV = 'csv',
  API = 'api',
  AUTO_SYNC = 'auto_sync'
}

// ============================================================================
// 2. MAIN INTERFACES
// ============================================================================

/**
 * CardInvoice - Monthly credit card invoice
 * One record per card per month
 */
export interface CardInvoice {
  // Primary Identifiers
  id: string;
  userId: string;
  cardId: string;

  // Invoice Identifiers
  invoiceNumber: string;
  invoiceDate: Date;
  closingDate: Date;
  dueDate: Date;

  // Amounts
  totalAmount: number;
  paidAmount: number;
  pendingAmount?: number;

  // Status
  status: InvoiceStatus;
  source: InvoiceSource;

  // Summary
  totalInstallments: number;
  paidInstallments: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  paidAt?: Date;
  deletedAt?: Date;
}

/**
 * CardInvoiceItem / Installment - Line item within invoice
 */
export interface Installment {
  id: string;
  invoiceId: string;
  userId: string;
  cardId: string;
  transactionId?: string;
  categoryId?: string;

  // Installment details
  installmentNumber: number;
  totalInstallments: number;
  originalTransactionDate?: Date;

  // Content
  description: string;
  amount: number;
  dueDate: Date;

  // Status
  status: InstallmentStatus;
  paidAmount: number;
  paidDate?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Legacy name - kept for backward compatibility
 * @deprecated Use Installment instead
 */
export type CardInvoiceItem = Installment;

// ============================================================================
// 3. COMPOSITE/DERIVED INTERFACES
// ============================================================================

/**
 * CardInvoiceSummary - Invoice with computed fields
 */
export interface CardInvoiceSummary extends CardInvoice {
  itemCount: number;
  paidItems: number;
  lastItemDueDate: Date;
  paidPercentage: number;
}

/**
 * FutureInstallment - Grouped by due date
 */
export interface FutureInstallment {
  dueDate: Date;
  totalAmount: number;
  cardId: string;
  cardName: string;
  cardLastFour?: string;
  items: Installment[];
  itemCount: number;
}

/**
 * InstallmentRecommendation - Statistical analysis
 */
export interface InstallmentRecommendation {
  medianInstallment: number;
  averageInstallment: number;
  maxInstallment: number;
  minInstallment: number;
  stdDeviation: number;
  totalInstallments: number;
  percentileQ1: number;
  percentileQ3: number;
  samplePeriodMonths: number;
}

/**
 * MonthlySpendingSummary
 */
export interface MonthlySpendingSummary {
  month: Date;
  numInvoices: number;
  totalSpent: number;
  totalPaid: number;
  totalPending: number;
  avgInvoiceAmount: number;
}

/**
 * OverdueItem - Past due item
 */
export interface OverdueItem {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  cardId: string;
  cardName: string;
  cardLastFour?: string;
  daysOverdue: number;
  severity: 'ALERT' | 'WARNING' | 'CRITICAL';
}

/**
 * Sync result
 */
export interface InvoiceSyncResult {
  invoicesCreated: number;
  invoicesUpdated: number;
  itemsCreated: number;
  itemsUpdated: number;
  errors: string[];
  timestamp: Date;
  source: InvoiceSource;
  success: boolean;
}

// ============================================================================
// 4. QUERY PARAMETERS
// ============================================================================

export interface FetchCardInvoicesParams {
  cardId: string;
  months?: number;
  includeHistory?: boolean;
}

export interface CardInvoiceFilters {
  cardId?: string;
  status?: InvoiceStatus;
  dateFrom?: Date;
  dateTo?: Date;
  source?: InvoiceSource;
  limit?: number;
  offset?: number;
}

// ============================================================================
// 5. CACHE & CONFIG
// ============================================================================

export interface CardInvoiceCacheEntry {
  data: CardInvoice[];
  timestamp: number;
  ttl: number;
}

export interface CardInvoiceServiceConfig {
  cacheTTL?: number;
  maxRetries?: number;
  timeoutMs?: number;
}

// ============================================================================
// 6. CONSTANTS
// ============================================================================

export const DEFAULT_INVOICE_STATUS = InvoiceStatus.OPEN;
export const DEFAULT_CACHE_TTL = 3600000; // 1 hour in milliseconds

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.OPEN]: '#fbbf24',
  [InvoiceStatus.PAID]: '#10b981',
  [InvoiceStatus.PARTIAL]: '#8b5cf6',
  [InvoiceStatus.OVERDUE]: '#ef4444'
};

export const INSTALLMENT_STATUS_COLORS: Record<InstallmentStatus, string> = {
  [InstallmentStatus.PENDING]: '#3b82f6',
  [InstallmentStatus.PAID]: '#10b981',
  [InstallmentStatus.OVERDUE]: '#ef4444',
  [InstallmentStatus.CANCELLED]: '#9ca3af'
};
