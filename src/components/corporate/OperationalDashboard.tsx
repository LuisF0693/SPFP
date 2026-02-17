/**
 * OperationalDashboard - Dashboard Operacional
 * Kanban board 3 colunas com drag&drop, filtros, alertas
 * AC-406.1 to 406.9 implemented
 */

import React, { useState } from 'react';
import { Plus, Trash2, Filter, RotateCcw } from 'lucide-react';

interface OperationalTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'alta' | 'media' | 'baixa';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

const initialTasks: Record<string, OperationalTask[]> = {
  todo: [
    { id: '1', title: 'Implementar nova feature', description: 'Backend da feature X', priority: 'alta', dueDate: '2026-02-20', createdAt: '2026-02-10T10:00:00', updatedAt: '2026-02-10T10:00:00', status: 'todo' },
    { id: '2', title: 'Revisar código do time', description: 'Pull request do João', priority: 'media', dueDate: '2026-02-22', createdAt: '2026-02-11T10:00:00', updatedAt: '2026-02-11T10:00:00', status: 'todo' },
    { id: '3', title: 'Atualizar documentação', priority: 'baixa', dueDate: '2026-02-25', createdAt: '2026-02-12T10:00:00', updatedAt: '2026-02-12T10:00:00', status: 'todo' },
    { id: '4', title: 'Investigar bug crítico', priority: 'alta', dueDate: '2026-02-19', createdAt: '2026-02-13T10:00:00', updatedAt: '2026-02-13T10:00:00', status: 'todo' },
    { id: '5', title: 'Setup CI/CD pipeline', priority: 'alta', dueDate: '2026-02-18', createdAt: '2026-02-14T10:00:00', updatedAt: '2026-02-14T10:00:00', status: 'todo' },
  ],
  in_progress: [
    { id: '6', title: 'Otimizar query banco', description: 'Query em reports está lenta', priority: 'media', assignee: 'Maria', createdAt: '2026-02-08T10:00:00', updatedAt: '2026-02-15T10:00:00', status: 'in_progress' },
    { id: '7', title: 'Setup novo servidor', priority: 'alta', assignee: 'Pedro', createdAt: '2026-02-09T10:00:00', updatedAt: '2026-02-15T10:00:00', status: 'in_progress' },
    { id: '8', title: 'Testes de integração', priority: 'media', assignee: 'Ana', createdAt: '2026-02-10T10:00:00', updatedAt: '2026-02-16T10:00:00', status: 'in_progress' },
  ],
  done: [
    { id: '9', title: 'Deploy versão 1.0', priority: 'alta', dueDate: '2026-02-18', createdAt: '2026-02-05T10:00:00', updatedAt: '2026-02-18T14:30:00', status: 'done' },
    { id: '10', title: 'Testes de carga', priority: 'media', dueDate: '2026-02-17', createdAt: '2026-02-06T10:00:00', updatedAt: '2026-02-17T16:00:00', status: 'done' },
    { id: '11', title: 'Documentação inicial', priority: 'baixa', dueDate: '2026-02-16', createdAt: '2026-02-07T10:00:00', updatedAt: '2026-02-16T11:00:00', status: 'done' },
  ],
};

const priorityColors: Record<string, { bg: string; icon: string }> = {
  alta: { bg: 'bg-red-600', icon: '🔴' },
  media: { bg: 'bg-yellow-600', icon: '🟡' },
  baixa: { bg: 'bg-green-600', icon: '🟢' },
};

const statusLabels: Record<string, string> = {
  todo: 'A Fazer',
  in_progress: 'Em Progresso',
  done: 'Concluído',
};

function getDaysUntilDue(dueDate?: string): number | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getUrgencyBorder(daysLeft: number | null): string {
  if (daysLeft === null) return 'border-slate-600';
  if (daysLeft < 0) return 'border-red-500 border-2'; // Vencida
  if (daysLeft === 0) return 'border-yellow-500 border-2'; // Vence hoje
  if (daysLeft <= 3) return 'border-orange-500 border-2'; // Vence em 3 dias
  return 'border-slate-600';
}

