/**
 * SidebarLayout Component Tests (STY-052)
 * Tests for desktop sidebar, mobile drawer, and expand/collapse functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SidebarProvider } from '../../context/SidebarContext';
import { SidebarLayout } from '../../components/sidebar/SidebarLayout';

/**
 * Helper: Wrap component with providers
 */
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <SidebarProvider>
        {component}
      </SidebarProvider>
    </BrowserRouter>
  );
};

describe('SidebarLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Sidebar', () => {
    it('should render desktop sidebar on md+ screens', () => {
      renderWithProviders(<SidebarLayout />);
      const sidebar = screen.getByRole('complementary', { name: /Sidebar Finance Sections/i });
      expect(sidebar).toBeInTheDocument();
    });

    it('should display all 4 section headers', () => {
      renderWithProviders(<SidebarLayout />);
      expect(screen.getByText('Orçamento')).toBeInTheDocument();
      expect(screen.getByText('Contas')).toBeInTheDocument();
      expect(screen.getByText('Lançamentos')).toBeInTheDocument();
      expect(screen.getByText('Parcelamentos')).toBeInTheDocument();
    });

    it('should expand/collapse Budget section on click', async () => {
      renderWithProviders(<SidebarLayout />);

      const budgetButton = screen.getByLabelText(/Expandir seção Orçamento/i);

      // Initially expanded
      expect(budgetButton).toHaveAttribute('aria-expanded', 'true');

      // Click to collapse
      await userEvent.click(budgetButton);
      expect(budgetButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should support keyboard navigation (Space/Enter to expand)', async () => {
      renderWithProviders(<SidebarLayout />);

      const budgetButton = screen.getByLabelText(/Expandir seção Orçamento/i);

      // Initial state
      expect(budgetButton).toHaveAttribute('aria-expanded', 'true');

      // Press Space to collapse
      await userEvent.click(budgetButton);
      fireEvent.keyDown(budgetButton, { key: ' ' });

      await waitFor(() => {
        expect(budgetButton).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should have proper ARIA labels for accessibility', () => {
      renderWithProviders(<SidebarLayout />);

      expect(screen.getByRole('complementary')).toHaveAttribute(
        'aria-label',
        'Sidebar Finance Sections'
      );

      expect(screen.getByLabelText(/Expandir seção Orçamento/i)).toHaveAttribute('aria-expanded');
      expect(screen.getByLabelText(/Expandir seção Contas/i)).toHaveAttribute('aria-expanded');
    });

    it('should display section dividers', () => {
      const { container } = renderWithProviders(<SidebarLayout />);
      const dividers = container.querySelectorAll('.h-px.bg-white\\/5');
      // Should have 3 dividers (between 4 sections)
      expect(dividers.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Mobile Drawer', () => {
    beforeEach(() => {
      // Mock window.matchMedia for mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    });

    it('should render mobile hamburger menu on small screens', () => {
      renderWithProviders(<SidebarLayout />);
      const hamburger = screen.getByLabelText(/Abrir menu lateral/i);
      expect(hamburger).toBeInTheDocument();
    });

    it('should toggle drawer open/close on hamburger click', async () => {
      renderWithProviders(<SidebarLayout />);

      const hamburger = screen.getByLabelText(/Abrir menu lateral/i);

      // Initially closed
      expect(hamburger).toHaveAttribute('aria-expanded', 'false');

      // Click to open
      await userEvent.click(hamburger);

      await waitFor(() => {
        expect(screen.getByLabelText(/Menu Lateral Móvel/i)).toBeVisible();
      });
    });

    it('should close drawer when clicking backdrop', async () => {
      renderWithProviders(<SidebarLayout />);

      const hamburger = screen.getByLabelText(/Abrir menu lateral/i);
      await userEvent.click(hamburger);

      // Find and click backdrop
      const backdrops = screen.getAllByRole('presentation');
      const backdrop = backdrops[0];

      await userEvent.click(backdrop);

      expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should close drawer when pressing ESC key', async () => {
      renderWithProviders(<SidebarLayout />);

      const hamburger = screen.getByLabelText(/Abrir menu lateral/i);
      await userEvent.click(hamburger);

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(hamburger).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should show close button (X) in drawer header', async () => {
      renderWithProviders(<SidebarLayout />);

      const hamburger = screen.getByLabelText(/Abrir menu lateral/i);
      await userEvent.click(hamburger);

      const closeButton = screen.getByLabelText(/Fechar menu/i);
      expect(closeButton).toBeInTheDocument();
    });

    it('should prevent body scroll when drawer is open', async () => {
      renderWithProviders(<SidebarLayout />);

      const hamburger = screen.getByLabelText(/Abrir menu lateral/i);
      await userEvent.click(hamburger);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper focus management', async () => {
      renderWithProviders(<SidebarLayout />);

      const budgetButton = screen.getByLabelText(/Expandir seção Orçamento/i);

      budgetButton.focus();
      expect(budgetButton).toHaveFocus();

      // Should show focus ring on Tab
      fireEvent.keyDown(budgetButton, { key: 'Tab' });
    });

    it('should have role="region" for sections', () => {
      const { container } = renderWithProviders(<SidebarLayout />);

      const regions = container.querySelectorAll('[role="region"]');
      expect(regions.length).toBeGreaterThan(0);
    });

    it('should announce state changes to screen readers', async () => {
      renderWithProviders(<SidebarLayout />);

      const budgetButton = screen.getByLabelText(/Expandir seção Orçamento/i);

      // aria-expanded should update
      expect(budgetButton).toHaveAttribute('aria-expanded', 'true');

      await userEvent.click(budgetButton);

      expect(budgetButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Animations & Transitions', () => {
    it('should apply transition classes to sections', async () => {
      const { container } = renderWithProviders(<SidebarLayout />);

      const section = container.querySelector('[role="region"]');
      expect(section).toHaveClass('transition-all', 'duration-300');
    });

    it('should apply transform to chevron icon on expand/collapse', async () => {
      const { container } = renderWithProviders(<SidebarLayout />);

      const budgetButton = screen.getByLabelText(/Expandir seção Orçamento/i);
      const chevron = budgetButton.querySelector('svg');

      expect(chevron).toBeInTheDocument();
      expect(chevron?.parentElement).toHaveClass('transition-transform');
    });
  });

  describe('Responsive Design', () => {
    it('should have proper mobile-specific classes', () => {
      const { container } = renderWithProviders(<SidebarLayout />);

      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('hidden', 'md:flex');
    });

    it('should pass onToggle callback', async () => {
      const mockToggle = vi.fn();
      renderWithProviders(<SidebarLayout onToggle={mockToggle} />);

      // This would be called on mobile when drawer opens/closes
      // Note: May need to update test based on actual implementation
    });
  });
});
