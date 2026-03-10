// handlers/products.mjs — Produtos (PM + QA Experience)

import { getTask, postComment } from '../integrations/clickup.mjs';
import { callAgent } from '../agents/claude.mjs';

// ── Produtos: nova feature request ou task criada ─────────────────────────────

export async function handleNewFeatureRequest(taskId) {
  console.log(`[Products] 🆕 Nova feature request: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Nova solicitação de feature/melhoria recebida:
- Título: ${task.name}
- Descrição: ${task.description || 'sem descrição'}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Classifique, calcule o ICE score (Impacto × Confiança ÷ Esforço), defina critérios de aceite e posicione no roadmap.
  `.trim();

  const response = await callAgent('PRODUTOS_PM', context);
  await postComment(taskId,
    `🤖 **Product Manager — Análise de Feature:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
  console.log(`[Products] ✅ Feature analisada pelo PM: ${taskId}`);
}

// ── Produtos: task movida para "Em Desenvolvimento" ──────────────────────────

export async function handleFeatureInDev(taskId) {
  console.log(`[Products] 🔨 Feature em desenvolvimento: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Feature iniciada no desenvolvimento:
- Feature: ${task.name}
- Especificação: ${task.description || 'sem spec detalhada'}
- Data de início: ${new Date().toLocaleDateString('pt-BR')}

Gere os casos de teste para QA, incluindo happy path, edge cases e critérios de regressão.
  `.trim();

  const response = await callAgent('PRODUTOS_QA', context);
  await postComment(taskId,
    `🤖 **QA Experience — Plano de Testes:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
}

// ── Produtos: bug reportado ───────────────────────────────────────────────────

export async function handleBugReport(taskId) {
  console.log(`[Products] 🐛 Bug reportado: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Bug reportado no produto:
- Título: ${task.name}
- Descrição/Passos para reproduzir: ${task.description || 'sem descrição'}
- Data do report: ${new Date().toLocaleDateString('pt-BR')}

Classifique a severidade (Blocker/Critical/Major/Minor), avalie impacto em usuários e sugira prioridade de correção.
  `.trim();

  const [pmResponse, qaResponse] = await Promise.all([
    callAgent('PRODUTOS_PM', context),
    callAgent('PRODUTOS_QA', context),
  ]);

  await postComment(taskId,
    `🤖 **Product Manager — Priorização do Bug:**\n\n${pmResponse}\n\n` +
    `---\n\n🔍 **QA Experience — Análise Técnica:**\n\n${qaResponse}\n\n` +
    `---\n_${new Date().toLocaleString('pt-BR')}_`
  );
  console.log(`[Products] ✅ Bug triado por PM + QA: ${taskId}`);
}

// ── Produtos: feature pronta para review ─────────────────────────────────────

export async function handleFeatureReview(taskId) {
  console.log(`[Products] 👀 Feature em review: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Feature pronta para review final:
- Feature: ${task.name}
- O que foi implementado: ${task.description || 'sem descrição'}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Execute o checklist de aceite, valide contra os critérios definidos e emita veredicto: APROVADO / REPROVADO / APROVADO COM RESSALVAS.
  `.trim();

  const response = await callAgent('PRODUTOS_QA', context);
  await postComment(taskId,
    `🤖 **QA Experience — Review Final:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
}
