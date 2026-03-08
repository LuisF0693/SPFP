import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

// Conteúdos criados pelo Squad de Marketing (Thiago Finch) — Semana 1
// Fonte: squads/spfp-marketing/outputs/conteudo/CONTEUDO-SPFP.md
const SEED_CONTENTS: Omit<MarketingContent, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    title: 'Vídeo 1 — Hook de Dor: "Você sabe quanto gastou esse mês?"',
    content_type: 'reel',
    platform: ['instagram', 'youtube'],
    caption: `Você sabe exatamente quanto gastou esse mês? 👀

A maioria das pessoas não sabe. E isso não é descuido — é falta de visibilidade.

O SPFP resolve isso em 30 segundos.

👇 Link na bio pra testar`,
    hashtags: ['financaspessoais', 'controledefinancas', 'educacaofinanceira', 'dinheiro', 'planejamentofinanceiro', 'spfp', 'vidareal', 'financas'],
    status: 'ready',
    created_by_agent: 'Thiago Finch — AI Head de Marketing',
  },
  {
    title: 'Vídeo 2 — Case Real: Cliente 80 anos ⭐',
    content_type: 'reel',
    platform: ['instagram', 'youtube'],
    caption: `Meu cliente tem 80 anos. Chegou até mim devendo imposto de renda. 👴

Não sabia pra onde ia o dinheiro. Tentava guardar mas nunca conseguia.

Hoje ele já está pagando a dívida e começou a guardar dinheiro.

O que mudou? Clareza.

Se funcionou pra ele, funciona pra você também.

👇 Link na bio`,
    hashtags: ['transformacaofinanceira', 'financaspessoais', 'depoimento', 'controledefinancas', 'educacaofinanceira', 'spfp', 'resultado', 'dinheiro'],
    status: 'ready',
    created_by_agent: 'Thiago Finch — AI Head de Marketing',
  },
  {
    title: 'Vídeo 3 — Demo do Produto (Screencast)',
    content_type: 'reel',
    platform: ['instagram', 'youtube'],
    caption: `30 segundos para ver onde seu dinheiro foi 👇

Dashboard em tempo real. Metas automáticas. Consultor IA disponível 24h.

R$99,90/mês. Sem enrolação.

Acessa o link na bio e começa agora.`,
    hashtags: ['financaspessoais', 'controledefinancas', 'app', 'spfp', 'planejamentofinanceiro', 'dinheiro', 'metas', 'consultorIA'],
    status: 'draft',
    created_by_agent: 'Thiago Finch — AI Head de Marketing',
  },
  {
    title: 'Vídeo 4 — Educação: 3 Gastos Invisíveis',
    content_type: 'reel',
    platform: ['instagram', 'youtube'],
    caption: `3 gastos que somem com seu salário todo mês (sem você perceber) 👇

1️⃣ Assinaturas esquecidas
2️⃣ Delivery e alimentação fora
3️⃣ Parcelas que acumulam

Esses três ficam invisíveis até alguém te mostrar.

O SPFP mostra. Link na bio.`,
    hashtags: ['financaspessoais', 'gastosInvisiveis', 'educacaofinanceira', 'dinheiro', 'spfp', 'planejamento', 'controledefinancas', 'vidareal'],
    status: 'ready',
    created_by_agent: 'Thiago Finch — AI Head de Marketing',
  },
  {
    title: 'Vídeo 5 — Oferta Direta: R$99,90 com Garantia',
    content_type: 'reel',
    platform: ['instagram', 'youtube'],
    caption: `Você gasta mais de R$99,90/mês em coisas que não lembra de ter comprado.

Tenho certeza disso.

Por R$99,90/mês o SPFP te mostra exatamente onde está indo seu dinheiro.

7 dias. Se não ver valor, devolvo tudo.

👇 Link na bio`,
    hashtags: ['financaspessoais', 'spfp', 'oferta', 'garantia', 'controledefinancas', 'planejamentofinanceiro', 'dinheiro', 'investimento'],
    status: 'ready',
    created_by_agent: 'Thiago Finch — AI Head de Marketing',
  },
  {
    title: 'Carrossel 1 — "Por que seu dinheiro some todo mês"',
    content_type: 'carousel',
    platform: ['instagram'],
    caption: `Você ganha bem mas o dinheiro some todo mês? Isso é mais comum do que parece — e tem solução.

Salva esse post e para de deixar o dinheiro escorrer pelos dedos.

👇 Link na bio para começar`,
    hashtags: ['financaspessoais', 'educacaofinanceira', 'dinheiro', 'controledefinancas', 'spfp', 'planejamento', 'carrossel', 'finanças'],
    status: 'draft',
    created_by_agent: 'Thiago Finch — AI Head de Marketing',
  },
];

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
  return useContext(MarketingContext); // retorna null quando fora do MarketingProvider
};

export const MarketingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [contents, setContents] = useState<MarketingContent[]>([]);
  const [loading, setLoading] = useState(false);

  const seedDefaultContents = useCallback(async (userId: string) => {
    const rows = SEED_CONTENTS.map((c) => ({ ...c, user_id: userId }));
    await supabase.from('marketing_content').insert(rows);
  }, []);

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

      // Se biblioteca vazia, popula com conteúdos da Semana 1 (Squad Marketing)
      if (!data || data.length === 0) {
        await seedDefaultContents(user.id);
        const { data: seeded } = await supabase
          .from('marketing_content')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setContents(seeded || []);
        return;
      }

      setContents(data || []);
    } catch (err) {
      console.error('[MarketingContext] Error loading contents:', err);
    } finally {
      setLoading(false);
    }
  }, [user, seedDefaultContents]);

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
