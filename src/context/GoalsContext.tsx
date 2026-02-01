import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Goal } from '../types';
import { generateId } from '../utils';

interface GoalsState {
  goals: Goal[];
  lastUpdated: number;
}

export interface GoalsContextType {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  recoverGoal: (id: string) => void;
  getDeletedGoals: () => Goal[];
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

const getStorageKey = (userId?: string) => userId ? `visao360_v2_goals_${userId}` : 'visao360_v2_goals';

const filterActive = <T extends { deletedAt?: number }>(items: T[]): T[] => {
  return items.filter(item => !item.deletedAt);
};

const filterDeleted = <T extends { deletedAt?: number }>(items: T[]): T[] => {
  return items.filter(item => item.deletedAt);
};

export interface GoalsProviderProps {
  children: React.ReactNode;
  userId?: string;
  onStateChange?: (state: GoalsState) => void;
}

export const GoalsProvider: React.FC<GoalsProviderProps> = ({
  children,
  userId,
  onStateChange
}) => {
  const getInitialState = useCallback((id?: string): GoalsState => {
    const key = getStorageKey(id);
    const local = localStorage.getItem(key);
    if (local) {
      try {
        const parsedData = JSON.parse(local);
        return {
          goals: Array.isArray(parsedData.goals) ? parsedData.goals : [],
          lastUpdated: parsedData.lastUpdated || 0
        };
      } catch (e) {
        console.error("Error reading goals cache", e);
      }
    }
    return {
      goals: [],
      lastUpdated: 0
    };
  }, []);

  const [state, setState] = useState<GoalsState>(() => getInitialState(userId));

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  }, [state, userId]);

  // Notify parent on state change
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const addGoal = (g: Omit<Goal, 'id'>) => {
    setState(prev => ({
      ...prev,
      goals: [...prev.goals, { ...g, id: generateId() }],
      lastUpdated: Date.now()
    }));
  };

  const updateGoal = (u: Goal) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === u.id ? u : g),
      lastUpdated: Date.now()
    }));
  };

  const deleteGoal = (id: string) => {
    const goal = state.goals.find(g => g.id === id);
    if (!goal || goal.deletedAt) return;
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, deletedAt: Date.now() } : g),
      lastUpdated: Date.now()
    }));
  };

  const recoverGoal = (id: string) => {
    const goal = state.goals.find(g => g.id === id);
    if (!goal || !goal.deletedAt) return;
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, deletedAt: undefined } : g),
      lastUpdated: Date.now()
    }));
  };

  const getDeletedGoals = (): Goal[] => {
    return filterDeleted(state.goals);
  };

  return (
    <GoalsContext.Provider value={{
      goals: filterActive(state.goals),
      addGoal,
      updateGoal,
      deleteGoal,
      recoverGoal,
      getDeletedGoals
    }}>
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (!context) throw new Error('useGoals must be used within a GoalsProvider');
  return context;
};
