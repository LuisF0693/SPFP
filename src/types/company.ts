export interface CompanySquad {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  is_archived: boolean;
  sort_order: number;
  created_at: string;
}

export interface CompanyBoard {
  id: string;
  squad_id: string;
  user_id: string;
  name: string;
  description?: string;
  is_archived: boolean;
  sort_order: number;
  created_at: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface CompanyTask {
  id: string;
  board_id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  due_date?: string;
  sort_order: number;
  created_at: string;
}

export interface CompanyMember {
  id: string;
  user_id: string;
  squad_id: string;
  name: string;
  role: string;
  avatar_url?: string;
  is_ai_agent: boolean;
  created_at: string;
}
