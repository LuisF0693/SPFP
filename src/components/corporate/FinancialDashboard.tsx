/**
 * FinancialDashboard - Dashboard Financeiro
 * Receita vs Despesa, DRE, Fluxo de Caixa
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const monthlyData = [
  { month: 'Jan', receita: 28500, despesa: 18200 },
  { month: 'Fev', receita: 32000, despesa: 19500 },
  { month: 'Mar', receita: 29800, despesa: 17800 },
  { month: 'Abr', receita: 35200, despesa: 21000 },
  { month: 'Mai', receita: 38000, despesa: 22500 },
  { month: 'Jun', receita: 42000, despesa: 25000 },
];

const projectionData = [
  { month: 'Fev', saldo: 45230 },
  { month: 'Mar', saldo: 47000 },
  { month: 'Abr', saldo: 49500 },
];

export function FinancialDashboard() {
  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-700 p-4 rounded">
          <p className="text-slate-400 text-sm">Saldo Atual</p>
          <p className="text-green-400 text-2xl font-bold">R$ 45.230,00</p>
        </div>
        <div className="bg-slate-700 p-4 rounded">
          <p className="text-slate-400 text-sm">Receita (Mês)</p>
          <p className="text-blue-400 text-2xl font-bold">R$ 42.000,00</p>
        </div>
        <div className="bg-slate-700 p-4 rounded">
          <p className="text-slate-400 text-sm">Despesa (Mês)</p>
          <p className="text-red-400 text-2xl font-bold">R$ 25.000,00</p>
        </div>
      </div>

      {/* Gráfico Receita vs Despesa */}
      <div className="bg-slate-700 p-4 rounded">
        <h3 className="text-lg font-semibold text-white mb-4">Receita vs Despesa (6 meses)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '4px',
              }}
            />
            <Legend />
            <Bar dataKey="receita" fill="#10B981" name="Receita" />
            <Bar dataKey="despesa" fill="#EF4444" name="Despesa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Fluxo de Caixa Projetado */}
      <div className="bg-slate-700 p-4 rounded">
        <h3 className="text-lg font-semibold text-white mb-4">Fluxo de Caixa Projetado (3 meses)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={projectionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '4px',
              }}
            />
            <Line type="monotone" dataKey="saldo" stroke="#3B82F6" strokeWidth={2} name="Saldo Projetado" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Contas a Pagar / Receber */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700 p-4 rounded">
          <h4 className="text-white font-semibold mb-2">Contas a Pagar (5)</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Aluguel</span>
              <span className="text-red-400">R$ 2.500 - 15/02</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Internet</span>
              <span className="text-red-400">R$ 200 - 20/02</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Energia</span>
              <span className="text-red-400">R$ 450 - 25/02</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-700 p-4 rounded">
          <h4 className="text-white font-semibold mb-2">Contas a Receber (3)</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Cliente A</span>
              <span className="text-green-400">R$ 5.000 - 20/02</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Cliente B</span>
              <span className="text-green-400">R$ 3.200 - 25/02</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Serviço XYZ</span>
              <span className="text-green-400">R$ 1.500 - 28/02</span>
            </div>
          </div>
        </div>
      </div>

      {/* DRE Simplificado */}
      <div className="bg-slate-700 p-4 rounded">
        <h4 className="text-white font-semibold mb-4">DRE Mês Atual</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-300">Receita Total</span>
            <span className="text-white">+ R$ 42.000,00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Custos Variáveis</span>
            <span className="text-white">- R$ 12.000,00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Despesas Fixas</span>
            <span className="text-white">- R$ 8.500,00</span>
          </div>
          <div className="border-t border-slate-600 pt-2 flex justify-between">
            <span className="text-green-400 font-bold">Lucro Líquido</span>
            <span className="text-green-400 font-bold">R$ 21.500,00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
