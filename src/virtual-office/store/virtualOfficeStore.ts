// AIOS Virtual Office - Zustand Store
import { create } from 'zustand';
import type { AgentId, AgentState, AgentStatus, Activity, Position } from '../types';
import { AGENTS } from '../data/agents';

// Task types
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  agentId: AgentId;
  description: string;
  priority: TaskPriority;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  agentId: AgentId;
  content: string;
  isUser: boolean;
  timestamp: number;
}

// Camera configuration
export const CAMERA_CONFIG = {
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 2.0,
  ZOOM_STEP: 0.1,
  // Office dimensions for bounds calculation
  OFFICE_WIDTH: 1200,
  OFFICE_HEIGHT: 600
};

interface CameraState {
  position: Position;
  zoom: number;
}

interface VirtualOfficeState {
  // Agent states
  agents: Record<AgentId, AgentState>;

  // UI state
  selectedAgentId: AgentId | null;
  isPanelOpen: boolean;

  // Camera state
  camera: CameraState;

  // Activities
  activities: Activity[];

  // Tasks
  tasks: Task[];

  // Chat messages per agent
  chatMessages: Record<AgentId, ChatMessage[]>;

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

  // Camera actions
  setCameraPosition: (position: Position) => void;
  setCameraZoom: (zoom: number) => void;
  panCamera: (deltaX: number, deltaY: number) => void;
  zoomCamera: (delta: number, centerX?: number, centerY?: number) => void;
  centerOnAgent: (agentId: AgentId) => void;
  resetCamera: () => void;

  // Task actions
  assignTask: (agentId: AgentId, description: string, priority: TaskPriority) => Task;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;

  // Chat actions
  addChatMessage: (agentId: AgentId, message: Omit<ChatMessage, 'id' | 'agentId' | 'timestamp'>) => void;
  clearChatMessages: (agentId?: AgentId) => void;
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

// Initial camera state
const initialCamera: CameraState = {
  position: { x: 0, y: 0 },
  zoom: 1.0
};

// Helper function to clamp camera position within bounds
function clampCameraPosition(position: Position, zoom: number): Position {
  const { OFFICE_WIDTH, OFFICE_HEIGHT } = CAMERA_CONFIG;

  // Calculate visible area at current zoom
  const viewportWidth = OFFICE_WIDTH / zoom;
  const viewportHeight = OFFICE_HEIGHT / zoom;

  // Calculate max pan distance (allow 20% of office to remain visible)
  const maxPanX = OFFICE_WIDTH * 0.8;
  const maxPanY = OFFICE_HEIGHT * 0.8;

  return {
    x: Math.max(-maxPanX, Math.min(maxPanX, position.x)),
    y: Math.max(-maxPanY, Math.min(maxPanY, position.y))
  };
}

export const useVirtualOfficeStore = create<VirtualOfficeState>((set, get) => ({
  // Initial state
  agents: initialAgents,
  selectedAgentId: null,
  isPanelOpen: false,
  camera: initialCamera,
  activities: [],
  tasks: [],
  chatMessages: {} as Record<AgentId, ChatMessage[]>,
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

  clearActivities: () => set({ activities: [] }),

  // Camera actions
  setCameraPosition: (position) =>
    set((state) => ({
      camera: {
        ...state.camera,
        position: clampCameraPosition(position, state.camera.zoom)
      }
    })),

  setCameraZoom: (zoom) =>
    set((state) => ({
      camera: {
        ...state.camera,
        zoom: Math.max(CAMERA_CONFIG.MIN_ZOOM, Math.min(CAMERA_CONFIG.MAX_ZOOM, zoom))
      }
    })),

  panCamera: (deltaX, deltaY) =>
    set((state) => {
      const newPosition = {
        x: state.camera.position.x + deltaX,
        y: state.camera.position.y + deltaY
      };
      return {
        camera: {
          ...state.camera,
          position: clampCameraPosition(newPosition, state.camera.zoom)
        }
      };
    }),

  zoomCamera: (delta, centerX, centerY) =>
    set((state) => {
      const { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } = CAMERA_CONFIG;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.camera.zoom + delta * ZOOM_STEP));

      // If center point provided, adjust position to zoom towards that point
      if (centerX !== undefined && centerY !== undefined && newZoom !== state.camera.zoom) {
        const zoomRatio = newZoom / state.camera.zoom;
        const newPosition = {
          x: state.camera.position.x + (centerX - state.camera.position.x) * (1 - zoomRatio),
          y: state.camera.position.y + (centerY - state.camera.position.y) * (1 - zoomRatio)
        };
        return {
          camera: {
            position: clampCameraPosition(newPosition, newZoom),
            zoom: newZoom
          }
        };
      }

      return {
        camera: {
          ...state.camera,
          zoom: newZoom
        }
      };
    }),

  centerOnAgent: (agentId) =>
    set((state) => {
      const agent = state.agents[agentId];
      if (!agent) return state;

      // Center the camera on the agent's position
      // The agent position is relative to the office, we need to offset to center
      const { OFFICE_WIDTH, OFFICE_HEIGHT } = CAMERA_CONFIG;
      const newPosition = {
        x: -(agent.position.x - OFFICE_WIDTH / 2),
        y: -(agent.position.y - OFFICE_HEIGHT / 2)
      };

      return {
        camera: {
          position: clampCameraPosition(newPosition, state.camera.zoom),
          zoom: Math.max(1.0, state.camera.zoom) // Zoom in at least to 1x when centering
        },
        selectedAgentId: agentId,
        isPanelOpen: true
      };
    }),

  resetCamera: () => set({ camera: initialCamera }),

  // Task actions
  assignTask: (agentId, description, priority) => {
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      description,
      priority,
      status: 'in_progress',
      createdAt: Date.now()
    };

    set((state) => ({
      tasks: [task, ...state.tasks].slice(0, 100), // Keep last 100 tasks
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          status: 'working' as AgentStatus,
          currentActivity: description,
          lastActivityTime: Date.now()
        }
      },
      activities: [
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          agentId,
          type: 'task_assigned' as const,
          description: `Task assigned: ${description} (${priority} priority)`
        },
        ...state.activities
      ].slice(0, 50)
    }));

    return task;
  },

  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              completedAt: status === 'completed' || status === 'failed' ? Date.now() : undefined
            }
          : task
      )
    })),

  // Chat actions
  addChatMessage: (agentId, message) =>
    set((state) => {
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        agentId,
        content: message.content,
        isUser: message.isUser,
        timestamp: Date.now()
      };

      const existingMessages = state.chatMessages[agentId] || [];

      return {
        chatMessages: {
          ...state.chatMessages,
          [agentId]: [...existingMessages, newMessage].slice(-100) // Keep last 100 messages per agent
        }
      };
    }),

  clearChatMessages: (agentId) =>
    set((state) => {
      if (agentId) {
        // Clear messages for specific agent
        const { [agentId]: _, ...rest } = state.chatMessages;
        return { chatMessages: rest as Record<AgentId, ChatMessage[]> };
      }
      // Clear all messages
      return { chatMessages: {} as Record<AgentId, ChatMessage[]> };
    })
}));
