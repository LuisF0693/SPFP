// AIOS Virtual Office - User Avatar Store
import { create } from 'zustand';
import type { Position } from '../types';

// User Avatar configuration
export const USER_AVATAR_CONFIG = {
  // Initial position (center of office grid area)
  INITIAL_X: 300,
  INITIAL_Y: 200,
  // Movement duration (ms for CSS transition)
  MOVE_DURATION: 500,
  // Scale relative to agents (1.2x bigger)
  SCALE: 1.2,
  // Offset from agent when moving to agent
  AGENT_APPROACH_OFFSET: 80,
  // Default emoji
  DEFAULT_EMOJI: '🧑‍💻',
  // Default name
  DEFAULT_NAME: 'Voce'
};

// User avatar state interface
export interface UserAvatarState {
  position: Position;
  targetPosition: Position | null;
  isMoving: boolean;
  emoji: string;
  name: string;

  // Actions
  setPosition: (position: Position) => void;
  moveToPosition: (target: Position) => void;
  moveToAgent: (agentPosition: Position) => void;
  completeMovement: () => void;
  setEmoji: (emoji: string) => void;
  setName: (name: string) => void;
  resetPosition: () => void;
}

// Initial position
const initialPosition: Position = {
  x: USER_AVATAR_CONFIG.INITIAL_X,
  y: USER_AVATAR_CONFIG.INITIAL_Y
};

// localStorage key for persisting user avatar settings
const USER_AVATAR_STORAGE_KEY = 'aios_user_avatar';

// Load persisted user avatar settings
function loadUserAvatarSettings(): { emoji: string; name: string; position: Position } {
  try {
    const stored = localStorage.getItem(USER_AVATAR_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        emoji: parsed.emoji || USER_AVATAR_CONFIG.DEFAULT_EMOJI,
        name: parsed.name || USER_AVATAR_CONFIG.DEFAULT_NAME,
        position: parsed.position || initialPosition
      };
    }
  } catch {
    // localStorage not available or invalid data
  }
  return {
    emoji: USER_AVATAR_CONFIG.DEFAULT_EMOJI,
    name: USER_AVATAR_CONFIG.DEFAULT_NAME,
    position: initialPosition
  };
}

// Save user avatar settings to localStorage
function saveUserAvatarSettings(emoji: string, name: string, position: Position): void {
  try {
    localStorage.setItem(USER_AVATAR_STORAGE_KEY, JSON.stringify({ emoji, name, position }));
  } catch {
    // localStorage not available
  }
}

export const useUserAvatarStore = create<UserAvatarState>((set, get) => {
  const savedSettings = loadUserAvatarSettings();

  return {
    // Initial state
    position: savedSettings.position,
    targetPosition: null,
    isMoving: false,
    emoji: savedSettings.emoji,
    name: savedSettings.name,

    // Actions
    setPosition: (position) => {
      const state = get();
      saveUserAvatarSettings(state.emoji, state.name, position);
      set({ position, targetPosition: null, isMoving: false });
    },

    moveToPosition: (target) => {
      set({ targetPosition: target, isMoving: true });

      // Auto-complete movement after animation duration
      setTimeout(() => {
        const state = get();
        if (state.isMoving && state.targetPosition) {
          saveUserAvatarSettings(state.emoji, state.name, state.targetPosition);
          set({
            position: state.targetPosition,
            targetPosition: null,
            isMoving: false
          });
        }
      }, USER_AVATAR_CONFIG.MOVE_DURATION);
    },

    moveToAgent: (agentPosition) => {
      // Calculate position near the agent (offset to the left)
      const targetPosition: Position = {
        x: agentPosition.x - USER_AVATAR_CONFIG.AGENT_APPROACH_OFFSET,
        y: agentPosition.y
      };

      get().moveToPosition(targetPosition);
    },

    completeMovement: () => {
      const state = get();
      if (state.targetPosition) {
        saveUserAvatarSettings(state.emoji, state.name, state.targetPosition);
        set({
          position: state.targetPosition,
          targetPosition: null,
          isMoving: false
        });
      }
    },

    setEmoji: (emoji) => {
      const state = get();
      saveUserAvatarSettings(emoji, state.name, state.position);
      set({ emoji });
    },

    setName: (name) => {
      const state = get();
      saveUserAvatarSettings(state.emoji, name, state.position);
      set({ name });
    },

    resetPosition: () => {
      const state = get();
      saveUserAvatarSettings(state.emoji, state.name, initialPosition);
      set({
        position: initialPosition,
        targetPosition: null,
        isMoving: false
      });
    }
  };
});
