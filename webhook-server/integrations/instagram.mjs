// integrations/instagram.mjs — Meta Graph API (Instagram Business)
// Docs: https://developers.facebook.com/docs/instagram-api/guides/content-publishing

import axios from 'axios';
import { META } from '../config.mjs';

const GRAPH = 'https://graph.facebook.com/v18.0';

/**
 * Posta um conteúdo de texto/imagem no Instagram Business.
 * Para Reels, a mídia precisa ser uma URL pública acessível.
 */
export async function postToInstagram({ caption, imageUrl, videoUrl, isReel = false }) {
  if (!META.ACCESS_TOKEN || !META.INSTAGRAM_ACCOUNT_ID) {
    console.warn('[Instagram] Credenciais não configuradas — pulando postagem');
    return { skipped: true, reason: 'credentials_missing' };
  }

  try {
    // Passo 1: criar container de mídia
    const containerPayload = {
      caption,
      access_token: META.ACCESS_TOKEN,
    };

    if (isReel && videoUrl) {
      containerPayload.media_type = 'REELS';
      containerPayload.video_url = videoUrl;
      containerPayload.share_to_feed = true;
    } else if (imageUrl) {
      containerPayload.image_url = imageUrl;
    } else {
      // Post só com texto não é suportado no Instagram — precisa de mídia
      console.warn('[Instagram] Post requer imagem ou vídeo');
      return { skipped: true, reason: 'media_required' };
    }

    const { data: container } = await axios.post(
      `${GRAPH}/${META.INSTAGRAM_ACCOUNT_ID}/media`,
      containerPayload
    );
    console.log(`[Instagram] Container criado: ${container.id}`);

    // Passo 2: aguardar processamento (especialmente para vídeos)
    if (isReel) await sleep(10000);

    // Passo 3: publicar
    const { data: publish } = await axios.post(
      `${GRAPH}/${META.INSTAGRAM_ACCOUNT_ID}/media_publish`,
      { creation_id: container.id, access_token: META.ACCESS_TOKEN }
    );
    console.log(`[Instagram] ✅ Publicado: ${publish.id}`);
    return { success: true, postId: publish.id };

  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error(`[Instagram] ❌ Erro: ${msg}`);
    return { success: false, error: msg };
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
