// handlers/ops.mjs — OPS (Arquitetura de Processos + Automações + QA)

import { getTask, postComment } from '../integrations/clickup.mjs';
import { callAgent } from '../agents/claude.mjs';

// ── OPS QA: nova task de qualidade criada ─────────────────────────────────────

export async function handleOpsQATask(taskId) {
  console.log(`[OPS] 🔍 Nova task de QA: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Nova task de QA de processo criada:
- Processo: ${task.name}
- Descrição: ${task.description || 'sem descrição'}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Defina os critérios de qualidade, checklist de validação e score mínimo para aprovação.
  `.trim();

  const response = await callAgent('OPS_ARCHITECT', context);
  await postComment(taskId,
    `🤖 **Agente OPS Architect — Critérios de QA:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
  console.log(`[OPS] ✅ Critérios de QA definidos para ${taskId}`);
}

// ── OPS QA: task aprovada (processo validado) ─────────────────────────────────

export async function handleOpsQAApproved(taskId) {
  console.log(`[OPS] ✅ Processo aprovado no QA: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Processo aprovado no QA de OPS:
- Processo: ${task.name}
- Detalhes: ${task.description || 'sem dados'}
- Data de aprovação: ${new Date().toLocaleDateString('pt-BR')}

Gere o relatório de aprovação com próximos passos de implementação e KPIs de monitoramento.
  `.trim();

  const response = await callAgent('OPS_ARCHITECT', context);
  await postComment(taskId,
    `✅ **OPS Architect — Processo Aprovado:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
}

// ── OPS: nova automação solicitada ────────────────────────────────────────────

export async function handleAutomationRequest(taskId) {
  console.log(`[OPS] ⚙️  Nova automação solicitada: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Solicitação de automação recebida:
- Título: ${task.name}
- Descrição do fluxo desejado: ${task.description || 'sem especificação'}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Projete a automação: trigger, condição, ação. Estime complexidade e sistemas envolvidos.
  `.trim();

  const response = await callAgent('OPS_AUTOMATION', context);
  await postComment(taskId,
    `🤖 **Automation Architect — Spec da Automação:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
  console.log(`[OPS] ✅ Spec de automação gerada para ${taskId}`);
}

// ── OPS: nova task de mapeamento de processo ──────────────────────────────────

export async function handleProcessMappingTask(taskId) {
  console.log(`[OPS] 🗺️  Mapeamento de processo: ${taskId}`);
  const task = await getTask(taskId);

  const context = `
Solicitação de mapeamento de processo:
- Processo: ${task.name}
- Contexto atual: ${task.description || 'sem descrição do estado atual'}
- Data: ${new Date().toLocaleDateString('pt-BR')}

Mapeie o processo do fim para o começo, identifique gargalos e proponha processo otimizado.
  `.trim();

  const response = await callAgent('OPS_ARCHITECT', context);
  await postComment(taskId,
    `🤖 **OPS Architect — Mapeamento de Processo:**\n\n${response}\n\n---\n_${new Date().toLocaleString('pt-BR')}_`
  );
}
