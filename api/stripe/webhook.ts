/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 *
 * Processes:
 * - payment_intent.succeeded (payment completed)
 * - customer.subscription.created (subscription created)
 * - customer.subscription.updated (subscription updated)
 * - customer.subscription.deleted (subscription cancelled)
 * - charge.refunded (refund processed)
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { Readable } from 'stream';
import { constructWebhookEvent } from '../services/stripe-service';
import {
  updateCheckoutSessionStatus,
  updateSubscriptionStatus,
  grantUserAccess,
  getCheckoutSession,
  getSubscription,
} from '../services/database-service';
import { sendWelcomeEmail } from '../services/email-service';
import { ApiResponse } from '../types';

/**
 * Read raw body for webhook signature validation
 */
async function getRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';

    if (req.method === 'POST') {
      req.on('data', (chunk: Buffer) => {
        data += chunk.toString('utf8');
      });

      req.on('end', () => {
        resolve(data);
      });

      req.on('error', reject);
    } else {
      resolve(JSON.stringify(req.body));
    }
  });
}

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

  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  if (!signature || !webhookSecret) {
    console.warn('Missing webhook secret or signature');
    return res.status(400).json({
      status: 'error',
      error: {
        code: 'MISSING_WEBHOOK_SECRET',
        message: 'Webhook configuration error',
      },
    });
  }

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);

    // Construct and validate webhook event
    const event = constructWebhookEvent(rawBody, signature as string, webhookSecret);

    if (!event) {
      console.warn('Invalid webhook signature');
      return res.status(401).json({
        status: 'error',
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Webhook signature verification failed',
        },
      });
    }

    console.log(`Processing webhook event: ${event.type}`);

    // Process different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response
    return res.status(200).json({
      status: 'success',
      message: `Webhook event ${event.type} processed successfully`,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);

    return res.status(500).json({
      status: 'error',
      error: {
        code: 'WEBHOOK_PROCESSING_ERROR',
        message: 'Failed to process webhook event',
      },
    });
  }
}

/**
 * Handle payment intent succeeded
 */
async function handlePaymentIntentSucceeded(event: any): Promise<void> {
  const paymentIntent = event.data.object;
  const metadata = paymentIntent.metadata || {};
  const userId = metadata.user_id;

  if (!userId) {
    console.warn('No user_id in payment intent metadata');
    return;
  }

  console.log(`Payment succeeded for user: ${userId}`);

  // Grant access to user
  const planType = metadata.plan_type || 'parcelado';
  const plan = metadata.plan || 99; // Default to essencial

  const accessGranted = await grantUserAccess(userId, Number(plan), planType);

  if (accessGranted) {
    console.log(`Access granted to user: ${userId}`);

    // Send welcome email
    const email = metadata.email || paymentIntent.receipt_email;
    if (email) {
      await sendWelcomeEmail({
        to: email,
        userName: metadata.user_name || 'Usuário',
        planName: plan === 349 ? 'Wealth' : 'Essencial',
        planAmount: paymentIntent.amount,
        planType,
      });
    }
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(event: any): Promise<void> {
  const session = event.data.object;
  const sessionId = session.id;
  const userId = session.client_reference_id;

  if (!userId) {
    console.warn('No client_reference_id in checkout session');
    return;
  }

  console.log(`Checkout session completed: ${sessionId} for user: ${userId}`);

  // Update session status in database
  const updated = await updateCheckoutSessionStatus(sessionId, 'complete');

  if (updated) {
    // Get session details to extract plan info
    const dbSession = await getCheckoutSession(sessionId);

    if (dbSession) {
      const planType = dbSession.plan_type || 'parcelado';
      const plan = dbSession.amount === 34900 ? 349 : 99;

      // Grant access to user
      const accessGranted = await grantUserAccess(userId, plan, planType);

      if (accessGranted) {
        console.log(`Access granted to user: ${userId}`);

        // Send welcome email
        if (session.customer_email) {
          await sendWelcomeEmail({
            to: session.customer_email,
            planName: plan === 349 ? 'Wealth' : 'Essencial',
            planAmount: dbSession.amount,
            planType,
          });
        }
      }
    }
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(event: any): Promise<void> {
  const subscription = event.data.object;
  const subscriptionId = subscription.id;
  const customerId = subscription.customer;
  const metadata = subscription.metadata || {};
  const userId = metadata.user_id;

  if (!userId) {
    console.warn('No user_id in subscription metadata');
    return;
  }

  console.log(`Subscription created: ${subscriptionId} for user: ${userId}`);

  // Grant access to user
  const planType = 'mensal'; // Subscriptions are always mensal
  const plan = 99; // Default plan

  const accessGranted = await grantUserAccess(userId, plan, planType);

  if (accessGranted) {
    console.log(`Access granted to user: ${userId}`);
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(event: any): Promise<void> {
  const subscription = event.data.object;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  console.log(`Subscription updated: ${subscriptionId} status: ${status}`);

  // Update subscription status
  await updateSubscriptionStatus(subscriptionId, status);
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(event: any): Promise<void> {
  const subscription = event.data.object;
  const subscriptionId = subscription.id;
  const metadata = subscription.metadata || {};
  const userId = metadata.user_id;

  console.log(`Subscription deleted: ${subscriptionId} for user: ${userId}`);

  // Update subscription status
  await updateSubscriptionStatus(subscriptionId, 'cancelled');
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(event: any): Promise<void> {
  const charge = event.data.object;
  const chargeId = charge.id;
  const metadata = charge.metadata || {};

  console.log(`Charge refunded: ${chargeId}`);
  // In a real application, you might want to:
  // 1. Update the session/subscription status
  // 2. Revoke user access if appropriate
  // 3. Send refund confirmation email
  console.log(`Refund metadata:`, metadata);
}

export default handler;
