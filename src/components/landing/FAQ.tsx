import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    id: 1,
    question: 'Não confio em IA com minhas finanças',
    answer:
      'IA recomenda. Você decide. Controle total sobre suas decisões. Todos os dados são criptografados e seguros.',
  },
  {
    id: 2,
    question: 'Como funciona o setup inicial?',
    answer:
      'Leva apenas 5 minutos. Conecte suas contas, responda um quiz rápido (3 min), e a IA analisa tudo instantaneamente.',
  },
  {
    id: 3,
    question: 'E se quiser cancelar?',
    answer:
      'Sem contrato. Cancele quando quiser - são apenas 2 cliques. Fácil e sem burocracias.',
  },
  {
    id: 4,
    question: 'Qual é a diferença entre os planos?',
    answer:
      'Plataforma: IA automática + dashboard. Consultoria: tudo acima + especialista humano com reunião mensal.',
  },
  {
    id: 5,
    question: 'Meus dados são seguros?',
    answer:
      '100% LGPD compliant. Criptografia end-to-end. Nunca compartilhamos seus dados com terceiros.',
  },
  {
    id: 6,
    question: 'Posso usar sem cartão de crédito?',
    answer:
      'Sim! Aceitamos Pix também. Teste 7 dias grátis sem precisar de cartão.',
  },
];

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
          >
            Perguntas Frequentes
          </motion.h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors duration-200"
              >
                <span className="font-semibold text-gray-900 text-left">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-300 ${
                    openId === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openId === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 py-4 bg-white border-t border-gray-200"
                >
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            Ainda tem dúvidas?{' '}
            <a href="#" className="text-blue-600 font-semibold hover:underline">
              Chat ao vivo →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
