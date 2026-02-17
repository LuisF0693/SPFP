/**
 * Financial Mock Data
 * Mock data para o Dashboard Financeiro (US-403)
 */

export const financialMockData = {
  balance: 45230.50,
  currency: 'BRL',

  monthlyData: [
    { month: 'Ago', revenue: 28500, expense: 18200 },
    { month: 'Set', revenue: 31200, expense: 19500 },
    { month: 'Out', revenue: 29800, expense: 17800 },
    { month: 'Nov', revenue: 35600, expense: 21200 },
    { month: 'Dez', revenue: 38900, expense: 23400 },
    { month: 'Jan', revenue: 42100, expense: 25600 },
  ],

  cashFlowProjection: [
    { month: 'Fev', amount: 42100 * 1.05 },
    { month: 'Mar', amount: 42100 * 1.08 },
    { month: 'Abr', amount: 42100 * 1.1 },
  ],

  accountsPayable: [
    {
      id: 'ap-1',
      description: 'Aluguel do escritório',
      amount: 2500,
      dueDate: '2026-02-15',
    },
    {
      id: 'ap-2',
      description: 'Internet e telefone',
      amount: 200,
      dueDate: '2026-02-20',
    },
    {
      id: 'ap-3',
      description: 'Fornecedor A - Produtos',
      amount: 5800,
      dueDate: '2026-02-25',
    },
    {
      id: 'ap-4',
      description: 'Serviços contábeis',
      amount: 1200,
      dueDate: '2026-03-05',
    },
    {
      id: 'ap-5',
      description: 'Energia elétrica',
      amount: 450,
      dueDate: '2026-03-10',
    },
    {
      id: 'ap-6',
      description: 'Software licenses',
      amount: 1500,
      dueDate: '2026-03-12',
    },
    {
      id: 'ap-7',
      description: 'Marketing - Google Ads',
      amount: 2200,
      dueDate: '2026-03-15',
    },
    {
      id: 'ap-8',
      description: 'Transporte e logística',
      amount: 850,
      dueDate: '2026-03-18',
    },
    {
      id: 'ap-9',
      description: 'Fornecedor B - Materiais',
      amount: 3400,
      dueDate: '2026-03-20',
    },
    {
      id: 'ap-10',
      description: 'Seguro empresarial',
      amount: 1800,
      dueDate: '2026-04-01',
    },
  ],

  accountsReceivable: [
    {
      id: 'ar-1',
      description: 'Cliente XYZ Corp - Serviço A',
      amount: 5000,
      dueDate: '2026-02-20',
    },
    {
      id: 'ar-2',
      description: 'Cliente ABC Inc - Consultoria',
      amount: 8500,
      dueDate: '2026-02-25',
    },
    {
      id: 'ar-3',
      description: 'Cliente DEF Ltd - Projeto',
      amount: 12300,
      dueDate: '2026-03-10',
    },
    {
      id: 'ar-4',
      description: 'Cliente GHI Co - Suporte anual',
      amount: 3200,
      dueDate: '2026-03-15',
    },
    {
      id: 'ar-5',
      description: 'Cliente JKL Group - Desenvolvimento',
      amount: 15800,
      dueDate: '2026-03-30',
    },
  ],
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getDaysUntilDue(dueDateStr: string): number {
  const dueDate = new Date(dueDateStr);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function isOverdue(dueDateStr: string): boolean {
  return getDaysUntilDue(dueDateStr) < 0;
}

export function isDueToday(dueDateStr: string): boolean {
  const days = getDaysUntilDue(dueDateStr);
  return days >= 0 && days < 1;
}

export function isDueSoon(dueDateStr: string): boolean {
  const days = getDaysUntilDue(dueDateStr);
  return days >= 1 && days <= 3;
}
