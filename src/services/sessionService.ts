/**
 * Session Service
 *
 * Manages user session tracking and A/B test variant assignment.
 * Ensures consistent variant assignment throughout user session.
 *
 * Usage:
 *   import { getOrCreateSessionId, getOrCreateAbTestVariant } from '@/services/sessionService';
 *
 *   const sessionId = getOrCreateSessionId();
 *   const variant = getOrCreateAbTestVariant('hero_headline');
 */

/**
 * Generate a unique session ID
 * Format: session_{timestamp}_{randomId}
 */
const generateSessionId = (): string => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substr(2, 9);
  return `session_${timestamp}_${randomId}`;
};

/**
 * Get or create session ID
 * Persists in sessionStorage for consistency across page views/reloads within same tab
 */
export const getOrCreateSessionId = (): string => {
  const SESSION_KEY = 'spfp_session_id';

  let sessionId = sessionStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
};

/**
 * Clear session (for logout, session reset)
 */
export const clearSessionId = (): void => {
  sessionStorage.removeItem('spfp_session_id');
};

/**
 * A/B test variant weights (must sum to 1.0)
 */
const VARIANT_WEIGHTS = {
  control: 0.33,
  variant_a: 0.33,
  variant_b: 0.34,
};

const VARIANTS = ['control', 'variant_a', 'variant_b'] as const;
type Variant = (typeof VARIANTS)[number];

/**
 * Assign variant based on weighted random selection
 */
const assignVariant = (): Variant => {
  const rand = Math.random();
  let cumulative = 0;

  for (let i = 0; i < VARIANTS.length; i++) {
    const variant = VARIANTS[i];
    cumulative += VARIANT_WEIGHTS[variant];

    if (rand < cumulative) {
      return variant;
    }
  }

  // Fallback (should never reach here)
  return 'control';
};

/**
 * Get or create A/B test variant for a specific test
 * Persists in sessionStorage to ensure consistency
 *
 * @param testName - Name of the test (e.g., 'hero_headline', 'cta_button', etc.)
 * @returns Variant name ('control', 'variant_a', or 'variant_b')
 */
export const getOrCreateAbTestVariant = (testName: string): Variant => {
  const VARIANT_KEY = `ab_variant_${testName}`;

  let variant = sessionStorage.getItem(VARIANT_KEY) as Variant | null;

  if (!variant) {
    // Only assign variant if on /transforme page
    if (window.location.pathname.includes('/transforme')) {
      variant = assignVariant();
      sessionStorage.setItem(VARIANT_KEY, variant);
    } else {
      // Non-landing pages always get control
      variant = 'control';
    }
  }

  return variant;
};

/**
 * Force variant assignment (for testing purposes only)
 * @param testName - Name of the test
 * @param variant - Variant to assign
 */
export const forceAbTestVariant = (testName: string, variant: Variant): void => {
  const VARIANT_KEY = `ab_variant_${testName}`;
  sessionStorage.setItem(VARIANT_KEY, variant);
};

/**
 * Clear A/B test variant (for logout/session reset)
 * @param testName - Specific test to clear, or undefined to clear all
 */
export const clearAbTestVariant = (testName?: string): void => {
  if (testName) {
    sessionStorage.removeItem(`ab_variant_${testName}`);
  } else {
    // Clear all AB test variants
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('ab_variant_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

/**
 * Get all active A/B test variants
 * Returns object with test names as keys and variants as values
 */
export const getAllAbTestVariants = (): Record<string, string> => {
  const variants: Record<string, string> = {};

  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith('ab_variant_')) {
      const testName = key.replace('ab_variant_', '');
      const variant = sessionStorage.getItem(key);
      if (variant) {
        variants[testName] = variant;
      }
    }
  });

  return variants;
};

/**
 * Check if user is in control group
 * @param testName - Name of the test
 */
export const isInControlGroup = (testName: string): boolean => {
  return getOrCreateAbTestVariant(testName) === 'control';
};

/**
 * Check if user is in specific variant
 * @param testName - Name of the test
 * @param variant - Variant to check ('variant_a' or 'variant_b')
 */
export const isInVariant = (testName: string, variant: Variant): boolean => {
  return getOrCreateAbTestVariant(testName) === variant;
};

/**
 * Track that a user was exposed to a variant
 * Used for A/B test analytics
 * @param testName - Name of the test
 * @param variant - Variant shown to user
 */
export const trackVariantExposure = (testName: string, variant: Variant): void => {
  const exposureKey = `ab_exposure_${testName}`;
  const alreadyTracked = sessionStorage.getItem(exposureKey);

  if (!alreadyTracked && typeof window !== 'undefined' && window.gtag) {
    sessionStorage.setItem(exposureKey, 'true');

    window.gtag('event', 'ab_test_exposure', {
      event_category: 'experiment',
      event_label: `A/B Test - ${testName}`,
      experiment_id: testName,
      experiment_variant: variant,
      ab_test_group: testName,
    });
  }
};

/**
 * Reset all session data (for debugging/testing)
 */
export const resetSessionData = (): void => {
  clearSessionId();
  clearAbTestVariant();
};

export default {
  getOrCreateSessionId,
  clearSessionId,
  getOrCreateAbTestVariant,
  forceAbTestVariant,
  clearAbTestVariant,
  getAllAbTestVariants,
  isInControlGroup,
  isInVariant,
  trackVariantExposure,
  resetSessionData,
};
