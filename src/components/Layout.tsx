import React from 'react';
import { Home, History, PieChart, Target, TrendingUp, Wallet, Settings, Calculator, X } from 'lucide-react';
import { useSafeFinance } from '../hooks/useSafeFinance';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { PWAStatusBar } from './PWAStatusBar';
import { DesktopSidebar } from './layout/DesktopSidebar';

interface LayoutProps {
  children: React.ReactNode;
  mode?: 'personal' | 'crm';
}

const mobileNavItems = [
  { id: 'dashboard', path: '/dashboard', icon: Home, label: 'Início' },
  { id: 'transactions', path: '/transactions', icon: History, label: 'Extrato' },
  { id: 'portfolio', path: '/portfolio', icon: TrendingUp, label: 'Portfólio' },
  { id: 'patrimony', path: '/patrimony', icon: Wallet, label: 'Patrimônio' },
  { id: 'goals', path: '/goals-v2', icon: Target, label: 'Objetivos' },
  { id: 'budget', path: '/budget', icon: Calculator, label: 'Metas' },
  { id: 'reports', path: '/reports', icon: PieChart, label: 'Relatórios' },
  { id: 'settings', path: '/settings', icon: Settings, label: 'Perfil' },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Visão Geral',
  '/dashboard': 'Visão Geral',
  '/settings': 'Configurações',
  '/admin': 'Painel Administrativo',
  '/installments': 'Parcelamentos',
  '/retirement': 'Aposentadoria',
  '/retirement-v2': 'Aposentadoria',
  '/acquisition': 'Aquisição',
  '/portfolio': 'Portfólio de Investimentos',
  '/goals-v2': 'Objetivos Financeiros',
  '/partnerships': 'Gestão de Parcerias',
  '/accounts': 'Minhas Contas',
  '/transactions': 'Lançamentos',
  '/budget': 'Orçamento',
  '/reports': 'Relatórios',
  '/insights': 'Finn · Insights',
  '/patrimony': 'Patrimônio',
};

/**
 * Main Layout component — orchestrates DesktopSidebar + MobileNav + main content area.
 * Refactored from ~466 LOC to ~100 LOC (TD-S3-004).
 */
export const Layout: React.FC<LayoutProps> = ({ children, mode = 'personal' }) => {
  const { userProfile, isSyncing, isImpersonating, stopImpersonating } = useSafeFinance();
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || 'Visão Geral';

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja sair da sua conta?')) {
      await logout();
    }
  };

  return (
    <div className="flex h-screen bg-bg-dark overflow-hidden w-full font-sans text-text-primary transition-colors duration-300">
      <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>

      <DesktopSidebar
        mode={mode}
        isSyncing={isSyncing}
        isImpersonating={isImpersonating}
        isAdmin={isAdmin}
        userProfile={{ name: userProfile.name, email: userProfile.email, avatar: userProfile.avatar }}
        onLogout={handleLogout}
        onStopImpersonating={stopImpersonating}
      />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-gray-50 dark:bg-black transition-colors duration-300">
        {/* Top header */}
        <header className="flex bg-white dark:bg-black h-16 md:h-20 border-b border-gray-200 dark:border-gray-900 items-center justify-between px-6 md:px-8 shadow-sm transition-colors duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-wide">{pageTitle}</h2>
          <div className="flex items-center space-x-4">
            {isImpersonating && (
              <button
                onClick={() => stopImpersonating()}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-red-500/20 transition-all active:scale-95"
                data-testid="stop-impersonation-btn"
              >
                <X size={16} />
                <span className="hidden sm:inline">Sair da Visualização</span>
                <span className="sm:hidden">Sair</span>
              </button>
            )}
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-8 md:p-8 bg-gray-50 dark:bg-black transition-colors duration-300">
          <div className="max-w-7xl mx-auto w-full h-full">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden absolute bottom-0 w-full bg-[#0a0a0a] border-t border-gray-900 shadow-[0_-5px_10px_rgba(0,0,0,0.5)] z-50 pb-safe" aria-label="Mobile navigation" data-testid="mobile-nav">
          <div className="flex justify-around items-center h-16 px-2">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
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

      <PWAStatusBar show={true} />
    </div>
  );
};
