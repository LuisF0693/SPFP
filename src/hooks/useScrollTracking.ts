/**
 * useScrollTracking Hook
 *
 * Tracks scroll depth and fires analytics events at specific thresholds
 * (25%, 50%, 75%, 100%).
 *
 * Usage:
 *   import { useScrollTracking } from '@/hooks/useScrollTracking';
 *
 *   export const LandingPage = () => {
 *     useScrollTracking();
 *     return <main>...</main>;
 *   };
 */

import { useEffect, useRef } from 'react';
import { ga4Service } from '@/services/ga4Service';

interface ScrollThreshold {
  percent: number;
  tracked: boolean;
}

/**
 * Hook to track page scroll depth
 * Fires GA4 events at 25%, 50%, 75%, and 100% scroll thresholds
 */
export const useScrollTracking = () => {
  const thresholdsRef = useRef<Map<number, boolean>>(
    new Map([
      [25, false],
      [50, false],
      [75, false],
      [100, false],
    ])
  );

  useEffect(() => {
    const handleScroll = () => {
      try {
        // Get scroll measurements
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;

        // Calculate scroll percentage
        const totalScroll = documentHeight - windowHeight;
        const scrollPercent = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;

        // Check each threshold
        const thresholds = [25, 50, 75, 100];

        thresholds.forEach((threshold) => {
          const wasTracked = thresholdsRef.current.get(threshold) || false;

          // Fire event when threshold is reached for first time
          if (scrollPercent >= threshold && !wasTracked) {
            thresholdsRef.current.set(threshold, true);

            // Track scroll depth event
            ga4Service.trackScrollDepth(threshold);

            // Debug logging (remove in production)
            console.debug(`[Analytics] Scroll depth: ${threshold}%`, {
              scrollPercent: Math.round(scrollPercent),
              scrollTop,
              documentHeight,
            });
          }
        });
      } catch (error) {
        console.error('[useScrollTracking] Error tracking scroll:', error);
      }
    };

    // Throttle scroll event to avoid excessive event firing
    // Fire at most once per 500ms
    let throttleTimeout: NodeJS.Timeout | null = null;

    const throttledHandleScroll = () => {
      if (throttleTimeout) return;

      handleScroll();

      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, 500);
    };

    // Add scroll listener
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    // Also check on mount in case user is already scrolled
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, []);
};

/**
 * Hook to track time spent on page
 * Optionally fires event when user leaves
 */
export const useTimeOnPageTracking = (trackOnLeave = true) => {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!trackOnLeave) return;

    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - startTimeRef.current;

      // Track custom event for time on page
      ga4Service.trackCustomEvent('page_time', {
        event_category: 'engagement',
        event_label: 'Time on Page',
        time_on_page_ms: timeOnPage,
        time_on_page_seconds: Math.round(timeOnPage / 1000),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trackOnLeave]);

  return {
    timeElapsed: Date.now() - startTimeRef.current,
  };
};

/**
 * Hook to track when specific element enters viewport
 * Fires event when element becomes visible
 */
export const useViewportTracking = (
  elementRef: React.RefObject<HTMLElement>,
  sectionName: string,
  onceOnly = true
) => {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Element is visible
          if (!hasTrackedRef.current || !onceOnly) {
            ga4Service.trackSectionEngagement(sectionName, 'view');
            hasTrackedRef.current = true;

            console.debug(`[Analytics] Section viewed: ${sectionName}`);
          }

          // Auto-unobserve if tracking once
          if (onceOnly) {
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.25, // Trigger when 25% visible
      }
    );

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [elementRef, sectionName, onceOnly]);
};

/**
 * Hook to track element hover
 * Fires event when user hovers over element
 */
export const useHoverTracking = (
  elementRef: React.RefObject<HTMLElement>,
  eventName: string,
  eventLabel: string
) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const handleMouseEnter = () => {
      ga4Service.trackCustomEvent(eventName, {
        event_category: 'engagement',
        event_label: eventLabel,
        interaction_type: 'hover',
      });
    };

    const element = elementRef.current;
    element.addEventListener('mouseenter', handleMouseEnter, { once: true });

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [elementRef, eventName, eventLabel]);
};

export default {
  useScrollTracking,
  useTimeOnPageTracking,
  useViewportTracking,
  useHoverTracking,
};
