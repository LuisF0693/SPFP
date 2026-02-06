import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { formatCurrency } from '../../utils';

interface CategoryExpense {
  name: string;
  value: number;
  color: string;
  group: string;
}

interface BudgetChartProps {
  income: number;
  expenses: CategoryExpense[];
  showWithGoals?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-xl">
        <p className="text-sm font-bold text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-slate-400">{entry.name}</span>
            </div>
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

export const BudgetChart: React.FC<BudgetChartProps> = ({
  income,
  expenses,
  showWithGoals = false
}) => {
  // Group expenses by category group
  const fixedExpenses = expenses
    .filter(e => e.group === 'FIXED')
    .reduce((sum, e) => sum + e.value, 0);

  const variableExpenses = expenses
    .filter(e => e.group === 'VARIABLE')
    .reduce((sum, e) => sum + e.value, 0);

  const investmentExpenses = expenses
    .filter(e => e.group === 'INVESTMENT')
    .reduce((sum, e) => sum + e.value, 0);

  const totalExpenses = fixedExpenses + variableExpenses + investmentExpenses;

  const chartData = [
    {
      name: 'Renda',
      renda: income,
      fixos: 0,
      variaveis: 0,
      investimentos: 0
    },
    {
      name: 'Gastos',
      renda: 0,
      fixos: fixedExpenses,
      variaveis: variableExpenses,
      investimentos: investmentExpenses
    }
  ];

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Renda vs Gastos</h3>
        <div className="flex items-center gap-2 text-xs">
          <span className={totalExpenses > income ? 'text-rose-400' : 'text-emerald-400'}>
            {totalExpenses > income ? 'Déficit' : 'Superávit'}:
          </span>
          <span className={`font-bold ${totalExpenses > income ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formatCurrency(Math.abs(income - totalExpenses))}
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="30%">
            <XAxis
              dataKey="name"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#475569' }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#475569' }}
              axisLine={{ stroke: '#475569' }}
              tickFormatter={(value) => {
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

            {/* Renda */}
            <Bar dataKey="renda" name="Renda" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />

            {/* Despesas Fixas */}
            <Bar dataKey="fixos" name="Despesas Fixas" stackId="b" fill="#3B82F6" />

            {/* Despesas Variáveis */}
            <Bar dataKey="variaveis" name="Despesas Variáveis" stackId="b" fill="#F59E0B" />

            {/* Investimentos */}
            <Bar dataKey="investimentos" name="Investimentos" stackId="b" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Custom */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs justify-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-slate-400">Renda</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-slate-400">Despesas Fixas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-slate-400">Despesas Variáveis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span className="text-slate-400">Investimentos</span>
        </div>
      </div>
    </div>
  );
};
