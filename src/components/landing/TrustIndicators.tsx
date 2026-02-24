import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, CreditCard, Shield } from 'lucide-react';

const stats = [
  {
    value: '2.341',
    label: 'Empreendedores Ativos',
  },
  {
    value: 'R$150M+',
    label: 'Planejados em Plataforma',
  },
  {
    value: '4.8 ⭐',
    label: 'Avaliação Média',
  },
  {
    value: '<2h',
    label: 'Tempo Médio de Resposta',
  },
];

const badges = [
  {
    icon: Lock,
    text: 'Dados LGPD protegidos',
  },
  {
    icon: CheckCircle,
    text: 'Sem contrato de fidelidade',
  },
  {
    icon: CreditCard,
    text: 'Cancele quando quiser',
  },
  {
    icon: Shield,
    text: 'Criptografia SSL',
  },
];

export const TrustIndicators: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
          >
            Por que 2.300+ empreendedores confiam no SPFP
          </motion.h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 text-center border border-gray-200"
            >
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">
                {stat.value}
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Security Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-white rounded-lg p-8 border border-gray-200"
        >
          <p className="text-center text-gray-600 font-semibold mb-6">
            Segurança e Transparência
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <Icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{badge.text}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustIndicators;
