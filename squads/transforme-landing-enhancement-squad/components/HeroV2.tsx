import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { LeadForm } from './LeadForm';

/**
 * HeroV2 - Redesigned hero section for /transforme landing
 * Focuses on transformation narrative + emotional hook
 */

interface HeroV2Props {
  onDemoClick?: () => void;
}

export const HeroV2: React.FC<HeroV2Props> = ({ onDemoClick }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSource, setFormSource] = useState<'platform' | 'demo' | 'pricing'>('platform');

  const handleOpenForm = (source: 'platform' | 'demo' | 'pricing') => {
    setFormSource(source);
    setIsFormOpen(true);
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4 py-20">
          {/* Main headline - Transformation focused */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-950"
          >
            De caótico a claro.
            <br />
            <span className="text-blue-600">De perdido a confiante.</span>
          </motion.h1>

          {/* Subheading - Emotional hook + benefit */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed"
          >
            Em apenas 5 minutos, com IA que entende você
          </motion.p>

          {/* Trust statement */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm md:text-base mb-12 text-gray-600"
          >
            ✓ Sem contrato • ✓ Cancelamento fácil • ✓ Garantia 7 dias
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <button
              onClick={() => handleOpenForm('platform')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Começar com Plataforma
              <br />
              <span className="text-sm font-normal">R$99,90/mês</span>
            </button>
            <button
              onClick={() => handleOpenForm('demo')}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Agendar Demo
            </button>
          </motion.div>

          {/* Value proposition highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 text-center"
          >
            <div>
              <div className="text-2xl font-bold text-blue-600">5 min</div>
              <div className="text-xs text-gray-600">para começar</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-xs text-gray-600">Consultor IA</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-xs text-gray-600">Dados seguros</div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-16"
          >
            <ChevronDown className="w-8 h-8 mx-auto text-blue-600" />
          </motion.div>
        </div>
      </section>

      {/* Lead Form Modal */}
      <LeadForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        source={formSource}
      />
    </>
  );
};

export default HeroV2;
