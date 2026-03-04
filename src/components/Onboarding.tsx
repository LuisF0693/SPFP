import React, { useState } from 'react';
import { FinnAvatar } from './FinnAvatar';
import { ArrowRight, X } from 'lucide-react';

interface OnboardingProps {
  userName?: string;
  onComplete: () => void;
}

interface Screen {
  id: number;
  finnMode: 'advisor' | 'partner';
  badge?: string;
  headline: string;
  body: string;
  accent?: string;
}

const SCREENS: Screen[] = [
  {
    id: 1,
    finnMode: 'partner',
    badge: '👋 Bem-vindo',
    headline: 'Olá! Eu sou o Finn.',
    body: 'Seu assistente financeiro pessoal. Estou aqui para te ajudar a enxergar sua vida financeira com clareza — e tomar decisões com confiança.',
    accent: '#00C2A0',
  },
  {
    id: 2,
    finnMode: 'advisor',
    badge: '📊 O App',
    headline: 'Tudo em um só lugar.',
    body: 'Contas, transações, metas, investimentos e patrimônio. Você nunca mais vai perder o controle. Tudo organizado, claro e seguro.',
    accent: '#1B85E3',
  },
  {
    id: 3,
    finnMode: 'advisor',
    badge: '🤝 A Consultoria',
    headline: 'A consultoria do Luis.',
    body: 'Além do app, você tem acesso à consultoria especializada do Luis — sessões estratégicas para construir seu planejamento do zero, com visão humana que nenhuma IA substitui.',
    accent: '#1B85E3',
  },
  {
    id: 4,
    finnMode: 'advisor',
    badge: '🤖 Finn 24h',
    headline: 'A inteligência do Finn.',
    body: 'Entre as sessões, eu monitoro seus dados, identifico padrões e te aviso quando algo merece atenção — em português claro, sem jargão financeiro.',
    accent: '#1B85E3',
  },
  {
    id: 5,
    finnMode: 'partner',
    badge: '🚀 Vamos lá',
    headline: 'Pronto para começar?',
    body: 'Adicione sua primeira conta e a gente começa a trabalhar juntos. Qualquer dúvida, é só me chamar na aba Finn.',
    accent: '#00C2A0',
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({ userName, onComplete }) => {
  const [current, setCurrent] = useState(0);

  const screen = SCREENS[current];
  const isLast = current === SCREENS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrent((c) => c + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-md bg-[#0A1628] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
        {/* Skip */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-colors z-10"
          aria-label="Pular onboarding"
        >
          <X size={16} />
        </button>

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-1 transition-all duration-500 ease-out rounded-full"
            style={{
              width: `${((current + 1) / SCREENS.length) * 100}%`,
              background: screen.finnMode === 'partner' ? '#00C2A0' : '#1B85E3',
            }}
          />
        </div>

        {/* Content */}
        <div className="px-8 pt-10 pb-8 text-center">
          {/* Finn Avatar */}
          <div className="flex justify-center mb-6">
            <FinnAvatar
              mode={screen.finnMode}
              size="xl"
              showLabel={true}
            />
          </div>

          {/* Badge */}
          {screen.badge && (
            <div
              className="inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border"
              style={{
                color: screen.accent,
                borderColor: `${screen.accent}30`,
                background: `${screen.accent}10`,
              }}
            >
              {screen.badge}
            </div>
          )}

          {/* Headline */}
          <h2 className="text-2xl font-extrabold text-white mb-3 leading-tight">
            {screen.id === 1 && userName
              ? `Olá, ${userName.split(' ')[0]}! Eu sou o Finn.`
              : screen.headline}
          </h2>

          {/* Body */}
          <p className="text-gray-400 text-sm leading-relaxed font-light mb-8">
            {screen.body}
          </p>

          {/* CTA Button */}
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold tracking-wide transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-xl"
            style={{
              background: screen.accent,
              boxShadow: `0 8px 32px ${screen.accent}40`,
              color: screen.finnMode === 'partner' ? '#0A1628' : '#ffffff',
            }}
          >
            <span>{isLast ? 'Começar agora' : 'Continuar'}</span>
            <ArrowRight size={18} />
          </button>

          {/* Step dots */}
          <div className="flex justify-center gap-2 mt-6">
            {SCREENS.map((_, i) => (
              <div
                key={i}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === current ? 20 : 6,
                  height: 6,
                  background: i === current ? screen.accent : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
