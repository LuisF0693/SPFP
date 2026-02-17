/**
 * OperationalDashboard - Dashboard Operacional
 * Kanban board com tarefas
 */

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'alta' | 'media' | 'baixa';
  dueDate?: string;
  assignee?: string;
}

const initialTasks = {
  todo: [
    { id: '1', title: 'Implementar nova feature', priority: 'alta', dueDate: '2026-02-20', assignee: 'João' },
    { id: '2', title: 'Revisar código do time', priority: 'media', dueDate: '2026-02-22' },
    { id: '3', title: 'Atualizar documentação', priority: 'baixa', dueDate: '2026-02-25' },
    { id: '4', title: 'Investigar bug crítico', priority: 'alta', dueDate: '2026-02-19' },
  ],
  inProgress: [
    { id: '5', title: 'Otimizar query banco', priority: 'media', assignee: 'Maria' },
    { id: '6', title: 'Setup novo servidor', priority: 'alta', assignee: 'Pedro' },
  ],
  done: [
    { id: '7', title: 'Deploy versão 1.0', priority: 'alta', dueDate: '2026-02-18' },
    { id: '8', title: 'Testes de carga', priority: 'media', dueDate: '2026-02-17' },
    { id: '9', title: 'Documentação inicial', priority: 'baixa', dueDate: '2026-02-16' },
  ],
};

const priorityColors: Record<string, string> = {
  alta: 'bg-red-600',
  media: 'bg-yellow-600',
  baixa: 'bg-green-600',
};

const priorityLabels: Record<string, string> = {
  alta: '🔴',
  media: '🟡',
  baixa: '🟢',
};

export function OperationalDashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskStatus, setNewTaskStatus] = useState<string | null>(null);

  const moveTask = (taskId: string, fromStatus: string, toStatus: string) => {
    const task = tasks[fromStatus as keyof typeof tasks].find((t) => t.id === taskId);
    if (!task) return;

    setTasks({
      ...tasks,
      [fromStatus]: tasks[fromStatus as keyof typeof tasks].filter((t) => t.id !== taskId),
      [toStatus]: [...tasks[toStatus as keyof typeof tasks], task],
    });
  };

  const deleteTask = (taskId: string, status: string) => {
    setTasks({
      ...tasks,
      [status]: tasks[status as keyof typeof tasks].filter((t) => t.id !== taskId),
    });
  };

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-700 p-2 rounded text-center">
          <p className="text-slate-400 text-xs">A Fazer</p>
          <p className="text-white font-bold text-lg">{tasks.todo.length}</p>
        </div>
        <div className="bg-slate-700 p-2 rounded text-center">
          <p className="text-slate-400 text-xs">Em Progresso</p>
          <p className="text-white font-bold text-lg">{tasks.inProgress.length}</p>
        </div>
        <div className="bg-slate-700 p-2 rounded text-center">
          <p className="text-slate-400 text-xs">Concluído</p>
          <p className="text-white font-bold text-lg">{tasks.done.length}</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-4">
        {/* A Fazer */}
        <div className="bg-slate-700/30 border border-slate-600 rounded p-4">
          <h3 className="text-white font-semibold mb-3">A Fazer ({tasks.todo.length})</h3>
          <div className="space-y-2">
            {tasks.todo.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMove={(toStatus) => moveTask(task.id, 'todo', toStatus)}
                onDelete={() => deleteTask(task.id, 'todo')}
              />
            ))}
          </div>
          <button className="w-full mt-3 text-slate-400 hover:text-white flex items-center justify-center gap-1 py-2">
            <Plus size={16} /> Adicionar
          </button>
        </div>

        {/* Em Progresso */}
        <div className="bg-slate-700/30 border border-slate-600 rounded p-4">
          <h3 className="text-white font-semibold mb-3">Em Progresso ({tasks.inProgress.length})</h3>
          <div className="space-y-2">
            {tasks.inProgress.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMove={(toStatus) => moveTask(task.id, 'inProgress', toStatus)}
                onDelete={() => deleteTask(task.id, 'inProgress')}
              />
            ))}
          </div>
          <button className="w-full mt-3 text-slate-400 hover:text-white flex items-center justify-center gap-1 py-2">
            <Plus size={16} /> Adicionar
          </button>
        </div>

        {/* Concluído */}
        <div className="bg-slate-700/30 border border-slate-600 rounded p-4">
          <h3 className="text-white font-semibold mb-3">Concluído ({tasks.done.length})</h3>
          <div className="space-y-2">
            {tasks.done.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMove={(toStatus) => moveTask(task.id, 'done', toStatus)}
                onDelete={() => deleteTask(task.id, 'done')}
              />
            ))}
          </div>
          <button className="w-full mt-3 text-slate-400 hover:text-white flex items-center justify-center gap-1 py-2">
            <Plus size={16} /> Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onMove: (toStatus: string) => void;
  onDelete: () => void;
}

function TaskCard({ task, onMove, onDelete }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-slate-700 p-3 rounded border-l-4 border-slate-600 hover:bg-slate-600 group relative">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{task.title}</p>
          <div className="flex gap-2 mt-2 text-xs">
            <span className={`${priorityColors[task.priority]} text-white px-2 py-1 rounded`}>
              {priorityLabels[task.priority]}
            </span>
            {task.dueDate && <span className="text-slate-400">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition p-1 text-slate-400 hover:text-red-400"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
