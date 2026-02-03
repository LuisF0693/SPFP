import { Transaction, Account, Category } from '../types';

/**
 * Transaction validation service
 * Provides comprehensive validation for transaction data before storage
 * All functions are pure (no side effects)
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Main transaction validation function
 * Validates all aspects of a transaction
 */
export const validateTransaction = (
  transaction: Partial<Transaction>,
  accounts: Account[],
  categories: Category[]
): ValidationResult => {
  const errors: string[] = [];

  // Validate required fields
  const requiredFieldsErrors = validateRequiredFields(transaction);
  errors.push(...requiredFieldsErrors);

  // Validate data constraints
  const constraintErrors = validateDataConstraints(transaction);
  errors.push(...constraintErrors);

  // Validate category exists
  if (transaction.categoryId) {
    const categoryErrors = validateCategory(transaction.categoryId, categories);
    errors.push(...categoryErrors);
  }

  // Validate account exists
  if (transaction.accountId) {
    const accountErrors = validateAccount(transaction.accountId, accounts);
    errors.push(...accountErrors);
  }

  // Validate recurrence if applicable
  if (transaction.recurrence) {
    const recurrenceErrors = validateRecurrence(transaction.recurrence, transaction.installments || 0);
    errors.push(...recurrenceErrors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate required fields are present and not empty
 */
export const validateRequiredFields = (transaction: Partial<Transaction>): string[] => {
  const errors: string[] = [];

  if (!transaction.description || transaction.description.trim() === '') {
    errors.push('Descrição é obrigatória');
  }

  if (!transaction.value || transaction.value <= 0) {
    errors.push('Valor deve ser maior que zero');
  }

  if (!transaction.date) {
    errors.push('Data é obrigatória');
  }

  if (!transaction.type || (transaction.type !== 'INCOME' && transaction.type !== 'EXPENSE')) {
    errors.push('Tipo de transação inválido (INCOME ou EXPENSE)');
  }

  if (!transaction.categoryId) {
    errors.push('Categoria é obrigatória');
  }

  if (!transaction.accountId) {
    errors.push('Conta é obrigatória');
  }

  return errors;
};

/**
 * Validate data constraints (value ranges, date validity, etc.)
 */
export const validateDataConstraints = (transaction: Partial<Transaction>): string[] => {
  const errors: string[] = [];

  // Validate amount
  if (transaction.value !== undefined) {
    if (transaction.value < 0) {
      errors.push('Valor não pode ser negativo');
    }

    if (transaction.value > 999999999) {
      errors.push('Valor não pode exceder R$ 999.999.999');
    }

    if (!Number.isFinite(transaction.value)) {
      errors.push('Valor inválido');
    }
  }

  // Validate date
  if (transaction.date) {
    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) {
      errors.push('Data inválida');
    }

    // Don't allow dates too far in the past or future
    const now = new Date();
    const yearsAgo = new Date(now.getFullYear() - 50, now.getMonth(), now.getDate());
    const yearsAhead = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());

    if (date < yearsAgo) {
      errors.push('Data não pode ser anterior a 50 anos atrás');
    }

    if (date > yearsAhead) {
      errors.push('Data não pode ser superior a 10 anos no futuro');
    }
  }

  // Validate description length
  if (transaction.description && transaction.description.length > 500) {
    errors.push('Descrição não pode ter mais de 500 caracteres');
  }

  // Validate sentiment if provided
  if (transaction.sentiment && !['happy', 'sad', 'angry', 'surprised', 'neutral'].includes(transaction.sentiment)) {
    errors.push('Sentimento inválido');
  }

  // Validate spender if provided
  if (transaction.spender && !['ME', 'SPOUSE', 'CHILDREN'].includes(transaction.spender)) {
    errors.push('Pagador inválido');
  }

  return errors;
};

/**
 * Validate category exists and is valid
 */
export const validateCategory = (categoryId: string, categories: Category[]): string[] => {
  const errors: string[] = [];

  if (!categoryId) {
    errors.push('Categoria é obrigatória');
    return errors;
  }

  const category = categories.find(c => c.id === categoryId);
  if (!category) {
    errors.push(`Categoria com ID "${categoryId}" não encontrada`);
  }

  return errors;
};

/**
 * Validate account exists and is valid
 */
export const validateAccount = (accountId: string, accounts: Account[]): string[] => {
  const errors: string[] = [];

  if (!accountId) {
    errors.push('Conta é obrigatória');
    return errors;
  }

  const account = accounts.find(a => a.id === accountId);
  if (!account) {
    errors.push(`Conta com ID "${accountId}" não encontrada`);
  }

  return errors;
};

/**
 * Validate recurrence settings
 */
export const validateRecurrence = (recurrence: string, installments: number): string[] => {
  const errors: string[] = [];

  if (!['NONE', 'INSTALLMENT', 'REPEATED'].includes(recurrence)) {
    errors.push('Tipo de recorrência inválido (NONE, INSTALLMENT ou REPEATED)');
  }

  if (recurrence !== 'NONE' && installments < 2) {
    errors.push('Número de parcelações deve ser no mínimo 2');
  }

  if (installments > 999) {
    errors.push('Número de parcelações não pode exceder 999');
  }

  if (recurrence === 'INSTALLMENT' && installments > 360) {
    errors.push('Parcelamentos não podem exceder 360 meses (30 anos)');
  }

  return errors;
};

/**
 * Validate groupId consistency
 * Ensures all transactions in a group have the same groupId
 */
export const validateGroupIdConsistency = (
  transactions: Transaction[],
  groupId: string
): ValidationResult => {
  const errors: string[] = [];

  if (!groupId) {
    return { isValid: true, errors: [] };
  }

  // Check if all transactions with this groupId exist
  const groupTransactions = transactions.filter(t => t.groupId === groupId);

  if (groupTransactions.length === 0) {
    return { isValid: true, errors: [] };
  }

  // Verify all have same groupId
  const allSameGroupId = groupTransactions.every(t => t.groupId === groupId);
  if (!allSameGroupId) {
    errors.push(`Inconsistência no ID do grupo: nem todas as transações têm o mesmo groupId`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate a batch of transactions
 */
export const validateTransactionBatch = (
  transactions: Partial<Transaction>[],
  accounts: Account[],
  categories: Category[]
): ValidationResult[] => {
  return transactions.map(transaction =>
    validateTransaction(transaction, accounts, categories)
  );
};

/**
 * Check if all validations pass in a batch
 */
export const arAllTransactionsValid = (
  transactions: Partial<Transaction>[],
  accounts: Account[],
  categories: Category[]
): boolean => {
  const results = validateTransactionBatch(transactions, accounts, categories);
  return results.every(result => result.isValid);
};

/**
 * Get all errors from a batch validation
 */
export const getAllValidationErrors = (
  transactions: Partial<Transaction>[],
  accounts: Account[],
  categories: Category[]
): { [key: number]: string[] } => {
  const results = validateTransactionBatch(transactions, accounts, categories);
  const errorMap: { [key: number]: string[] } = {};

  results.forEach((result, index) => {
    if (!result.isValid) {
      errorMap[index] = result.errors;
    }
  });

  return errorMap;
};

/**
 * Sanitize transaction data
 * Removes/corrects common data issues
 */
export const sanitizeTransaction = (transaction: Partial<Transaction>): Partial<Transaction> => {
  return {
    ...transaction,
    description: transaction.description?.trim() || '',
    value: Math.abs(transaction.value || 0),
    date: transaction.date,
  };
};
