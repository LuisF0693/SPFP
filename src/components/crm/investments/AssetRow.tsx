import React from 'react';
import { Trash2 } from 'lucide-react';

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  unitValue: number;
  quantity: number;
}

interface AssetRowProps {
  asset: Asset;
  idx: number;
  onChange: (asset: Asset) => void;
  onRemove: () => void;
}

export const AssetRow: React.FC<AssetRowProps> = ({ asset, idx, onChange, onRemove }) => {
  const total = asset.unitValue * asset.quantity;

  const handleChange = (field: keyof Asset, value: any) => {
    onChange({
      ...asset,
      [field]: field === 'ticker' || field === 'name' ? value : parseFloat(value) || 0,
    });
  };

  return (
    <div className="glass p-4 rounded-lg border border-white/10 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Ticker */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Ticker</label>
          <input
            type="text"
            value={asset.ticker}
            onChange={(e) => handleChange('ticker', e.target.value)}
            placeholder="PETR4"
            className="w-full glass p-2 rounded border border-white/10 text-white placeholder-gray-500 focus:border-accent focus:outline-none text-sm"
            maxLength={10}
          />
        </div>

        {/* Name */}
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-gray-400 mb-1">Nome</label>
          <input
            type="text"
            value={asset.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Petrobras"
            className="w-full glass p-2 rounded border border-white/10 text-white placeholder-gray-500 focus:border-accent focus:outline-none text-sm"
          />
        </div>

        {/* Unit Value */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Valor Unit.</label>
          <input
            type="number"
            step="0.01"
            value={asset.unitValue}
            onChange={(e) => handleChange('unitValue', e.target.value)}
            placeholder="0.00"
            className="w-full glass p-2 rounded border border-white/10 text-white placeholder-gray-500 focus:border-accent focus:outline-none text-sm"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">Qtd</label>
          <input
            type="number"
            step="1"
            value={asset.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            placeholder="100"
            className="w-full glass p-2 rounded border border-white/10 text-white placeholder-gray-500 focus:border-accent focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Total Row */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-xs text-gray-400">Total</span>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-accent">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <button
            onClick={onRemove}
            className="p-1 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetRow;
