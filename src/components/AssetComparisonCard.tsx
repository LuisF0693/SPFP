/**
 * Asset Comparison Card
 * FASE 2: STY-072 (Asset Acquisition Comparison UI)
 *
 * Side-by-side comparison of buy vs rent scenarios
 */

import React, { useMemo } from 'react';
import { Asset, AcquisitionType, ASSET_CATEGORY_CONFIG } from '../types/assets';
import { assetService } from '../services/assetService';
import { formatCurrency } from '../utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingDown, TrendingUp, Check } from 'lucide-react';

interface AssetComparisonCardProps {
  asset: Asset;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const AssetComparisonCard: React.FC<AssetComparisonCardProps> = ({
  asset,
  onEdit,
  onDelete
}) => {
  const comparison = useMemo(() => assetService.getAssetComparison(asset), [asset]);
  const categoryConfig = ASSET_CATEGORY_CONFIG[asset.category];

  // Generate cost evolution data for 30 years
  const costEvolutionData = useMemo(() => {
    if (!comparison) return [];

    const buyScenario = comparison.buyScenario;
    const rentScenario = comparison.rentScenario;

    const data = [];
    for (let year = 0; year <= 30; year++) {
      const months = year * 12;

      // Buy cost
      let buyCost = buyScenario.initialPayment;
      if (months <= buyScenario.loanTerm) {
        buyCost += buyScenario.monthlyPayment * months;
      } else {
        buyCost += buyScenario.monthlyPayment * buyScenario.loanTerm;
      }
      buyCost += (buyScenario.maintenanceCost * year);

      // Rent cost
      const rentCost = rentScenario.initialPayment + rentScenario.monthlyPayment * months;

      data.push({
        year,
        buyCost: Math.round(buyCost / 1000), // In thousands for chart
        rentCost: Math.round(rentCost / 1000)
      });
    }

    return data;
  }, [comparison]);

  if (!comparison) {
    return (
      <div className="bg-card-dark border border-gray-800 rounded-xl p-6">
        <p className="text-gray-400">Erro ao carregar comparação</p>
      </div>
    );
  }

  const isBuyBetter = comparison.savingsWith === 'BUY';
  const Icon = isBuyBetter ? TrendingDown : TrendingUp;

  return (
    <div className="bg-card-dark border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{asset.name}</h3>
            <p className="text-sm text-gray-400">{categoryConfig.label} • {asset.condition}</p>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs font-medium transition-colors"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-medium transition-colors"
              >
                Deletar
              </button>
            )}
          </div>
        </div>

        {/* Recommendation */}
        <div className={`p-3 rounded-lg flex items-center space-x-2 ${
          comparison.savingsWith === 'SIMILAR'
            ? 'bg-yellow-500/10 border border-yellow-500/30'
            : isBuyBetter
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-blue-500/10 border border-blue-500/30'
        }`}>
          <Icon size={16} className={
            comparison.savingsWith === 'SIMILAR'
              ? 'text-yellow-400'
              : isBuyBetter
              ? 'text-green-400'
              : 'text-blue-400'
          } />
          <span className={`text-sm font-semibold ${
            comparison.savingsWith === 'SIMILAR'
              ? 'text-yellow-300'
              : isBuyBetter
              ? 'text-green-300'
              : 'text-blue-300'
          }`}>
            {comparison.savingsWith === 'SIMILAR'
              ? 'Custo similar para os dois cenários'
              : isBuyBetter
              ? `Comprar é mais econômico: ${formatCurrency(comparison.savingsAmount)} em 30 anos`
              : `Alugar é mais econômico: ${formatCurrency(comparison.savingsAmount)} em 30 anos`}
          </span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="grid grid-cols-2 gap-4 p-6 border-b border-gray-800">
        <div>
          <h4 className="text-sm font-bold text-white mb-4">Compra</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Pagamento Inicial</p>
              <p className="text-lg font-bold text-white">{formatCurrency(comparison.buyScenario.initialPayment)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Mensalidade</p>
              <p className="text-lg font-bold text-white">{formatCurrency(comparison.buyScenario.monthlyPayment)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Prazo</p>
              <p className="text-lg font-bold text-white">{comparison.buyScenario.loanTerm} meses</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Manutenção Anual</p>
              <p className="text-lg font-bold text-white">{formatCurrency(comparison.buyScenario.maintenanceCost)}</p>
            </div>
            <div className="pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">Custo Total (30 anos)</p>
              <p className="text-xl font-bold text-green-400">
                {formatCurrency(comparison.buyScenario.totalCost30Years)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white mb-4">Aluguel</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Depósito Caução</p>
              <p className="text-lg font-bold text-white">{formatCurrency(comparison.rentScenario.initialPayment)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Aluguel Mensal</p>
              <p className="text-lg font-bold text-white">{formatCurrency(comparison.rentScenario.monthlyPayment)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Período</p>
              <p className="text-lg font-bold text-white">360 meses</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Manutenção</p>
              <p className="text-lg font-bold text-white">Incluído</p>
            </div>
            <div className="pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">Custo Total (30 anos)</p>
              <p className="text-xl font-bold text-blue-400">
                {formatCurrency(comparison.rentScenario.totalCost30Years)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Evolution Chart */}
      <div className="p-6">
        <h4 className="text-sm font-bold text-white mb-4">Evolução de Custo (30 anos)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={costEvolutionData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="year" stroke="#9CA3AF" label={{ value: 'Anos', position: 'insideBottomRight', offset: -10 }} />
            <YAxis stroke="#9CA3AF" label={{ value: 'Custo (x1000 R$)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              formatter={(value: any) => formatCurrency(value * 1000)}
              labelStyle={{ color: '#D1D5DB' }}
            />
            <Legend />
            <Line type="monotone" dataKey="buyCost" stroke="#10B981" strokeWidth={2} dot={false} name="Compra" />
            <Line type="monotone" dataKey="rentCost" stroke="#3B82F6" strokeWidth={2} dot={false} name="Aluguel" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="p-4 bg-white/5 border-t border-gray-800 text-xs text-gray-400">
        <p>{asset.notes || 'Sem notas'}</p>
      </div>
    </div>
  );
};

export default AssetComparisonCard;
