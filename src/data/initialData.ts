
import { Account, Category, Transaction } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  // Gastos Fixos
  { id: 'cat_1', name: 'Moradia', color: '#0088FE', group: 'FIXED', icon: 'home' },
  { id: 'cat_2', name: 'Transporte', color: '#00C49F', group: 'FIXED', icon: 'car' },
  { id: 'cat_3', name: 'Saúde', color: '#FF4d4d', group: 'FIXED', icon: 'health' },
  { id: 'cat_4', name: 'Educação', color: '#8884d8', group: 'FIXED', icon: 'education' },

  // Gastos Variáveis
  { id: 'cat_5', name: 'Alimentação / Mercado', color: '#FFbb28', group: 'VARIABLE', icon: 'market' },
  { id: 'cat_6', name: 'Lazer', color: '#FF8042', group: 'VARIABLE', icon: 'leisure' },
  { id: 'cat_7', name: 'Restaurante / Delivery', color: '#d97706', group: 'VARIABLE', icon: 'food' },
  { id: 'cat_8', name: 'Compras', color: '#db2777', group: 'VARIABLE', icon: 'shopping' },

  // Investimentos / Proteção
  { id: 'cat_9', name: 'Aporte Mensal', color: '#4f46e5', group: 'INVESTMENT', icon: 'invest' },
  { id: 'cat_10', name: 'Reserva de Emergência', color: '#059669', group: 'INVESTMENT', icon: 'savings' },
  { id: 'cat_11', name: 'Seguros', color: '#6366f1', group: 'INVESTMENT', icon: 'insurance' },

  // Renda
  { id: 'cat_12', name: 'Salário', color: '#4caf50', group: 'INCOME', icon: 'money' },
  { id: 'cat_13', name: 'Outras Rendas', color: '#84cc16', group: 'INCOME', icon: 'work' },
];

// Start with empty accounts so user can add their own
export const INITIAL_ACCOUNTS: Account[] = [];

// Start with empty transactions
export const INITIAL_TRANSACTIONS: Transaction[] = [];
