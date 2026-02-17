/**
 * OperationalDashboard
 * Kanban board com 3 colunas (A Fazer, Em Progresso, Concluído)
 */

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, X } from 'lucide-react';
import { OperationalTask, operationalMockData, getPriorityColor, getStatusLabel, getDaysUntilDue, getDateColor } from '@/data/operationalData';
import TaskForm from './components/TaskForm';
import PriorityFilter from './components/PriorityFilter';

type PriorityFilter = 'todas' | 'alta' | 'media' | 'baixa';

const STATUSES = [
  { id: 'todo', label: 'A Fazer', color: '#f3f4f6' },
  { id: 'in_progress', label: 'Em Progresso', color: '#3b82f6' },
  { id: 'done', label: 'Concluído', color: '#10b981' },
];

// Draggable card component
function DraggableTaskCard({
  task,
  onSelect,
}: {
  task: OperationalTask;
  onSelect: (task: OperationalTask) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const daysUntil = getDaysUntilDue(task.due_date);
  const dateColor = getDateColor(daysUntil);
  const priorityColor = getPriorityColor(task.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(task)}
      className={`p-3 rounded border cursor-move transition-all ${
        isDragging
          ? 'bg-slate-600 shadow-lg'
          : 'bg-slate-800 border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white truncate">{task.title}</p>
          {task.assignee && (
            <p className="text-xs text-slate-400 truncate">👤 {task.assignee}</p>
          )}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ml-2 ${priorityColor.text} ${priorityColor.bg}`}>
          {priorityColor.icon}
        </span>
      </div>

      {task.due_date && (
        <div className={`text-xs p-1.5 rounded ${dateColor.bg} ${dateColor.text}`}>
          {daysUntil !== null && daysUntil < 0
            ? `Vencido há ${Math.abs(daysUntil)} dia(s)`
            : daysUntil === null
              ? 'Data definida'
              : daysUntil === 0
                ? 'Vence hoje'
                : `Vence em ${daysUntil} dia(s)`}
        </div>
      )}
    </div>
  );
}

export function OperationalDashboard() {
  const [tasks, setTasks] = useState<OperationalTask[]>(operationalMockData.tasks);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('todas');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OperationalTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor)
  );

  const handleAddTask = (newTask: Omit<OperationalTask, 'id' | 'created_at' | 'updated_at' | 'position'>) => {
    const task: OperationalTask = {
      ...newTask,
      id: `task-${Date.now()}`,
      position: 999,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks([...tasks, task]);
    setShowTaskForm(false);
  };

  // Filter tasks by priority
  const filteredTasks = useMemo(() => {
    if (priorityFilter === 'todas') return tasks;
    return tasks.filter((t) => t.priority === priorityFilter);
  }, [tasks, priorityFilter]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, OperationalTask[]> = {};
    STATUSES.forEach((status) => {
      grouped[status.id] = filteredTasks
        .filter((t) => t.status === status.id)
        .sort((a, b) => a.position - b.position);
    });
    return grouped;
  }, [filteredTasks]);

  // Calculate counts
  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUSES.forEach((status) => {
      counts[status.id] = tasksByStatus[status.id].length;
    });
    return counts;
  }, [tasksByStatus]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const draggedTask = tasks.find((t) => t.id === active.id);
    if (!draggedTask) return;

    const newStatus = over.id as OperationalTask['status'];
    if (draggedTask.status === newStatus) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggedTask.id
          ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
          : task
      )
    );
  };

  return (
    <div className="space-y-6 p-6 bg-slate-800 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-white">Dashboard Operacional</h3>
        <button
          onClick={() => setShowTaskForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          Nova Tarefa
        </button>
      </div>

      {/* Priority Filter */}
      <PriorityFilter
        selectedPriority={priorityFilter}
        onSelectPriority={(priority) => setPriorityFilter(priority as PriorityFilter)}
      />

      {/* Kanban Board */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUSES.map((status) => (
            <div key={status.id} className="flex-1 bg-slate-700/50 rounded-lg p-4">
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{status.label}</h4>
                  <p className="text-xs text-slate-400">
                    {taskCounts[status.id]} tarefa(s)
                  </p>
                </div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
              </div>

              {/* Task List */}
              <SortableContext
                items={tasksByStatus[status.id].map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 min-h-[300px]">
                  {tasksByStatus[status.id].map((task) => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      onSelect={setSelectedTask}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{selectedTask.title}</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <dl className="space-y-3 mb-6">
              {selectedTask.description && (
                <div>
                  <dt className="text-xs text-slate-400 font-semibold">Descrição</dt>
                  <dd className="text-sm text-slate-300 mt-1">{selectedTask.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-400 font-semibold">Status</dt>
                <dd className="text-sm font-medium text-white capitalize mt-1">
                  {getStatusLabel(selectedTask.status)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400 font-semibold">Prioridade</dt>
                <dd className="text-sm font-medium text-white capitalize mt-1">
                  {getPriorityColor(selectedTask.priority).icon} {selectedTask.priority}
                </dd>
              </div>
              {selectedTask.assignee && (
                <div>
                  <dt className="text-xs text-slate-400 font-semibold">Responsável</dt>
                  <dd className="text-sm font-medium text-white mt-1">
                    {selectedTask.assignee}
                  </dd>
                </div>
              )}
              {selectedTask.due_date && (
                <div>
                  <dt className="text-xs text-slate-400 font-semibold">Data de Vencimento</dt>
                  <dd className="text-sm font-medium text-white mt-1">
                    {new Date(selectedTask.due_date).toLocaleDateString('pt-BR')}
                  </dd>
                </div>
              )}
            </dl>

            <button
              onClick={() => setSelectedTask(null)}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onSubmit={handleAddTask}
          onClose={() => setShowTaskForm(false)}
        />
      )}
    </div>
  );
}
