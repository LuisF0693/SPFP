import React from 'react';
import { InlineEdit } from '../ui/InlineEdit';
import { RetirementSettings } from '../../types/investments';

interface RetirementSettingsPanelProps {
  settings: RetirementSettings;
  onUpdate: (updates: Partial<RetirementSettings>) => void;
  disabled?: boolean;
}

export const RetirementSettingsPanel: React.FC<RetirementSettingsPanelProps> = ({
  settings,
  onUpdate,
  disabled = false,
}) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A2233] border border-[#e6e8eb] dark:border-[#2e374a] p-6 shadow-sm">
      <h3 className="text-[#111418] dark:text-white text-lg font-bold mb-6">
        Parâmetros da Simulação
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Current Age */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#637588] dark:text-[#92a4c9] uppercase tracking-wider">
            Idade Atual
          </label>
          <InlineEdit
            value={settings.current_age}
            onSave={(value) => onUpdate({ current_age: value })}
            format="integer"
            suffix=" anos"
            min={18}
            max={80}
            disabled={disabled}
            valueClassName="text-lg text-[#111418] dark:text-white"
          />
        </div>

        {/* Retirement Age */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#637588] dark:text-[#92a4c9] uppercase tracking-wider">
            Aposentar com
          </label>
          <InlineEdit
            value={settings.retirement_age}
            onSave={(value) => onUpdate({ retirement_age: value })}
            format="integer"
            suffix=" anos"
            min={settings.current_age + 1}
            max={100}
            disabled={disabled}
            valueClassName="text-lg text-[#111418] dark:text-white"
          />
        </div>

        {/* Return Rate */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#637588] dark:text-[#92a4c9] uppercase tracking-wider">
            Retorno Anual
          </label>
          <InlineEdit
            value={settings.annual_return_rate}
            onSave={(value) => onUpdate({ annual_return_rate: value })}
            format="percent"
            min={0}
            max={30}
            step={0.5}
            disabled={disabled}
            valueClassName="text-lg text-[#111418] dark:text-white"
          />
        </div>

        {/* Inflation Rate */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#637588] dark:text-[#92a4c9] uppercase tracking-wider">
            Inflação
          </label>
          <InlineEdit
            value={settings.inflation_rate}
            onSave={(value) => onUpdate({ inflation_rate: value })}
            format="percent"
            min={0}
            max={20}
            step={0.5}
            disabled={disabled}
            valueClassName="text-lg text-[#111418] dark:text-white"
          />
        </div>

        {/* Monthly Contribution */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#637588] dark:text-[#92a4c9] uppercase tracking-wider">
            Aporte Mensal
          </label>
          <InlineEdit
            value={settings.monthly_contribution}
            onSave={(value) => onUpdate({ monthly_contribution: value })}
            format="currency"
            min={0}
            step={100}
            disabled={disabled}
            valueClassName="text-lg text-[#111418] dark:text-white"
          />
        </div>

        {/* Desired Income */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[#637588] dark:text-[#92a4c9] uppercase tracking-wider">
            Renda Desejada
          </label>
          <InlineEdit
            value={settings.desired_monthly_income}
            onSave={(value) => onUpdate({ desired_monthly_income: value })}
            format="currency"
            min={0}
            step={500}
            disabled={disabled}
            valueClassName="text-lg text-[#111418] dark:text-white"
          />
        </div>
      </div>

      {/* Info text */}
      <p className="text-xs text-[#637588] dark:text-[#92a4c9] mt-4">
        💡 Clique em qualquer valor para editar. Os cálculos são atualizados em tempo real.
      </p>
    </div>
  );
};

export default RetirementSettingsPanel;
