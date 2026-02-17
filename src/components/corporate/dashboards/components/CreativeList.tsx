/**
 * CreativeList
 * Lista de criativos com status e métricas
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, Eye } from 'lucide-react';
import { MarketingPost, getStatusLabel, getStatusColor, getPlatformLabel, getPlatformIcon } from '@/data/marketingData';

interface CreativeListProps {
  posts: MarketingPost[];
  onApprove: (postId: string) => void;
  onReject: (postId: string) => void;
}

export default function CreativeList({
  posts,
  onApprove,
  onReject,
}: CreativeListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
  );

  return (
    <div className="bg-slate-700/50 p-4 rounded-lg space-y-3">
      <h4 className="text-sm font-semibold text-white mb-4">Criativos ({posts.length})</h4>

      {posts.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum criativo agendado</p>
      ) : (
        <div className="space-y-3">
          {sortedPosts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-800 rounded border border-slate-600 overflow-hidden"
            >
              {/* Main Row */}
              <div
                onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                className="p-3 cursor-pointer hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Image + Title */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>{getPlatformIcon(post.platform)} {getPlatformLabel(post.platform)}</span>
                        <span>•</span>
                        <span>{format(new Date(post.scheduled_date), 'dd/MM/yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status + Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${
                        getStatusColor(post.status).bg
                      } ${getStatusColor(post.status).text}`}
                    >
                      {getStatusColor(post.status).icon} {getStatusLabel(post.status)}
                    </span>

                    {/* Action Buttons */}
                    {post.status === 'pending' && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApprove(post.id);
                          }}
                          className="p-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded transition-colors"
                          title="Aprovar"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReject(post.id);
                          }}
                          className="p-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition-colors"
                          title="Rejeitar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics (if posted) */}
                {post.metrics && (
                  <div className="flex gap-4 text-xs text-slate-300 mt-2">
                    <span>👍 {post.metrics.likes}</span>
                    <span>💬 {post.metrics.comments}</span>
                    <span>↗️ {post.metrics.shares}</span>
                    <span>📊 {post.metrics.reach}</span>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedId === post.id && (
                <div className="border-t border-slate-600 p-3 bg-slate-800/50">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold mb-1">Descrição</p>
                      <p className="text-sm text-slate-300">{post.description}</p>
                    </div>

                    {post.metrics && (
                      <div>
                        <p className="text-xs text-slate-400 font-semibold mb-2">Métricas</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-700/50 p-2 rounded">
                            <p className="text-xs text-slate-400">Curtidas</p>
                            <p className="text-sm font-bold text-white">{post.metrics.likes}</p>
                          </div>
                          <div className="bg-slate-700/50 p-2 rounded">
                            <p className="text-xs text-slate-400">Comentários</p>
                            <p className="text-sm font-bold text-white">{post.metrics.comments}</p>
                          </div>
                          <div className="bg-slate-700/50 p-2 rounded">
                            <p className="text-xs text-slate-400">Compartilhamentos</p>
                            <p className="text-sm font-bold text-white">{post.metrics.shares}</p>
                          </div>
                          <div className="bg-slate-700/50 p-2 rounded">
                            <p className="text-xs text-slate-400">Alcance</p>
                            <p className="text-sm font-bold text-white">{post.metrics.reach}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 text-xs text-slate-400">
                      <span>Criado: {format(new Date(post.created_at), 'dd/MM/yyyy HH:mm')}</span>
                      <span>•</span>
                      <span>Atualizado: {format(new Date(post.updated_at), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
