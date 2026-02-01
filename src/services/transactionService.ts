import { Transaction, TransactionGroupType } from '../types';
import { generateId } from '../utils';
import { RecurrenceType } from '../components/transaction/TransactionRecurrenceForm';

export interface GenerateTransactionsParams {
  description: string;
  value: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  accountId: string;
  date: string;
  spender: string;
  paid: boolean;
  sentiment?: string;
  recurrence: RecurrenceType;
  installments: number;
}

export interface GenerateRecurringTransactionsResult {
  newTransactions: Omit<Transaction, 'id'>[];
  groupId: string;
}

/**
 * Generates transaction(s) based on recurrence type and count.
 * For INSTALLMENT: divides value by installments count
 * For REPEATED: creates same value multiple times
 * For NONE: creates single transaction
 */
export const generateTransactions = (
  params: GenerateTransactionsParams,
  isEditing: boolean = false,
  editingTransactionId?: string
): GenerateRecurringTransactionsResult | null => {
  const { description, value, type, categoryId, accountId, date, spender, paid, sentiment, recurrence, installments } =
    params;

  if (recurrence === 'NONE' || installments <= 1) {
    return null; // Let component handle single transaction
  }

  const [year, month, day] = date.split('-').map(Number);
  const monthlyValue = recurrence === 'INSTALLMENT' ? value / installments : value;
  const groupId = generateId();
  const groupType: TransactionGroupType = recurrence === 'INSTALLMENT' ? 'INSTALLMENT' : 'RECURRING';

  const newTransactions: Omit<Transaction, 'id'>[] = [];

  for (let i = 0; i < installments; i++) {
    const txDate = new Date(year, month - 1 + i, day, 12, 0, 0);
    let descSuffix = '';
    if (recurrence === 'INSTALLMENT') {
      descSuffix = ` (${i + 1}/${installments})`;
    }

    newTransactions.push({
      description: `${description}${descSuffix}`,
      value: monthlyValue,
      type,
      categoryId,
      accountId,
      date: txDate.toISOString(),
      spender,
      paid,
      sentiment,
      groupId,
      groupType,
      groupIndex: i + 1,
      groupTotal: recurrence === 'INSTALLMENT' ? installments : undefined,
    });
  }

  return { newTransactions, groupId };
};

/**
 * Validates recurrence parameters
 */
export const validateRecurrence = (recurrence: RecurrenceType, installments: number): string[] => {
  const errors: string[] = [];

  if (recurrence !== 'NONE' && installments < 2) {
    errors.push('Número de parcelas/repetições deve ser no mínimo 2');
  }

  if (recurrence !== 'NONE' && installments > 48) {
    errors.push('Número máximo de parcelas é 48');
  }

  return errors;
};

/**
 * Generates transaction payload for single transaction (non-recurring)
 */
export const generateSingleTransaction = (params: GenerateTransactionsParams): Omit<Transaction, 'id'> => {
  const { description, value, type, categoryId, accountId, date, spender, paid, sentiment } = params;

  return {
    description,
    value,
    type,
    categoryId,
    accountId,
    date,
    spender,
    paid,
    sentiment,
  };
};
