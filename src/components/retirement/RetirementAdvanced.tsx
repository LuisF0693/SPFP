import React from 'react';
import { Settings, RefreshCw, Calculator, TrendingUp, Wallet, Calendar } from 'lucide-react';
import { ChartCard } from '../ui/ChartCard';
import { StatCard } from '../ui/StatCard';
import { ActionButton } from '../ui/ActionButton';
import { RetirementSettingsPanel } from './RetirementSettingsPanel';
import { RetirementChart100Years } from './RetirementChart100Years';
import { useRetirementSettings } from '../../hooks/useRetirementSettings';
import { formatCurrency } from '../../utils';

export const RetirementAdvanced: React.FC = () => {
  const {
    settings,
    loading,
    updateSettings,
    resetSettings,
    calculateProjection,
  } = useRetirementSettings();

  const projection = calculateProjection();

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622]">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Planejamento de Aposentadoria
            </h2>
            <p className="text-[#637588] dark:text-[#92a4c9] text-base font-normal">
              Simule cenários e planeje sua independência financeira até os 100 anos
            </p>
          </div>
          <div className="flex gap-3">
            <ActionButton
              label="Resetar"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={resetSettings}
              variant="outline"
            />
            <ActionButton
              label="Calcular"
              icon={<Calculator className="w-4 h-4" />}
              onClick={() => {/* Already reactive */}}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Patrimônio na Aposentadoria"
            value={formatCurrency(projection.patrimonyAtRetirement)}
            icon={<Wallet className="w-5 h-5" />}
            trend={projection.isSustainable ? {
              value: 'Sustentável',
              direction: 'up',
            } : {
              value: 'Ajuste necessário',
              direction: 'down',
            }}
            loading={loading}
          />
          <StatCard
            title="Renda Mensal Sustentável"
            value={formatCurrency(projection.sustainableMonthlyIncome)}
            subtitle={`Meta: ${formatCurrency(settings.desired_monthly_income)}`}
            icon={<TrendingUp className="w-5 h-5" />}
            trend={projection.sustainableMonthlyIncome >= settings.desired_monthly_income ? {
              value: 'Acima da meta',
              direction: 'up',
            } : {
              value: `${((projection.sustainableMonthlyIncome / settings.desired_monthly_income) * 100).toFixed(0)}% da meta`,
              direction: 'down',
            }}
            loading={loading}
          />
          <StatCard
            title="Anos de Renda"
            value={`${projection.yearsOfIncome} anos`}
            subtitle={`Até ${settings.retirement_age + projection.yearsOfIncome} anos`}
            icon={<Calendar className="w-5 h-5" />}
            trend={projection.yearsOfIncome >= 35 ? {
              value: 'Excelente',
              direction: 'up',
            } : projection.yearsOfIncome >= 25 ? {
              value: 'Bom',
              direction: 'neutral',
            } : {
              value: 'Atenção',
              direction: 'down',
            }}
            loading={loading}
          />
          <StatCard
            title="Rendimentos Totais"
            value={formatCurrency(projection.totalGains)}
            subtitle={`Contribuído: ${formatCurrency(projection.totalContributed)}`}
            icon={<TrendingUp className="w-5 h-5" />}
            trend={{
              value: `${((projection.totalGains / projection.totalContributed) * 100).toFixed(0)}% de ganho`,
              direction: 'up',
            }}
            loading={loading}
          />
        </div>

        {/* Settings Panel */}
        <RetirementSettingsPanel
          settings={settings}
          onUpdate={updateSettings}
          disabled={loading}
        />

        {/* Main Chart */}
        <ChartCard
          title="Projeção Patrimonial até 100 Anos"
          subtitle="Visualize a evolução do seu patrimônio nas fases de acumulação e retirada"
          icon={<TrendingUp className="w-5 h-5" />}
          loading={loading}
        >
          <RetirementChart100Years
            settings={settings}
            currentPatrimony={settings.current_patrimony || 0}
          />
        </ChartCard>

        {/* Insights Card */}
        <div className="rounded-2xl bg-white dark:bg-[#1A2233] border border-[#e6e8eb] dark:border-[#2e374a] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-[#111418] dark:text-white text-lg font-bold">
              Insights da Simulação
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sustainability Check */}
            <div className={`
              p-4 rounded-xl border
              ${projection.isSustainable
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-amber-500/10 border-amber-500/30'}
            `}>
              <p className={`text-sm font-bold mb-1 ${projection.isSustainable ? 'text-emerald-400' : 'text-amber-400'}`}>
                {projection.isSustainable ? '✓ Plano Sustentável' : '⚠ Ajustes Necessários'}
              </p>
              <p className="text-xs text-[#92a4c9]">
                {projection.isSustainable
                  ? `Seu plano mantém renda até os ${settings.life_expectancy || 100} anos.`
                  : `Considere aumentar aportes ou reduzir a renda desejada.`}
              </p>
            </div>

            {/* Required Contribution */}
            <div className="p-4 rounded-xl bg-[#101622]/50 border border-[#2e374a]">
              <p className="text-sm font-bold text-white mb-1">Aporte Ideal</p>
              <p className="text-xs text-[#92a4c9]">
                Para sua meta de {formatCurrency(settings.desired_monthly_income)}/mês,
                o aporte mensal ideal seria de aproximadamente{' '}
                <span className="text-[#135bec] font-bold">
                  {formatCurrency(settings.monthly_contribution * (settings.desired_monthly_income / projection.sustainableMonthlyIncome))}
                </span>
              </p>
            </div>

            {/* FIRE Number */}
            <div className="p-4 rounded-xl bg-[#101622]/50 border border-[#2e374a]">
              <p className="text-sm font-bold text-white mb-1">Número FIRE</p>
              <p className="text-xs text-[#92a4c9]">
                Para gerar {formatCurrency(settings.desired_monthly_income)}/mês com 4% de retirada anual,
                você precisa de{' '}
                <span className="text-emerald-400 font-bold">
                  {formatCurrency(settings.desired_monthly_income * 12 * 25)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementAdvanced;
