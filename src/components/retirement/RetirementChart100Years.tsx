import React, { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { formatCurrency } from '../../utils';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { RetirementSettings } from '../../types/investments';

export interface Projection100Point {
  age: number;
  year: number;
  phase: 'accumulation' | 'retirement';
  patrimony: number;
  invested: number;
  withdrawals: number;
  monthlyIncome: number;
}

interface RetirementChart100YearsProps {
  settings: RetirementSettings;
  currentPatrimony?: number;
  className?: string;
}

// Generate projection data up to 100 years
const generateProjection = (
  settings: RetirementSettings,
  currentPatrimony: number
): Projection100Point[] => {
  const {
    current_age,
    retirement_age,
    life_expectancy = 100,
    annual_return_rate,
    inflation_rate,
    monthly_contribution,
    desired_monthly_income,
  } = settings;

  const points: Projection100Point[] = [];
  const currentYear = new Date().getFullYear();

  // Real return rate (adjusted for inflation)
  const realReturn = (1 + annual_return_rate / 100) / (1 + inflation_rate / 100) - 1;
  const monthlyReturn = Math.pow(1 + realReturn, 1 / 12) - 1;

  let patrimony = currentPatrimony;
  let totalInvested = currentPatrimony;
  let totalWithdrawals = 0;

  for (let age = current_age; age <= life_expectancy; age++) {
    const year = currentYear + (age - current_age);
    const isRetirement = age >= retirement_age;

    // Monthly simulation for more accuracy
    for (let month = 0; month < 12; month++) {
      if (isRetirement) {
        // Withdrawal phase - take monthly income
        patrimony -= desired_monthly_income;
        totalWithdrawals += desired_monthly_income;
        // Apply returns on remaining
        patrimony *= (1 + monthlyReturn);
      } else {
        // Accumulation phase - add contributions and returns
        patrimony += monthly_contribution;
        totalInvested += monthly_contribution;
        patrimony *= (1 + monthlyReturn);
      }

      // Prevent negative patrimony
      if (patrimony < 0) patrimony = 0;
    }

    points.push({
      age,
      year,
      phase: isRetirement ? 'retirement' : 'accumulation',
      patrimony: Math.round(patrimony),
      invested: Math.round(totalInvested),
      withdrawals: Math.round(totalWithdrawals),
      monthlyIncome: isRetirement ? desired_monthly_income : 0,
    });
  }

  return points;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload as Projection100Point;
  if (!data) return null;

  const isRetirement = data.phase === 'retirement';
  const gains = data.patrimony - data.invested + data.withdrawals;

  return (
    <div className="backdrop-blur-xl bg-slate-900/90 border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[260px]">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center
          ${isRetirement ? 'bg-amber-500/20' : 'bg-emerald-500/20'}
        `}>
          <span className="text-sm font-bold text-white">{label}</span>
        </div>
        <div>
          <span className="text-slate-400 text-sm">anos</span>
          <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
            ${isRetirement ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}
          `}>
            {isRetirement ? 'Aposentadoria' : 'Acumulação'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 text-sm">Patrimônio</span>
          </div>
          <span className="text-white font-bold">{formatCurrency(data.patrimony)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 text-sm">Investido</span>
          </div>
          <span className="text-slate-400 font-medium">{formatCurrency(data.invested)}</span>
        </div>

        {isRetirement && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 text-sm">Retiradas Totais</span>
            </div>
            <span className="text-amber-400 font-medium">{formatCurrency(data.withdrawals)}</span>
          </div>
        )}

        {gains > 0 && (
          <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-emerald-400 text-sm">Rendimentos</span>
            <span className="text-emerald-400 font-bold">+{formatCurrency(gains)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const RetirementChart100Years: React.FC<RetirementChart100YearsProps> = ({
  settings,
  currentPatrimony = 0,
  className = '',
}) => {
  const data = useMemo(
    () => generateProjection(settings, currentPatrimony),
    [settings, currentPatrimony]
  );

  if (!data || data.length === 0) {
    return (
      <div className="h-[450px] flex items-center justify-center text-slate-500">
        Configure os parâmetros para ver a projeção
      </div>
    );
  }

  // Key milestones
  const retirementPoint = data.find(p => p.phase === 'retirement');
  const peakPoint = data.reduce((max, p) => p.patrimony > max.patrimony ? p : max, data[0]);
  const finalPoint = data[data.length - 1];
  const sustainableYears = data.filter(p => p.phase === 'retirement' && p.patrimony > 0).length;

  return (
    <div className={`${className}`}>
      {/* Floating Stats */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[150px] backdrop-blur-xl bg-[#1A2233]/80 border border-[#2e374a] rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] text-[#92a4c9] uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            Aposentadoria
          </div>
          <p className="text-white font-bold">{settings.retirement_age} anos</p>
          <p className="text-emerald-400 text-sm">{retirementPoint ? formatCurrency(retirementPoint.patrimony) : '-'}</p>
        </div>

        <div className="flex-1 min-w-[150px] backdrop-blur-xl bg-[#1A2233]/80 border border-[#2e374a] rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] text-[#92a4c9] uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Pico Máximo
          </div>
          <p className="text-white font-bold">{peakPoint.age} anos</p>
          <p className="text-emerald-400 text-sm">{formatCurrency(peakPoint.patrimony)}</p>
        </div>

        <div className="flex-1 min-w-[150px] backdrop-blur-xl bg-[#1A2233]/80 border border-[#2e374a] rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] text-[#92a4c9] uppercase tracking-wider mb-1">
            <Wallet className="w-3.5 h-3.5" />
            Sustentabilidade
          </div>
          <p className="text-white font-bold">{sustainableYears} anos</p>
          <p className={sustainableYears >= 35 ? 'text-emerald-400 text-sm' : 'text-amber-400 text-sm'}>
            {sustainableYears >= 35 ? 'Ótimo!' : 'Atenção'}
          </p>
        </div>

        <div className="flex-1 min-w-[150px] backdrop-blur-xl bg-[#1A2233]/80 border border-[#2e374a] rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] text-[#92a4c9] uppercase tracking-wider mb-1">
            <TrendingDown className="w-3.5 h-3.5" />
            Final (100 anos)
          </div>
          <p className="text-white font-bold">{formatCurrency(finalPoint.patrimony)}</p>
          <p className={finalPoint.patrimony > 0 ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
            {finalPoint.patrimony > 0 ? 'Positivo!' : 'Zerado'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[450px] relative">
        {/* Background glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-emerald-500/30 blur-[100px] rounded-full" />
          <div className="absolute bottom-1/3 right-1/3 w-1/3 h-1/3 bg-amber-500/20 blur-[80px] rounded-full" />
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
            <defs>
              {/* Accumulation gradient */}
              <linearGradient id="accumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34D399" stopOpacity={0.5} />
                <stop offset="50%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>

              {/* Retirement gradient */}
              <linearGradient id="retireGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#D97706" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#D97706" stopOpacity={0.02} />
              </linearGradient>

              {/* Invested line gradient */}
              <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6B7280" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6B7280" stopOpacity={0.05} />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow100" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Retirement Phase Highlight */}
            <ReferenceArea
              x1={settings.retirement_age}
              x2={settings.life_expectancy || 100}
              fill="#F59E0B"
              fillOpacity={0.05}
            />

            <XAxis
              dataKey="age"
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              ticks={[settings.current_age, 40, 50, 60, 70, 80, 90, 100]}
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
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#64748b', strokeDasharray: '4 4' }} />

            {/* Retirement Age Line */}
            <ReferenceLine
              x={settings.retirement_age}
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="8 4"
              label={{
                value: `🎯 Aposentadoria`,
                fill: '#FCD34D',
                fontSize: 11,
                fontWeight: 600,
                position: 'insideTopLeft',
              }}
            />

            {/* Invested Amount (dashed line) */}
            <Line
              type="monotone"
              dataKey="invested"
              stroke="#6B7280"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Total Investido"
            />

            {/* Main Patrimony Area */}
            <Area
              type="monotone"
              dataKey="patrimony"
              fill="url(#accumGradient)"
              stroke="#34D399"
              strokeWidth={3}
              filter="url(#glow100)"
              name="Patrimônio"
              animationDuration={2000}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow shadow-emerald-500/50" />
          <span className="text-[#92a4c9]">Patrimônio Projetado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-slate-400" style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0' }} />
          <span className="text-[#92a4c9]">Total Investido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500/30" />
          <span className="text-[#92a4c9]">Fase de Retiradas</span>
        </div>
      </div>
    </div>
  );
};

export default RetirementChart100Years;
