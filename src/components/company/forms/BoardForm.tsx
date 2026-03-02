import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { CompanyBoard } from '../../../types/company';

const EMOJI_OPTIONS = ['📋', '🎯', '🚀', '💡', '📊', '🔧', '🌟', '🎨', '📱', '🔑', '🤝', '🧠', '📝', '⭐', '🎬', '🔥'];
const COLOR_OPTIONS = [
  '#ec4899', '#10b981', '#3b82f6', '#f59e0b',
  '#8b5cf6', '#6b7280', '#ef4444', '#06b6d4',
  '#84cc16', '#f97316', '#6366f1', '#14b8a6',
];

interface BoardFormProps {
  squadId: string;
  initial?: Partial<CompanyBoard>;
  onSubmit: (data: Omit<CompanyBoard, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onClose: () => void;
}

export const BoardForm: React.FC<BoardFormProps> = ({ squadId, initial, onSubmit, onClose }) => {
  const [name, setName] = useState(initial?.name || '');
  const [icon, setIcon] = useState(initial?.icon || '📋');
  const [color, setColor] = useState(initial?.color || '#6366f1');
  const [description, setDescription] = useState(initial?.description || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      await onSubmit({
        squad_id: squadId,
        name: name.trim(),
        icon,
        color,
        description: description.trim() || undefined,
        is_archived: false,
        sort_order: initial?.sort_order ?? 99,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar board');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-3xl border border-white/10 w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {initial?.id ? 'Editar Board' : 'Novo Board'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${color}20` }}>
              {icon}
            </span>
            <div>
              <p className="text-white font-semibold text-sm">{name || 'Nome do Board'}</p>
              <p className="text-gray-500 text-xs">{description || 'Descrição...'}</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
              Nome do Board *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Campanha Q1, Email Marketing..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>

          {/* Emoji */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Ícone</label>
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`p-2 rounded-xl text-lg transition-all ${
                    icon === emoji ? 'bg-accent/20 border border-accent/40 scale-110' : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Cor</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Descrição (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do board..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/80 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Salvando...' : 'Salvar Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
