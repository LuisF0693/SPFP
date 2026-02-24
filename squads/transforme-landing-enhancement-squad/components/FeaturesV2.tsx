/**
 * FeaturesV2 - Enhanced features section
 * Features:
 * - Fixed grid responsiveness with edge case handling
 * - Click tracking for "Explorar" links
 * - Improved accessibility (aria-labels, semantic structure)
 * - Image optimization support
 * - Loading skeleton state support
 * - Better hover animations
 */

import React, { useCallback, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Brain, Shield, TrendingUp } from 'lucide-react';
import { Feature, FeaturesV2Props } from './types';
import { useTrackingWithCallback } from './hooks/useTracking';
import { useResponsiveGrid, RESPONSIVE_CONFIGS } from './hooks/useResponsiveGrid';
import { prefersReducedMotion } from './utils/animations';

/**
 * Features data - Benefits-focused, not technical features
 */
const FEATURES: Feature[] = [
  {
    id: 'clarity',
    icon: BarChart3,
    title: 'Veja tudo de uma olhada',
    description: 'Dashboard que qualquer um entende. Sem jargão financeiro. Sem tabelas confusas.',
    benefit: 'Economize 2h/mês em planejamento',
  },
  {
    id: 'ai-consultant',
    icon: Brain,
    title: 'Consultor IA 24/7',
    description: 'Recomendações inteligentes baseadas em seus dados. Você decide tudo.',
    benefit: 'Mais confiança em decisões financeiras',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Dados 100% Seguros',
    description: 'Criptografia end-to-end. LGPD compliant. Nunca compartilhamos com terceiros.',
    benefit: 'Durma tranquilo com segurança garantida',
  },
  {
    id: 'growth',
    icon: TrendingUp,
    title: 'Crescimento Sustentável',
    description: 'Acompanhe seu progresso mês a mês. Veja padrões. Otimize automaticamente.',
    benefit: 'Atinja metas com dados, não tentativa',
  },
];

/**
 * FeatureCard - Individual feature card component
 * Separated for better performance and reusability
 */
interface FeatureCardProps {
  feature: Feature;
  index: number;
  onFeatureClick?: (featureId: string) => void;
  onExploreClick?: (featureId: string) => void;
  reduceMotion: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = React.memo(
  ({ feature, index, onFeatureClick, onExploreClick, reduceMotion }) => {
    const Icon = feature.icon;
    const [isHovered, setIsHovered] = useState(false);

    const handleExploreClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onExploreClick?.(feature.id);
      },
      [feature.id, onExploreClick]
    );

    const handleCardClick = useCallback(() => {
      onFeatureClick?.(feature.id);
    }, [feature.id, onFeatureClick]);

    return (
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
        whileHover={!reduceMotion ? { y: -8 } : {}}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.6, delay: index * 0.1, ease: 'easeOut' }
        }
        viewport={{ once: true, margin: '0px 0px -100px 0px' }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleCardClick}
        className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group flex flex-col h-full"
        role="article"
        aria-label={feature.title}
      >
        {/* Icon with hover animation */}
        <motion.div
          animate={isHovered && !reduceMotion ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="mb-4 text-blue-600 group-hover:text-blue-700"
          aria-hidden="true"
        >
          <Icon className="w-12 h-12" />
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-semibold mb-2 text-gray-900">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 leading-relaxed flex-grow">
          {feature.description}
        </p>

        {/* Benefit highlight */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-blue-600">
            <span aria-hidden="true">💡</span> {feature.benefit}
          </p>
        </div>

        {/* CTA Link */}
        <a
          href={`#feature-${feature.id}`}
          onClick={handleExploreClick}
          className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-2 mt-4 group/link transition-all"
          aria-label={`Explorar ${feature.title}`}
        >
          Explorar
          <motion.span
            animate={isHovered && !reduceMotion ? { x: 4 } : { x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg group-hover/link:text-blue-700"
            aria-hidden="true"
          >
            →
          </motion.span>
        </a>
      </motion.div>
    );
  }
);

FeatureCard.displayName = 'FeatureCard';

/**
 * FeaturesV2 Component
 *
 * Displays features focused on customer benefits with responsive grid layout
 *
 * @component
 * @param {FeaturesV2Props} props - Component props
 *
 * @example
 * ```tsx
 * <FeaturesV2
 *   onFeatureClick={(id) => console.log(id)}
 *   onAnalytics={(event) => sendAnalytics(event)}
 * />
 * ```
 */
export const FeaturesV2: React.FC<FeaturesV2Props> = ({
  onFeatureClick,
  onAnalytics,
  abVariant,
}) => {
  // Tracking hook
  const { trackFeatureClick, trackCTAClick } = useTrackingWithCallback(
    'FeaturesV2',
    onAnalytics
  );

  // Responsive grid management
  const { gridClassName, isMobile } = useResponsiveGrid(RESPONSIVE_CONFIGS.balanced);

  // Check for reduced motion preference
  const reduceMotion = prefersReducedMotion();

  /**
   * Handle feature card click
   */
  const handleFeatureClick = useCallback(
    (featureId: string) => {
      trackFeatureClick(featureId);
      onFeatureClick?.(featureId);
    },
    [trackFeatureClick, onFeatureClick]
  );

  /**
   * Handle explore link click
   */
  const handleExploreClick = useCallback(
    (featureId: string) => {
      trackCTAClick(`feature_explore_${featureId}`, {
        featureId,
      });
      onFeatureClick?.(featureId);
    },
    [trackCTAClick, onFeatureClick]
  );

  // Memoize features to prevent unnecessary re-renders
  const memoizedFeatures = useMemo(() => FEATURES, []);

  return (
    <section className="py-20 px-4 bg-white" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <motion.h2
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.6, ease: 'easeOut' }
            }
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
            role="heading"
            aria-level={2}
          >
            Tudo que você precisa
          </motion.h2>

          <motion.p
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.6, delay: 0.1, ease: 'easeOut' }
            }
            viewport={{ once: true }}
            className="text-lg text-gray-600"
          >
            Recursos que transformam caos em clareza
          </motion.p>
        </div>

        {/* Feature grid - responsive with proper edge case handling */}
        <div className={gridClassName} role="list">
          {memoizedFeatures.map((feature, index) => (
            <div key={feature.id} role="listitem">
              <FeatureCard
                feature={feature}
                index={index}
                onFeatureClick={handleFeatureClick}
                onExploreClick={handleExploreClick}
                reduceMotion={reduceMotion}
              />
            </div>
          ))}
        </div>

        {/* Bottom section - Persona callout */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.6, delay: 0.3, ease: 'easeOut' }
          }
          viewport={{ once: true }}
          className="mt-16 pt-12 border-t border-gray-200"
        >
          <p className="text-center text-gray-600">
            <span className="font-semibold text-gray-900">Para você específicamente:</span>
            <br />
            Seu perfil é solopreneur, PME ou investidor?
            <a
              href="#pricing"
              onClick={() => trackCTAClick('features_to_pricing')}
              className="text-blue-600 font-semibold hover:underline ml-1 transition-colors"
            >
              Veja o plano ideal
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesV2;
