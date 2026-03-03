import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, TrendingUp, BarChart2, Filter, RefreshCw, Settings2 } from 'lucide-react';
import { supabase } from '../../../supabase';
import { useAuth } from '../../../context/AuthContext';
import { RevenueKPIs } from './RevenueKPIs';
import { RevenueChart } from './RevenueChart';
import { RecentSales } from './RecentSales';
import { StripeSettings } from './StripeSettings';
import { HotmartSettings } from './HotmartSettings';

interface RevenueEntry {
  id: string;
  source: string;
  event_type: string;
  amount: number | null;
  currency: string | null;
  product_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  status: string | null;
  external_id: string | null;
  occurred_at: string;
  created_at: string;
}

type PeriodFilter = '7d' | '30d' | '90d' | '365d';
type SourceFilter = 'all' | 'stripe' | 'hotmart';
type ChartView = 'line' | 'bar';

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
  '365d': '1 ano',
};

export const RevenueDashboard: React.FC = () => {
  const { user } = useAuth();
  const [revenues, setRevenues] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [chartView, setChartView] = useState<ChartView>('line');
  const [showSettings, setShowSettings] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const days = parseInt(period);
    const since = new Date();
    since.setDate(since.getDate() - days);

    let query = supabase
      .from('company_revenue')
      .select('*')
      .eq('user_id', user.id)
      .gte('occurred_at', since.toISOString())
      .order('occurred_at', { ascending: false });

    if (sourceFilter !== 'all') {
      query = query.eq('source', sourceFilter);
    }

    const { data, error } = await query.limit(500);
    if (!error && data) setRevenues(data);
    setLoading(false);
  }, [user, period, sourceFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('company-revenue-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'company_revenue' }, (payload) => {
        setRevenues((prev) => [payload.new as RevenueEntry, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const filtered = revenues.filter((r) => sourceFilter === 'all' || r.source === sourceFilter);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Revenue Dashboard</h2>
          <p className="text-gray-400 text-sm">
            Receita Stripe + Hotmart · {filtered.filter((r) => r.status === 'paid').length} vendas no período
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border transition-colors ${showSettings ? 'bg-accent/20 border-accent/30 text-accent' : 'glass border-white/10 text-gray-400 hover:text-white'}`}
          >
            <Settings2 size={16} />
          </button>
          <button
            onClick={load}
            className="p-2 glass border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl border border-white/5 p-6"><StripeSettings /></div>
          <div className="glass rounded-2xl border border-white/5 p-6"><HotmartSettings /></div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {(['all', 'stripe', 'hotmart'] as SourceFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sourceFilter === s ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {s === 'all' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 ml-auto">
          <button
            onClick={() => setChartView('line')}
            className={`p-1.5 rounded-lg transition-all ${chartView === 'line' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <TrendingUp size={14} />
          </button>
          <button
            onClick={() => setChartView('bar')}
            className={`p-1.5 rounded-lg transition-all ${chartView === 'bar' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <BarChart2 size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <RevenueKPIs revenues={filtered} />

          {/* Chart */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">
              {chartView === 'line' ? 'Receita por Dia (últimos 30 dias)' : 'Receita por Produto'}
            </h3>
            <RevenueChart revenues={filtered} view={chartView} />
          </div>

          {/* Recent sales */}
          <div className="glass rounded-2xl border border-white/5 p-5">
            <h3 className="text-white font-semibold mb-4 text-sm">Vendas Recentes</h3>
            <RecentSales revenues={filtered} />
          </div>
        </div>
      )}
    </div>
  );
};
