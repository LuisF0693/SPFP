import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export interface AllocationData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface AssetAllocationProps {
  data: AllocationData[];
  loading?: boolean;
}

const COLORS = {
  'Renda Variável': '#135bec',
  'Fundos Imobiliários': '#8b5cf6',
  'Renda Fixa': '#14b8a6',
  'Internacional': '#f59e0b',
  'Fundos': '#ec4899',
  'Outros': '#6b7280',
};

export const AssetAllocation: React.FC<AssetAllocationProps> = ({ data, loading }) => {
  const totalAssets = data.reduce((acc, item) => acc + (item.value > 0 ? 1 : 0), 0);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: value >= 1000000 ? 'compact' : 'standard',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1A2233] border border-[#e6e8eb] dark:border-[#2e374a] p-6 shadow-sm flex flex-col">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6" />
        <div className="flex items-center justify-center py-4 mb-6">
          <div className="w-48 h-48 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // If no data, show empty state
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1A2233] border border-[#e6e8eb] dark:border-[#2e374a] p-6 shadow-sm flex flex-col">
        <h3 className="text-[#111418] dark:text-white text-lg font-bold mb-6">
          Alocação de Ativos
        </h3>
        <div className="flex-1 flex items-center justify-center text-[#637588] dark:text-[#92a4c9] text-center">
          <div>
            <p>Nenhum investimento cadastrado.</p>
            <p className="text-sm mt-1">Adicione seu primeiro aporte!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A2233] border border-[#e6e8eb] dark:border-[#2e374a] p-6 shadow-sm flex flex-col">
      <h3 className="text-[#111418] dark:text-white text-lg font-bold mb-6">
        Alocação de Ativos
      </h3>

      {/* Donut Chart */}
      <div className="flex items-center justify-center py-4 mb-6 relative">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data.filter((d) => d.value > 0)}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data
                .filter((d) => d.value > 0)
                .map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || COLORS[entry.name as keyof typeof COLORS] || COLORS['Outros']}
                  />
                ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as AllocationData;
                  return (
                    <div className="bg-white dark:bg-[#1A2233] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg p-2 shadow-lg">
                      <p className="text-sm font-medium text-[#111418] dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-[#637588] dark:text-[#92a4c9]">
                        {formatCurrency(item.value)} ({item.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs text-[#637588] dark:text-[#92a4c9]">Total Ativos</p>
            <p className="text-xl font-bold text-[#111418] dark:text-white">{totalAssets}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3">
        {data
          .filter((d) => d.value > 0)
          .map((item) => (
            <div key={item.name}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        item.color || COLORS[item.name as keyof typeof COLORS] || COLORS['Outros'],
                    }}
                  />
                  <span className="text-sm font-medium text-[#111418] dark:text-white">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-[#111418] dark:text-white">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-[#f0f2f5] dark:bg-[#111722] h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor:
                      item.color || COLORS[item.name as keyof typeof COLORS] || COLORS['Outros'],
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AssetAllocation;
