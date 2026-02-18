/**
 * useStripeCheckout Hook
 * Manages Stripe checkout session creation and redirection
 * Supports both parcelado (installment) and mensal (monthly) plans
 */

import { useState, useCallback } from 'react';
import { withErrorRecovery } from '../services/errorRecovery';
import { PlanType, StripeCheckoutResponse } from '../types/stripe';

export interface UseStripeCheckoutResult {
  loading: boolean;
  error: string | null;
  initiateCheckout: (priceId: string, planType: PlanType) => Promise<void>;
}

export const useStripeCheckout = (): UseStripeCheckoutResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateCheckout = useCallback(async (priceId: string, planType: PlanType) => {
    if (!priceId) {
      setError('ID do plano não configurado. Contate o suporte.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await withErrorRecovery(
        async () => {
          const res = await fetch('/api/stripe/checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              priceId,
              planType,
              metadata: {
                planType,
                timestamp: new Date().toISOString(),
              },
            }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
            throw new Error(errorData.message || `Erro ${res.status} ao criar sessão de checkout`);
          }

          return (await res.json()) as StripeCheckoutResponse;
        },
        `Criar sessão de checkout para ${planType}`,
        {
          maxRetries: 2,
          metadata: {
            priceId,
            planType,
          },
        }
      );

      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('URL de checkout não retornada do servidor');
      }
    } catch (err: any) {
      const message = err.userMessage || err.message || 'Erro ao processar pagamento. Tente novamente.';
      setError(message);
      console.error('Stripe checkout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    initiateCheckout,
  };
};
