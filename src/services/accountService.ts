import { Account, AccountType, Transaction, Category } from '../types';

/**
 * Service for account-related business logic
 * Handles calculations, validations, and data transformations
 */

/**
 * Calculate invoice value for a credit card for the current month
 */
export const getInvoiceValue = (
  cardId: string,
  transactions: Transaction[]
): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return transactions
    .filter(t =>
      t.accountId === cardId &&
      t.type === 'EXPENSE' &&
      new Date(t.date).getMonth() === currentMonth &&
      new Date(t.date).getFullYear() === currentYear
    )
    .reduce((acc, t) => acc + t.value, 0);
};

/**
 * Calculate credit limit usage percentage
 */
export const calculateLimitUsage = (
  totalInvoices: number,
  totalLimit: number
): number => {
  return totalLimit > 0 ? (totalInvoices / totalLimit) * 100 : 0;
};

/**
 * Find the next credit card with a due date
 */
export const findNextDueCard = (
  creditCards: Account[],
  today: Date = new Date()
): Account | undefined => {
  return [...creditCards]
    .filter(c => c.dueDay)
    .sort((a, b) => {
      let dateA = new Date(today.getFullYear(), today.getMonth(), a.dueDay!);
      if (dateA < today) dateA = new Date(today.getFullYear(), today.getMonth() + 1, a.dueDay!);

      let dateB = new Date(today.getFullYear(), today.getMonth(), b.dueDay!);
      if (dateB < today) dateB = new Date(today.getFullYear(), today.getMonth() + 1, b.dueDay!);

      return dateA.getTime() - dateB.getTime();
    })[0];
};

/**
 * Calculate days until the next due date
 */
export const calculateDaysUntilDue = (
  dueDay: number | undefined,
  today: Date = new Date()
): number => {
  if (!dueDay) return 0;

  let dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
  if (dueDate < today) dueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);

  const diffTime = Math.abs(dueDate.getTime() - today.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get recent card transactions (expenses only)
 */
export const getRecentCardTransactions = (
  cardIds: string[],
  transactions: Transaction[],
  limit: number = 5
): Transaction[] => {
  return transactions
    .filter(t => cardIds.includes(t.accountId) && t.type === 'EXPENSE')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

/**
 * Get spending by category for cards in current month
 */
export const getCardCategoryData = (
  cardIds: string[],
  transactions: Transaction[],
  categories: Category[],
  today: Date = new Date()
): Array<{
  name: string;
  value: number;
  color?: string;
  icon?: string;
}> => {
  const categoryMap = transactions
    .filter(
      t =>
        cardIds.includes(t.accountId) &&
        t.type === 'EXPENSE' &&
        new Date(t.date).getMonth() === today.getMonth() &&
        new Date(t.date).getFullYear() === today.getFullYear()
    )
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.value;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(categoryMap)
    .map(([catId, value]: [string, number]) => {
      const cat = categories.find(c => c.id === catId);
      return { name: cat?.name || 'Outros', value, color: cat?.color, icon: cat?.icon };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
};

/**
 * Get label for account type
 */
export const getAccountTypeLabel = (type: AccountType): string => {
  switch (type) {
    case 'CHECKING':
      return 'Conta Corrente';
    case 'CREDIT_CARD':
      return 'Cartão de Crédito';
    case 'CASH':
      return 'Dinheiro';
    case 'INVESTMENT':
      return 'Investimento';
  }
};

/**
 * Calculate card balance and available credit
 */
export const calculateCardBalance = (
  card: Account
): { used: number; available: number; percent: number } => {
  const limit = card.creditLimit || 0;
  const used = Math.abs(card.balance);
  const available = limit - used;
  const percent = limit > 0 ? (used / limit) * 100 : 0;

  return { used, available, percent };
};

/**
 * Validate account data before submission
 */
export const validateAccountData = (data: Partial<Account>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Nome da conta é obrigatório');
  }

  if (!data.type) {
    errors.push('Tipo de conta é obrigatório');
  }

  if (data.type === 'CREDIT_CARD') {
    if (!data.creditLimit || data.creditLimit <= 0) {
      errors.push('Limite de crédito deve ser maior que zero');
    }
    if (!data.dueDay || data.dueDay < 1 || data.dueDay > 31) {
      errors.push('Dia de vencimento deve estar entre 1 e 31');
    }
    if (!data.closingDay || data.closingDay < 1 || data.closingDay > 31) {
      errors.push('Dia de fechamento deve estar entre 1 e 31');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate card statistics summary
 */
export const calculateCardStatistics = (
  creditCards: Account[],
  transactions: Transaction[]
): {
  totalInvoices: number;
  totalLimit: number;
  totalAvailable: number;
  limitUsage: number;
} => {
  const totalInvoices = creditCards.reduce((acc, card) => acc + getInvoiceValue(card.id, transactions), 0);
  const totalLimit = creditCards.reduce((acc, card) => acc + (card.creditLimit || 0), 0);
  const totalAvailable = totalLimit - totalInvoices;
  const limitUsage = calculateLimitUsage(totalInvoices, totalLimit);

  return {
    totalInvoices,
    totalLimit,
    totalAvailable,
    limitUsage,
  };
};

/**
 * Get next due date display information
 */
export const getNextDueDateInfo = (
  nextDueCard: Account | undefined,
  today: Date = new Date()
): { display: string; daysUntil: number } => {
  if (!nextDueCard || !nextDueCard.dueDay) {
    return { display: 'Sem faturas', daysUntil: 0 };
  }

  const daysUntil = calculateDaysUntilDue(nextDueCard.dueDay, today);
  return {
    display: `Dia ${nextDueCard.dueDay}`,
    daysUntil,
  };
};
