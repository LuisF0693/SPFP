/**
 * Asset Acquisition Form
 * FASE 2: STY-073 (Asset Form & Quick Add)
 *
 * Form for adding and comparing buy vs rent scenarios
 */

import React, { useState } from 'react';
import { Asset, AssetCategory, AssetCondition, AcquisitionType, ASSET_CATEGORY_CONFIG } from '../types/assets';
import { assetService } from '../services/assetService';
import { Modal } from './ui/Modal';
import { Home, DollarSign, Calendar, Percent, Wrench } from 'lucide-react';

interface AssetAcquisitionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Asset) => void;
  initialAsset?: Asset;
}

export const AssetAcquisitionForm: React.FC<AssetAcquisitionFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAsset
}) => {
  const [formData, setFormData] = useState<Omit<Asset, 'id' | 'dateAdded' | 'lastUpdated'> | Partial<Asset>>(
    initialAsset || {
      name: '',
      category: AssetCategory.REAL_ESTATE,
      condition: AssetCondition.NEW,
      purchasePrice: 0,
      notes: '',
      scenarios: [
        {
          id: `scenario_${Date.now()}_buy`,
          type: AcquisitionType.BUY,
          initialPayment: 0,
          monthlyPayment: 0,
          loanTerm: 360,
          interestRate: 0.08,
          maintenanceCost: 0,
          totalCost30Years: 0
        },
        {
          id: `scenario_${Date.now()}_rent`,
          type: AcquisitionType.RENT,
          initialPayment: 0,
          monthlyPayment: 0,
          loanTerm: 360,
          interestRate: 0,
          maintenanceCost: 0,
          totalCost30Years: 0
        }
      ]
    }
  );

  const handleSave = () => {
    if (!formData.name || !formData.purchasePrice || !formData.scenarios) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const newAsset = assetService.createAsset(formData as Omit<Asset, 'id' | 'dateAdded' | 'lastUpdated'>);
    onSave(newAsset);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: AssetCategory.REAL_ESTATE,
      condition: AssetCondition.NEW,
      purchasePrice: 0,
      notes: '',
      scenarios: [
        {
          id: `scenario_${Date.now()}_buy`,
          type: AcquisitionType.BUY,
          initialPayment: 0,
          monthlyPayment: 0,
          loanTerm: 360,
          interestRate: 0.08,
          maintenanceCost: 0,
          totalCost30Years: 0
        },
        {
          id: `scenario_${Date.now()}_rent`,
          type: AcquisitionType.RENT,
          initialPayment: 0,
          monthlyPayment: 0,
          loanTerm: 360,
          interestRate: 0,
          maintenanceCost: 0,
          totalCost30Years: 0
        }
      ]
    });
  };

  const buyScenario = formData.scenarios?.find(s => s.type === AcquisitionType.BUY);
  const rentScenario = formData.scenarios?.find(s => s.type === AcquisitionType.RENT);

  const updateScenario = (type: AcquisitionType, updates: any) => {
    const scenarios = formData.scenarios?.map(s =>
      s.type === type ? { ...s, ...updates } : s
    ) || [];
    setFormData({ ...formData, scenarios });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Bem para Análise"
      size="lg"
      variant="dark"
    >
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Bem*</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Apartamento em São Paulo"
              className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Categoria*</label>
              <select
                value={formData.category || AssetCategory.REAL_ESTATE}
                onChange={e => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {Object.entries(ASSET_CATEGORY_CONFIG).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Condição*</label>
              <select
                value={formData.condition || AssetCondition.NEW}
                onChange={e => setFormData({ ...formData, condition: e.target.value as AssetCondition })}
                className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value={AssetCondition.NEW}>Novo</option>
                <option value={AssetCondition.USED}>Usado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Preço de Referência*</label>
            <input
              type="number"
              value={formData.purchasePrice || 0}
              onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
              placeholder="0"
              className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Notas</label>
            <textarea
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalhes adicionais..."
              rows={2}
              className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Buy Scenario */}
        {buyScenario && (
          <div className="bg-white/5 border border-gray-700 rounded-lg p-4">
            <h4 className="font-bold text-white mb-3 flex items-center space-x-2">
              <Home size={16} />
              <span>Cenário: Compra</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Entrada</label>
                <input
                  type="number"
                  value={buyScenario.initialPayment || 0}
                  onChange={e => updateScenario(AcquisitionType.BUY, { initialPayment: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 bg-white/5 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Mensalidade</label>
                <input
                  type="number"
                  value={buyScenario.monthlyPayment || 0}
                  onChange={e => updateScenario(AcquisitionType.BUY, { monthlyPayment: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 bg-white/5 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Prazo (meses)</label>
                <input
                  type="number"
                  value={buyScenario.loanTerm || 360}
                  onChange={e => updateScenario(AcquisitionType.BUY, { loanTerm: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 bg-white/5 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Manutenção Anual</label>
                <input
                  type="number"
                  value={buyScenario.maintenanceCost || 0}
                  onChange={e => updateScenario(AcquisitionType.BUY, { maintenanceCost: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 bg-white/5 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Rent Scenario */}
        {rentScenario && (
          <div className="bg-white/5 border border-gray-700 rounded-lg p-4">
            <h4 className="font-bold text-white mb-3 flex items-center space-x-2">
              <DollarSign size={16} />
              <span>Cenário: Aluguel</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Caução</label>
                <input
                  type="number"
                  value={rentScenario.initialPayment || 0}
                  onChange={e => updateScenario(AcquisitionType.RENT, { initialPayment: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 bg-white/5 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Aluguel Mensal</label>
                <input
                  type="number"
                  value={rentScenario.monthlyPayment || 0}
                  onChange={e => updateScenario(AcquisitionType.RENT, { monthlyPayment: parseFloat(e.target.value) })}
                  className="w-full px-2 py-1 bg-white/5 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

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
            Adicionar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AssetAcquisitionForm;
