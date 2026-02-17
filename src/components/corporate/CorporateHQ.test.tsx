import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CorporateHQ } from './CorporateHQ';

describe('CorporateHQ', () => {
  it('renders the office map', () => {
    render(<CorporateHQ />);
    expect(screen.getByText('CORPORATE HQ')).toBeInTheDocument();
  });

  it('renders all 4 departments', () => {
    render(<CorporateHQ />);
    expect(screen.getByLabelText('Financeiro Department')).toBeInTheDocument();
    expect(screen.getByLabelText('Marketing Department')).toBeInTheDocument();
    expect(screen.getByLabelText('Operacional Department')).toBeInTheDocument();
    expect(screen.getByLabelText('Comercial Department')).toBeInTheDocument();
  });

  it('displays department labels', () => {
    render(<CorporateHQ />);
    expect(screen.getByText('Financeiro')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Operacional')).toBeInTheDocument();
    expect(screen.getByText('Comercial')).toBeInTheDocument();
  });

  it('displays NPC roles', () => {
    render(<CorporateHQ />);
    expect(screen.getByText('CFO')).toBeInTheDocument();
    expect(screen.getByText('CMO')).toBeInTheDocument();
    expect(screen.getByText('COO')).toBeInTheDocument();
    expect(screen.getByText('CSO')).toBeInTheDocument();
  });

  it('displays hint text', () => {
    render(<CorporateHQ />);
    expect(screen.getByText('Click on a department to view its dashboard')).toBeInTheDocument();
  });

  it('opens modal when clicking a department', () => {
    render(<CorporateHQ />);

    const financeiroDept = screen.getByLabelText('Financeiro Department');
    fireEvent.click(financeiroDept);

    expect(screen.getByText('FINANCEIRO DASHBOARD')).toBeInTheDocument();
  });

  it('closes modal when clicking close button', () => {
    render(<CorporateHQ />);

    const financeiroDept = screen.getByLabelText('Financeiro Department');
    fireEvent.click(financeiroDept);

    expect(screen.getByText('FINANCEIRO DASHBOARD')).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(screen.queryByText('FINANCEIRO DASHBOARD')).not.toBeInTheDocument();
  });

  it('all departments are clickable', () => {
    render(<CorporateHQ />);

    const departments = ['Financeiro', 'Marketing', 'Operacional', 'Comercial'];

    for (const dept of departments) {
      const deptElement = screen.getByText(dept).closest('div[role="button"]');
      expect(deptElement).toBeInTheDocument();
    }
  });
});
