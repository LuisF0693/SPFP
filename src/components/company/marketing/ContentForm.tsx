import React, { useState, useRef } from 'react';
import { X, Save, Loader2, ImagePlus } from 'lucide-react';
import { useMarketing, MarketingContent, ContentType, ContentStatus, Platform } from '../../../context/MarketingContext';
import CanvaConnect from './CanvaConnect';

const CONTENT_TYPES: { value: ContentType; label: string; emoji: string }[] = [
  { value: 'post',      label: 'Post',      emoji: '🖼️' },
  { value: 'reel',      label: 'Reel',      emoji: '🎬' },
  { value: 'story',     label: 'Story',     emoji: '⏱️' },
  { value: 'carousel',  label: 'Carrossel', emoji: '🎠' },
  { value: 'email',     label: 'Email',     emoji: '📧' },
];

const PLATFORMS: { value: Platform; label: string; emoji: string }[] = [
  { value: 'instagram', label: 'Instagram', emoji: '📸' },
  { value: 'facebook',  label: 'Facebook',  emoji: '👥' },
  { value: 'youtube',   label: 'YouTube',   emoji: '▶️' },
  { value: 'email',     label: 'Email',     emoji: '📧' },
];

interface ContentFormProps {
  initial?: Partial<MarketingContent>;
  onSubmit: (data: Omit<MarketingContent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

export const ContentForm: React.FC<ContentFormProps> = ({ initial, onSubmit, onClose }) => {
  const { uploadMedia } = useMarketing();
  const [title, setTitle] = useState(initial?.title || '');
  const [contentType, setContentType] = useState<ContentType>(initial?.content_type || 'post');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(initial?.platform || ['instagram']);
  const [caption, setCaption] = useState(initial?.caption || '');
  const [hashtagsInput, setHashtagsInput] = useState(initial?.hashtags?.join(' ') || '');
  const [mediaUrls, setMediaUrls] = useState<string[]>(initial?.media_urls || []);
  const [status, setStatus] = useState<ContentStatus>(initial?.status || 'draft');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Use a temp ID for upload before actual content is created
      const url = await uploadMedia(file, `temp-${Date.now()}`);
      setMediaUrls((prev) => [...prev, url]);
    } catch {
      // Fallback to local preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setMediaUrls((prev) => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Título é obrigatório'); return; }
    if (selectedPlatforms.length === 0) { setError('Selecione ao menos uma plataforma'); return; }
    setSaving(true);
    try {
      const hashtags = hashtagsInput.split(/[\s,]+/).map((h) => h.replace(/^#/, '').trim()).filter(Boolean);
      await onSubmit({
        title: title.trim(),
        content_type: contentType,
        platform: selectedPlatforms,
        caption: caption.trim() || undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar conteúdo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-3xl border border-white/10 w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{initial?.id ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Título *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome do conteúdo..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-accent/50 text-sm" />
          </div>

          {/* Content type */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Tipo de Conteúdo</label>
            <div className="flex gap-2 flex-wrap">
              {CONTENT_TYPES.map((ct) => (
                <button key={ct.value} type="button" onClick={() => setContentType(ct.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${contentType === ct.value ? 'bg-accent/20 border border-accent/40 text-accent' : 'bg-white/5 border border-transparent text-gray-400 hover:text-white'}`}>
                  {ct.emoji} {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Plataformas *</label>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map((p) => (
                <button key={p.value} type="button" onClick={() => togglePlatform(p.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${selectedPlatforms.includes(p.value) ? 'bg-accent/20 border border-accent/40 text-accent' : 'bg-white/5 border border-transparent text-gray-400 hover:text-white'}`}>
                  {p.emoji} {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Canva — gerar imagem automaticamente */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Gerar imagem com Canva</label>
            <CanvaConnect
              contentTitle={title}
              contentCaption={caption}
              onImageGenerated={(url) => setMediaUrls((prev) => [...prev, url])}
            />
          </div>

          {/* Media upload */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Mídia</label>
            <div className="grid grid-cols-3 gap-2">
              {mediaUrls.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-white/5">
                  {url.match(/\.(mp4|webm|mov)$/i) ? (
                    <video src={url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  )}
                  <button type="button" onClick={() => setMediaUrls((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-500/60 transition-colors">
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-accent/40 flex flex-col items-center justify-center text-gray-500 hover:text-accent transition-colors">
                {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
                <span className="text-[10px] mt-1">{uploading ? 'Enviando...' : 'Adicionar'}</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Caption */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Legenda / Texto</label>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Escreva a legenda do conteúdo..." rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-accent/50 text-sm resize-none" />
          </div>

          {/* Hashtags */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Hashtags</label>
            <input type="text" value={hashtagsInput} onChange={(e) => setHashtagsInput(e.target.value)} placeholder="#planejamento #financas #dinheiro..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-accent/50 text-sm" />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as ContentStatus)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-accent/50 text-sm">
              <option value="draft" className="bg-gray-900">Rascunho</option>
              <option value="ready" className="bg-gray-900">Pronto para Publicar</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/80 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
