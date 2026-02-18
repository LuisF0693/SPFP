/**
 * Tests for Stripe Webhook Endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../webhook';
import * as stripeService from '../../services/stripe-service';
import * as dbService from '../../services/database-service';
import * as emailService from '../../services/email-service';

describe('POST /api/stripe/webhook', () => {
  let mockReq: Partial<VercelRequest>;
  let mockRes: Partial<VercelResponse>;
  let responseBody: any;

  beforeEach(() => {
    responseBody = null;

    mockReq = {
      method: 'POST',
      headers: {
        'stripe-signature': 'test-signature',
      },
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn((data) => {
        responseBody = data;
        return mockRes;
      }),
      on: vi.fn(),
    };

    // Mock Stripe webhook construction
    vi.spyOn(stripeService, 'constructWebhookEvent').mockReturnValue({
      id: 'evt_test',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          metadata: {
            user_id: 'user123',
            plan_type: 'parcelado',
            plan: '99',
          },
          amount: 9900,
          receipt_email: 'test@example.com',
        },
      },
    });

    // Mock database services
    vi.spyOn(dbService, 'updateCheckoutSessionStatus').mockResolvedValue(true);
    vi.spyOn(dbService, 'updateSubscriptionStatus').mockResolvedValue(true);
    vi.spyOn(dbService, 'grantUserAccess').mockResolvedValue(true);
    vi.spyOn(dbService, 'getCheckoutSession').mockResolvedValue({
      id: 'session1',
      user_id: 'user123',
      session_id: 'cs_test',
      price_id: 'price_test',
      status: 'open',
      amount: 9900,
      currency: 'BRL',
      plan_type: 'parcelado',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Mock email service
    vi.spyOn(emailService, 'sendWelcomeEmail').mockResolvedValue(true);
  });

  it('should return 405 if method is not POST', async () => {
    mockReq.method = 'GET';

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(responseBody.error.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('should return 400 if webhook secret is missing', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = '';
    vi.spyOn(stripeService, 'constructWebhookEvent').mockReturnValue(null);

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should return 401 if signature is invalid', async () => {
    vi.spyOn(stripeService, 'constructWebhookEvent').mockReturnValue(null);

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(responseBody.error.code).toBe('INVALID_SIGNATURE');
  });

  it('should process payment_intent.succeeded event', async () => {
    // Mock the request.on method to emit data event
    const dataCallback: any = { callback: null };
    mockReq.on = vi.fn((event, callback) => {
      if (event === 'data') {
        dataCallback.callback = callback;
        callback(Buffer.from('{"test": "body"}'));
      } else if (event === 'end') {
        callback();
      }
      return mockReq;
    });

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(dbService.grantUserAccess).toHaveBeenCalledWith('user123', 99, 'parcelado');
    expect(emailService.sendWelcomeEmail).toHaveBeenCalled();
  });

  it('should process checkout.session.completed event', async () => {
    vi.spyOn(stripeService, 'constructWebhookEvent').mockReturnValue({
      id: 'evt_test',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          client_reference_id: 'user123',
          customer_email: 'test@example.com',
        },
      },
    });

    mockReq.on = vi.fn((event, callback) => {
      if (event === 'end') {
        callback();
      }
      return mockReq;
    });

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(dbService.updateCheckoutSessionStatus).toHaveBeenCalledWith('cs_test_123', 'complete');
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should process customer.subscription.created event', async () => {
    vi.spyOn(stripeService, 'constructWebhookEvent').mockReturnValue({
      id: 'evt_test',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test_123',
          customer: 'cus_test',
          metadata: {
            user_id: 'user123',
          },
          status: 'active',
        },
      },
    });

    mockReq.on = vi.fn((event, callback) => {
      if (event === 'end') {
        callback();
      }
      return mockReq;
    });

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(dbService.grantUserAccess).toHaveBeenCalledWith('user123', 99, 'mensal');
  });

  it('should return 200 on successful webhook processing', async () => {
    mockReq.on = vi.fn((event, callback) => {
      if (event === 'end') {
        callback();
      }
      return mockReq;
    });

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(responseBody.status).toBe('success');
  });

  it('should handle events with no user_id gracefully', async () => {
    vi.spyOn(stripeService, 'constructWebhookEvent').mockReturnValue({
      id: 'evt_test',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          metadata: {},
          amount: 9900,
        },
      },
    });

    mockReq.on = vi.fn((event, callback) => {
      if (event === 'end') {
        callback();
      }
      return mockReq;
    });

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(dbService.grantUserAccess).not.toHaveBeenCalled();
  });
});
