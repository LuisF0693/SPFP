/**
 * Landing page components barrel export
 * Provides centralized access to all components and utilities
 */

// Components
export { HeroV2 } from './HeroV2';
export type { } from './types';

export { FeaturesV2 } from './FeaturesV2';

export { PricingV2 } from './PricingV2';

export { ErrorBoundary } from './ErrorBoundary';

// Types
export type {
  AnalyticsEvent,
  AnalyticsEventType,
  ABTestVariant,
  ABTestContext,
  FormSource,
  FormState,
  Feature,
  PricingPlan,
  PricingFeature,
  CTAButtonState,
  ResponsiveGridConfig,
  AnimationConfig,
  HeroV2Props,
  FeaturesV2Props,
  PricingV2Props,
  ErrorBoundaryProps,
  AccessibilityProps,
} from './types';

// Hooks
export { useTracking, useTrackingWithCallback, getABVariant } from './hooks/useTracking';
export type { } from './hooks/useTracking';

export {
  useResponsiveGrid,
  useScreenSize,
  useBreakpoint,
  useResponsiveRender,
  RESPONSIVE_CONFIGS,
  getGridColsClass,
  getGapClass,
  getItemWidth,
  getResponsivePadding,
  getContainerClass,
} from './hooks/useResponsiveGrid';

// Utilities
export {
  heroAnimations,
  featuresAnimations,
  pricingAnimations,
  buttonAnimations,
  loadingAnimations,
  modalAnimations,
  prefersReducedMotion,
  getAnimationConfig,
  createStaggeredAnimation,
  createResponsiveAnimation,
} from './utils/animations';

// Validation
export {
  validateAnalyticsEvent,
  validateABVariant,
  validateFormState,
  validateResponsiveGridConfig,
  validatePricingPlan,
  validateFeature,
  validateCTAButtonState,
  validateCallback,
  sanitizeAnalyticsEvent,
  createSafeEventHandler,
  validateHeroV2Props,
  validateFeaturesV2Props,
  validatePricingV2Props,
  validateErrorBoundaryProps,
} from './validation';
