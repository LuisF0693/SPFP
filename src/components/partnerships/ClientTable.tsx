import React, { useState } from 'react';
import { Search, Filter, Download, Check, Clock, XCircle, ChevronDown } from 'lucide-react';
import { PartnershipClient } from '../../types/investments';
import { formatCurrency } from '../../utils';

interface ClientTableProps {
  clients: PartnershipClient[];
  onStatusChange?: (id: string, status: 'pending' | 'paid' | 'cancelled') => void;
  loading?: boolean;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onStatusChange,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort clients
  const filteredClients = clients
    .filter(client => {
      const matchesSearch = client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.partner?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime();
          break;
        case 'value':
          comparison = a.contract_value - b.contract_value;
          break;
        case 'name':
          comparison = a.client_name.localeCompare(b.client_name);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Check className="w-3 h-3" />
            Pago
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  // Calculate totals
  const totals = filteredClients.reduce(
    (acc, client) => ({
      contractValue: acc.contractValue + client.contract_value,
      myShare: acc.myShare + client.my_share,
      partnerShare: acc.partnerShare + client.partner_share,
    }),
    { contractValue: 0, myShare: 0, partnerShare: 0 }
  );

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1A2233] border border-[#e6e8eb] dark:border-[#2e374a] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#2e374a] rounded-xl w-1/3" />
          <div className="h-64 bg-[#2e374a] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A2233] border border-[#e6e8eb] dark:border-[#2e374a] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#2e374a] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#92a4c9]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente ou parceiro..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#101622] border border-[#2e374a] text-white placeholder:text-[#6e85a3] focus:border-[#135bec] outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#101622] border border-[#2e374a] text-white text-sm focus:border-[#135bec] outline-none"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="paid">Pagos</option>
            <option value="cancelled">Cancelados</option>
          </select>

          <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#2e374a] text-[#92a4c9] hover:text-white hover:border-[#135bec] transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2e374a]">
              <th className="text-left p-4 text-xs text-[#92a4c9] uppercase tracking-wider font-medium">
                <button
                  onClick={() => {
                    setSortBy('name');
                    setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Cliente
                  {sortBy === 'name' && <ChevronDown className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                </button>
              </th>
              <th className="text-left p-4 text-xs text-[#92a4c9] uppercase tracking-wider font-medium">Parceiro</th>
              <th className="text-right p-4 text-xs text-[#92a4c9] uppercase tracking-wider font-medium">
                <button
                  onClick={() => {
                    setSortBy('value');
                    setSortOrder(sortBy === 'value' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="flex items-center gap-1 hover:text-white transition-colors ml-auto"
                >
                  Valor Contrato
                  {sortBy === 'value' && <ChevronDown className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                </button>
              </th>
              <th className="text-right p-4 text-xs text-[#92a4c9] uppercase tracking-wider font-medium">Minha Parte</th>
              <th className="text-right p-4 text-xs text-[#92a4c9] uppercase tracking-wider font-medium">Parte Parceiro</th>
              <th className="text-center p-4 text-xs text-[#92a4c9] uppercase tracking-wider font-medium">Status</th>
              <th className="text-right p-4 text-xs text-[#92a4c9] uppercase tracking-wider font-medium">
                <button
                  onClick={() => {
                    setSortBy('date');
                    setSortOrder(sortBy === 'date' && sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="flex items-center gap-1 hover:text-white transition-colors ml-auto"
                >
                  Data
                  {sortBy === 'date' && <ChevronDown className={`w-3 h-3 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-[#92a4c9]">
                  Nenhum cliente encontrado
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-[#2e374a]/50 hover:bg-[#101622]/50 transition-colors"
                >
                  <td className="p-4">
                    <span className="text-white font-medium">{client.client_name}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-[#92a4c9]">{client.partner?.name || '-'}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-white font-medium">{formatCurrency(client.contract_value)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-emerald-400 font-medium">{formatCurrency(client.my_share)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-[#92a4c9]">{formatCurrency(client.partner_share)}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => {
                        const nextStatus = client.status === 'pending' ? 'paid' : 'pending';
                        onStatusChange?.(client.id, nextStatus);
                      }}
                    >
                      {getStatusBadge(client.status)}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-[#92a4c9] text-sm">
                      {new Date(client.closed_at).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {filteredClients.length > 0 && (
            <tfoot>
              <tr className="bg-[#101622]/50">
                <td colSpan={2} className="p-4 text-xs text-[#92a4c9] uppercase tracking-wider font-medium">
                  Total ({filteredClients.length} clientes)
                </td>
                <td className="p-4 text-right">
                  <span className="text-white font-bold">{formatCurrency(totals.contractValue)}</span>
                </td>
                <td className="p-4 text-right">
                  <span className="text-emerald-400 font-bold">{formatCurrency(totals.myShare)}</span>
                </td>
                <td className="p-4 text-right">
                  <span className="text-[#92a4c9] font-bold">{formatCurrency(totals.partnerShare)}</span>
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default ClientTable;
