import { useMemo } from 'react';
import { useUI } from '../context/UIContext';
import {
  colorTokens,
  spacingTokens,
  borderRadiusTokens,
  typographyTokens,
  shadowTokens,
  transitionTokens,
  darkModeTokens,
  lightModeTokens,
  semanticTokens,
  glassmorphismTokens,
} from '../styles/tokens';

/**
 * Hook to access design tokens with automatic theme awareness.
 * Returns theme-specific color values and all other design tokens.
 *
 * Usage:
 * const tokens = useDesignTokens();
 * const bgColor = tokens.colors.background; // Automatically switches based on theme
 * const spacing = tokens.spacing.md;
 */
export const useDesignTokens = () => {
  const { theme: currentTheme, isDarkMode } = useUI();

  return useMemo(() => {
    const isDark = isDarkMode;

    return {
      // Color tokens with theme awareness
      colors: isDark ? darkModeTokens.colors : lightModeTokens.colors,
      text: isDark ? darkModeTokens.text : lightModeTokens.text,
      colorTokens,

      // All other tokens (theme-independent)
      spacing: spacingTokens,
      borderRadius: borderRadiusTokens,
      typography: typographyTokens,
      shadow: shadowTokens,
      transition: transitionTokens,

      // Semantic tokens with theme awareness
      semantic: semanticTokens,
      glassmorphism: isDark ? glassmorphismTokens.dark : glassmorphismTokens.light,

      // Helper to get button styles
      getButtonStyles: (variant: 'primary' | 'secondary' = 'primary') => {
        const mode = isDark ? 'dark' : 'light';
        return semanticTokens.button[variant][mode];
      },

      // Helper to get input styles
      getInputStyles: () => {
        const mode = isDark ? 'dark' : 'light';
        return semanticTokens.input[mode];
      },

      // Helper to get card styles
      getCardStyles: (compact: boolean = false) => {
        const mode = isDark ? 'dark' : 'light';
        return {
          bg: semanticTokens.card[mode].bg,
          border: semanticTokens.card[mode].border,
          shadow: semanticTokens.card[mode].shadow,
          padding: compact ? spacingTokens.md : spacingTokens.lg,
          borderRadius: borderRadiusTokens['2xl'],
        };
      },

      // Current theme
      isDarkMode: isDark,
      currentTheme,
    };
  }, [isDarkMode, currentTheme]);
};
