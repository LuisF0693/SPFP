import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface EvolutionDataPoint {
  date: string;
  month: string;
  value: number;
}

interface EvolutionChartProps {
  data: EvolutionDataPoint[];
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ data }) => {
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  const formatFullCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // If no data, show placeholder
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-[#637588] dark:text-[#92a4c9]">
        <p>Adicione investimentos para ver a evolução</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="evolutionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#135bec" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#135bec" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#2e374a"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#92a4c9' }}
            dy={10}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#92a4c9' }}
            tickFormatter={formatCurrency}
            width={80}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white dark:bg-[#1A2233] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium text-[#111418] dark:text-white mb-1">
                      {label}
                    </p>
                    <p className="text-lg font-bold text-[#135bec]">
                      {formatFullCurrency(payload[0].value as number)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#135bec"
            strokeWidth={3}
            fill="url(#evolutionGradient)"
            dot={false}
            activeDot={{
              r: 6,
              stroke: '#1A2233',
              strokeWidth: 2,
              fill: '#135bec',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EvolutionChart;
