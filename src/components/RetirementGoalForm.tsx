/**
 * Retirement Goal Form Component
 * FASE 2: STY-068 (Retirement Target Date & Goal Setting)
 */

import React, { useState } from 'react';
import { RetirementPlan } from '../types/retirement';
import { Modal } from './ui/Modal';
import { Clock, DollarSign, User } from 'lucide-react';

interface RetirementGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: RetirementPlan) => void;
  initialPlan?: RetirementPlan;
}

export const RetirementGoalForm: React.FC<RetirementGoalFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPlan
}) => {
  const today = new Date();
  const [formData, setFormData] = useState<Partial<RetirementPlan>>(
    initialPlan || {
      targetDate: new Date(today.getFullYear() + 20, today.getMonth(), today.getDate()).toISOString().split('T')[0],
      desiredMonthlyIncome: 5000,
      currentAge: 35,
      currentPatrimony: 100000,
      monthlyContribution: 1000,
      inflationRate: 0.04
    }
  );

  const handleQuickPreset = (years: number) => {
    const target = new Date(today.getFullYear() + years, today.getMonth(), today.getDate());
    setFormData({
      ...formData,
      targetDate: target.toISOString().split('T')[0]
    });
  };

  const handleSave = () => {
    if (!formData.targetDate || !formData.desiredMonthlyIncome || !formData.currentAge) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const plan: RetirementPlan = {
      id: initialPlan?.id || `ret_${Date.now()}`,
      targetDate: formData.targetDate,
      targetAge: (formData.currentAge || 0) + 20,
      desiredMonthlyIncome: formData.desiredMonthlyIncome,
      currentAge: formData.currentAge,
      currentPatrimony: formData.currentPatrimony || 0,
      monthlyContribution: formData.monthlyContribution || 0,
      inflationRate: formData.inflationRate || 0.04,
      createdAt: initialPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(plan);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Planejamento de Aposentadoria"
      size="md"
      variant="dark"
    >
      <div className="space-y-4">
        {/* Quick Presets */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Presets Rápidos</label>
          <div className="flex gap-2">
            {[20, 30, 40].map(years => (
              <button
                key={years}
                onClick={() => handleQuickPreset(years)}
                className="flex-1 px-2 py-2 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded border border-blue-500/30 transition-colors"
              >
                {years} anos
              </button>
            ))}
          </div>
        </div>

        {/* Target Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center space-x-1">
            <Clock size={16} />
            <span>Data Alvo de Aposentadoria</span>
          </label>
          <input
            type="date"
            value={formData.targetDate || ''}
            onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Desired Monthly Income */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center space-x-1">
            <DollarSign size={16} />
            <span>Renda Mensal Desejada</span>
          </label>
          <input
            type="number"
            value={formData.desiredMonthlyIncome || 0}
            onChange={e => setFormData({ ...formData, desiredMonthlyIncome: parseFloat(e.target.value) })}
            placeholder="5000"
            className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Current Age */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center space-x-1">
            <User size={16} />
            <span>Idade Atual</span>
          </label>
          <input
            type="number"
            value={formData.currentAge || 0}
            onChange={e => setFormData({ ...formData, currentAge: parseInt(e.target.value) })}
            placeholder="35"
            className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Current Patrimony */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Patrimônio Atual</label>
          <input
            type="number"
            value={formData.currentPatrimony || 0}
            onChange={e => setFormData({ ...formData, currentPatrimony: parseFloat(e.target.value) })}
            placeholder="100000"
            className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Monthly Contribution */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Contribuição Mensal</label>
          <input
            type="number"
            value={formData.monthlyContribution || 0}
            onChange={e => setFormData({ ...formData, monthlyContribution: parseFloat(e.target.value) })}
            placeholder="1000"
            className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Inflation Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Taxa de Inflação Anual</label>
          <select
            value={(formData.inflationRate || 0.04) * 100}
            onChange={e => setFormData({ ...formData, inflationRate: parseFloat(e.target.value) / 100 })}
            className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="2">2% (Otimista)</option>
            <option value="4">4% (Realista)</option>
            <option value="6">6% (Conservador)</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-colors border border-blue-500/30"
          >
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RetirementGoalForm;
