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
import { formatCurrency, generateId } from '../utils';
import { Wallet } from 'lucide-react';
import {
  RetirementSliders,
  RetirementConfig,
  RetirementSummaryCard,
  RetirementChart,
  ProjectionPoint,
  RetirementProjects,
  RetirementProject,
} from './retirement';

const STORAGE_KEY = 'spfp_retirement_v2';
const PROJECTS_KEY = 'spfp_retirement_projects';

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

  // Load projects from localStorage
  const [projects, setProjects] = useState<RetirementProject[]>(() => {
    try {
      const saved = localStorage.getItem(PROJECTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
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

  // Save projects when they change
  useEffect(() => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

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

  const handleAddProject = (project: Omit<RetirementProject, 'id'>) => {
    const newProject: RetirementProject = {
      ...project,
      id: generateId()
    };
    setProjects(prev => [...prev, newProject]);
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
        {/* Left: Chart */}
        <div className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Independência financeira</h2>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500">Idade atual:</span>
              <span className="text-white font-bold">{currentAge} anos</span>
            </div>
          </div>

          <RetirementChart
            data={projectionData}
            currentAge={currentAge}
            targetAge={config.targetAge}
          />

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Patrimônio projetado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-slate-400">Patrimônio investido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-slate-400">Meta de patrimônio</span>
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

      {/* Projects Section */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5">
        <RetirementProjects
          projects={projects}
          onAddProject={handleAddProject}
        />
      </div>
    </div>
  );
};
