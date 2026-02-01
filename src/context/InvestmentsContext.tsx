import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { InvestmentAsset } from '../types';
import { generateId } from '../utils';

interface InvestmentsState {
  investments: InvestmentAsset[];
  lastUpdated: number;
}

export interface InvestmentsContextType {
  investments: InvestmentAsset[];
  addInvestment: (investment: Omit<InvestmentAsset, 'id'>) => void;
  updateInvestment: (investment: InvestmentAsset) => void;
  deleteInvestment: (id: string) => void;
  recoverInvestment: (id: string) => void;
  getDeletedInvestments: () => InvestmentAsset[];
}

const InvestmentsContext = createContext<InvestmentsContextType | undefined>(undefined);

const getStorageKey = (userId?: string) => userId ? `visao360_v2_investments_${userId}` : 'visao360_v2_investments';

const filterActive = <T extends { deletedAt?: number }>(items: T[]): T[] => {
  return items.filter(item => !item.deletedAt);
};

const filterDeleted = <T extends { deletedAt?: number }>(items: T[]): T[] => {
  return items.filter(item => item.deletedAt);
};

export interface InvestmentsProviderProps {
  children: React.ReactNode;
  userId?: string;
  onStateChange?: (state: InvestmentsState) => void;
}

export const InvestmentsProvider: React.FC<InvestmentsProviderProps> = ({
  children,
  userId,
  onStateChange
}) => {
  const getInitialState = useCallback((id?: string): InvestmentsState => {
    const key = getStorageKey(id);
    const local = localStorage.getItem(key);
    if (local) {
      try {
        const parsedData = JSON.parse(local);
        return {
          investments: Array.isArray(parsedData.investments) ? parsedData.investments : [],
          lastUpdated: parsedData.lastUpdated || 0
        };
      } catch (e) {
        console.error("Error reading investments cache", e);
      }
    }
    return {
      investments: [],
      lastUpdated: 0
    };
  }, []);

  const [state, setState] = useState<InvestmentsState>(() => getInitialState(userId));

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  }, [state, userId]);

  // Notify parent on state change
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const addInvestment = (i: Omit<InvestmentAsset, 'id'>) => {
    setState(prev => ({
      ...prev,
      investments: [...prev.investments, { ...i, id: generateId() }],
      lastUpdated: Date.now()
    }));
  };

  const updateInvestment = (u: InvestmentAsset) => {
    setState(prev => ({
      ...prev,
      investments: prev.investments.map(i => i.id === u.id ? u : i),
      lastUpdated: Date.now()
    }));
  };

  const deleteInvestment = (id: string) => {
    const investment = state.investments.find(i => i.id === id);
    if (!investment || investment.deletedAt) return;
    setState(prev => ({
      ...prev,
      investments: prev.investments.map(i => i.id === id ? { ...i, deletedAt: Date.now() } : i),
      lastUpdated: Date.now()
    }));
  };

  const recoverInvestment = (id: string) => {
    const investment = state.investments.find(i => i.id === id);
    if (!investment || !investment.deletedAt) return;
    setState(prev => ({
      ...prev,
      investments: prev.investments.map(i => i.id === id ? { ...i, deletedAt: undefined } : i),
      lastUpdated: Date.now()
    }));
  };

  const getDeletedInvestments = (): InvestmentAsset[] => {
    return filterDeleted(state.investments);
  };

  return (
    <InvestmentsContext.Provider value={{
      investments: filterActive(state.investments),
      addInvestment,
      updateInvestment,
      deleteInvestment,
      recoverInvestment,
      getDeletedInvestments
    }}>
      {children}
    </InvestmentsContext.Provider>
  );
};

export const useInvestments = () => {
  const context = useContext(InvestmentsContext);
  if (!context) throw new Error('useInvestments must be used within an InvestmentsProvider');
  return context;
};
