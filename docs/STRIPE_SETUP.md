# Stripe Backend Setup Guide

This guide provides step-by-step instructions to set up and deploy the Stripe backend for SPFP on Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Variables](#environment-variables)
4. [Local Testing](#local-testing)
5. [Deployment to Vercel](#deployment-to-vercel)
6. [Webhook Configuration](#webhook-configuration)
7. [Testing in Production](#testing-in-production)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- Node.js 18+
- npm or yarn
- Git
- Vercel CLI: `npm install -g vercel`
- Stripe CLI: https://stripe.com/docs/stripe-cli

### Required Accounts
1. **Stripe Account** with products and prices configured
2. **Supabase Account** with a project set up
3. **Vercel Account** connected to your GitHub repo
4. Optional: **Resend Account** for email (or use Supabase Auth emails)

### Price IDs (from Stripe Dashboard)

You should already have these configured in Stripe:
- `price_1T1yllIZBkfjgy2X30qaXxQo` - R$ 99 (parcelado)
- `price_1T1ym7IZBkfjgy2XXytc5SOt` - R$ 349 (parcelado)
- `price_1T1ymVIZBkfjgy2XABCDEfGh` - R$ 99 (mensal)
- `price_1T1ymkIZBkfjgy2XIJKLMNOp` - R$ 349 (mensal)

If you need to create new prices:
1. Go to https://dashboard.stripe.com/products
2. Create or select a product
3. Add prices for each plan
4. Copy the price IDs to update in `api/services/database-service.ts`

---

## Database Setup

### Step 1: Create Stripe Tables

Run the migration in Supabase:

1. Go to **Supabase Dashboard** > **SQL Editor**
2. Copy the contents of `supabase/migrations/20250218_stripe_tables.sql`
3. Paste and execute in the SQL editor
4. Wait for completion

This creates:
- `stripe_sessions` - Stores checkout sessions
- `stripe_subscriptions` - Stores recurring subscriptions
- `user_access` - Tracks which users have access
- `stripe_audit_log` - Audit trail for all changes

### Step 2: Verify Tables

In Supabase SQL Editor, run:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'stripe%' OR table_name = 'user_access';
```

You should see 4 tables listed.

---

## Environment Variables

### Local Development (.env.local)

Create or update `.env.local` with:

```bash
# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_test_...  # Use test secret initially

# Supabase (get from Project Settings > API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...  # Service Role Key from API Settings

# Frontend URL for redirects
FRONTEND_URL=http://localhost:3000

# Optional: Email service
RESEND_API_KEY=re_...  # Only if using Resend
```

### Vercel Environment Variables

1. Go to **Vercel Dashboard** > **Settings** > **Environment Variables**
2. Add these variables (set for Production):

```
STRIPE_SECRET_KEY = sk_live_...
STRIPE_WEBHOOK_SECRET = whsec_live_...
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_SERVICE_KEY = eyJhbGc...
FRONTEND_URL = https://your-domain.vercel.app
RESEND_API_KEY = re_... (optional)
```

**Important**: Use live keys for production, test keys for staging.

---

## Local Testing

### Step 1: Install Dependencies

```bash
npm install
```

This should install `stripe@^14.0.0` and `@vercel/node@^3.1.1`.

### Step 2: Start Development Server

```bash
npm run dev
```

This starts both the frontend (port 3000) and serverless functions.

### Step 3: Test Checkout Session Endpoint

Create a file `test-api.sh`:

```bash
#!/bin/bash

# Get a Supabase JWT token (replace with your test user's token)
JWT_TOKEN="your_supabase_jwt_token"

# Test checkout session creation
curl -X POST http://localhost:3000/api/stripe/checkout-session \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1T1yllIZBkfjgy2X30qaXxQo",
    "metadata": {
      "source": "test"
    }
  }'
```

Run: `bash test-api.sh`

Expected response:
```json
{
  "status": "success",
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/pay/..."
  },
  "message": "Checkout session created successfully"
}
```

### Step 4: Test Webhooks Locally

Install Stripe CLI: https://stripe.com/docs/stripe-cli

```bash
# Login to Stripe
stripe login

# Start listening for webhook events
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

Watch your server logs for webhook processing.

---

## Deployment to Vercel

### Step 1: Connect GitHub Repo

1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Click "Import"

### Step 2: Configure Build Settings

Vercel should auto-detect Next.js. Verify:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables

In the Vercel import dialog, add:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `FRONTEND_URL`
- `RESEND_API_KEY` (optional)

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

Your API is now live at:
```
https://your-domain.vercel.app/api/stripe/checkout-session
https://your-domain.vercel.app/api/stripe/subscription
https://your-domain.vercel.app/api/stripe/webhook
```

---

## Webhook Configuration

### Step 1: Get Your Webhook URL

Your Vercel deployment provides:
```
https://your-domain.vercel.app/api/stripe/webhook
```

### Step 2: Register Webhook in Stripe

1. Go to **Stripe Dashboard** > **Webhooks** (in Developers section)
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-domain.vercel.app/api/stripe/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

### Step 3: Test Webhook

Use Stripe Dashboard webhook tester or Stripe CLI:

```bash
stripe trigger payment_intent.succeeded \
  --api-key sk_live_... \
  --stripe-account acct_...
```

---

## Testing in Production

### 1. Test Checkout Flow

1. Go to your frontend: `https://your-domain.vercel.app`
2. Log in with a test user
3. Click "Subscribe" or "Buy Plan"
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
5. Complete the checkout

Check in Supabase:
- Entry in `stripe_sessions` table
- Entry in `user_access` table (after webhook)

### 2. Test Subscription Flow

1. Go to pricing page
2. Select monthly subscription
3. Use test card `4242 4242 4242 4242`

Check in Supabase:
- Entry in `stripe_subscriptions` table
- Entry in `user_access` table

### 3. Verify Webhook Processing

1. Go to **Stripe Dashboard** > **Webhooks** > **Signed Events**
2. See the events from your test payments
3. Verify they all show a 200 status

### 4. Check Logs

In Vercel:
1. Go to **Deployments** > **Latest** > **Logs**
2. Look for API endpoint logs
3. Search for "Processing webhook event" or your request

---

## Troubleshooting

### Issue: 401 Unauthorized on API calls

**Solution:**
- Ensure you're sending a valid Supabase JWT token
- Token must be in `Authorization: Bearer {token}` header
- Use `supabaseClient.auth.getSession()` to get valid token

### Issue: Webhook events not processing

**Solution:**
- Verify webhook URL is correct in Stripe Dashboard
- Check `STRIPE_WEBHOOK_SECRET` matches the one in Stripe
- Look for "Invalid signature" errors in Vercel logs
- Ensure raw body is being read correctly

### Issue: Database operations failing

**Solution:**
- Verify `SUPABASE_SERVICE_KEY` is correct (not ANON_KEY)
- Check RLS policies are enabled for tables
- Ensure tables exist: `stripe_sessions`, `stripe_subscriptions`, `user_access`
- Check Supabase logs for permission errors

### Issue: Email not sending

**Solution:**
- Resend is optional; payment works without it
- If using Resend, verify `RESEND_API_KEY` is set
- Check Resend dashboard for sent/failed emails
- Verify sender domain is verified in Resend

### Issue: Stripe pricing not matching

**Solution:**
- Update price IDs in `api/services/database-service.ts`
- Prices are in cents (so 9900 = R$ 99.00)
- Verify price IDs exist in Stripe Dashboard
- Clear browser cache after changes

---

## Monitoring & Maintenance

### Check Webhook Health

Stripe Dashboard > Webhooks > Endpoint:
- Last 30 days: Should see 100% success rate
- Failed events: Retry immediately

### Monitor Supabase Logs

Supabase Dashboard > Logs:
- Filter by table: `stripe_sessions`, `stripe_subscriptions`, `user_access`
- Check for errors or unusual activity

### Error Logs

All API errors are logged. In Vercel, search for:
- "CHECKOUT_CREATION_FAILED"
- "SUBSCRIPTION_CREATION_FAILED"
- "INVALID_SIGNATURE"
- "WEBHOOK_PROCESSING_ERROR"

### Audit Trail

Check `stripe_audit_log` table for all changes:
```sql
SELECT * FROM stripe_audit_log
ORDER BY created_at DESC
LIMIT 50;
```

---

## Quick Reference

### Price IDs
| Plan | Amount | Type | Price ID |
|------|--------|------|----------|
| Essencial | R$ 99 | Parcelado | `price_1T1yllIZBkfjgy2X30qaXxQo` |
| Wealth | R$ 349 | Parcelado | `price_1T1ym7IZBkfjgy2XXytc5SOt` |
| Essencial | R$ 99 | Mensal | `price_1T1ymVIZBkfjgy2XABCDEfGh` |
| Wealth | R$ 349 | Mensal | `price_1T1ymkIZBkfjgy2XIJKLMNOp` |

### API Endpoints
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/stripe/checkout-session` | Required | Create checkout |
| POST | `/api/stripe/subscription` | Required | Create subscription |
| POST | `/api/stripe/webhook` | Signature only | Handle webhooks |

### Key Files
- Backend API: `api/stripe/` (3 endpoints)
- Services: `api/services/` (stripe, database, email)
- Types: `api/types.ts`
- Database client: `api/supabase.ts`
- Migrations: `supabase/migrations/20250218_stripe_tables.sql`

---

## Support

For issues:
1. Check **Stripe Dashboard** > **Logs** for API errors
2. Review **Vercel Logs** for function execution errors
3. Inspect **Supabase SQL Editor** for data issues
4. Check webhook **Events** in Stripe for delivery status

---

**Last Updated**: February 2025
**Backend Version**: 1.0.0
**API Version**: 2024-06-20
