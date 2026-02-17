import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, ArrowRight, MoreVertical, Eye, Clock } from 'lucide-react';
import { HealthScoreGauge } from './HealthScoreGauge';

interface ClientCardProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  healthScore: number;
  status: 'ativo' | 'inativo' | 'pendente';
  lastActive?: Date;
  isNew?: boolean;
  onViewDetails?: () => void;
  onShowTimeline?: () => void;
  onGenerateBriefing?: () => void;
  onExpand?: () => void;
  isLoading?: boolean;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  id,
  name,
  email,
  phone,
  avatar,
  healthScore,
  status,
  lastActive,
  isNew = false,
  onViewDetails,
  onShowTimeline,
  onGenerateBriefing,
  onExpand,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    ativo: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Ativo' },
    inativo: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Inativo' },
    pendente: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Pendente' },
  };

  const statusStyle = statusConfig[status];

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand?.();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <div
        className={`glass rounded-3xl overflow-hidden border border-white/5 transition-all duration-300 flex flex-col h-full group hover:border-white/10 hover:shadow-xl hover:shadow-black/20`}
      >
        {/* Header Section */}
        <div className="p-6 pb-4 relative border-b border-white/5">
          {/* New badge */}
          {isNew && (
            <div className="absolute -top-2 -right-2 h-5 w-5 bg-accent rounded-full border-[3px] border-[#0F172A] animate-pulse shadow-lg" />
          )}

          {/* Avatar + Name + Email */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div
                className={`h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-700 to-black border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300 animate-none`}
              >
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-gray-500" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors truncate">
                  {name || 'Sem Nome'}
                </h3>
                <p className="text-xs text-gray-400 truncate mt-1">{email}</p>
                {phone && <p className="text-xs text-gray-500 truncate">{phone}</p>}
              </div>
            </div>

            {/* More menu */}
            <button
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white flex-shrink-0"
              onClick={handleExpand}
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center px-3 py-1 rounded-lg ${statusStyle.bg} ${statusStyle.color} text-[10px] font-bold uppercase tracking-widest`}>
            <div className="h-1.5 w-1.5 rounded-full mr-1.5 bg-current" />
            {statusStyle.label}
          </div>
        </div>

        {/* Health Score + Actions */}
        <div className="p-6 pt-4 flex-1 flex flex-col">
          {/* Health Score */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <HealthScoreGauge score={healthScore} size="md" showLabel={true} animated={true} />
            </div>

            {/* Actions - Right side */}
            <div className="flex flex-col gap-2 ml-6">
              <button
                onClick={onShowTimeline}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                title="Timeline"
              >
                <Clock size={16} />
              </button>
              <button
                onClick={onGenerateBriefing}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                title="Briefing IA"
              >
                <Eye size={16} />
              </button>
            </div>
          </div>

          {/* Last Active */}
          {lastActive && (
            <div className="text-xs text-gray-500 mb-4 text-center">
              Ativo {new Date(lastActive).toLocaleDateString('pt-BR')}
            </div>
          )}

          {/* Expanded Content */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/5 pt-4 mt-4 space-y-3"
            >
              <button
                onClick={onViewDetails}
                className="w-full px-4 py-2 bg-accent/10 border border-accent/20 rounded-lg text-accent text-sm font-semibold hover:bg-accent/20 transition-colors"
              >
                Ver Detalhes
              </button>
            </motion.div>
          )}
        </div>

        {/* Footer - CTA */}
        {!isExpanded && (
          <div className="px-6 pb-6 pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              ID: {id.slice(0, 8)}
            </span>
            <motion.div
              animate={{ x: 0 }}
              whileHover={{ x: 4 }}
              className="text-accent"
            >
              <ArrowRight size={16} />
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClientCard;
