import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface RevenueEntry {
  amount: number | null;
  status: string | null;
  occurred_at: string;
  source: string;
  product_name: string | null;
}

interface Props {
  revenues: RevenueEntry[];
  view: 'line' | 'bar';
}

const COLORS = { stripe: '#6366f1', hotmart: '#f97316' };

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const RevenueChart: React.FC<Props> = ({ revenues, view }) => {
  const paid = revenues.filter((r) => r.status === 'paid' && r.amount);

  // Dados para gráfico de linha (últimos 30 dias por dia)
  const lineData = useMemo(() => {
    const days: Record<string, { date: string; stripe: number; hotmart: number }> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { date: key.slice(5), stripe: 0, hotmart: 0 }; // MM-DD
    }
    paid.forEach((r) => {
      const key = r.occurred_at.slice(0, 10);
      if (days[key]) {
        days[key][r.source as 'stripe' | 'hotmart'] += r.amount || 0;
      }
    });
    return Object.values(days);
  }, [paid]);

  // Dados para gráfico de barras (por produto)
  const barData = useMemo(() => {
    const products: Record<string, { name: string; stripe: number; hotmart: number }> = {};
    paid.forEach((r) => {
      const key = r.product_name || 'Sem produto';
      if (!products[key]) products[key] = { name: key, stripe: 0, hotmart: 0 };
      products[key][r.source as 'stripe' | 'hotmart'] += r.amount || 0;
    });
    return Object.values(products).sort((a, b) => (b.stripe + b.hotmart) - (a.stripe + a.hotmart)).slice(0, 8);
  }, [paid]);

  const tooltipStyle = {
    backgroundColor: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 12,
  };

  if (paid.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        Nenhuma receita registrada ainda
      </div>
    );
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        {view === 'line' ? (
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
            <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={((v: number) => fmt(v)) as any} contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="stripe" name="Stripe" stroke={COLORS.stripe} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="hotmart" name="Hotmart" stroke={COLORS.hotmart} strokeWidth={2} dot={false} />
          </LineChart>
        ) : (
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} />
            <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={((v: number) => fmt(v)) as any} contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="stripe" name="Stripe" fill={COLORS.stripe} radius={[4, 4, 0, 0]} />
            <Bar dataKey="hotmart" name="Hotmart" fill={COLORS.hotmart} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
