/**
 * useStripeSubscription Hook
 * Manages Stripe subscription creation and management
 * Handles monthly recurring subscriptions
 */

import { useState, useCallback } from 'react';
import { withErrorRecovery } from '../services/errorRecovery';
import { useAuth } from '../context/AuthContext';

export interface UseStripeSubscriptionResult {
  loading: boolean;
  error: string | null;
  createSubscription: (priceId: string) => Promise<void>;
}

export const useStripeSubscription = (): UseStripeSubscriptionResult => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubscription = useCallback(async (priceId: string) => {
    if (!priceId) {
      setError('ID do plano não configurado. Contate o suporte.');
      return;
    }

    if (!user?.email) {
      setError('É necessário estar conectado para criar uma assinatura.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await withErrorRecovery(
        async () => {
          const res = await fetch('/api/stripe/subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              priceId,
              email: user.email,
              userId: user.id,
              metadata: {
                planType: 'mensal',
                timestamp: new Date().toISOString(),
              },
            }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
            throw new Error(errorData.message || `Erro ${res.status} ao criar assinatura`);
          }

          const data = await res.json();
          return data;
        },
        'Criar assinatura mensal Stripe',
        {
          maxRetries: 2,
          metadata: {
            priceId,
            userId: user.id,
          },
        }
      );

      // Redirecionar para Stripe Checkout
      const checkoutUrl = response.data?.url || response.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('URL de checkout não retornada do servidor');
      }
    } catch (err: any) {
      const message = err.userMessage || err.message || 'Erro ao criar assinatura. Tente novamente.';
      setError(message);
      console.error('Stripe subscription error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    createSubscription,
  };
};
