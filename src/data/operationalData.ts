/**
 * Mock data para Operational Dashboard
 * Tarefas, kanban, prioridades
 */

import { format, addDays } from 'date-fns';

export interface OperationalTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'alta' | 'media' | 'baixa';
  assignee?: string;
  due_date?: string; // ISO date
  completed_at?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

const today = new Date();

export const operationalMockData = {
  tasks: [
    {
      id: 'task-1',
      title: 'Revisar relatório Q1',
      description: 'Analisar métricas de desempenho do primeiro trimestre',
      status: 'todo' as const,
      priority: 'alta' as const,
      assignee: 'Maria',
      due_date: format(addDays(today, 2), 'yyyy-MM-dd'),
      position: 1,
      created_at: format(addDays(today, -5), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -3), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'task-2',
      title: 'Atualizar documentação',
      description: 'Documentar novos processos de onboarding',
      status: 'todo' as const,
      priority: 'media' as const,
      assignee: 'João',
      due_date: format(addDays(today, 5), 'yyyy-MM-dd'),
      position: 2,
      created_at: format(addDays(today, -4), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -2), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'task-3',
      title: 'Contatar cliente importante',
      description: 'Follow-up com cliente X sobre proposta em andamento',
      status: 'todo' as const,
      priority: 'alta' as const,
      assignee: 'Pedro',
      due_date: format(today, 'yyyy-MM-dd'),
      position: 3,
      created_at: format(addDays(today, -6), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -1), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'task-4',
      title: 'Testar nova feature',
      description: 'QA da funcionalidade de relatórios automáticos',
      status: 'in_progress' as const,
      priority: 'alta' as const,
      assignee: 'Ana',
      due_date: format(addDays(today, 3), 'yyyy-MM-dd'),
      position: 1,
      created_at: format(addDays(today, -3), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -1), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'task-5',
      title: 'Reunião de planejamento',
      description: 'Sprint planning para próximas 2 semanas',
      status: 'in_progress' as const,
      priority: 'media' as const,
      assignee: 'Carlos',
      due_date: format(addDays(today, 1), 'yyyy-MM-dd'),
      position: 2,
      created_at: format(addDays(today, -2), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(today, 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'task-6',
      title: 'Validar integrações',
      description: 'Conferir funcionamento das integrações com terceiros',
      status: 'in_progress' as const,
      priority: 'media' as const,
      assignee: 'Lucas',
      due_date: format(addDays(today, 2), 'yyyy-MM-dd'),
      position: 3,
      created_at: format(addDays(today, -4), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, 1), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'task-7',
      title: 'Implementar validação de email',
      description: 'Adicionar validação melhorada para campos de email',
      status: 'done' as const,
      priority: 'media' as const,
      assignee: 'Sofia',
      due_date: format(addDays(today, -1), 'yyyy-MM-dd'),
      completed_at: format(addDays(today, -1), 'yyyy-MM-ddTHH:mm:ss'),
      position: 1,
      created_at: format(addDays(today, -7), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -1), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'task-8',
      title: 'Deploy para produção',
      description: 'Realizar deploy da versão 2.5.1 para produção',
      status: 'done' as const,
      priority: 'alta' as const,
      assignee: 'Devops Team',
      due_date: format(addDays(today, -2), 'yyyy-MM-dd'),
      completed_at: format(addDays(today, -2), 'yyyy-MM-ddTHH:mm:ss'),
      position: 2,
      created_at: format(addDays(today, -5), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -2), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'task-9',
      title: 'Correção de bug crítico',
      description: 'Corrigir erro de sincronização de dados',
      status: 'done' as const,
      priority: 'alta' as const,
      assignee: 'Bruno',
      due_date: format(addDays(today, -3), 'yyyy-MM-dd'),
      completed_at: format(addDays(today, -3), 'yyyy-MM-ddTHH:mm:ss'),
      position: 3,
      created_at: format(addDays(today, -6), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -3), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'task-10',
      title: 'Otimizar performance',
      description: 'Melhorar tempo de carregamento das páginas',
      status: 'done' as const,
      priority: 'media' as const,
      assignee: 'Julia',
      due_date: format(addDays(today, -4), 'yyyy-MM-dd'),
      completed_at: format(addDays(today, -4), 'yyyy-MM-ddTHH:mm:ss'),
      position: 4,
      created_at: format(addDays(today, -10), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -4), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'task-11',
      title: 'Responder emails pendentes',
      description: 'Processar caixa de entrada de emails importantes',
      status: 'todo' as const,
      priority: 'baixa' as const,
      assignee: 'Recepção',
      due_date: format(addDays(today, 7), 'yyyy-MM-dd'),
      position: 4,
      created_at: format(addDays(today, -1), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -1), 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'task-12',
      title: 'Atualizar biblioteca de ícones',
      description: 'Adicionar 20 novos ícones solicitados pela equipe de design',
      status: 'todo' as const,
      priority: 'baixa' as const,
      assignee: 'Designer',
      due_date: format(addDays(today, 10), 'yyyy-MM-dd'),
      position: 5,
      created_at: format(addDays(today, -2), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(today, 'yyyy-MM-ddTHH:mm:ss'),
    },
    {
      id: 'task-13',
      title: 'Testes de usabilidade',
      description: 'Conduzir testes com 5 usuários sobre nova interface',
      status: 'in_progress' as const,
      priority: 'media' as const,
      assignee: 'UX Team',
      due_date: format(addDays(today, 4), 'yyyy-MM-dd'),
      position: 4,
      created_at: format(addDays(today, -3), 'yyyy-MM-ddTHH:mm:ss'),
      updated_at: format(addDays(today, -1), 'yyyy-MM-ddTHH:mm:ss'),
    },
  ] as OperationalTask[],
};

export const getPriorityColor = (
  priority: string
): { bg: string; text: string; border: string; icon: string } => {
  const colors: Record<
    string,
    { bg: string; text: string; border: string; icon: string }
  > = {
    alta: {
      bg: 'bg-red-900/20',
      text: 'text-red-300',
      border: 'border-red-700',
      icon: '🔴',
    },
    media: {
      bg: 'bg-yellow-900/20',
      text: 'text-yellow-300',
      border: 'border-yellow-700',
      icon: '🟡',
    },
    baixa: {
      bg: 'bg-green-900/20',
      text: 'text-green-300',
      border: 'border-green-700',
      icon: '🟢',
    },
  };
  return colors[priority] || colors.media;
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    todo: 'A Fazer',
    in_progress: 'Em Progresso',
    done: 'Concluído',
  };
  return labels[status] || status;
};

export const getDaysUntilDue = (dueDate?: string): number | null => {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

export const getDateColor = (daysUntil: number | null) => {
  if (daysUntil === null) return { bg: '', text: '' };
  if (daysUntil < 0) return { bg: 'bg-red-900/20', text: 'text-red-300' };
  if (daysUntil <= 3) return { bg: 'bg-yellow-900/20', text: 'text-yellow-300' };
  return { bg: 'bg-gray-900/20', text: 'text-gray-300' };
};