interface NewTaskFormProps {
  onSave: (task: Omit<OperationalTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function NewTaskForm({ onSave, onCancel }: NewTaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'media' as const,
    dueDate: '',
    assignee: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'todo',
      dueDate: formData.dueDate || undefined,
      assignee: formData.assignee || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-96">
        <h3 className="text-xl font-bold text-white mb-4">Nova Tarefa</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Título</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm h-16"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Prioridade</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data de Vencimento</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Responsável</label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm"
              placeholder="Nome do responsável"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium">
              Salvar
            </button>
            <button type="button" onClick={onCancel} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm font-medium">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: OperationalTask;
  onDragStart: (task: OperationalTask) => void;
  onDelete: (taskId: string) => void;
}

function TaskCard({ task, onDragStart, onDelete }: TaskCardProps) {
  const daysLeft = getDaysUntilDue(task.dueDate);
  const urgencyBorder = getUrgencyBorder(daysLeft);
  const priority = priorityColors[task.priority];

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task)}
      className={`bg-slate-700 p-3 rounded border-l-4 hover:bg-slate-600 group relative cursor-move transition ${urgencyBorder}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm line-clamp-2">{task.title}</p>
          {task.description && <p className="text-slate-400 text-xs mt-1 line-clamp-1">{task.description}</p>}
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className={`${priority.bg} text-white px-2 py-0.5 rounded text-xs font-medium`}>
              {priority.icon} {task.priority}
            </span>
            {daysLeft !== null && (
              <span className="text-xs text-slate-400" title={`Vence em ${daysLeft} dias`}>
                📅 {daysLeft < 0 ? 'Vencida' : `${daysLeft}d`}
              </span>
            )}
          </div>
          {task.assignee && <p className="text-xs text-slate-400 mt-1">👤 {task.assignee}</p>}
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-red-400 flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export function OperationalDashboard() {
  const [tasks, setTasks] = useState<Record<string, OperationalTask[]>>(initialTasks);
  const [priorityFilter, setPriorityFilter] = useState<'todas' | 'alta' | 'media' | 'baixa'>('todas');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [draggedTask, setDraggedTask] = useState<OperationalTask | null>(null);
  const [lastAction, setLastAction] = useState<{ task: OperationalTask; from: string; to: string } | null>(null);

  const handleAddTask = (newTask: Omit<OperationalTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: OperationalTask = {
      ...newTask,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks({
      ...tasks,
      todo: [task, ...tasks.todo],
    });
    setShowNewTaskForm(false);
  };

  const handleDeleteTask = (taskId: string, status: string) => {
    setTasks({
      ...tasks,
      [status]: tasks[status].filter(t => t.id !== taskId),
    });
  };

  const handleDropTask = (toStatus: string) => {
    if (!draggedTask) return;

    const fromStatus = Object.keys(tasks).find(s => tasks[s].some(t => t.id === draggedTask.id));
    if (!fromStatus || fromStatus === toStatus) {
      setDraggedTask(null);
      return;
    }

    setTasks({
      ...tasks,
      [fromStatus]: tasks[fromStatus].filter(t => t.id !== draggedTask.id),
      [toStatus]: [...tasks[toStatus], { ...draggedTask, status: toStatus as any, updatedAt: new Date().toISOString() }],
    });

    setLastAction({ task: draggedTask, from: fromStatus, to: toStatus });
    setDraggedTask(null);
  };

  const handleUndo = () => {
    if (!lastAction) return;
    const { task, from, to } = lastAction;
    setTasks({
      ...tasks,
      [to]: tasks[to].filter(t => t.id !== task.id),
      [from]: [...tasks[from], task],
    });
    setLastAction(null);
  };

  const getFilteredTasks = (status: string): OperationalTask[] => {
    if (priorityFilter === 'todas') return tasks[status];
    return tasks[status].filter(t => t.priority === priorityFilter);
  };

  const columnCount = {
    todo: getFilteredTasks('todo').length,
    in_progress: getFilteredTasks('in_progress').length,
    done: getFilteredTasks('done').length,
  };

  const totalCount = Object.values(columnCount).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Resumo + Filtros */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-700 p-2 rounded text-center">
          <p className="text-slate-400 text-xs">Total</p>
          <p className="text-blue-400 text-2xl font-bold">{totalCount}</p>
        </div>
        <div className="bg-slate-700 p-2 rounded text-center">
          <p className="text-slate-400 text-xs">A Fazer</p>
          <p className="text-white font-bold text-lg">{columnCount.todo}</p>
        </div>
        <div className="bg-slate-700 p-2 rounded text-center">
          <p className="text-slate-400 text-xs">Em Progresso</p>
          <p className="text-white font-bold text-lg">{columnCount.in_progress}</p>
        </div>
        <div className="bg-slate-700 p-2 rounded text-center">
          <p className="text-slate-400 text-xs">Concluído</p>
          <p className="text-white font-bold text-lg">{columnCount.done}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 items-center">
        <Filter size={16} className="text-slate-400" />
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as any)}
          className="bg-slate-700 text-white rounded px-3 py-1 text-sm"
        >
          <option value="todas">Todas as prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
        {lastAction && (
          <button
            onClick={handleUndo}
            className="ml-auto bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <RotateCcw size={14} /> Desfazer
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-4">
        {['todo', 'in_progress', 'done'].map(status => (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropTask(status)}
            className="bg-slate-700/30 border-2 border-slate-600 rounded p-4 min-h-96"
          >
            <h3 className="text-white font-semibold mb-3">
              {statusLabels[status]} ({getFilteredTasks(status).length})
            </h3>
            <div className="space-y-2 min-h-60">
              {getFilteredTasks(status).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={setDraggedTask}
                  onDelete={(id) => handleDeleteTask(id, status)}
                />
              ))}
            </div>
            <button
              onClick={() => setShowNewTaskForm(true)}
              className="w-full mt-3 text-slate-400 hover:text-white flex items-center justify-center gap-1 py-2"
            >
              <Plus size={16} /> Adicionar
            </button>
          </div>
        ))}
      </div>

      {showNewTaskForm && (
        <NewTaskForm
          onSave={handleAddTask}
          onCancel={() => setShowNewTaskForm(false)}
        />
      )}
    </div>
  );
}
