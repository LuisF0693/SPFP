import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import {
  Investment,
  INVESTMENT_CATEGORIES,
} from '../types/investments';
import { PortfolioStatsData } from '../components/portfolio/PortfolioStats';
import { AllocationData } from '../components/portfolio/AssetAllocation';
import { EvolutionDataPoint } from '../components/portfolio/EvolutionChart';

interface UsePortfolioReturn {
  investments: Investment[];
  loading: boolean;
  error: string | null;
  stats: PortfolioStatsData;
  allocationData: AllocationData[];
  evolutionData: EvolutionDataPoint[];
  addInvestment: (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInvestment: (id: string, investment: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  refreshInvestments: () => Promise<void>;
}

const ALLOCATION_COLORS: Record<string, string> = {
  'Renda Variável': '#135bec',
  'Renda Fixa': '#14b8a6',
  'FIIs': '#8b5cf6',
  'Internacional': '#f59e0b',
  'Fundos': '#ec4899',
  'Outros': '#6b7280',
};

export function usePortfolio(): UsePortfolioReturn {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch investments
  const fetchInvestments = useCallback(async () => {
    if (!user) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setInvestments(data || []);
    } catch (err) {
      console.error('Error fetching investments:', err);
      setError('Erro ao carregar investimentos');
      // Use mock data for development
      setInvestments(getMockInvestments());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  // Calculate stats
  const stats = useMemo((): PortfolioStatsData => {
    if (investments.length === 0) {
      return {
        totalPatrimony: 0,
        dailyProfit: 0,
        dailyReturn: 0,
        totalReturn: 0,
        monthlyChange: 0,
      };
    }

    let totalCost = 0;
    let totalValue = 0;

    investments.forEach((inv) => {
      const cost = inv.quantity * inv.average_price;
      const value = inv.quantity * (inv.current_price || inv.average_price);
      totalCost += cost;
      totalValue += value;
    });

    const totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

    // Mock daily data (in real app, would come from historical prices)
    const dailyProfit = totalValue * 0.012; // 1.2% mock daily
    const dailyReturn = 1.2;
    const monthlyChange = 0.5;

    return {
      totalPatrimony: totalValue,
      dailyProfit,
      dailyReturn,
      totalReturn,
      monthlyChange,
    };
  }, [investments]);

  // Calculate allocation
  const allocationData = useMemo((): AllocationData[] => {
    if (investments.length === 0) return [];

    const categoryTotals: Record<string, number> = {};
    let grandTotal = 0;

    investments.forEach((inv) => {
      const value = inv.quantity * (inv.current_price || inv.average_price);
      const category = INVESTMENT_CATEGORIES[inv.type] || 'Outros';

      categoryTotals[category] = (categoryTotals[category] || 0) + value;
      grandTotal += value;
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      percentage: grandTotal > 0 ? (value / grandTotal) * 100 : 0,
      color: ALLOCATION_COLORS[name] || ALLOCATION_COLORS['Outros'],
    }));
  }, [investments]);

  // Generate evolution data (mock for now)
  const evolutionData = useMemo((): EvolutionDataPoint[] => {
    const totalValue = stats.totalPatrimony;
    if (totalValue === 0) return [];

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
    const baseValue = totalValue * 0.7; // Start at 70% of current

    return months.map((month, index) => {
      const growth = 1 + (index * 0.05); // 5% growth per month
      return {
        date: `2024-${String(index + 1).padStart(2, '0')}-01`,
        month,
        value: baseValue * growth,
      };
    });
  }, [stats.totalPatrimony]);

  // CRUD operations
  const addInvestment = async (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error: insertError } = await supabase
        .from('investments')
        .insert({
          ...investment,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setInvestments((prev) => [data, ...prev]);
    } catch (err) {
      console.error('Error adding investment:', err);
      // For development, add to local state
      const newInvestment: Investment = {
        ...investment,
        id: crypto.randomUUID(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setInvestments((prev) => [newInvestment, ...prev]);
    }
  };

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    try {
      const { error: updateError } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      setInvestments((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
      );
    } catch (err) {
      console.error('Error updating investment:', err);
      // Update local state anyway
      setInvestments((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
      );
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setInvestments((prev) => prev.filter((inv) => inv.id !== id));
    } catch (err) {
      console.error('Error deleting investment:', err);
      // Delete from local state anyway
      setInvestments((prev) => prev.filter((inv) => inv.id !== id));
    }
  };

  return {
    investments,
    loading,
    error,
    stats,
    allocationData,
    evolutionData,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    refreshInvestments: fetchInvestments,
  };
}

// Mock data for development
function getMockInvestments(): Investment[] {
  return [
    {
      id: '1',
      user_id: 'mock',
      name: 'Vale S.A.',
      ticker: 'VALE3',
      type: 'acao',
      quantity: 400,
      average_price: 68.4,
      current_price: 72.15,
      currency: 'BRL',
      institution: 'XP Investimentos',
      is_retirement: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: 'mock',
      name: 'Petrobras',
      ticker: 'PETR4',
      type: 'acao',
      quantity: 650,
      average_price: 32.1,
      current_price: 35.8,
      currency: 'BRL',
      institution: 'Clear',
      is_retirement: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      user_id: 'mock',
      name: 'CSHG Logística',
      ticker: 'HGLG11',
      type: 'fii',
      quantity: 120,
      average_price: 165,
      current_price: 162.5,
      currency: 'BRL',
      institution: 'XP Investimentos',
      is_retirement: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      user_id: 'mock',
      name: 'iShares S&P 500',
      ticker: 'IVVB11',
      type: 'etf',
      quantity: 50,
      average_price: 240,
      current_price: 289.4,
      currency: 'BRL',
      institution: 'Nubank',
      is_retirement: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      user_id: 'mock',
      name: 'Tesouro IPCA+ 2035',
      ticker: '',
      type: 'tesouro',
      quantity: 1,
      average_price: 45000,
      current_price: 47500,
      currency: 'BRL',
      institution: 'Tesouro Direto',
      rate: 6.5,
      rate_type: 'ipca',
      maturity_date: '2035-05-15',
      liquidity: 'maturity',
      is_retirement: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

export default usePortfolio;
