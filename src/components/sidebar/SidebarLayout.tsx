/**
 * SidebarLayout Component (STY-052)
 * Main sidebar wrapper with 4 collapsible sections
 *
 * Features:
 * - Desktop: Always visible left sidebar (w-72)
 * - Mobile: Hamburger toggle → Drawer slides from left
 * - 4 expandable sections: Budget, Accounts, Transactions, Installments
 * - Glassmorphism design with animations
 * - Full accessibility (ARIA, keyboard navigation)
 *
 * Design: docs/design/FASE-1-MOCKUPS.md (Sidebar section)
 */

import React, { useCallback, memo } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { colorTokens, spacingTokens, transitionTokens, glassmorphismTokens } from '../../styles/tokens';
import { SidebarBudgetSection } from './SidebarBudgetSection';
import { SidebarAccountsSection } from './SidebarAccountsSection';
import { SidebarTransactionsSection } from './SidebarTransactionsSection';
import { SidebarInstallmentsSection } from './SidebarInstallmentsSection';
import { SidebarDrawer } from './SidebarDrawer';

interface SidebarLayoutProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

/**
 * Section Header Component (Reusable button for expand/collapse)
 */
interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
  onClick: () => void;
  ariaLabel: string;
  ariaControls: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = memo(({
  icon,
  label,
  isExpanded,
  onClick,
  ariaLabel,
  ariaControls
}) => (
  <button
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    aria-label={ariaLabel}
    aria-expanded={isExpanded}
    aria-controls={ariaControls}
    className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
    style={{
      outlineOffset: '2px',
      color: colorTokens.slate[50]
    }}
  >
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <span className="font-medium text-sm tracking-wide text-slate-50 dark:text-slate-50">{label}</span>
    </div>
    <ChevronDown
      size={18}
      className="transition-transform duration-300 text-slate-400"
      style={{
        transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
        color: isExpanded ? colorTokens.primary[500] : colorTokens.slate[400]
      }}
    />
  </button>
));

SectionHeader.displayName = 'SectionHeader';

/**
 * Desktop Sidebar (Always visible on desktop)
 */
const DesktopSidebar: React.FC = memo(() => {
  const { state, toggleSection } = useSidebar();

  const handleBudgetClick = useCallback(() => {
    toggleSection('BUDGET');
  }, [toggleSection]);

  const handleAccountsClick = useCallback(() => {
    toggleSection('ACCOUNTS');
  }, [toggleSection]);

  const handleTransactionsClick = useCallback(() => {
    toggleSection('TRANSACTIONS');
  }, [toggleSection]);

  const handleInstallmentsClick = useCallback(() => {
    toggleSection('INSTALLMENTS');
  }, [toggleSection]);

  return (
    <aside
      className="hidden md:flex md:w-72 flex-col h-screen border-r border-white/5 overflow-y-auto no-scrollbar"
      role="complementary"
      aria-label="Sidebar Finance Sections"
      style={{
        background: glassmorphismTokens.dark.bg,
        backdropFilter: glassmorphismTokens.dark.backdrop,
        borderColor: glassmorphismTokens.dark.border
      }}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/5 sticky top-0 bg-slate-900/50 backdrop-blur-sm">
        <h2 className="text-sm font-bold text-slate-50 uppercase tracking-wider">Finanças</h2>
      </div>

      {/* Sections Container */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto no-scrollbar">
        {/* Budget Section */}
        <div>
          <SectionHeader
            icon="📊"
            label="Orçamento"
            isExpanded={state.expandedSections.BUDGET}
            onClick={handleBudgetClick}
            ariaLabel="Expandir seção Orçamento"
            ariaControls="budget-content"
          />
          {state.expandedSections.BUDGET && (
            <div
              id="budget-content"
              className="mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-out"
              role="region"
              aria-label="Seção de Orçamento com gastos por categoria"
            >
              <SidebarBudgetSection />
            </div>
          )}
        </div>

        <div className="h-px bg-white/5" />

        {/* Accounts Section */}
        <div>
          <SectionHeader
            icon="💳"
            label="Contas"
            isExpanded={state.expandedSections.ACCOUNTS}
            onClick={handleAccountsClick}
            ariaLabel="Expandir seção Contas"
            ariaControls="accounts-content"
          />
          {state.expandedSections.ACCOUNTS && (
            <div
              id="accounts-content"
              className="mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-out"
              role="region"
              aria-label="Seção de Contas com saldos"
            >
              <SidebarAccountsSection />
            </div>
          )}
        </div>

        <div className="h-px bg-white/5" />

        {/* Transactions Section */}
        <div>
          <SectionHeader
            icon="📋"
            label="Lançamentos"
            isExpanded={state.expandedSections.TRANSACTIONS}
            onClick={handleTransactionsClick}
            ariaLabel="Expandir seção Lançamentos"
            ariaControls="transactions-content"
          />
          {state.expandedSections.TRANSACTIONS && (
            <div
              id="transactions-content"
              className="mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-out"
              role="region"
              aria-label="Seção de Lançamentos recentes"
            >
              <SidebarTransactionsSection />
            </div>
          )}
        </div>

        <div className="h-px bg-white/5" />

        {/* Installments Section */}
        <div>
          <SectionHeader
            icon="📅"
            label="Parcelamentos"
            isExpanded={state.expandedSections.INSTALLMENTS}
            onClick={handleInstallmentsClick}
            ariaLabel="Expandir seção Parcelamentos"
            ariaControls="installments-content"
          />
          {state.expandedSections.INSTALLMENTS && (
            <div
              id="installments-content"
              className="mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-out"
              role="region"
              aria-label="Seção de Parcelamentos ativos"
            >
              <SidebarInstallmentsSection />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});

DesktopSidebar.displayName = 'DesktopSidebar';

/**
 * Mobile Hamburger Button
 */
interface MobileToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileToggle: React.FC<MobileToggleProps> = memo(({ isOpen, onToggle }) => (
  <button
    onClick={onToggle}
    aria-label={isOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
    aria-expanded={isOpen}
    className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg transition-colors duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
    style={{
      color: colorTokens.slate[50],
      outlineOffset: '2px'
    }}
  >
    {isOpen ? (
      <X size={24} />
    ) : (
      <Menu size={24} />
    )}
  </button>
));

MobileToggle.displayName = 'MobileToggle';

/**
 * SidebarLayout Component
 * Main component that orchestrates desktop sidebar and mobile drawer
 */
export const SidebarLayout: React.FC<SidebarLayoutProps> = memo(({ isOpen, onToggle }) => {
  const { state, toggleDrawer, closeDrawer } = useSidebar();
  const [mobileOpen, setMobileOpen] = React.useState(isOpen || state.isDrawerOpen || false);

  const handleMobileToggle = useCallback(() => {
    const newState = !mobileOpen;
    setMobileOpen(newState);
    if (newState) {
      toggleDrawer();
    } else {
      closeDrawer();
    }
    onToggle?.(newState);
  }, [mobileOpen, toggleDrawer, closeDrawer, onToggle]);

  const handleDrawerClose = useCallback(() => {
    setMobileOpen(false);
    closeDrawer();
    onToggle?.(false);
  }, [closeDrawer, onToggle]);

  return (
    <>
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Hamburger Button */}
      <MobileToggle isOpen={mobileOpen} onToggle={handleMobileToggle} />

      {/* Mobile Drawer */}
      <SidebarDrawer isOpen={mobileOpen} onClose={handleDrawerClose} />
    </>
  );
});

SidebarLayout.displayName = 'SidebarLayout';

export default SidebarLayout;
