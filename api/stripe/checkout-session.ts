/**
 * POST /api/stripe/checkout-session
 * Creates a Stripe checkout session for payment
 * Simplified version without complex relative imports
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

// Price ID to amount mapping
const PRICE_MAP: Record<string, number> = {
  'price_1T1yllIZBkfjgy2X30qaXxQo': 9900,  // R$99 parcelado
  'price_1T1ym7IZBkfjgy2XXytc5SOt': 9900,  // R$99 mensal
  'price_1T1ymOIZBkfjgy2XPWFYJSGi': 34900, // R$349 parcelado
  'price_1T1ymeIZBkfjgy2XtLyCqyBE': 34900, // R$349 mensal
};

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
    const { priceId, email } = req.body || {};

    // Validate priceId
    if (!priceId) {
      return res.status(400).json({
        status: 'error',
        error: { code: 'VALIDATION_ERROR', message: 'Missing priceId' },
      });
    }

    // Validate price ID exists
    if (!PRICE_MAP[priceId]) {
      return res.status(400).json({
        status: 'error',
        error: { code: 'INVALID_PRICE', message: 'Invalid price ID' },
      });
    }

    // Create Stripe checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || 'https://spfp.vercel.app'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://spfp.vercel.app'}/checkout/cancel`,
      metadata: {
        source: 'landing_page',
        timestamp: new Date().toISOString(),
      },
    };

    // Add email if provided
    if (email) {
      sessionConfig.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return res.status(200).json({
      status: 'success',
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error: any) {
    console.error('Checkout session error:', error);

    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to create checkout session',
      },
    });
  }
}
