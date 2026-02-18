/**
 * POST /api/stripe/subscription
 * Creates a Stripe checkout session for subscription (recurring payment)
 * Simplified version without complex relative imports
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST requests allowed' },
    });
  }

  try {
    const { priceId, email, userId } = req.body || {};

    // Validate required fields
    if (!priceId) {
      return res.status(400).json({
        status: 'error',
        error: { code: 'VALIDATION_ERROR', message: 'Missing priceId' },
      });
    }

    if (!email) {
      return res.status(400).json({
        status: 'error',
        error: { code: 'VALIDATION_ERROR', message: 'Missing email - login required for subscriptions' },
      });
    }

    // Create Stripe checkout session for subscription
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      client_reference_id: userId || email,
      success_url: `${process.env.FRONTEND_URL || 'https://spfp.vercel.app'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://spfp.vercel.app'}/checkout/cancel`,
      metadata: {
        user_id: userId || '',
        source: 'landing_page',
        plan_type: 'mensal',
        timestamp: new Date().toISOString(),
      },
      subscription_data: {
        metadata: {
          user_id: userId || '',
        },
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return res.status(200).json({
      status: 'success',
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error: any) {
    console.error('Subscription error:', error);

    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to create subscription session',
      },
    });
  }
}
