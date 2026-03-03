// Supabase Edge Function: canva-oauth
// Realiza o token exchange com a Canva Connect API usando PKCE
// O client_secret fica SOMENTE aqui — nunca exposto ao frontend

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CANVA_TOKEN_URL = 'https://api.canva.com/rest/v1/oauth/token';
// redirect_uri deve bater com o que foi usado na geração do OAuth URL
// A Edge Function recebe o redirect_uri do frontend para garantir consistência


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, code_verifier, redirect_uri } = await req.json();

    if (!code || !code_verifier || !redirect_uri) {
      return new Response(
        JSON.stringify({ error: 'code, code_verifier e redirect_uri são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const clientId = Deno.env.get('CANVA_CLIENT_ID');
    const clientSecret = Deno.env.get('CANVA_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'Credenciais Canva não configuradas na Edge Function' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Troca o authorization code por access_token + refresh_token
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier,
      redirect_uri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const tokenRes = await fetch(CANVA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error('[canva-oauth] Token exchange falhou:', tokenData);
      return new Response(
        JSON.stringify({ error: 'Falha no token exchange', details: tokenData }),
        { status: tokenRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[canva-oauth] Erro inesperado:', err);
    return new Response(
      JSON.stringify({ error: 'Erro interno na Edge Function' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
