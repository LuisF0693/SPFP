// Supabase Edge Function: publish-meta
// Publica conteúdo no Instagram/Facebook via Meta Business API
// Story 11.3 — EPIC-011

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content_id, user_id } = await req.json();
    if (!content_id || !user_id) {
      return new Response(JSON.stringify({ error: 'content_id e user_id são obrigatórios' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Busca conteúdo
    const { data: content, error: contentErr } = await supabase
      .from('marketing_content')
      .select('*')
      .eq('id', content_id)
      .eq('user_id', user_id)
      .single();

    if (contentErr || !content) {
      return new Response(JSON.stringify({ error: 'Conteúdo não encontrado' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Busca credenciais Meta
    const { data: creds, error: credsErr } = await supabase
      .from('social_credentials')
      .select('*')
      .eq('user_id', user_id)
      .eq('platform', 'meta')
      .single();

    if (credsErr || !creds) {
      return new Response(JSON.stringify({ error: 'Credenciais Meta não configuradas. Configure em Marketing Hub → Configurações.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { access_token, page_id, account_id: instagram_account_id } = creds;
    const publishedUrls: Record<string, string> = {};

    // Publicar no Instagram (se plataforma inclusa e conta configurada)
    if (content.platform.includes('instagram') && instagram_account_id && content.media_urls?.length > 0) {
      const mediaUrl = content.media_urls[0];
      const isVideo = mediaUrl.match(/\.(mp4|mov|avi)$/i);

      // Step 1: Create media container
      const containerParams = new URLSearchParams({
        access_token,
        caption: `${content.caption || ''}\n\n${(content.hashtags || []).map((h: string) => `#${h}`).join(' ')}`.trim(),
        ...(isVideo ? { video_url: mediaUrl, media_type: 'REELS' } : { image_url: mediaUrl }),
      });

      const containerRes = await fetch(
        `https://graph.facebook.com/v18.0/${instagram_account_id}/media?${containerParams}`,
        { method: 'POST' }
      );
      const container = await containerRes.json();

      if (container.id) {
        // Step 2: Publish container
        const publishRes = await fetch(
          `https://graph.facebook.com/v18.0/${instagram_account_id}/media_publish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creation_id: container.id, access_token }),
          }
        );
        const published = await publishRes.json();
        if (published.id) {
          publishedUrls.instagram = `https://www.instagram.com/p/${published.id}`;
        }
      }
    }

    // Publicar no Facebook Page
    if (content.platform.includes('facebook') && page_id) {
      const fbParams = new URLSearchParams({
        access_token,
        message: `${content.caption || ''}\n\n${(content.hashtags || []).map((h: string) => `#${h}`).join(' ')}`.trim(),
      });

      if (content.media_urls?.length > 0) {
        fbParams.append('link', content.media_urls[0]);
      }

      const fbRes = await fetch(
        `https://graph.facebook.com/v18.0/${page_id}/feed?${fbParams}`,
        { method: 'POST' }
      );
      const fbPost = await fbRes.json();
      if (fbPost.id) {
        publishedUrls.facebook = `https://www.facebook.com/${fbPost.id}`;
      }
    }

    // Atualiza conteúdo como publicado
    await supabase.from('marketing_content').update({
      status: 'published',
      published_at: new Date().toISOString(),
      published_urls: publishedUrls,
    }).eq('id', content_id);

    return new Response(JSON.stringify({ success: true, published_urls: publishedUrls }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
