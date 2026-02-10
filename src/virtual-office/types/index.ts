// AIOS Virtual Office - Type Definitions

export type AgentId =
  | 'orion' | 'morgan' | 'sophie' | 'max'
  | 'dex' | 'aria' | 'nova' | 'quinn'
  | 'luna' | 'atlas' | 'gage' | 'nando';

export type AgentStatus = 'idle' | 'working' | 'thinking' | 'waiting' | 'error';

export type Department = 'product' | 'engineering' | 'quality' | 'design' | 'operations';

export interface Position {
  x: number;
  y: number;
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  role: string;
  department: Department;
  emoji: string;
  position: Position;
}

export interface AgentState extends AgentConfig {
  status: AgentStatus;
  currentActivity?: string;
  lastActivityTime?: number;
}

export interface Activity {
  id: string;
  timestamp: number;
  agentId: AgentId;
  type: 'tool_start' | 'tool_complete' | 'status_change' | 'task_assigned';
  description: string;
  tool?: string;
  success?: boolean;
}

export interface DepartmentConfig {
  name: string;
  color: number;
  colorHex: string;
  background: string;
  bounds: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface DepartmentColors {
  primary: string;
  secondary: string;
  glow: string;
}

// Bridge Events
export interface AIOSEvent {
  timestamp: number;
  type: 'tool_start' | 'tool_complete' | 'agent_stop' | 'status_change';
  agentId: AgentId;
  tool?: string;
  status?: AgentStatus;
  summary?: string;
  success?: boolean;
}
