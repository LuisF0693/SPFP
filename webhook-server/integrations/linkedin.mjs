// integrations/linkedin.mjs — LinkedIn API v2
// Docs: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api

import axios from 'axios';
import { LINKEDIN } from '../config.mjs';

const BASE = 'https://api.linkedin.com/v2';

/**
 * Posta texto no LinkedIn (perfil pessoal ou página da empresa).
 */
export async function postToLinkedIn({ text, imageUrl }) {
  if (!LINKEDIN.ACCESS_TOKEN) {
    console.warn('[LinkedIn] Credenciais não configuradas — pulando postagem');
    return { skipped: true, reason: 'credentials_missing' };
  }

  try {
    const author = LINKEDIN.ORG_ID
      ? `urn:li:organization:${LINKEDIN.ORG_ID}`
      : 'urn:li:person:me';

    const payload = {
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
          ...(imageUrl && {
            media: [{ status: 'READY', originalUrl: imageUrl }],
          }),
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    const { data } = await axios.post(`${BASE}/ugcPosts`, payload, {
      headers: {
        Authorization: `Bearer ${LINKEDIN.ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    console.log(`[LinkedIn] ✅ Publicado: ${data.id}`);
    return { success: true, postId: data.id };
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    console.error(`[LinkedIn] ❌ Erro: ${msg}`);
    return { success: false, error: msg };
  }
}
