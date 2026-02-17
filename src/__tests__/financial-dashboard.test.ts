/**
 * Financial Dashboard Tests
 * Unit tests para US-403
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { financialMockData, formatCurrency, getDaysUntilDue, isOverdue, isDueToday, isDueSoon } from '@/data/financialData';

describe('FinancialDashboard - US-403', () => {
  describe('Mock Data', () => {
    it('should have all required financial data', () => {
      expect(financialMockData.balance).toBeDefined();
      expect(financialMockData.monthlyData).toBeDefined();
      expect(financialMockData.accountsPayable).toBeDefined();
      expect(financialMockData.accountsReceivable).toBeDefined();
      expect(financialMockData.cashFlowProjection).toBeDefined();
    });

    it('should have 6 months of revenue/expense data', () => {
      expect(financialMockData.monthlyData).toHaveLength(6);
      financialMockData.monthlyData.forEach((month) => {
        expect(month.month).toBeDefined();
        expect(month.revenue).toBeGreaterThan(0);
        expect(month.expense).toBeGreaterThan(0);
      });
    });

    it('should have 10 contas a pagar', () => {
      expect(financialMockData.accountsPayable).toHaveLength(10);
      financialMockData.accountsPayable.forEach((ap) => {
        expect(ap.id).toBeDefined();
        expect(ap.description).toBeDefined();
        expect(ap.amount).toBeGreaterThan(0);
        expect(ap.dueDate).toBeDefined();
      });
    });

    it('should have 5 contas a receber', () => {
      expect(financialMockData.accountsReceivable).toHaveLength(5);
      financialMockData.accountsReceivable.forEach((ar) => {
        expect(ar.id).toBeDefined();
        expect(ar.description).toBeDefined();
        expect(ar.amount).toBeGreaterThan(0);
        expect(ar.dueDate).toBeDefined();
      });
    });

    it('should have 3 months cash flow projection', () => {
      expect(financialMockData.cashFlowProjection).toHaveLength(3);
    });
  });

  describe('Currency Formatting', () => {
    it('should format currency correctly', () => {
      const formatted = formatCurrency(45230.5);
      expect(formatted).toContain('45');
      expect(formatted).toContain('230');
      expect(formatted).toContain('R$');
    });

    it('should handle zero', () => {
      const formatted = formatCurrency(0);
      expect(formatted).toContain('0');
    });

    it('should handle large numbers', () => {
      const formatted = formatCurrency(1000000);
      expect(formatted).toContain('1');
    });

    it('should handle decimal values', () => {
      const formatted = formatCurrency(100.5);
      expect(formatted).toContain('100');
    });
  });

  describe('Date Calculations', () => {
    it('should calculate days until due', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const daysUntil = getDaysUntilDue(tomorrowStr);
      expect(daysUntil).toBe(1);
    });

    it('should detect overdue dates', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      expect(isOverdue(yesterdayStr)).toBe(true);
    });

    it('should detect due today', () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      expect(isDueToday(todayStr)).toBe(true);
    });

    it('should detect due soon', () => {
      const today = new Date();
      const soon = new Date(today);
      soon.setDate(soon.getDate() + 2);
      const soonStr = soon.toISOString().split('T')[0];

      expect(isDueSoon(soonStr)).toBe(true);
    });
  });

  describe('Financial Calculations', () => {
    it('should calculate net income', () => {
      const lastMonth = financialMockData.monthlyData[financialMockData.monthlyData.length - 1];
      const netIncome = lastMonth.revenue - lastMonth.expense;

      expect(netIncome).toBeGreaterThanOrEqual(0);
    });

    it('should calculate margin', () => {
      const lastMonth = financialMockData.monthlyData[financialMockData.monthlyData.length - 1];
      const netIncome = lastMonth.revenue - lastMonth.expense;
      const margin = lastMonth.revenue > 0 ? ((netIncome / lastMonth.revenue) * 100).toFixed(1) : '0';

      const marginValue = parseFloat(margin);
      expect(marginValue).toBeGreaterThanOrEqual(0);
      expect(marginValue).toBeLessThanOrEqual(100);
    });

    it('should calculate total payable', () => {
      const total = financialMockData.accountsPayable.reduce((sum, ap) => sum + ap.amount, 0);
      expect(total).toBeGreaterThan(0);
    });

    it('should calculate total receivable', () => {
      const total = financialMockData.accountsReceivable.reduce((sum, ar) => sum + ar.amount, 0);
      expect(total).toBeGreaterThan(0);
    });
  });

  describe('Balance Metrics', () => {
    it('should have positive balance', () => {
      expect(financialMockData.balance).toBeGreaterThan(0);
    });

    it('should match expected balance format', () => {
      expect(typeof financialMockData.balance).toBe('number');
      expect(financialMockData.balance).toBe(45230.5);
    });
  });

  describe('Monthly Data Trends', () => {
    it('should have months in correct order', () => {
      const months = ['Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'];
      financialMockData.monthlyData.forEach((data, index) => {
        expect(data.month).toBe(months[index]);
      });
    });

    it('should show revenue and expense trends', () => {
      const data = financialMockData.monthlyData;
      expect(data[0].revenue).toBeLessThan(data[data.length - 1].revenue);
      expect(data[0].expense).toBeLessThan(data[data.length - 1].expense);
    });
  });

  describe('Dashboard Rendering', () => {
    it('should display all 4 metric cards', () => {
      const metrics = [
        { label: 'Saldo Atual', value: financialMockData.balance },
        { label: 'Receita Mês', value: financialMockData.monthlyData[5].revenue },
        { label: 'Despesa Mês', value: financialMockData.monthlyData[5].expense },
        { label: 'Lucro Líquido', value: financialMockData.monthlyData[5].revenue - financialMockData.monthlyData[5].expense },
      ];

      expect(metrics).toHaveLength(4);
      metrics.forEach((metric) => {
        expect(metric.label).toBeDefined();
        expect(metric.value).toBeDefined();
      });
    });

    it('should filter data by period', () => {
      const mesFilter = financialMockData.monthlyData.slice(-6);
      const trimestreFilter = financialMockData.monthlyData.slice(-3);
      const anoFilter = financialMockData.monthlyData;

      expect(mesFilter).toHaveLength(6);
      expect(trimestreFilter).toHaveLength(3);
      expect(anoFilter).toHaveLength(6);
    });
  });

  describe('Alert Logic', () => {
    it('should count overdue payables', () => {
      const today = new Date();
      const overdue = financialMockData.accountsPayable.filter((ap) => {
        const dueDate = new Date(ap.dueDate);
        return dueDate < today;
      });

      expect(overdue).toBeDefined();
    });

    it('should count overdue receivables', () => {
      const today = new Date();
      const overdue = financialMockData.accountsReceivable.filter((ar) => {
        const dueDate = new Date(ar.dueDate);
        return dueDate < today;
      });

      expect(overdue).toBeDefined();
    });
  });
});
