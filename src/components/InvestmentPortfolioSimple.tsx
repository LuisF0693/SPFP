/**
 * Investment Portfolio Simple Display Component
 * FASE 1: STY-064 (Investment Portfolio Simple Display)
 *
 * Displays investment portfolio in a simple table format with:
 * - Asset name, type, quantity, price, total value
 * - Add/Edit/Delete functionality
 * - Performance indicators (green/red/gray)
 * - Responsive design
 */

import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils';
import { InvestmentAsset, ASSET_TYPE_CONFIG } from '../types/investment';
import { Modal } from './ui/Modal';
import { calculateGain, calculateGainPercentage, calculatePortfolioSummary } from '../services/investmentService';

export const InvestmentPortfolioSimple: React.FC = () => {
  const { investments = [], addInvestment, updateInvestment, deleteInvestment } = useFinance();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<InvestmentAsset> | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'value' | 'gain'>('value');

  // Filter active investments
  const activeInvestments = useMemo(
    () => investments.filter(i => !i.deletedAt),
    [investments]
  );

  // Calculate portfolio summary
  const summary = useMemo(() => calculatePortfolioSummary(investments), [investments]);

  // Sort investments
  const sortedInvestments = useMemo(() => {
    const sorted = [...activeInvestments];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'type':
        return sorted.sort((a, b) => a.assetType.localeCompare(b.assetType));
      case 'gain':
        return sorted.sort((a, b) => calculateGainPercentage(b) - calculateGainPercentage(a));
      case 'value':
      default:
        return sorted.sort((a, b) => b.totalValue - a.totalValue);
    }
  }, [activeInvestments, sortBy]);

  const handleAddClick = () => {
    setEditingId(null);
    setFormData(null);
    setShowForm(true);
  };

  const handleEditClick = (investment: InvestmentAsset) => {
    setEditingId(investment.id);
    setFormData(investment);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este investimento?')) {
      deleteInvestment(id);
    }
  };

  const handleSaveClick = () => {
    if (!formData || !formData.name) return;

    if (editingId) {
      updateInvestment(formData as InvestmentAsset);
    } else {
      const now = new Date().toISOString();
      addInvestment({
        name: formData.name,
        assetType: formData.assetType || 'STOCKS',
        quantity: formData.quantity || 0,
        purchasePrice: formData.purchasePrice || 0,
        currentPrice: formData.currentPrice || 0,
        totalValue: (formData.quantity || 0) * (formData.currentPrice || 0),
        purchaseValue: (formData.quantity || 0) * (formData.purchasePrice || 0),
        dateAdded: now,
        lastUpdated: now,
        notes: formData.notes
      });
    }

    setShowForm(false);
    setFormData(null);
    setEditingId(null);
  };

  const getPerformanceColor = (gainPercentage: number) => {
    if (gainPercentage > 5) return 'text-green-400';
    if (gainPercentage < -5) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPerformanceIcon = (gainPercentage: number) => {
    if (gainPercentage > 5) return <TrendingUp size={16} />;
    if (gainPercentage < -5) return <TrendingDown size={16} />;
    return <ArrowRight size={16} />;
  };

  if (activeInvestments.length === 0) {
    return (
      <div className="bg-card-dark border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Portfólio de Investimentos</h2>
          <Plus size={20} className="text-gray-500" />
        </div>
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">Nenhum investimento registrado</p>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium"
          >
            Adicionar Investimento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-card-dark border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Portfólio de Investimentos</h2>
          <button
            onClick={handleAddClick}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            <span>Adicionar</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 uppercase mb-1">Ativos</div>
            <div className="text-sm font-bold text-white">{summary.totalAssets}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 uppercase mb-1">Investido</div>
            <div className="text-sm font-bold text-gray-300">{formatCurrency(summary.totalInvested)}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 uppercase mb-1">Valor Atual</div>
            <div className="text-sm font-bold text-white">{formatCurrency(summary.totalValue)}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-[10px] text-gray-400 uppercase mb-1">Rendimento</div>
            <div className={`text-sm font-bold ${summary.gainPercentage > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {summary.gainPercentage > 0 ? '+' : ''}{summary.gainPercentage.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card-dark border border-gray-800 rounded-xl overflow-hidden">
        {/* Sort Buttons */}
        <div className="p-4 border-b border-gray-800 flex items-center space-x-2 flex-wrap">
          <span className="text-xs text-gray-400 uppercase">Ordenar:</span>
          {(['name', 'type', 'value', 'gain'] as const).map(option => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                sortBy === option
                  ? 'bg-blue-500/30 text-blue-400 border border-blue-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {option === 'name' && 'Nome'}
              {option === 'type' && 'Tipo'}
              {option === 'value' && 'Valor'}
              {option === 'gain' && 'Performance'}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Ativo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Tipo</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">Qtd</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">Preço Unit.</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">Valor Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">Perf.</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedInvestments.map(investment => {
                const gainPercentage = calculateGainPercentage(investment);
                const config = ASSET_TYPE_CONFIG[investment.assetType];

                return (
                  <tr key={investment.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-gray-300 font-medium">{investment.name}</td>
                    <td className="px-4 py-3 text-gray-400">
                      <span className="inline-flex items-center space-x-1">
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">{investment.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{formatCurrency(investment.currentPrice)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      {formatCurrency(investment.totalValue)}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold flex items-center justify-end space-x-1 ${getPerformanceColor(gainPercentage)}`}>
                      <span>{gainPercentage.toFixed(1)}%</span>
                      {getPerformanceIcon(gainPercentage)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(investment)}
                          className="p-1 rounded hover:bg-blue-500/20 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(investment.id)}
                          className="p-1 rounded hover:bg-red-500/20 transition-colors"
                          title="Deletar"
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-white/5 border-t-2 border-gray-700">
                <td className="px-4 py-3 font-bold text-white">TOTAL</td>
                <td colSpan={3}></td>
                <td className="px-4 py-3 text-right font-bold text-white">{formatCurrency(summary.totalValue)}</td>
                <td className={`px-4 py-3 text-right font-bold ${summary.gainPercentage > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {summary.gainPercentage > 0 ? '+' : ''}{summary.gainPercentage.toFixed(2)}%
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Investment Form Modal */}
      {showForm && (
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setFormData(null);
            setEditingId(null);
          }}
          title={editingId ? 'Editar Investimento' : 'Adicionar Investimento'}
          size="md"
          variant="dark"
        >
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Ativo</label>
              <input
                type="text"
                value={formData?.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Ação Apple"
                className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Asset Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
              <select
                value={formData?.assetType || 'STOCKS'}
                onChange={e => setFormData({ ...formData, assetType: e.target.value as any })}
                className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="STOCKS">Ações</option>
                <option value="FUNDS">Fundos</option>
                <option value="FIXED_INCOME">Renda Fixa</option>
                <option value="CRYPTO">Criptos</option>
                <option value="ETFS">ETFs</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Quantidade</label>
              <input
                type="number"
                value={formData?.quantity || 0}
                onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                placeholder="10"
                className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Preço de Compra (Unit.)</label>
              <input
                type="number"
                value={formData?.purchasePrice || 0}
                onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                placeholder="100.00"
                className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Current Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Preço Atual (Unit.)</label>
              <input
                type="number"
                value={formData?.currentPrice || 0}
                onChange={e => setFormData({ ...formData, currentPrice: parseFloat(e.target.value) })}
                placeholder="150.00"
                className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Notas</label>
              <textarea
                value={formData?.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações (opcional)"
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData(null);
                  setEditingId(null);
                }}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveClick}
                className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium transition-colors border border-blue-500/30"
              >
                Salvar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InvestmentPortfolioSimple;
