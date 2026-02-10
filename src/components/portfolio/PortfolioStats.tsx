import React from 'react';
import { Wallet, TrendingUp, Percent } from 'lucide-react';
import { StatCard } from '../ui/StatCard';

export interface PortfolioStatsData {
  totalPatrimony: number;
  dailyProfit: number;
  dailyReturn: number;
  totalReturn: number;
  monthlyChange: number;
}

interface PortfolioStatsProps {
  stats: PortfolioStatsData;
  loading?: boolean;
}

export const PortfolioStats: React.FC<PortfolioStatsProps> = ({ stats, loading }) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Patrimônio Total"
        value={formatCurrency(stats.totalPatrimony)}
        icon={<Wallet className="w-5 h-5" />}
        iconBgColor="bg-[#135bec]/10"
        iconColor="text-[#135bec]"
        trend={{
          value: stats.monthlyChange,
          label: 'vs. mês anterior',
        }}
        loading={loading}
      />

      <StatCard
        title="Lucro do Dia"
        value={`${stats.dailyProfit >= 0 ? '+' : ''} ${formatCurrency(stats.dailyProfit)}`}
        icon={<TrendingUp className="w-5 h-5" />}
        iconBgColor="bg-green-500/10"
        iconColor="text-green-500"
        trend={{
          value: stats.dailyReturn,
          label: 'hoje',
        }}
        loading={loading}
      />

      <StatCard
        title="Retorno da Carteira"
        value={`${stats.totalReturn >= 0 ? '+' : ''} ${stats.totalReturn.toFixed(1)}%`}
        icon={<Percent className="w-5 h-5" />}
        iconBgColor="bg-blue-500/10"
        iconColor="text-blue-500"
        loading={loading}
      />
    </div>
  );
};

export default PortfolioStats;
