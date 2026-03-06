import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, CreditCard, History, PieChart, Lightbulb, LogOut, Settings,
  Check, RefreshCw, Target, TrendingUp, Wallet, ShieldCheck,
  Users, ArrowLeftRight, Calculator, ChevronDown, Umbrella,
  Building, Building2, Palette
} from 'lucide-react';
import { Logo } from '../Logo';

interface NavItem {
  id: string;
  path?: string;
  icon: any;
  label: string;
  emoji?: string;
  children?: NavItem[];
  isExpandable?: boolean;
}

interface DesktopSidebarProps {
  mode: 'personal' | 'crm';
  isSyncing: boolean;
  isImpersonating: boolean;
  isAdmin: boolean;
  userProfile: { name: string; email: string; avatar?: string };
  onLogout: (e: React.MouseEvent) => void;
  onStopImpersonating: (path?: string) => void;
}

/**
 * Desktop sidebar navigation component.
 * Extracted from Layout.tsx (TD-S3-004).
 */
export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  mode,
  isSyncing,
  isImpersonating,
  isAdmin,
  userProfile,
  onLogout,
  onStopImpersonating,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ budget: true });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const desktopNavItems: NavItem[] = [
    { id: 'dashboard', path: '/dashboard', icon: Home, label: 'Dashboard', emoji: '📊' },
    {
      id: 'budget',
      icon: Calculator,
      label: 'Orçamento',
      emoji: '📋',
      isExpandable: true,
      children: [
        { id: 'accounts', path: '/accounts', icon: CreditCard, label: 'Minhas Contas', emoji: '💳' },
        { id: 'transactions', path: '/transactions', icon: History, label: 'Lançamentos', emoji: '📝' },
        { id: 'budget-goals', path: '/budget', icon: Target, label: 'Metas', emoji: '🎯' },
        { id: 'installments', path: '/installments', icon: Calculator, label: 'Parcelamentos', emoji: '📅' },
      ]
    },
    { id: 'portfolio', path: '/portfolio', icon: TrendingUp, label: 'Portfólio', emoji: '📈' },
    { id: 'goals', path: '/goals-v2', icon: Target, label: 'Objetivos', emoji: '🏆' },
    { id: 'retirement', path: '/retirement-v2', icon: Umbrella, label: 'Aposentadoria', emoji: '🏖️' },
    { id: 'patrimony', path: '/patrimony', icon: Wallet, label: 'Patrimônio', emoji: '💰' },
    { id: 'acquisition', path: '/acquisition', icon: Building, label: 'Aquisição', emoji: '🏠' },
    { id: 'reports', path: '/reports', icon: PieChart, label: 'Relatórios', emoji: '📋' },
    { id: 'insights', path: '/insights', icon: Lightbulb, label: 'Finn · Insights', emoji: '🤖' },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin', path: '/admin', icon: ShieldCheck, label: 'Painel Admin' },
  ];

  const crmNavItems: NavItem[] = [
    { id: 'dashboard', path: '/admin', icon: Users, label: 'Gerenciar Clientes' },
    { id: 'corporate', path: '/corporate', icon: Building2, label: 'Corporate HQ', emoji: '🏢' },
    { id: 'partnerships', path: '/partnerships', icon: ArrowLeftRight, label: 'Parcerias' },
    { id: 'branding', path: '/branding', icon: Palette, label: 'Branding', emoji: '🎨' },
  ];

  const activeNavClass = 'bg-blue-900/30 text-white border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]';
  const inactiveNavClass = 'text-gray-300 hover:bg-white/5 hover:text-white';

  const renderNavItem = (item: NavItem, isChild = false) => {
    const Icon = item.icon;
    const paddingLeft = isChild ? 'pl-10' : 'px-4';
    return (
      <NavLink
        key={item.id}
        to={item.path!}
        className={({ isActive }) => `flex items-center w-full ${paddingLeft} py-3.5 rounded-xl transition-all duration-300 group ${isActive ? activeNavClass : inactiveNavClass}`}
      >
        {({ isActive }) => (
          <>
            {item.emoji
              ? <span className="mr-3 text-lg">{item.emoji}</span>
              : <Icon size={20} className={`mr-3 transition-colors duration-300 ${isActive ? 'text-accent drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'text-gray-500 group-hover:text-white'}`} />
            }
            <span className={`font-medium text-sm tracking-wide ${isActive ? 'text-white' : ''}`}>{item.label}</span>
          </>
        )}
      </NavLink>
    );
  };

  const renderExpandableSection = (item: NavItem) => {
    const isExpanded = expandedSections[item.id] ?? false;
    const hasActiveChild = item.children?.some(child => child.path === location.pathname);
    const Icon = item.icon;
    return (
      <div key={item.id} className="space-y-1">
        <button
          onClick={() => toggleSection(item.id)}
          aria-expanded={isExpanded}
          aria-controls={`nav-section-${item.id}`}
          className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all duration-300 group ${hasActiveChild ? 'bg-blue-900/20 text-white border border-blue-500/20' : inactiveNavClass}`}
        >
          <div className="flex items-center">
            {item.emoji
              ? <span className="mr-3 text-lg">{item.emoji}</span>
              : <Icon size={20} className={`mr-3 ${hasActiveChild ? 'text-accent' : 'text-gray-500 group-hover:text-white'}`} />
            }
            <span className="font-medium text-sm tracking-wide">{item.label}</span>
          </div>
          <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        <div id={`nav-section-${item.id}`} className={`overflow-hidden transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="py-1 space-y-1">{item.children?.map(child => renderNavItem(child, true))}</div>
        </div>
      </div>
    );
  };

  return (
    <aside
      className="hidden md:flex w-72 bg-card-dark flex-col shadow-xl z-20 border-r border-white/5 transition-colors duration-300"
      role="complementary"
      aria-label="Navegação Lateral"
      data-testid="desktop-sidebar"
    >
      {/* Logo + Sync status */}
      <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center space-x-4">
        <div className="p-2 shrink-0"><Logo size={42} /></div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-serif font-bold tracking-wider text-gray-900 dark:text-white dark:text-glow">SPFP</h1>
          <p className="text-[10px] text-blue-500 dark:text-blue-400 tracking-[0.3em] uppercase font-bold">Premium</p>
          <div className="mt-2 h-6 flex items-center">
            {isSyncing ? (
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 animate-pulse">
                <RefreshCw size={10} className="mr-1.5 text-blue-400 animate-spin" />
                <span className="text-[9px] font-bold text-blue-300 uppercase tracking-widest">Sync...</span>
              </div>
            ) : (
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
                <span className="relative flex h-1.5 w-1.5 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Ativo</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto no-scrollbar" aria-label="Main navigation" role="navigation">
        {mode === 'crm' ? (
          <>
            {crmNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.id} to={item.path!} end
                  className={({ isActive }) => `flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive ? activeNavClass : inactiveNavClass}`}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={20} className={`mr-3 transition-colors duration-300 ${isActive ? 'text-accent drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'text-gray-500 group-hover:text-white'}`} />
                      <span className={`font-medium text-sm tracking-wide ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {isImpersonating && (
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-900">
                <p className="px-4 mb-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Acesso Pessoal</p>
                <div
                  onClick={() => onStopImpersonating('/dashboard')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStopImpersonating('/dashboard'); } }}
                  role="button" tabIndex={0}
                  className="flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-200 group text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  <ArrowLeftRight size={22} className="mr-3 text-gray-500 group-hover:text-white" />
                  <span className="font-medium text-base">Meus Dados</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {desktopNavItems.map((item) => {
              if (item.isExpandable && item.children) return renderExpandableSection(item);
              return renderNavItem(item);
            })}

            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-900">
                <p className="px-4 mb-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Administração</p>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.id} to={item.path!}
                      className={({ isActive }) => `flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-blue-900/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : inactiveNavClass}`}
                    >
                      {({ isActive }) => (
                        <>
                          <Icon size={22} className={`mr-3 ${isActive ? 'text-accent drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]' : 'text-gray-500 group-hover:text-white'}`} />
                          <span className="font-medium text-base">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            )}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-900 bg-white dark:bg-black">
        <NavLink to="/settings"
          className={({ isActive }) => `flex items-center w-full px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-900/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          data-testid="sidebar-settings-link"
        >
          <Settings size={20} className="mr-3" />
          <span className="font-medium">Configurações</span>
        </NavLink>
        <div className="mt-4 flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 group transition-colors">
          <div
            className="flex items-center min-w-0 mr-2 cursor-pointer"
            onClick={() => navigate('/settings')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/settings'); } }}
            role="button" tabIndex={0}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white font-bold text-sm mr-3 overflow-hidden shadow-lg border border-blue-500/30">
              {userProfile.avatar
                ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                : (userProfile.name ? userProfile.name.substring(0, 2).toUpperCase() : 'US')
              }
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 dark:text-white truncate group-hover:text-accent transition-colors">{userProfile.name || 'Usuário'}</p>
              <p className="text-[10px] text-gray-400 truncate font-medium">{userProfile.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all" data-testid="sidebar-logout-btn">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};
