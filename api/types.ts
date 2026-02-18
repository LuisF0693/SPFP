/**
 * Stripe API Backend Types
 * Types for serverless functions and backend operations
 */

export interface StripeCheckoutSessionRequest {
  priceId: string;
  userId: string;
  email: string;
  planType?: 'parcelado' | 'mensal';
  metadata?: Record<string, string>;
}

export interface StripeCheckoutSessionResponse {
  sessionId: string;
  url: string;
  status: 'success' | 'error';
  message?: string;
}

export interface StripeSubscriptionRequest {
  priceId: string;
  userId: string;
  email: string;
  metadata?: Record<string, string>;
}

export interface StripeSubscriptionResponse {
  subscriptionId: string;
  customerId: string;
  status: 'active' | 'pending' | 'error';
  message?: string;
}

export interface StripeWebhookEvent {
  id: string;
  object: string;
  type: string;
  data: {
    object: any;
  };
}

export interface StripeSession {
  id: string;
  user_id: string;
  session_id: string;
  price_id: string;
  status: 'open' | 'expired' | 'complete';
  amount: number;
  currency: string;
  plan_type: 'parcelado' | 'mensal';
  created_at: string;
  updated_at: string;
}

export interface StripeSubscriptionDB {
  id: string;
  user_id: string;
  subscription_id: string;
  price_id: string;
  status: 'active' | 'past_due' | 'cancelled';
  customer_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserAccess {
  id: string;
  user_id: string;
  plan: number; // 99 or 349
  plan_type: 'parcelado' | 'mensal';
  access_granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface JWTPayload {
  sub: string; // user ID
  email?: string;
  iat?: number;
  exp?: number;
}

export interface AuthContext {
  userId: string;
  email: string;
  isValid: boolean;
}
