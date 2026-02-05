/**
 * CreditCardDisplay Component
 * FASE 1: STY-061 (Credit Card Visual - Realistic Card Design)
 *
 * Displays a realistic 3D credit card with:
 * - Cardholder name
 * - Last 4 digits (masked by default)
 * - Expiration date
 * - Bank gradient colors
 * - Reveal/blur animation on click
 */

import React, { useState, useMemo } from 'react';
import { Account } from '../types';
import { BankLogo } from './BankLogo';
import { Eye, EyeOff } from 'lucide-react';

interface CreditCardDisplayProps {
  account: Account;
  holderName?: string;
  cardNumber?: string;
}

// Bank color schemes (gradient left to right)
const BANK_GRADIENTS: Record<string, { from: string; via: string; to: string }> = {
  nubank: { from: '#7C3AED', via: '#A855F7', to: '#E879F9' },
  itau: { from: '#00A0DF', via: '#0087B7', to: '#004C97' },
  bradesco: { from: '#00985E', via: '#008C6B', to: '#005C3C' },
  caixa: { from: '#003DA5', via: '#0052CC', to: '#0066FF' },
  santander: { from: '#EC1C24', via: '#CC0000', to: '#990000' },
  'banco do brasil': { from: '#FFD500', via: '#FFB600', to: '#FF9500' },
  inter: { from: '#FF6B00', via: '#FF8C00', to: '#FFA500' },
  c6: { from: '#1A1A1A', via: '#2D2D2D', to: '#404040' },
  default: { from: '#1E3A8A', via: '#1E40AF', to: '#1E3A8A' }
};

const detectBank = (accountName: string): keyof typeof BANK_GRADIENTS => {
  const name = accountName.toLowerCase();
  if (name.includes('nubank')) return 'nubank';
  if (name.includes('itau')) return 'itau';
  if (name.includes('bradesco')) return 'bradesco';
  if (name.includes('caixa')) return 'caixa';
  if (name.includes('santander')) return 'santander';
  if (name.includes('brasil')) return 'banco do brasil';
  if (name.includes('inter')) return 'inter';
  if (name.includes('c6')) return 'c6';
  return 'default';
};

const formatCardNumber = (number: string): string => {
  const digits = number.replace(/\D/g, '');
  return digits.slice(-4).padStart(digits.length, '*');
};

const formatExpirationDate = (expirationDate: string | undefined): string => {
  if (!expirationDate) return '12/25';
  try {
    const [month, year] = expirationDate.split('/');
    return `${String(month || '12').padStart(2, '0')}/${String(year || '25').slice(-2)}`;
  } catch {
    return '12/25';
  }
};

export const CreditCardDisplay: React.FC<CreditCardDisplayProps> = ({
  account,
  holderName = 'NOME DO TITULAR',
  cardNumber = '4532123456789010'
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const bankKey = useMemo(() => detectBank(account.name), [account.name]);
  const colors = BANK_GRADIENTS[bankKey];
  const displayCardNumber = useMemo(
    () => isRevealed ? cardNumber : formatCardNumber(cardNumber),
    [isRevealed, cardNumber]
  );
  const expirationDate = useMemo(
    () => formatExpirationDate(account.expirationDate),
    [account.expirationDate]
  );

  return (
    <div className="perspective">
      <style>{`
        .card-3d-container {
          perspective: 1000px;
        }
        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .card-3d.hovered {
          transform: rotateY(5deg) rotateX(2deg) scale(1.02);
        }
        .card-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 20%,
            rgba(255, 255, 255, 0.1) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .card-chip {
          position: relative;
          width: 50px;
          height: 40px;
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          border-radius: 4px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .card-chip::before {
          content: '';
          position: absolute;
          inset: 4px;
          background: linear-gradient(45deg, #FFE55C 0%, #FFD700 50%, #FFA500 100%);
          border-radius: 2px;
        }
      `}</style>

      <div
        className="card-3d-container w-full max-w-md mx-auto"
        onMouseEnter={(e) => {
          e.currentTarget.querySelector('.card-3d')?.classList.add('hovered');
        }}
        onMouseLeave={(e) => {
          e.currentTarget.querySelector('.card-3d')?.classList.remove('hovered');
        }}
      >
        {/* Card Container */}
        <div className="card-3d">
          <button
            onClick={() => setIsRevealed(!isRevealed)}
            className={`
              w-full aspect-video rounded-2xl shadow-2xl overflow-hidden
              transition-all duration-300 relative group cursor-pointer
              hover:shadow-3xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            `}
            style={{
              background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.via} 50%, ${colors.to} 100%)`
            }}
          >
            {/* Shine Effect */}
            <div className="card-shine" />

            {/* Card Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
              {/* Top Section */}
              <div className="flex justify-between items-start">
                {/* Bank Logo */}
                <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm p-2 flex items-center justify-center">
                  <BankLogo name={account.name} type="CREDIT_CARD" size={32} />
                </div>

                {/* Chip */}
                <div className="card-chip" />
              </div>

              {/* Middle Section - Card Number */}
              <div className="space-y-2">
                <div className="text-xs font-semibold opacity-70 tracking-widest">CARD NUMBER</div>
                <div
                  className={`
                    text-xl font-mono font-bold tracking-widest
                    transition-all duration-300
                    ${isRevealed ? 'opacity-100 blur-0' : 'opacity-75 blur-sm'}
                  `}
                >
                  {displayCardNumber}
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold opacity-70 uppercase tracking-widest">
                    Cardholder
                  </div>
                  <div className="text-sm font-semibold tracking-wide uppercase max-w-[200px] truncate">
                    {holderName.slice(0, 22)}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-[10px] font-semibold opacity-70 uppercase tracking-widest">
                    Expiry
                  </div>
                  <div className="text-sm font-semibold font-mono tracking-wider">
                    {expirationDate}
                  </div>
                </div>
              </div>

              {/* Reveal Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRevealed(!isRevealed);
                }}
                className={`
                  absolute top-4 right-4 p-2 rounded-lg
                  bg-white/10 hover:bg-white/20 backdrop-blur-sm
                  transition-all opacity-0 group-hover:opacity-100
                  focus:outline-none focus:ring-2 focus:ring-white/50
                `}
                title={isRevealed ? 'Ocultar número' : 'Revelar número'}
                aria-label={isRevealed ? 'Ocultar número' : 'Revelar número'}
              >
                {isRevealed ? (
                  <EyeOff size={16} className="text-white" />
                ) : (
                  <Eye size={16} className="text-white" />
                )}
              </button>
            </div>
          </button>
        </div>

        {/* Responsive Info Text */}
        <div className="mt-4 text-center text-sm text-gray-400">
          <p className="text-xs opacity-60">
            {isRevealed ? 'Clique para ocultar o número' : 'Clique para revelar o número'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreditCardDisplay;
