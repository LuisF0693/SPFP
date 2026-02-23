import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Brain, Users, FileText } from 'lucide-react';

const features = [
  {
    id: 'dashboard',
    icon: BarChart3,
    title: 'Veja tudo de uma olhada',
    description: 'Dashboard visual que qualquer um entende. Não precisa ser expert em finanças.',
  },
  {
    id: 'ai-consultant',
    icon: Brain,
    title: 'Consultor IA 24/7',
    description: 'Recomendações personalizadas instantaneamente. Você decide.',
  },
  {
    id: 'human-support',
    icon: Users,
    title: 'Consultoria Humana',
    description: 'Especialistas disponíveis para planejamento complexo.',
  },
  {
    id: 'reports',
    icon: FileText,
    title: 'Relatórios Automáticos',
    description: 'Dados que você entende. Progresso mensal claro.',
  },
];

export const Features: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
          >
            Tudo Que Você Precisa
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600"
          >
            Todos os recursos para transformar suas finanças
          </motion.p>
        </div>

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
                className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div className="mb-4 text-blue-600 group-hover:text-blue-700 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <a
                  href="#"
                  className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-2"
                >
                  Explorar
                  <span className="text-lg">→</span>
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
