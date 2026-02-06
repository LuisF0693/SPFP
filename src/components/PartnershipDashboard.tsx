/**
 * Partnership Dashboard
 * FASE 3: STY-076 (Partner Profiles) + STY-077 (Commission Models)
 *
 * Displays partner profiles, KPI tracking, and commission models
 */

import React, { useState, useMemo } from 'react';
import { Partner, PartnerStatus } from '../types/partnership';
import { formatCurrency } from '../utils';
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  PieChart,
  Calendar
} from 'lucide-react';
import { Modal } from './ui/Modal';

interface PartnershipDashboardProps {
  partners: Partner[];
  onAddPartner: () => void;
  onEditPartner: (partner: Partner) => void;
  onDeletePartner: (partnerId: string) => void;
}

export const PartnershipDashboard: React.FC<PartnershipDashboardProps> = ({
  partners,
  onAddPartner,
  onEditPartner,
  onDeletePartner
}) => {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [filterStatus, setFilterStatus] = useState<PartnerStatus | 'ALL'>('ALL');

  const activePartners = useMemo(() => {
    const safePartners = Array.isArray(partners) ? partners : [];
    return safePartners
      .filter(p => !p.deletedAt && (filterStatus === 'ALL' || p.status === filterStatus))
      .sort((a, b) => b.totalAUM - a.totalAUM);
  }, [partners, filterStatus]);

  const stats = useMemo(() => {
    const safePartners = Array.isArray(partners) ? partners : [];
    const active = safePartners.filter(p => !p.deletedAt && p.status === PartnerStatus.ACTIVE);
    const totalAUM = active.reduce((sum, p) => sum + p.totalAUM, 0);
    const totalClients = active.reduce((sum, p) => sum + p.clientsManaged, 0);
    const totalCommissions = active.reduce((sum, p) => sum + p.totalCommissions, 0);

    return { activeCount: active.length, totalAUM, totalClients, totalCommissions };
  }, [partners]);

  const getStatusColor = (status: PartnerStatus): string => {
    switch (status) {
      case PartnerStatus.ACTIVE:
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case PartnerStatus.INACTIVE:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      case PartnerStatus.SUSPENDED:
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case PartnerStatus.PENDING:
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getKPIColor = (current: number, target: number): string => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'text-green-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Parcerias Estratégicas</h1>
          <p className="text-gray-400">Gestão de parceiros, KPIs e comissões</p>
        </div>
        <button
          onClick={onAddPartner}
          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus size={18} />
          <span>Novo Parceiro</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card-dark border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Parceiros Ativos</span>
            <Users size={18} className="text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-white">{stats.activeCount}</span>
        </div>

        <div className="bg-card-dark border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Total AUM</span>
            <TrendingUp size={18} className="text-green-400" />
          </div>
          <span className="text-2xl font-bold text-white">{formatCurrency(stats.totalAUM)}</span>
        </div>

        <div className="bg-card-dark border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Clientes Gerenciados</span>
            <Users size={18} className="text-purple-400" />
          </div>
          <span className="text-2xl font-bold text-white">{stats.totalClients}</span>
        </div>

        <div className="bg-card-dark border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Comissões Totais</span>
            <DollarSign size={18} className="text-yellow-400" />
          </div>
          <span className="text-2xl font-bold text-white">{formatCurrency(stats.totalCommissions)}</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === status
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700'
            }`}
          >
            {status === 'ALL' ? 'Todos' : status}
          </button>
        ))}
      </div>

      {/* Partners Table */}
      <div className="bg-card-dark border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-gray-800">
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Parceiro</th>
                <th className="px-4 py-3 text-right text-gray-400 font-semibold">AUM</th>
                <th className="px-4 py-3 text-right text-gray-400 font-semibold">Clientes</th>
                <th className="px-4 py-3 text-right text-gray-400 font-semibold">Comissão Mês</th>
                <th className="px-4 py-3 text-center text-gray-400 font-semibold">KPIs</th>
                <th className="px-4 py-3 text-center text-gray-400 font-semibold">Status</th>
                <th className="px-4 py-3 text-center text-gray-400 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {activePartners.map(partner => {
                const safeKpis = Array.isArray(partner.kpis) ? partner.kpis : [];
                const kpiCompletion = (safeKpis.filter(k => k.current >= k.target).length / safeKpis.length) * 100 || 0;
                return (
                  <tr
                    key={partner.id}
                    className="border-b border-gray-800 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedPartner(partner)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {partner.avatar && (
                          <img src={partner.avatar} alt="" className="w-8 h-8 rounded-full" />
                        )}
                        <div>
                          <p className="font-semibold text-white">{partner.name}</p>
                          <p className="text-gray-500 text-xs">{partner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-semibold">
                      {formatCurrency(partner.totalAUM)}
                    </td>
                    <td className="px-4 py-3 text-right text-white font-semibold">
                      {partner.clientsManaged}
                    </td>
                    <td className="px-4 py-3 text-right text-green-400 font-semibold">
                      {formatCurrency(partner.totalCommissions / 12)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span className={`font-bold ${getKPIColor(kpiCompletion, 100)}`}>
                          {Math.round(kpiCompletion)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(partner.status)}`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPartner(partner);
                          }}
                          className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} className="text-blue-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Desativar este parceiro?')) {
                              onDeletePartner(partner.id);
                            }
                          }}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          title="Desativar"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Detail Modal */}
      <Modal
        isOpen={!!selectedPartner}
        onClose={() => setSelectedPartner(null)}
        title={selectedPartner?.name || 'Detalhes do Parceiro'}
        size="lg"
        variant="dark"
      >
        {selectedPartner && (
          <div className="space-y-6">
            {/* Commission Model */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center space-x-2">
                <DollarSign size={16} />
                <span>Modelo de Comissão</span>
              </label>
              <div className="bg-white/5 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-300">{selectedPartner.commissionModel}</span>
                  <span className="text-lg font-bold text-green-400">
                    {selectedPartner.commissionRules[0]?.value.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3 flex items-center space-x-2">
                <Target size={16} />
                <span>Indicadores de Desempenho</span>
              </label>
              <div className="space-y-2">
                {(Array.isArray(selectedPartner.kpis) ? selectedPartner.kpis : []).map(kpi => {
                  const percentage = (kpi.current / kpi.target) * 100;
                  const isComplete = kpi.current >= kpi.target;
                  return (
                    <div key={kpi.id} className="bg-white/5 border border-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">{kpi.metric}</span>
                        <span className={`text-xs font-bold ${isComplete ? 'text-green-400' : 'text-yellow-400'}`}>
                          {kpi.current} / {kpi.target}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-gray-700 rounded-lg p-3">
                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Clientes</span>
                <span className="text-lg font-bold text-white">{selectedPartner.clientsManaged}</span>
              </div>
              <div className="bg-white/5 border border-gray-700 rounded-lg p-3">
                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Total AUM</span>
                <span className="text-lg font-bold text-white">{formatCurrency(selectedPartner.totalAUM)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PartnershipDashboard;
