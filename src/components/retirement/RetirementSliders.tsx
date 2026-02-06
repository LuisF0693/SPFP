import React from 'react';
import { SliderInput } from './SliderInput';
import { formatCurrency } from '../../utils';

export interface RetirementConfig {
  targetAge: number;
  targetMonthlyIncome: number;
  otherIncomeSources: number;
  monthlyInvestment: number;
}

interface RetirementSlidersProps {
  config: RetirementConfig;
  onChange: (config: RetirementConfig) => void;
  onSave?: () => void;
}

export const RetirementSliders: React.FC<RetirementSlidersProps> = ({
  config,
  onChange,
  onSave
}) => {
  const handleChange = (key: keyof RetirementConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-5">
      <SliderInput
        label="Idade aposentadoria"
        value={config.targetAge}
        min={50}
        max={80}
        step={1}
        onChange={(v) => handleChange('targetAge', v)}
        formatValue={(v) => `${v} anos`}
        color="#10B981"
      />

      <SliderInput
        label="Renda desejada"
        value={config.targetMonthlyIncome}
        min={1000}
        max={50000}
        step={500}
        onChange={(v) => handleChange('targetMonthlyIncome', v)}
        formatValue={(v) => formatCurrency(v)}
        color="#3B82F6"
      />

      <SliderInput
        label="Outras fontes de renda"
        value={config.otherIncomeSources}
        min={0}
        max={20000}
        step={500}
        onChange={(v) => handleChange('otherIncomeSources', v)}
        formatValue={(v) => formatCurrency(v)}
        color="#8B5CF6"
      />

      <SliderInput
        label="Investimento mensal"
        value={config.monthlyInvestment}
        min={0}
        max={20000}
        step={100}
        onChange={(v) => handleChange('monthlyInvestment', v)}
        formatValue={(v) => formatCurrency(v)}
        color="#F59E0B"
      />

      {onSave && (
        <button
          onClick={onSave}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors text-sm"
        >
          Salvar meta
        </button>
      )}
    </div>
  );
};
