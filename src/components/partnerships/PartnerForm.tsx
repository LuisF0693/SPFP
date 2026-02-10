import React, { useState, useEffect } from 'react';
import { X, Users, Mail, Phone, Percent, Save } from 'lucide-react';
import { Partner } from '../../types/investments';
import { ActionButton } from '../ui/ActionButton';

interface PartnerFormProps {
  partner?: Partner | null;
  onSave: (data: Omit<Partner, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}

export const PartnerForm: React.FC<PartnerFormProps> = ({
  partner,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    default_commission_rate: 50,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        email: partner.email || '',
        phone: partner.phone || '',
        default_commission_rate: partner.default_commission_rate,
      });
    }
  }, [partner]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (formData.default_commission_rate < 0 || formData.default_commission_rate > 100) {
      newErrors.default_commission_rate = 'Comissão deve ser entre 0 e 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSave({
      user_id: '', // Will be set by the hook
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      default_commission_rate: formData.default_commission_rate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#1A2233] border border-[#2e374a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2e374a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#135bec]/20 to-[#135bec]/10">
              <Users className="w-5 h-5 text-[#135bec]" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {partner ? 'Editar Parceiro' : 'Novo Parceiro'}
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
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#92a4c9] mb-2">
              Nome do Parceiro *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e85a3]" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl
                  bg-[#101622] border text-white
                  placeholder:text-[#6e85a3]
                  focus:border-[#135bec] outline-none transition-colors
                  ${errors.name ? 'border-rose-500' : 'border-[#2e374a]'}
                `}
                placeholder="Nome completo do parceiro"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-rose-400">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#92a4c9] mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e85a3]" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl
                  bg-[#101622] border text-white
                  placeholder:text-[#6e85a3]
                  focus:border-[#135bec] outline-none transition-colors
                  ${errors.email ? 'border-rose-500' : 'border-[#2e374a]'}
                `}
                placeholder="email@exemplo.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-400">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-[#92a4c9] mb-2">
              Telefone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e85a3]" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="
                  w-full pl-10 pr-4 py-3 rounded-xl
                  bg-[#101622] border border-[#2e374a] text-white
                  placeholder:text-[#6e85a3]
                  focus:border-[#135bec] outline-none transition-colors
                "
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Commission Rate */}
          <div>
            <label className="block text-sm font-medium text-[#92a4c9] mb-2">
              Taxa de Comissão Padrão
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e85a3]" />
              <input
                type="number"
                value={formData.default_commission_rate}
                onChange={(e) => setFormData({ ...formData, default_commission_rate: parseFloat(e.target.value) || 0 })}
                min={0}
                max={100}
                step={0.5}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-xl
                  bg-[#101622] border text-white
                  focus:border-[#135bec] outline-none transition-colors
                  ${errors.default_commission_rate ? 'border-rose-500' : 'border-[#2e374a]'}
                `}
              />
            </div>
            {errors.default_commission_rate && (
              <p className="mt-1 text-xs text-rose-400">{errors.default_commission_rate}</p>
            )}
            <p className="mt-2 text-xs text-[#6e85a3]">
              A comissão será dividida 50/50 entre você e o parceiro
            </p>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl bg-[#101622]/50 border border-[#2e374a]">
            <p className="text-xs text-[#92a4c9] uppercase tracking-wider mb-2">Exemplo de Divisão</p>
            <div className="flex justify-between text-sm">
              <span className="text-[#92a4c9]">Contrato de R$ 10.000:</span>
              <div className="text-right">
                <p className="text-white">
                  Comissão: <span className="font-bold text-emerald-400">
                    R$ {((10000 * formData.default_commission_rate) / 100).toFixed(2)}
                  </span>
                </p>
                <p className="text-[#92a4c9] text-xs">
                  Sua parte: R$ {((10000 * formData.default_commission_rate) / 100 / 2).toFixed(2)} |
                  Parceiro: R$ {((10000 * formData.default_commission_rate) / 100 / 2).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

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
              label={partner ? 'Salvar Alterações' : 'Criar Parceiro'}
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

export default PartnerForm;
