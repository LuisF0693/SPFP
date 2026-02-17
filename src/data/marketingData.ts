/**
 * Mock data para Marketing Dashboard
 * Posts, criativos, métricas de engajamento
 */

import { format, addDays, addMonths } from 'date-fns';

export interface MarketingPost {
  id: string;
  title: string;
  description: string;
  platform: 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'other';
  status: 'draft' | 'pending' | 'approved' | 'posted' | 'rejected';
  scheduled_date: string; // ISO date
  posted_date?: string;
  image_url?: string;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  created_at: string;
  updated_at: string;
}

const today = new Date();
const currentMonth = format(today, 'yyyy-MM');

export const marketingMockData = {
  posts: [
    {
      id: 'post-1',
      title: 'Dicas de Produtividade',
      description: 'Compartilhando 5 dicas essenciais para aumentar sua produtividade em 2026',
      platform: 'linkedin' as const,
      status: 'posted' as const,
      scheduled_date: format(addDays(today, -10), 'yyyy-MM-dd'),
      posted_date: format(addDays(today, -10), 'yyyy-MM-ddTHH:mm:ss'),
      image_url: 'https://images.unsplash.com/photo-1611632622046-f83cf52c5b88?w=600',
      metrics: {
        likes: 245,
        comments: 38,
        shares: 120,
        reach: 8500,
      },
      created_at: format(addDays(today, -12), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -10), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'post-2',
      title: 'Novo Produto Lançado',
      description: 'Estamos muito felizes em anunciar o lançamento da nossa nova solução!',
      platform: 'instagram' as const,
      status: 'posted' as const,
      scheduled_date: format(addDays(today, -8), 'yyyy-MM-dd'),
      posted_date: format(addDays(today, -8), 'yyyy-MM-ddTHH:mm:ss'),
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
      metrics: {
        likes: 512,
        comments: 67,
        shares: 89,
        reach: 12000,
      },
      created_at: format(addDays(today, -10), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -8), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'post-3',
      title: 'Case de Sucesso',
      description: 'Veja como nosso cliente X aumentou receita em 300% com nossa plataforma',
      platform: 'linkedin' as const,
      status: 'posted' as const,
      scheduled_date: format(addDays(today, -5), 'yyyy-MM-dd'),
      posted_date: format(addDays(today, -5), 'yyyy-MM-ddTHH:mm:ss'),
      image_url: 'https://images.unsplash.com/photo-1460925895917-adf4e565db51?w=600',
      metrics: {
        likes: 189,
        comments: 42,
        shares: 156,
        reach: 15000,
      },
      created_at: format(addDays(today, -7), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -5), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'post-4',
      title: 'Webinar Gratuito',
      description: 'Participe de nosso webinar sobre tendências de mercado em 2026',
      platform: 'youtube' as const,
      status: 'approved' as const,
      scheduled_date: format(addDays(today, 3), 'yyyy-MM-dd'),
      image_url: 'https://images.unsplash.com/photo-1516321749026-fabde0ee8d3d?w=600',
      created_at: format(addDays(today, -3), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -1), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'post-5',
      title: 'Desafio do Mês',
      description: 'Participe do nosso desafio e ganhe prêmios incríveis!',
      platform: 'instagram' as const,
      status: 'pending' as const,
      scheduled_date: format(addDays(today, 5), 'yyyy-MM-dd'),
      image_url: 'https://images.unsplash.com/photo-1552035762-a1f2f6f8e1e6?w=600',
      created_at: format(addDays(today, -2), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -2), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'post-6',
      title: 'Dica Rápida',
      description: 'Sabia que você pode aumentar conversões ajustando o CTH?',
      platform: 'tiktok' as const,
      status: 'draft' as const,
      scheduled_date: format(addDays(today, 7), 'yyyy-MM-dd'),
      image_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600',
      created_at: format(addDays(today, -1), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(today, 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'post-7',
      title: 'Testimonial de Cliente',
      description: '"Transformou nosso negócio" - CEO da empresa Y',
      platform: 'linkedin' as const,
      status: 'approved' as const,
      scheduled_date: format(addDays(today, 2), 'yyyy-MM-dd'),
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600',
      created_at: format(addDays(today, -5), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -1), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'post-8',
      title: 'Promoção Semanal',
      description: 'Aproveite desconto especial essa semana!',
      platform: 'instagram' as const,
      status: 'pending' as const,
      scheduled_date: format(addDays(today, 1), 'yyyy-MM-dd'),
      image_url: 'https://images.unsplash.com/photo-1549887534-7ebbf5e0c6b0?w=600',
      created_at: format(addDays(today, -4), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -2), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'post-9',
      title: 'Atualização de Produto',
      description: 'Nova funcionalidade adicionada baseada no feedback de vocês!',
      platform: 'youtube' as const,
      status: 'draft' as const,
      scheduled_date: format(addDays(today, 10), 'yyyy-MM-dd'),
      image_url: 'https://images.unsplash.com/photo-1611532736000-adfbc6e39f2d?w=600',
      created_at: format(addDays(today, -3), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -1), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'post-10',
      title: 'Conteúdo Educativo',
      description: 'Aprenda as melhores práticas de marketing digital em 2026',
      platform: 'tiktok' as const,
      status: 'approved' as const,
      scheduled_date: format(addDays(today, 4), 'yyyy-MM-dd'),
      image_url: 'https://images.unsplash.com/photo-1578333769412-c39f8d0a00b0?w=600',
      created_at: format(addDays(today, -6), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -2), 'yyyy-MM-ddTHH:mm:ss'),
    },
  ] as MarketingPost[],
};

export const getPlatformLabel = (platform: string): string => {
  const labels: Record<string, string> = {
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    other: 'Outro',
  };
  return labels[platform] || platform;
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    pending: 'Aguardando Aprovação',
    approved: 'Aprovado',
    posted: 'Postado',
    rejected: 'Rejeitado',
  };
  return labels[status] || status;
};

export const getStatusColor = (
  status: string
): { bg: string; text: string; icon: string } => {
  const colors: Record<
    string,
    { bg: string; text: string; icon: string }
  > = {
    draft: { bg: 'bg-gray-900/20', text: 'text-gray-300', icon: '📝' },
    pending: {
      bg: 'bg-yellow-900/20',
      text: 'text-yellow-300',
      icon: '⏳',
    },
    approved: { bg: 'bg-green-900/20', text: 'text-green-300', icon: '✅' },
    posted: { bg: 'bg-blue-900/20', text: 'text-blue-300', icon: '📤' },
    rejected: { bg: 'bg-red-900/20', text: 'text-red-300', icon: '❌' },
  };
  return colors[status] || colors.draft;
};

export const getPlatformIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    instagram: '📸',
    linkedin: '💼',
    tiktok: '🎵',
    youtube: '📹',
    other: '📱',
  };
  return icons[platform] || '📱';
};

export const getPostsByDate = (posts: MarketingPost[], date: string) => {
  return posts.filter((post) => post.scheduled_date === date);
};

export const getPostsForMonth = (posts: MarketingPost[], month: string) => {
  return posts.filter((post) => post.scheduled_date.startsWith(month));
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
