/**
 * canvaService.ts
 * Integração com Canva Connect API via OAuth 2.0 + PKCE
 *
 * Fluxo:
 * 1. generateOAuthUrl()  → redireciona usuário para autorizar no Canva
 * 2. exchangeCode()      → chama Edge Function que troca code por tokens
 * 3. isConnected()       → verifica se há tokens válidos
 * 4. createDesign()      → cria design a partir de template Canva
 * 5. exportDesign()      → exporta design como URL de imagem
 */

import { supabase } from '../supabase';

const CANVA_CLIENT_ID = import.meta.env.VITE_CANVA_CLIENT_ID as string;
const CANVA_REDIRECT_URI = 'http://127.0.0.1:3000/oauth/canva/callback';
const CANVA_AUTH_URL = 'https://www.canva.com/api/oauth/authorize';
const CANVA_API_BASE = 'https://api.canva.com/rest/v1';

// Escopos necessários para criar e exportar designs
const SCOPES = [
  'design:content:read',
  'design:content:write',
  'design:meta:read',
  'asset:read',
  'asset:write',
  'brandtemplate:meta:read',
  'brandtemplate:content:read',
  'profile:read',
].join(' ');

// ─── Storage keys ──────────────────────────────────────────────────────────────
const TOKEN_KEY = 'canva_access_token';
const REFRESH_KEY = 'canva_refresh_token';
const EXPIRES_KEY = 'canva_token_expires_at';
const VERIFIER_KEY = 'canva_pkce_verifier';

// ─── PKCE Helpers ──────────────────────────────────────────────────────────────

/** Gera string aleatória URL-safe para code_verifier (43-128 chars) */
function generateCodeVerifier(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, 128);
}

/** Transforma code_verifier em code_challenge (SHA-256 + base64url) */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/** Gera state aleatório para proteção CSRF */
function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── OAuth Flow ────────────────────────────────────────────────────────────────

/**
 * Gera a URL de autorização do Canva e armazena o code_verifier no sessionStorage.
 * Redirecione o usuário para essa URL.
 */
export async function generateOAuthUrl(): Promise<string> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  // Salva verifier para usar no callback
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem('canva_oauth_state', state);

  const params = new URLSearchParams({
    code_challenge: challenge,
    code_challenge_method: 's256',
    scope: SCOPES,
    response_type: 'code',
    client_id: CANVA_CLIENT_ID,
    state,
    redirect_uri: CANVA_REDIRECT_URI,
  });

  return `${CANVA_AUTH_URL}?${params.toString()}`;
}

/**
 * Troca o authorization code por tokens via Edge Function.
 * Chama a Edge Function que mantém o client_secret seguro.
 */
export async function exchangeCode(code: string, state: string): Promise<void> {
  const savedState = sessionStorage.getItem('canva_oauth_state');
  const verifier = sessionStorage.getItem(VERIFIER_KEY);

  if (state !== savedState) {
    throw new Error('Estado OAuth inválido — possível ataque CSRF');
  }
  if (!verifier) {
    throw new Error('code_verifier não encontrado. Reinicie o fluxo de conexão.');
  }

  const { data, error } = await supabase.functions.invoke('canva-oauth', {
    body: { code, code_verifier: verifier },
  });

  if (error) throw new Error(`Erro no token exchange: ${error.message}`);
  if (!data?.access_token) throw new Error('Token de acesso não recebido do Canva');

  // Salva tokens
  localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token);
  const expiresAt = Date.now() + (data.expires_in ?? 14400) * 1000;
  localStorage.setItem(EXPIRES_KEY, String(expiresAt));

  // Limpa dados temporários do PKCE
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem('canva_oauth_state');
}

/** Verifica se o usuário está conectado ao Canva com token válido */
export function isConnected(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = Number(localStorage.getItem(EXPIRES_KEY) ?? 0);
  return !!token && Date.now() < expiresAt;
}

/** Desconecta o usuário do Canva (remove tokens) */
export function disconnect(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

// ─── Canva API Calls ───────────────────────────────────────────────────────────

async function apiCall<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error('Não conectado ao Canva. Faça a autenticação primeiro.');

  const res = await fetch(`${CANVA_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Canva API erro ${res.status}: ${JSON.stringify(err)}`);
  }

  return res.json() as Promise<T>;
}

/** Retorna lista de Brand Templates disponíveis na conta Canva */
export async function listBrandTemplates(): Promise<CanvaBrandTemplate[]> {
  const data = await apiCall<{ items: CanvaBrandTemplate[] }>('/brand-templates');
  return data.items ?? [];
}

/**
 * Cria um design a partir de um Brand Template.
 * Preenche os campos de texto automaticamente com o conteúdo do marketing.
 */
export async function createDesignFromTemplate(
  templateId: string,
  title: string,
  textFields: Record<string, string>,
): Promise<string> {
  const body = {
    brand_template_id: templateId,
    title,
    data: Object.entries(textFields).map(([dataset_name, text]) => ({
      dataset_name,
      data: [{ type: 'text', text }],
    })),
  };

  const data = await apiCall<{ design: { id: string } }>('/autofills', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return data.design.id;
}

/**
 * Exporta um design como PNG e retorna a URL da imagem.
 * O processo é assíncrono — faz polling até o export estar pronto.
 */
export async function exportDesignAsImage(designId: string): Promise<string> {
  // Inicia o export
  const exportRes = await apiCall<{ job: { id: string } }>(`/designs/${designId}/exports`, {
    method: 'POST',
    body: JSON.stringify({ format: { type: 'png', export_quality: 'pro' } }),
  });

  const jobId = exportRes.job.id;

  // Polling do status do export (max 30s)
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const status = await apiCall<{ job: { status: string; urls?: string[] } }>(
      `/designs/${designId}/exports/${jobId}`,
    );

    if (status.job.status === 'success' && status.job.urls?.[0]) {
      return status.job.urls[0];
    }
    if (status.job.status === 'failed') {
      throw new Error('Export do design Canva falhou');
    }
  }

  throw new Error('Export do design Canva expirou (timeout 30s)');
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CanvaBrandTemplate {
  id: string;
  title: string;
  thumbnail?: { url: string };
  view_url?: string;
}
