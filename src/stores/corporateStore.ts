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
import { CorporateActivity, Department } from '@/types/corporate';

interface CorporateState {
  // State
  activities: CorporateActivity[];
  isRealtimeConnected: boolean;
  selectedDepartmentFilter: Department | 'all';
  selectedDepartment: string | null;
  isModalOpen: boolean;
  pendingApprovals: Set<string>;
  error: string | null;
  isLoading: boolean;

  // Activities
  addActivity: (activity: CorporateActivity) => void;
  updateActivity: (id: string, updates: Partial<CorporateActivity>) => void;
  removeActivity: (id: string) => void;
  setActivities: (activities: CorporateActivity[]) => void;
  clearActivities: () => void;

  // Real-time status
  setRealtimeConnected: (connected: boolean) => void;

  // Filters & Modal
  setDepartmentFilter: (dept: Department | 'all') => void;
  setSelectedDepartment: (dept: string | null) => void;
  setIsModalOpen: (open: boolean) => void;

  // Approvals
  addPendingApproval: (activityId: string) => void;
  removePendingApproval: (activityId: string) => void;
  isPendingApproval: (activityId: string) => boolean;

  // Error handling
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useCorporateStore = create<CorporateState>((set, get) => ({
  // Initial state
  activities: [],
  isRealtimeConnected: false,
  selectedDepartmentFilter: 'all',
  selectedDepartment: null,
  isModalOpen: false,
  pendingApprovals: new Set<string>(),
  error: null,
  isLoading: false,

  // Activities
  addActivity: (activity: CorporateActivity) => {
    set((state) => ({
      activities: [activity, ...state.activities].slice(0, 100),
    }));
  },

  updateActivity: (id: string, updates: Partial<CorporateActivity>) => {
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  },

  removeActivity: (id: string) => {
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    }));
  },

  setActivities: (activities: CorporateActivity[]) => {
    set({
      activities: activities.slice(0, 100),
    });
  },

  clearActivities: () => {
    set({ activities: [] });
  },

  // Real-time status
  setRealtimeConnected: (connected: boolean) => {
    set({ isRealtimeConnected: connected });
  },

  // Filters & Modal
  setDepartmentFilter: (dept: Department | 'all') => {
    set({ selectedDepartmentFilter: dept });
  },

  setSelectedDepartment: (dept: string | null) => {
    set({ selectedDepartment: dept });
  },

  setIsModalOpen: (open: boolean) => {
    set({ isModalOpen: open });
  },

  // Approvals
  addPendingApproval: (activityId: string) => {
    set((state) => ({
      pendingApprovals: new Set(state.pendingApprovals).add(activityId),
    }));
  },

  removePendingApproval: (activityId: string) => {
    set((state) => {
      const newSet = new Set(state.pendingApprovals);
      newSet.delete(activityId);
      return { pendingApprovals: newSet };
    });
  },

  isPendingApproval: (activityId: string) => {
    return get().pendingApprovals.has(activityId);
  },

  // Error handling
  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
