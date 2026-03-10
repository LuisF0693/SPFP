// index.mjs — SPFP Webhook Server
// Real-time: ClickUp → Claude Agents → Social Media
// Deploy: Vercel

import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import { CLICKUP } from './config.mjs';
import { logEvent, getEvents, getStats } from './eventStore.mjs';
import { handleEditorialStatusChange } from './handlers/editorial.mjs';
import {
  handleNewLead,
  handleLeadBecameSQL,
  handleDealWon,
  handleNewTicket,
} from './handlers/pipeline.mjs';

const app = express();

// ── CORS (permite dashboard SPFP acessar) ─────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-signature');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── rawBody ANTES do JSON.parse para HMAC correto ─────────────────────────────
app.use((req, _res, next) => {
  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    req.rawBody = data;
    try { req.body = JSON.parse(data); } catch { req.body = {}; }
    next();
  });
});

// ── Verificação de assinatura HMAC do ClickUp ─────────────────────────────────
function verifySignature(req) {
  if (!CLICKUP.WEBHOOK_SECRET) return true; // dev mode
  const sig = req.headers['x-signature'];
  if (!sig) return false;
  const hash = crypto
    .createHmac('sha256', CLICKUP.WEBHOOK_SECRET)
    .update(req.rawBody || JSON.stringify(req.body))
    .digest('hex');
  return sig === hash;
}

// ── Queue simples para não perder eventos ─────────────────────────────────────
const queue = [];
let processing = false;

async function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;
  while (queue.length > 0) {
    const event = queue.shift();
    try {
      await routeEvent(event);
    } catch (err) {
      console.error(`[Queue] ❌ Erro ao processar evento:`, err.message);
    }
    await sleep(300);
  }
  processing = false;
}

// ── Roteador de eventos ───────────────────────────────────────────────────────
async function routeEvent({ event, task_id, history_items }) {
  const listId = history_items?.[0]?.parent_id;
  const newStatus = history_items?.[0]?.after?.status?.toLowerCase() || '';

  console.log(`\n[Router] 📨 Evento: ${event} | Task: ${task_id} | List: ${listId} | Status: ${newStatus}`);

  // ── Calendário Editorial ───────────────────────────────────────────────────
  if (listId === CLICKUP.LISTS.EDITORIAL && event === 'taskStatusUpdated') {
    try {
      await handleEditorialStatusChange(task_id, newStatus);
      if (['aprovado', 'approved'].includes(newStatus)) {
        logEvent({ type: 'editorial_approved', taskId: task_id, listId, agent: 'MARKETING_EDITORIAL', result: 'Conteúdo validado e publicação iniciada' });
      }
    } catch (err) {
      logEvent({ type: 'editorial_approved', taskId: task_id, listId, error: err.message });
    }
    return;
  }

  // ── Pipeline SDR ──────────────────────────────────────────────────────────
  if (listId === CLICKUP.LISTS.PIPELINE_SDR) {
    if (event === 'taskCreated') {
      try {
        await handleNewLead(task_id);
        logEvent({ type: 'new_lead', taskId: task_id, listId, agent: 'SDR', result: 'Lead qualificado pelo agente SDR' });
      } catch (err) {
        logEvent({ type: 'new_lead', taskId: task_id, listId, agent: 'SDR', error: err.message });
      }
    } else if (event === 'taskStatusUpdated' && newStatus.includes('sql')) {
      try {
        await handleLeadBecameSQL(task_id);
        logEvent({ type: 'lead_sql', taskId: task_id, listId, agent: 'CLOSER', result: 'SQL criado no Closer — abordagem preparada' });
      } catch (err) {
        logEvent({ type: 'lead_sql', taskId: task_id, listId, agent: 'CLOSER', error: err.message });
      }
    }
    return;
  }

  // ── Pipeline Closer ───────────────────────────────────────────────────────
  if (listId === CLICKUP.LISTS.PIPELINE_CLOSER) {
    if (event === 'taskStatusUpdated' && newStatus.includes('ganho')) {
      try {
        await handleDealWon(task_id);
        logEvent({ type: 'deal_won', taskId: task_id, listId, agent: 'CS_ONBOARDING', result: 'Onboarding criado — plano de ativação 72h gerado' });
      } catch (err) {
        logEvent({ type: 'deal_won', taskId: task_id, listId, agent: 'CS_ONBOARDING', error: err.message });
      }
    }
    return;
  }

  // ── CS Suporte ────────────────────────────────────────────────────────────
  if (listId === CLICKUP.LISTS.CS_SUPORTE && event === 'taskCreated') {
    try {
      await handleNewTicket(task_id);
      logEvent({ type: 'new_ticket', taskId: task_id, listId, agent: 'CS_SUPORTE', result: 'Triagem N1 realizada — ticket classificado' });
    } catch (err) {
      logEvent({ type: 'new_ticket', taskId: task_id, listId, agent: 'CS_SUPORTE', error: err.message });
    }
    return;
  }

  console.log(`[Router] ⏭️  Evento ignorado (sem handler)`);
}

// ── Webhook ClickUp ───────────────────────────────────────────────────────────
app.post('/webhook/clickup', (req, res) => {
  if (!verifySignature(req)) {
    console.warn('[Webhook] ⚠️  Assinatura inválida — rejeitado');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event, task_id, history_items } = req.body;
  console.log(`[Webhook] ✅ Recebido: ${event} (task: ${task_id})`);

  res.status(200).json({ received: true });

  queue.push({ event, task_id, history_items });
  processQueue();
});

// ── Eventos para dashboard (polling) ─────────────────────────────────────────
app.get('/events', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '30'), 100);
  res.json(getEvents(limit));
});

// ── Estatísticas para dashboard ───────────────────────────────────────────────
app.get('/stats', (_, res) => {
  res.json(getStats());
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    queue: queue.length,
    integrations: {
      clickup:   !!process.env.CLICKUP_API_TOKEN,
      claude:    !!process.env.ANTHROPIC_API_KEY,
      instagram: !!process.env.META_ACCESS_TOKEN,
      youtube:   !!process.env.YOUTUBE_REFRESH_TOKEN,
      linkedin:  !!process.env.LINKEDIN_ACCESS_TOKEN,
    },
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 SPFP Webhook Server rodando na porta ${PORT}`);
  console.log(`📡 Webhook:  POST /webhook/clickup`);
  console.log(`📊 Eventos:  GET  /events`);
  console.log(`📈 Stats:    GET  /stats`);
  console.log(`❤️  Health:   GET  /health\n`);
  console.log('Integrações ativas:');
  console.log(`  ClickUp:   ${process.env.CLICKUP_API_TOKEN   ? '✅' : '❌ (configure CLICKUP_API_TOKEN)'}`);
  console.log(`  Claude:    ${process.env.ANTHROPIC_API_KEY   ? '✅' : '❌ (configure ANTHROPIC_API_KEY)'}`);
  console.log(`  Instagram: ${process.env.META_ACCESS_TOKEN   ? '✅' : '⚠️  (opcional)'}`);
  console.log(`  YouTube:   ${process.env.YOUTUBE_REFRESH_TOKEN ? '✅' : '⚠️  (opcional)'}`);
  console.log(`  LinkedIn:  ${process.env.LINKEDIN_ACCESS_TOKEN ? '✅' : '⚠️  (opcional)'}`);
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
