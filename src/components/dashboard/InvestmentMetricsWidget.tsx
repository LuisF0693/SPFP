/**
 * Investment Metrics Widget Component
 * FASE 1: STY-065 (Investment Metrics & Totals Widget)
 *
 * Displays investment portfolio summary with:
 * - Total invested and current value
 * - Gain/loss in R$ and %
 * - Breakeven date
 * - Asset type distribution pie chart
 * - Real-time updates
 * - Mobile responsive
 */

import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AssetTypeData {
  name: string;
  value: number;
  percentage: number;
}

// Asset type colors
const ASSET_COLORS: Record<string, string> = {
  'Ações': '#3B82F6',
  'Fundos': '#8B5CF6',
  'Renda Fixa': '#10B981',
  'Criptos': '#F59E0B',
  'ETFs': '#EC4899',
  'Outro': '#6B7280',
};

export const InvestmentMetricsWidget: React.FC = () => {
  const { investments = [] } = useFinance();
  const navigate = useNavigate();

  // Calculate metrics
  const metrics = useMemo(() => {
    if (investments.length === 0) {
      return {
        totalInvested: 0,
        currentValue: 0,
        gain: 0,
        gainPercentage: 0,
        gainStatus: 'neutral' as const,
        assetDistribution: [] as AssetTypeData[],
        showBreakevenDate: false,
      };
    }

    const totalInvested = investments.reduce((sum, inv) => {
      const investedAmount = inv.quantity * (inv.price || 0);
      return sum + investedAmount;
    }, 0);

    const currentValue = investments.reduce((sum, inv) => {
      return sum + (inv.totalValue || 0);
    }, 0);

    const gain = currentValue - totalInvested;
    const gainPercentage = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

    // Determine gain status
    let gainStatus: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (gainPercentage > 5) gainStatus = 'positive';
    else if (gainPercentage < -5) gainStatus = 'negative';

    // Asset distribution
    const assetMap: Record<string, number> = {};
    investments.forEach((inv) => {
      const assetType = inv.assetType || 'Outro';
      assetMap[assetType] = (assetMap[assetType] || 0) + (inv.totalValue || 0);
    });

    const assetDistribution: AssetTypeData[] = Object.entries(assetMap)
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / currentValue) * 100,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalInvested,
      currentValue,
      gain,
      gainPercentage,
      gainStatus,
      assetDistribution,
      showBreakevenDate: gainPercentage < 0,
    };
  }, [investments]);

  if (investments.length === 0) {
    return (
      <div
        className="bg-card-dark border border-gray-800 rounded-xl p-6 cursor-pointer hover:border-gray-700 transition-all"
        onClick={() => navigate('/investments')}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Portfólio de Investimentos</h2>
          <TrendingUp size={20} className="text-gray-500" />
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Nenhum investimento registrado</p>
          <button
            onClick={() => navigate('/investments')}
            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium"
          >
            Adicionar Investimento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card-dark border border-gray-800 rounded-xl p-6 cursor-pointer hover:border-gray-700 transition-all"
      onClick={() => navigate('/investments')}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">Portfólio de Investimentos</h2>
        <div className={`p-2 rounded-lg ${metrics.gainStatus === 'positive' ? 'bg-green-500/20' : metrics.gainStatus === 'negative' ? 'bg-red-500/20' : 'bg-gray-500/20'}`}>
          {metrics.gainStatus === 'positive' ? (
            <TrendingUp size={20} className="text-green-400" />
          ) : metrics.gainStatus === 'negative' ? (
            <TrendingDown size={20} className="text-red-400" />
          ) : (
            <DollarSign size={20} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        {/* Total Investido */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Investido</div>
          <div className="text-sm font-bold text-gray-300">
            {formatCurrency(metrics.totalInvested)}
          </div>
        </div>

        {/* Valor Atual */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Valor Atual</div>
          <div className="text-sm font-bold text-white">
            {formatCurrency(metrics.currentValue)}
          </div>
        </div>

        {/* Rendimento R$ */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Rendimento</div>
          <div
            className={`text-sm font-bold ${
              metrics.gainStatus === 'positive'
                ? 'text-green-400'
                : metrics.gainStatus === 'negative'
                  ? 'text-red-400'
                  : 'text-gray-400'
            }`}
          >
            {metrics.gainStatus === 'positive' ? '+' : ''}
            {formatCurrency(metrics.gain)}
          </div>
        </div>

        {/* Rendimento % */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Retorno</div>
          <div
            className={`text-sm font-bold ${
              metrics.gainStatus === 'positive'
                ? 'text-green-400'
                : metrics.gainStatus === 'negative'
                  ? 'text-red-400'
                  : 'text-gray-400'
            }`}
          >
            {metrics.gainStatus === 'positive' ? '+' : ''}
            {metrics.gainPercentage.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Breakeven Info */}
      {metrics.showBreakevenDate && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-xs text-red-400">
            ⚠️ Portfólio com saldo negativo. Aguarde recuperação do mercado.
          </p>
        </div>
      )}

      {/* Asset Distribution Chart */}
      {metrics.assetDistribution.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 tracking-wide">
            Distribuição por Tipo
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={metrics.assetDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {metrics.assetDistribution.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={ASSET_COLORS[entry.name] || ASSET_COLORS['Outro']}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Asset Types Breakdown */}
      {metrics.assetDistribution.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Composição</h3>
          {metrics.assetDistribution.map((asset) => (
            <div key={asset.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      ASSET_COLORS[asset.name] || ASSET_COLORS['Outro'],
                  }}
                />
                <span className="text-gray-300">{asset.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">{asset.percentage.toFixed(1)}%</span>
                <span className="text-gray-500">{formatCurrency(asset.value)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click Hint */}
      <div className="mt-6 pt-4 border-t border-gray-700 text-center">
        <p className="text-xs text-gray-500">Clique para detalhes completos</p>
      </div>
    </div>
  );
};

export default InvestmentMetricsWidget;
