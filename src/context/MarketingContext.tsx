import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

export type ContentType = 'post' | 'reel' | 'story' | 'carousel' | 'email';
export type ContentStatus = 'draft' | 'ready' | 'scheduled' | 'publishing' | 'published' | 'failed';
export type Platform = 'instagram' | 'facebook' | 'youtube' | 'email';

export interface MarketingContent {
  id: string;
  user_id: string;
  title: string;
  content_type: ContentType;
  platform: Platform[];
  caption?: string;
  hashtags?: string[];
  media_urls?: string[];
  status: ContentStatus;
  scheduled_at?: string;
  published_at?: string;
  published_urls?: Record<string, string>;
  created_by_agent?: string;
  created_at: string;
  updated_at: string;
}

interface MarketingContextValue {
  contents: MarketingContent[];
  loading: boolean;
  loadContents: () => Promise<void>;
  addContent: (data: Omit<MarketingContent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<MarketingContent>;
  updateContent: (id: string, data: Partial<MarketingContent>) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  uploadMedia: (file: File, contentId: string) => Promise<string>;
}

const MarketingContext = createContext<MarketingContextValue | null>(null);

export const useMarketing = () => {
  const ctx = useContext(MarketingContext);
  if (!ctx) throw new Error('useMarketing must be used inside MarketingProvider');
  return ctx;
};

export const MarketingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [contents, setContents] = useState<MarketingContent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadContents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketing_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setContents(data || []);
    } catch (err) {
      console.error('[MarketingContext] Error loading contents:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addContent = useCallback(async (data: Omit<MarketingContent, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<MarketingContent> => {
    if (!user) throw new Error('Not authenticated');
    const { data: inserted, error } = await supabase
      .from('marketing_content')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setContents((prev) => [inserted, ...prev]);
    return inserted;
  }, [user]);

  const updateContent = useCallback(async (id: string, data: Partial<MarketingContent>) => {
    const { data: updated, error } = await supabase
      .from('marketing_content')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setContents((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);

  const deleteContent = useCallback(async (id: string) => {
    const { error } = await supabase.from('marketing_content').delete().eq('id', id);
    if (error) throw error;
    setContents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const uploadMedia = useCallback(async (file: File, contentId: string): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${contentId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('content-media').upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('content-media').getPublicUrl(path);
    return publicUrl;
  }, [user]);

  return (
    <MarketingContext.Provider value={{ contents, loading, loadContents, addContent, updateContent, deleteContent, uploadMedia }}>
      {children}
    </MarketingContext.Provider>
  );
};
