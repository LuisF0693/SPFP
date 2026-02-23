import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { LeadForm } from './LeadForm';

export const Hero: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSource, setFormSource] = useState<'platform' | 'demo' | 'pricing'>('platform');

  const handleOpenForm = (source: 'platform' | 'demo' | 'pricing') => {
    setFormSource(source);
    setIsFormOpen(true);
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4 py-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-950"
          >
            Planeje suas finanças em minutos, não horas.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed"
          >
            Com inteligência artificial que entende VOCÊ
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => handleOpenForm('platform')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Começar com Plataforma (R$99,90/mês)
            </button>
            <button
              onClick={() => handleOpenForm('demo')}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Agendar Demo
            </button>
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

export default Hero;
