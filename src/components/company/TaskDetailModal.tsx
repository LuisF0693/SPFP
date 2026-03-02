import React, { useState } from 'react';
import { X, Trash2, Edit2, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import { CompanyTask } from '../../types/company';
import { PRIORITY_CONFIG } from './TaskCard';
import { TaskForm } from './forms/TaskForm';
import { useCompany } from '../../context/CompanyContext';

interface TaskDetailModalProps {
  task: CompanyTask;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const { updateTask, deleteTask } = useCompany();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

  const handleDelete = async () => {
    await deleteTask(task.id);
    onClose();
  };

  const handleUpdateSubmit = async (data: Omit<CompanyTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await updateTask(task.id, data);
    setEditing(false);
  };

  if (editing) {
    return (
      <TaskForm
        boardId={task.board_id}
        initial={task}
        onSubmit={handleUpdateSubmit}
        onClose={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="glass rounded-3xl border border-white/10 w-full max-w-lg p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md mb-2 ${priority.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>
            <h2 className="text-xl font-bold text-white leading-snug">{task.title}</h2>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              title="Editar task"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description ? (
          <p className="text-gray-300 text-sm leading-relaxed">{task.description}</p>
        ) : (
          <p className="text-gray-600 text-sm italic">Sem descrição</p>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          {task.assignee_name && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
              <User size={14} className="text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Responsável</p>
                <p className="text-sm text-white font-medium">{task.assignee_name}</p>
              </div>
            </div>
          )}
          {task.due_date && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5">
              <Calendar size={14} className="text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Entrega</p>
                <p className={`text-sm font-medium ${new Date(task.due_date) < new Date() ? 'text-red-400' : 'text-white'}`}>
                  {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-2">
              <Tag size={12} className="text-gray-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta timestamps */}
        <p className="text-[10px] text-gray-600">
          Criada em {new Date(task.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>

        {/* Delete section */}
        <div className="pt-2 border-t border-white/5">
          {confirmDelete ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={14} />
                Confirmar exclusão?
              </div>
              <button onClick={() => setConfirmDelete(false)} className="ml-auto px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} className="px-3 py-1.5 text-xs text-white bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors">
                Excluir
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 text-xs text-gray-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={13} />
              Excluir task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
