import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { FinanceProvider } from '../context/FinanceContext';
import { AuthProvider } from '../context/AuthContext';
import { UIProvider } from '../context/UIContext';
import { SidebarProvider } from '../context/SidebarContext';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'test-user', email: 'test@example.com', user_metadata: { display_name: 'Test User' } },
      logout: vi.fn(),
      isAdmin: false,
      loading: false,
    }),
  };
});

vi.mock('../context/UIContext', async () => {
  const actual = await vi.importActual('../context/UIContext');
  return {
    ...actual,
    useUI: () => ({
      isDark: true,
    }),
  };
});

vi.mock('../hooks/useSafeFinance', () => ({
  useSafeFinance: () => ({
    userProfile: { name: 'Test User', email: 'test@example.com' },
    isSyncing: false,
    isImpersonating: false,
    stopImpersonating: vi.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <SidebarProvider>
            <FinanceProvider>
              {component}
            </FinanceProvider>
          </SidebarProvider>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('STY-051: Layout Sidebar Restructure', () => {

  describe('AC-1: Sidebar exibe nova estrutura hierárquica', () => {
    it('should display all main navigation items', () => {
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Orçamento')).toBeInTheDocument();
      expect(screen.getByText('Portfólio')).toBeInTheDocument();
      expect(screen.getByText('Objetivos')).toBeInTheDocument();
      expect(screen.getByText('Aposentadoria')).toBeInTheDocument();
      expect(screen.getByText('Patrimônio')).toBeInTheDocument();
      expect(screen.getByText('Aquisição')).toBeInTheDocument();
      expect(screen.getByText('Relatórios')).toBeInTheDocument();
      expect(screen.getByText('Insights Financeiros')).toBeInTheDocument();
    });

    it('should display Budget section children when expanded', async () => {
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      const budgetButton = screen.getByRole('button', { name: /Orçamento/i });
      fireEvent.click(budgetButton);

      expect(screen.getByText('Minhas Contas')).toBeInTheDocument();
      expect(screen.getByText('Lançamentos')).toBeInTheDocument();
      expect(screen.getByText('Metas')).toBeInTheDocument();
      expect(screen.getByText('Parcelamentos')).toBeInTheDocument();
    });
  });

  describe('AC-2: Seção "Orçamento" é colapsável com animação suave (200ms)', () => {
    it('should toggle Budget section expansion', async () => {
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      const budgetButton = screen.getByRole('button', { name: /Orçamento/i });

      // Initially collapsed (according to default state)
      let budgetSection = budgetButton.closest('div')?.querySelector('[id^="nav-section-"]');
      expect(budgetSection).toHaveClass('max-h-0');

      // Click to expand
      fireEvent.click(budgetButton);
      budgetSection = budgetButton.closest('div')?.querySelector('[id^="nav-section-"]');
      expect(budgetSection).toHaveClass('max-h-96');

      // Click to collapse
      fireEvent.click(budgetButton);
      budgetSection = budgetButton.closest('div')?.querySelector('[id^="nav-section-"]');
      expect(budgetSection).toHaveClass('max-h-0');
    });

    it('should have 200ms transition animation', () => {
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      const budgetButton = screen.getByRole('button', { name: /Orçamento/i });
      const budgetSection = budgetButton.closest('div')?.querySelector('[id^="nav-section-"]');

      expect(budgetSection).toHaveClass('transition-all');
      expect(budgetSection).toHaveClass('duration-200');
    });
  });

  describe('AC-3: Estado de expansão persiste durante a sessão', () => {
    it('should maintain expanded state across component re-renders', () => {
      const { rerender } = renderWithProviders(
        <Layout mode="personal"><div>Test</div></Layout>
      );

      const budgetButton = screen.getByRole('button', { name: /Orçamento/i });
      fireEvent.click(budgetButton);

      expect(screen.getByText('Minhas Contas')).toBeInTheDocument();

      // Re-render without unmounting
      rerender(
        <BrowserRouter>
          <AuthProvider>
            <UIProvider>
              <SidebarProvider>
                <FinanceProvider>
                  <Layout mode="personal"><div>Test 2</div></Layout>
                </FinanceProvider>
              </SidebarProvider>
            </UIProvider>
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Minhas Contas')).toBeInTheDocument();
    });
  });

  describe('AC-4: Todos os itens têm emoji à esquerda', () => {
    it('should display emoji for all navigation items', () => {
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      const navItems = screen.getAllByRole('button', { name: /Dashboard|Orçamento|Objetivos|Aposentadoria|Patrimônio|Aquisição|Relatórios|Insights/ });

      navItems.forEach(item => {
        const emoji = item.querySelector('span:first-child');
        expect(emoji?.textContent).toMatch(/[📊📋📈🎯🏖️💰🏠💡]/);
      });
    });
  });

  describe('AC-5: Indicador chevron (▼/▶) para seção colapsável', () => {
    it('should display chevron indicator', () => {
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      const budgetButton = screen.getByRole('button', { name: /Orçamento/i });
      const chevron = budgetButton.querySelector('svg');

      expect(chevron).toBeInTheDocument();
      expect(chevron).toHaveClass('transition-transform');
    });

    it('should rotate chevron when section expands', () => {
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      const budgetButton = screen.getByRole('button', { name: /Orçamento/i });
      const chevron = budgetButton.querySelector('svg');

      expect(chevron).not.toHaveClass('rotate-180');

      fireEvent.click(budgetButton);
      expect(chevron).toHaveClass('rotate-180');
    });
  });

  describe('AC-6: Item ativo tem destaque visual (background + borda esquerda)', () => {
    it('should highlight active navigation item', () => {
      renderWithProviders(
        <Layout mode="personal">
          <div>Test</div>
        </Layout>
      );

      // Dashboard should be active by default on /dashboard route
      const dashboardLink = screen.getAllByRole('link').find(link =>
        link.textContent?.includes('Dashboard')
      );

      expect(dashboardLink).toHaveClass('bg-blue-900/30', 'border-blue-500/30');
    });
  });

  describe('AC-7: Hover state funcional em todos os itens', () => {
    it('should apply hover styles to navigation items', () => {
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      const navLinks = screen.getAllByRole('link').filter(link =>
        link.textContent?.includes('Minhas Contas') ||
        link.textContent?.includes('Lançamentos')
      );

      navLinks.forEach(link => {
        expect(link).toHaveClass('hover:bg-white/5', 'hover:text-white');
      });
    });
  });

  describe('AC-8: Navegação por teclado funcionando (Tab, Enter)', () => {
    it('should navigate using keyboard Tab and Enter', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      const budgetButton = screen.getByRole('button', { name: /Orçamento/i });

      // Tab to button
      await user.tab();

      // Button should have aria-expanded
      expect(budgetButton).toHaveAttribute('aria-expanded', 'false');

      // Press Enter to expand
      budgetButton.focus();
      await user.keyboard('{Enter}');

      // Should now be expanded (visible children)
      expect(screen.getByText('Minhas Contas')).toBeInTheDocument();
    });

    it('should have proper ARIA labels', () => {
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      const budgetButton = screen.getByRole('button', { name: /Orçamento/i });

      expect(budgetButton).toHaveAttribute('aria-expanded');
      expect(budgetButton).toHaveAttribute('aria-controls');
    });
  });

  describe('AC-9: Mobile: sidebar funciona como drawer ou bottom nav', () => {
    it('should hide desktop sidebar on mobile screens', () => {
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      const sidebar = screen.getByRole('complementary', { name: /Navegação Lateral/i });

      expect(sidebar).toHaveClass('hidden', 'md:flex');
    });

    it('should display mobile bottom navigation', () => {
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      const mobileNav = screen.getByRole('navigation', { name: /Mobile navigation/i });

      expect(mobileNav).toHaveClass('md:hidden');
    });
  });

  describe('AC-10: Aba "Projeções" removida do sidebar', () => {
    it('should not display Projeções item', () => {
      renderWithProviders(<Layout mode="personal"><div>Test</div></Layout>);

      expect(screen.queryByText(/Projeções/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/FutureCashFlow/i)).not.toBeInTheDocument();
    });
  });

});
