import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import { AuthProvider } from '../context/AuthContext';
import { DEFAULT_SIDEBAR_STATE, SidebarSection } from '../types/sidebar';

// Mock AuthContext for testing
vi.mock('../context/AuthContext', async () => {
  const actual = await vi.importActual('../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'test-user-123' },
      session: null,
      loading: false,
      isAdmin: false,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      registerWithEmail: vi.fn(),
      logout: vi.fn()
    })
  };
});

// Test component that uses useSidebar hook
const TestComponent = () => {
  const { state, toggleSection, expandSection, collapseSection, toggleDrawer, openDrawer, closeDrawer, resetToDefaults, setAllSections } = useSidebar();

  return (
    <div>
      <div data-testid="budget-state">{state.budget ? 'expanded' : 'collapsed'}</div>
      <div data-testid="investments-state">{state.investments ? 'expanded' : 'collapsed'}</div>
      <div data-testid="retirement-state">{state.retirement ? 'expanded' : 'collapsed'}</div>
      <div data-testid="patrimony-state">{state.patrimony ? 'expanded' : 'collapsed'}</div>
      <div data-testid="drawer-state">{state.isDrawerOpen ? 'open' : 'closed'}</div>

      <button onClick={() => toggleSection('budget')}>Toggle Budget</button>
      <button onClick={() => expandSection('investments')}>Expand Investments</button>
      <button onClick={() => collapseSection('retirement')}>Collapse Retirement</button>
      <button onClick={() => toggleDrawer()}>Toggle Drawer</button>
      <button onClick={() => openDrawer()}>Open Drawer</button>
      <button onClick={() => closeDrawer()}>Close Drawer</button>
      <button onClick={() => resetToDefaults()}>Reset to Defaults</button>
      <button onClick={() => setAllSections(false)}>Collapse All</button>
      <button onClick={() => setAllSections(true)}>Expand All</button>
    </div>
  );
};

describe('SidebarContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Default State', () => {
    it('should initialize with default sidebar state', () => {
      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      expect(screen.getByTestId('budget-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('investments-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('retirement-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('patrimony-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('drawer-state')).toHaveTextContent('closed');
    });
  });

  describe('Toggle Section', () => {
    it('should toggle a section from expanded to collapsed', () => {
      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      expect(screen.getByTestId('budget-state')).toHaveTextContent('expanded');

      fireEvent.click(screen.getByText('Toggle Budget'));

      expect(screen.getByTestId('budget-state')).toHaveTextContent('collapsed');
    });

    it('should toggle a section from collapsed to expanded', () => {
      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Toggle Budget'));
      expect(screen.getByTestId('budget-state')).toHaveTextContent('collapsed');

      fireEvent.click(screen.getByText('Toggle Budget'));
      expect(screen.getByTestId('budget-state')).toHaveTextContent('expanded');
    });

    it('should toggle multiple sections independently', () => {
      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Toggle Budget'));
      fireEvent.click(screen.getByText('Expand Investments'));

      expect(screen.getByTestId('budget-state')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('investments-state')).toHaveTextContent('expanded');
    });
  });

  describe('Expand/Collapse Section', () => {
    it('should expand a specific section', () => {
      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Toggle Budget'));
      expect(screen.getByTestId('budget-state')).toHaveTextContent('collapsed');

      fireEvent.click(screen.getByText('Expand Investments'));
      expect(screen.getByTestId('investments-state')).toHaveTextContent('expanded');
    });

    it('should collapse a specific section', () => {
      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      expect(screen.getByTestId('retirement-state')).toHaveTextContent('expanded');

      fireEvent.click(screen.getByText('Collapse Retirement'));
      expect(screen.getByTestId('retirement-state')).toHaveTextContent('collapsed');
    });
  });

  describe('Drawer State', () => {
    it('should toggle drawer open/closed', () => {
      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      expect(screen.getByTestId('drawer-state')).toHaveTextContent('closed');

      fireEvent.click(screen.getByText('Toggle Drawer'));
      expect(screen.getByTestId('drawer-state')).toHaveTextContent('open');

      fireEvent.click(screen.getByText('Toggle Drawer'));
      expect(screen.getByTestId('drawer-state')).toHaveTextContent('closed');
    });

    it('should open drawer explicitly', () => {
      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Open Drawer'));
      expect(screen.getByTestId('drawer-state')).toHaveTextContent('open');
    });

    it('should close drawer explicitly', () => {
      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Open Drawer'));
      expect(screen.getByTestId('drawer-state')).toHaveTextContent('open');

      fireEvent.click(screen.getByText('Close Drawer'));
      expect(screen.getByTestId('drawer-state')).toHaveTextContent('closed');
    });
  });

  describe('Reset and Bulk Operations', () => {
    it('should reset to default state', () => {
      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Toggle Budget'));
      fireEvent.click(screen.getByText('Collapse Retirement'));
      fireEvent.click(screen.getByText('Open Drawer'));

      expect(screen.getByTestId('budget-state')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('retirement-state')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('drawer-state')).toHaveTextContent('open');

      fireEvent.click(screen.getByText('Reset to Defaults'));

      expect(screen.getByTestId('budget-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('investments-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('retirement-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('patrimony-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('drawer-state')).toHaveTextContent('closed');
    });

    it('should collapse all sections', () => {
      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Collapse All'));

      expect(screen.getByTestId('budget-state')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('investments-state')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('retirement-state')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('patrimony-state')).toHaveTextContent('collapsed');
    });

    it('should expand all sections', () => {
      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Collapse All'));
      expect(screen.getByTestId('budget-state')).toHaveTextContent('collapsed');

      fireEvent.click(screen.getByText('Expand All'));

      expect(screen.getByTestId('budget-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('investments-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('retirement-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('patrimony-state')).toHaveTextContent('expanded');
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should persist state changes to localStorage', () => {
      const { rerender } = render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      fireEvent.click(screen.getByText('Toggle Budget'));

      const stored = localStorage.getItem('spfp_sidebar_state_test-user-123');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.budget).toBe(false);
    });

    it('should load state from localStorage on mount', () => {
      const initialState = {
        budget: false,
        investments: true,
        retirement: false,
        patrimony: true,
        isDrawerOpen: true
      };

      localStorage.setItem('spfp_sidebar_state_test-user-123', JSON.stringify(initialState));

      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      expect(screen.getByTestId('budget-state')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('investments-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('retirement-state')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('patrimony-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('drawer-state')).toHaveTextContent('open');
    });

    it('should use default state if localStorage is corrupted', () => {
      localStorage.setItem('spfp_sidebar_state_test-user-123', 'invalid json {');

      render(
        <AuthProvider>
          <SidebarProvider>
            <TestComponent />
          </SidebarProvider>
        </AuthProvider>
      );

      expect(screen.getByTestId('budget-state')).toHaveTextContent('expanded');
      expect(screen.getByTestId('investments-state')).toHaveTextContent('expanded');
    });
  });

  describe('Hook Error Handling', () => {
    it('should throw error when useSidebar is called outside SidebarProvider', () => {
      // This test verifies the context guard
      const BadComponent = () => {
        const context = useSidebar();
        return <div>{String(context)}</div>;
      };

      expect(() => {
        render(<BadComponent />);
      }).toThrow('useSidebar must be used within SidebarProvider');
    });
  });
});
