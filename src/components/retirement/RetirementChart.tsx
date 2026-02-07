import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../../utils';
import { TrendingUp, Target } from 'lucide-react';

export interface ProjectionPoint {
  age: number;
  year: number;
  projectedPatrimony: number;
  investedPatrimony: number;
  retirementTarget: number;
}

interface RetirementChartProps {
  data: ProjectionPoint[];
  currentAge: number;
  targetAge: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const projected = payload.find((p: any) => p.dataKey === 'projectedPatrimony');
    const invested = payload.find((p: any) => p.dataKey === 'investedPatrimony');
    const target = payload.find((p: any) => p.dataKey === 'retirementTarget');

    const gains = projected && invested
      ? projected.value - invested.value
      : 0;
    const gainsPercent = invested?.value > 0
      ? ((gains / invested.value) * 100).toFixed(1)
      : '0';

    return (
      <div className="backdrop-blur-xl bg-slate-900/80 border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50 min-w-[220px]">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{label}</span>
          </div>
          <span className="text-slate-400 text-sm">anos</span>
        </div>

        <div className="space-y-2.5">
          {projected && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50" />
                <span className="text-slate-300 text-xs">Projetado</span>
              </div>
              <span className="text-white font-semibold text-sm">
                {formatCurrency(projected.value)}
              </span>
            </div>
          )}

          {invested && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-slate-300 text-xs">Investido</span>
              </div>
              <span className="text-white font-semibold text-sm">
                {formatCurrency(invested.value)}
              </span>
            </div>
          )}

          {target && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-500/50" />
                <span className="text-slate-300 text-xs">Meta</span>
              </div>
              <span className="text-white font-semibold text-sm">
                {formatCurrency(target.value)}
              </span>
            </div>
          )}
        </div>

        {gains > 0 && (
          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 text-xs">Rendimentos</span>
              <span className="text-emerald-400 font-bold text-sm">
                +{formatCurrency(gains)} ({gainsPercent}%)
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const RetirementChart: React.FC<RetirementChartProps> = ({
  data,
  currentAge,
  targetAge
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-slate-500">
        Configure os parâmetros para ver a projeção
      </div>
    );
  }

  // Get final values for floating cards
  const finalData = data[data.length - 1];
  const projectedFinal = finalData?.projectedPatrimony || 0;
  const targetFinal = finalData?.retirementTarget || 0;
  const progressPercent = targetFinal > 0 ? Math.min(100, (projectedFinal / targetFinal) * 100) : 0;
  const onTrack = projectedFinal >= targetFinal;

  return (
    <div className="relative">
      {/* Floating Metric Cards */}
      <div className="absolute top-0 right-0 z-10 flex gap-3">
        <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 flex items-center justify-center">
              <TrendingUp size={12} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Projeção Final</p>
              <p className="text-sm font-bold text-white">{formatCurrency(projectedFinal)}</p>
            </div>
          </div>
        </div>

        <div className={`backdrop-blur-xl border rounded-xl px-3 py-2 shadow-lg ${
          onTrack
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              onTrack ? 'bg-emerald-500/20' : 'bg-amber-500/20'
            }`}>
              <Target size={12} className={onTrack ? 'text-emerald-400' : 'text-amber-400'} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Status</p>
              <p className={`text-sm font-bold ${onTrack ? 'text-emerald-400' : 'text-amber-400'}`}>
                {onTrack ? 'No caminho!' : `${progressPercent.toFixed(0)}% da meta`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container with Glow Effect */}
      <div className="h-[400px] relative">
        {/* Glow background effect */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-emerald-500/20 blur-[80px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 bg-blue-500/20 blur-[60px] rounded-full" />
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 60, right: 20, left: 10, bottom: 10 }}>
            <defs>
              {/* Enhanced gradient for projected patrimony with glow */}
              <linearGradient id="colorProjectedPremium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity={0.5} />
                <stop offset="30%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>

              {/* Enhanced gradient for invested patrimony */}
              <linearGradient id="colorInvestedPremium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9CA3AF" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#6B7280" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#6B7280" stopOpacity={0.02} />
              </linearGradient>

              {/* Enhanced gradient for target with glow */}
              <linearGradient id="colorTargetPremium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>

              {/* Glow filter for lines */}
              <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glowBlue" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <XAxis
              dataKey="age"
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: '#334155', strokeWidth: 1 }}
              dy={10}
            />

            <YAxis
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                return value.toString();
              }}
              dx={-5}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#64748b', strokeDasharray: '4 4' }} />

            {/* Reference line for target age - enhanced */}
            <ReferenceLine
              x={targetAge}
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="8 4"
              label={{
                value: `🎯 ${targetAge} anos`,
                fill: '#FCD34D',
                fontSize: 11,
                fontWeight: 600,
                position: 'insideTopRight',
              }}
            />

            {/* Target area with subtle glow */}
            <Area
              type="monotone"
              dataKey="retirementTarget"
              name="Meta de patrimônio"
              stroke="#60A5FA"
              strokeWidth={2}
              strokeDasharray="8 4"
              fill="url(#colorTargetPremium)"
              filter="url(#glowBlue)"
              animationDuration={1500}
              animationEasing="ease-out"
            />

            {/* Invested patrimony - more subtle */}
            <Area
              type="monotone"
              dataKey="investedPatrimony"
              name="Patrimônio investido"
              stroke="#9CA3AF"
              strokeWidth={2}
              fill="url(#colorInvestedPremium)"
              animationDuration={1200}
              animationEasing="ease-out"
            />

            {/* Projected patrimony with glow effect */}
            <Area
              type="monotone"
              dataKey="projectedPatrimony"
              name="Patrimônio projetado"
              stroke="#34D399"
              strokeWidth={3}
              fill="url(#colorProjectedPremium)"
              filter="url(#glowGreen)"
              animationDuration={1800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
