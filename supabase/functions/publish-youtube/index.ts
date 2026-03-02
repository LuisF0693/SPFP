// Supabase Edge Function: publish-youtube
// Upload de vídeos para YouTube via Data API v3
// Story 11.4 — EPIC-011

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshYouTubeToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to refresh YouTube token');
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content_id, user_id, privacy = 'public' } = await req.json();
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

    // Busca credenciais YouTube
    const { data: creds } = await supabase
      .from('social_credentials')
      .select('*')
      .eq('user_id', user_id)
      .eq('platform', 'youtube')
      .single();

    if (!creds) {
      return new Response(JSON.stringify({ error: 'Credenciais YouTube não configuradas' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { refresh_token, metadata } = creds;
    const { client_id, client_secret } = metadata || {};

    if (!refresh_token || !client_id) {
      return new Response(JSON.stringify({ error: 'Refresh token ou Client ID ausentes' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Refresh access token
    const accessToken = await refreshYouTubeToken(client_id, client_secret, refresh_token);

    // Get video URL from storage
    const videoUrl = content.media_urls?.find((u: string) => u.match(/\.(mp4|mov|avi|webm)$/i));
    if (!videoUrl) {
      return new Response(JSON.stringify({ error: 'Nenhum vídeo encontrado no conteúdo' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch video from storage
    const videoRes = await fetch(videoUrl);
    const videoBlob = await videoRes.blob();

    // YouTube Resumable Upload
    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/*',
          'X-Upload-Content-Length': String(videoBlob.size),
        },
        body: JSON.stringify({
          snippet: {
            title: content.title,
            description: content.caption || '',
            tags: content.hashtags || [],
            categoryId: '22', // People & Blogs
          },
          status: {
            privacyStatus: privacy, // 'public' | 'unlisted' | 'private'
          },
        }),
      }
    );

    const uploadUrl = initRes.headers.get('Location');
    if (!uploadUrl) throw new Error('Failed to initialize YouTube upload');

    // Upload video bytes
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/*',
        'Content-Length': String(videoBlob.size),
      },
      body: videoBlob,
    });

    const uploadData = await uploadRes.json();
    const videoId = uploadData.id;

    if (!videoId) throw new Error('YouTube upload failed: ' + JSON.stringify(uploadData));

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Update content as published
    await supabase.from('marketing_content').update({
      status: 'published',
      published_at: new Date().toISOString(),
      published_urls: { ...(content.published_urls || {}), youtube: youtubeUrl },
    }).eq('id', content_id);

    return new Response(JSON.stringify({ success: true, video_id: videoId, youtube_url: youtubeUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
