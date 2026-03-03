// Supabase Edge Function: stripe-webhook
// Recebe eventos do Stripe e salva em company_revenue
// Story 12.1 — EPIC-012

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// Valida a assinatura do Stripe usando HMAC-SHA256
async function validateStripeSignature(
  body: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  try {
    const parts = Object.fromEntries(signatureHeader.split(',').map((p) => p.split('=')));
    const timestamp = parts['t'];
    const signature = parts['v1'];
    if (!timestamp || !signature) return false;

    const payload = `${timestamp}.${body}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signedBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const computed = Array.from(new Uint8Array(signedBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Tolerância de 5 minutos para replay attacks
    const diff = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (diff > 300) return false;

    return computed === signature;
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const rawBody = await req.text();
  const signatureHeader = req.headers.get('stripe-signature') || '';
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

  // Log do webhook recebido
  const logEntry = {
    source: 'stripe',
    payload: (() => { try { return JSON.parse(rawBody); } catch { return null; } })(),
    processed: false,
  };

  try {
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      await supabase.from('webhook_logs').insert({ ...logEntry, error: 'Invalid JSON' });
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validar assinatura (pular se secret não configurado em dev)
    if (webhookSecret) {
      const valid = await validateStripeSignature(rawBody, signatureHeader, webhookSecret);
      if (!valid) {
        await supabase.from('webhook_logs').insert({ ...logEntry, event_type: event.type, error: 'Invalid signature' });
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const eventType = event.type as string;
    logEntry.payload = event;

    let revenueData: Record<string, unknown> | null = null;

    // checkout.session.completed — venda única ou primeiro pagamento de assinatura
    if (eventType === 'checkout.session.completed') {
      const session = event.data.object;
      revenueData = {
        source: 'stripe',
        event_type: eventType,
        amount: (session.amount_total || 0) / 100,
        currency: (session.currency || 'brl').toUpperCase(),
        product_name: session.metadata?.product_name || null,
        customer_name: session.customer_details?.name || null,
        customer_email: session.customer_details?.email || null,
        status: 'paid',
        external_id: session.payment_intent || session.id,
        metadata: {
          session_id: session.id,
          payment_status: session.payment_status,
          mode: session.mode,
        },
        occurred_at: new Date(session.created * 1000).toISOString(),
      };
    }

    // invoice.paid — pagamento recorrente de assinatura
    if (eventType === 'invoice.paid') {
      const invoice = event.data.object;
      revenueData = {
        source: 'stripe',
        event_type: eventType,
        amount: (invoice.amount_paid || 0) / 100,
        currency: (invoice.currency || 'brl').toUpperCase(),
        product_name: invoice.lines?.data?.[0]?.description || null,
        customer_name: null,
        customer_email: invoice.customer_email || null,
        status: 'paid',
        external_id: invoice.id,
        metadata: {
          subscription_id: invoice.subscription,
          customer_id: invoice.customer,
          period_start: invoice.period_start,
          period_end: invoice.period_end,
        },
        occurred_at: new Date(invoice.created * 1000).toISOString(),
      };
    }

    // customer.subscription.deleted — cancelamento de assinatura
    if (eventType === 'customer.subscription.deleted') {
      const sub = event.data.object;
      revenueData = {
        source: 'stripe',
        event_type: eventType,
        amount: (sub.items?.data?.[0]?.price?.unit_amount || 0) / 100,
        currency: (sub.currency || 'brl').toUpperCase(),
        product_name: null,
        customer_name: null,
        customer_email: null,
        status: 'cancelled',
        external_id: sub.id,
        metadata: {
          customer_id: sub.customer,
          canceled_at: sub.canceled_at,
          cancel_reason: sub.cancellation_details?.reason,
        },
        occurred_at: new Date((sub.canceled_at || sub.created) * 1000).toISOString(),
      };
    }

    if (revenueData) {
      const { error: insertErr } = await supabase
        .from('company_revenue')
        .upsert(revenueData, { onConflict: 'user_id,source,external_id', ignoreDuplicates: true });

      if (insertErr) {
        await supabase.from('webhook_logs').insert({ ...logEntry, event_type: eventType, error: insertErr.message });
        return new Response(JSON.stringify({ error: insertErr.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    await supabase.from('webhook_logs').insert({ ...logEntry, event_type: eventType, processed: true });
    return new Response(JSON.stringify({ received: true, event: eventType }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    await supabase.from('webhook_logs').insert({ ...logEntry, error: err.message });
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
