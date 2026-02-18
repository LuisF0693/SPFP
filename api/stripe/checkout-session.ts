/**
 * POST /api/stripe/checkout-session
 * Creates a Stripe checkout session for payment
 *
 * Request:
 * {
 *   "priceId": "price_...",
 *   "planType": "parcelado" | "mensal",
 *   "metadata": { "source": "mobile", ... }
 * }
 *
 * Response:
 * {
 *   "status": "success",
 *   "data": {
 *     "sessionId": "cs_...",
 *     "url": "https://checkout.stripe.com/..."
 *   }
 * }
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { authMiddleware, sendAuthError, sendValidationError } from '../middleware/auth';
import { createCheckoutSession } from '../services/stripe-service';
import { saveCheckoutSession, getPlanAmountFromPriceId, getPlanTypeFromPriceId } from '../services/database-service';
import { ApiResponse, StripeCheckoutSessionRequest } from '../types';

async function handler(req: VercelRequest, res: VercelResponse<ApiResponse>) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST requests are allowed',
      },
    });
  }

  try {
    // Try to authenticate user (optional - allows guest checkout)
    const auth = await authMiddleware(req);

    // Validate request body
    const { priceId, metadata, email: requestEmail } = req.body as Partial<StripeCheckoutSessionRequest & { email?: string }>;

    if (!priceId) {
      return sendValidationError(res, 'Missing required field: priceId');
    }

    // Determine plan type from price ID or from request
    const planType = getPlanTypeFromPriceId(priceId);
    const planAmount = getPlanAmountFromPriceId(priceId);

    if (!planAmount) {
      return sendValidationError(res, 'Invalid price ID');
    }

    // Use authenticated user info or guest checkout
    const userEmail = auth?.email || requestEmail || undefined;
    const userId = auth?.userId || 'guest_' + Date.now();

    // Create checkout session with Stripe
    const sessionResult = await createCheckoutSession({
      priceId,
      email: userEmail || '',
      userId,
      planType,
      metadata,
    });

    if (!sessionResult.url) {
      return res.status(500).json({
        status: 'error',
        error: {
          code: 'CHECKOUT_CREATION_FAILED',
          message: 'Failed to create checkout session',
        },
      });
    }

    // Save session to database
    const saved = await saveCheckoutSession(
      auth.userId,
      sessionResult.sessionId,
      priceId,
      planAmount,
      'BRL',
      planType
    );

    if (!saved) {
      console.warn('Failed to save session to database, but checkout session was created');
    }

    // Return success response
    return res.status(200).json({
      status: 'success',
      data: {
        sessionId: sessionResult.sessionId,
        url: sessionResult.url,
      },
      message: 'Checkout session created successfully',
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);

    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create checkout session. Please try again.',
      },
    });
  }
}

export default handler;
