import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SidebarContextType, SidebarState, SidebarSection, DEFAULT_SIDEBAR_STATE } from '../types/sidebar';
import { useAuth } from './AuthContext';

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const SIDEBAR_STORAGE_KEY = 'spfp_sidebar_state';

/**
 * Helper to get the user-specific storage key
 */
const getStorageKey = (userId?: string): string => {
  return userId ? `${SIDEBAR_STORAGE_KEY}_${userId}` : SIDEBAR_STORAGE_KEY;
};

/**
 * Load sidebar state from localStorage with fallback to defaults
 */
const loadSidebarState = (storageKey: string): SidebarState => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<SidebarState>;
      return {
        ...DEFAULT_SIDEBAR_STATE,
        ...parsed
      };
    }
  } catch (error) {
    console.error('Error loading sidebar state from localStorage:', error);
  }
  return { ...DEFAULT_SIDEBAR_STATE };
};

/**
 * Save sidebar state to localStorage
 */
const saveSidebarState = (state: SidebarState, storageKey: string): void => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving sidebar state to localStorage:', error);
  }
};

/**
 * Sidebar Context Provider Component
 * Manages expandable sidebar section states with localStorage persistence
 */
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const storageKey = getStorageKey(user?.id);

  const [state, setState] = useState<SidebarState>(() => loadSidebarState(storageKey));

  // Persist state changes to localStorage
  useEffect(() => {
    saveSidebarState(state, storageKey);
  }, [state, storageKey]);

  // Load user-specific state when user changes
  useEffect(() => {
    const newStorageKey = getStorageKey(user?.id);
    const userState = loadSidebarState(newStorageKey);
    setState(userState);
  }, [user?.id]);

  const toggleSection = useCallback((section: SidebarSection): void => {
    setState(prevState => ({
      ...prevState,
      [section]: !prevState[section]
    }));
  }, []);

  const expandSection = useCallback((section: SidebarSection): void => {
    setState(prevState => ({
      ...prevState,
      [section]: true
    }));
  }, []);

  const collapseSection = useCallback((section: SidebarSection): void => {
    setState(prevState => ({
      ...prevState,
      [section]: false
    }));
  }, []);

  const toggleDrawer = useCallback((): void => {
    setState(prevState => ({
      ...prevState,
      isDrawerOpen: !prevState.isDrawerOpen
    }));
  }, []);

  const openDrawer = useCallback((): void => {
    setState(prevState => ({
      ...prevState,
      isDrawerOpen: true
    }));
  }, []);

  const closeDrawer = useCallback((): void => {
    setState(prevState => ({
      ...prevState,
      isDrawerOpen: false
    }));
  }, []);

  const resetToDefaults = useCallback((): void => {
    setState({ ...DEFAULT_SIDEBAR_STATE });
  }, []);

  const setAllSections = useCallback((expanded: boolean): void => {
    setState(prevState => ({
      ...prevState,
      budget: expanded,
      investments: expanded,
      retirement: expanded,
      patrimony: expanded
    }));
  }, []);

  const value: SidebarContextType = {
    state,
    toggleSection,
    expandSection,
    collapseSection,
    toggleDrawer,
    openDrawer,
    closeDrawer,
    resetToDefaults,
    setAllSections
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * Hook to use Sidebar context
 */
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

export default SidebarContext;
