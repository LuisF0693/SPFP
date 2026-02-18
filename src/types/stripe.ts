/**
 * Stripe Payment Types
 * Types for checkout sessions, subscriptions, and payment handling
 */

export type PlanType = 'parcelado' | 'mensal';

export type PricingPlan = 'essencial' | 'estrategico' | 'wealth';

export interface PricingPlanConfig {
  id: PricingPlan;
  priceAmount: number;
  currency: string;
  priceIds: {
    parcelado: string;
    mensal: string;
  };
}

export interface CheckoutSession {
  id: string;
  url: string;
  clientSecret?: string;
  status: 'open' | 'expired' | 'complete';
}

export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  priceId: string;
  status: 'active' | 'past_due' | 'cancelled';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd?: boolean;
}

export interface StripeCheckoutRequest {
  priceId: string;
  planType: PlanType;
  email?: string;
  metadata?: Record<string, string>;
}

export interface StripeSubscriptionRequest {
  priceId: string;
  email?: string;
  metadata?: Record<string, string>;
}

/**
 * Plan pricing configuration
 */
export const PRICING_PLANS: Record<number, PricingPlanConfig> = {
  99: {
    id: 'essencial',
    priceAmount: 99,
    currency: 'BRL',
    priceIds: {
      parcelado: process.env.VITE_STRIPE_PRICE_99_PARCELADO || '',
      mensal: process.env.VITE_STRIPE_PRICE_99_MENSAL || ''
    }
  },
  349: {
    id: 'wealth',
    priceAmount: 349,
    currency: 'BRL',
    priceIds: {
      parcelado: process.env.VITE_STRIPE_PRICE_349_PARCELADO || '',
      mensal: process.env.VITE_STRIPE_PRICE_349_MENSAL || ''
    }
  }
};
