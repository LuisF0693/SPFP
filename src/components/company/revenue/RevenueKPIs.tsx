import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, XCircle } from 'lucide-react';

interface RevenueEntry {
  amount: number | null;
  status: string | null;
  occurred_at: string;
  source: string;
}

interface Props {
  revenues: RevenueEntry[];
}

function fmt(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export const RevenueKPIs: React.FC<Props> = ({ revenues }) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const paid = revenues.filter((r) => r.status === 'paid' && r.amount);
  const cancelled = revenues.filter((r) => (r.status === 'cancelled' || r.status === 'refunded'));

  const monthPaid = paid.filter((r) => new Date(r.occurred_at) >= startOfMonth);
  const yearPaid = paid.filter((r) => new Date(r.occurred_at) >= startOfYear);
  const monthCancelled = cancelled.filter((r) => new Date(r.occurred_at) >= startOfMonth);

  const totalMonth = monthPaid.reduce((s, r) => s + (r.amount || 0), 0);
  const totalYear = yearPaid.reduce((s, r) => s + (r.amount || 0), 0);
  const mrr = totalMonth; // simplificado: total do mês como proxy de MRR
  const arr = mrr * 12;
  const churnCount = monthCancelled.length;

  const kpis = [
    {
      label: 'MRR',
      value: fmt(mrr),
      sub: 'Receita recorrente mensal',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'ARR',
      value: fmt(arr),
      sub: 'Projeção anual (MRR × 12)',
      icon: TrendingUp,
      color: 'text-accent',
      bg: 'bg-accent/10 border-accent/20',
    },
    {
      label: 'Total do Mês',
      value: fmt(totalMonth),
      sub: `${monthPaid.length} transações`,
      icon: DollarSign,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Total do Ano',
      value: fmt(totalYear),
      sub: `${yearPaid.length} transações`,
      icon: DollarSign,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Cancelamentos',
      value: String(churnCount),
      sub: 'Este mês',
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
    },
    {
      label: 'Reembolsos',
      value: fmt(monthCancelled.reduce((s, r) => s + (r.amount || 0), 0)),
      sub: 'Este mês',
      icon: TrendingDown,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className={`glass rounded-2xl border p-4 ${kpi.bg}`}>
            <div className={`${kpi.color} mb-2`}>
              <Icon size={18} />
            </div>
            <p className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-white text-xs font-semibold mt-0.5">{kpi.label}</p>
            <p className="text-gray-500 text-xs mt-0.5">{kpi.sub}</p>
          </div>
        );
      })}
    </div>
  );
};
