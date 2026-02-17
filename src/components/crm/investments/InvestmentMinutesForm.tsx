import React, { useState } from 'react';
import { Calendar, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { AssetRow, Asset } from './AssetRow';

interface InvestmentMinutesFormProps {
  clientId: string;
  clientName: string;
  onSave?: (data: InvestmentMinutesData) => void;
  onCancel?: () => void;
}

export interface InvestmentMinutesData {
  clientId: string;
  clientName: string;
  date: string;
  objective: string;
  assets: Record<string, Asset[]>;
  notes: string;
}

const ASSET_CLASSES = ['acoes', 'fiis', 'internacional', 'rf', 'cripto'] as const;

export const InvestmentMinutesForm: React.FC<InvestmentMinutesFormProps> = ({
  clientId,
  clientName,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<InvestmentMinutesData>({
    clientId,
    clientName,
    date: new Date().toISOString().split('T')[0],
    objective: 'Moderado',
    assets: {
      acoes: [],
      fiis: [],
      internacional: [],
      rf: [],
      cripto: [],
    },
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = 'Data é obrigatória';
    if (!formData.objective) newErrors.objective = 'Objetivo é obrigatório';

    const hasAnyAsset = ASSET_CLASSES.some(cls => formData.assets[cls]?.length > 0);
    if (!hasAnyAsset) newErrors.assets = 'Adicione pelo menos um ativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      localStorage.setItem(`investment_minutes_${clientId}`, JSON.stringify(formData));
      onSave?.(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const addAsset = (cls: string) => {
    setFormData({
      ...formData,
      assets: {
        ...formData.assets,
        [cls]: [
          ...(formData.assets[cls as keyof typeof formData.assets] || []),
          {
            id: Math.random().toString(),
            ticker: '',
            name: '',
            unitValue: 0,
            quantity: 0,
          },
        ],
      },
    });
  };

  const updateAsset = (cls: string, idx: number, asset: Asset) => {
    setFormData({
      ...formData,
      assets: {
        ...formData.assets,
        [cls]: formData.assets[cls as keyof typeof formData.assets].map((a, i) => (i === idx ? asset : a)),
      },
    });
  };

  const removeAsset = (cls: string, idx: number) => {
    setFormData({
      ...formData,
      assets: {
        ...formData.assets,
        [cls]: formData.assets[cls as keyof typeof formData.assets].filter((_, i) => i !== idx),
      },
    });
  };

  const calculateTotals = () => {
    const totals: Record<string, number> = {};
    let grandTotal = 0;

    ASSET_CLASSES.forEach((cls) => {
      const classTotal = (formData.assets[cls] || []).reduce((sum, asset) => sum + asset.unitValue * asset.quantity, 0);
      totals[cls] = classTotal;
      grandTotal += classTotal;
    });

    return { totals, grandTotal };
  };

  const { totals, grandTotal } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Client Info */}
      <div className="glass p-4 rounded-2xl border border-white/10">
        <p className="text-sm text-gray-400">Cliente</p>
        <p className="text-lg font-bold text-white">{clientName}</p>
      </div>

      {/* Date & Objective */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Data *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full glass p-3 rounded-lg border border-white/10 text-white focus:border-accent focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Objetivo *</label>
          <select
            value={formData.objective}
            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
            className="w-full glass p-3 rounded-lg border border-white/10 text-white focus:border-accent focus:outline-none transition-colors"
          >
            <option value="Conservador">Conservador</option>
            <option value="Moderado">Moderado</option>
            <option value="Agressivo">Agressivo</option>
          </select>
        </div>
      </div>

      {/* Asset Classes */}
      <div className="space-y-4">
        {ASSET_CLASSES.map((cls) => (
          <div key={cls} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white capitalize">
                {cls === 'rf' ? 'Renda Fixa' : cls === 'fiis' ? 'FIIs' : cls.charAt(0).toUpperCase() + cls.slice(1)}
              </h3>
              <span className="text-xs text-gray-400">
                R$ {totals[cls]?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </span>
            </div>

            <div className="space-y-2">
              {(formData.assets[cls as keyof typeof formData.assets] || []).map((asset, idx) => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  idx={idx}
                  onChange={(updatedAsset) => updateAsset(cls, idx, updatedAsset)}
                  onRemove={() => removeAsset(cls, idx)}
                />
              ))}
            </div>

            <button
              onClick={() => addAsset(cls)}
              className="w-full py-2 border border-dashed border-white/20 rounded-lg text-xs text-gray-400 hover:text-white hover:border-accent transition-colors flex items-center justify-center gap-1"
            >
              <Plus size={14} /> Adicionar Ativo
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass p-4 rounded-2xl border border-accent/20 bg-accent/5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Total Investimento</span>
          <span className="text-2xl font-bold text-accent">
            R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {errors.assets && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle size={12} /> {errors.assets}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/5 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-3 bg-accent rounded-lg text-white font-semibold hover:bg-accent/80 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? 'Salvando...' : <><CheckCircle size={16} /> Salvar Rascunho</>}
        </button>
      </div>
    </div>
  );
};

export default InvestmentMinutesForm;
