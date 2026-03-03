import React from 'react';

interface RevenueEntry {
  id: string;
  amount: number | null;
  currency: string | null;
  status: string | null;
  occurred_at: string;
  source: string;
  product_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  event_type: string;
}

interface Props {
  revenues: RevenueEntry[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  paid:      { label: 'Pago',       color: 'bg-emerald-500/20 text-emerald-400' },
  refunded:  { label: 'Reembolsado', color: 'bg-amber-500/20 text-amber-400' },
  cancelled: { label: 'Cancelado',  color: 'bg-red-500/20 text-red-400' },
  pending:   { label: 'Pendente',   color: 'bg-gray-500/20 text-gray-400' },
};

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  stripe:  { label: 'Stripe',  color: 'bg-violet-500/20 text-violet-400' },
  hotmart: { label: 'Hotmart', color: 'bg-orange-500/20 text-orange-400' },
};

function fmt(amount: number | null, currency: string | null): string {
  if (amount === null) return '—';
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: currency || 'BRL' });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export const RecentSales: React.FC<Props> = ({ revenues }) => {
  const sorted = [...revenues].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()).slice(0, 50);

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
        Nenhuma venda registrada ainda
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-widest">
            <th className="pb-2 text-left">Data</th>
            <th className="pb-2 text-left">Produto</th>
            <th className="pb-2 text-left">Cliente</th>
            <th className="pb-2 text-right">Valor</th>
            <th className="pb-2 text-center">Fonte</th>
            <th className="pb-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const status = STATUS_CONFIG[r.status || ''] || { label: r.status || '?', color: 'bg-gray-500/20 text-gray-400' };
            const source = SOURCE_CONFIG[r.source] || { label: r.source, color: 'bg-gray-500/20 text-gray-400' };
            return (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="py-3 text-gray-400 whitespace-nowrap">{fmtDate(r.occurred_at)}</td>
                <td className="py-3 text-white max-w-[160px] truncate">{r.product_name || <span className="text-gray-600">—</span>}</td>
                <td className="py-3 text-gray-300 max-w-[140px]">
                  <div className="truncate">{r.customer_name || <span className="text-gray-600">—</span>}</div>
                  {r.customer_email && <div className="text-gray-500 text-xs truncate">{r.customer_email}</div>}
                </td>
                <td className="py-3 text-right font-semibold text-white whitespace-nowrap">
                  {fmt(r.amount, r.currency)}
                </td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${source.color}`}>
                    {source.label}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
