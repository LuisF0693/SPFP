
import React, { useEffect, useState } from 'react';
import { Home, CreditCard, PlusCircle, History, PieChart, Lightbulb, LogOut, Settings, Check, RefreshCw, Target, TrendingUp, Wallet, ShieldCheck, X, Users, ArrowLeftRight, Calculator, ChevronDown, Umbrella, Building } from 'lucide-react';
import { useSafeFinance } from '../hooks/useSafeFinance';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Logo } from './Logo';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { PWAStatusBar } from './PWAStatusBar';
import { offlineSyncService } from '../services/offlineSyncService';

interface LayoutProps {
  children: React.ReactNode;
  mode?: 'personal' | 'crm';
}

interface NavItem {
  id: string;
  path?: string;
  icon: any;
  label: string;
  emoji?: string;
  children?: NavItem[];
  isExpandable?: boolean;
}

/**
 * Main Layout component.
 * Provides the sidebar, header, and main content area structure for the application.
 * Supports different modes such as 'personal' and 'crm'.
 */
export const Layout: React.FC<LayoutProps> = ({ children, mode = 'personal' }) => {
  const { userProfile, isSyncing, isImpersonating, stopImpersonating } = useSafeFinance();
  const { logout, isAdmin } = useAuth();
  const { isDark } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  // Collapsible section state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    budget: true, // Default expanded
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const mobileNavItems: { id: string; path: string; icon: any; label: string; isFab?: boolean }[] = [
    { id: 'dashboard', path: '/dashboard', icon: Home, label: 'Início' },
    { id: 'transactions', path: '/transactions', icon: History, label: 'Extrato' },
    { id: 'investments', path: '/investments', icon: TrendingUp, label: 'Investir', isFab: false },
    { id: 'patrimony', path: '/patrimony', icon: Wallet, label: 'Patrimônio' },
    { id: 'goals', path: '/goals', icon: Target, label: 'Objetivos' },
    { id: 'budget', path: '/budget', icon: Calculator, label: 'Metas' },
    { id: 'reports', path: '/reports', icon: PieChart, label: 'Relatórios' },
    { id: 'settings', path: '/settings', icon: Settings, label: 'Perfil' },
  ];

  // NEW: Hierarchical navigation structure
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
    { id: 'goals', path: '/goals', icon: Target, label: 'Objetivos', emoji: '🎯' },
    { id: 'retirement', path: '/retirement', icon: Umbrella, label: 'Aposentadoria', emoji: '🏖️' },
    { id: 'patrimony', path: '/patrimony', icon: Wallet, label: 'Patrimônio', emoji: '💰' },
    { id: 'acquisition', path: '/acquisition', icon: Building, label: 'Aquisição', emoji: '🏠' },
    { id: 'reports', path: '/reports', icon: PieChart, label: 'Relatórios', emoji: '📈' },
    { id: 'insights', path: '/insights', icon: Lightbulb, label: 'Insights Financeiros', emoji: '💡' },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin', path: '/admin', icon: ShieldCheck, label: 'Painel Admin' },
  ];

  const crmNavItems: NavItem[] = [
    { id: 'dashboard', path: '/admin', icon: Users, label: 'Gerenciar Clientes' },
    { id: 'partnerships', path: '/partnerships', icon: ArrowLeftRight, label: 'Parcerias' },
  ];

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja sair da sua conta?')) {
      await logout();
    }
  };

  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === '/' || currentPath === '/dashboard') return 'Visão Geral';
    if (currentPath === '/settings') return 'Configurações';
    if (currentPath === '/admin') return 'Painel Administrativo';
    if (currentPath === '/installments') return 'Parcelamentos';
    if (currentPath === '/retirement') return 'Aposentadoria';
    if (currentPath === '/acquisition') return 'Aquisição';

    // Search in all items including children
    const findTitle = (items: NavItem[]): string | null => {
      for (const item of items) {
        if (item.path === currentPath) return item.label;
        if (item.children) {
          const childTitle = findTitle(item.children);
          if (childTitle) return childTitle;
        }
      }
      return null;
    };

    const allItems = [...desktopNavItems, ...adminNavItems, ...crmNavItems];
    return findTitle(allItems) || 'Visão Geral';
  };

  // Check if current path is within a section
  const isPathInSection = (item: NavItem): boolean => {
    if (item.path && location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some(child => child.path === location.pathname);
    }
    return false;
  };

  // Register Service Worker for PWA support
  useEffect(() => {
    offlineSyncService.registerServiceWorker().catch(err => console.warn('SW registration failed:', err));
  }, []);

  // Render a single nav item
  const renderNavItem = (item: NavItem, isChild = false) => {
    const Icon = item.icon;
    const isActive = item.path === location.pathname;
    const paddingLeft = isChild ? 'pl-10' : 'px-4';

    return (
      <NavLink
        key={item.id}
        to={item.path!}
        className={({ isActive }) => `flex items-center w-full ${paddingLeft} py-3.5 rounded-xl transition-all duration-300 group ${isActive
          ? 'bg-blue-900/30 text-white border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
          }`}
      >
        {({ isActive }) => (
          <>
            {item.emoji ? (
              <span className="mr-3 text-lg">{item.emoji}</span>
            ) : (
              <Icon size={20} className={`mr-3 transition-colors duration-300 ${isActive ? 'text-accent drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'text-gray-500 group-hover:text-white'}`} />
            )}
            <span className={`font-medium text-sm tracking-wide ${isActive ? 'text-white' : ''}`}>{item.label}</span>
          </>
        )}
      </NavLink>
    );
  };

  // Render expandable section
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
          className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all duration-300 group ${
            hasActiveChild
              ? 'bg-blue-900/20 text-white border border-blue-500/20'
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center">
            {item.emoji ? (
              <span className="mr-3 text-lg">{item.emoji}</span>
            ) : (
              <Icon size={20} className={`mr-3 ${hasActiveChild ? 'text-accent' : 'text-gray-500 group-hover:text-white'}`} />
            )}
            <span className="font-medium text-sm tracking-wide">{item.label}</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Collapsible children */}
        <div
          id={`nav-section-${item.id}`}
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, true))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-bg-dark overflow-hidden w-full font-sans text-text-primary transition-colors duration-300">
      {/* Skip to Main Content Link */}
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex w-72 bg-card-dark flex-col shadow-xl z-20 border-r border-white/5 transition-colors duration-300"
        role="complementary"
        aria-label="Navegação Lateral"
      >
        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center space-x-4">
          <div className="p-2 shrink-0">
            <Logo size={42} />
          </div>
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
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Ativo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav
          className="flex-1 py-6 px-4 space-y-2 overflow-y-auto no-scrollbar"
          aria-label="Main navigation"
          role="navigation"
        >
          {mode === 'crm' ? (
            // CRM Navigation
            <>
              {crmNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path!}
                    end
                    className={({ isActive }) => `flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                      ? 'bg-blue-900/30 text-white border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
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

              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-900">
                <p className="px-4 mb-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Acesso Pessoal</p>
                <div
                  onClick={() => stopImpersonating('/dashboard')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      stopImpersonating('/dashboard');
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-200 group text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer`}
                >
                  <ArrowLeftRight size={22} className="mr-3 text-gray-500 group-hover:text-white" />
                  <span className="font-medium text-base">Meus Dados</span>
                </div>
              </div>
            </>
          ) : (
            // Personal Navigation - NEW HIERARCHICAL STRUCTURE
            <>
              {desktopNavItems.map((item) => {
                if (item.isExpandable && item.children) {
                  return renderExpandableSection(item);
                }
                return renderNavItem(item);
              })}

              {isAdmin && (
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-900">
                  <p className="px-4 mb-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Administração</p>
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.id}
                        to={item.path!}
                        className={({ isActive }) => `flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                          ? 'bg-blue-900/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
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

        <div className="p-4 border-t border-gray-200 dark:border-gray-900 bg-white dark:bg-black">
          <NavLink
            to="/settings"
            className={({ isActive }) => `flex items-center w-full px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-900/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={20} className="mr-3" />
            <span className="font-medium">Configurações</span>
          </NavLink>
          <div className="mt-4 flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 group transition-colors">
            <div
              className="flex items-center min-w-0 mr-2 cursor-pointer"
              onClick={() => navigate('/settings')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/settings');
                }
              }}
              role="button"
              tabIndex={0}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center text-white font-bold text-sm mr-3 overflow-hidden shadow-lg border border-blue-500/30">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userProfile.name ? userProfile.name.substring(0, 2).toUpperCase() : 'US'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-white truncate group-hover:text-accent transition-colors">{userProfile.name || 'Usuário'}</p>
                <p className="text-[10px] text-gray-400 truncate font-medium">{userProfile.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-gray-50 dark:bg-black transition-colors duration-300">
        <header className="flex bg-white dark:bg-black h-16 md:h-20 border-b border-gray-200 dark:border-gray-900 items-center justify-between px-6 md:px-8 shadow-sm transition-colors duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-wide">
            {getPageTitle()}
          </h2>
          <div className="flex items-center space-x-4">
            {/* Status de Sincronização Mobile */}
            <div className="md:hidden flex items-center justify-center">
              {isSyncing ? (
                <div className="w-9 h-9 rounded-full bg-blue-900/20 flex items-center justify-center border border-blue-500/30">
                  <RefreshCw size={18} className="text-blue-500 animate-spin" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-900/20 flex items-center justify-center border border-emerald-500/30">
                  <Check size={18} className="text-emerald-500" />
                </div>
              )}
            </div>

            {isImpersonating && (
              <button
                onClick={() => stopImpersonating()}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                <X size={16} />
                <span className="hidden sm:inline">Sair da Visualização</span>
                <span className="sm:hidden">Sair</span>
              </button>
            )}
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-8 md:p-8 bg-gray-50 dark:bg-black transition-colors duration-300">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden absolute bottom-0 w-full bg-[#0a0a0a] border-t border-gray-900 shadow-[0_-5px_10px_rgba(0,0,0,0.5)] z-50 pb-safe" aria-label="Mobile navigation">
          <div className="flex justify-around items-center h-16 px-2">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              if (item.isFab) {
                return (
                  <button key={item.id} onClick={() => navigate(item.path)} className="relative -top-6 bg-accent text-white p-4 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] transform active:scale-95 border-4 border-black">
                    <Icon size={28} strokeWidth={2.5} />
                  </button>
                );
              }
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-accent' : 'text-gray-500'}`}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : ''} />
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>

      {/* PWA Status Bar - Offline & Install Prompt */}
      <PWAStatusBar show={true} />
    </div>
  );
};

