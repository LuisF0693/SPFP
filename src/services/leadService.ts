import { supabase } from '../supabase';

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  source: 'landing_page' | 'demo_request' | 'pricing';
  created_at?: string;
  status?: 'new' | 'contacted' | 'converted';
}

/**
 * Salva um novo lead na tabela 'leads'
 */
export async function saveLead(lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead | null> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          source: lead.source || 'landing_page',
          status: 'new',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar lead:', error);
      return null;
    }

    return data as Lead;
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
    return null;
  }
}

/**
 * Verifica se um email já existe na lista de leads
 */
export async function leadExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar lead:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Erro ao verificar lead:', error);
    return false;
  }
}

/**
 * Obtém todos os leads (para admin)
 */
export async function getAllLeads(): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao obter leads:', error);
      return [];
    }

    return (data as Lead[]) || [];
  } catch (error) {
    console.error('Erro ao obter leads:', error);
    return [];
  }
}

/**
 * Atualiza o status de um lead
 */
export async function updateLeadStatus(
  leadId: string,
  status: 'new' | 'contacted' | 'converted'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId);

    if (error) {
      console.error('Erro ao atualizar lead:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar lead:', error);
    return false;
  }
}
