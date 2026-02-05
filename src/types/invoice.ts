/**
 * Credit Card Invoice Type Definitions
 * FASE 1: STY-058 to STY-062 (Credit Card Invoices)
 *
 * Defines types for invoice tracking, payments, and installments
 */

/**
 * Invoice status lifecycle
 * OPEN: Invoice created, no payment yet
 * PARTIAL: Some amount paid, balance remaining
 * PAID: Full invoice paid but not closed
 * OVERDUE: Due date passed, still unpaid
 * CLOSED: Archived, no longer active
 */
export type InvoiceStatus = 'OPEN' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CLOSED';

/**
 * Invoice source: where it came from
 * MANUAL: User entered manually
 * API: Fetched from credit card API/provider
 * IMPORTED: Imported from CSV/file
 */
export type InvoiceSource = 'MANUAL' | 'API' | 'IMPORTED';

/**
 * Credit card invoice: Aggregated charges for a billing cycle
 */
export interface CardInvoice {
  id: string;
  user_id: string;
  card_id: string; // Reference to credit card in accounts table
  card_name?: string; // e.g., "Nubank", "Santander"
  card_last_four?: string; // e.g., "1234"
  invoice_date: string; // ISO date: when charges period started
  due_date: string; // ISO date: payment deadline
  opening_date?: string; // ISO date: when charges period opened
  total_amount: number; // Sum of all charges in this invoice
  paid_amount: number; // Amount paid so far
  status: InvoiceStatus;
  payment_date?: string; // ISO timestamp: when payment was made
  minimum_payment?: number; // Credit card minimum payment requirement
  notes?: string;
  source: InvoiceSource;
  created_at: string;
  updated_at: string;
  deletedAt?: number; // Soft delete timestamp (milliseconds)
}

/**
 * Invoice line item: Individual charge or installment on an invoice
 */
export interface CardInvoiceItem {
  id: string;
  invoice_id: string; // Reference to invoice
  user_id: string;
  description: string; // e.g., "Compra no Mercado X" or "Parcelamento 5/12"
  category_id?: string; // For categorization (FOOD, TRAVEL, etc.)
  category_name?: string;
  amount: number; // Amount of this charge
  purchase_date?: string; // ISO date: when purchase was made
  installment_number: number; // Which installment (1, 2, 3...)
  installment_total: number; // Total number of installments
  is_installment: boolean; // TRUE if this is part of multi-installment
  merchant_name?: string; // Store/merchant name
  merchant_category_code?: string; // MCC code for merchant
  notes?: string;
  created_at: string;
  updated_at: string;
  deletedAt?: number; // Soft delete timestamp (milliseconds)
}

/**
 * Invoice with calculated metadata
 */
export interface CardInvoiceWithMetrics extends CardInvoice {
  remainingBalance: number; // total_amount - paid_amount
  daysUntilDue: number;
  isOverdue: boolean;
  paymentProgress: number; // 0-100%
  itemsCount: number;
  idealPaymentAmount: number;
}

/**
 * Payment record for audit trail
 */
export interface InvoicePayment {
  invoice_id: string;
  amount: number;
  date: string; // ISO timestamp
  method?: string; // e.g., "TRANSFER", "DEBIT"
}

/**
 * Future installment summary (for planning)
 */
export interface FutureInstallmentSummary {
  totalFutureAmount: number; // Sum of all future installments
  itemsCount: number;
  nextInstallments: CardInvoiceItem[];
  monthlyDistribution: Record<string, number>; // YYYY-MM -> amount
}

/**
 * Context type for InvoiceContext hook
 */
export interface InvoiceContextType {
  // State
  invoices: CardInvoice[];
  invoiceItems: CardInvoiceItem[];
  currentInvoices: CardInvoice[];
  isSyncing: boolean;
  isInitialLoadComplete: boolean;
  lastUpdated: number;

  // Invoice Management
  fetchCurrentInvoices(): Promise<CardInvoice[]>;
  fetchFutureInstallments(): Promise<CardInvoiceItem[]>;

  createInvoice(
    invoice: Omit<CardInvoice, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'paid_amount'>
  ): Promise<CardInvoice>;

  updateInvoice(invoice: CardInvoice): Promise<void>;
  deleteInvoice(invoiceId: string): Promise<void>;
  markInvoiceAsPaid(
    invoiceId: string,
    paymentDate: string,
    paymentAmount?: number
  ): Promise<CardInvoice>;

  // Item Management
  addInvoiceItem(
    item: Omit<CardInvoiceItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<CardInvoiceItem>;

  updateInvoiceItem(item: CardInvoiceItem): Promise<void>;
  deleteInvoiceItem(itemId: string): Promise<void>;
  getInvoiceItems(invoiceId: string): CardInvoiceItem[];
  getFutureInstallments(cardId?: string): CardInvoiceItem[];
  getCurrentInstallments(): CardInvoiceItem[];

  // Calculations
  getTotalCurrentInvoices(): number;
  getTotalFutureInstallments(): number;
  getCardDebt(cardId: string): number;
  getIdealPaymentAmount(invoiceId: string): number;
  getFutureInstallmentsSummary(): FutureInstallmentSummary;
  getInvoiceMetrics(invoiceId: string): CardInvoiceWithMetrics;

  // Sync & Persistence
  syncInvoicesFromSupabase(): Promise<void>;
  saveInvoicesToLocalStorage(): void;
  loadInvoicesFromLocalStorage(): void;
}

/**
 * Props for InvoiceProvider component
 */
export interface InvoiceProviderProps {
  children: React.ReactNode;
  userId?: string;
  onStateChange?: (state: InvoiceState) => void;
}

/**
 * Internal state for InvoiceContext
 */
export interface InvoiceState {
  invoices: CardInvoice[];
  invoiceItems: CardInvoiceItem[];
  lastUpdated: number;
  isSyncing: boolean;
}
