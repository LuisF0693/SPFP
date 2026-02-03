import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface UIContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'spfp_theme_preference';
const SYSTEM_PREFERS_DARK = '(prefers-color-scheme: dark)';

/**
 * Get the effective theme considering user preference and system preference
 */
const getEffectiveTheme = (userPreference: Theme): boolean => {
  if (userPreference === 'dark') return true;
  if (userPreference === 'light') return false;
  // For 'system', check system preference
  return window.matchMedia(SYSTEM_PREFERS_DARK).matches;
};

/**
 * Apply theme to document
 */
const applyTheme = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

/**
 * UI Context Provider
 * Manages theme preference with persistence and system preference detection
 */
export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage with 'system' as default
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    return stored || 'system';
  });

  // Calculate effective dark mode
  const isDark = getEffectiveTheme(theme);

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  // Listen to system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia(SYSTEM_PREFERS_DARK);
    const handleChange = () => {
      // Force re-render by accessing isDark
      applyTheme(getEffectiveTheme('system'));
    };

    // Use addEventListener for better browser compatibility
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Update theme preference and persist to localStorage
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  return (
    <UIContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </UIContext.Provider>
  );
};

/**
 * Hook to use UI context
 */
export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};

export default UIContext;
