// handlers/cs.mjs — CS Retenção + Onboarding events

import { getTask, postComment } from '../integrations/clickup.mjs';
import { callAgent } from '../agents/claude.mjs';

// ── CS Onboarding: nova task criada (cliente recém-fechado) ───────────────────

export async function handleOnboardingCreated(taskId) {
  console.log(`[CS] 🚀 Novo onboarding criado: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Nova task de onboarding criada para cliente:
- Nome: ${task.name}
- Contexto: ${task.description || 'sem dados adicionais'}
- Data de início: ${new Date().toLocaleDateString('pt-BR')}

Crie o plano de ativação detalhado para as primeiras 72 horas e os próximos 7 dias.
  `.trim();

  const response = await callAgent('CS_ONBOARDING', context);
  await postComment(taskId,
    `🤖 **Agente CS Onboarding — Plano de Ativação:**\n\n${response}\n\n---\n_Gerado em ${new Date().toLocaleString('pt-BR')}_`
  );
  console.log(`[CS] ✅ Plano de onboarding gerado para ${taskId}`);
}

// ── CS Onboarding: status mudou (check de progresso) ─────────────────────────

export async function handleOnboardingProgress(taskId, newStatus) {
  console.log(`[CS] 📊 Onboarding ${taskId} → ${newStatus}`);
  const task = await getTask(taskId);

  const context = `
Update de progresso no onboarding do cliente:
- Cliente: ${task.name}
- Novo status: ${newStatus}
- Descrição atual: ${task.description || 'sem dados'}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Avalie o progresso, identifique riscos de ativação e sugira próximo touchpoint.
  `.trim();

  const response = await callAgent('CS_ONBOARDING', context);
  await postComment(taskId,
    `🤖 **CS Onboarding — Check de Progresso:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
}

// ── CS Retenção: nova task de health check ────────────────────────────────────

export async function handleRetencaoHealthCheck(taskId) {
  console.log(`[CS] ❤️  Health check: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Task de retenção criada para cliente:
- Cliente: ${task.name}
- Dados disponíveis: ${task.description || 'sem histórico registrado'}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Avalie o health score, identifique risco de churn e proponha ação de resgate ou upsell.
  `.trim();

  const response = await callAgent('CS_RETENCAO', context);
  await postComment(taskId,
    `🤖 **Agente CS Retenção — Health Check:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
  console.log(`[CS] ✅ Health check concluído para ${taskId}`);
}

// ── CS Retenção: status mudou para risco ──────────────────────────────────────

export async function handleRetencaoRisk(taskId, newStatus) {
  console.log(`[CS] ⚠️  Cliente em risco: ${taskId} → ${newStatus}`);
  const task = await getTask(taskId);

  const context = `
ALERTA: Cliente entrou em status de risco de churn.
- Cliente: ${task.name}
- Status detectado: ${newStatus}
- Histórico: ${task.description || 'sem dados'}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Crie URGENTEMENTE um plano de resgate com ação para as próximas 24 horas.
  `.trim();

  const response = await callAgent('CS_RETENCAO', context);
  await postComment(taskId,
    `🚨 **ALERTA CS Retenção — Plano de Resgate URGENTE:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
}
