import React, { useMemo } from 'react';
import { DollarSign, Users, TrendingUp, Download, BarChart3 } from 'lucide-react';
import { usePartnerships } from '../../hooks/usePartnerships';
import { formatCurrency } from '../../utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export const CRMFinanceiro: React.FC = () => {
  const { clients, loading } = usePartnerships();

  const stats = useMemo(() => {
    const active = clients.filter(c => c.status === 'paid' || c.status === 'pending');
    const mrr = active.reduce((sum, c) => {
      const monthly = (c as any).recurring_amount || c.my_share || 0;
      return sum + monthly;
    }, 0);
    const ticketMedio = active.length > 0
      ? active.reduce((s, c) => s + c.contract_value, 0) / active.length
      : 0;
    const totalComissoes = active.reduce((s, c) => s + c.my_share, 0);
    return { mrr, ticketMedio, totalClientes: active.length, totalComissoes };
  }, [clients]);

  const chartData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months[key] = 0;
    }
    clients.forEach(c => {
      if (!c.closed_at) return;
      const d = new Date(c.closed_at);
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      if (key in months) months[key] += c.my_share || 0;
    });
    return Object.entries(months).map(([name, value]) => ({ name, value }));
  }, [clients]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-blue-400" size={24} />
            Financeiro do Negócio
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Receitas e comissões das parcerias · separado das finanças pessoais
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm transition-all"
        >
          <Download size={16} />
          Exportar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: formatCurrency(stats.mrr), icon: TrendingUp, color: 'text-green-400', bg: 'from-green-500/10' },
          { label: 'Ticket Médio', value: formatCurrency(stats.ticketMedio), icon: BarChart3, color: 'text-blue-400', bg: 'from-blue-500/10' },
          { label: 'Clientes', value: stats.totalClientes.toString(), icon: Users, color: 'text-purple-400', bg: 'from-purple-500/10' },
          { label: 'Total Comissões', value: formatCurrency(stats.totalComissoes), icon: DollarSign, color: 'text-yellow-400', bg: 'from-yellow-500/10' },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.bg} to-transparent border border-white/10 rounded-2xl p-4 backdrop-blur-md`}>
            <card.icon className={card.color} size={20} />
            <p className="text-gray-400 text-xs mt-2">{card.label}</p>
            <p className="text-white text-xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-400" />
          Evolução de Receita — Últimos 6 meses
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: number) => formatCurrency(v)}
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={i === chartData.length - 1 ? '#3B82F6' : '#3B82F650'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white font-semibold">Receitas por Cliente</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium px-4 py-3">Cliente</th>
                <th className="text-right text-gray-400 font-medium px-4 py-3">Valor Contrato</th>
                <th className="text-right text-gray-400 font-medium px-4 py-3">Minha Comissão</th>
                <th className="text-center text-gray-400 font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-8">
                    Nenhum cliente cadastrado
                  </td>
                </tr>
              ) : (
                clients.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white">{c.client_name}</td>
                    <td className="px-4 py-3 text-right text-gray-300">{formatCurrency(c.contract_value)}</td>
                    <td className="px-4 py-3 text-right text-green-400 font-medium">{formatCurrency(c.my_share)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {c.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
