/**
 * Retirement Component - Redesign STY-061
 * Inspired by "Meu Futuro" layout
 *
 * Features:
 * - Interactive sliders for retirement parameters
 * - Area chart showing patrimony projection
 * - Summary card with required investment
 * - Projects section (Essential/Desire/Dream)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useSafeFinance } from '../hooks/useSafeFinance';
import { formatCurrency } from '../utils';
import { Wallet } from 'lucide-react';
import {
  RetirementSliders,
  RetirementConfig,
  RetirementSummaryCard,
  RetirementChart,
  ProjectionPoint,
} from './retirement';

const STORAGE_KEY = 'spfp_retirement_v2';

const ANNUAL_RETURN = 0.08; // 8% a.a.
const WITHDRAWAL_RATE = 0.04; // 4% rule

export const Retirement: React.FC = () => {
  const { userProfile } = useSafeFinance();
  const currentYear = new Date().getFullYear();

  // Get current age from profile or default to 30
  const currentAge = userProfile?.birthDate
    ? Math.floor((Date.now() - new Date(userProfile.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : 30;

  // Load config from localStorage
  const [config, setConfig] = useState<RetirementConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      targetAge: 65,
      targetMonthlyIncome: 10000,
      otherIncomeSources: 0,
      monthlyInvestment: 0
    };
  });

  // Get current patrimony from investments context
  const { investments } = useSafeFinance();
  const currentPatrimony = useMemo(() => {
    if (!investments || !Array.isArray(investments)) return 0;
    return investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  }, [investments]);

  // Save config when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  // Calculate required patrimony for desired income (4% rule)
  const netMonthlyIncomeNeeded = Math.max(config.targetMonthlyIncome - config.otherIncomeSources, 0);
  const requiredPatrimony = (netMonthlyIncomeNeeded * 12) / WITHDRAWAL_RATE;

  // Calculate years to retirement
  const yearsToRetirement = Math.max(config.targetAge - currentAge, 1);

  // Calculate required monthly investment
  const requiredMonthlyInvestment = useMemo(() => {
    const months = yearsToRetirement * 12;
    const monthlyRate = ANNUAL_RETURN / 12;

    // Future value of current patrimony
    const fvCurrent = currentPatrimony * Math.pow(1 + ANNUAL_RETURN, yearsToRetirement);

    // How much more we need
    const remaining = Math.max(requiredPatrimony - fvCurrent, 0);

    // PMT formula: PMT = FV / [((1+r)^n - 1) / r]
    if (remaining <= 0) return 0;

    const factor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    return remaining / factor;
  }, [currentPatrimony, requiredPatrimony, yearsToRetirement]);

  // Generate projection data for chart
  const projectionData = useMemo((): ProjectionPoint[] => {
    const data: ProjectionPoint[] = [];
    let projectedValue = currentPatrimony;
    let investedValue = currentPatrimony;

    for (let year = 0; year <= yearsToRetirement; year++) {
      const age = currentAge + year;

      // Add yearly investment
      const yearlyInvestment = config.monthlyInvestment * 12;

      // Compound interest for projected (with returns)
      if (year > 0) {
        projectedValue = (projectedValue + yearlyInvestment) * (1 + ANNUAL_RETURN);
        investedValue = investedValue + yearlyInvestment;
      }

      data.push({
        age,
        year: currentYear + year,
        projectedPatrimony: Math.round(projectedValue),
        investedPatrimony: Math.round(investedValue),
        retirementTarget: Math.round(requiredPatrimony)
      });
    }

    return data;
  }, [currentAge, currentPatrimony, config.monthlyInvestment, yearsToRetirement, requiredPatrimony, currentYear]);

  // Handlers
  const handleConfigChange = (newConfig: RetirementConfig) => {
    setConfig(newConfig);
  };

  const handleSaveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Meu Futuro</h1>
          <p className="text-sm text-slate-400">Planejamento de independência financeira</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl">
          <Wallet size={18} className="text-emerald-400" />
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase">Patrimônio atual</div>
            <div className="text-sm font-bold text-white">{formatCurrency(currentPatrimony)}</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart - Premium Glassmorphism Container */}
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-800/30 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-xl font-bold text-white">Independência financeira</h2>
                <p className="text-xs text-slate-400 mt-0.5">Projeção de crescimento patrimonial</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl backdrop-blur-sm">
                <span className="text-slate-400 text-xs">Idade atual:</span>
                <span className="text-white font-bold text-sm">{currentAge} anos</span>
              </div>
            </div>
          </div>

          <RetirementChart
            data={projectionData}
            currentAge={currentAge}
            targetAge={config.targetAge}
          />

          {/* Enhanced Legend with Glassmorphism */}
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50" />
              <span className="text-slate-300 text-xs font-medium">Patrimônio projetado</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-500/10 border border-slate-500/20 backdrop-blur-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-slate-300 text-xs font-medium">Patrimônio investido</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-500/50" />
              <span className="text-slate-300 text-xs font-medium">Meta de patrimônio</span>
            </div>
          </div>
        </div>

        {/* Right: Summary + Sliders */}
        <div className="space-y-4">
          <RetirementSummaryCard
            requiredMonthlyInvestment={requiredMonthlyInvestment}
            targetPatrimony={requiredPatrimony}
            yearsToRetirement={yearsToRetirement}
            targetMonthlyIncome={config.targetMonthlyIncome}
          />

          <RetirementSliders
            config={config}
            onChange={handleConfigChange}
            onSave={handleSaveConfig}
          />
        </div>
      </div>

    </div>
  );
};
