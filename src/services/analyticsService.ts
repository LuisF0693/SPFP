/**
 * Analytics Service
 * FASE 1: STY-057 (Sidebar Persistence & Analytics)
 *
 * Tracks user interactions with sidebar sections:
 * - Logs expand/collapse events
 * - Sends to Supabase with rate limiting
 * - Falls back to localStorage if Supabase unavailable
 * - Non-blocking: errors don't affect UI
 */

import { supabase } from '../supabase';
import { logDetailedError } from './retryService';

interface SidebarAnalyticsEvent {
  userId: string;
  section: 'BUDGET' | 'ACCOUNTS' | 'TRANSACTIONS' | 'INSTALLMENTS';
  action: 'expand' | 'collapse';
  timestamp: number;
}

interface SidebarAnalyticsLog extends SidebarAnalyticsEvent {
  id?: string;
}

// Rate limiting: max 1 event per section per 5 seconds
const RATE_LIMIT_MS = 5000;
const lastEventTime: Record<string, number> = {};

/**
 * Check if enough time has passed for rate limit
 */
const isRateLimitOk = (key: string): boolean => {
  const lastTime = lastEventTime[key];
  const now = Date.now();
  if (!lastTime || now - lastTime >= RATE_LIMIT_MS) {
    lastEventTime[key] = now;
    return true;
  }
  return false;
};

/**
 * Log sidebar analytics event to localStorage as fallback
 */
const logToLocalStorage = (event: SidebarAnalyticsLog): void => {
  try {
    const key = 'spfp_sidebar_analytics';
    const existing = localStorage.getItem(key);
    const events: SidebarAnalyticsLog[] = existing ? JSON.parse(existing) : [];

    // Keep only last 100 events
    events.push(event);
    if (events.length > 100) {
      events.shift();
    }

    localStorage.setItem(key, JSON.stringify(events));
  } catch (error) {
    // Silent fail - don't block UI
    console.debug('Failed to log analytics to localStorage:', error);
  }
};

/**
 * Log sidebar analytics event to Supabase
 */
const logToSupabase = async (event: SidebarAnalyticsLog): Promise<void> => {
  try {
    // Insert event into sidebar_analytics table
    const { error } = await supabase
      .from('sidebar_analytics')
      .insert([
        {
          user_id: event.userId,
          section: event.section,
          action: event.action,
          created_at: new Date(event.timestamp).toISOString(),
        },
      ]);

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }
  } catch (error) {
    // Log error but don't throw - fallback to localStorage already done
    logDetailedError(
      error as Error,
      'Failed to log sidebar analytics to Supabase',
      {
        action: 'logSidebarAnalytics',
        userId: event.userId,
        severity: 'low', // Non-critical
      }
    );
  }
};

/**
 * Track sidebar section expand/collapse event
 * Usage: analyticsService.trackSectionToggle(userId, 'BUDGET', 'expand')
 */
export const analyticsService = {
  /**
   * Track when a sidebar section is expanded or collapsed
   */
  trackSectionToggle: async (
    userId: string,
    section: 'BUDGET' | 'ACCOUNTS' | 'TRANSACTIONS' | 'INSTALLMENTS',
    action: 'expand' | 'collapse'
  ): Promise<void> => {
    // Rate limiting check
    const rateLimitKey = `${userId}-${section}`;
    if (!isRateLimitOk(rateLimitKey)) {
      return; // Rate limited, skip
    }

    const event: SidebarAnalyticsLog = {
      userId,
      section,
      action,
      timestamp: Date.now(),
    };

    // Always log to localStorage first (fallback)
    logToLocalStorage(event);

    // Try to log to Supabase (non-blocking)
    if (userId) {
      logToSupabase(event).catch(() => {
        // Already logged to localStorage, so no error handling needed
      });
    }
  },

  /**
   * Get analytics from localStorage
   */
  getLocalAnalytics: (): SidebarAnalyticsLog[] => {
    try {
      const key = 'spfp_sidebar_analytics';
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.debug('Failed to read analytics from localStorage:', error);
      return [];
    }
  },

  /**
   * Clear analytics from localStorage
   */
  clearLocalAnalytics: (): void => {
    try {
      localStorage.removeItem('spfp_sidebar_analytics');
    } catch (error) {
      console.debug('Failed to clear analytics from localStorage:', error);
    }
  },

  /**
   * Get summary stats from local analytics
   */
  getAnalyticsSummary: () => {
    const events = analyticsService.getLocalAnalytics();
    const summary: Record<string, { expands: number; collapses: number }> = {
      BUDGET: { expands: 0, collapses: 0 },
      ACCOUNTS: { expands: 0, collapses: 0 },
      TRANSACTIONS: { expands: 0, collapses: 0 },
      INSTALLMENTS: { expands: 0, collapses: 0 },
    };

    events.forEach((event) => {
      if (summary[event.section]) {
        if (event.action === 'expand') {
          summary[event.section].expands += 1;
        } else {
          summary[event.section].collapses += 1;
        }
      }
    });

    return summary;
  },
};

export default analyticsService;
