import React, { useState } from 'react';
import { CheckCircle2, Zap, Loader2, Instagram, Youtube, Mail, Share2 } from 'lucide-react';
import { useMarketing, MarketingContent } from '../../../context/MarketingContext';

const PLATFORM_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  instagram: Instagram, facebook: Share2, youtube: Youtube, email: Mail,
};

export const PublishQueue: React.FC<{ onSelectContent: (c: MarketingContent) => void }> = ({ onSelectContent }) => {
  const { contents, updateContent } = useMarketing();
  const [publishing, setPublishing] = useState<string | null>(null);

  const queueItems = contents.filter((c) => c.status === 'ready' || c.status === 'scheduled');

  const handleApprove = async (content: MarketingContent) => {
    await updateContent(content.id, { status: 'scheduled' });
  };

  const handlePublishNow = async (content: MarketingContent) => {
    setPublishing(content.id);
    try {
      // Chama publishService — integração real nas Stories 11.3/11.4
      await updateContent(content.id, { status: 'publishing' });
      // Simulação: em produção, chamar supabase.functions.invoke('publish-meta', ...)
      setTimeout(async () => {
        await updateContent(content.id, { status: 'published', published_at: new Date().toISOString() });
        setPublishing(null);
      }, 2000);
    } catch (err) {
      await updateContent(content.id, { status: 'failed' });
      setPublishing(null);
    }
  };

  if (queueItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-2xl bg-white/5 text-gray-600 mb-4">
          <CheckCircle2 size={28} />
        </div>
        <p className="text-gray-500 text-sm">Fila vazia</p>
        <p className="text-gray-600 text-xs mt-1">Conteúdos marcados como "Pronto" aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queueItems.map((content) => (
        <div
          key={content.id}
          className="glass rounded-2xl border border-white/5 p-4 flex items-center gap-4 group hover:border-white/15 transition-all"
        >
          {/* Thumbnail */}
          <div
            className="w-16 h-16 rounded-xl bg-white/5 flex-shrink-0 overflow-hidden cursor-pointer"
            onClick={() => onSelectContent(content)}
          >
            {content.media_urls?.[0] ? (
              <img src={content.media_urls[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {content.content_type === 'email' ? '📧' : content.content_type === 'reel' ? '🎬' : '🖼️'}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectContent(content)}>
            <h3 className="text-white font-semibold text-sm truncate">{content.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1">
                {content.platform.map((p) => {
                  const Icon = PLATFORM_ICONS[p] || Share2;
                  return <Icon key={p} size={12} className="text-gray-400" />;
                })}
              </div>
              <span className={`text-[10px] font-medium ${content.status === 'scheduled' ? 'text-amber-400' : 'text-blue-400'}`}>
                {content.status === 'scheduled' ? 'Agendado' : 'Pronto para publicar'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {content.status === 'ready' && (
              <button
                onClick={() => handleApprove(content)}
                className="px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/10 transition-colors"
              >
                Aprovar
              </button>
            )}
            <button
              onClick={() => handlePublishNow(content)}
              disabled={!!publishing}
              className="px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/80 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {publishing === content.id ? (
                <><Loader2 size={12} className="animate-spin" /> Publicando...</>
              ) : (
                <><Zap size={12} /> Publicar Agora</>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
