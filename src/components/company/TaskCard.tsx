import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical, User } from 'lucide-react';
import { CompanyTask, TaskPriority } from '../../types/company';
import { SPFP_AGENTS } from '../../data/companyAgents';

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; dot: string }> = {
  URGENT: { label: 'Urgente', color: 'text-red-400 bg-red-500/10',    dot: 'bg-red-400' },
  HIGH:   { label: 'Alta',    color: 'text-orange-400 bg-orange-500/10', dot: 'bg-orange-400' },
  MEDIUM: { label: 'Média',   color: 'text-yellow-400 bg-yellow-500/10', dot: 'bg-yellow-400' },
  LOW:    { label: 'Baixa',   color: 'text-emerald-400 bg-emerald-500/10', dot: 'bg-emerald-400' },
};

interface TaskCardProps {
  task: CompanyTask;
  onClick: (task: CompanyTask) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass rounded-xl border border-white/5 hover:border-white/15 group transition-all cursor-pointer"
      onClick={() => onClick(task)}
    >
      <div className="p-3 space-y-2">
        {/* Drag handle + priority */}
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={13} />
          </div>
          <span className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${priority.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>
          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {task.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-accent/10 text-accent">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <p className="text-white text-sm font-medium leading-snug group-hover:text-accent/90 transition-colors">
          {task.title}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-1">
          {task.due_date && (
            <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
              <Calendar size={10} />
              {new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </span>
          )}
          {task.assignee_name && (
            <div className="ml-auto flex items-center gap-1">
              {(() => {
                const agent = SPFP_AGENTS.find((a) => a.name === task.assignee_name);
                if (agent) {
                  return (
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs" title={agent.name}>
                      {agent.avatar}
                    </span>
                  );
                }
                if (task.assignee_avatar) {
                  return <img src={task.assignee_avatar} alt={task.assignee_name} className="w-5 h-5 rounded-full object-cover" />;
                }
                return (
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                    <User size={9} className="text-accent" />
                  </div>
                );
              })()}
              <span className="text-[10px] text-gray-500 hidden sm:block">{task.assignee_name.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
