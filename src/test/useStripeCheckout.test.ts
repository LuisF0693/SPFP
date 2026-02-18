/**
 * Tests for useStripeCheckout hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStripeCheckout } from '../hooks/useStripeCheckout';

// Mock fetch
global.fetch = vi.fn();

// Mock window.location.href
delete (window as any).location;
window.location = { href: '' } as any;

// Mock errorRecovery
vi.mock('../services/errorRecovery', () => ({
  withErrorRecovery: vi.fn(async (operation) => {
    return operation();
  }),
}));

describe('useStripeCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it('should initialize with loading false and no error', () => {
    const { result } = renderHook(() => useStripeCheckout());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set error when priceId is empty', async () => {
    const { result } = renderHook(() => useStripeCheckout());

    await act(async () => {
      await result.current.initiateCheckout('', 'parcelado');
    });

    expect(result.current.error).toBe('ID do plano não configurado. Contate o suporte.');
  });

  it('should call POST endpoint with correct parameters', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://checkout.stripe.com/test' }),
    });

    const { result } = renderHook(() => useStripeCheckout());
    const priceId = 'price_123';
    const planType = 'parcelado';

    await act(async () => {
      await result.current.initiateCheckout(priceId, planType);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/stripe/checkout-session',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining(priceId),
      })
    );
  });

  it('should redirect to Stripe URL on success', async () => {
    const stripeUrl = 'https://checkout.stripe.com/test';
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: stripeUrl }),
    });

    const { result } = renderHook(() => useStripeCheckout());

    await act(async () => {
      await result.current.initiateCheckout('price_123', 'mensal');
    });

    expect(window.location.href).toBe(stripeUrl);
  });

  it('should handle API error responses', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Price ID inválido' }),
    });

    const { result } = renderHook(() => useStripeCheckout());

    await act(async () => {
      await result.current.initiateCheckout('invalid_price', 'parcelado');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error).toContain('Price ID inválido');
  });

  it('should set loading state during request', async () => {
    (global.fetch as any).mockImplementationOnce(
      () => new Promise(resolve =>
        setTimeout(() =>
          resolve({
            ok: true,
            json: async () => ({ url: 'https://checkout.stripe.com/test' }),
          }), 100)
      )
    );

    const { result } = renderHook(() => useStripeCheckout());

    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.initiateCheckout('price_123', 'parcelado');
    });

    expect(result.current.loading).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 150));

    expect(result.current.loading).toBe(false);
  });

  it('should handle network errors', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useStripeCheckout());

    await act(async () => {
      await result.current.initiateCheckout('price_123', 'parcelado');
    });

    expect(result.current.error).toBeTruthy();
  });
});
