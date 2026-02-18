# Padrões de Código - Integração Stripe

**Referência Rápida**: Trechos reutilizáveis e patterns para implementação

---

## 1. TYPES & INTERFACES (TypeScript)

```typescript
// src/types/stripe.ts

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  planId: 'lite' | 'premium' | 'lite_sub' | 'premium_sub';
  type: 'payment' | 'subscription';
  price: number; // em reais
  currency: 'brl';
  stripePriceId: string;
  features: string[];
  highlighted?: boolean;
}

export interface CheckoutSession {
  id: string;
  sessionId: string;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  planId: string;
  amount: number;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface StripeSubscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  planId: 'lite_sub' | 'premium_sub';
  status: 'active' | 'past_due' | 'unpaid' | 'canceled';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAt?: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAccess {
  id: string;
  userId: string;
  accessType: 'lite' | 'premium' | 'none';
  accessGrantedAt: Date;
  accessExpiresAt?: Date; // null = infinito (subscription)
  source: 'stripe_payment' | 'stripe_subscription' | 'admin_grant' | 'trial';
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

export interface SubscriptionResponse {
  clientSecret?: string;
  subscriptionId: string;
  requiresAction: boolean;
  status: 'active' | 'incomplete';
}
```

---

## 2. FRONTEND: Hook para Checkout

```typescript
// src/hooks/useStripeCheckout.ts

import { useState } from 'react';
import { withErrorRecovery } from '../services/errorRecovery';
import { useAuth } from '../context/AuthContext';

interface UseStripeCheckoutOptions {
  planId: 'lite' | 'premium';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useStripeCheckout = (options: UseStripeCheckoutOptions) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initiateCheckout = async () => {
    if (!user) {
      setError(new Error('Usuário não autenticado'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await withErrorRecovery(
        async () => {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/stripe/checkout-session`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.id}` // JWT em produção
              },
              body: JSON.stringify({ planId: options.planId })
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          return response.json() as Promise<{ url: string; sessionId: string }>;
        },
        `Iniciar checkout para plano ${options.planId}`,
        {
          maxRetries: 2,
          userId: user.id,
          metadata: { planId: options.planId }
        }
      );

      // Redireciona para Stripe Checkout
      window.location.href = result.url;
      options.onSuccess?.();
    } catch (err: any) {
      const error = new Error(err.userMessage || 'Erro ao iniciar checkout');
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    initiateCheckout,
    loading,
    error
  };
};
```

---

## 3. FRONTEND: Verificação de Status Pós-Checkout

