/**
 * Acquisition Component — STY-014
 * Simulador comparativo: Financiamento × Consórcio × Investimento
 * Inclui SELIC via API BACEN e integração com FinnWidget
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatCurrency } from '../utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Building, Car, Calculator, TrendingUp, Landmark, Coins, MessageCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  simularAquisicao,
  fetchSELIC,
  type SimulatorInput,
  type SimulationResult,
} from '../services/acquisitionSimulator';

type AssetType = 'REAL_ESTATE' | 'VEHICLE';

const ASSET_DEFAULTS: Record<AssetType, Partial<SimulatorInput>> = {
  REAL_ESTATE: {
    assetValue: 500000,
    downPayment: 20,
    term: 360,
    interestRate: 12,
    adminRate: 18,
    system: 'PRICE',
  },
  VEHICLE: {
    assetValue: 80000,
    downPayment: 30,
    term: 48,
    interestRate: 24,
    adminRate: 15,
    system: 'PRICE',
  },
};

const TYPE_CONFIG: Record<SimulationResult['type'], { color: string; bg: string; icon: React.ElementType }> = {
  financiamento: { color: '#EF4444', bg: 'from-red-500/10',    icon: Landmark },
  consorcio:     { color: '#3B82F6', bg: 'from-blue-500/10',   icon: Coins },
  investimento:  { color: '#10B981', bg: 'from-green-500/10',  icon: TrendingUp },
};

export const Acquisition: React.FC = () => {
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [assetType, setAssetType] = useState<AssetType>('REAL_ESTATE');
  const [selic, setSelic] = useState<number>(10.5);
  const [selicLoading, setSelicLoading] = useState(false);
  const [selicSource, setSelicSource] = useState<'api' | 'fallback'>('fallback');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [input, setInput] = useState<SimulatorInput>({
    ...ASSET_DEFAULTS.REAL_ESTATE,
    returnRate: 10.5,
  } as SimulatorInput);

  const [results, setResults] = useState<SimulationResult[]>([]);

  // Busca SELIC no mount
  useEffect(() => {
    setSelicLoading(true);
    fetchSELIC().then(rate => {
      setSelic(rate);
      setInput(prev => ({ ...prev, returnRate: rate }));
      setSelicSource('api');
    }).catch(() => {
      setSelicSource('fallback');
    }).finally(() => setSelicLoading(false));
  }, []);

  // Recalcula com debounce 300ms
  const recalculate = useCallback((inp: SimulatorInput) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResults(simularAquisicao(inp));
    }, 300);
  }, []);

  // Recalcula sempre que input muda
  useEffect(() => {
    recalculate(input);
    return () => clearTimeout(debounceRef.current);
  }, [input, recalculate]);

  const handleAssetTypeChange = (type: AssetType) => {
    setAssetType(type);
    setInput(prev => ({ ...prev, ...ASSET_DEFAULTS[type] }));
  };

  const handleField = (field: keyof SimulatorInput, value: number | string) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const openFinn = () => {
    if (!results.length) return;
    const best = results[0];
    const context = encodeURIComponent(
      `simulacao-aquisicao:${assetType}:${input.assetValue}:melhor=${best.label}:custo=${best.totalCost}`
    );
    void navigate(`/insights?context=${context}&source=widget`);
  };

  const bestOption = results[0];
  const chartData = results.map(r => ({ name: r.label, value: r.totalCost, type: r.type }));

  return (
    <main className="p-4 md:p-6 min-h-full space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Calculator className="text-blue-500" size={28} />
            Simulador de Aquisição
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Compare Financiamento × Consórcio × Investimento com dados reais do BACEN
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          {selicLoading ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : (
            <TrendingUp size={12} className={selicSource === 'api' ? 'text-green-400' : 'text-yellow-400'} />
          )}
          <span>SELIC: <strong className="text-white">{selic.toFixed(2)}% a.a.</strong></span>
          {selicSource === 'api' && <span className="text-green-400">● ao vivo</span>}
        </div>
      </div>

      {/* Asset Type Selector */}
      <div className="flex gap-3">
        {(['REAL_ESTATE', 'VEHICLE'] as AssetType[]).map(type => (
          <button
            key={type}
            onClick={() => handleAssetTypeChange(type)}
            className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-semibold ${
              assetType === type
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {type === 'REAL_ESTATE' ? <Building size={20} /> : <Car size={20} />}
            {type === 'REAL_ESTATE' ? 'Imóvel' : 'Veículo'}
          </button>
        ))}
      </div>

      {/* Inputs principais */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <h2 className="text-white font-semibold">Parâmetros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-gray-400 text-sm">Valor do bem</span>
            <input
              type="number"
              value={input.assetValue}
              onChange={e => handleField('assetValue', Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </label>
          <label className="space-y-1">
            <span className="text-gray-400 text-sm">Entrada (%)</span>
            <input
              type="number"
              min={0} max={100}
              value={input.downPayment}
              onChange={e => handleField('downPayment', Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </label>
          <label className="space-y-1">
            <span className="text-gray-400 text-sm">Prazo (meses)</span>
            <input
              type="number"
              min={6}
              value={input.term}
              onChange={e => handleField('term', Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </label>
          <label className="space-y-1">
            <span className="text-gray-400 text-sm">Juros financiamento (% a.a.)</span>
            <input
              type="number"
              step={0.1}
              value={input.interestRate}
              onChange={e => handleField('interestRate', Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </label>
        </div>

        {/* Avançado */}
        <button
          onClick={() => setShowAdvanced(v => !v)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <ChevronDown size={14} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          Parâmetros avançados
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/10">
            <label className="space-y-1">
              <span className="text-gray-400 text-sm">Taxa adm consórcio (%)</span>
              <input
                type="number"
                step={0.5}
                value={input.adminRate}
                onChange={e => handleField('adminRate', Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </label>
            <label className="space-y-1">
              <span className="text-gray-400 text-sm">Rendimento investimento (% a.a.)</span>
              <input
                type="number"
                step={0.1}
                value={input.returnRate}
                onChange={e => handleField('returnRate', Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </label>
            <label className="space-y-1">
              <span className="text-gray-400 text-sm">Sistema amortização</span>
              <select
                value={input.system}
                onChange={e => handleField('system', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="PRICE">PRICE (parcela fixa)</option>
                <option value="SAC">SAC (amortização constante)</option>
              </select>
            </label>
          </div>
        )}
      </div>

      {/* Cards de resultado */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.map((r, i) => {
            const cfg = TYPE_CONFIG[r.type];
            const Icon = cfg.icon;
            const isBest = i === 0;

            return (
              <div
                key={r.type}
                className={`relative bg-gradient-to-br ${cfg.bg} to-transparent border rounded-2xl p-5 backdrop-blur-md transition-all ${
                  isBest
                    ? 'border-[2px] shadow-lg'
                    : 'border-white/10'
                }`}
                style={isBest ? { borderColor: cfg.color, boxShadow: `0 0 30px ${cfg.color}30` } : {}}
              >
                {isBest && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full text-white"
                    style={{ background: cfg.color }}
                  >
                    Melhor opção
                  </span>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <Icon size={20} style={{ color: cfg.color }} />
                  <h3 className="text-white font-bold">{r.label}</h3>
                </div>

                <p className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(r.totalCost)}
                </p>
                <p className="text-gray-400 text-xs mb-3">custo total</p>

                <div className="flex justify-between text-sm mb-4">
                  <div>
                    <p className="text-gray-400 text-xs">Parcela</p>
                    <p className="text-white font-medium">{r.monthlyPayment > 0 ? formatCurrency(r.monthlyPayment) : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Prazo</p>
                    <p className="text-white font-medium">{r.term > 0 ? `${r.term}m` : '—'}</p>
                  </div>
                </div>

                {r.detail && (
                  <p className="text-xs text-gray-500 mb-3">{r.detail}</p>
                )}

                <div className="space-y-1">
                  {r.pros.map(p => (
                    <p key={p} className="text-xs text-green-400 flex items-center gap-1">
                      <span>✓</span> {p}
                    </p>
                  ))}
                  {r.cons.map(c => (
                    <p key={c} className="text-xs text-red-400 flex items-center gap-1">
                      <span>✕</span> {c}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gráfico comparativo */}
      {results.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-white font-semibold mb-4">Custo Total Comparado</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false}
                tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip
                formatter={(v: unknown) => formatCurrency(v as number)}
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map(d => (
                  <Cell key={d.type} fill={TYPE_CONFIG[d.type as SimulationResult['type']].color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Finn CTA */}
      {bestOption && (
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-white font-semibold">Quer uma análise personalizada?</p>
            <p className="text-gray-400 text-sm mt-0.5">
              O Finn já sabe que a melhor opção é <strong className="text-white">{bestOption.label}</strong> com custo de <strong className="text-white">{formatCurrency(bestOption.totalCost)}</strong>.
            </p>
          </div>
          <button
            onClick={openFinn}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30 active:scale-95 whitespace-nowrap"
          >
            <MessageCircle size={18} />
            Perguntar ao Finn
          </button>
        </div>
      )}
    </main>
  );
};
