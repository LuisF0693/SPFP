/**
 * Animation configurations for landing page components
 * Supports both desktop and reduced motion preferences
 */

import { Variants, TargetAndTransition } from 'framer-motion';

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Create motion configuration respecting prefers-reduced-motion
 */
const withReducedMotionSupport = <T extends TargetAndTransition>(
  config: T
): T => {
  if (prefersReducedMotion()) {
    return {
      ...config,
      transition: {
        ...(config.transition || {}),
        duration: 0,
        delay: 0,
      },
    } as T;
  }
  return config;
};

/**
 * Hero section animations
 */
export const heroAnimations = {
  /**
   * Main title fade in and slide up
   */
  titleVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Subtitle with staggered delay
   */
  subtitleVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.2, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Trust statement animation
   */
  trustVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.3, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * CTA buttons animation
   */
  ctaVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.4, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Value props grid animation
   */
  gridVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.5, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Scroll indicator bounce animation
   */
  scrollIndicatorVariants: {
    animate: {
      y: [0, 10, 0],
      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
    },
  } as Variants,
};

/**
 * Features section animations
 */
export const featuresAnimations = {
  /**
   * Section heading animation
   */
  headingVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Feature card animation with stagger
   */
  featureCardVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Feature card hover state
   */
  featureCardHoverVariants: {
    hover: {
      y: -8,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Icon animation on hover
   */
  iconVariants: {
    idle: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Bottom section animation
   */
  bottomSectionVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.3, ease: 'easeOut' },
    },
  } as Variants,
};

/**
 * Pricing section animations
 */
export const pricingAnimations = {
  /**
   * Section heading animation
   */
  headingVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Pricing card animation with stagger
   */
  cardVariants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Pricing card hover state
   */
  cardHoverVariants: {
    hover: {
      y: -10,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Popular badge animation
   */
  badgeVariants: {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4, delay: 0.5, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Button loading state animation
   */
  buttonLoadingVariants: {
    loading: {
      opacity: [1, 0.6, 1],
      transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
    },
  } as Variants,

  /**
   * Feature list item stagger
   */
  featureListVariants: {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: i * 0.05, ease: 'easeOut' },
    }),
  } as Variants,
};

/**
 * Button animations
 */
export const buttonAnimations = {
  /**
   * Primary button animation
   */
  primaryButtonVariants: {
    idle: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    active: { scale: 0.95, transition: { duration: 0.1 } },
  } as Variants,

  /**
   * Secondary button animation
   */
  secondaryButtonVariants: {
    idle: { scale: 1 },
    hover: {
      scale: 1.05,
      backgroundColor: 'rgb(239, 246, 255)',
      transition: { duration: 0.2 },
    },
    active: { scale: 0.95, transition: { duration: 0.1 } },
  } as Variants,

  /**
   * Icon button animation
   */
  iconButtonVariants: {
    idle: { rotate: 0 },
    hover: { rotate: 180, transition: { duration: 0.3 } },
  } as Variants,
};

/**
 * Loading state animations
 */
export const loadingAnimations = {
  /**
   * Skeleton loading pulse
   */
  skeletonVariants: {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
    },
  } as Variants,

  /**
   * Spinner rotation
   */
  spinnerVariants: {
    animate: {
      rotate: 360,
      transition: { repeat: Infinity, duration: 1, ease: 'linear' },
    },
  } as Variants,
};

/**
 * Modal/Dialog animations
 */
export const modalAnimations = {
  /**
   * Modal backdrop fade in
   */
  backdropVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  } as Variants,

  /**
   * Modal content animation
   */
  contentVariants: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  } as Variants,
};

/**
 * Get animation config respecting reduced motion preference
 */
export const getAnimationConfig = (
  variants: Variants,
  includeStagger = false
): Variants => {
  if (prefersReducedMotion()) {
    return {
      hidden: variants.hidden || {},
      visible: {
        ...variants.visible,
        transition: { duration: 0, delay: 0 },
      },
    };
  }
  return variants;
};

/**
 * Create staggered animation for lists
 */
export const createStaggeredAnimation = (
  itemDelay = 0.05,
  containerStagger = 0.1
): { container: Variants; item: Variants } => {
  const reduced = prefersReducedMotion();

  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: reduced ? 0 : containerStagger,
          delayChildren: 0,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reduced ? 0 : 0.4, delay: reduced ? 0 : itemDelay },
      },
    },
  };
};

/**
 * Check for motion preferences and return appropriate animation
 */
export const createResponsiveAnimation = (
  desktopDuration = 0.6,
  mobileDuration = 0.3
): { duration: number; transition: { duration: number } } => {
  const isMobile = window.innerWidth < 768;
  const duration = isMobile ? mobileDuration : desktopDuration;

  return {
    duration,
    transition: { duration: prefersReducedMotion() ? 0 : duration },
  };
};
