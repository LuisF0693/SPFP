/**
 * MarketingDashboard - Dashboard Marketing
 * Posts, Calendar, Engagement
 */

import React, { useState } from 'react';
import { Calendar, MessageSquare, Heart, Share2 } from 'lucide-react';

const posts = [
  {
    id: '1',
    title: 'Nova Estratégia de Q1',
    platform: 'LinkedIn',
    status: 'approved',
    scheduledDate: '2026-02-20',
    metrics: { likes: 245, comments: 12, shares: 5 },
  },
  {
    id: '2',
    title: 'Lançamento Produto X',
    platform: 'Instagram',
    status: 'pending',
    scheduledDate: '2026-02-22',
    metrics: null,
  },
  {
    id: '3',
    title: 'Case Study Cliente',
    platform: 'LinkedIn',
    status: 'draft',
    scheduledDate: null,
    metrics: null,
  },
  {
    id: '4',
    title: 'Dica de Produtividade',
    platform: 'TikTok',
    status: 'posted',
    scheduledDate: '2026-02-18',
    metrics: { likes: 1200, comments: 45, shares: 320 },
  },
];

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-600', text: 'text-gray-200', label: '📝 Rascunho' },
  pending: { bg: 'bg-yellow-600', text: 'text-yellow-200', label: '⏳ Aguardando' },
  approved: { bg: 'bg-green-600', text: 'text-green-200', label: '✅ Aprovado' },
  posted: { bg: 'bg-blue-600', text: 'text-blue-200', label: '📤 Postado' },
};

export function MarketingDashboard() {
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-700 p-3 rounded text-center">
          <p className="text-slate-400 text-xs">Posts Totais</p>
          <p className="text-blue-400 text-2xl font-bold">4</p>
        </div>
        <div className="bg-slate-700 p-3 rounded text-center">
          <p className="text-slate-400 text-xs">Aprovados</p>
          <p className="text-green-400 text-2xl font-bold">1</p>
        </div>
        <div className="bg-slate-700 p-3 rounded text-center">
          <p className="text-slate-400 text-xs">Pendentes</p>
          <p className="text-yellow-400 text-2xl font-bold">1</p>
        </div>
        <div className="bg-slate-700 p-3 rounded text-center">
          <p className="text-slate-400 text-xs">Postados</p>
          <p className="text-purple-400 text-2xl font-bold">1</p>
        </div>
      </div>

      {/* Lista de Posts */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar size={20} /> Posts Agendados
        </h3>

        {posts.map((post) => {
          const badge = statusBadge[post.status];
          const isExpanded = expandedPost === post.id;

          return (
            <div
              key={post.id}
              className="bg-slate-700 rounded p-4 cursor-pointer hover:bg-slate-600 transition"
              onClick={() => setExpandedPost(isExpanded ? null : post.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{post.title}</h4>
                  <p className="text-slate-400 text-sm mt-1">
                    {post.platform} {post.scheduledDate && `• ${new Date(post.scheduledDate).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded text-sm font-semibold whitespace-nowrap`}>
                  {badge.label}
                </span>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-600">
                  {post.metrics ? (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-800 p-3 rounded">
                        <div className="flex items-center gap-2 text-pink-400 mb-1">
                          <Heart size={16} /> Likes
                        </div>
                        <p className="text-white font-semibold">{post.metrics.likes.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-800 p-3 rounded">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                          <MessageSquare size={16} /> Comentários
                        </div>
                        <p className="text-white font-semibold">{post.metrics.comments}</p>
                      </div>
                      <div className="bg-slate-800 p-3 rounded">
                        <div className="flex items-center gap-2 text-green-400 mb-1">
                          <Share2 size={16} /> Compartilhamentos
                        </div>
                        <p className="text-white font-semibold">{post.metrics.shares}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">Sem métricas disponíveis</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA Novo Post */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition">
        + Novo Post
      </button>
    </div>
  );
}
