/**
 * Partner Performance Chart
 * FASE 3: STY-079 (CRM Financial Dashboard - Partner Performance)
 *
 * Visualizes partner performance metrics over time
 */

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Partner } from '../types/partnership';
import { formatCurrency } from '../utils';

interface PartnerPerformanceChartProps {
  partners: Partner[];
  selectedPeriod?: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
}

export const PartnerPerformanceChart: React.FC<PartnerPerformanceChartProps> = ({
  partners,
  selectedPeriod = 'MONTHLY'
}) => {
  // Commission breakdown by partner
  const commissionData = useMemo(() => {
    const safePartners = Array.isArray(partners) ? partners : [];
    return safePartners
      .filter(p => !p.deletedAt)
      .map(p => ({
        name: p.name,
        commission: p.totalCommissions / 12,
        aum: p.totalAUM / 1000000 // Convert to millions
      }))
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 8);
  }, [partners]);

  // KPI completion distribution
  const kpiDistribution = useMemo(() => {
    const safePartners = Array.isArray(partners) ? partners : [];
    const completed = safePartners.filter(p => !p.deletedAt && p.kpis.every(k => k.current >= k.target)).length;
    const partial = safePartners.filter(p => !p.deletedAt && p.kpis.some(k => k.current >= k.target) && !p.kpis.every(k => k.current >= k.target)).length;
    const notStarted = safePartners.filter(p => !p.deletedAt && p.kpis.every(k => k.current < k.target)).length;

    return [
      { name: 'Completos', value: completed, color: '#10B981' },
      { name: 'Parciais', value: partial, color: '#F59E0B' },
      { name: 'Não Iniciados', value: notStarted, color: '#EF4444' }
    ];
  }, [partners]);

  // Performance trend (simulated monthly data)
  const trendData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const safePartners = Array.isArray(partners) ? partners : [];
    const activePartners = safePartners.filter(p => !p.deletedAt);

    return months.map((month, idx) => ({
      month,
      totalAUM: activePartners.reduce((sum, p) => sum + p.totalAUM, 0) * (0.95 + (idx * 0.02)),
      avgCommission: activePartners.reduce((sum, p) => sum + (p.totalCommissions / 12), 0) / activePartners.length,
      clientCount: activePartners.reduce((sum, p) => sum + p.clientsManaged, 0)
    }));
  }, [partners]);

  return (
    <div className="space-y-6">
      {/* Commission by Partner (Bar Chart) */}
      <div className="bg-card-dark border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Comissão Mensal por Parceiro</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={commissionData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => formatCurrency(value)}
              labelStyle={{ color: '#D1D5DB' }}
            />
            <Bar dataKey="commission" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Analysis (Line Chart) */}
      <div className="bg-card-dark border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Evolução Trimestral</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" yAxisId="left" />
            <YAxis stroke="#9CA3AF" yAxisId="right" orientation="right" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#D1D5DB' }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="totalAUM"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 4 }}
              name="Total AUM"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="clientCount"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={{ fill: '#F59E0B', r: 4 }}
              name="Clientes"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* KPI Completion Distribution (Pie Chart) */}
      <div className="bg-card-dark border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Distribuição de Conclusão de KPIs</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={kpiDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {kpiDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} parceiros`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card-dark border border-gray-800 rounded-xl p-4">
          <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Comissão Média</span>
          <span className="text-2xl font-bold text-green-400">
            {formatCurrency(partners.filter(p => !p.deletedAt).reduce((sum, p) => sum + p.totalCommissions, 0) / (partners.filter(p => !p.deletedAt).length || 1) / 12)}
          </span>
        </div>

        <div className="bg-card-dark border border-gray-800 rounded-xl p-4">
          <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Taxa KPI Média</span>
          <span className="text-2xl font-bold text-blue-400">
            {(
              partners
                .filter(p => !p.deletedAt)
                .reduce((sum, p) => sum + (p.kpis.filter(k => k.current >= k.target).length / p.kpis.length || 0), 0) /
              (partners.filter(p => !p.deletedAt).length || 1) *
              100
            ).toFixed(1)}%
          </span>
        </div>

        <div className="bg-card-dark border border-gray-800 rounded-xl p-4">
          <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Total Gerenciado</span>
          <span className="text-2xl font-bold text-purple-400">
            {formatCurrency(partners.filter(p => !p.deletedAt).reduce((sum, p) => sum + p.totalAUM, 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PartnerPerformanceChart;
