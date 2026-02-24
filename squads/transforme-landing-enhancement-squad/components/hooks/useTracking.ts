/**
 * useTracking hook - Analytics tracking for landing page components
 * Provides unified interface for tracking user interactions
 */

import { useCallback, useEffect, useState } from 'react';
import { AnalyticsEvent, AnalyticsEventType, ABTestVariant } from '../types';

/**
 * Session management for tracking
 */
interface SessionData {
  sessionId: string;
  startTime: number;
  scrollDepth: number;
}

/**
 * Generate unique session ID
 */
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create session from localStorage
 */
const getOrCreateSession = (): SessionData => {
  const stored = localStorage.getItem('transforme_session');
  if (stored) {
    return JSON.parse(stored);
  }

  const session: SessionData = {
    sessionId: generateSessionId(),
    startTime: Date.now(),
    scrollDepth: 0,
  };

  localStorage.setItem('transforme_session', JSON.stringify(session));
  return session;
};

/**
 * Get A/B variant from URL or localStorage
 */
export const getABVariant = (): ABTestVariant => {
  // Check URL parameter first
  const params = new URLSearchParams(window.location.search);
  const urlVariant = params.get('variant') as ABTestVariant | null;

  if (urlVariant && ['control', 'variant_a', 'variant_b'].includes(urlVariant)) {
    return urlVariant;
  }

  // Check localStorage
  const stored = localStorage.getItem('transforme_ab_variant') as ABTestVariant | null;
  if (stored) {
    return stored;
  }

  // Randomly assign variant (70% control, 15% variant_a, 15% variant_b)
  const rand = Math.random();
  let variant: ABTestVariant = 'control';

  if (rand < 0.15) {
    variant = 'variant_a';
  } else if (rand < 0.30) {
    variant = 'variant_b';
  }

  localStorage.setItem('transforme_ab_variant', variant);
  return variant;
};

/**
 * useTracking hook - Main hook for analytics
 */
export const useTracking = (componentName: string) => {
  const [session] = useState<SessionData>(() => getOrCreateSession());
  const [abVariant] = useState<ABTestVariant>(() => getABVariant());
  const [userId] = useState<string | undefined>(() => {
    // Try to get user ID from localStorage or session
    return localStorage.getItem('userId') || undefined;
  });

  /**
   * Track analytics event
   * This can be extended to send to Mixpanel, Google Analytics, Segment, etc.
   */
  const trackEvent = useCallback(
    (
      eventType: AnalyticsEventType,
      label?: string,
      value?: string | number,
      metadata?: Record<string, unknown>
    ) => {
      const event: AnalyticsEvent = {
        event: eventType,
        label,
        value,
        metadata: {
          component: componentName,
          ...metadata,
        },
        timestamp: Date.now(),
        userId,
        sessionId: session.sessionId,
        abVariant,
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', event);
      }

      // Send to external analytics service
      sendAnalyticsEvent(event);
    },
    [session.sessionId, userId, abVariant, componentName]
  );

  /**
   * Track CTA click events
   */
  const trackCTAClick = useCallback(
    (label: string, metadata?: Record<string, unknown>) => {
      trackEvent('cta_click', label, undefined, metadata);
    },
    [trackEvent]
  );

  /**
   * Track form open events
   */
  const trackFormOpen = useCallback(
    (source: string) => {
      trackEvent('form_open', source, undefined, { source });
    },
    [trackEvent]
  );

  /**
   * Track feature click events
   */
  const trackFeatureClick = useCallback(
    (featureId: string) => {
      trackEvent('feature_click', featureId, undefined, { featureId });
    },
    [trackEvent]
  );

  /**
   * Track pricing plan click
   */
  const trackPricingPlanClick = useCallback(
    (planId: string, planName: string) => {
      trackEvent('pricing_plan_click', planId, undefined, { planId, planName });
    },
    [trackEvent]
  );

  /**
   * Track pricing toggle (monthly/annual)
   */
  const trackPricingToggle = useCallback(
    (billingCycle: string) => {
      trackEvent('pricing_toggle', billingCycle, undefined, { billingCycle });
    },
    [trackEvent]
  );

  /**
   * Track scroll depth
   */
  const trackScrollDepth = useCallback(
    (percentage: number) => {
      trackEvent('scroll_depth', undefined, percentage, { percentage });
    },
    [trackEvent]
  );

  /**
   * Setup scroll tracking
   */
  useEffect(() => {
    let lastTrackedDepth = 0;
    const DEPTH_INTERVAL = 25; // Track every 25%

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100;
      const roundedDepth = Math.floor(scrollPercentage / DEPTH_INTERVAL) * DEPTH_INTERVAL;

      if (roundedDepth > lastTrackedDepth && roundedDepth <= 100) {
        lastTrackedDepth = roundedDepth;
        trackScrollDepth(roundedDepth);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth]);

  return {
    trackEvent,
    trackCTAClick,
    trackFormOpen,
    trackFeatureClick,
    trackPricingPlanClick,
    trackPricingToggle,
    trackScrollDepth,
    session,
    abVariant,
    userId,
  };
};

/**
 * Send analytics event to external service
 * This is a placeholder that can be extended to integrate with:
 * - Google Analytics (gtag)
 * - Mixpanel
 * - Segment
 * - Custom backend endpoint
 */
const sendAnalyticsEvent = (event: AnalyticsEvent) => {
  try {
    // Example: Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag;
      gtag('event', event.event, {
        event_label: event.label,
        event_value: event.value,
        session_id: event.sessionId,
        user_id: event.userId,
        ab_variant: event.abVariant,
        ...event.metadata,
      });
    }

    // Example: Custom endpoint (uncomment to use)
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // });
  } catch (error) {
    console.error('[Analytics Error]', error);
  }
};

/**
 * Hook for tracking CTA button interactions
 */
export const useTrackingWithCallback = (
  componentName: string,
  onAnalytics?: (event: AnalyticsEvent) => void
) => {
  const tracking = useTracking(componentName);

  const enhancedTrackEvent = useCallback(
    (
      eventType: AnalyticsEventType,
      label?: string,
      value?: string | number,
      metadata?: Record<string, unknown>
    ) => {
      tracking.trackEvent(eventType, label, value, metadata);

      // Call external callback if provided
      if (onAnalytics) {
        onAnalytics({
          event: eventType,
          label,
          value,
          metadata,
          timestamp: Date.now(),
          userId: tracking.userId,
          sessionId: tracking.session.sessionId,
          abVariant: tracking.abVariant,
        });
      }
    },
    [tracking, onAnalytics]
  );

  return {
    ...tracking,
    trackEvent: enhancedTrackEvent,
  };
};
