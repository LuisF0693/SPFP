import { supabase } from '../supabase';

export type InteractionType = 'ACCESS' | 'CHANGE';

export interface InteractionLog {
    id?: string;
    created_at?: string;
    admin_id: string;
    client_id: string;
    action_type: InteractionType;
    description: string;
    metadata?: any;
}

export const logInteraction = async (log: Omit<InteractionLog, 'id' | 'created_at'>) => {
    try {
        const { error } = await supabase
            .from('interaction_logs')
            .insert(log);

        if (error) {
            console.error('Error logging interaction:', error);
            return { error };
        }

        return { success: true };
    } catch (err) {
        console.error('Unexpected error logging interaction:', err);
        return { error: err };
    }
};

export const getInteractionLogs = async (clientId: string) => {
    try {
        const { data, error } = await supabase
            .from('interaction_logs')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching interaction logs:', error);
            return { error };
        }

        return { data: data as InteractionLog[] };
    } catch (err) {
        console.error('Unexpected error fetching interaction logs:', err);
        return { error: err };
    }
};
