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
import {
  handleOnboardingCreated,
  handleOnboardingProgress,
  handleRetencaoHealthCheck,
  handleRetencaoRisk,
} from './handlers/cs.mjs';
import {
  handleOpsQATask,
  handleOpsQAApproved,
  handleAutomationRequest,
  handleProcessMappingTask,
} from './handlers/ops.mjs';
import {
  handleNewFeatureRequest,
  handleFeatureInDev,
  handleBugReport,
  handleFeatureReview,
} from './handlers/products.mjs';
import {
  handleFinancialTask,
  handleFinancialDueDate,
  handleHRRecruitment,
  handleHROnboarding,
} from './handlers/admin.mjs';

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

  // ── CS Onboarding ─────────────────────────────────────────────────────────
  if (listId === CLICKUP.LISTS.CS_ONBOARDING) {
    if (event === 'taskCreated') {
      try {
        await handleOnboardingCreated(task_id);
        logEvent({ type: 'onboarding_created', taskId: task_id, listId, agent: 'CS_ONBOARDING', result: 'Plano de ativação gerado' });
      } catch (err) {
        logEvent({ type: 'onboarding_created', taskId: task_id, listId, agent: 'CS_ONBOARDING', error: err.message });
      }
    } else if (event === 'taskStatusUpdated') {
      try {
        await handleOnboardingProgress(task_id, newStatus);
        logEvent({ type: 'onboarding_progress', taskId: task_id, listId, agent: 'CS_ONBOARDING', result: `Status: ${newStatus}` });
      } catch (err) {
        logEvent({ type: 'onboarding_progress', taskId: task_id, listId, agent: 'CS_ONBOARDING', error: err.message });
      }
    }
    return;
  }

  // ── CS Retenção ───────────────────────────────────────────────────────────
  if (listId === CLICKUP.LISTS.CS_RETENCAO) {
    if (event === 'taskCreated') {
      try {
        await handleRetencaoHealthCheck(task_id);
        logEvent({ type: 'retencao_health', taskId: task_id, listId, agent: 'CS_RETENCAO', result: 'Health check realizado' });
      } catch (err) {
        logEvent({ type: 'retencao_health', taskId: task_id, listId, agent: 'CS_RETENCAO', error: err.message });
      }
    } else if (event === 'taskStatusUpdated' && ['risco', 'churn', 'cancelamento'].some(s => newStatus.includes(s))) {
      try {
        await handleRetencaoRisk(task_id, newStatus);
        logEvent({ type: 'retencao_risk', taskId: task_id, listId, agent: 'CS_RETENCAO', result: 'Plano de resgate gerado' });
      } catch (err) {
        logEvent({ type: 'retencao_risk', taskId: task_id, listId, agent: 'CS_RETENCAO', error: err.message });
      }
    }
    return;
  }

  // ── OPS QA ────────────────────────────────────────────────────────────────
  if (listId === CLICKUP.LISTS.OPS_QA) {
    if (event === 'taskCreated') {
      try {
        await handleOpsQATask(task_id);
        logEvent({ type: 'ops_qa', taskId: task_id, listId, agent: 'OPS_ARCHITECT', result: 'Critérios de QA definidos' });
      } catch (err) {
        logEvent({ type: 'ops_qa', taskId: task_id, listId, agent: 'OPS_ARCHITECT', error: err.message });
      }
    } else if (event === 'taskStatusUpdated' && ['aprovado', 'approved'].includes(newStatus)) {
      try {
        await handleOpsQAApproved(task_id);
        logEvent({ type: 'ops_qa_approved', taskId: task_id, listId, agent: 'OPS_ARCHITECT', result: 'Processo aprovado' });
      } catch (err) {
        logEvent({ type: 'ops_qa_approved', taskId: task_id, listId, agent: 'OPS_ARCHITECT', error: err.message });
      }
    }
    return;
  }

  // ── OPS Automações (list ID pendente) ─────────────────────────────────────
  if (CLICKUP.LISTS.OPS_AUTOMACOES !== 'TODO' && listId === CLICKUP.LISTS.OPS_AUTOMACOES && event === 'taskCreated') {
    try {
      await handleAutomationRequest(task_id);
      logEvent({ type: 'ops_automation', taskId: task_id, listId, agent: 'OPS_AUTOMATION', result: 'Spec de automação gerada' });
    } catch (err) {
      logEvent({ type: 'ops_automation', taskId: task_id, listId, agent: 'OPS_AUTOMATION', error: err.message });
    }
    return;
  }

  // ── OPS Processos (list ID pendente) ──────────────────────────────────────
  if (CLICKUP.LISTS.OPS_PROCESSOS !== 'TODO' && listId === CLICKUP.LISTS.OPS_PROCESSOS && event === 'taskCreated') {
    try {
      await handleProcessMappingTask(task_id);
      logEvent({ type: 'ops_process', taskId: task_id, listId, agent: 'OPS_ARCHITECT', result: 'Mapeamento de processo gerado' });
    } catch (err) {
      logEvent({ type: 'ops_process', taskId: task_id, listId, agent: 'OPS_ARCHITECT', error: err.message });
    }
    return;
  }

  // ── Produtos Backlog (list ID pendente) ───────────────────────────────────
  if (CLICKUP.LISTS.PRODUTOS_BACKLOG !== 'TODO' && listId === CLICKUP.LISTS.PRODUTOS_BACKLOG) {
    if (event === 'taskCreated') {
      try {
        await handleNewFeatureRequest(task_id);
        logEvent({ type: 'product_feature', taskId: task_id, listId, agent: 'PRODUTOS_PM', result: 'Feature analisada e priorizada' });
      } catch (err) {
        logEvent({ type: 'product_feature', taskId: task_id, listId, agent: 'PRODUTOS_PM', error: err.message });
      }
    } else if (event === 'taskStatusUpdated' && newStatus.includes('desenvolvimento')) {
      try {
        await handleFeatureInDev(task_id);
        logEvent({ type: 'product_in_dev', taskId: task_id, listId, agent: 'PRODUTOS_QA', result: 'Plano de testes gerado' });
      } catch (err) {
        logEvent({ type: 'product_in_dev', taskId: task_id, listId, agent: 'PRODUTOS_QA', error: err.message });
      }
    } else if (event === 'taskStatusUpdated' && ['review', 'revisão'].some(s => newStatus.includes(s))) {
      try {
        await handleFeatureReview(task_id);
        logEvent({ type: 'product_review', taskId: task_id, listId, agent: 'PRODUTOS_QA', result: 'Review final realizado' });
      } catch (err) {
        logEvent({ type: 'product_review', taskId: task_id, listId, agent: 'PRODUTOS_QA', error: err.message });
      }
    }
    return;
  }

  // ── Produtos Bugs (list ID pendente) ──────────────────────────────────────
  if (CLICKUP.LISTS.PRODUTOS_BUGS !== 'TODO' && listId === CLICKUP.LISTS.PRODUTOS_BUGS && event === 'taskCreated') {
    try {
      await handleBugReport(task_id);
      logEvent({ type: 'product_bug', taskId: task_id, listId, agent: 'PRODUTOS_PM', result: 'Bug triado por PM + QA' });
    } catch (err) {
      logEvent({ type: 'product_bug', taskId: task_id, listId, agent: 'PRODUTOS_PM', error: err.message });
    }
    return;
  }

  // ── Admin Financeiro (list ID pendente) ───────────────────────────────────
  if (CLICKUP.LISTS.ADMIN_FINANCEIRO !== 'TODO' && listId === CLICKUP.LISTS.ADMIN_FINANCEIRO) {
    if (event === 'taskCreated') {
      try {
        await handleFinancialTask(task_id);
        logEvent({ type: 'admin_finance', taskId: task_id, listId, agent: 'ADMIN_FINANCEIRO', result: 'Análise financeira gerada' });
      } catch (err) {
        logEvent({ type: 'admin_finance', taskId: task_id, listId, agent: 'ADMIN_FINANCEIRO', error: err.message });
      }
    } else if (event === 'taskStatusUpdated' && newStatus.includes('vencendo')) {
      try {
        await handleFinancialDueDate(task_id);
        logEvent({ type: 'admin_finance_due', taskId: task_id, listId, agent: 'ADMIN_FINANCEIRO', result: 'Alerta de vencimento gerado' });
      } catch (err) {
        logEvent({ type: 'admin_finance_due', taskId: task_id, listId, agent: 'ADMIN_FINANCEIRO', error: err.message });
      }
    }
    return;
  }

  // ── Admin RH (list ID pendente) ───────────────────────────────────────────
  if (CLICKUP.LISTS.ADMIN_RH !== 'TODO' && listId === CLICKUP.LISTS.ADMIN_RH) {
    if (event === 'taskCreated') {
      const isOnboarding = task_id && newStatus.includes('onboard');
      try {
        if (isOnboarding) {
          await handleHROnboarding(task_id);
          logEvent({ type: 'admin_hr_onboarding', taskId: task_id, listId, agent: 'ADMIN_RH', result: 'Plano de onboarding interno gerado' });
        } else {
          await handleHRRecruitment(task_id);
          logEvent({ type: 'admin_hr_recruitment', taskId: task_id, listId, agent: 'ADMIN_RH', result: 'Briefing de recrutamento gerado' });
        }
      } catch (err) {
        logEvent({ type: 'admin_hr', taskId: task_id, listId, agent: 'ADMIN_RH', error: err.message });
      }
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
