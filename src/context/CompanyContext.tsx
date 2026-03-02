import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';
import { CompanySquad, CompanyBoard } from '../types/company';

const DEFAULT_SQUADS: Omit<CompanySquad, 'id' | 'user_id' | 'created_at'>[] = [
  { name: 'Marketing',        icon: '🎯', color: '#ec4899', description: 'Squad de Marketing e Growth',        is_archived: false, sort_order: 0 },
  { name: 'Vendas',           icon: '💰', color: '#10b981', description: 'Squad de Vendas e Closers',          is_archived: false, sort_order: 1 },
  { name: 'Produtos',         icon: '📦', color: '#3b82f6', description: 'Squad de Produto e Conteúdo',        is_archived: false, sort_order: 2 },
  { name: 'OPS',              icon: '⚙️', color: '#f59e0b', description: 'Squad de Operações e Processos',     is_archived: false, sort_order: 3 },
  { name: 'Customer Success', icon: '💬', color: '#8b5cf6', description: 'Squad de CS e Retenção',            is_archived: false, sort_order: 4 },
  { name: 'Admin',            icon: '🏛️', color: '#6b7280', description: 'Squad Administrativo e Financeiro', is_archived: false, sort_order: 5 },
];

interface CompanyContextValue {
  // Squads
  squads: CompanySquad[];
  isLoading: boolean;
  addSquad: (data: Omit<CompanySquad, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateSquad: (id: string, data: Partial<CompanySquad>) => Promise<void>;
  archiveSquad: (id: string) => Promise<void>;
  // Boards
  boards: CompanyBoard[];
  boardsLoading: boolean;
  loadBoards: (squadId: string) => Promise<void>;
  addBoard: (data: Omit<CompanyBoard, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateBoard: (id: string, data: Partial<CompanyBoard>) => Promise<void>;
  archiveBoard: (id: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used inside CompanyProvider');
  return ctx;
};

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [squads, setSquads] = useState<CompanySquad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState<CompanyBoard[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(false);

  // ---- Squads ----
  const seedDefaultSquads = useCallback(async (userId: string) => {
    const { data: existing } = await supabase
      .from('company_squads')
      .select('id')
      .eq('user_id', userId);

    if (!existing || existing.length === 0) {
      const rows = DEFAULT_SQUADS.map((s) => ({ ...s, user_id: userId }));
      await supabase.from('company_squads').insert(rows);
    }
  }, []);

  const loadSquads = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      await seedDefaultSquads(userId);
      const { data, error } = await supabase
        .from('company_squads')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('sort_order');

      if (error) throw error;
      setSquads(data || []);
    } catch (err) {
      console.error('[CompanyContext] Error loading squads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [seedDefaultSquads]);

  useEffect(() => {
    if (user) {
      loadSquads(user.id);
    } else {
      setSquads([]);
      setBoards([]);
    }
  }, [user, loadSquads]);

  const addSquad = useCallback(async (data: Omit<CompanySquad, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from('company_squads')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setSquads((prev) => [...prev, inserted].sort((a, b) => a.sort_order - b.sort_order));
  }, [user]);

  const updateSquad = useCallback(async (id: string, data: Partial<CompanySquad>) => {
    const { data: updated, error } = await supabase
      .from('company_squads')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setSquads((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, []);

  const archiveSquad = useCallback(async (id: string) => {
    await updateSquad(id, { is_archived: true });
    setSquads((prev) => prev.filter((s) => s.id !== id));
  }, [updateSquad]);

  // ---- Boards ----
  const loadBoards = useCallback(async (squadId: string) => {
    setBoardsLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_boards')
        .select('*')
        .eq('squad_id', squadId)
        .eq('is_archived', false)
        .order('sort_order');
      if (error) throw error;
      setBoards(data || []);
    } catch (err) {
      console.error('[CompanyContext] Error loading boards:', err);
    } finally {
      setBoardsLoading(false);
    }
  }, []);

  const addBoard = useCallback(async (data: Omit<CompanyBoard, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from('company_boards')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setBoards((prev) => [...prev, inserted].sort((a, b) => a.sort_order - b.sort_order));
  }, [user]);

  const updateBoard = useCallback(async (id: string, data: Partial<CompanyBoard>) => {
    const { data: updated, error } = await supabase
      .from('company_boards')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setBoards((prev) => prev.map((b) => (b.id === id ? updated : b)));
  }, []);

  const archiveBoard = useCallback(async (id: string) => {
    await updateBoard(id, { is_archived: true });
    setBoards((prev) => prev.filter((b) => b.id !== id));
  }, [updateBoard]);

  return (
    <CompanyContext.Provider value={{
      squads, isLoading, addSquad, updateSquad, archiveSquad,
      boards, boardsLoading, loadBoards, addBoard, updateBoard, archiveBoard,
    }}>
      {children}
    </CompanyContext.Provider>
  );
};
