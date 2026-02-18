/**
 * Tests for Stripe Checkout Session Endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../checkout-session';
import * as authMiddleware from '../../middleware/auth';
import * as stripeService from '../../services/stripe-service';
import * as dbService from '../../services/database-service';

describe('POST /api/stripe/checkout-session', () => {
  let mockReq: Partial<VercelRequest>;
  let mockRes: Partial<VercelResponse>;
  let statusCode: number;
  let responseBody: any;

  beforeEach(() => {
    statusCode = 200;
    responseBody = null;

    mockReq = {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
      },
      body: {
        priceId: 'price_1T1yllIZBkfjgy2X30qaXxQo',
      },
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn((data) => {
        responseBody = data;
        return mockRes;
      }),
    };

    // Mock auth middleware
    vi.spyOn(authMiddleware, 'authMiddleware').mockResolvedValue({
      userId: 'user123',
      email: 'test@example.com',
      isValid: true,
    });

    // Mock Stripe service
    vi.spyOn(stripeService, 'createCheckoutSession').mockResolvedValue({
      sessionId: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
      status: 'success',
    });

    // Mock database service
    vi.spyOn(dbService, 'saveCheckoutSession').mockResolvedValue(true);
    vi.spyOn(dbService, 'getPlanAmountFromPriceId').mockReturnValue(9900);
    vi.spyOn(dbService, 'getPlanTypeFromPriceId').mockReturnValue('parcelado');
  });

  it('should create checkout session successfully', async () => {
    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(responseBody.status).toBe('success');
    expect(responseBody.data.url).toBeDefined();
    expect(responseBody.data.sessionId).toBe('cs_test_123');
  });

  it('should return 401 if not authenticated', async () => {
    vi.spyOn(authMiddleware, 'authMiddleware').mockResolvedValue(null);

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(responseBody.status).toBe('error');
  });

  it('should return 400 if priceId is missing', async () => {
    mockReq.body = {};

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(responseBody.status).toBe('error');
  });

  it('should return 405 if method is not POST', async () => {
    mockReq.method = 'GET';

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(responseBody.error.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('should handle Stripe API errors gracefully', async () => {
    vi.spyOn(stripeService, 'createCheckoutSession').mockRejectedValue(
      new Error('Stripe API error')
    );

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(responseBody.status).toBe('error');
    expect(responseBody.error.code).toBe('INTERNAL_SERVER_ERROR');
  });

  it('should save session to database', async () => {
    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(dbService.saveCheckoutSession).toHaveBeenCalledWith(
      'user123',
      'cs_test_123',
      'price_1T1yllIZBkfjgy2X30qaXxQo',
      9900,
      'BRL',
      'parcelado'
    );
  });

  it('should include metadata if provided', async () => {
    mockReq.body = {
      priceId: 'price_1T1yllIZBkfjgy2X30qaXxQo',
      metadata: { source: 'mobile' },
    };

    await handler(mockReq as VercelRequest, mockRes as VercelResponse);

    expect(stripeService.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { source: 'mobile' },
      })
    );
  });
});
