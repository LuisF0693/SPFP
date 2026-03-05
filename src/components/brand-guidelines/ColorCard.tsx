import React from 'react';
import { motion } from 'motion/react';

interface ColorCardProps {
  name: string;
  hex: string;
  rgb: string;
  usage: string;
  textColor?: string;
}

export const ColorCard: React.FC<ColorCardProps> = ({ name, hex, rgb, usage, textColor = "text-white" }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white flex flex-col h-full"
    >
      <div 
        className="h-32 w-full flex items-end p-4"
        style={{ backgroundColor: hex }}
      >
        <span className={`font-mono text-sm opacity-80 ${textColor}`}>{hex}</span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h4 className="font-bold text-navy-900 mb-1">{name}</h4>
        <p className="text-xs font-mono text-gray-500 mb-3">{rgb}</p>
        <p className="text-sm text-gray-600 mt-auto">{usage}</p>
      </div>
    </motion.div>
  );
};
