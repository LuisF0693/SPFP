// AIOS Virtual Office - Theme Toggle Component
import { useEffect, useState } from 'react';
import { useVirtualOfficeStore, type ThemeMode, type ResolvedTheme, getThemeByTime } from '../store/virtualOfficeStore';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { themeMode, setThemeMode, getResolvedTheme } = useVirtualOfficeStore();
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(getResolvedTheme());

  // Update resolved theme when mode changes or on interval (for auto mode)
  useEffect(() => {
    setResolvedTheme(getResolvedTheme());

    // If in auto mode, check every minute for time changes
    if (themeMode === 'auto') {
      const interval = setInterval(() => {
        setResolvedTheme(getThemeByTime());
      }, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [themeMode, getResolvedTheme]);

  // Cycle through modes: auto -> day -> night -> auto
  const handleClick = () => {
    const nextMode: Record<ThemeMode, ThemeMode> = {
      auto: 'day',
      day: 'night',
      night: 'auto'
    };
    setThemeMode(nextMode[themeMode]);
  };

  // Get icon and label based on current mode
  const getThemeInfo = () => {
    switch (themeMode) {
      case 'day':
        return { icon: 'sun', label: 'Day', color: 'text-yellow-400' };
      case 'night':
        return { icon: 'moon', label: 'Night', color: 'text-blue-400' };
      case 'auto':
      default:
        return { icon: 'auto', label: 'Auto', color: 'text-purple-400' };
    }
  };

  const themeInfo = getThemeInfo();

  return (
    <button
      onClick={handleClick}
      className={`
        relative flex items-center gap-2 px-3 py-1.5 rounded-lg
        transition-all duration-300 ease-in-out
        bg-gray-800/50 border border-gray-700/50
        hover:bg-gray-700/50 hover:border-gray-600/50
        ${className}
      `}
      title={`Theme: ${themeInfo.label} (${themeMode === 'auto' ? `Currently ${resolvedTheme}` : 'Fixed'})`}
    >
      {/* Icon */}
      <span className={`text-lg transition-colors duration-300 ${themeInfo.color}`}>
        {themeInfo.icon === 'sun' && (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {themeInfo.icon === 'moon' && (
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
            />
          </svg>
        )}
        {themeInfo.icon === 'auto' && (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        )}
      </span>

      {/* Label */}
      <span className="text-xs text-gray-400 font-medium">
        {themeInfo.label}
      </span>

      {/* Current resolved indicator for auto mode */}
      {themeMode === 'auto' && (
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-gray-800">
          <span
            className={`
              block w-full h-full rounded-full
              ${resolvedTheme === 'day' ? 'bg-yellow-400' : 'bg-blue-400'}
            `}
          />
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
