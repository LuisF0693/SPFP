// handlers/editorial.mjs — Calendário Editorial events

import { getTask, postComment, getCustomField } from '../integrations/clickup.mjs';
import { postToInstagram } from '../integrations/instagram.mjs';
import { postToYouTube } from '../integrations/youtube.mjs';
import { postToLinkedIn } from '../integrations/linkedin.mjs';
import { callAgent } from '../agents/claude.mjs';
import { CLICKUP } from '../config.mjs';

/**
 * Extrai a primeira URL pública encontrada no texto.
 * Suporta Google Drive, Dropbox, links diretos de imagem/vídeo.
 */
function extrairUrlMidia(texto) {
  if (!texto) return null;
  const urlRegex = /(https?:\/\/[^\s\)\]"']+\.(jpg|jpeg|png|gif|mp4|mov|avi|webp|webm)[^\s\)\]"']*|https?:\/\/drive\.google\.com\/[^\s\)\]"']+|https?:\/\/(?:www\.)?dropbox\.com\/[^\s\)\]"']+|https?:\/\/[^\s\)\]"']+)/gi;
  const matches = texto.match(urlRegex);
  if (!matches) return null;
  // Prefere URLs com extensão de mídia
  const mediaUrl = matches.find(u => /\.(jpg|jpeg|png|gif|mp4|mov|avi|webp|webm)/i.test(u));
  return mediaUrl || matches[0];
}

/**
 * Converte URL do Google Drive para URL direta de download.
 * Ex: /file/d/ID/view → /uc?export=download&id=ID
 */
function normalizarUrlDrive(url) {
  if (!url) return url;
  const m = url.match(/\/file\/d\/([^/]+)\//);
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
  return url;
}

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

  // Extrai URL da mídia da descrição
  const urlBruta = extrairUrlMidia(task.description);
  const mediaUrl = normalizarUrlDrive(urlBruta);
  if (mediaUrl) {
    console.log(`[Editorial] 🖼️  URL da mídia detectada: ${mediaUrl}`);
  } else {
    console.log(`[Editorial] ⚠️  Nenhuma URL de mídia encontrada na descrição`);
  }

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

  const isReel = titulo.toLowerCase().includes('reel');
  const isVideo = titulo.toLowerCase().includes('youtube') || titulo.toLowerCase().includes('vídeo') || titulo.toLowerCase().includes('video');

  if (canal === 'Instagram') {
    resultado = await postToInstagram({
      caption,
      imageUrl: !isReel ? mediaUrl : undefined,
      videoUrl: isReel ? mediaUrl : undefined,
      isReel,
    });
  } else if (canal === 'YouTube') {
    resultado = await postToYouTube({
      title: titulo,
      description: caption,
      videoFilePath: mediaUrl,
      publishAt: task.due_date ? new Date(task.due_date).toISOString() : null,
    });
  } else if (canal === 'LinkedIn') {
    resultado = await postToLinkedIn({ text: caption, imageUrl: mediaUrl });
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
