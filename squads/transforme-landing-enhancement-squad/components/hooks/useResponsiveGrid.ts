/**
 * useResponsiveGrid hook - Responsive grid configuration management
 * Handles grid responsiveness edge cases and breakpoint management
 */

import { useEffect, useState } from 'react';
import { ResponsiveGridConfig } from '../types';

/**
 * Tailwind breakpoints
 */
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Get grid column classes based on config
 */
export const getGridColsClass = (config: ResponsiveGridConfig): string => {
  const { mobile, tablet, desktop } = config;
  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`;
};

/**
 * Get gap class from config
 */
export const getGapClass = (gap: number): string => {
  const gapMap: Record<number, string> = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
  };
  return gapMap[gap] || `gap-${gap}`;
};

/**
 * Hook for responsive grid management
 */
export const useResponsiveGrid = (config: ResponsiveGridConfig) => {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [isResizing, setIsResizing] = useState(false);

  /**
   * Get current number of columns based on window width
   */
  const getCurrentCols = (): number => {
    if (windowWidth < BREAKPOINTS.md) {
      return config.mobile;
    } else if (windowWidth < BREAKPOINTS.lg) {
      return config.tablet;
    }
    return config.desktop;
  };

  /**
   * Get current breakpoint name
   */
  const getCurrentBreakpoint = (): keyof typeof BREAKPOINTS => {
    if (windowWidth < BREAKPOINTS.sm) return 'sm';
    if (windowWidth < BREAKPOINTS.md) return 'md';
    if (windowWidth < BREAKPOINTS.lg) return 'lg';
    if (windowWidth < BREAKPOINTS.xl) return 'xl';
    return '2xl';
  };

  /**
   * Check if mobile
   */
  const isMobile = (): boolean => windowWidth < BREAKPOINTS.md;

  /**
   * Check if tablet
   */
  const isTablet = (): boolean =>
    windowWidth >= BREAKPOINTS.md && windowWidth < BREAKPOINTS.lg;

  /**
   * Check if desktop
   */
  const isDesktop = (): boolean => windowWidth >= BREAKPOINTS.lg;

  // Handle window resize
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      setIsResizing(true);
      setWindowWidth(window.innerWidth);

      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setIsResizing(false);
      }, 300);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return {
    windowWidth,
    isResizing,
    currentCols: getCurrentCols(),
    currentBreakpoint: getCurrentBreakpoint(),
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    gridClass: getGridColsClass(config),
    gapClass: getGapClass(config.gap),
    gridClassName: `grid ${getGridColsClass(config)} ${getGapClass(config.gap)}`,
  };
};

/**
 * Hook for getting current screen size name
 */
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<
    'mobile' | 'tablet' | 'desktop' | 'unknown'
  >('unknown');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;

      if (width < BREAKPOINTS.md) {
        setScreenSize('mobile');
      } else if (width < BREAKPOINTS.lg) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize, { passive: true });
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

/**
 * Hook for managing breakpoint-specific rendering
 */
export const useBreakpoint = (breakpoint: keyof typeof BREAKPOINTS) => {
  const [isBelowBreakpoint, setIsBelowBreakpoint] = useState<boolean>(
    typeof window !== 'undefined'
      ? window.innerWidth < BREAKPOINTS[breakpoint]
      : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsBelowBreakpoint(window.innerWidth < BREAKPOINTS[breakpoint]);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isBelowBreakpoint;
};

/**
 * Hook for safe responsive rendering
 */
export const useResponsiveRender = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
};

/**
 * Predefined responsive grid configs
 */
export const RESPONSIVE_CONFIGS = {
  /**
   * 1-2-3 grid (1 col mobile, 2 cols tablet, 3 cols desktop)
   */
  balanced: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    gap: 8,
  } as ResponsiveGridConfig,

  /**
   * 1-2-4 grid (1 col mobile, 2 cols tablet, 4 cols desktop)
   */
  dense: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
    gap: 8,
  } as ResponsiveGridConfig,

  /**
   * 2-2-3 grid (2 cols mobile, 2 cols tablet, 3 cols desktop)
   */
  compact: {
    mobile: 2,
    tablet: 2,
    desktop: 3,
    gap: 4,
  } as ResponsiveGridConfig,

  /**
   * 1-1-2 grid (1 col mobile, 1 col tablet, 2 cols desktop)
   */
  spacious: {
    mobile: 1,
    tablet: 1,
    desktop: 2,
    gap: 12,
  } as ResponsiveGridConfig,
};

/**
 * Calculate item width percentage for custom layouts
 */
export const getItemWidth = (cols: number): number => {
  return 100 / cols;
};

/**
 * Get responsive padding based on breakpoint
 */
export const getResponsivePadding = (
  screenSize: 'mobile' | 'tablet' | 'desktop'
): string => {
  const paddingMap = {
    mobile: 'px-4 py-8',
    tablet: 'px-6 py-12',
    desktop: 'px-8 py-16',
  };
  return paddingMap[screenSize];
};

/**
 * Get responsive max-width container class
 */
export const getContainerClass = (maxWidth: 'sm' | 'md' | 'lg' | 'xl'): string => {
  const containerMap = {
    sm: 'max-w-2xl',
    md: 'max-w-3xl',
    lg: 'max-w-5xl',
    xl: 'max-w-7xl',
  };
  return containerMap[maxWidth];
};
