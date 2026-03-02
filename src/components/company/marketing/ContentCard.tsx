import React from 'react';
import { MoreHorizontal, Instagram, Youtube, Mail, Share2, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { MarketingContent, ContentStatus } from '../../../context/MarketingContext';

const PLATFORM_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  instagram: Instagram,
  facebook: Share2,
  youtube: Youtube,
  email: Mail,
};

const STATUS_CONFIG: Record<ContentStatus, { label: string; color: string; icon: React.FC<{ size?: number; className?: string }> }> = {
  draft:      { label: 'Rascunho',           color: 'text-gray-400 bg-gray-500/10',    icon: Clock },
  ready:      { label: 'Pronto',             color: 'text-blue-400 bg-blue-500/10',    icon: CheckCircle2 },
  scheduled:  { label: 'Agendado',           color: 'text-amber-400 bg-amber-500/10',  icon: Clock },
  publishing: { label: 'Publicando...',      color: 'text-purple-400 bg-purple-500/10', icon: Loader2 },
  published:  { label: 'Publicado',          color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
  failed:     { label: 'Falhou',             color: 'text-red-400 bg-red-500/10',      icon: AlertCircle },
};

const CONTENT_TYPE_LABEL: Record<string, string> = {
  post: 'Post', reel: 'Reel', story: 'Story', carousel: 'Carrossel', email: 'Email',
};

interface ContentCardProps {
  content: MarketingContent;
  onClick: (content: MarketingContent) => void;
  onMenuClick: (content: MarketingContent, e: React.MouseEvent) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ content, onClick, onMenuClick }) => {
  const status = STATUS_CONFIG[content.status];
  const StatusIcon = status.icon;
  const firstMedia = content.media_urls?.[0];

  return (
    <div
      className="glass rounded-2xl border border-white/5 hover:border-white/15 transition-all group cursor-pointer overflow-hidden"
      onClick={() => onClick(content)}
    >
      {/* Media preview */}
      <div className="h-40 bg-white/3 relative overflow-hidden">
        {firstMedia ? (
          firstMedia.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={firstMedia} className="w-full h-full object-cover" />
          ) : (
            <img src={firstMedia} alt={content.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">
            {content.content_type === 'email' ? '📧' : content.content_type === 'reel' ? '🎬' : '🖼️'}
          </div>
        )}
        {/* Platform badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {content.platform.slice(0, 3).map((p) => {
            const PlatformIcon = PLATFORM_ICONS[p] || Share2;
            return (
              <div key={p} className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <PlatformIcon size={12} className="text-white" />
              </div>
            );
          })}
        </div>
        {/* Status badge */}
        <div className={`absolute top-2 right-2 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full backdrop-blur-sm ${status.color}`}>
          <StatusIcon size={10} />
          {status.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-gray-500 font-medium">{CONTENT_TYPE_LABEL[content.content_type]}</span>
            <h3 className="text-white text-sm font-semibold truncate mt-0.5">{content.title}</h3>
            {content.caption && (
              <p className="text-gray-500 text-xs mt-1 line-clamp-2">{content.caption}</p>
            )}
          </div>
          <button
            onClick={(e) => onMenuClick(content, e)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          {content.hashtags && content.hashtags.length > 0 && (
            <span className="text-[10px] text-accent">#{content.hashtags[0]}</span>
          )}
          {content.scheduled_at && (
            <span className="text-[10px] text-gray-500 flex items-center gap-1 ml-auto">
              <Clock size={10} />
              {new Date(content.scheduled_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {content.created_by_agent && (
            <span className="text-[10px] text-gray-600 ml-auto">via agente</span>
          )}
        </div>
      </div>
    </div>
  );
};
