// Supabase Edge Function: hotmart-webhook
// Recebe eventos do Hotmart e salva em company_revenue
// Story 12.2 — EPIC-012

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-hotmart-webhook-token',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let rawBody = '';
  let event: any = null;

  try {
    rawBody = await req.text();
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const hotmartToken = req.headers.get('x-hotmart-webhook-token') || '';
  const expectedToken = Deno.env.get('HOTMART_WEBHOOK_TOKEN') || '';

  const logEntry = {
    source: 'hotmart',
    payload: event,
    event_type: event?.event || null,
    processed: false,
  };

  // Validar token (pular em dev se não configurado)
  if (expectedToken && hotmartToken !== expectedToken) {
    await supabase.from('webhook_logs').insert({ ...logEntry, error: 'Invalid token' });
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const eventType = event.event as string; // PURCHASE_COMPLETE, PURCHASE_CANCELED, PURCHASE_REFUNDED
    const purchase = event.data?.purchase;
    const buyer = event.data?.buyer;
    const product = event.data?.product;
    const subscription = event.data?.subscription;

    let revenueData: Record<string, unknown> | null = null;
    let productData: Record<string, unknown> | null = null;

    // Mapear valor — Hotmart envia em centavos em alguns casos e em real em outros
    const rawAmount = purchase?.price?.value || purchase?.full_price?.value || 0;
    const amount = rawAmount > 1000 ? rawAmount / 100 : rawAmount; // heurística

    if (eventType === 'PURCHASE_COMPLETE') {
      revenueData = {
        source: 'hotmart',
        event_type: eventType,
        amount,
        currency: purchase?.price?.currency_value || 'BRL',
        product_name: product?.name || null,
        customer_name: buyer?.name || null,
        customer_email: buyer?.email || null,
        status: 'paid',
        external_id: purchase?.transaction || event.id,
        metadata: {
          product_id: product?.id,
          payment_type: purchase?.payment?.type,
          offer_code: purchase?.offer?.code,
          subscription_id: subscription?.subscriber?.code,
        },
        occurred_at: purchase?.order_date
          ? new Date(purchase.order_date).toISOString()
          : new Date().toISOString(),
      };

      // Upsert do produto
      if (product?.id && product?.name) {
        productData = {
          source: 'hotmart',
          external_product_id: String(product.id),
          name: product.name,
          price: amount,
          type: subscription ? 'subscription' : 'one_time',
          is_active: true,
        };
      }
    }

    if (eventType === 'PURCHASE_CANCELED' || eventType === 'PURCHASE_REFUNDED') {
      revenueData = {
        source: 'hotmart',
        event_type: eventType,
        amount,
        currency: purchase?.price?.currency_value || 'BRL',
        product_name: product?.name || null,
        customer_name: buyer?.name || null,
        customer_email: buyer?.email || null,
        status: eventType === 'PURCHASE_REFUNDED' ? 'refunded' : 'cancelled',
        external_id: purchase?.transaction || event.id,
        metadata: {
          product_id: product?.id,
          reason: purchase?.cancellation_reason,
        },
        occurred_at: new Date().toISOString(),
      };
    }

    if (revenueData) {
      const { error: revErr } = await supabase
        .from('company_revenue')
        .upsert(revenueData, { onConflict: 'user_id,source,external_id', ignoreDuplicates: true });

      if (revErr) {
        await supabase.from('webhook_logs').insert({ ...logEntry, error: revErr.message });
        return new Response(JSON.stringify({ error: revErr.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (productData) {
      await supabase
        .from('company_products')
        .upsert(productData, { onConflict: 'user_id,source,external_product_id', ignoreDuplicates: true });
    }

    await supabase.from('webhook_logs').insert({ ...logEntry, processed: true });
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
