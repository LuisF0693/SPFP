import React from 'react';
import { Users, Mail, Phone, Percent, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Partner } from '../../types/investments';
import { formatCurrency } from '../../utils';

interface PartnerCardProps {
  partner: Partner;
  clientCount?: number;
  totalRevenue?: number;
  pendingRevenue?: number;
  onEdit?: (partner: Partner) => void;
  onDelete?: (id: string) => void;
  onClick?: (partner: Partner) => void;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({
  partner,
  clientCount = 0,
  totalRevenue = 0,
  pendingRevenue = 0,
  onEdit,
  onDelete,
  onClick,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div
      className="
        relative rounded-2xl bg-white dark:bg-[#1A2233]
        border border-[#e6e8eb] dark:border-[#2e374a]
        p-5 hover:border-[#135bec]/50 transition-all
        cursor-pointer group
      "
      onClick={() => onClick?.(partner)}
    >
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-2 rounded-lg text-[#92a4c9] hover:text-white hover:bg-[#2e374a] transition-colors"
          aria-label="Menu de opções"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 top-10 z-10 w-36 rounded-xl bg-[#1A2233] border border-[#2e374a] shadow-xl py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(partner);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#92a4c9] hover:text-white hover:bg-[#2e374a] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(partner.id);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Excluir
            </button>
          </div>
        )}
      </div>

      {/* Partner Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#135bec]/20 to-[#135bec]/10 flex items-center justify-center text-[#135bec]">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">{partner.name}</h3>
          <div className="flex items-center gap-3 text-sm text-[#92a4c9]">
            {partner.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {partner.email}
              </span>
            )}
            {partner.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {partner.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-[#101622]/50">
          <p className="text-[10px] text-[#92a4c9] uppercase tracking-wider mb-1">Clientes</p>
          <p className="text-white font-bold">{clientCount}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#101622]/50">
          <p className="text-[10px] text-[#92a4c9] uppercase tracking-wider mb-1">Receita Total</p>
          <p className="text-emerald-400 font-bold text-sm">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="p-3 rounded-xl bg-[#101622]/50">
          <p className="text-[10px] text-[#92a4c9] uppercase tracking-wider mb-1">Pendente</p>
          <p className="text-amber-400 font-bold text-sm">{formatCurrency(pendingRevenue)}</p>
        </div>
      </div>

      {/* Commission Rate */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2e374a]">
        <span className="text-xs text-[#92a4c9] flex items-center gap-1">
          <Percent className="w-3.5 h-3.5" />
          Comissão padrão
        </span>
        <span className="text-white font-medium">
          {partner.default_commission_rate}% (50/50)
        </span>
      </div>
    </div>
  );
};

export default PartnerCard;
