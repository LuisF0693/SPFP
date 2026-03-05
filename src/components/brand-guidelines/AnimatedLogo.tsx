import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white' | 'monochrome';
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true, variant = 'default' }) => {
  const primaryColor = variant === 'white' ? '#FFFFFF' : variant === 'monochrome' ? '#000000' : '#1E6FE8'; // Blue-500
  const textColor = variant === 'white' ? '#FFFFFF' : '#0A1628'; // Navy-900
  const subTextColor = variant === 'white' ? 'rgba(255,255,255,0.7)' : '#374151'; // Gray-700

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Curve "F" Stem and Top Bar */}
          <path 
            d="M25 80 C 45 80, 35 60, 35 50 V 45 C 35 25, 55 25, 75 20" 
            stroke={primaryColor} 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          {/* Arrow Head */}
          <path 
            d="M65 20 L 75 20 L 72 28" 
            stroke={primaryColor} 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          {/* Middle Bar */}
          <path 
            d="M35 50 H 60" 
            stroke={primaryColor} 
            strokeWidth="8" 
            strokeLinecap="round" 
          />
          
          {/* 15 degrees text */}
          <text x="80" y="15" fontFamily="sans-serif" fontSize="10" fontWeight="bold" fill={primaryColor}>15°</text>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center">
          <span className="font-sans font-bold text-2xl leading-none tracking-tight" style={{ color: textColor }}>SPFP</span>
          <span className="font-sans text-[10px] uppercase tracking-wider font-medium mt-1" style={{ color: subTextColor }}>
            Seu Planejador Financeiro Pessoal
          </span>
        </div>
      )}
    </div>
  );
};
