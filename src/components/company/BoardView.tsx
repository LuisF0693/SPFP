import React, { useEffect, useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { ArrowLeft, Plus, Filter, Loader2 } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { CompanyBoard, CompanyTask, TaskStatus, TaskPriority } from '../../types/company';
import { TaskCard, PRIORITY_CONFIG } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskForm } from './forms/TaskForm';
import { SPFP_AGENTS } from '../../data/companyAgents';

interface Column {
  id: TaskStatus;
  label: string;
  borderColor: string;
  headerColor: string;
}

const COLUMNS: Column[] = [
  { id: 'TODO',        label: 'A Fazer',      borderColor: 'border-gray-600',    headerColor: 'text-gray-300' },
  { id: 'IN_PROGRESS', label: 'Em Andamento', borderColor: 'border-blue-500',    headerColor: 'text-blue-400' },
  { id: 'REVIEW',      label: 'Em Revisão',   borderColor: 'border-amber-500',   headerColor: 'text-amber-400' },
  { id: 'DONE',        label: 'Concluído',    borderColor: 'border-emerald-500', headerColor: 'text-emerald-400' },
];

const PRIORITY_FILTERS: { value: TaskPriority | 'ALL'; label: string }[] = [
  { value: 'ALL',    label: 'Todas' },
  { value: 'URGENT', label: '🔴 Urgente' },
  { value: 'HIGH',   label: '🟠 Alta' },
  { value: 'MEDIUM', label: '🟡 Média' },
  { value: 'LOW',    label: '🟢 Baixa' },
];

interface BoardViewProps {
  board: CompanyBoard;
  onBack: () => void;
}

export const BoardView: React.FC<BoardViewProps> = ({ board, onBack }) => {
  const { tasks, tasksLoading, loadTasks, addTask, updateTask } = useCompany();
  const [selectedTask, setSelectedTask] = useState<CompanyTask | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [defaultFormStatus, setDefaultFormStatus] = useState<TaskStatus>('TODO');
  const [activeTask, setActiveTask] = useState<CompanyTask | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTasks(board.id);
  }, [board.id, loadTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'ALL' || t.assignee_name === assigneeFilter;
      return matchesPriority && matchesAssignee;
    });
  }, [tasks, priorityFilter, assigneeFilter]);

  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, CompanyTask[]> = {
      TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [],
    };
    filteredTasks.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [filteredTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Handled in DragEnd for simplicity
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Determine if dropped over a column header or another task
    const targetColumn = COLUMNS.find((c) => c.id === overId);
    const targetTask = tasks.find((t) => t.id === overId);

    let newStatus: TaskStatus | null = null;

    if (targetColumn) {
      newStatus = targetColumn.id;
    } else if (targetTask) {
      newStatus = targetTask.status;
    }

    if (!newStatus) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    await updateTask(taskId, { status: newStatus });
  };

  const handleAddTask = (columnId: TaskStatus) => {
    setDefaultFormStatus(columnId);
    setShowTaskForm(true);
  };

  const handleTaskFormSubmit = async (data: Omit<CompanyTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await addTask(data);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Board header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 flex-shrink-0">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <span
          className="text-xl w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ backgroundColor: `${board.color || '#6366f1'}20` }}
        >
          {board.icon || '📋'}
        </span>
        <div>
          <h3 className="text-white font-bold text-base">{board.name}</h3>
          {board.description && <p className="text-gray-500 text-xs">{board.description}</p>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`p-2 rounded-xl transition-colors text-sm font-medium flex items-center gap-1.5 ${
              showFilters ? 'bg-accent/10 text-accent border border-accent/20' : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Filter size={15} />
            <span className="hidden sm:inline text-xs">Filtros</span>
          </button>
          <button
            onClick={() => { setDefaultFormStatus('TODO'); setShowTaskForm(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/80 transition-colors"
          >
            <Plus size={14} />
            Nova Task
          </button>
        </div>
      </div>

      {/* Filters bar */}
      {showFilters && (
        <div className="flex flex-col gap-2 px-6 py-3 border-b border-white/5 bg-white/2 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Prioridade:</span>
            {PRIORITY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setPriorityFilter(f.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  priorityFilter === f.value
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Agente:</span>
            <button
              onClick={() => setAssigneeFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                assigneeFilter === 'ALL' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              Todos
            </button>
            {SPFP_AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setAssigneeFilter(agent.name)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  assigneeFilter === agent.name ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {agent.avatar} {agent.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kanban board */}
      {tasksLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-gray-500" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto p-4 md:p-6">
            <div className="flex gap-4 h-full min-w-max items-start">
              {COLUMNS.map((col) => {
                const colTasks = tasksByColumn[col.id];
                return (
                  <div
                    key={col.id}
                    id={col.id}
                    className={`w-72 flex flex-col rounded-2xl bg-white/3 border-t-2 ${col.borderColor} overflow-visible`}
                  >
                    {/* Column header */}
                    <div className="px-3 py-3 flex items-center justify-between flex-shrink-0">
                      <span className={`text-sm font-semibold ${col.headerColor}`}>{col.label}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                        <button
                          onClick={() => handleAddTask(col.id)}
                          className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Tasks */}
                    <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex-1 px-2 pb-2 space-y-2 min-h-[60px]">
                        {colTasks.length === 0 ? (
                          <div
                            id={col.id}
                            className="flex items-center justify-center py-6 text-gray-700 text-xs border-2 border-dashed border-white/5 rounded-xl cursor-default"
                          >
                            Solte aqui
                          </div>
                        ) : (
                          colTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onClick={(t) => setSelectedTask(t)}
                            />
                          ))
                        )}
                      </div>
                    </SortableContext>

                    {/* Add task button at bottom */}
                    <button
                      onClick={() => handleAddTask(col.id)}
                      className="flex items-center gap-2 px-3 py-2.5 text-gray-600 hover:text-gray-400 hover:bg-white/3 transition-colors text-xs border-t border-white/5 rounded-b-2xl"
                    >
                      <Plus size={13} />
                      Adicionar task
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drag overlay (ghost card) */}
          {createPortal(
            <DragOverlay>
              {activeTask && (
                <div className="opacity-80 rotate-2 scale-105">
                  <TaskCard task={activeTask} onClick={() => {}} />
                </div>
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      )}

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* New task form */}
      {showTaskForm && (
        <TaskForm
          boardId={board.id}
          defaultStatus={defaultFormStatus}
          onSubmit={handleTaskFormSubmit}
          onClose={() => setShowTaskForm(false)}
        />
      )}
    </div>
  );
};
