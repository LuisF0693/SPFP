
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({
  className = "text-accent",
  size = 40,
  showText = false,
  variant = 'icon'
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Padrão Geométrico 'Espirógrafo' - Blue Lines */}
        <g stroke="currentColor" strokeWidth="0.6" opacity="0.8">
          {[...Array(18)].map((_, i) => (
            <ellipse
              key={i}
              cx="50"
              cy="50"
              rx="49"
              ry="22"
              transform={`rotate(${i * 10} 50 50)`}
            />
          ))}
        </g>

        {/* Círculo Externo Duplo Sutil */}
        <circle cx="50" cy="50" r="49.5" stroke="currentColor" strokeWidth="0.2" opacity="0.3" />
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1" />

        {/* Elementos Centrais */}
        <g transform="translate(20, 25) scale(0.6)">
          {/* Divisor Vertical */}
          <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="2" />

          {/* Gráfico de Barras (Esquerda) */}
          <g fill="currentColor">
            <rect x="5" y="60" width="10" height="30" rx="1" />
            <rect x="20" y="45" width="10" height="45" rx="1" />
            <rect x="35" y="30" width="10" height="60" rx="1" />
          </g>

          {/* Seta de Tendência */}
          <path
            d="M5 55 C 15 45, 35 35, 45 20"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M38 20 L45 20 L45 27"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Texto LF (Direita) - Serifado */}
          <text
            x="75"
            y="65"
            fontFamily="serif"
            fontSize="42"
            fontWeight="normal"
            fill="currentColor"
            textAnchor="middle"
          >
            LF
          </text>
        </g>
      </svg>

      {variant === 'full' && (
        <div className="mt-4 flex flex-col items-center">
          <span
            className="text-white font-serif font-bold tracking-[0.2em]"
            style={{ fontSize: size * 1.5 }}
          >
            SPFP
          </span>
          <div className="w-full h-[1px] bg-blue-900/50 my-2" />
          <span
            className="text-blue-400 font-serif tracking-[0.3em] uppercase opacity-80"
            style={{ fontSize: size * 0.35 }}
          >
            Planejador Financeiro Pessoal
          </span>
        </div>
      )}

      {showText && variant === 'icon' && (
        <span className="mt-2 font-serif font-bold tracking-widest text-white">SPFP</span>
      )}
    </div>
  );
};
