import { useState, useCallback } from 'react';

interface UseMonthNavigationReturn {
  selectedMonth: number;
  selectedYear: number;
  changeMonth: (delta: number) => void;
  goToToday: () => void;
  formatMonthYear: () => string;
}

/**
 * Custom hook for managing month/year navigation
 * Eliminates 60+ lines of duplicate logic in TransactionList, Dashboard, Budget, InvoiceDetailsModal
 */
export const useMonthNavigation = (initialMonth?: number, initialYear?: number): UseMonthNavigationReturn => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(initialMonth ?? today.getMonth());
  const [selectedYear, setSelectedYear] = useState(initialYear ?? today.getFullYear());

  const changeMonth = useCallback((delta: number) => {
    setSelectedMonth(prev => {
      let newMonth = prev + delta;
      let newYear = selectedYear;

      if (newMonth > 11) {
        newMonth = 0;
        setSelectedYear(prev => prev + 1);
      } else if (newMonth < 0) {
        newMonth = 11;
        setSelectedYear(prev => prev - 1);
      }

      return newMonth;
    });
  }, [selectedYear]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  }, []);

  const formatMonthYear = useCallback(() => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[selectedMonth]} ${selectedYear}`;
  }, [selectedMonth, selectedYear]);

  return {
    selectedMonth,
    selectedYear,
    changeMonth,
    goToToday,
    formatMonthYear,
  };
};
