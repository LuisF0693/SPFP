/**
 * Credit Card & Invoice Types
 * Defines structures for credit card invoices and related data
 */

export enum InvoiceStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PENDING = 'pending'
}

export enum InstallmentStatus {
  PENDING = 'pending',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export interface Installment {
  id: string;
  invoiceId: string;
  installmentNumber: number;
  totalInstallments: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: InstallmentStatus;
  paidDate?: string;
}

export interface CardInvoice {
  id: string;
  cardId: string;
  invoiceNumber: string;
  dueDate: string;
  statementDate: string;
  amount: number;
  paidAmount: number;
  minimumPayment: number;
  status: InvoiceStatus;
  installments: Installment[];
  futureInstallments: Installment[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  paidAt?: string;
}

export interface FetchCardInvoicesParams {
  cardId: string;
  months?: number; // Default: 12
  includeHistory?: boolean; // Include past invoices
}

export interface CardInvoiceCacheEntry {
  data: CardInvoice[];
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CardInvoiceServiceConfig {
  cacheTTL?: number; // Default: 3600000 (1 hour)
  maxRetries?: number; // Default: 3
  timeoutMs?: number; // Default: 5000
}

export const DEFAULT_INVOICE_STATUS = InvoiceStatus.OPEN;
export const DEFAULT_CACHE_TTL = 3600000; // 1 hour in milliseconds
