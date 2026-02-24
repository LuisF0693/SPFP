/**
 * PropTypes validation for landing page components
 * Provides runtime type checking as backup to TypeScript
 */

/**
 * Validate analytics event
 */
export const validateAnalyticsEvent = (event: any): boolean => {
  if (!event) return false;

  const validEventTypes = [
    'cta_click',
    'form_open',
    'form_submit',
    'feature_click',
    'pricing_plan_click',
    'pricing_toggle',
    'demo_request',
    'scroll_depth',
    'session_start',
  ];

  return (
    typeof event === 'object' &&
    validEventTypes.includes(event.event) &&
    (event.timestamp === undefined || typeof event.timestamp === 'number')
  );
};

/**
 * Validate A/B variant
 */
export const validateABVariant = (variant: any): boolean => {
  const validVariants = ['control', 'variant_a', 'variant_b'];
  return typeof variant === 'string' && validVariants.includes(variant);
};

/**
 * Validate form state
 */
export const validateFormState = (state: any): boolean => {
  if (!state || typeof state !== 'object') return false;

  const validSources = ['platform', 'demo', 'pricing', 'feature'];
  return (
    typeof state.isOpen === 'boolean' &&
    validSources.includes(state.source) &&
    (state.isLoading === undefined || typeof state.isLoading === 'boolean') &&
    (state.error === undefined || typeof state.error === 'string')
  );
};

/**
 * Validate responsive grid config
 */
export const validateResponsiveGridConfig = (config: any): boolean => {
  if (!config || typeof config !== 'object') return false;

  return (
    typeof config.mobile === 'number' &&
    typeof config.tablet === 'number' &&
    typeof config.desktop === 'number' &&
    typeof config.gap === 'number' &&
    config.mobile > 0 &&
    config.tablet > 0 &&
    config.desktop > 0 &&
    config.gap > 0
  );
};

/**
 * Validate pricing plan
 */
export const validatePricingPlan = (plan: any): boolean => {
  if (!plan || typeof plan !== 'object') return false;

  return (
    typeof plan.id === 'string' &&
    typeof plan.name === 'string' &&
    typeof plan.price === 'number' &&
    plan.price >= 0 &&
    typeof plan.subtitle === 'string' &&
    typeof plan.description === 'string' &&
    Array.isArray(plan.features) &&
    typeof plan.roi === 'string' &&
    plan.cta &&
    typeof plan.cta.text === 'string' &&
    ['primary', 'secondary'].includes(plan.cta.variant)
  );
};

/**
 * Validate feature
 */
export const validateFeature = (feature: any): boolean => {
  if (!feature || typeof feature !== 'object') return false;

  return (
    typeof feature.id === 'string' &&
    typeof feature.title === 'string' &&
    typeof feature.description === 'string' &&
    typeof feature.benefit === 'string' &&
    typeof feature.icon === 'function'
  );
};

/**
 * Sanitize analytics event (prevent XSS)
 */
export const sanitizeAnalyticsEvent = (event: any): any => {
  if (!event || typeof event !== 'object') return {};

  return {
    event: String(event.event).substring(0, 50),
    label: event.label ? String(event.label).substring(0, 200) : undefined,
    value: typeof event.value === 'number' ? event.value : undefined,
    timestamp: typeof event.timestamp === 'number' ? event.timestamp : Date.now(),
    userId: event.userId ? String(event.userId).substring(0, 50) : undefined,
    sessionId: event.sessionId ? String(event.sessionId).substring(0, 50) : undefined,
    abVariant: event.abVariant ? String(event.abVariant).substring(0, 20) : undefined,
    metadata: event.metadata && typeof event.metadata === 'object' ? event.metadata : {},
  };
};

/**
 * Validate button state
 */
export const validateCTAButtonState = (state: any): boolean => {
  const validStates = ['idle', 'loading', 'disabled', 'error'];
  return typeof state === 'string' && validStates.includes(state);
};

/**
 * Validate callback function
 */
export const validateCallback = (callback: any): boolean => {
  return typeof callback === 'function' || callback === undefined;
};

/**
 * Safe event handler wrapper
 * Catches and logs errors in event handlers
 */
export const createSafeEventHandler = <T extends (...args: any[]) => any>(
  handler: T,
  errorContext: string
): T => {
  return ((...args: any[]) => {
    try {
      return handler(...args);
    } catch (error) {
      console.error(`[Error in ${errorContext}]`, error);
      // Don't re-throw to prevent component crashes
    }
  }) as T;
};

/**
 * Validate component props
 */
export const validateHeroV2Props = (props: any): boolean => {
  return (
    (props.onDemoClick === undefined || typeof props.onDemoClick === 'function') &&
    (props.abVariant === undefined || validateABVariant(props.abVariant)) &&
    (props.onAnalytics === undefined || typeof props.onAnalytics === 'function')
  );
};

export const validateFeaturesV2Props = (props: any): boolean => {
  return (
    (props.onFeatureClick === undefined || typeof props.onFeatureClick === 'function') &&
    (props.onAnalytics === undefined || typeof props.onAnalytics === 'function') &&
    (props.abVariant === undefined || validateABVariant(props.abVariant))
  );
};

export const validatePricingV2Props = (props: any): boolean => {
  return (
    (props.onPlanClick === undefined || typeof props.onPlanClick === 'function') &&
    (props.onAnalytics === undefined || typeof props.onAnalytics === 'function') &&
    (props.abVariant === undefined || validateABVariant(props.abVariant)) &&
    (props.initialBillingCycle === undefined ||
      ['monthly', 'annual'].includes(props.initialBillingCycle))
  );
};

export const validateErrorBoundaryProps = (props: any): boolean => {
  return (
    props.children !== undefined &&
    (props.fallback === undefined || typeof props.fallback === 'object') &&
    (props.onError === undefined || typeof props.onError === 'function')
  );
};
