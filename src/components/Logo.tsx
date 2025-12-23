
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "text-accent", size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fundo Preto (Opcional, mas garante contraste se usado fora do app) */}
      <circle cx="50" cy="50" r="50" fill="transparent" />

      {/* Padrão Geométrico 'Espirógrafo' - Neon Blue Lines - Aumentado levemente */}
      <g stroke="currentColor" strokeWidth="0.8" opacity="0.9" transform="scale(1.1) translate(-4.5, -4.5)">
        <ellipse cx="50" cy="50" rx="48" ry="20" transform="rotate(0 50 50)" />
        <ellipse cx="50" cy="50" rx="48" ry="20" transform="rotate(20 50 50)" />
        <ellipse cx="50" cy="50" rx="48" ry="20" transform="rotate(40 50 50)" />
        <ellipse cx="50" cy="50" rx="48" ry="20" transform="rotate(60 50 50)" />
        <ellipse cx="50" cy="50" rx="48" ry="20" transform="rotate(80 50 50)" />
        <ellipse cx="50" cy="50" rx="48" ry="20" transform="rotate(100 50 50)" />
        <ellipse cx="50" cy="50" rx="48" ry="20" transform="rotate(120 50 50)" />
        <ellipse cx="50" cy="50" rx="48" ry="20" transform="rotate(140 50 50)" />
        <ellipse cx="50" cy="50" rx="48" ry="20" transform="rotate(160 50 50)" />
      </g>

      {/* Círculo Externo */}
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1.5" strokeOpacity="1" />

      {/* Elementos Centrais */}
      <g transform="translate(15, 20) scale(0.6)">
         {/* Divisor Vertical */}
         <line x1="55" y1="10" x2="55" y2="90" stroke="currentColor" strokeWidth="2" />
         
         {/* Gráfico de Barras (Esquerda) */}
         <rect x="15" y="55" width="8" height="30" fill="currentColor" />
         <rect x="27" y="40" width="8" height="45" fill="currentColor" />
         <rect x="39" y="25" width="8" height="60" fill="currentColor" />
         
         {/* Seta de Tendência */}
         <path d="M15 50 L43 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
         <path d="M43 20 L43 30 M43 20 L33 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

         {/* Texto SPFP (Direita) - Serifado e Ajustado */}
         <text x="65" y="65" fontFamily="serif" fontSize="32" fontWeight="bold" fill="currentColor" textAnchor="middle">SPFP</text>
      </g>
    </svg>
  );
};
