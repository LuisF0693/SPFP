import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PatrimonyItem } from '../types';
import { generateId } from '../utils';

interface PatrimonyState {
  patrimonyItems: PatrimonyItem[];
  lastUpdated: number;
}

export interface PatrimonyContextType {
  patrimonyItems: PatrimonyItem[];
  addPatrimonyItem: (item: Omit<PatrimonyItem, 'id'>) => void;
  updatePatrimonyItem: (item: PatrimonyItem) => void;
  deletePatrimonyItem: (id: string) => void;
  recoverPatrimonyItem: (id: string) => void;
  getDeletedPatrimonyItems: () => PatrimonyItem[];
}

const PatrimonyContext = createContext<PatrimonyContextType | undefined>(undefined);

const getStorageKey = (userId?: string) => userId ? `visao360_v2_patrimony_${userId}` : 'visao360_v2_patrimony';

const filterActive = <T extends { deletedAt?: number }>(items: T[] | undefined | null): T[] => {
  if (!Array.isArray(items)) return [];
  return items.filter(item => !item.deletedAt);
};

const filterDeleted = <T extends { deletedAt?: number }>(items: T[] | undefined | null): T[] => {
  if (!Array.isArray(items)) return [];
  return items.filter(item => item.deletedAt);
};

export interface PatrimonyProviderProps {
  children: React.ReactNode;
  userId?: string;
  onStateChange?: (state: PatrimonyState) => void;
}

export const PatrimonyProvider: React.FC<PatrimonyProviderProps> = ({
  children,
  userId,
  onStateChange
}) => {
  const getInitialState = useCallback((id?: string): PatrimonyState => {
    const key = getStorageKey(id);
    const local = localStorage.getItem(key);
    if (local) {
      try {
        const parsedData = JSON.parse(local);
        return {
          patrimonyItems: Array.isArray(parsedData.patrimonyItems) ? parsedData.patrimonyItems : [],
          lastUpdated: parsedData.lastUpdated || 0
        };
      } catch (e) {
        console.error("Error reading patrimony cache", e);
      }
    }
    return {
      patrimonyItems: [],
      lastUpdated: 0
    };
  }, []);

  const [state, setState] = useState<PatrimonyState>(() => getInitialState(userId));

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  }, [state, userId]);

  // Notify parent on state change
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const addPatrimonyItem = (item: Omit<PatrimonyItem, 'id'>) => {
    setState(prev => ({
      ...prev,
      patrimonyItems: [...prev.patrimonyItems, { ...item, id: generateId() }],
      lastUpdated: Date.now()
    }));
  };

  const updatePatrimonyItem = (item: PatrimonyItem) => {
    setState(prev => ({
      ...prev,
      patrimonyItems: prev.patrimonyItems.map(i => i.id === item.id ? item : i),
      lastUpdated: Date.now()
    }));
  };

  const deletePatrimonyItem = (id: string) => {
    const item = state.patrimonyItems.find(i => i.id === id);
    if (!item || item.deletedAt) return;
    setState(prev => ({
      ...prev,
      patrimonyItems: prev.patrimonyItems.map(i => i.id === id ? { ...i, deletedAt: Date.now() } : i),
      lastUpdated: Date.now()
    }));
  };

  const recoverPatrimonyItem = (id: string) => {
    const item = state.patrimonyItems.find(i => i.id === id);
    if (!item || !item.deletedAt) return;
    setState(prev => ({
      ...prev,
      patrimonyItems: prev.patrimonyItems.map(i => i.id === id ? { ...i, deletedAt: undefined } : i),
      lastUpdated: Date.now()
    }));
  };

  const getDeletedPatrimonyItems = (): PatrimonyItem[] => {
    return filterDeleted(state.patrimonyItems);
  };

  return (
    <PatrimonyContext.Provider value={{
      patrimonyItems: filterActive(state.patrimonyItems),
      addPatrimonyItem,
      updatePatrimonyItem,
      deletePatrimonyItem,
      recoverPatrimonyItem,
      getDeletedPatrimonyItems
    }}>
      {children}
    </PatrimonyContext.Provider>
  );
};

export const usePatrimony = () => {
  const context = useContext(PatrimonyContext);
  if (!context) throw new Error('usePatrimony must be used within a PatrimonyProvider');
  return context;
};
