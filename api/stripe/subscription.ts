/**
 * POST /api/stripe/subscription
 * Creates or retrieves a Stripe subscription
 *
 * Request:
 * {
 *   "priceId": "price_...",
 *   "metadata": { ... }
 * }
 *
 * Response:
 * {
 *   "status": "success",
 *   "data": {
 *     "subscriptionId": "sub_...",
 *     "customerId": "cus_...",
 *     "status": "active"
 *   }
 * }
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { authMiddleware, sendAuthError, sendValidationError } from '../middleware/auth';
import { createSubscription } from '../services/stripe-service';
import {
  saveSubscription,
  getUserActiveSubscription,
  getPlanAmountFromPriceId,
} from '../services/database-service';
import { ApiResponse, StripeSubscriptionRequest } from '../types';

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
    // Authenticate user
    const auth = await authMiddleware(req);
    if (!auth) {
      return sendAuthError(res, 'Missing or invalid authentication token');
    }

    // Validate request body
    const { priceId, metadata } = req.body as Partial<StripeSubscriptionRequest>;

    if (!priceId) {
      return sendValidationError(res, 'Missing required field: priceId');
    }

    // Check if user already has an active subscription
    const activeSubscription = await getUserActiveSubscription(auth.userId);
    if (activeSubscription) {
      return res.status(400).json({
        status: 'error',
        error: {
          code: 'SUBSCRIPTION_ALREADY_EXISTS',
          message: 'User already has an active subscription',
          details: {
            subscriptionId: activeSubscription.subscription_id,
          },
        },
      });
    }

    // Create subscription with Stripe
    const subscriptionResult = await createSubscription({
      priceId,
      email: auth.email,
      userId: auth.userId,
      metadata,
    });

    if (!subscriptionResult.subscriptionId) {
      return res.status(500).json({
        status: 'error',
        error: {
          code: 'SUBSCRIPTION_CREATION_FAILED',
          message: 'Failed to create subscription',
        },
      });
    }

    // Save subscription to database
    const saved = await saveSubscription(
      auth.userId,
      subscriptionResult.subscriptionId,
      subscriptionResult.customerId,
      priceId,
      subscriptionResult.status as 'active' | 'past_due' | 'cancelled'
    );

    if (!saved) {
      console.warn('Failed to save subscription to database, but Stripe subscription was created');
    }

    // Return success response
    return res.status(200).json({
      status: 'success',
      data: {
        subscriptionId: subscriptionResult.subscriptionId,
        customerId: subscriptionResult.customerId,
        status: subscriptionResult.status,
      },
      message: 'Subscription created successfully',
    });
  } catch (error) {
    console.error('Error creating subscription:', error);

    return res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create subscription. Please try again.',
      },
    });
  }
}

export default handler;
