// handlers/editorial.mjs — Calendário Editorial events

import { getTask, postComment, getCustomField } from '../integrations/clickup.mjs';
import { postToInstagram } from '../integrations/instagram.mjs';
import { postToYouTube } from '../integrations/youtube.mjs';
import { postToLinkedIn } from '../integrations/linkedin.mjs';
import { callAgent } from '../agents/claude.mjs';
import { CLICKUP } from '../config.mjs';

/**
 * Dispara quando status muda para qualquer valor em Calendário Editorial.
 * Se status = "aprovado" → posta na rede social correspondente.
 */
export async function handleEditorialStatusChange(taskId, newStatus) {
  const statusLower = newStatus.toLowerCase();

  if (!['aprovado', 'approved', 'aprovado ✅'].includes(statusLower)) return;

  console.log(`[Editorial] 🟢 Task ${taskId} aprovada — iniciando publicação...`);

  const task = await getTask(taskId);
  const canal = getCustomField(task, CLICKUP.FIELDS.CANAL);
  const caption = task.description || task.name;
  const titulo = task.name;

  // Chamar agente de marketing para validar conteúdo antes de postar
  const agentContext = `
Task aprovada para publicação:
- Título: ${titulo}
- Canal: ${canal}
- Caption/Conteúdo: ${caption}
- Data de publicação: ${task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'não definida'}

Valide o conteúdo e gere o checklist de publicação para ${canal}.
  `.trim();

  const agentResponse = await callAgent('MARKETING_EDITORIAL', agentContext);
  await postComment(taskId, `🤖 **Content Manager:**\n\n${agentResponse}`);

  // Postar na plataforma correta
  let resultado;

  if (canal === 'Instagram') {
    resultado = await postToInstagram({
      caption,
      isReel: titulo.toLowerCase().includes('reel'),
    });
  } else if (canal === 'YouTube') {
    resultado = await postToYouTube({
      title: titulo,
      description: caption,
      publishAt: task.due_date ? new Date(task.due_date).toISOString() : null,
    });
  } else if (canal === 'LinkedIn') {
    resultado = await postToLinkedIn({ text: caption });
  } else {
    await postComment(taskId, `⚠️ Canal "${canal}" não configurado para auto-postagem.`);
    return;
  }

  // Reportar resultado no ClickUp
  if (resultado?.success) {
    await postComment(taskId,
      `✅ **Publicado com sucesso!**\n` +
      `📡 Canal: ${canal}\n` +
      `🆔 Post ID: ${resultado.postId || 'agendado'}\n` +
      `⏰ ${new Date().toLocaleString('pt-BR')}`
    );
  } else if (resultado?.skipped) {
    await postComment(taskId,
      `⚠️ **Publicação manual necessária**\n` +
      `Motivo: ${resultado.reason}\n\n` +
      `Configure as credenciais de ${canal} no .env do servidor.`
    );
  } else if (resultado?.error) {
    await postComment(taskId,
      `❌ **Erro na publicação (${canal}):**\n${resultado.error}`
    );
  }
}
