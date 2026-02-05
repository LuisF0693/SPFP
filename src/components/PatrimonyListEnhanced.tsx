/**
 * Patrimony List Enhanced
 * FASE 2: STY-074 (Patrimony Listing Enhancement)
 *
 * Consolidated view of all assets with filtering and sorting
 */

import React, { useState, useMemo } from 'react';
import { Account } from '../types';
import { Asset, ASSET_CATEGORY_CONFIG } from '../types/assets';
import { InvestmentAsset } from '../types/investment';
import { PatrimonyItem } from '../types';
import { formatCurrency } from '../utils';
import { ChevronUp, ChevronDown, Trash2, Edit2, Filter } from 'lucide-react';

type PatrimonyAsset = (Account & { type: 'account' }) |
                      (InvestmentAsset & { type: 'investment' }) |
                      (Asset & { type: 'asset' }) |
                      (PatrimonyItem & { type: 'patrimony' });

interface PatrimonyListEnhancedProps {
  accounts: Account[];
  investments: InvestmentAsset[];
  assets: Asset[];
  patrimonyItems: PatrimonyItem[];
  onEdit?: (item: PatrimonyAsset) => void;
  onDelete?: (id: string, type: string) => void;
}

type SortField = 'name' | 'value' | 'date' | 'type';
type FilterType = 'all' | 'account' | 'investment' | 'asset' | 'patrimony';

export const PatrimonyListEnhanced: React.FC<PatrimonyListEnhancedProps> = ({
  accounts,
  investments,
  assets,
  patrimonyItems,
  onEdit,
  onDelete
}) => {
  const [sortBy, setSortBy] = useState<SortField>('type');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortAsc, setSortAsc] = useState(true);

  // Consolidate all assets
  const allAssets = useMemo((): PatrimonyAsset[] => {
    const consolidated: PatrimonyAsset[] = [];

    accounts.filter(a => !a.deletedAt).forEach(a => {
      consolidated.push({ ...a, type: 'account' });
    });

    investments.filter(i => !i.deletedAt).forEach(i => {
      consolidated.push({ ...i, type: 'investment' });
    });

    assets.filter(a => !a.deletedAt).forEach(a => {
      consolidated.push({ ...a, type: 'asset' });
    });

    patrimonyItems.filter(p => !p.deletedAt).forEach(p => {
      consolidated.push({ ...p, type: 'patrimony' });
    });

    return consolidated;
  }, [accounts, investments, assets, patrimonyItems]);

  // Filter assets
  const filtered = useMemo(() => {
    if (filterType === 'all') return allAssets;
    return allAssets.filter(a => (a as any).type === filterType);
  }, [allAssets, filterType]);

  // Sort assets
  const sorted = useMemo(() => {
    const compare = (a: PatrimonyAsset, b: PatrimonyAsset) => {
      let aVal: any = 0;
      let bVal: any = 0;

      switch (sortBy) {
        case 'name':
          aVal = (a as any).name || '';
          bVal = (b as any).name || '';
          return aVal.localeCompare(bVal);

        case 'value':
          aVal = (a as any).balance || (a as any).totalValue || (a as any).purchasePrice || 0;
          bVal = (b as any).balance || (b as any).totalValue || (b as any).purchasePrice || 0;
          return aVal - bVal;

        case 'date':
          aVal = new Date((a as any).dateAdded || (a as any).createdAt || 0).getTime();
          bVal = new Date((b as any).dateAdded || (b as any).createdAt || 0).getTime();
          return aVal - bVal;

        case 'type':
          aVal = (a as any).type;
          bVal = (b as any).type;
          return aVal.localeCompare(bVal);

        default:
          return 0;
      }
    };

    const sorted = [...filtered].sort(compare);
    return sortAsc ? sorted : sorted.reverse();
  }, [filtered, sortBy, sortAsc]);

  // Calculate totals by type
  const totals = useMemo(() => {
    const result: Record<string, number> = {
      account: 0,
      investment: 0,
      asset: 0,
      patrimony: 0
    };

    allAssets.forEach(item => {
      const value = (item as any).balance || (item as any).totalValue || (item as any).purchasePrice || 0;
      result[(item as any).type] += value;
    });

    return result;
  }, [allAssets]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'account':
        return '🏦';
      case 'investment':
        return '📈';
      case 'asset':
        return '🏠';
      case 'patrimony':
        return '💎';
      default:
        return '📦';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'account':
        return 'Contas';
      case 'investment':
        return 'Investimentos';
      case 'asset':
        return 'Bens';
      case 'patrimony':
        return 'Patrimônio';
      default:
        return 'Outro';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Sorting */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as FilterType)}
            className="px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos os ativos</option>
            <option value="account">Contas</option>
            <option value="investment">Investimentos</option>
            <option value="asset">Bens</option>
            <option value="patrimony">Patrimônio</option>
          </select>
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortField)}
          className="px-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="type">Ordenar por Tipo</option>
          <option value="name">Ordenar por Nome</option>
          <option value="value">Ordenar por Valor</option>
          <option value="date">Ordenar por Data</option>
        </select>

        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-gray-700 rounded-lg text-white text-sm transition-colors flex items-center space-x-1"
        >
          {sortAsc ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          <span>{sortAsc ? 'Asc' : 'Desc'}</span>
        </button>
      </div>

      {/* Asset List Table */}
      <div className="bg-card-dark border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-gray-800">
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Nome</th>
                <th className="px-4 py-3 text-right text-gray-400 font-semibold">Valor</th>
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Adicionado</th>
                <th className="px-4 py-3 text-center text-gray-400 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, idx) => (
                <tr key={`${(item as any).type}-${(item as any).id}`} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-2xl">{getTypeIcon((item as any).type)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{(item as any).name}</p>
                    <p className="text-xs text-gray-500">{getTypeLabel((item as any).type)}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-green-400">
                      {formatCurrency((item as any).balance || (item as any).totalValue || (item as any).purchasePrice || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date((item as any).dateAdded || (item as any).createdAt || Date.now()).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                        >
                          <Edit2 size={14} className="text-blue-400" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (confirm('Deletar este ativo?')) {
                              onDelete((item as any).id, (item as any).type);
                            }
                          }}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card-dark border border-gray-800 rounded-lg p-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Contas</p>
          <p className="text-xl font-bold text-blue-400">{formatCurrency(totals.account)}</p>
        </div>
        <div className="bg-card-dark border border-gray-800 rounded-lg p-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Investimentos</p>
          <p className="text-xl font-bold text-green-400">{formatCurrency(totals.investment)}</p>
        </div>
        <div className="bg-card-dark border border-gray-800 rounded-lg p-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Bens</p>
          <p className="text-xl font-bold text-orange-400">{formatCurrency(totals.asset)}</p>
        </div>
        <div className="bg-card-dark border border-gray-800 rounded-lg p-4">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Patrimônio Total</p>
          <p className="text-xl font-bold text-purple-400">
            {formatCurrency(totals.account + totals.investment + totals.asset + totals.patrimony)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatrimonyListEnhanced;
