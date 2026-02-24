import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Brain, Shield, TrendingUp } from 'lucide-react';

/**
 * FeaturesV2 - Redesigned features section
 * Focus: Customer benefits, not technical features
 */

const features = [
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

export const FeaturesV2: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
          >
            Tudo que você precisa
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600"
          >
            Recursos que transformam caos em clareza
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
              >
                {/* Icon */}
                <div className="mb-4 text-blue-600 group-hover:text-blue-700 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-12 h-12" />
                </div>

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
                    💡 {feature.benefit}
                  </p>
                </div>

                {/* CTA */}
                <a
                  href="#"
                  className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-2 mt-4"
                >
                  Explorar
                  <span className="text-lg">→</span>
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom section - Persona callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 pt-12 border-t border-gray-200"
        >
          <p className="text-center text-gray-600">
            <span className="font-semibold text-gray-900">Para você específicamente:</span>
            <br />
            Seu perfil é solopreneur, PME ou investidor?
            <a href="#pricing" className="text-blue-600 font-semibold hover:underline ml-1">
              Veja o plano ideal
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesV2;
