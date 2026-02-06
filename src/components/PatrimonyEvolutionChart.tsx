/**
 * Patrimony Evolution Chart
 * FASE 2: STY-075 (Patrimony Evolution Chart with Projection & CAGR)
 *
 * Displays historical and projected patrimony evolution
 */

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Account } from '../types';
import { Asset } from '../types/assets';
import { InvestmentAsset } from '../types/investment';
import { PatrimonyItem } from '../types';
import { formatCurrency } from '../utils';
import { TrendingUp } from 'lucide-react';

interface PatrimonyEvolutionChartProps {
  accounts: Account[];
  investments: InvestmentAsset[];
  assets: Asset[];
  patrimonyItems: PatrimonyItem[];
}

interface EvolutionDataPoint {
  month: string;
  accounts: number;
  investments: number;
  assets: number;
  patrimony: number;
  total: number;
  isProjection?: boolean;
}

export const PatrimonyEvolutionChart: React.FC<PatrimonyEvolutionChartProps> = ({
  accounts,
  investments,
  assets,
  patrimonyItems
}) => {
  const { chartData, cagr, totalGrowth } = useMemo(() => {
    // Get current values
    const safeAccounts = Array.isArray(accounts) ? accounts : [];
    const safeInvestments = Array.isArray(investments) ? investments : [];
    const safeAssets = Array.isArray(assets) ? assets : [];
    const safePatrimony = Array.isArray(patrimonyItems) ? patrimonyItems : [];

    const currentAccounts = safeAccounts
      .filter(a => !a.deletedAt)
      .reduce((sum, a) => sum + a.balance, 0);

    const currentInvestments = safeInvestments
      .filter(i => !i.deletedAt)
      .reduce((sum, i) => sum + i.totalValue, 0);

    const currentAssets = safeAssets
      .filter(a => !a.deletedAt)
      .reduce((sum, a) => sum + a.purchasePrice, 0);

    const currentPatrimony = safePatrimony
      .filter(p => !p.deletedAt)
      .reduce((sum, p) => sum + p.value, 0);

    const currentTotal = currentAccounts + currentInvestments + currentAssets + currentPatrimony;

    // Generate 12 months of historical data (simulated with slight variations)
    const data: EvolutionDataPoint[] = [];
    const now = new Date();

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      // Simulate historical data with slight growth (1-3% monthly)
      const monthsAgo = 11 - i;
      const growthFactor = Math.pow(1.015, monthsAgo); // 1.5% monthly average
      const historicalTotal = currentTotal / growthFactor;

      // Distribute proportionally
      const ratio = historicalTotal > 0 ? historicalTotal / currentTotal : 1;
      const accounts_hist = currentAccounts / ratio;
      const investments_hist = currentInvestments / ratio;
      const assets_hist = currentAssets / ratio;
      const patrimony_hist = currentPatrimony / ratio;

      data.push({
        month: monthName,
        accounts: Math.round(accounts_hist),
        investments: Math.round(investments_hist),
        assets: Math.round(assets_hist),
        patrimony: Math.round(patrimony_hist),
        total: Math.round(historicalTotal)
      });
    }

    // Add current month
    data.push({
      month: now.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      accounts: currentAccounts,
      investments: currentInvestments,
      assets: currentAssets,
      patrimony: currentPatrimony,
      total: currentTotal
    });

    // Add future projections (next 12 months with 2% monthly growth)
    for (let i = 1; i <= 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

      const projectionFactor = Math.pow(1.02, i); // 2% monthly growth
      const projectedTotal = currentTotal * projectionFactor;

      // Distribute proportionally
      const ratio = currentTotal > 0 ? projectedTotal / currentTotal : 1;
      const accounts_proj = currentAccounts * ratio;
      const investments_proj = currentInvestments * ratio;
      const assets_proj = currentAssets * ratio;
      const patrimony_proj = currentPatrimony * ratio;

      data.push({
        month: monthName,
        accounts: Math.round(accounts_proj),
        investments: Math.round(investments_proj),
        assets: Math.round(assets_proj),
        patrimony: Math.round(patrimony_proj),
        total: Math.round(projectedTotal),
        isProjection: true
      });
    }

    // Calculate CAGR (12 months historical to 12 months future)
    const startValue = data[0]?.total || 1;
    const endValue = data[data.length - 1]?.total || 1;
    const years = 2; // 12 months history + 12 months projection
    const calculatedCagr = (Math.pow(endValue / startValue, 1 / years) - 1) * 100;

    // Calculate total growth percentage
    const currentIndex = data.findIndex(d => !d.isProjection && data[data.indexOf(d) + 1]?.isProjection);
    const currentValue = data[currentIndex]?.total || 1;
    const growthPercentage = ((endValue - currentValue) / currentValue) * 100;

    return {
      chartData: data,
      cagr: calculatedCagr,
      totalGrowth: growthPercentage
    };
  }, [accounts, investments, assets, patrimonyItems]);

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="bg-card-dark border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Evolução Patrimonial (24 meses)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="gradient-accounts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="gradient-investments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="gradient-assets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="gradient-patrimony" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9CA3AF" label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }} />

            {/* Projection separator line */}
            <ReferenceLine
              x={chartData[chartData.findIndex(d => d.isProjection)]?.month}
              stroke="#374151"
              strokeDasharray="5 5"
              label={{ value: 'Projeção', position: 'top', fill: '#9CA3AF' }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => formatCurrency(value)}
              labelStyle={{ color: '#D1D5DB' }}
              labelFormatter={(label) => `${label}${chartData.find(d => d.month === label)?.isProjection ? ' (projeção)' : ''}`}
            />

            <Legend wrapperStyle={{ paddingTop: '20px' }} />

            <Area
              type="monotone"
              dataKey="accounts"
              stackId="1"
              stroke="#3B82F6"
              fill="url(#gradient-accounts)"
              name="Contas"
            />
            <Area
              type="monotone"
              dataKey="investments"
              stackId="1"
              stroke="#10B981"
              fill="url(#gradient-investments)"
              name="Investimentos"
            />
            <Area
              type="monotone"
              dataKey="assets"
              stackId="1"
              stroke="#F59E0B"
              fill="url(#gradient-assets)"
              name="Bens"
            />
            <Area
              type="monotone"
              dataKey="patrimony"
              stackId="1"
              stroke="#8B5CF6"
              fill="url(#gradient-patrimony)"
              name="Patrimônio"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card-dark border border-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp size={18} className="text-green-400" />
            <span className="text-sm font-bold text-gray-400 uppercase">CAGR (Crescimento Anual)</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{cagr.toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-1">Taxa média anual de crescimento composto</p>
        </div>

        <div className="bg-card-dark border border-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp size={18} className="text-blue-400" />
            <span className="text-sm font-bold text-gray-400 uppercase">Crescimento Projetado</span>
          </div>
          <p className={`text-3xl font-bold ${totalGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalGrowth >= 0 ? '+' : ''}{totalGrowth.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Crescimento esperado em 12 meses</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          <strong>Nota:</strong> O gráfico mostra os últimos 12 meses (histórico) e próximos 12 meses (projeção com crescimento médio de 2% a.m.). Os dados históricos são simulados com base no estado atual do patrimônio.
        </p>
      </div>
    </div>
  );
};

export default PatrimonyEvolutionChart;
