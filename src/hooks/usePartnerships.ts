import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { Partner, PartnershipClient } from '../types/investments';

const PARTNERS_STORAGE_KEY = 'spfp_partners_v2';
const CLIENTS_STORAGE_KEY = 'spfp_partnership_clients';

export function usePartnerships() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [clients, setClients] = useState<PartnershipClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage and Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId = user?.id || 'local';

        // Load from localStorage first
        const storedPartners = localStorage.getItem(`${PARTNERS_STORAGE_KEY}_${userId}`);
        const storedClients = localStorage.getItem(`${CLIENTS_STORAGE_KEY}_${userId}`);

        if (storedPartners) {
          setPartners(JSON.parse(storedPartners));
        }
        if (storedClients) {
          setClients(JSON.parse(storedClients));
        }

        // If authenticated, sync with Supabase
        if (user) {
          // Fetch partners
          const { data: partnersData, error: partnersError } = await supabase
            .from('partners_v2')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (partnersError && partnersError.code !== 'PGRST116') {
            console.warn('Error fetching partners:', partnersError);
          }

          if (partnersData) {
            setPartners(partnersData);
            localStorage.setItem(`${PARTNERS_STORAGE_KEY}_${user.id}`, JSON.stringify(partnersData));
          }

          // Fetch clients with partner info
          const { data: clientsData, error: clientsError } = await supabase
            .from('partnership_clients')
            .select(`
              *,
              partner:partners_v2(*)
            `)
            .eq('user_id', user.id)
            .order('closed_at', { ascending: false });

          if (clientsError && clientsError.code !== 'PGRST116') {
            console.warn('Error fetching partnership clients:', clientsError);
          }

          if (clientsData) {
            setClients(clientsData);
            localStorage.setItem(`${CLIENTS_STORAGE_KEY}_${user.id}`, JSON.stringify(clientsData));
          }
        }
      } catch (err) {
        console.error('Failed to load partnerships:', err);
        setError('Erro ao carregar parcerias');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Add partner
  const addPartner = useCallback(
    async (data: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; partner?: Partner; error?: string }> => {
      // For non-authenticated users, use localStorage only with crypto UUID
      if (!user) {
        const localPartner: Partner = {
          ...data,
          id: crypto.randomUUID(),
          user_id: 'local',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const newPartners = [localPartner, ...partners];
        setPartners(newPartners);
        localStorage.setItem(`${PARTNERS_STORAGE_KEY}_local`, JSON.stringify(newPartners));
        return { success: true, partner: localPartner };
      }

      // For authenticated users, let Supabase generate the UUID
      try {
        const { data: insertedPartner, error: insertError } = await supabase
          .from('partners_v2')
          .insert({
            user_id: user.id,
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            default_commission_rate: data.default_commission_rate,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Failed to save partner:', insertError);
          setError('Erro ao salvar parceiro. Tente novamente.');
          return { success: false, error: 'Erro ao salvar parceiro. Tente novamente.' };
        }

        // Update local state with the real data from Supabase
        const newPartners = [insertedPartner, ...partners];
        setPartners(newPartners);
        localStorage.setItem(`${PARTNERS_STORAGE_KEY}_${user.id}`, JSON.stringify(newPartners));
        setError(null);

        return { success: true, partner: insertedPartner };
      } catch (err) {
        console.error('Failed to save partner:', err);
        setError('Erro ao salvar parceiro. Verifique sua conexão.');
        return { success: false, error: 'Erro ao salvar parceiro. Verifique sua conexão.' };
      }
    },
    [partners, user]
  );

  // Update partner
  const updatePartner = useCallback(
    async (id: string, updates: Partial<Partner>) => {
      const newPartners = partners.map(p =>
        p.id === id
          ? { ...p, ...updates, updated_at: new Date().toISOString() }
          : p
      );
      setPartners(newPartners);
      localStorage.setItem(
        `${PARTNERS_STORAGE_KEY}_${user?.id || 'local'}`,
        JSON.stringify(newPartners)
      );

      if (user) {
        try {
          const { error: updateError } = await supabase
            .from('partners_v2')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Failed to update partner:', updateError);
          }
        } catch (err) {
          console.error('Failed to update partner:', err);
        }
      }
    },
    [partners, user]
  );

  // Delete partner
  const deletePartner = useCallback(
    async (id: string) => {
      const newPartners = partners.filter(p => p.id !== id);
      setPartners(newPartners);
      localStorage.setItem(
        `${PARTNERS_STORAGE_KEY}_${user?.id || 'local'}`,
        JSON.stringify(newPartners)
      );

      // Also remove related clients
      const newClients = clients.filter(c => c.partner_id !== id);
      setClients(newClients);
      localStorage.setItem(
        `${CLIENTS_STORAGE_KEY}_${user?.id || 'local'}`,
        JSON.stringify(newClients)
      );

      if (user) {
        try {
          await supabase.from('partners_v2').delete().eq('id', id).eq('user_id', user.id);
        } catch (err) {
          console.error('Failed to delete partner:', err);
        }
      }
    },
    [partners, clients, user]
  );

  // Add client
  const addClient = useCallback(
    async (data: Omit<PartnershipClient, 'id' | 'created_at' | 'total_commission' | 'my_share' | 'partner_share'>): Promise<{ success: boolean; client?: PartnershipClient; error?: string }> => {
      const totalCommission = (data.contract_value * data.commission_rate) / 100;
      const partner = partners.find(p => p.id === data.partner_id);

      // For non-authenticated users, use localStorage only with crypto UUID
      if (!user) {
        const localClient: PartnershipClient = {
          ...data,
          id: crypto.randomUUID(),
          user_id: 'local',
          total_commission: totalCommission,
          my_share: totalCommission / 2,
          partner_share: totalCommission / 2,
          partner,
          created_at: new Date().toISOString(),
        };
        const newClients = [localClient, ...clients];
        setClients(newClients);
        localStorage.setItem(`${CLIENTS_STORAGE_KEY}_local`, JSON.stringify(newClients));
        return { success: true, client: localClient };
      }

      // For authenticated users, let Supabase generate the UUID
      // Note: total_commission, my_share, partner_share are computed columns in DB
      try {
        const { data: insertedClient, error: insertError } = await supabase
          .from('partnership_clients')
          .insert({
            user_id: user.id,
            partner_id: data.partner_id,
            client_name: data.client_name,
            contract_value: data.contract_value,
            commission_rate: data.commission_rate,
            status: data.status || 'pending',
            closed_at: data.closed_at || null,
            notes: (data as any).notes || null,
          })
          .select(`
            *,
            partner:partners_v2(*)
          `)
          .single();

        if (insertError) {
          console.error('Failed to save client:', insertError);
          setError('Erro ao salvar cliente. Tente novamente.');
          return { success: false, error: 'Erro ao salvar cliente. Tente novamente.' };
        }

        // Update local state with the real data from Supabase
        const newClients = [insertedClient, ...clients];
        setClients(newClients);
        localStorage.setItem(`${CLIENTS_STORAGE_KEY}_${user.id}`, JSON.stringify(newClients));
        setError(null);

        return { success: true, client: insertedClient };
      } catch (err) {
        console.error('Failed to save client:', err);
        setError('Erro ao salvar cliente. Verifique sua conexão.');
        return { success: false, error: 'Erro ao salvar cliente. Verifique sua conexão.' };
      }
    },
    [clients, partners, user]
  );

  // Update client
  const updateClient = useCallback(
    async (id: string, updates: Partial<PartnershipClient>) => {
      const newClients = clients.map(c => {
        if (c.id !== id) return c;

        const updatedClient = { ...c, ...updates };
        // Recalculate commission if values changed
        if (updates.contract_value !== undefined || updates.commission_rate !== undefined) {
          const value = updates.contract_value ?? c.contract_value;
          const rate = updates.commission_rate ?? c.commission_rate;
          updatedClient.total_commission = (value * rate) / 100;
          updatedClient.my_share = updatedClient.total_commission / 2;
          updatedClient.partner_share = updatedClient.total_commission / 2;
        }
        return updatedClient;
      });

      setClients(newClients);
      localStorage.setItem(
        `${CLIENTS_STORAGE_KEY}_${user?.id || 'local'}`,
        JSON.stringify(newClients)
      );

      if (user) {
        try {
          const { partner: _, ...clientUpdates } = updates as any;
          const { error: updateError } = await supabase
            .from('partnership_clients')
            .update(clientUpdates)
            .eq('id', id)
            .eq('user_id', user.id);

          if (updateError) {
            console.error('Failed to update client:', updateError);
          }
        } catch (err) {
          console.error('Failed to update client:', err);
        }
      }
    },
    [clients, user]
  );

  // Delete client
  const deleteClient = useCallback(
    async (id: string) => {
      const newClients = clients.filter(c => c.id !== id);
      setClients(newClients);
      localStorage.setItem(
        `${CLIENTS_STORAGE_KEY}_${user?.id || 'local'}`,
        JSON.stringify(newClients)
      );

      if (user) {
        try {
          await supabase.from('partnership_clients').delete().eq('id', id).eq('user_id', user.id);
        } catch (err) {
          console.error('Failed to delete client:', err);
        }
      }
    },
    [clients, user]
  );

  // Calculate stats
  const stats = useMemo(() => {
    const totalContractValue = clients.reduce((sum, c) => sum + c.contract_value, 0);
    const totalCommission = clients.reduce((sum, c) => sum + c.total_commission, 0);
    const totalMyShare = clients.reduce((sum, c) => sum + c.my_share, 0);
    const totalPartnerShare = clients.reduce((sum, c) => sum + c.partner_share, 0);

    const pendingClients = clients.filter(c => c.status === 'pending');
    const paidClients = clients.filter(c => c.status === 'paid');

    const pendingMyShare = pendingClients.reduce((sum, c) => sum + c.my_share, 0);
    const paidMyShare = paidClients.reduce((sum, c) => sum + c.my_share, 0);

    // Monthly revenue (last 12 months)
    const now = new Date();
    const monthlyRevenue: { month: string; value: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthClients = clients.filter(c => {
        const closedDate = new Date(c.closed_at);
        return closedDate.getFullYear() === date.getFullYear() &&
          closedDate.getMonth() === date.getMonth();
      });
      monthlyRevenue.push({
        month: monthKey,
        value: monthClients.reduce((sum, c) => sum + c.my_share, 0),
      });
    }

    return {
      totalPartners: partners.length,
      totalClients: clients.length,
      totalContractValue,
      totalCommission,
      totalMyShare,
      totalPartnerShare,
      pendingCount: pendingClients.length,
      paidCount: paidClients.length,
      pendingMyShare,
      paidMyShare,
      monthlyRevenue,
    };
  }, [partners, clients]);

  // Get clients by partner
  const getClientsByPartner = useCallback(
    (partnerId: string) => clients.filter(c => c.partner_id === partnerId),
    [clients]
  );

  return {
    partners,
    clients,
    loading,
    error,
    stats,
    addPartner,
    updatePartner,
    deletePartner,
    addClient,
    updateClient,
    deleteClient,
    getClientsByPartner,
  };
}

export default usePartnerships;
