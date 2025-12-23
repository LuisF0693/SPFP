
import { supabase } from '../supabase';

export interface AIInteraction {
  id?: string;
  userId: string;
  prompt: string;
  response: string;
  timestamp: Date;
  metadata?: any;
}

/**
 * Salva uma nova interação com a IA no Supabase.
 */
export const saveAIInteraction = async (
  userId: string,
  prompt: string,
  response: string,
  metadata?: any
): Promise<string> => {
  try {
    const { data, error } = await supabase.from('ai_history').insert({
      user_id: userId,
      prompt,
      response,
      metadata: metadata || {}
    }).select('id').single();

    if (error) throw error;
    return data.id;
  } catch (e) {
    console.error("Erro ao salvar histórico de IA: ", e);
    throw e;
  }
};

/**
 * Busca o histórico de interações de um usuário específico.
 */
export const getAIHistory = async (userId: string): Promise<AIInteraction[]> => {
  try {
    const { data, error } = await supabase
      .from('ai_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      prompt: item.prompt,
      response: item.response,
      timestamp: new Date(item.created_at),
      metadata: item.metadata
    }));
  } catch (e) {
    console.error("Erro ao buscar histórico de IA: ", e);
    return [];
  }
};
