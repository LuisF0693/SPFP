import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validar metodo
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Metodo nao permitido' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extrair e validar JWT do usuario
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Nao autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userToken = authHeader.replace('Bearer ', '');

    // Cliente com token do usuario (para verificar identidade)
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${userToken}` } } }
    );

    // Verificar usuario autenticado
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuario nao autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // Cliente com service_role para operacoes privilegiadas
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Executar hard delete de todos os dados do usuario
    const { data: deleteResult, error: deleteError } = await supabaseAdmin
      .rpc('hard_delete_user_data', { p_user_id: userId });

    if (deleteError) {
      console.error('Erro ao deletar dados:', deleteError);
      return new Response(JSON.stringify({
        error: 'Erro ao excluir dados. Tente novamente ou entre em contato com o suporte.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deletar usuario do Auth (apos dados deletados)
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      console.error('Erro ao deletar usuario do Auth:', authDeleteError);
      // Nao falhar — dados ja foram deletados, logar para investigacao
    }

    console.log(`Hard delete concluido para usuario ${userId}:`, deleteResult);

    return new Response(JSON.stringify({
      success: true,
      message: 'Conta excluida com sucesso. Todos os seus dados foram removidos permanentemente.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro inesperado em delete-account:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
