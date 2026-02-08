// AIOS Virtual Office - Zustand Store
import { create } from 'zustand';
import type { AgentId, AgentState, AgentStatus, Activity } from '../types';
import { AGENTS } from '../data/agents';

interface VirtualOfficeState {
  // Agent states
  agents: Record<AgentId, AgentState>;

  // UI state
  selectedAgentId: AgentId | null;
  isPanelOpen: boolean;

  // Activities
  activities: Activity[];

  // Mode
  mockMode: boolean;
  isConnected: boolean;

  // Actions
  setAgentStatus: (agentId: AgentId, status: AgentStatus, activity?: string) => void;
  selectAgent: (agentId: AgentId | null) => void;
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  setMockMode: (enabled: boolean) => void;
  setConnected: (connected: boolean) => void;
  clearActivities: () => void;
}

// Initialize agents from config
const initialAgents: Record<AgentId, AgentState> = Object.entries(AGENTS).reduce(
  (acc, [id, config]) => ({
    ...acc,
    [id]: {
      ...config,
      status: 'idle' as AgentStatus,
      currentActivity: undefined,
      lastActivityTime: undefined
    }
  }),
  {} as Record<AgentId, AgentState>
);

export const useVirtualOfficeStore = create<VirtualOfficeState>((set) => ({
  // Initial state
  agents: initialAgents,
  selectedAgentId: null,
  isPanelOpen: false,
  activities: [],
  mockMode: true, // Start in mock mode by default
  isConnected: false,

  // Actions
  setAgentStatus: (agentId, status, activity) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          status,
          currentActivity: activity,
          lastActivityTime: Date.now()
        }
      }
    })),

  selectAgent: (agentId) =>
    set({
      selectedAgentId: agentId,
      isPanelOpen: agentId !== null
    }),

  addActivity: (activity) =>
    set((state) => ({
      activities: [
        {
          ...activity,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        },
        ...state.activities
      ].slice(0, 50) // Keep last 50 activities
    })),

  setMockMode: (enabled) => set({ mockMode: enabled }),

  setConnected: (connected) => set({ isConnected: connected }),

  clearActivities: () => set({ activities: [] })
}));
