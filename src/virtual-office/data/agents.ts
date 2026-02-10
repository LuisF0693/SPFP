// AIOS Virtual Office - Agent Definitions
import type { AgentId, AgentConfig, Department, DepartmentConfig, DepartmentColors } from '../types';

export const AGENTS: Record<AgentId, AgentConfig> = {
  orion: {
    id: 'orion',
    name: 'Orion',
    role: 'Master Orchestrator',
    department: 'operations',
    emoji: '👑',
    position: { x: 400, y: 380 }
  },
  morgan: {
    id: 'morgan',
    name: 'Morgan',
    role: 'Product Manager',
    department: 'product',
    emoji: '👔',
    position: { x: 80, y: 100 }
  },
  sophie: {
    id: 'sophie',
    name: 'Sophie',
    role: 'Product Owner',
    department: 'product',
    emoji: '👁️',
    position: { x: 80, y: 180 }
  },
  max: {
    id: 'max',
    name: 'Max',
    role: 'Scrum Master',
    department: 'product',
    emoji: '📋',
    position: { x: 80, y: 260 }
  },
  dex: {
    id: 'dex',
    name: 'Dex',
    role: 'Developer',
    department: 'engineering',
    emoji: '💻',
    position: { x: 230, y: 100 }
  },
  aria: {
    id: 'aria',
    name: 'Aria',
    role: 'Architect',
    department: 'engineering',
    emoji: '🏗️',
    position: { x: 230, y: 180 }
  },
  nova: {
    id: 'nova',
    name: 'Nova',
    role: 'Data Engineer',
    department: 'engineering',
    emoji: '🔧',
    position: { x: 230, y: 260 }
  },
  quinn: {
    id: 'quinn',
    name: 'Quinn',
    role: 'QA Engineer',
    department: 'quality',
    emoji: '🧪',
    position: { x: 380, y: 100 }
  },
  luna: {
    id: 'luna',
    name: 'Luna',
    role: 'UX Designer',
    department: 'design',
    emoji: '🎨',
    position: { x: 530, y: 100 }
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    role: 'Analyst',
    department: 'operations',
    emoji: '📊',
    position: { x: 250, y: 380 }
  },
  gage: {
    id: 'gage',
    name: 'Gage',
    role: 'DevOps',
    department: 'operations',
    emoji: '🚀',
    position: { x: 550, y: 380 }
  },
  nando: {
    id: 'nando',
    name: 'Nando',
    role: 'CEO & Founder',
    department: 'operations',
    emoji: '👨‍💼',
    position: { x: 400, y: 300 }
  }
};

export const DEPARTMENT_COLORS: Record<Department, DepartmentColors> = {
  product: {
    primary: '#4A90D9',
    secondary: '#3A7BC8',
    glow: 'rgba(74, 144, 217, 0.4)'
  },
  engineering: {
    primary: '#50C878',
    secondary: '#40B868',
    glow: 'rgba(80, 200, 120, 0.4)'
  },
  quality: {
    primary: '#FF6B6B',
    secondary: '#EE5A5A',
    glow: 'rgba(255, 107, 107, 0.4)'
  },
  design: {
    primary: '#FFA500',
    secondary: '#EE9400',
    glow: 'rgba(255, 165, 0, 0.4)'
  },
  operations: {
    primary: '#9B59B6',
    secondary: '#8A48A5',
    glow: 'rgba(155, 89, 182, 0.4)'
  }
};

export const DEPARTMENTS: Record<Department, DepartmentConfig> = {
  product: {
    name: 'Product',
    color: 0x4a90d9,
    colorHex: '#4A90D9',
    background: 'rgba(74, 144, 217, 0.1)',
    bounds: { x: 20, y: 50, w: 140, h: 260 }
  },
  engineering: {
    name: 'Engineering',
    color: 0x50c878,
    colorHex: '#50C878',
    background: 'rgba(80, 200, 120, 0.1)',
    bounds: { x: 170, y: 50, w: 140, h: 260 }
  },
  quality: {
    name: 'Quality',
    color: 0xff6b6b,
    colorHex: '#FF6B6B',
    background: 'rgba(255, 107, 107, 0.1)',
    bounds: { x: 320, y: 50, w: 140, h: 180 }
  },
  design: {
    name: 'Design',
    color: 0xffa500,
    colorHex: '#FFA500',
    background: 'rgba(255, 165, 0, 0.1)',
    bounds: { x: 470, y: 50, w: 140, h: 180 }
  },
  operations: {
    name: 'Operations',
    color: 0x9b59b6,
    colorHex: '#9B59B6',
    background: 'rgba(155, 89, 182, 0.1)',
    bounds: { x: 170, y: 330, w: 460, h: 100 }
  }
};

export const STATUS_COLORS: Record<string, { bg: string; animation: string }> = {
  idle: { bg: 'bg-gray-500', animation: '' },
  working: { bg: 'bg-green-500', animation: 'animate-pulse' },
  thinking: { bg: 'bg-yellow-500', animation: 'animate-pulse' },
  waiting: { bg: 'bg-gray-400', animation: '' },
  error: { bg: 'bg-red-500', animation: 'animate-ping' }
};

export function getAgentsByDepartment(department: Department): AgentConfig[] {
  return Object.values(AGENTS).filter(agent => agent.department === department);
}

export function getAllAgents(): AgentConfig[] {
  return Object.values(AGENTS);
}
