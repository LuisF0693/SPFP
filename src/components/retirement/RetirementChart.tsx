import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { formatCurrency } from '../../utils';

export interface ProjectionPoint {
  age: number;
  year: number;
  projectedPatrimony: number;
  investedPatrimony: number;
  retirementTarget: number;
}

interface RetirementChartProps {
  data: ProjectionPoint[];
  currentAge: number;
  targetAge: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-xl">
        <p className="text-sm font-bold text-white mb-2">{label} anos</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="text-white font-medium">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const RetirementChart: React.FC<RetirementChartProps> = ({
  data,
  currentAge,
  targetAge
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-500">
        Configure os parâmetros para ver a projeção
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6B7280" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="age"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={{ stroke: '#475569' }}
            axisLine={{ stroke: '#475569' }}
          />

          <YAxis
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickLine={{ stroke: '#475569' }}
            axisLine={{ stroke: '#475569' }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value.toString();
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => (
              <span className="text-xs text-slate-400">{value}</span>
            )}
          />

          {/* Reference line for target age */}
          <ReferenceLine
            x={targetAge}
            stroke="#F59E0B"
            strokeDasharray="5 5"
            label={{
              value: 'Meta',
              fill: '#F59E0B',
              fontSize: 10,
              position: 'top'
            }}
          />

          {/* Target area (aposentadoria ideal) */}
          <Area
            type="monotone"
            dataKey="retirementTarget"
            name="Meta de patrimônio"
            stroke="#3B82F6"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#colorTarget)"
          />

          {/* Invested patrimony */}
          <Area
            type="monotone"
            dataKey="investedPatrimony"
            name="Patrimônio investido"
            stroke="#6B7280"
            strokeWidth={2}
            fill="url(#colorInvested)"
          />

          {/* Projected patrimony */}
          <Area
            type="monotone"
            dataKey="projectedPatrimony"
            name="Patrimônio projetado"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#colorProjected)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
