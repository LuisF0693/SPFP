// handlers/admin.mjs — Admin (Financeiro + RH + Compliance)

import { getTask, postComment } from '../integrations/clickup.mjs';
import { callAgent } from '../agents/claude.mjs';

// ── Admin Financeiro: nova task financeira ────────────────────────────────────

export async function handleFinancialTask(taskId) {
  console.log(`[Admin] 💰 Task financeira: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Nova task financeira recebida:
- Título: ${task.name}
- Detalhes: ${task.description || 'sem dados'}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Analise o impacto no fluxo de caixa, classifique a categoria e sugira a ação: pagar agora / negociar / postergar / provisionar.
  `.trim();

  const response = await callAgent('ADMIN_FINANCEIRO', context);
  await postComment(taskId,
    `🤖 **CFO SPFP — Análise Financeira:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
  console.log(`[Admin] ✅ Análise financeira gerada: ${taskId}`);
}

// ── Admin Financeiro: task de contas a pagar vencendo ────────────────────────

export async function handleFinancialDueDate(taskId) {
  console.log(`[Admin] ⏰ Conta a pagar próxima do vencimento: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
ALERTA: Conta a pagar se aproximando do vencimento.
- Conta: ${task.name}
- Detalhes: ${task.description || 'sem dados'}
- Data de hoje: ${new Date().toLocaleDateString('pt-BR')}

Verifique disponibilidade de caixa, avalie negociação de prazo se necessário e sugira ação imediata.
  `.trim();

  const response = await callAgent('ADMIN_FINANCEIRO', context);
  await postComment(taskId,
    `⚠️ **ALERTA CFO — Vencimento Próximo:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
}

// ── Admin RH: nova task de recrutamento ──────────────────────────────────────

export async function handleHRRecruitment(taskId) {
  console.log(`[Admin] 👥 Nova task de recrutamento: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Nova solicitação de recrutamento:
- Vaga: ${task.name}
- Requisitos/Contexto: ${task.description || 'sem especificação'}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Crie o briefing da vaga, perfil ideal do candidato e as 5 perguntas de entrevista mais importantes.
  `.trim();

  const response = await callAgent('ADMIN_RH', context);
  await postComment(taskId,
    `🤖 **RH/People — Briefing de Recrutamento:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
  console.log(`[Admin] ✅ Briefing de recrutamento gerado: ${taskId}`);
}

// ── Admin RH: novo colaborador (onboarding interno) ──────────────────────────

export async function handleHROnboarding(taskId) {
  console.log(`[Admin] 🎉 Onboarding interno: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Novo colaborador iniciando na SPFP:
- Nome/Cargo: ${task.name}
- Contexto: ${task.description || 'sem dados adicionais'}
- Data de início: ${new Date().toLocaleDateString('pt-BR')}

Crie o plano de onboarding interno para a primeira semana com checklist de integração.
  `.trim();

  const response = await callAgent('ADMIN_RH', context);
  await postComment(taskId,
    `🤖 **RH/People — Plano de Onboarding Interno:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
}
