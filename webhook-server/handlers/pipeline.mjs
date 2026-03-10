// handlers/pipeline.mjs — Vendas + CS pipeline events em tempo real

import { getTask, createTask, postComment } from '../integrations/clickup.mjs';
import { callAgent } from '../agents/claude.mjs';
import { CLICKUP } from '../config.mjs';

// ── SDR: novo lead criado ─────────────────────────────────────────────────────

export async function handleNewLead(taskId) {
  console.log(`[Pipeline] 🆕 Novo lead: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Novo lead entrou no pipeline SDR:
- Nome: ${task.name}
- Descrição: ${task.description || 'sem descrição'}
- Data de entrada: ${new Date().toLocaleDateString('pt-BR')}
- Campos adicionais: ${JSON.stringify(
    (task.custom_fields || []).map(f => ({ campo: f.name, valor: f.value }))
  )}

Qualifique este lead e sugira a abordagem de primeiro contato.
  `.trim();

  const response = await callAgent('SDR', context);
  await postComment(taskId,
    `🤖 **Agente SDR — Análise Inicial:**\n\n${response}\n\n---\n_Processado em ${new Date().toLocaleString('pt-BR')}_`
  );
  console.log(`[Pipeline] ✅ SDR analisou lead ${taskId}`);
}

// ── SDR: lead virou SQL → criar task no Closer ────────────────────────────────

export async function handleLeadBecameSQL(taskId) {
  console.log(`[Pipeline] 🎯 Lead ${taskId} virou SQL — criando no Closer...`);
  const task = await getTask(taskId);

  // Criar task no Pipeline Closer com dados do lead
  const closerTask = await createTask(CLICKUP.LISTS.PIPELINE_CLOSER, {
    name: task.name,
    description: `**Lead transferido do SDR**\n\n${task.description || ''}\n\n---\nTask SDR original: ${task.id}`,
    custom_fields: task.custom_fields || [],
  });
  console.log(`[Pipeline] ✅ Task criada no Closer: ${closerTask.id}`);

  // Comentar na task SDR original
  await postComment(taskId,
    `✅ **SQL criado no Pipeline Closer**\n` +
    `🔗 Task Closer: ${closerTask.id}\n` +
    `⏰ ${new Date().toLocaleString('pt-BR')}`
  );

  // Chamar agente Closer para preparar a abordagem
  const context = `
SQL recém-criado para abordagem do Closer:
- Nome: ${task.name}
- Contexto/Descrição: ${task.description || 'sem dados adicionais'}
- Data de qualificação: ${new Date().toLocaleDateString('pt-BR')}

Prepare a abordagem de abertura e a estrutura da Discovery Call.
  `.trim();

  const response = await callAgent('CLOSER', context);
  await postComment(closerTask.id,
    `🤖 **Agente Closer — Plano de Abordagem:**\n\n${response}\n\n---\n_Processado em ${new Date().toLocaleString('pt-BR')}_`
  );
}

// ── Closer: deal ganho → criar Onboarding no CS ──────────────────────────────

export async function handleDealWon(taskId) {
  console.log(`[Pipeline] 🏆 Deal ganho: ${taskId} — criando onboarding no CS...`);
  const task = await getTask(taskId);

  // Criar task de Onboarding no CS
  const onboardingTask = await createTask(CLICKUP.LISTS.CS_ONBOARDING, {
    name: `Onboarding — ${task.name}`,
    description: `**Cliente fechado pela equipe de Vendas**\n\n${task.description || ''}\n\n---\nTask Closer original: ${task.id}`,
  });
  console.log(`[Pipeline] ✅ Onboarding criado: ${onboardingTask.id}`);

  // Comentar no deal ganho
  await postComment(taskId,
    `🚀 **Onboarding criado no CS**\n` +
    `🔗 Task CS: ${onboardingTask.id}\n` +
    `⏰ ${new Date().toLocaleString('pt-BR')}`
  );

  // Chamar agente CS Onboarding
  const context = `
Novo cliente acabou de ser fechado pela equipe de Vendas:
- Nome: ${task.name}
- Contexto: ${task.description || 'sem dados adicionais'}
- Data de fechamento: ${new Date().toLocaleDateString('pt-BR')}

Crie o plano de ativação para as primeiras 72 horas.
  `.trim();

  const response = await callAgent('CS_ONBOARDING', context);
  await postComment(onboardingTask.id,
    `🤖 **Agente CS Onboarding — Plano de Ativação:**\n\n${response}\n\n---\n_Processado em ${new Date().toLocaleString('pt-BR')}_`
  );
}

// ── CS Suporte: novo ticket aberto ───────────────────────────────────────────

export async function handleNewTicket(taskId) {
  console.log(`[Pipeline] 🎫 Novo ticket: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Novo ticket de suporte aberto:
- Título: ${task.name}
- Descrição: ${task.description || 'sem descrição'}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Faça a triagem e responda ou escale conforme necessário.
  `.trim();

  const response = await callAgent('CS_SUPORTE', context);
  await postComment(taskId,
    `🤖 **Agente Suporte N1 — Triagem:**\n\n${response}\n\n---\n_Triagem automática em ${new Date().toLocaleString('pt-BR')}_`
  );
}
