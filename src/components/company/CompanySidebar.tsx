import React from 'react';
import { Users, ChevronLeft, ChevronRight, Megaphone, ShoppingCart, Package, Settings, HeartHandshake, LayoutDashboard } from 'lucide-react';

export interface Squad {
  id: string;
  name: string;
  icon: React.FC<{ size?: number; className?: string }>;
  color: string;
  boardCount?: number;
}

const PLACEHOLDER_SQUADS: Squad[] = [
  { id: 'marketing', name: 'Marketing', icon: Megaphone, color: 'text-pink-400', boardCount: 3 },
  { id: 'vendas', name: 'Vendas', icon: ShoppingCart, color: 'text-emerald-400', boardCount: 4 },
  { id: 'produtos', name: 'Produtos', icon: Package, color: 'text-blue-400', boardCount: 2 },
  { id: 'ops', name: 'OPS', icon: Settings, color: 'text-amber-400', boardCount: 5 },
  { id: 'cs', name: 'Customer Success', icon: HeartHandshake, color: 'text-purple-400', boardCount: 3 },
  { id: 'admin', name: 'Admin', icon: Users, color: 'text-gray-400', boardCount: 2 },
];

interface CompanySidebarProps {
  activeSquadId: string | null;
  onSelectSquad: (squadId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const CompanySidebar: React.FC<CompanySidebarProps> = ({
  activeSquadId,
  onSelectSquad,
  collapsed,
  onToggleCollapse,
}) => {
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
        {PLACEHOLDER_SQUADS.map((squad) => {
          const Icon = squad.icon;
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
              <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-accent' : squad.color}`} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{squad.name}</span>
                  {squad.boardCount !== undefined && (
                    <span className="text-[10px] text-gray-500">{squad.boardCount} boards</span>
                  )}
                </div>
              )}
              {!collapsed && isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              )}
            </button>
          );
        })}
      </nav>

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

export { PLACEHOLDER_SQUADS };
