import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { Modal } from '../ui/Modal';

export type ProjectPriority = 'ESSENTIAL' | 'DESIRE' | 'DREAM';

export interface RetirementProject {
  id: string;
  name: string;
  emoji: string;
  targetDate: string;
  targetValue: number;
  currentValue: number;
  priority: ProjectPriority;
}

interface RetirementProjectsProps {
  projects: RetirementProject[];
  onAddProject: (project: Omit<RetirementProject, 'id'>) => void;
  onUpdateProject?: (id: string, updates: Partial<RetirementProject>) => void;
}

const PRIORITY_CONFIG: Record<ProjectPriority, { label: string; color: string; bgColor: string }> = {
  ESSENTIAL: { label: 'Essencial', color: '#10B981', bgColor: 'bg-emerald-500/10 border-emerald-500/30' },
  DESIRE: { label: 'Desejo', color: '#3B82F6', bgColor: 'bg-blue-500/10 border-blue-500/30' },
  DREAM: { label: 'Sonho', color: '#8B5CF6', bgColor: 'bg-purple-500/10 border-purple-500/30' }
};

const AVAILABLE_EMOJIS = ['✈️', '🏠', '🚗', '🎓', '💍', '🏝️', '🎸', '📱', '💻', '🏋️', '🎨', '🛥️'];

const ProjectCard: React.FC<{ project: RetirementProject }> = ({ project }) => {
  const progress = project.targetValue > 0
    ? Math.min((project.currentValue / project.targetValue) * 100, 100)
    : 0;
  const config = PRIORITY_CONFIG[project.priority];
  const targetDate = new Date(project.targetDate);
  const formattedDate = targetDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className={`p-4 rounded-xl border ${config.bgColor} transition-all hover:scale-[1.02]`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{project.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-slate-500 mb-0.5">{formattedDate}</div>
          <div className="text-sm font-medium text-white truncate">{project.name}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: config.color
          }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-slate-500">
          Alocado: {formatCurrency(project.currentValue)}
        </span>
        <span className="text-slate-400 font-medium">
          {formatCurrency(project.targetValue)}
        </span>
      </div>
    </div>
  );
};

export const RetirementProjects: React.FC<RetirementProjectsProps> = ({
  projects,
  onAddProject
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    emoji: '✈️',
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetValue: 10000,
    currentValue: 0,
    priority: 'DESIRE' as ProjectPriority
  });

  const projectsByPriority: Record<ProjectPriority, RetirementProject[]> = {
    ESSENTIAL: projects.filter(p => p.priority === 'ESSENTIAL'),
    DESIRE: projects.filter(p => p.priority === 'DESIRE'),
    DREAM: projects.filter(p => p.priority === 'DREAM')
  };

  const getTotalByPriority = (priority: ProjectPriority) => {
    return projectsByPriority[priority].reduce((sum, p) => sum + p.targetValue, 0);
  };

  const handleCreate = () => {
    if (!newProject.name.trim()) return;
    onAddProject(newProject);
    setNewProject({
      name: '',
      emoji: '✈️',
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      targetValue: 10000,
      currentValue: 0,
      priority: 'DESIRE'
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Meus Projetos</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
        >
          <Plus size={14} />
          Novo projeto
        </button>
      </div>

      {/* Priority Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['ESSENTIAL', 'DESIRE', 'DREAM'] as ProjectPriority[]).map(priority => {
          const config = PRIORITY_CONFIG[priority];
          const items = projectsByPriority[priority];
          const total = getTotalByPriority(priority);

          return (
            <div key={priority} className="space-y-3">
              {/* Column Header */}
              <div className={`p-3 rounded-xl border ${config.bgColor}`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{config.label}</span>
                  <span className="text-xs text-slate-400">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Project Cards */}
              {items.length > 0 ? (
                items.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="p-4 border border-dashed border-slate-700 rounded-xl text-center text-sm text-slate-500">
                  Nenhum projeto
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Projeto"
        variant="dark"
        size="md"
        footer={
          <button
            onClick={handleCreate}
            disabled={!newProject.name.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            Criar Projeto
          </button>
        }
      >
        <div className="space-y-4">
          {/* Emoji Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewProject({ ...newProject, emoji })}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    newProject.emoji === emoji
                      ? 'bg-blue-600 ring-2 ring-blue-400'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome</label>
            <input
              type="text"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="Ex: Viagem para Europa"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Prioridade</label>
            <div className="grid grid-cols-3 gap-2">
              {(['ESSENTIAL', 'DESIRE', 'DREAM'] as ProjectPriority[]).map(p => {
                const config = PRIORITY_CONFIG[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewProject({ ...newProject, priority: p })}
                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                      newProject.priority === p
                        ? config.bgColor
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                    style={{ color: newProject.priority === p ? config.color : undefined }}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Value */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Valor alvo</label>
            <input
              type="number"
              value={newProject.targetValue}
              onChange={(e) => setNewProject({ ...newProject, targetValue: Number(e.target.value) })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Data alvo</label>
            <input
              type="date"
              value={newProject.targetDate}
              onChange={(e) => setNewProject({ ...newProject, targetDate: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 [color-scheme:dark]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
