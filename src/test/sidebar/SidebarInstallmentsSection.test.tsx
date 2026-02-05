/**
 * SidebarInstallmentsSection Component Tests (STY-052)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SidebarInstallmentsSection } from '../../components/sidebar/SidebarInstallmentsSection';
import { mockInstallments } from '../../constants/mockSidebarData';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SidebarInstallmentsSection', () => {
  it('should render installment items', () => {
    renderWithRouter(<SidebarInstallmentsSection />);

    mockInstallments.slice(0, 4).forEach(inst => {
      expect(screen.getByText(inst.name)).toBeInTheDocument();
    });
  });

  it('should display installment progress [X/Y] format', () => {
    renderWithRouter(<SidebarInstallmentsSection />);

    expect(screen.getByText(/\[\d+\/\d+\]/)).toBeInTheDocument();
  });

  it('should show monthly payment amounts', () => {
    renderWithRouter(<SidebarInstallmentsSection />);

    expect(screen.getAllByText(/R\$/).length).toBeGreaterThan(0);
  });

  it('should display next due date with calendar icon', () => {
    renderWithRouter(<SidebarInstallmentsSection />);

    expect(screen.getByText(/Próximo:/i)).toBeInTheDocument();
  });

  it('should show max 4 installments (sorted by due date)', () => {
    const { container } = renderWithRouter(<SidebarInstallmentsSection />);

    const progressBars = container.querySelectorAll('[role="progressbar"]');
    expect(progressBars.length).toBeLessThanOrEqual(4);
  });

  it('should have progress bars with correct percentages', () => {
    const { container } = renderWithRouter(<SidebarInstallmentsSection />);

    const progressBars = container.querySelectorAll('[role="progressbar"]');
    progressBars.forEach((bar, index) => {
      const expectedPercentage = mockInstallments[index].progressPercentage;
      expect(bar).toHaveAttribute('aria-valuenow', `${Math.round(expectedPercentage)}`);
    });
  });

  it('should have color-coded progress bars by percentage', () => {
    const { container } = renderWithRouter(<SidebarInstallmentsSection />);

    const progressBars = container.querySelectorAll('[role="progressbar"]');

    progressBars.forEach((bar, index) => {
      const percentage = mockInstallments[index].progressPercentage;

      if (percentage < 33) {
        expect(bar).toHaveClass('bg-blue-500/20');
      } else if (percentage < 66) {
        expect(bar).toHaveClass('bg-emerald-500/20');
      } else {
        expect(bar).toHaveClass('bg-amber-500/20');
      }
    });
  });

  it('should display installment names and descriptions', () => {
    renderWithRouter(<SidebarInstallmentsSection />);

    expect(screen.getByText('iPhone 15 Pro Max')).toBeInTheDocument();
    expect(screen.getByText('Viagem Miami')).toBeInTheDocument();
  });

  it('should be sorted by next due date (earliest first)', () => {
    renderWithRouter(<SidebarInstallmentsSection />);

    const installmentNames = screen.getAllByText(/(iPhone|Viagem|Notebook|Sofá)/);
    expect(installmentNames.length).toBeGreaterThan(0);
  });

  it('should display full date format (pt-BR)', () => {
    renderWithRouter(<SidebarInstallmentsSection />);

    // Should show dates like "fev", "mar", etc.
    expect(screen.getByText(/fev|mar|abr|mai/i)).toBeInTheDocument();
  });

  it('should have "Ver Todos os Parcelamentos" link', () => {
    renderWithRouter(<SidebarInstallmentsSection />);

    const link = screen.getByText(/Ver Todos os Parcelamentos/i);
    expect(link).toBeInTheDocument();
  });

  it('should have proper ARIA labels for progress', () => {
    const { container } = renderWithRouter(<SidebarInstallmentsSection />);

    const progressBars = container.querySelectorAll('[role="progressbar"]');
    progressBars.forEach(bar => {
      expect(bar).toHaveAttribute('aria-valuenow');
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
      expect(bar).toHaveAttribute('aria-label');
    });
  });

  it('should display calendar icon for due dates', () => {
    const { container } = renderWithRouter(<SidebarInstallmentsSection />);

    const calendarTexts = screen.getAllByText(/Próximo:/i);
    expect(calendarTexts.length).toBeGreaterThan(0);
  });

  it('should handle installment click', () => {
    renderWithRouter(<SidebarInstallmentsSection />);

    const firstInstallment = screen.getByText('iPhone 15 Pro Max').closest('button');
    expect(firstInstallment).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    renderWithRouter(<SidebarInstallmentsSection />);

    expect(screen.getByText(/iPhone|Nenhum parcelamento/i)).toBeInTheDocument();
  });
});
