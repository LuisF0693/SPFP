/**
 * Mock Data for Sidebar Components (STY-052)
 * Used for testing and development
 */

import { ChefHat, Bus, Heart, ShoppingCart, Wifi, Gas, Clapperboard, UtensilsCrossed } from 'lucide-react';

export interface MockBudgetCategory {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  spent: number;
  limit: number;
  percentage: number;
  status: 'green' | 'yellow' | 'red';
}

export interface MockAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  bank: string;
  balance: number;
  currency: string;
}

export interface MockTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  categoryEmoji: string;
  status: 'pending' | 'confirmed';
}

export interface MockInstallment {
  id: string;
  name: string;
  description: string;
  currentInstallment: number;
  totalInstallments: number;
  monthlyAmount: number;
  nextDueDate: string;
  progressPercentage: number;
}

/**
 * Mock Budget Categories Data
 * Shows top 3 spending categories with progress bars
 */
export const mockBudgetCategories: MockBudgetCategory[] = [
  {
    id: 'cat-1',
    name: 'Alimentação',
    icon: '🛒',
    emoji: '🛒',
    spent: 450,
    limit: 600,
    percentage: 75,
    status: 'yellow'
  },
  {
    id: 'cat-2',
    name: 'Transporte',
    icon: '🚗',
    emoji: '🚗',
    spent: 120,
    limit: 200,
    percentage: 60,
    status: 'green'
  },
  {
    id: 'cat-3',
    name: 'Saúde',
    icon: '🏥',
    emoji: '🏥',
    spent: 300,
    limit: 300,
    percentage: 100,
    status: 'red'
  }
];

/**
 * Mock Accounts Data
 * Shows account balances with bank icons
 */
export const mockAccounts: MockAccount[] = [
  {
    id: 'acc-1',
    name: 'Corrente',
    type: 'checking',
    bank: 'Nubank',
    balance: 5200.50,
    currency: 'BRL'
  },
  {
    id: 'acc-2',
    name: 'Poupança',
    type: 'savings',
    bank: 'Bradesco',
    balance: 12500.00,
    currency: 'BRL'
  },
  {
    id: 'acc-3',
    name: 'Investimentos',
    type: 'investment',
    bank: 'XP Investimentos',
    balance: 28750.75,
    currency: 'BRL'
  },
  {
    id: 'acc-4',
    name: 'Crédito',
    type: 'credit',
    bank: 'Itaú',
    balance: -1240.30,
    currency: 'BRL'
  }
];

/**
 * Mock Transactions Data
 * Shows recent unconfirmed and confirmed transactions
 */
export const mockTransactions: MockTransaction[] = [
  {
    id: 'txn-1',
    description: 'Uber - Corrida Centro',
    amount: 35.50,
    date: '15 de fev',
    category: 'Transporte',
    categoryEmoji: '🚗',
    status: 'pending'
  },
  {
    id: 'txn-2',
    description: 'Netflix - Assinatura',
    amount: 49.90,
    date: '14 de fev',
    category: 'Entretenimento',
    categoryEmoji: '🎬',
    status: 'pending'
  },
  {
    id: 'txn-3',
    description: 'Supermercado Extra',
    amount: 127.80,
    date: '14 de fev',
    category: 'Alimentação',
    categoryEmoji: '🛒',
    status: 'confirmed'
  },
  {
    id: 'txn-4',
    description: 'Farmácia São Paulo',
    amount: 28.50,
    date: '13 de fev',
    category: 'Saúde',
    categoryEmoji: '🏥',
    status: 'confirmed'
  },
  {
    id: 'txn-5',
    description: 'Spotify Premium',
    amount: 16.90,
    date: '12 de fev',
    category: 'Entretenimento',
    categoryEmoji: '🎵',
    status: 'confirmed'
  }
];

/**
 * Mock Installments Data
 * Shows active installment plans with progress
 */
export const mockInstallments: MockInstallment[] = [
  {
    id: 'inst-1',
    name: 'iPhone 15 Pro Max',
    description: 'Compra e-commerce',
    currentInstallment: 2,
    totalInstallments: 12,
    monthlyAmount: 199.90,
    nextDueDate: '2026-03-15',
    progressPercentage: 17
  },
  {
    id: 'inst-2',
    name: 'Viagem Miami',
    description: 'Pacote turístico',
    currentInstallment: 5,
    totalInstallments: 10,
    monthlyAmount: 500.00,
    nextDueDate: '2026-03-20',
    progressPercentage: 50
  },
  {
    id: 'inst-3',
    name: 'Notebook Dell',
    description: 'Computador gamer',
    currentInstallment: 8,
    totalInstallments: 12,
    monthlyAmount: 350.00,
    nextDueDate: '2026-02-25',
    progressPercentage: 67
  },
  {
    id: 'inst-4',
    name: 'Sofá Retrátil',
    description: 'Móvel móvel residencial',
    currentInstallment: 3,
    totalInstallments: 6,
    monthlyAmount: 299.50,
    nextDueDate: '2026-03-10',
    progressPercentage: 50
  }
];

/**
 * Helper: Format currency value in Brazilian Real
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Helper: Get progress bar color based on percentage
 */
export const getProgressBarColor = (percentage: number): string => {
  if (percentage < 50) return 'bg-emerald-500';
  if (percentage < 80) return 'bg-amber-500';
  return 'bg-rose-500';
};

/**
 * Helper: Get status badge color
 */
export const getStatusBadgeColor = (status: 'pending' | 'confirmed'): { bg: string; text: string } => {
  return status === 'pending'
    ? { bg: 'bg-amber-500/20', text: 'text-amber-600' }
    : { bg: 'bg-emerald-500/20', text: 'text-emerald-600' };
};

/**
 * Helper: Get installment progress color
 */
export const getInstallmentProgressColor = (percentage: number): string => {
  if (percentage < 33) return 'bg-blue-500/20';
  if (percentage < 66) return 'bg-emerald-500/20';
  return 'bg-amber-500/20';
};
