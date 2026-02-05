/**
 * SidebarAccountsSection Component Tests (STY-052)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { SidebarAccountsSection } from '../../components/sidebar/SidebarAccountsSection';
import { mockAccounts } from '../../constants/mockSidebarData';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SidebarAccountsSection', () => {
  it('should render account items', () => {
    renderWithRouter(<SidebarAccountsSection />);

    mockAccounts.slice(0, 8).forEach(account => {
      expect(screen.getByText(account.bank)).toBeInTheDocument();
    });
  });

  it('should display account balances', () => {
    renderWithRouter(<SidebarAccountsSection />);

    // Check for currency formatting
    expect(screen.getAllByText(/R\$/).length).toBeGreaterThan(0);
  });

  it('should show positive balances in green', () => {
    const { container } = renderWithRouter(<SidebarAccountsSection />);

    const positiveBalance = container.querySelector('.text-emerald-400');
    expect(positiveBalance).toBeInTheDocument();
  });

  it('should show negative balances in red', () => {
    const { container } = renderWithRouter(<SidebarAccountsSection />);

    const negativeBalance = container.querySelector('.text-rose-400');
    expect(negativeBalance).toBeInTheDocument();
  });

  it('should render "Adicionar Conta" button', () => {
    renderWithRouter(<SidebarAccountsSection />);

    const addButton = screen.getByLabelText(/Adicionar nova conta/i);
    expect(addButton).toBeInTheDocument();
  });

  it('should display max 8 accounts (scroll if more)', () => {
    renderWithRouter(<SidebarAccountsSection />);

    const accountButtons = screen.getAllByRole('button');
    // Should have 8 account items + 1 add button = 9 total
    expect(accountButtons.length).toBeLessThanOrEqual(9);
  });

  it('should have scrollable container for accounts', () => {
    const { container } = renderWithRouter(<SidebarAccountsSection />);

    const scrollContainer = container.querySelector('.max-h-48');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('should display account type labels', () => {
    renderWithRouter(<SidebarAccountsSection />);

    expect(screen.getByText('Corrente')).toBeInTheDocument();
    expect(screen.getByText('Poupança')).toBeInTheDocument();
  });

  it('should have accessible account items', () => {
    renderWithRouter(<SidebarAccountsSection />);

    const accountButtons = screen.getAllByRole('button').slice(0, -1); // Exclude add button
    accountButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });

  it('should handle account click', async () => {
    renderWithRouter(<SidebarAccountsSection />);

    const firstAccount = screen.getAllByRole('button')[0];
    await userEvent.click(firstAccount);

    // In real scenario, would filter transactions
  });

  it('should show bank abbreviations', () => {
    const { container } = renderWithRouter(<SidebarAccountsSection />);

    const abbreviations = container.querySelectorAll('.text-blue-400');
    expect(abbreviations.length).toBeGreaterThan(0);
  });

  it('should have hover effects on account buttons', () => {
    const { container } = renderWithRouter(<SidebarAccountsSection />);

    const buttons = container.querySelectorAll('button:not([aria-label*="nova"])');
    buttons.forEach(button => {
      expect(button).toHaveClass('hover:bg-white/5');
    });
  });

  it('should have proper focus management', () => {
    const { container } = renderWithRouter(<SidebarAccountsSection />);

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });
  });

  it('should display all account data without crashes', () => {
    renderWithRouter(<SidebarAccountsSection />);

    expect(screen.getByText(/Nubank|Bradesco|XP Investimentos|Itaú/)).toBeInTheDocument();
  });
});
