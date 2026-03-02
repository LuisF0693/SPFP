import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { CompanyTask, TaskStatus, TaskPriority } from '../../../types/company';

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO',        label: 'A Fazer' },
  { value: 'IN_PROGRESS', label: 'Em Andamento' },
  { value: 'REVIEW',      label: 'Em Revisão' },
  { value: 'DONE',        label: 'Concluído' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'URGENT', label: '🔴 Urgente', color: 'text-red-400' },
  { value: 'HIGH',   label: '🟠 Alta',    color: 'text-orange-400' },
  { value: 'MEDIUM', label: '🟡 Média',   color: 'text-yellow-400' },
  { value: 'LOW',    label: '🟢 Baixa',   color: 'text-emerald-400' },
];

interface TaskFormProps {
  boardId: string;
  initial?: Partial<CompanyTask>;
  defaultStatus?: TaskStatus;
  onSubmit: (data: Omit<CompanyTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ boardId, initial, defaultStatus = 'TODO', onSubmit, onClose }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status || defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority || 'MEDIUM');
  const [assigneeName, setAssigneeName] = useState(initial?.assignee_name || '');
  const [dueDate, setDueDate] = useState(initial?.due_date || '');
  const [tagsInput, setTagsInput] = useState(initial?.tags?.join(', ') || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Título é obrigatório'); return; }
    setSaving(true);
    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await onSubmit({
        board_id: boardId,
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        assignee_name: assigneeName.trim() || undefined,
        due_date: dueDate || undefined,
        tags: tags.length > 0 ? tags : undefined,
        sort_order: initial?.sort_order ?? 99,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-3xl border border-white/10 w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {initial?.id ? 'Editar Task' : 'Nova Task'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que precisa ser feito?"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes, contexto, links..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-accent/50 transition-colors text-sm resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-accent/50 transition-colors text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-gray-900">{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-accent/50 transition-colors text-sm"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value} className="bg-gray-900">{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Responsável</label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="Nome ou agente..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 outline-none focus:border-accent/50 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Data de entrega</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white outline-none focus:border-accent/50 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="design, desenvolvimento, bug..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-accent/50 transition-colors text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/80 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Salvando...' : 'Salvar Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
