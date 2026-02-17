/**
 * Corporate Store (Zustand)
 * Global state for corporate HQ activities, status, and metadata
 *
 * Architecture:
 * - Max 100 activities in memory (auto-trimmed on add)
 * - Real-time connection status tracking
 * - Filter state (department filter)
 * - Approval status tracking
 */

import { create } from 'zustand';
import { CorporateActivity, Department, ActivityStatus } from '@/types/corporate';

/**
 * TODO: Define CorporateState interface
 *
 * Should include:
 * - activities: CorporateActivity[]
 * - isRealtimeConnected: boolean
 * - selectedDepartmentFilter: Department | 'all'
 * - pendingApprovals: Set<string> (activity IDs)
 * - error: string | null
 * - isLoading: boolean
 */
interface CorporateState {
  // TODO: Add state properties
  activities: CorporateActivity[];
  isRealtimeConnected: boolean;
  selectedDepartmentFilter: Department | 'all';
  pendingApprovals: Set<string>;
  error: string | null;
  isLoading: boolean;

  // TODO: Add action methods
  // Activities
  addActivity: (activity: CorporateActivity) => void;
  updateActivity: (id: string, updates: Partial<CorporateActivity>) => void;
  removeActivity: (id: string) => void;
  setActivities: (activities: CorporateActivity[]) => void;
  clearActivities: () => void;

  // Real-time status
  setRealtimeConnected: (connected: boolean) => void;

  // Filters
  setDepartmentFilter: (dept: Department | 'all') => void;

  // Approvals
  addPendingApproval: (activityId: string) => void;
  removePendingApproval: (activityId: string) => void;
  isPendingApproval: (activityId: string) => boolean;

  // Error handling
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * TODO: Implement useCorporateStore
 *
 * Creates Zustand store with all state and actions
 * Remember to slice activities to max 100 on add
 */
export const useCorporateStore = create<CorporateState>((set, get) => ({
  // Initial state
  activities: [],
  isRealtimeConnected: false,
  selectedDepartmentFilter: 'all',
  pendingApprovals: new Set<string>(),
  error: null,
  isLoading: false,

  // TODO: Implement addActivity
  // - Add to front of array
  // - Keep max 100 items
  // - Update via set()
  addActivity: (activity: CorporateActivity) => {
    set((state) => ({
      activities: [activity, ...state.activities].slice(0, 100),
    }));
  },

  // TODO: Implement updateActivity
  // - Find activity by ID
  // - Apply updates
  // - Maintain order
  updateActivity: (id: string, updates: Partial<CorporateActivity>) => {
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  },

  // TODO: Implement removeActivity
  // - Filter out activity by ID
  removeActivity: (id: string) => {
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    }));
  },

  // TODO: Implement setActivities
  // - Replace entire array
  // - Keep max 100 items
  setActivities: (activities: CorporateActivity[]) => {
    set({
      activities: activities.slice(0, 100),
    });
  },

  // TODO: Implement clearActivities
  // - Reset to empty array
  clearActivities: () => {
    set({ activities: [] });
  },

  // TODO: Implement setRealtimeConnected
  // - Update connection status
  // - For UI indicators
  setRealtimeConnected: (connected: boolean) => {
    set({ isRealtimeConnected: connected });
  },

  // TODO: Implement setDepartmentFilter
  // - Update filter for feed display
  setDepartmentFilter: (dept: Department | 'all') => {
    set({ selectedDepartmentFilter: dept });
  },

  // TODO: Implement addPendingApproval
  // - Add ID to pending set
  addPendingApproval: (activityId: string) => {
    set((state) => ({
      pendingApprovals: new Set(state.pendingApprovals).add(activityId),
    }));
  },

  // TODO: Implement removePendingApproval
  // - Remove ID from pending set
  removePendingApproval: (activityId: string) => {
    set((state) => {
      const newSet = new Set(state.pendingApprovals);
      newSet.delete(activityId);
      return { pendingApprovals: newSet };
    });
  },

  // TODO: Implement isPendingApproval
  // - Check if ID in pending set
  isPendingApproval: (activityId: string) => {
    return get().pendingApprovals.has(activityId);
  },

  // TODO: Implement setError
  // - Update error state
  setError: (error: string | null) => {
    set({ error });
  },

  // TODO: Implement setLoading
  // - Update loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
