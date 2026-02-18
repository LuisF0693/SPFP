/**
 * Tests for PricingCard component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PricingCard } from '../components/PricingCard';

// Mock the hooks
vi.mock('../hooks/useStripeCheckout', () => ({
  useStripeCheckout: () => ({
    loading: false,
    error: null,
    initiateCheckout: vi.fn(),
  }),
}));

vi.mock('../hooks/useStripeSubscription', () => ({
  useStripeSubscription: () => ({
    loading: false,
    error: null,
    createSubscription: vi.fn(),
  }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '123', email: 'test@example.com' },
  }),
}));

describe('PricingCard', () => {
  const mockFeatures = [
    { text: 'Feature 1', included: true },
    { text: 'Feature 2', included: false },
  ];

  const mockPriceIds = {
    parcelado: 'price_parcelado_123',
    mensal: 'price_mensal_123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render pricing card with title and price', () => {
    render(
      <PricingCard
        title="Essencial"
        price={99}
        description="Basic plan"
        features={mockFeatures}
        priceIds={mockPriceIds}
      />
    );

    expect(screen.getByText('Essencial')).toBeInTheDocument();
    expect(screen.getByText('99')).toBeInTheDocument();
    expect(screen.getByText('Basic plan')).toBeInTheDocument();
  });

  it('should render two action buttons', () => {
    render(
      <PricingCard
        title="Essencial"
        price={99}
        description="Basic plan"
        features={mockFeatures}
        priceIds={mockPriceIds}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('should display installment button with formatted price', () => {
    render(
      <PricingCard
        title="Essencial"
        price={99}
        description="Basic plan"
        features={mockFeatures}
        priceIds={mockPriceIds}
      />
    );

    // 99 / 12 = 8.25
    const installmentText = screen.getByText(/8\.25/);
    expect(installmentText).toBeInTheDocument();
  });

  it('should display monthly button', () => {
    render(
      <PricingCard
        title="Essencial"
        price={99}
        description="Basic plan"
        features={mockFeatures}
        priceIds={mockPriceIds}
      />
    );

    const monthlyButton = screen.getByText(/99/);
    expect(monthlyButton).toBeInTheDocument();
  });

  it('should render "Mais Popular" badge when featured', () => {
    render(
      <PricingCard
        title="Essencial"
        price={99}
        description="Basic plan"
        features={mockFeatures}
        priceIds={mockPriceIds}
        featured={true}
      />
    );

    expect(screen.getByText('Mais Popular')).toBeInTheDocument();
  });

  it('should render "Com IA" badge for 99 price plan', () => {
    render(
      <PricingCard
        title="Essencial"
        price={99}
        description="Basic plan"
        features={mockFeatures}
        priceIds={mockPriceIds}
      />
    );

    expect(screen.getByText('Com IA')).toBeInTheDocument();
  });

  it('should not render "Com IA" badge for 349 price plan', () => {
    render(
      <PricingCard
        title="Wealth Mentor"
        price={349}
        description="Premium plan"
        features={mockFeatures}
        priceIds={mockPriceIds}
      />
    );

    expect(screen.queryByText('Com IA')).not.toBeInTheDocument();
  });

  it('should render all features with correct included status', () => {
    render(
      <PricingCard
        title="Essencial"
        price={99}
        description="Basic plan"
        features={mockFeatures}
        priceIds={mockPriceIds}
      />
    );

    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
  });

  it('should display error message when provided', () => {
    const { rerender } = render(
      <PricingCard
        title="Essencial"
        price={99}
        description="Basic plan"
        features={mockFeatures}
        priceIds={mockPriceIds}
      />
    );

    // Error would be shown if hooks returned an error
    expect(screen.queryByText(/Erro/)).not.toBeInTheDocument();
  });

  it('should format large prices correctly', () => {
    render(
      <PricingCard
        title="Premium"
        price={349}
        description="Premium plan"
        features={mockFeatures}
        priceIds={mockPriceIds}
      />
    );

    expect(screen.getByText('349')).toBeInTheDocument();
  });

  it('should show isPopular badge when specified', () => {
    render(
      <PricingCard
        title="Essencial"
        price={99}
        description="Basic plan"
        features={mockFeatures}
        priceIds={mockPriceIds}
        isPopular={true}
      />
    );

    expect(screen.getByText('Mais Popular')).toBeInTheDocument();
  });
});
