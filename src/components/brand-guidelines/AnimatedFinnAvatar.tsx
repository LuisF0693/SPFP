import { motion } from 'framer-motion';
import { Heart, TrendingUp } from 'lucide-react';

interface FinnAvatarProps {
  mode: 'advisor' | 'partner';
  size?: number;
}

export const FinnAvatar: React.FC<FinnAvatarProps> = ({ mode, size = 200 }) => {
  const isAdvisor = mode === 'advisor';

  // Colors
  const borderColor = isAdvisor ? '#1E6FE8' : '#00C2A0'; // Blue-500 vs Teal-500
  const gradientStart = isAdvisor ? '#0A1628' : '#1B3A6B'; // Navy-900 vs Navy-700
  const gradientEnd = isAdvisor ? '#1B3A6B' : '#009688'; // Blue-700 vs Teal-600 (approx)

  // Animation variants
  const containerVariants = {
    advisor: { scale: [1, 1.03, 1], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const } },
    partner: { y: [0, -5, 0], transition: { duration: 2, repeat: Infinity, ease: "easeOut" as const } } // Slower bounce for demo
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={isAdvisor ? containerVariants.advisor : containerVariants.partner}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `4px solid ${borderColor}`,
          background: `radial-gradient(circle at center, ${gradientEnd}, ${gradientStart})`,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Eyes */}
        <div className="absolute top-[35%] flex gap-8">
          <div className="w-4 h-4 bg-white rounded-full" />
          <div className="w-4 h-4 bg-white rounded-full" />
        </div>

        {/* Eyebrows */}
        <div className="absolute top-[28%] flex gap-8">
          {isAdvisor ? (
            <>
              {/* Focused/Concentrated eyebrows */}
              <div
                className="w-6 h-[3px] bg-white opacity-90"
                style={{ transform: 'rotate(-5deg)' }}
              />
              <div
                className="w-6 h-[3px] bg-white opacity-90"
                style={{ transform: 'rotate(5deg)' }}
              />
            </>
          ) : (
            <>
              {/* Open/Welcoming eyebrows */}
              <div
                className="w-6 h-[3px] bg-white opacity-90"
                style={{ transform: 'translateY(-4px)' }}
              />
              <div
                className="w-6 h-[3px] bg-white opacity-90"
                style={{ transform: 'translateY(-4px)' }}
              />
            </>
          )}
        </div>

        {/* Mouth */}
        <div className="absolute top-[60%]">
          {isAdvisor ? (
            // Neutral line
            <div className="w-8 h-[3px] bg-white opacity-90 rounded-full" />
          ) : (
            // Smile
            <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
              <path d="M2 2C8 8 24 8 30 2" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* Detail Icon */}
        <div className="absolute bottom-[15%] right-[15%] opacity-60">
          {isAdvisor ? (
            <TrendingUp size={24} color="white" strokeWidth={3} />
          ) : (
            <Heart size={24} color="#99F6E4" strokeWidth={3} fill="#99F6E4" />
          )}
        </div>
      </motion.div>

      <div className="text-center">
        <h3 className="font-bold text-xl text-navy-900">Finn {isAdvisor ? 'Advisor' : 'Parceiro'}</h3>
        <p className="text-sm text-gray-500">{isAdvisor ? 'Modo Análise' : 'Modo Suporte'}</p>
      </div>
    </div>
  );
};
