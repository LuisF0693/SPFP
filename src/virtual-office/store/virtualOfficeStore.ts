// AIOS Virtual Office - Zustand Store
import { create } from 'zustand';
import type { AgentId, AgentState, AgentStatus, Activity, Position, Department } from '../types';
import { AGENTS, getAgentsByDepartment } from '../data/agents';

// Theme types
export type ThemeMode = 'auto' | 'day' | 'night';
export type ResolvedTheme = 'day' | 'night';

// User avatar customization types
export interface UserCustomization {
  emoji: string;
  displayName: string;
  accentColor: string;
}

// Predefined accent colors
export const ACCENT_COLORS = [
  '#4A90D9', // Blue
  '#50C878', // Green
  '#FF6B6B', // Red
  '#FFA500', // Orange
  '#9B59B6', // Purple
  '#F1C40F', // Yellow
  '#E91E63', // Pink
  '#00BCD4', // Cyan
] as const;

// Predefined avatar emojis (6x4 grid = 24 emojis)
export const AVATAR_EMOJIS = [
  '👨‍💻', '👩‍💻', '🧑‍💼', '👨‍🎨', '👩‍🔬', '🧙‍♂️',
  '🦸‍♀️', '🧑‍🚀', '🧑‍🏫', '👨‍🔧', '👩‍⚕️', '🧑‍🍳',
  '👨‍✈️', '👩‍🎤', '🧑‍🎓', '👨‍🌾', '🦊', '🐺',
  '🦁', '🐯', '🐻', '🐼', '🐨', '🐵',
] as const;

// Default user customization
export const DEFAULT_USER_CUSTOMIZATION: UserCustomization = {
  emoji: '👤',
  displayName: 'You',
  accentColor: '#4A90D9',
};

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

// Sound settings
export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0-100
  ambientPlaying: boolean;
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

  // Theme
  themeMode: ThemeMode;

  // User customization
  userCustomization: UserCustomization;
  isCustomizerOpen: boolean;

  // Sound settings
  soundSettings: SoundSettings;

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

  // Theme actions
  setThemeMode: (mode: ThemeMode) => void;
  getResolvedTheme: () => ResolvedTheme;

  // User customization actions
  setUserCustomization: (customization: UserCustomization) => void;
  updateUserCustomization: (partial: Partial<UserCustomization>) => void;
  resetUserCustomization: () => void;
  openCustomizer: () => void;
  closeCustomizer: () => void;

  // Sound actions
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setAmbientPlaying: (playing: boolean) => void;
  toggleSound: () => void;
  toggleAmbient: () => void;
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

// Theme localStorage key
const THEME_STORAGE_KEY = 'aios_virtual_office_theme';

// User customization localStorage key
const USER_CUSTOMIZATION_KEY = 'aios_user_customization';

// Sound settings localStorage key
const SOUND_SETTINGS_KEY = 'aios_virtual_office_sound';

// Default sound settings (muted by default)
const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  enabled: false,
  volume: 50,
  ambientPlaying: false
};

// Load sound settings from localStorage
function loadSoundSettings(): SoundSettings {
  try {
    const saved = localStorage.getItem(SOUND_SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : false,
        volume: typeof parsed.volume === 'number' ? Math.min(100, Math.max(0, parsed.volume)) : 50,
        ambientPlaying: false // Always start with ambient off
      };
    }
  } catch (e) {
    console.error('Failed to load sound settings:', e);
  }
  return DEFAULT_SOUND_SETTINGS;
}

// Save sound settings to localStorage
function saveSoundSettings(settings: Omit<SoundSettings, 'ambientPlaying'>): void {
  try {
    localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify({
      enabled: settings.enabled,
      volume: settings.volume
    }));
  } catch (e) {
    console.error('Failed to save sound settings:', e);
  }
}

// Load user customization from localStorage
function loadUserCustomization(): UserCustomization {
  try {
    const saved = localStorage.getItem(USER_CUSTOMIZATION_KEY);
    if (saved) {
      return { ...DEFAULT_USER_CUSTOMIZATION, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load user customization:', e);
  }
  return DEFAULT_USER_CUSTOMIZATION;
}

// Save user customization to localStorage
function saveUserCustomization(customization: UserCustomization): void {
  try {
    localStorage.setItem(USER_CUSTOMIZATION_KEY, JSON.stringify(customization));
  } catch (e) {
    console.error('Failed to save user customization:', e);
  }
}

// Load persisted theme mode
function loadThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['auto', 'day', 'night'].includes(stored)) {
      return stored as ThemeMode;
    }
  } catch {
    // localStorage not available
  }
  return 'auto';
}

