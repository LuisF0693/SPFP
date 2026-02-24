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
    <section className="py-20 px-4" style={{ background: '#f6f6f8' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: '#111418' }}
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
              className="rounded-lg p-6 text-center"
              style={{
                background: '#ffffff',
                border: '1px solid #e6e8eb',
                boxShadow: '0 1px 3px rgba(19, 91, 236, 0.08)',
              }}
            >
              <div
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: '#135bec' }}
              >
                {stat.value}
              </div>
              <p className="text-sm" style={{ color: '#637588' }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Security Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="rounded-lg p-8"
          style={{
            background: '#ffffff',
            border: '1px solid #e6e8eb',
            boxShadow: '0 2px 8px rgba(19, 91, 236, 0.1)',
          }}
        >
          <p
            className="text-center font-semibold mb-6"
            style={{ color: '#111418' }}
          >
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
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                  style={{ background: 'rgba(19, 91, 236, 0.02)' }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: '#135bec' }} />
                  <span className="text-sm" style={{ color: '#111418' }}>
                    {badge.text}
                  </span>
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
