import React from 'react';
import { Bot, User, ExternalLink } from 'lucide-react';
import { SPFP_AGENTS, SPFPAgent } from '../../data/companyAgents';
import { useAuth } from '../../context/AuthContext';

const AgentCard: React.FC<{ agent: SPFPAgent }> = ({ agent }) => (
  <div className="glass rounded-2xl border border-white/5 p-5 hover:border-white/15 transition-all group">
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
        {agent.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-white font-semibold text-sm">{agent.name}</h3>
          <span className="flex items-center gap-1 text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20 font-medium">
            <Bot size={9} />
            AI Agent
          </span>
        </div>
        <p className="text-gray-400 text-xs mb-1">{agent.squad} Squad</p>
        {agent.description && (
          <p className="text-gray-500 text-xs leading-relaxed">{agent.description}</p>
        )}
      </div>
    </div>
  </div>
);

export const MembersView: React.FC = () => {
  const { user } = useAuth();

  const humanName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Você';
  const humanEmail = user?.email || '';

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Membros do CRM</h2>
        <p className="text-gray-400 text-sm">Agentes IA e membros humanos disponíveis para assignar em tasks</p>
      </div>

      {/* Human members section */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Membros Humanos</h3>
        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
            <User size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-white font-semibold text-sm">{humanName}</h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                Você
              </span>
            </div>
            {humanEmail && <p className="text-gray-500 text-xs">{humanEmail}</p>}
          </div>
        </div>
      </div>

      {/* AI Agents section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Agentes IA SPFP</h3>
          <span className="text-xs text-gray-600 bg-white/5 px-2 py-1 rounded-full">
            {SPFP_AGENTS.length} agentes
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SPFP_AGENTS.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/15 flex items-start gap-3">
        <ExternalLink size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-400 text-sm font-medium mb-0.5">Integração com EPIC-010</p>
          <p className="text-gray-400 text-xs">
            No EPIC-010, os agentes poderão escrever diretamente nas tasks via Supabase MCP — sem n8n,
            diretamente do sistema de agentes AIOS.
          </p>
        </div>
      </div>
    </div>
  );
};
