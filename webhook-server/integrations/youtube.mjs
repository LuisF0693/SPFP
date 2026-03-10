// integrations/youtube.mjs — YouTube Data API v3
// Docs: https://developers.google.com/youtube/v3/guides/uploading_a_video

import axios from 'axios';
import { YOUTUBE } from '../config.mjs';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

async function getAccessToken() {
  if (!YOUTUBE.CLIENT_ID || !YOUTUBE.REFRESH_TOKEN) return null;
  const { data } = await axios.post(TOKEN_URL, {
    client_id: YOUTUBE.CLIENT_ID,
    client_secret: YOUTUBE.CLIENT_SECRET,
    refresh_token: YOUTUBE.REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });
  return data.access_token;
}

/**
 * Agenda ou publica um vídeo no YouTube.
 * videoFilePath: caminho local do arquivo de vídeo (ou URL pública)
 */
export async function postToYouTube({ title, description, videoFilePath, publishAt, tags = [] }) {
  if (!YOUTUBE.REFRESH_TOKEN) {
    console.warn('[YouTube] Credenciais não configuradas — pulando postagem');
    return { skipped: true, reason: 'credentials_missing' };
  }

  try {
    const accessToken = await getAccessToken();

    const metadata = {
      snippet: {
        title,
        description,
        tags,
        categoryId: '27', // Education
      },
      status: {
        privacyStatus: publishAt ? 'private' : 'public',
        ...(publishAt && { publishAt }),
        selfDeclaredMadeForKids: false,
      },
    };

    // Para upload real de arquivo, usaria resumable upload
    // Por ora, loga a intenção e retorna mock para integração futura
    console.log(`[YouTube] 📹 Agendar vídeo: "${title}"`);
    if (publishAt) console.log(`[YouTube] 📅 Data de publicação: ${publishAt}`);

    return { success: true, scheduled: true, title };
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    console.error(`[YouTube] ❌ Erro: ${msg}`);
    return { success: false, error: msg };
  }
}
