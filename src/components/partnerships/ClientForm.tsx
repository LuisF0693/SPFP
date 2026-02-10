import React, { useState, useEffect } from 'react';
import { X, User, DollarSign, Percent, Calendar, Save } from 'lucide-react';
import { Partner, PartnershipClient } from '../../types/investments';
import { ActionButton } from '../ui/ActionButton';
import { formatCurrency } from '../../utils';

interface ClientFormProps {
  client?: PartnershipClient | null;
  partners: Partner[];
  defaultPartnerId?: string;
  onSave: (data: Omit<PartnershipClient, 'id' | 'created_at' | 'total_commission' | 'my_share' | 'partner_share'>) => void;
  onClose: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  client,
  partners,
  defaultPartnerId,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    partner_id: defaultPartnerId || '',
    client_name: '',
    contract_value: 0,
    commission_rate: 50,
    closed_at: new Date().toISOString().split('T')[0],
    status: 'pending' as const,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (client) {
      setFormData({
        partner_id: client.partner_id,
        client_name: client.client_name,
        contract_value: client.contract_value,
        commission_rate: client.commission_rate,
        closed_at: client.closed_at,
        status: client.status,
      });
    } else if (defaultPartnerId) {
      const partner = partners.find(p => p.id === defaultPartnerId);
      if (partner) {
        setFormData(prev => ({
          ...prev,
          partner_id: defaultPartnerId,
          commission_rate: partner.default_commission_rate,
        }));
      }
    }
  }, [client, defaultPartnerId, partners]);

  // Update commission rate when partner changes
  const handlePartnerChange = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    setFormData({
      ...formData,
      partner_id: partnerId,
      commission_rate: partner?.default_commission_rate || 50,
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.partner_id) {
      newErrors.partner_id = 'Selecione um parceiro';
    }

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Nome do cliente é obrigatório';
    }

    if (formData.contract_value <= 0) {
      newErrors.contract_value = 'Valor deve ser maior que zero';
    }

    if (formData.commission_rate < 0 || formData.commission_rate > 100) {
      newErrors.commission_rate = 'Comissão deve ser entre 0 e 100%';
    }

    if (!formData.closed_at) {
      newErrors.closed_at = 'Data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSave({
      user_id: '', // Will be set by hook
      partner_id: formData.partner_id,
      client_name: formData.client_name.trim(),
      contract_value: formData.contract_value,
      commission_rate: formData.commission_rate,
      closed_at: formData.closed_at,
      status: formData.status,
    });
  };

  // Calculate preview
  const totalCommission = (formData.contract_value * formData.commission_rate) / 100;
  const myShare = totalCommission / 2;
  const partnerShare = totalCommission / 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#1A2233] border border-[#2e374a] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-[#2e374a] bg-[#1A2233]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {client ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#92a4c9] hover:text-white hover:bg-[#2e374a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Partner Select */}
          <div>
            <label className="block text-sm font-medium text-[#92a4c9] mb-2">
              Parceiro *
            </label>
            <select
              value={formData.partner_id}
              onChange={(e) => handlePartnerChange(e.target.value)}
              className={`
                w-full px-4 py-3 rounded-xl
                bg-[#101622] border text-white
                focus:border-[#135bec] outline-none transition-colors
                ${errors.partner_id ? 'border-rose-500' : 'border-[#2e374a]'}
              `}
            >
              <option value="">Selecione um parceiro</option>
              {partners.map(partner => (
                <option key={partner.id} value={partner.id}>
                  {partner.name} ({partner.default_commission_rate}%)
                </option>
              ))}
            </select>
            {errors.partner_id && (
              <p className="mt-1 text-xs text-rose-400">{errors.partner_id}</p>
            )}
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-[#92a4c9] mb-2">
              Nome do Cliente *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e85a3]" />
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl
                  bg-[#101622] border text-white
                  placeholder:text-[#6e85a3]
                  focus:border-[#135bec] outline-none transition-colors
                  ${errors.client_name ? 'border-rose-500' : 'border-[#2e374a]'}
                `}
                placeholder="Nome do cliente"
              />
            </div>
            {errors.client_name && (
              <p className="mt-1 text-xs text-rose-400">{errors.client_name}</p>
            )}
          </div>

          {/* Contract Value */}
          <div>
            <label className="block text-sm font-medium text-[#92a4c9] mb-2">
              Valor do Contrato *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e85a3]" />
              <input
                type="number"
                value={formData.contract_value}
                onChange={(e) => setFormData({ ...formData, contract_value: parseFloat(e.target.value) || 0 })}
                min={0}
                step={100}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl
                  bg-[#101622] border text-white
                  focus:border-[#135bec] outline-none transition-colors
                  ${errors.contract_value ? 'border-rose-500' : 'border-[#2e374a]'}
                `}
                placeholder="0.00"
              />
            </div>
            {errors.contract_value && (
              <p className="mt-1 text-xs text-rose-400">{errors.contract_value}</p>
            )}
          </div>

          {/* Commission Rate */}
          <div>
            <label className="block text-sm font-medium text-[#92a4c9] mb-2">
              Taxa de Comissão (%)
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e85a3]" />
              <input
                type="number"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                min={0}
                max={100}
                step={0.5}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl
                  bg-[#101622] border text-white
                  focus:border-[#135bec] outline-none transition-colors
                  ${errors.commission_rate ? 'border-rose-500' : 'border-[#2e374a]'}
                `}
              />
            </div>
            {errors.commission_rate && (
              <p className="mt-1 text-xs text-rose-400">{errors.commission_rate}</p>
            )}
          </div>

          {/* Close Date */}
          <div>
            <label className="block text-sm font-medium text-[#92a4c9] mb-2">
              Data de Fechamento *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e85a3]" />
              <input
                type="date"
                value={formData.closed_at}
                onChange={(e) => setFormData({ ...formData, closed_at: e.target.value })}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl
                  bg-[#101622] border text-white
                  focus:border-[#135bec] outline-none transition-colors
                  ${errors.closed_at ? 'border-rose-500' : 'border-[#2e374a]'}
                `}
              />
            </div>
            {errors.closed_at && (
              <p className="mt-1 text-xs text-rose-400">{errors.closed_at}</p>
            )}
          </div>

          {/* Commission Preview */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-[#101622] border border-emerald-500/20">
            <p className="text-xs text-[#92a4c9] uppercase tracking-wider mb-3">Resumo da Comissão</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-[#92a4c9] mb-1">Total</p>
                <p className="text-lg font-bold text-white">{formatCurrency(totalCommission)}</p>
              </div>
              <div>
                <p className="text-xs text-[#92a4c9] mb-1">Sua Parte</p>
                <p className="text-lg font-bold text-emerald-400">{formatCurrency(myShare)}</p>
              </div>
              <div>
                <p className="text-xs text-[#92a4c9] mb-1">Parte Parceiro</p>
                <p className="text-lg font-bold text-[#92a4c9]">{formatCurrency(partnerShare)}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          {client && (
            <div>
              <label className="block text-sm font-medium text-[#92a4c9] mb-2">
                Status
              </label>
              <div className="flex gap-3">
                {(['pending', 'paid'] as const).map(status => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, status })}
                    className={`
                      flex-1 px-4 py-2 rounded-xl border font-medium transition-colors
                      ${formData.status === status
                        ? status === 'paid'
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                          : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'border-[#2e374a] text-[#92a4c9] hover:border-[#135bec]'}
                    `}
                  >
                    {status === 'pending' ? 'Pendente' : 'Pago'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-[#2e374a] text-[#92a4c9] hover:text-white hover:border-[#135bec] transition-colors font-medium"
            >
              Cancelar
            </button>
            <ActionButton
              label={client ? 'Salvar Alterações' : 'Adicionar Cliente'}
              icon={<Save className="w-4 h-4" />}
              type="submit"
              className="flex-1"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
