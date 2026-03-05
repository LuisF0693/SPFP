import React from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export const Section: React.FC<SectionProps> = ({ id, title, subtitle, children, className = "", dark = false }) => {
  return (
    <section
      id={id}
      className={`scroll-mt-24 py-20 px-6 md:px-12 lg:px-24 ${dark ? 'bg-navy-900 text-white' : 'bg-white text-gray-900'} ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-3xl md:text-4xl font-bold mb-4 ${dark ? 'text-white' : 'text-navy-900'}`}
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`text-lg md:text-xl max-w-3xl ${dark ? 'text-gray-300' : 'text-gray-500'}`}
            >
              {subtitle}
            </motion.p>
          )}
          <div className={`h-1 w-20 mt-6 ${dark ? 'bg-blue-500' : 'bg-navy-700'}`} />
        </div>
        {children}
      </div>
    </section>
  );
};
