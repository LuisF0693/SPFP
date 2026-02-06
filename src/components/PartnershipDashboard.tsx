/**
 * Partnership Dashboard
 * FASE 3: STY-076 (Partner Profiles) + STY-077 (Commission Models)
 *
 * Displays partner profiles, KPI tracking, and commission models
 */

import React, { useState, useMemo } from 'react';
import { Partner, PartnerStatus } from '../types/partnership';
import { formatCurrency, generateId } from '../utils';
import {
  Users,
  TrendingUp,
  DollarSign,
  Target,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Modal } from './ui/Modal';

const STORAGE_KEY = 'spfp_partners';

interface PartnershipDashboardProps {
  partners?: Partner[];
  onAddPartner?: () => void;
  onEditPartner?: (partner: Partner) => void;
  onDeletePartner?: (partnerId: string) => void;
}

export const PartnershipDashboard: React.FC<PartnershipDashboardProps> = ({
  partners: externalPartners,
  onAddPartner: externalOnAdd,
  onEditPartner: externalOnEdit,
  onDeletePartner: externalOnDelete
}) => {
  // Internal state for standalone usage
  const [internalPartners, setInternalPartners] = useState<Partner[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Use external or internal state
  const partners = externalPartners ?? internalPartners;

  // Save to localStorage when internal partners change
  const savePartners = (newPartners: Partner[]) => {
    setInternalPartners(newPartners);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPartners));
  };

  // Internal handlers
  const handleAddPartner = () => {
    if (externalOnAdd) {
      externalOnAdd();
    } else {
      setEditingPartner(null);
      setIsFormOpen(true);
    }
  };

  const handleEditPartner = (partner: Partner) => {
    if (externalOnEdit) {
      externalOnEdit(partner);
    } else {
      setEditingPartner(partner);
      setIsFormOpen(true);
    }
  };

  const handleDeletePartner = (partnerId: string) => {
    if (externalOnDelete) {
      externalOnDelete(partnerId);
    } else {
      const updated = internalPartners.map(p =>
        p.id === partnerId ? { ...p, deletedAt: new Date().toISOString(), status: PartnerStatus.INACTIVE } : p
      );
      savePartners(updated);
    }
  };

  const handleSavePartner = (data: Partial<Partner>) => {
    if (editingPartner) {
      const updated = internalPartners.map(p =>
        p.id === editingPartner.id ? { ...p, ...data } : p
      );
      savePartners(updated);
    } else {
      const newPartner: Partner = {
        id: generateId(),
        name: data.name || 'Novo Parceiro',
        email: data.email || '',
        phone: data.phone || '',
        status: PartnerStatus.ACTIVE,
        totalAUM: 0,
        clientsManaged: 0,
        totalCommissions: 0,
        commissionModel: 'FIXED_PERCENTAGE',
        commissionRules: [{ id: generateId(), type: 'FIXED_PERCENTAGE', value: 1, minAUM: 0 }],
        kpis: [],
        createdAt: new Date().toISOString(),
        ...data
      };
      savePartners([...internalPartners, newPartner]);
    }
    setIsFormOpen(false);
    setEditingPartner(null);
  };
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
          onClick={handleAddPartner}
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
                            handleEditPartner(partner);
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
                              handleDeletePartner(partner.id);
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

      {/* Add/Edit Partner Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingPartner(null); }}
        title={editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'}
        size="md"
        variant="dark"
      >
        <PartnerForm
          partner={editingPartner}
          onSave={handleSavePartner}
          onCancel={() => { setIsFormOpen(false); setEditingPartner(null); }}
        />
      </Modal>
    </div>
  );
};

// Simple Partner Form Component
const PartnerForm: React.FC<{
  partner: Partner | null;
  onSave: (data: Partial<Partner>) => void;
  onCancel: () => void;
}> = ({ partner, onSave, onCancel }) => {
  const [name, setName] = useState(partner?.name || '');
  const [email, setEmail] = useState(partner?.email || '');
  const [phone, setPhone] = useState(partner?.phone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500"
          placeholder="Nome do parceiro"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500"
          placeholder="email@exemplo.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500"
          placeholder="(11) 99999-9999"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          {partner ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </form>
  );
};

export default PartnershipDashboard;
