# SPFP Stripe Backend API

Backend serverless functions for Stripe payment processing on Vercel.

## Architecture

```
api/
├── stripe/
│   ├── checkout-session.ts    # Create checkout session for one-time payments
│   ├── subscription.ts        # Create recurring subscription
│   └── webhook.ts            # Handle Stripe webhook events
├── services/
│   ├── stripe-service.ts     # Stripe API integration
│   ├── email-service.ts      # Email notifications
│   └── database-service.ts   # Supabase operations
├── middleware/
│   └── auth.ts               # JWT authentication
├── types.ts                  # TypeScript interfaces
└── supabase.ts              # Supabase client configuration
```

## Environment Variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...

# Optional: Email service
RESEND_API_KEY=...

# Frontend
FRONTEND_URL=http://localhost:3000
NODE_ENV=production
```

## Endpoints

### 1. POST /api/stripe/checkout-session

Creates a Stripe checkout session for one-time payment.

**Authentication:** Required (JWT Bearer token)

**Request:**
```json
{
  "priceId": "price_1T1yllIZBkfjgy2X30qaXxQo",
  "planType": "parcelado",
  "metadata": {
    "source": "mobile",
    "campaign": "launch"
  }
}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "data": {
    "sessionId": "cs_live_...",
    "url": "https://checkout.stripe.com/pay/cs_live_..."
  },
  "message": "Checkout session created successfully"
}
```

**Response (Error - 400/401/500):**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field: priceId"
  }
}
```

**Price IDs:**
- `price_1T1yllIZBkfjgy2X30qaXxQo`: R$ 99 (parcelado)
- `price_1T1ym7IZBkfjgy2XXytc5SOt`: R$ 349 (parcelado)
- `price_1T1ymVIZBkfjgy2XABCDEfGh`: R$ 99 (mensal)
- `price_1T1ymkIZBkfjgy2XIJKLMNOp`: R$ 349 (mensal)

### 2. POST /api/stripe/subscription

Creates a recurring subscription.

**Authentication:** Required (JWT Bearer token)

**Request:**
```json
{
  "priceId": "price_1T1ymVIZBkfjgy2XABCDEfGh",
  "metadata": {
    "source": "app"
  }
}
```

**Response (Success - 200):**
```json
{
  "status": "success",
  "data": {
    "subscriptionId": "sub_live_...",
    "customerId": "cus_live_...",
    "status": "active"
  },
  "message": "Subscription created successfully"
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": {
    "code": "SUBSCRIPTION_ALREADY_EXISTS",
    "message": "User already has an active subscription",
    "details": {
      "subscriptionId": "sub_..."
    }
  }
}
```

### 3. POST /api/stripe/webhook

Handles Stripe webhook events. **No authentication required** (signature validation only).

**Webhook Events Handled:**
- `payment_intent.succeeded`: One-time payment completed
- `checkout.session.completed`: Checkout completed
- `customer.subscription.created`: Subscription created
- `customer.subscription.updated`: Subscription status changed
- `customer.subscription.deleted`: Subscription cancelled
- `charge.refunded`: Refund processed

**Response:**
```json
{
  "status": "success",
  "message": "Webhook event payment_intent.succeeded processed successfully"
}
```

**Webhook Configuration:**
```
URL: https://yourdomain.vercel.app/api/stripe/webhook
Events: All events or specific ones above
API Version: 2024-06-20
```

## Database Schema

### stripe_sessions
```sql
CREATE TABLE stripe_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  price_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'expired', 'complete'
  amount INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'BRL',
  plan_type TEXT NOT NULL, -- 'parcelado', 'mensal'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### stripe_subscriptions
```sql
CREATE TABLE stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  price_id TEXT NOT NULL,
  status TEXT NOT NULL, -- 'active', 'past_due', 'cancelled'
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### user_access
```sql
CREATE TABLE user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan INTEGER NOT NULL, -- 99 or 349
  plan_type TEXT NOT NULL, -- 'parcelado', 'mensal'
  access_granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true
);
```

## RLS Policies

```sql
-- stripe_sessions RLS
ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON stripe_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert sessions" ON stripe_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update sessions" ON stripe_sessions
  FOR UPDATE USING (true);

-- stripe_subscriptions RLS
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON stripe_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON stripe_subscriptions
  FOR ALL USING (true);

-- user_access RLS
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their access" ON user_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage access" ON user_access
  FOR ALL USING (true);
```

## Error Handling

### Standard Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_FAILED` | 401 | Missing or invalid authentication token |
| `PERMISSION_DENIED` | 403 | User doesn't have permission |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `METHOD_NOT_ALLOWED` | 405 | HTTP method not supported |
| `CHECKOUT_CREATION_FAILED` | 500 | Failed to create Stripe checkout |
| `SUBSCRIPTION_CREATION_FAILED` | 500 | Failed to create Stripe subscription |
| `INVALID_SIGNATURE` | 401 | Webhook signature verification failed |
| `WEBHOOK_PROCESSING_ERROR` | 500 | Error processing webhook |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

## Workflow

### Payment Flow (Parcelado)
1. User selects plan and clicks "Subscribe"
2. Frontend calls `POST /api/stripe/checkout-session`
3. Backend creates Stripe checkout session
4. User redirected to Stripe checkout
5. User completes payment
6. Stripe sends `checkout.session.completed` webhook
7. Backend grants user access
8. Backend sends welcome email

### Subscription Flow (Mensal)
1. User selects subscription plan
2. Frontend calls `POST /api/stripe/subscription`
3. Backend creates Stripe subscription
4. Stripe sends `customer.subscription.created` webhook
5. Backend grants user access
6. Backend sends welcome email
7. Subscription auto-renews monthly

## Testing

### Local Development

```bash
# Install dependencies
npm install stripe

# Set environment variables
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_test_...

# Run tests
npm run test api/stripe/__tests__
```

### Webhook Testing

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Listen for events
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

### cURL Examples

```bash
# Create checkout session
curl -X POST http://localhost:3000/api/stripe/checkout-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1T1yllIZBkfjgy2X30qaXxQo"
  }'

# Create subscription
curl -X POST http://localhost:3000/api/stripe/subscription \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1T1ymVIZBkfjgy2XABCDEfGh"
  }'
```

## Security Considerations

1. **Authentication**: All endpoints (except webhook) require JWT token from Supabase Auth
2. **Webhook Signature**: Webhook signature is verified using `STRIPE_WEBHOOK_SECRET`
3. **Service Role Key**: Backend uses Supabase service role for admin operations
4. **Rate Limiting**: Consider implementing rate limiting for production
5. **Input Validation**: All inputs validated before processing
6. **Error Messages**: Generic error messages to prevent info leakage

## Error Recovery

The backend includes automatic error recovery with:
- Retry logic with exponential backoff (up to 3 retries)
- Comprehensive error logging
- User-friendly error messages
- Graceful degradation (email failures don't block payments)

## Monitoring

All operations are logged with:
- User ID and context
- Operation type
- Timestamp
- Error details (if applicable)
- Metadata for debugging

Logs can be exported to Sentry for production monitoring.

## Support

For issues or questions:
1. Check Stripe webhook logs at https://dashboard.stripe.com/webhooks
2. Review Supabase error logs
3. Check Vercel function logs in deployment

---

**Last Updated:** February 2025
**API Version:** 1.0.0