```typescript
// src/pages/CheckoutSuccess.tsx

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Loading from '../components/ui/Loading';

export const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('Session ID não encontrado');
      return;
    }

    verifySession(sessionId);
  }, [sessionId]);

  const verifySession = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/stripe/session-status/${id}`
      );

      if (!response.ok) {
        throw new Error('Falha ao verificar sessão');
      }

      const { status: paymentStatus, accessGranted } = await response.json();

      if (paymentStatus === 'complete' && accessGranted) {
        setStatus('success');
        setMessage('Pagamento confirmado! Seu acesso foi ativado.');

        // Redireciona para dashboard após 3s
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        setStatus('error');
        setMessage('Pagamento não confirmado. Tente novamente.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Erro ao verificar pagamento');
    }
  };

  if (status === 'loading') return <Loading />;

  return (
    <div className="container mx-auto px-6 py-24 text-center">
      {status === 'success' ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-green-400 mb-4">Sucesso!</h1>
          <p className="text-gray-300 mb-6">{message}</p>
          <p className="text-gray-500 text-sm">Redirecionando para o dashboard...</p>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Erro</h1>
          <p className="text-gray-300 mb-6">{message}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-bold"
          >
            Voltar para Home
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 4. FRONTEND: Componente de Pricing Card

```typescript
// src/components/PricingCard.tsx

import React from 'react';
import { Check, Zap } from 'lucide-react';
import { StripeProduct } from '../types/stripe';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { useAuth } from '../context/AuthContext';

interface PricingCardProps {
  product: StripeProduct;
  onSelectSuccess?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ product, onSelectSuccess }) => {
  const { user } = useAuth();
  const { initiateCheckout, loading, error } = useStripeCheckout({
    planId: product.planId as 'lite' | 'premium',
    onSuccess: onSelectSuccess
  });

  const handleClick = async () => {
    if (!user) {
      // Redireciona para login se não autenticado
      window.location.href = '/login';
      return;
    }

    await initiateCheckout();
  };

  const isSubscription = product.type === 'subscription';
  const buttonLabel = isSubscription
    ? `Assinar agora - R$ ${product.price.toFixed(2)}/mês`
    : `Comprar agora - R$ ${product.price.toFixed(2)}`;

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-300 overflow-hidden group
        ${product.highlighted
          ? 'border-blue-500/50 bg-blue-500/5 ring-2 ring-blue-500/20 scale-105'
          : 'border-white/10 bg-white/[0.02] hover:border-blue-500/30'
        }
      `}
    >
      {/* Gradiente background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/5 group-hover:to-blue-600/5 transition-all duration-300" />

      {/* Badge POPULAR */}
      {product.highlighted && (
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
            MAIS POPULAR
          </div>
        </div>
      )}

      <div className="relative p-8 z-10">
        {/* Ícone & Título */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
            <Zap size={24} className="text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
          <p className="text-gray-400 text-sm">{product.description}</p>
        </div>

        {/* Preço */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              R$ {product.price.toFixed(2)}
            </span>
            {isSubscription && <span className="text-gray-400 text-sm">/mês</span>}
          </div>
          {!isSubscription && (
            <p className="text-gray-500 text-xs mt-2">Acesso permanente</p>
          )}
        </div>

        {/* Botão */}
        <button
          onClick={handleClick}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold transition-all duration-300 mb-6
            ${product.highlighted
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10'
            }
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {loading ? 'Processando...' : buttonLabel}
        </button>

        {error && (
          <p className="text-red-400 text-sm mb-4">{error.message}</p>
        )}

        {/* Features */}
        <div className="border-t border-white/5 pt-6 space-y-4">
          {product.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300 text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## 5. BACKEND: Stripe Service

```typescript
// backend/src/services/stripeService.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
});

export const stripeService = {
  /**
   * Cria uma sessão de checkout para pagamento único
   */
  async createCheckoutSession(params: {
    priceId: string;
    userId: string;
    customerEmail: string;
    mode: 'payment' | 'subscription';
    successUrl: string;
    cancelUrl: string;
  }) {
    return await stripe.checkout.sessions.create({
      mode: params.mode,
      customer_email: params.customerEmail,
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      allow_promotion_codes: true,
      metadata: {
        userId: params.userId,
      },
      // Para pagamentos: parcelamento (configurado no Product do Stripe)
      payment_intent_data: params.mode === 'payment' ? {
        metadata: {
          userId: params.userId,
        }
      } : undefined,
    });
  },

  /**
   * Recupera status de uma sessão de checkout
   */
  async getSessionStatus(sessionId: string) {
    return await stripe.checkout.sessions.retrieve(sessionId);
  },

  /**
   * Cria ou obtém um customer do Stripe
   */
  async getOrCreateCustomer(email: string, userId: string) {
    // Procura customer existente
    const customers = await stripe.customers.search({
      query: `email:"${email}"`,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    }

    // Cria novo
    return await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });
  },

  /**
   * Cria uma assinatura recorrente
   */
  async createSubscription(params: {
    customerId: string;
    priceId: string;
    userId: string;
  }) {
    return await stripe.subscriptions.create({
      customer: params.customerId,
      items: [
        {
          price: params.priceId,
        },
      ],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: params.userId,
      },
    });
  },

  /**
   * Cancela uma assinatura
   */
  async cancelSubscription(subscriptionId: string, immediate = false) {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !immediate,
    });
  },

  /**
   * Valida assinatura de webhook
   */
  constructWebhookEvent(body: Buffer, signature: string, secret: string) {
    return stripe.webhooks.constructEvent(body, signature, secret);
  },
};
```

---

## 6. BACKEND: Endpoints (Express)

```typescript
// backend/src/routes/stripe.ts

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { verifyWebhookSignature } from '../middleware/verifyStripeWebhook';
import { stripeService } from '../services/stripeService';
import { stripeController } from '../controllers/stripeController';

const router = Router();

/**
 * POST /api/stripe/checkout-session
 * Cria uma sessão de checkout para pagamento único
 */
router.post(
  '/checkout-session',
  authMiddleware,
  stripeController.createCheckoutSession
);

/**
 * GET /api/stripe/session-status/:sessionId
 * Verifica status de uma sessão de checkout
 */
router.get(
  '/session-status/:sessionId',
  authMiddleware,
  stripeController.getSessionStatus
);

/**
 * POST /api/stripe/subscription
 * Cria uma assinatura recorrente
 */
router.post(
  '/subscription',
  authMiddleware,
  stripeController.createSubscription
);

/**
 * GET /api/stripe/subscription
 * Recupera dados da assinatura do usuário
 */
router.get(
  '/subscription',
  authMiddleware,
  stripeController.getSubscription
);

/**
 * POST /api/stripe/cancel-subscription
 * Cancela a assinatura do usuário
 */
router.post(
  '/cancel-subscription',
  authMiddleware,
  stripeController.cancelSubscription
);

/**
 * POST /api/stripe/webhook
 * Webhook endpoint do Stripe
 * ⚠️ NÃO usa authMiddleware - validado via assinatura
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  verifyWebhookSignature,
  stripeController.handleWebhook
);

export default router;
```

---

## 7. BACKEND: Controller

```typescript
// backend/src/controllers/stripeController.ts

import { Request, Response } from 'express';
import { stripeService } from '../services/stripeService';
import { supabase } from '../db/supabase';
import { logger } from '../utils/logger';

export const stripeController = {
  /**
   * POST /api/stripe/checkout-session
   */
  async createCheckoutSession(req: Request, res: Response) {
    try {
      const { planId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Mapear planId para priceId do Stripe
      const priceMap: Record<string, string> = {
        lite: process.env.STRIPE_PRICE_LITE_ONETIME!,
        premium: process.env.STRIPE_PRICE_PREMIUM_ONETIME!,
      };

      const priceId = priceMap[planId];
      if (!priceId) {
        return res.status(400).json({ error: 'Invalid plan' });
      }

      // Buscar email do usuário
      const { data: user } = await supabase.auth.admin.getUserById(userId);
      if (!user?.email) {
        return res.status(400).json({ error: 'User email not found' });
      }

      const baseUrl = process.env.APP_URL || 'http://localhost:3000';

      const session = await stripeService.createCheckoutSession({
        priceId,
        userId,
        customerEmail: user.email,
        mode: 'payment',
        successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/checkout/cancel`,
      });

      // Salvar sessão no Supabase
      const { error: dbError } = await supabase
        .from('stripe_sessions')
        .insert({
          user_id: userId,
          session_id: session.id,
          plan_id: planId,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency,
          status: 'pending',
        });

      if (dbError) {
        logger.error('Failed to save session', { dbError, sessionId: session.id });
      }

      res.json({
        url: session.url,
        sessionId: session.id,
      });
    } catch (error: any) {
      logger.error('Checkout session error', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * GET /api/stripe/session-status/:sessionId
   */
  async getSessionStatus(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      const session = await stripeService.getSessionStatus(sessionId);

      // Verificar se a sessão pertence ao usuário
      if (session.metadata?.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json({
        status: session.payment_status, // 'paid' | 'unpaid' | 'no_payment_required'
        accessGranted: session.payment_status === 'paid',
        planId: session.metadata?.planId,
      });
    } catch (error: any) {
      logger.error('Get session status error', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * POST /api/stripe/subscription
   */
  async createSubscription(req: Request, res: Response) {
    try {
      const { planId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const priceMap: Record<string, string> = {
        lite_sub: process.env.STRIPE_PRICE_LITE_MONTHLY!,
        premium_sub: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
      };

      const priceId = priceMap[planId];
      if (!priceId) {
        return res.status(400).json({ error: 'Invalid plan' });
      }

      const { data: user } = await supabase.auth.admin.getUserById(userId);
      if (!user?.email) {
        return res.status(400).json({ error: 'User email not found' });
      }

      // Obter ou criar customer
      const customer = await stripeService.getOrCreateCustomer(user.email, userId);

      // Criar subscription
      const subscription = await stripeService.createSubscription({
        customerId: customer.id,
        priceId,
        userId,
      });

      const paymentIntent = (subscription.latest_invoice as any)?.payment_intent;
      const requiresAction = paymentIntent?.status === 'requires_action';

      res.json({
        clientSecret: paymentIntent?.client_secret,
        subscriptionId: subscription.id,
        requiresAction,
        status: subscription.status,
      });
    } catch (error: any) {
      logger.error('Create subscription error', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * POST /api/stripe/webhook
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const event = req.body; // Já foi validado por middleware

      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionEvent(event);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event);
          break;

        default:
          logger.info('Unhandled event type', { eventType: event.type });
      }

      res.json({ received: true });
    } catch (error: any) {
      logger.error('Webhook error', error);
      res.status(500).json({ error: error.message });
    }
  },
};

/**
 * Handlers de eventos webhook
 */
async function handlePaymentIntentSucceeded(event: any) {
  const paymentIntent = event.data.object;
  const userId = paymentIntent.metadata?.userId;

  if (!userId) return;

  // Atualizar status da sessão
  await supabase
    .from('stripe_sessions')
    .update({ status: 'completed' })
    .eq('session_id', paymentIntent.charges.data[0]?.receipt_url);

  // Ativar acesso do usuário
  await supabase
    .from('user_access')
    .upsert({
      user_id: userId,
      access_type: 'lite', // Será definido pelo planId em production
      access_granted_at: new Date(),
      access_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      source: 'stripe_payment',
    }, { onConflict: 'user_id' });

  logger.info('Payment succeeded', { userId, paymentIntentId: paymentIntent.id });
}

async function handleSubscriptionEvent(event: any) {
  const subscription = event.data.object;
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  await supabase
    .from('stripe_subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      plan_id: subscription.metadata?.planId || 'lite_sub',
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
    }, { onConflict: 'user_id' });

  // Ativar acesso
  if (subscription.status === 'active') {
    await supabase
      .from('user_access')
      .upsert({
        user_id: userId,
        access_type: 'lite', // Obter do planId
        access_granted_at: new Date(),
        access_expires_at: null, // Infinito para subscriptions
        source: 'stripe_subscription',
      }, { onConflict: 'user_id' });
  }

  logger.info('Subscription event processed', { userId, subscriptionId: subscription.id, status: subscription.status });
}

async function handleSubscriptionDeleted(event: any) {
  const subscription = event.data.object;
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  // Atualizar status
  await supabase
    .from('stripe_subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  // Revogar acesso
  await supabase
    .from('user_access')
    .update({ access_type: 'none' })
    .eq('user_id', userId);

  logger.info('Subscription deleted', { userId, subscriptionId: subscription.id });
}
```

---

## 8. MIDDLEWARE: Validação de Webhook

```typescript
// backend/src/middleware/verifyStripeWebhook.ts

import { Request, Response, NextFunction } from 'express';
import { stripeService } from '../services/stripeService';

export const verifyWebhookSignature = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'Missing signature' });
  }

  try {
    const event = stripeService.constructWebhookEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Adiciona evento ao request
    (req as any).body = event;
    next();
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }
};
```

---

## 9. CONTEXT: Integração com FinanceContext

```typescript
// src/context/FinanceContext.tsx - Extensão

// Adicionar ao interface GlobalState:
interface GlobalState {
  // ... existente ...
  currentPlan: 'lite' | 'premium' | 'none';
  isSubscribed: boolean;
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | null;
  accessGrantedAt?: Date;
  accessExpiresAt?: Date;
}

// Adicionar function:
export const checkUserAccess = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_access')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return { accessType: 'none', isActive: false };
  }

  const now = new Date();
  const isActive = data.access_type !== 'none' &&
    (!data.access_expires_at || new Date(data.access_expires_at) > now);

  return {
    accessType: data.access_type,
    isActive,
    accessGrantedAt: data.access_granted_at,
    accessExpiresAt: data.access_expires_at,
  };
};

// No efeito de inicialização:
useEffect(() => {
  if (user?.id) {
    checkUserAccess(user.id).then(access => {
      setGlobalState(prev => ({
        ...prev,
        currentPlan: access.accessType,
        accessGrantedAt: access.accessGrantedAt,
        accessExpiresAt: access.accessExpiresAt,
      }));
    });
  }
}, [user?.id]);
```

---

## 10. TESTES: Exemplo com Vitest

```typescript
// src/services/__tests__/stripeService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';

describe('useStripeCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initiate checkout successfully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        url: 'https://checkout.stripe.com/XXX',
        sessionId: 'cs_test_XXX',
      }),
    });

    global.fetch = mockFetch;

    // Test implementation here
  });

  it('should handle checkout error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    global.fetch = mockFetch;

    // Test error handling
  });
});
```

---

## Resumo de Padrões

✅ **Padrões Aplicados do SPFP:**
- Error recovery com `withErrorRecovery()`
- Autenticação via AuthContext
- Supabase real-time com RLS
- Estrutura de services e hooks
- Logging estruturado

✅ **Padrões Novos:**
- Stripe API integration
- Webhook validation
- Subscription state management
- Payment status verification

---
