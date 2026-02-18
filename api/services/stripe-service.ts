/**
 * Stripe Service
 * Handles all Stripe API interactions with error recovery
 */

import Stripe from 'stripe';
import { withErrorRecovery } from '../../src/services/errorRecovery';
import { StripeCheckoutSessionResponse, StripeSubscriptionResponse } from '../types';

// Initialize Stripe client
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

if (!STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY not found in environment variables');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

interface CheckoutSessionOptions {
  priceId: string;
  email: string;
  userId: string;
  metadata?: Record<string, string>;
  planType?: 'parcelado' | 'mensal';
}

interface SubscriptionOptions {
  priceId: string;
  email: string;
  userId: string;
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe checkout session
 * Supports one-time payments and installments
 */
export async function createCheckoutSession(
  options: CheckoutSessionOptions
): Promise<StripeCheckoutSessionResponse> {
  const { priceId, email, userId, metadata = {}, planType = 'parcelado' } = options;

  try {
    const session = await withErrorRecovery(
      async () => {
        const sessionConfig: any = {
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          client_reference_id: userId,
          success_url: `${process.env.FRONTEND_URL || 'https://spfp.vercel.app'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL || 'https://spfp.vercel.app'}/checkout/cancel`,
          payment_intent_data: {
            metadata: {
              user_id: userId,
              plan_type: planType,
              ...metadata,
            },
          },
          metadata: {
            user_id: userId,
            plan_type: planType,
            ...metadata,
          },
        };

        // Only add customer_email if provided (allows Stripe to collect it)
        if (email) {
          sessionConfig.customer_email = email;
        }

        return await stripe.checkout.sessions.create(sessionConfig);
      },
      'Create Stripe checkout session',
      {
        maxRetries: 3,
        userId,
        metadata: { priceId, email, planType },
      }
    );

    return {
      sessionId: session.id,
      url: session.url || '',
      status: 'success',
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create or get Stripe customer
 */
export async function getOrCreateCustomer(
  email: string,
  userId: string
): Promise<string> {
  try {
    // Search for existing customer
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      return customers.data[0].id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        user_id: userId,
      },
    });

    return customer.id;
  } catch (error) {
    console.error('Error getting or creating customer:', error);
    throw error;
  }
}

/**
 * Create a subscription
 */
export async function createSubscription(
  options: SubscriptionOptions
): Promise<StripeSubscriptionResponse> {
  const { priceId, email, userId, metadata = {} } = options;

  try {
    const customerId = await getOrCreateCustomer(email, userId);

    const subscription = await withErrorRecovery(
      async () => {
        return await stripe.subscriptions.create({
          customer: customerId,
          items: [
            {
              price: priceId,
            },
          ],
          metadata: {
            user_id: userId,
            ...metadata,
          },
          payment_behavior: 'default_incomplete',
          payment_settings: {
            payment_method_types: ['card'],
          },
        });
      },
      'Create Stripe subscription',
      {
        maxRetries: 3,
        userId,
        metadata: { priceId, email },
      }
    );

    return {
      subscriptionId: subscription.id,
      customerId,
      status: subscription.status as 'active' | 'pending' | 'error',
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Retrieve checkout session details
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return null;
  }
}

/**
 * Retrieve subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return null;
  }
}

/**
 * Validate webhook signature
 */
export function validateWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    return event && event.id ? true : false;
  } catch (error) {
    console.error('Webhook signature validation failed:', error);
    return false;
  }
}

/**
 * Construct webhook event safely
 */
export function constructWebhookEvent(body: string, signature: string, secret: string) {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error('Error constructing webhook event:', error);
    return null;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const result = await stripe.subscriptions.del(subscriptionId);
    return result.status === 'canceled';
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
}

export default {
  createCheckoutSession,
  createSubscription,
  getCheckoutSession,
  getSubscription,
  validateWebhookSignature,
  constructWebhookEvent,
  cancelSubscription,
  getOrCreateCustomer,
};
