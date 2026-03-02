import React from 'react';
import { ChevronLeft, ChevronRight, Plus, LayoutDashboard, Loader2 } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { CompanySquad } from '../../types/company';

interface CompanySidebarProps {
  activeSquadId: string | null;
  onSelectSquad: (squadId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNewSquad: () => void;
}

export const CompanySidebar: React.FC<CompanySidebarProps> = ({
  activeSquadId,
  onSelectSquad,
  collapsed,
  onToggleCollapse,
  onNewSquad,
}) => {
  const { squads, isLoading } = useCompany();

  return (
    <aside
      className={`relative flex flex-col h-full bg-[#0d0d1a] border-r border-white/5 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo / title */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="p-2 rounded-xl bg-accent/10 text-accent flex-shrink-0">
          <LayoutDashboard size={18} />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-white truncate">CRM Empresa</span>
        )}
      </div>

      {/* Squad list */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-gray-500" />
          </div>
        ) : squads.length === 0 ? (
          !collapsed && (
            <p className="text-xs text-gray-500 text-center px-3 py-4">
              Nenhum squad ainda
            </p>
          )
        ) : (
          squads.map((squad: CompanySquad) => {
            const isActive = activeSquadId === squad.id;
            return (
              <button
                key={squad.id}
                onClick={() => onSelectSquad(squad.id)}
                title={collapsed ? squad.name : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                  isActive
                    ? 'bg-accent/15 border border-accent/20 text-white'
                    : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                {/* Emoji icon */}
                <span
                  className="flex-shrink-0 text-base leading-none w-7 h-7 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${squad.color}20` }}
                >
                  {squad.icon}
                </span>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{squad.name}</span>
                    {squad.description && (
                      <span className="text-[10px] text-gray-500 truncate block">{squad.description}</span>
                    )}
                  </div>
                )}
                {!collapsed && isActive && (
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: squad.color }} />
                )}
              </button>
            );
          })
        )}
      </nav>

      {/* New squad button */}
      {!collapsed && (
        <div className="px-2 pb-2">
          <button
            onClick={onNewSquad}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            <Plus size={15} />
            Novo Squad
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="px-2 py-3 border-t border-white/5">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
          title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
