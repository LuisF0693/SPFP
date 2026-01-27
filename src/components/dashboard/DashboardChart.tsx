import React, { memo, useMemo } from 'react';
import { formatCurrency } from '../../utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { ChartDataPoint, CategoryChartData } from './dashboardUtils';

interface DashboardChartProps {
  trendData: ChartDataPoint[];
  categoryData: CategoryChartData[];
  totalExpense: number;
  currentMonth: string;
}

/**
 * Combined chart widget: 6-month cash flow trend + spending by category
 * ~160 LOC
 */
export const DashboardChart = memo<DashboardChartProps>(
  ({ trendData, categoryData, totalExpense, currentMonth }) => {
    const renderCustomLegend = useMemo(() => {
      return (props: any) => {
        const { payload } = props;
        return (
          <ul className="flex flex-col space-y-2 text-xs text-gray-300 mt-4">
            {payload.map((entry: any, index: number) => (
              <li
                key={`item-${index}`}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-300 font-medium">
                    {entry.value}
                  </span>
                </div>
                <span className="font-bold text-gray-400">
                  {Math.round(
                    (entry.payload.value / (totalExpense || 1)) * 100
                  )}
                  %
                </span>
              </li>
            ))}
          </ul>
        );
      };
    }, [totalExpense]);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Trends Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Tendência de Fluxo de Caixa
              </h3>
              <p className="text-xs text-gray-400">
                Entradas vs Saídas (Últimos 6 Meses)
              </p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#d1d5db', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#d1d5db', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#1f2937',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="Income"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="Expense"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending by Category Chart */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Gastos por Categoria
            </h3>
            <span className="text-xs text-gray-400">{currentMonth}</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[200px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    content={renderCustomLegend}
                    verticalAlign="bottom"
                    height={100}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '8px'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-300 text-xs italic">
                Sem dados suficientes
              </div>
            )}

            {categoryData.length > 0 && (
              <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-xs text-gray-300">Total</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

DashboardChart.displayName = 'DashboardChart';