// Helper to determine theme based on time of day
export function getThemeByTime(): ResolvedTheme {
  const hour = new Date().getHours();
  // Day: 6:00 - 17:59, Night: 18:00 - 5:59
  return hour >= 6 && hour < 18 ? 'day' : 'night';
}

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
  mockMode: false, // Start connected to real AIOS events
  isConnected: false,
  themeMode: loadThemeMode(),
  userCustomization: loadUserCustomization(),
  isCustomizerOpen: false,
  soundSettings: loadSoundSettings(),

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
    }),

  // Theme actions
  setThemeMode: (mode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // localStorage not available
    }
    set({ themeMode: mode });
  },

  getResolvedTheme: () => {
    const state = get();
    if (state.themeMode === 'auto') {
      return getThemeByTime();
    }
    return state.themeMode;
  },

  // User customization actions
  setUserCustomization: (customization) => {
    saveUserCustomization(customization);
    set({ userCustomization: customization });
  },

  updateUserCustomization: (partial) => {
    const state = get();
    const updated = { ...state.userCustomization, ...partial };
    saveUserCustomization(updated);
    set({ userCustomization: updated });
  },

  resetUserCustomization: () => {
    saveUserCustomization(DEFAULT_USER_CUSTOMIZATION);
    set({ userCustomization: DEFAULT_USER_CUSTOMIZATION });
  },

  openCustomizer: () => set({ isCustomizerOpen: true }),

  closeCustomizer: () => set({ isCustomizerOpen: false }),

  // Sound actions
  setSoundEnabled: (enabled) => {
    const state = get();
    const newSettings = { ...state.soundSettings, enabled };
    saveSoundSettings(newSettings);
    set({ soundSettings: newSettings });
  },

  setSoundVolume: (volume) => {
    const state = get();
    const clampedVolume = Math.min(100, Math.max(0, volume));
    const newSettings = { ...state.soundSettings, volume: clampedVolume };
    saveSoundSettings(newSettings);
    set({ soundSettings: newSettings });
  },

  setAmbientPlaying: (playing) => {
    set((state) => ({
      soundSettings: { ...state.soundSettings, ambientPlaying: playing }
    }));
  },

  toggleSound: () => {
    const state = get();
    const newSettings = { ...state.soundSettings, enabled: !state.soundSettings.enabled };
    saveSoundSettings(newSettings);
    set({ soundSettings: newSettings });
  },

  toggleAmbient: () => {
    set((state) => ({
      soundSettings: {
        ...state.soundSettings,
        ambientPlaying: !state.soundSettings.ambientPlaying
      }
    }));
  }
}));

// ============================================================================
// Selectors - Computed values for department metrics
// ============================================================================

export interface DepartmentMetrics {
  department: Department;
  activeAgents: number;
  totalAgents: number;
  completedTasksToday: number;
}

/**
 * Selector to get metrics for a specific department
 */
export function selectDepartmentMetrics(
  state: Pick<VirtualOfficeState, 'agents' | 'activities'>,
  department: Department
): DepartmentMetrics {
  const deptAgents = getAgentsByDepartment(department);
  const deptAgentIds = deptAgents.map(a => a.id);

  // Count active agents (status !== 'idle')
  const activeAgents = deptAgentIds.filter(
    (id) => state.agents[id]?.status !== 'idle'
  ).length;

  // Get today's start timestamp
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTimestamp = todayStart.getTime();

  // Count completed tasks today (tool_complete activities with success)
  const completedTasksToday = state.activities.filter(
    (activity) =>
      activity.type === 'tool_complete' &&
      activity.success === true &&
      deptAgentIds.includes(activity.agentId) &&
      activity.timestamp >= todayTimestamp
  ).length;

  return {
    department,
    activeAgents,
    totalAgents: deptAgents.length,
    completedTasksToday
  };
}

/**
 * Selector to get metrics for all departments
 */
export function selectAllDepartmentMetrics(
  state: Pick<VirtualOfficeState, 'agents' | 'activities'>
): DepartmentMetrics[] {
  const departments: Department[] = ['product', 'engineering', 'quality', 'design', 'operations'];
  return departments.map(dept => selectDepartmentMetrics(state, dept));
}

/**
 * Selector to get total metrics across all departments
 */
export function selectTotalMetrics(
  state: Pick<VirtualOfficeState, 'agents' | 'activities'>
): { activeAgents: number; totalAgents: number; completedTasksToday: number } {
  const allMetrics = selectAllDepartmentMetrics(state);
  return allMetrics.reduce(
    (acc, m) => ({
      activeAgents: acc.activeAgents + m.activeAgents,
      totalAgents: acc.totalAgents + m.totalAgents,
      completedTasksToday: acc.completedTasksToday + m.completedTasksToday
    }),
    { activeAgents: 0, totalAgents: 0, completedTasksToday: 0 }
  );
}
