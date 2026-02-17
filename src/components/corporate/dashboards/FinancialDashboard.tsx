/**
 * FinancialDashboard
 * Dashboard Financeiro com gráficos e tabelas (US-403)
 */

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { financialMockData, formatCurrency, getDaysUntilDue, isOverdue, isDueToday, isDueSoon } from '@/data/financialData';

type PeriodFilter = 'mes' | 'trimestre' | 'ano';

export function FinancialDashboard() {
  const [period, setPeriod] = useState<PeriodFilter>('mes');

  // Calculate metrics
  const currentRevenue = useMemo(() => {
    return financialMockData.monthlyData[financialMockData.monthlyData.length - 1]?.revenue || 0;
  }, []);

  const currentExpense = useMemo(() => {
    return financialMockData.monthlyData[financialMockData.monthlyData.length - 1]?.expense || 0;
  }, []);

  const netIncome = useMemo(() => {
    return currentRevenue - currentExpense;
  }, [currentRevenue, currentExpense]);

  const margin = useMemo(() => {
    return currentRevenue > 0 ? ((netIncome / currentRevenue) * 100).toFixed(1) : '0';
  }, [currentRevenue, netIncome]);

  // Filter data based on period
  const filteredData = useMemo(() => {
    const data = financialMockData.monthlyData;
    switch (period) {
      case 'trimestre':
        return data.slice(-3);
      case 'ano':
        return data;
      case 'mes':
      default:
        return data.slice(-6);
    }
  }, [period]);

  const payableOverdue = useMemo(() => {
    return financialMockData.accountsPayable.filter((ap) => isOverdue(ap.dueDate)).length;
  }, []);

  const receivableOverdue = useMemo(() => {
    return financialMockData.accountsReceivable.filter((ar) => isOverdue(ar.dueDate)).length;
  }, []);

  return (
    <div className="space-y-6 p-6 bg-slate-800 rounded-lg">
      {/* Header com filtro */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Dashboard Financeiro</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
          className="px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 text-sm"
        >
          <option value="mes">Último Mês</option>
          <option value="trimestre">Último Trimestre</option>
          <option value="ano">Último Ano</option>
        </select>
      </div>

      {/* Cards - Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Saldo Atual */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 p-4 rounded-lg border border-emerald-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300 text-sm font-semibold">Saldo Atual</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(financialMockData.balance)}</p>
          <p className="text-xs text-emerald-300 mt-1">Disponível</p>
        </div>

        {/* Receita Mês */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-4 rounded-lg border border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-300 text-sm font-semibold">Receita Mês</span>
            <TrendingUp size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(currentRevenue)}</p>
          <p className="text-xs text-blue-300 mt-1">Entrada</p>
        </div>

        {/* Despesa Mês */}
        <div className="bg-gradient-to-br from-red-900 to-red-800 p-4 rounded-lg border border-red-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-300 text-sm font-semibold">Despesa Mês</span>
            <TrendingDown size={18} className="text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(currentExpense)}</p>
          <p className="text-xs text-red-300 mt-1">Saída</p>
        </div>

        {/* Lucro Líquido */}
        <div className={`bg-gradient-to-br p-4 rounded-lg border ${
          netIncome >= 0
            ? 'from-purple-900 to-purple-800 border-purple-700'
            : 'from-orange-900 to-orange-800 border-orange-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${netIncome >= 0 ? 'text-purple-300' : 'text-orange-300'}`}>
              Lucro Líquido
            </span>
            <DollarSign size={18} className={netIncome >= 0 ? 'text-purple-400' : 'text-orange-400'} />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(netIncome)}</p>
          <p className={`text-xs mt-1 ${netIncome >= 0 ? 'text-purple-300' : 'text-orange-300'}`}>
            Margem: {margin}%
          </p>
        </div>
      </div>

      {/* Gráfico Receita vs Despesa */}
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-4">Receita vs Despesa</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#10B981" name="Receita" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" fill="#EF4444" name="Despesa" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico Fluxo de Caixa Projetado */}
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-4">Fluxo de Caixa - Próximos 3 Meses</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={financialMockData.cashFlowProjection}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#f1f5f9' }}
              formatter={(value) => formatCurrency(value as number)}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ fill: '#6366F1', r: 5 }}
              name="Projeção"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Contas a Pagar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">Contas a Pagar ({financialMockData.accountsPayable.length})</h4>
            {payableOverdue > 0 && (
              <span className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded flex items-center gap-1">
                <AlertCircle size={12} />
                {payableOverdue} vencida(s)
              </span>
            )}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {financialMockData.accountsPayable.slice(0, 5).map((ap) => {
              const daysUntil = getDaysUntilDue(ap.dueDate);
              const isOver = isOverdue(ap.dueDate);
              const isToday = isDueToday(ap.dueDate);
              const isSoon = isDueSoon(ap.dueDate);

              return (
                <div
                  key={ap.id}
                  className={`p-2 rounded text-sm border ${
                    isOver
                      ? 'bg-red-900/20 border-red-700 text-red-200'
                      : isToday
                        ? 'bg-orange-900/20 border-orange-700 text-orange-200'
                        : isSoon
                          ? 'bg-yellow-900/20 border-yellow-700 text-yellow-200'
                          : 'bg-slate-600/20 border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{ap.description}</p>
                      <p className="text-xs opacity-75">
                        {isOver
                          ? `Vencido há ${Math.abs(daysUntil)} dia(s)`
                          : `Vence em ${daysUntil} dia(s)`}
                      </p>
                    </div>
                    <p className="font-bold whitespace-nowrap ml-2">{formatCurrency(ap.amount)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-2">Total: {formatCurrency(financialMockData.accountsPayable.reduce((s, ap) => s + ap.amount, 0))}</p>
        </div>

        {/* Contas a Receber */}
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">Contas a Receber ({financialMockData.accountsReceivable.length})</h4>
            {receivableOverdue > 0 && (
              <span className="text-xs bg-orange-900 text-orange-200 px-2 py-1 rounded flex items-center gap-1">
                <AlertCircle size={12} />
                {receivableOverdue} vencida(s)
              </span>
            )}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {financialMockData.accountsReceivable.map((ar) => {
              const daysUntil = getDaysUntilDue(ar.dueDate);
              const isOver = isOverdue(ar.dueDate);
              const isToday = isDueToday(ar.dueDate);
              const isSoon = isDueSoon(ar.dueDate);

              return (
                <div
                  key={ar.id}
                  className={`p-2 rounded text-sm border ${
                    isOver
                      ? 'bg-red-900/20 border-red-700 text-red-200'
                      : isToday
                        ? 'bg-green-900/20 border-green-700 text-green-200'
                        : isSoon
                          ? 'bg-blue-900/20 border-blue-700 text-blue-200'
                          : 'bg-slate-600/20 border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{ar.description}</p>
                      <p className="text-xs opacity-75">
                        {isOver
                          ? `Vencido há ${Math.abs(daysUntil)} dia(s)`
                          : `Vence em ${daysUntil} dia(s)`}
                      </p>
                    </div>
                    <p className="font-bold whitespace-nowrap ml-2 text-green-300">{formatCurrency(ar.amount)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-2">Total: {formatCurrency(financialMockData.accountsReceivable.reduce((s, ar) => s + ar.amount, 0))}</p>
        </div>
      </div>
    </div>
  );
}
