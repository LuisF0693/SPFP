import React, { useState } from 'react';
import { Plus, Users, TrendingUp, Wallet, Clock, CheckCircle } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { ChartCard } from '../ui/ChartCard';
import { ActionButton } from '../ui/ActionButton';
import { PartnerCard } from './PartnerCard';
import { ClientTable } from './ClientTable';
import { PartnerForm } from './PartnerForm';
import { ClientForm } from './ClientForm';
import { usePartnerships } from '../../hooks/usePartnerships';
import { Partner, PartnershipClient } from '../../types/investments';
import { formatCurrency } from '../../utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

type ViewMode = 'partners' | 'clients';

export const PartnershipsPage: React.FC = () => {
  const {
    partners,
    clients,
    loading,
    stats,
    addPartner,
    updatePartner,
    deletePartner,
    addClient,
    updateClient,
    deleteClient,
    getClientsByPartner,
  } = usePartnerships();

  const [viewMode, setViewMode] = useState<ViewMode>('partners');
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editingClient, setEditingClient] = useState<PartnershipClient | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  const handleSavePartner = (data: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingPartner) {
      updatePartner(editingPartner.id, data);
    } else {
      addPartner(data);
    }
    setShowPartnerForm(false);
    setEditingPartner(null);
  };

  const handleSaveClient = (data: Omit<PartnershipClient, 'id' | 'created_at' | 'total_commission' | 'my_share' | 'partner_share'>) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
    } else {
      addClient(data);
    }
    setShowClientForm(false);
    setEditingClient(null);
    setSelectedPartnerId(null);
  };

  const handleDeletePartner = (id: string) => {
    if (window.confirm('Excluir parceiro e todos os clientes associados?')) {
      deletePartner(id);
    }
  };

  const handlePartnerClick = (partner: Partner) => {
    setSelectedPartnerId(partner.id);
    setViewMode('clients');
  };

  const handleAddClientFromPartner = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setShowClientForm(true);
  };

  // Chart data
  const chartData = stats.monthlyRevenue.map(item => ({
    month: item.month.split('-')[1] + '/' + item.month.split('-')[0].slice(2),
    value: item.value,
  }));

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622]">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Gestão de Parcerias
            </h2>
            <p className="text-[#637588] dark:text-[#92a4c9] text-base font-normal">
              {stats.totalPartners} parceiros, {stats.totalClients} clientes, {formatCurrency(stats.totalMyShare)} em comissões
            </p>
          </div>
          <div className="flex gap-3">
            <ActionButton
              label="Novo Parceiro"
              icon={<Users className="w-4 h-4" />}
              variant="outline"
              onClick={() => {
                setEditingPartner(null);
                setShowPartnerForm(true);
              }}
            />
            <ActionButton
              label="Novo Cliente"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingClient(null);
                setSelectedPartnerId(null);
                setShowClientForm(true);
              }}
              disabled={partners.length === 0}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Contratos"
            value={formatCurrency(stats.totalContractValue)}
            icon={<TrendingUp className="w-5 h-5" />}
            loading={loading}
          />
          <StatCard
            title="Minhas Comissões"
            value={formatCurrency(stats.totalMyShare)}
            icon={<Wallet className="w-5 h-5" />}
            iconBgColor="bg-emerald-500/10"
            iconColor="text-emerald-500"
            trend={{ value: 'Total acumulado', direction: 'up' }}
            loading={loading}
          />
          <StatCard
            title="Pendente"
            value={formatCurrency(stats.pendingMyShare)}
            subtitle={`${stats.pendingCount} clientes`}
            icon={<Clock className="w-5 h-5" />}
            iconBgColor="bg-amber-500/10"
            iconColor="text-amber-500"
            loading={loading}
          />
          <StatCard
            title="Recebido"
            value={formatCurrency(stats.paidMyShare)}
            subtitle={`${stats.paidCount} clientes`}
            icon={<CheckCircle className="w-5 h-5" />}
            iconBgColor="bg-emerald-500/10"
            iconColor="text-emerald-500"
            loading={loading}
          />
          <StatCard
            title="Parte Parceiros"
            value={formatCurrency(stats.totalPartnerShare)}
            subtitle="50% das comissões"
            icon={<Users className="w-5 h-5" />}
            loading={loading}
          />
        </div>

        {/* Revenue Chart */}
        <ChartCard
          title="Receita Mensal"
          subtitle="Suas comissões nos últimos 12 meses"
          icon={<TrendingUp className="w-5 h-5" />}
          loading={loading}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                <XAxis
                  dataKey="month"
                  stroke="#475569"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#475569"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                    return value.toString();
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A2233',
                    border: '1px solid #2e374a',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: '#92a4c9' }}
                  formatter={(value: number) => [formatCurrency(value), 'Comissão']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === chartData.length - 1 ? '#22c55e' : '#135bec'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setViewMode('partners');
              setSelectedPartnerId(null);
            }}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              viewMode === 'partners'
                ? 'bg-[#135bec] text-white'
                : 'bg-[#1A2233] text-[#92a4c9] hover:text-white border border-[#2e374a]'
            }`}
          >
            Parceiros ({partners.length})
          </button>
          <button
            onClick={() => setViewMode('clients')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              viewMode === 'clients'
                ? 'bg-[#135bec] text-white'
                : 'bg-[#1A2233] text-[#92a4c9] hover:text-white border border-[#2e374a]'
            }`}
          >
            Clientes ({selectedPartnerId ? getClientsByPartner(selectedPartnerId).length : clients.length})
          </button>
        </div>

        {/* Content */}
        {viewMode === 'partners' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-16 h-16 text-[#2e374a] mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">Nenhum parceiro cadastrado</h3>
                <p className="text-[#92a4c9] mb-4">Adicione seu primeiro parceiro para começar</p>
                <ActionButton
                  label="Adicionar Parceiro"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowPartnerForm(true)}
                />
              </div>
            ) : (
              partners.map(partner => {
                const partnerClients = getClientsByPartner(partner.id);
                const totalRevenue = partnerClients.reduce((sum, c) => sum + c.my_share, 0);
                const pendingRevenue = partnerClients
                  .filter(c => c.status === 'pending')
                  .reduce((sum, c) => sum + c.my_share, 0);

                return (
                  <PartnerCard
                    key={partner.id}
                    partner={partner}
                    clientCount={partnerClients.length}
                    totalRevenue={totalRevenue}
                    pendingRevenue={pendingRevenue}
                    onEdit={(p) => {
                      setEditingPartner(p);
                      setShowPartnerForm(true);
                    }}
                    onDelete={handleDeletePartner}
                    onClick={handlePartnerClick}
                  />
                );
              })
            )}
          </div>
        ) : (
          <ClientTable
            clients={selectedPartnerId ? getClientsByPartner(selectedPartnerId) : clients}
            onStatusChange={(id, status) => updateClient(id, { status })}
            loading={loading}
          />
        )}

        {/* Partner Form Modal */}
        {showPartnerForm && (
          <PartnerForm
            partner={editingPartner}
            onSave={handleSavePartner}
            onClose={() => {
              setShowPartnerForm(false);
              setEditingPartner(null);
            }}
          />
        )}

        {/* Client Form Modal */}
        {showClientForm && (
          <ClientForm
            client={editingClient}
            partners={partners}
            defaultPartnerId={selectedPartnerId || undefined}
            onSave={handleSaveClient}
            onClose={() => {
              setShowClientForm(false);
              setEditingClient(null);
              setSelectedPartnerId(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PartnershipsPage;
