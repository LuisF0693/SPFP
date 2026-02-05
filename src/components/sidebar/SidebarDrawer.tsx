/**
 * SidebarDrawer Component (STY-052)
 * Mobile drawer that slides from left on small screens
 *
 * Features:
 * - Fixed positioning, slides from left (-100% → 0)
 * - Overlay backdrop with blur
 * - Close button (X) + ESC key support
 * - Same 4 sections as desktop (all collapsed by default)
 * - Animation: 300ms ease-out
 * - Z-index: 50 (above content)
 *
 * Design: docs/design/FASE-1-MOCKUPS.md (Mobile Layout)
 */

import React, { memo, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { glassmorphismTokens } from '../../styles/tokens';
import { SidebarBudgetSection } from './SidebarBudgetSection';
import { SidebarAccountsSection } from './SidebarAccountsSection';
import { SidebarTransactionsSection } from './SidebarTransactionsSection';
import { SidebarInstallmentsSection } from './SidebarInstallmentsSection';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Section Header for Drawer (Same as Desktop but inline)
 */
interface DrawerSectionHeaderProps {
  icon: string;
  label: string;
  isExpanded: boolean;
  onClick: () => void;
  ariaLabel: string;
  ariaControls: string;
}

const DrawerSectionHeader: React.FC<DrawerSectionHeaderProps> = memo(({
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
    className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <span className="font-medium text-sm text-slate-50">{label}</span>
    </div>
    <span
      className="transition-transform duration-300 text-slate-400"
      style={{
        transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
      }}
    >
      ▼
    </span>
  </button>
));

DrawerSectionHeader.displayName = 'DrawerSectionHeader';

/**
 * SidebarDrawer Component
 * Mobile drawer with all sections initially collapsed
 */
export const SidebarDrawer: React.FC<SidebarDrawerProps> = memo(({ isOpen, onClose }) => {
  const { state, toggleSection, closeDrawer } = useSidebar();

  // Close drawer on ESC key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

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

  const handleCloseClick = useCallback(() => {
    onClose();
    closeDrawer();
  }, [onClose, closeDrawer]);

  return (
    <>
      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 transition-opacity duration-300"
          onClick={handleBackdropClick}
          role="presentation"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Drawer Content */}
      <div
        className="md:hidden fixed top-0 left-0 h-full z-40 w-[85vw] max-w-[320px] overflow-y-auto no-scrollbar shadow-2xl transition-transform duration-300 ease-out flex flex-col"
        style={{
          background: glassmorphismTokens.dark.bg,
          backdropFilter: glassmorphismTokens.dark.backdrop,
          borderRight: `1px solid ${glassmorphismTokens.dark.border}`,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
        role="region"
        aria-label="Menu Lateral Móvel"
        aria-hidden={!isOpen}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-900/50 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-slate-50 uppercase tracking-wider">Menu</h2>
          <button
            onClick={handleCloseClick}
            aria-label="Fechar menu"
            className="p-1 rounded-lg hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X size={20} className="text-slate-400 hover:text-slate-200" />
          </button>
        </div>

        {/* Sections Container */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto no-scrollbar">
          {/* Budget Section */}
          <div>
            <DrawerSectionHeader
              icon="📊"
              label="Orçamento"
              isExpanded={state.expandedSections.BUDGET}
              onClick={handleBudgetClick}
              ariaLabel="Expandir seção Orçamento"
              ariaControls="drawer-budget-content"
            />
            {state.expandedSections.BUDGET && (
              <div
                id="drawer-budget-content"
                className="mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-out"
                role="region"
              >
                <SidebarBudgetSection />
              </div>
            )}
          </div>

          <div className="h-px bg-white/5" />

          {/* Accounts Section */}
          <div>
            <DrawerSectionHeader
              icon="💳"
              label="Contas"
              isExpanded={state.expandedSections.ACCOUNTS}
              onClick={handleAccountsClick}
              ariaLabel="Expandir seção Contas"
              ariaControls="drawer-accounts-content"
            />
            {state.expandedSections.ACCOUNTS && (
              <div
                id="drawer-accounts-content"
                className="mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-out"
                role="region"
              >
                <SidebarAccountsSection />
              </div>
            )}
          </div>

          <div className="h-px bg-white/5" />

          {/* Transactions Section */}
          <div>
            <DrawerSectionHeader
              icon="📋"
              label="Lançamentos"
              isExpanded={state.expandedSections.TRANSACTIONS}
              onClick={handleTransactionsClick}
              ariaLabel="Expandir seção Lançamentos"
              ariaControls="drawer-transactions-content"
            />
            {state.expandedSections.TRANSACTIONS && (
              <div
                id="drawer-transactions-content"
                className="mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-out"
                role="region"
              >
                <SidebarTransactionsSection />
              </div>
            )}
          </div>

          <div className="h-px bg-white/5" />

          {/* Installments Section */}
          <div>
            <DrawerSectionHeader
              icon="📅"
              label="Parcelamentos"
              isExpanded={state.expandedSections.INSTALLMENTS}
              onClick={handleInstallmentsClick}
              ariaLabel="Expandir seção Parcelamentos"
              ariaControls="drawer-installments-content"
            />
            {state.expandedSections.INSTALLMENTS && (
              <div
                id="drawer-installments-content"
                className="mt-2 space-y-2 overflow-hidden transition-all duration-300 ease-out"
                role="region"
              >
                <SidebarInstallmentsSection />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});

SidebarDrawer.displayName = 'SidebarDrawer';

export default SidebarDrawer;
