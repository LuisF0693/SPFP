/**
 * Retirement Component
 * STY-053: Dedicated page for retirement planning
 *
 * Features:
 * - Configuration form for retirement goals
 * - Beautiful projection chart with 3 scenarios
 * - Passive income calculation (4% rule)
 * - Personalized recommendations
 */

import React, { useState, useMemo } from 'react';
import { useSafeFinance } from '../hooks/useSafeFinance';
import { formatCurrency } from '../utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Calculator, TrendingUp, Wallet, Target, Info } from 'lucide-react';

interface RetirementConfig {
  currentAge: number;
  targetAge: number;
  currentPatrimony: number;
  monthlyContribution: number;
  targetPatrimony: number;
}

interface ProjectionData {
  year: number;
  age: number;
  conservative: number;
  moderate: number;
  aggressive: number;
}

const SCENARIOS = {
  conservative: { rate: 0.06, color: '#3B82F6', name: 'Conservador (6% a.a.)' },
  moderate: { rate: 0.10, color: '#10B981', name: 'Moderado (10% a.a.)' },
  aggressive: { rate: 0.14, color: '#F59E0B', name: 'Agressivo (14% a.a.)' },
};

export const Retirement: React.FC = () => {
  const { userProfile } = useSafeFinance();

  // Form state
  const [config, setConfig] = useState<RetirementConfig>(() => {
    const saved = localStorage.getItem('spfp_retirement_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      currentAge: 30,
      targetAge: 65,
      currentPatrimony: 100000,
      monthlyContribution: 2000,
      targetPatrimony: 2000000,
    };
  });

  // Save config when it changes
  const saveConfig = (newConfig: RetirementConfig) => {
    setConfig(newConfig);
    localStorage.setItem('spfp_retirement_config', JSON.stringify(newConfig));
  };

  // Calculate projections
  const projectionData = useMemo((): ProjectionData[] => {
    const years = config.targetAge - config.currentAge;
    if (years <= 0) return [];

    const data: ProjectionData[] = [];

    for (let y = 0; y <= years; y++) {
      const age = config.currentAge + y;
      const dataPoint: ProjectionData = {
        year: y,
        age,
        conservative: 0,
        moderate: 0,
        aggressive: 0,
      };

      // Calculate for each scenario
      Object.entries(SCENARIOS).forEach(([key, scenario]) => {
        const monthlyRate = scenario.rate / 12;
        const months = y * 12;

        // Future value of current patrimony
        const fvPatrimony = config.currentPatrimony * Math.pow(1 + scenario.rate, y);

        // Future value of contributions (annuity)
        const fvContributions = months > 0
          ? config.monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
          : 0;

        dataPoint[key as keyof typeof SCENARIOS] = fvPatrimony + fvContributions;
      });

      data.push(dataPoint);
    }

    return data;
  }, [config]);

  // Calculate final values and passive income
  const finalValues = useMemo(() => {
    if (projectionData.length === 0) return null;
    const final = projectionData[projectionData.length - 1];

    return {
      conservative: {
        patrimony: final.conservative,
        monthlyIncome: (final.conservative * 0.04) / 12,
      },
      moderate: {
        patrimony: final.moderate,
        monthlyIncome: (final.moderate * 0.04) / 12,
      },
      aggressive: {
        patrimony: final.aggressive,
        monthlyIncome: (final.aggressive * 0.04) / 12,
      },
    };
  }, [projectionData]);

  // Recommendation
  const recommendation = useMemo(() => {
    if (!finalValues) return null;

    const yearsToRetire = config.targetAge - config.currentAge;
    const reachesGoal = finalValues.moderate.patrimony >= config.targetPatrimony;

    if (reachesGoal) {
      return {
        type: 'success' as const,
        message: `Parabéns! Com aportes de ${formatCurrency(config.monthlyContribution)}/mês, você deve atingir sua meta em ${yearsToRetire} anos.`,
        tip: 'Continue investindo consistentemente e evite resgates.',
      };
    } else {
      const deficit = config.targetPatrimony - finalValues.moderate.patrimony;
      const additionalMonthly = deficit / (yearsToRetire * 12);

      return {
        type: 'warning' as const,
        message: `Para atingir sua meta, você precisará aumentar seus aportes em aproximadamente ${formatCurrency(additionalMonthly)}/mês.`,
        tip: 'Considere aumentar seus aportes ou estender o prazo de aposentadoria.',
      };
    }
  }, [finalValues, config]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl">
        <p className="text-white font-bold mb-2">Ano {data.year} ({data.age} anos)</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="text-white font-mono">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className="p-4 md:p-6 min-h-full space-y-6 animate-fade-in pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span>🏖️</span> Planejamento para Aposentadoria
        </h1>
        <p className="text-gray-500 mt-1">
          Projete seu futuro financeiro e garanta uma aposentadoria tranquila
        </p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calculator size={20} /> Configurações
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Idade Atual
            </label>
            <input
              type="number"
              value={config.currentAge}
              onChange={(e) => saveConfig({ ...config, currentAge: parseInt(e.target.value) || 0 })}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Idade para Aposentar
            </label>
            <input
              type="number"
              value={config.targetAge}
              onChange={(e) => saveConfig({ ...config, targetAge: parseInt(e.target.value) || 0 })}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Patrimônio Atual
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                value={config.currentPatrimony}
                onChange={(e) => saveConfig({ ...config, currentPatrimony: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Aporte Mensal
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                value={config.monthlyContribution}
                onChange={(e) => saveConfig({ ...config, monthlyContribution: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Meta de Patrimônio
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                value={config.targetPatrimony}
                onChange={(e) => saveConfig({ ...config, targetPatrimony: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="flex items-end">
            <p className="text-sm text-gray-500">
              <strong>{config.targetAge - config.currentAge}</strong> anos até a aposentadoria
            </p>
          </div>
        </div>
      </div>

      {/* Projection Chart */}
      {projectionData.length > 0 && (
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Projeção de Patrimônio
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="conservativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="moderateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aggressiveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="age"
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={{ stroke: '#374151' }}
                label={{ value: 'Idade', position: 'bottom', fill: '#9CA3AF' }}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={{ stroke: '#374151' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine
                y={config.targetPatrimony}
                stroke="#EF4444"
                strokeDasharray="5 5"
                label={{ value: 'Meta', fill: '#EF4444', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="conservative"
                stroke="#3B82F6"
                fill="url(#conservativeGradient)"
                strokeWidth={2}
                name="Conservador (6%)"
              />
              <Area
                type="monotone"
                dataKey="moderate"
                stroke="#10B981"
                fill="url(#moderateGradient)"
                strokeWidth={2}
                name="Moderado (10%)"
              />
              <Area
                type="monotone"
                dataKey="aggressive"
                stroke="#F59E0B"
                fill="url(#aggressiveGradient)"
                strokeWidth={2}
                name="Agressivo (14%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Scenario Cards */}
      {finalValues && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(SCENARIOS).map(([key, scenario]) => {
            const values = finalValues[key as keyof typeof finalValues];
            const isRecommended = key === 'moderate';

            return (
              <div
                key={key}
                className={`bg-white dark:bg-[#0f172a] rounded-2xl p-6 border-2 ${
                  isRecommended
                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'border-gray-100 dark:border-gray-800'
                }`}
              >
                {isRecommended && (
                  <div className="text-xs font-bold text-emerald-500 mb-2 uppercase tracking-wider">
                    Recomendado
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4" style={{ color: scenario.color }}>
                  {scenario.name}
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <Wallet size={14} /> Patrimônio Final
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(values.patrimony)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <Target size={14} /> Renda Mensal Passiva
                    </p>
                    <p className="text-xl font-bold" style={{ color: scenario.color }}>
                      {formatCurrency(values.monthlyIncome)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Regra dos 4%)
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className={`rounded-2xl p-6 ${
          recommendation.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20'
            : 'bg-amber-500/10 border border-amber-500/20'
        }`}>
          <div className="flex items-start gap-3">
            <Info size={24} className={recommendation.type === 'success' ? 'text-emerald-500' : 'text-amber-500'} />
            <div>
              <p className={`font-medium ${recommendation.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {recommendation.message}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {recommendation.tip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h4 className="font-bold text-blue-500 mb-2">Sobre a Regra dos 4%</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A regra dos 4% sugere que você pode retirar 4% do seu patrimônio anualmente na aposentadoria
          sem esgotar seus recursos em 30+ anos. Isso considera uma carteira diversificada e ajustes pela inflação.
        </p>
      </div>
    </main>
  );
};

export default Retirement;
