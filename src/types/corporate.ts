// ===============================
// Corporate HQ Types
// ===============================

export type Department = 'financeiro' | 'marketing' | 'operacional' | 'comercial';
export type ActivityStatus = 'running' | 'idle' | 'waiting' | 'completed' | 'error';

// ===============================
// Department Definition
// ===============================

export interface DepartmentConfig {
  id: Department;
  name: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
  npc: {
    role: string;
    emoji: string;
  };
  position: {
    row: number;
    col: number;
  };
  description: string;
}

// ===============================
// Corporate Activity (Feed)
// ===============================

export interface CorporateActivity {
  id: string;
  user_id: string;
  department: Department;
  agent_name: string;
  agent_role?: string;
  description: string;
  status: ActivityStatus;
  requires_approval: boolean;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
