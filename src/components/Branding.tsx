/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Sparkles,
  User,
  Settings,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Bell,
  Download,
  ExternalLink,
  Palette,
  Type,
  MessageSquare
} from 'lucide-react';
import { Section } from './brand-guidelines/Section';
import { ColorCard } from './brand-guidelines/ColorCard';
import { FinnAvatar } from './brand-guidelines/AnimatedFinnAvatar';
import { Logo } from './brand-guidelines/AnimatedLogo';

export const Branding = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-200 text-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl z-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo showText={true} />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#strategy" className="hover:text-blue-600 transition-colors">Estratégia</a>
            <a href="#finn" className="hover:text-blue-600 transition-colors">Finn</a>
            <a href="#visual" className="hover:text-blue-600 transition-colors">Visual</a>
            <a href="#voice" className="hover:text-blue-600 transition-colors">Voz</a>
          </div>

          <button className="bg-navy-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-navy-700 hover:scale-105 hover:shadow-xl hover:shadow-navy-900/30 transition-all duration-300 shadow-lg shadow-navy-900/20 flex items-center gap-2 active:scale-95">
            <Download size={16} />
            <span className="hidden sm:inline">Baixar Brand Kit</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-wider mb-8 border border-blue-100">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  BRAND GUIDELINES V1.0
                </div>

                <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.1] mb-8 text-navy-900 tracking-tight">
                  Seu dinheiro, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">finalmente</span> com sentido.
                </h1>

                <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-lg">
                  O guia oficial da marca SPFP. Estratégia, identidade visual e a personalidade do Finn — o único planejador financeiro que pensa com você.
                </p>

                <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-500 border-t border-slate-200 pt-8">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">PS</div>
                    Paula Scher (Visual)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">AH</div>
                    Ann Handley (Voz)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">MN</div>
                    Marty Neumeier (Strategy)
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Visual Showcase */}
            <div className="flex-1 w-full flex justify-center lg:justify-end">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="relative w-full max-w-md aspect-square bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-slate-100 p-12 flex items-center justify-center overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-teal-50/50 opacity-50" />
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Logo showText={false} className="scale-[5]" />
                </div>

                <div className="relative z-10 text-center">
                  <div className="mb-8 transform scale-150 origin-center">
                    <Logo showText={false} />
                  </div>
                  <h2 className="text-3xl font-bold text-navy-900 mb-2">SPFP</h2>
                  <p className="text-slate-500 font-medium">Seu Planejador Financeiro Pessoal</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Strategy Section - Bento Grid */}
      <Section
        id="strategy"
        title="Identidade Estratégica"
        subtitle="Posicionamento: O único planejador financeiro pessoal que pensa com você — não por você."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Value Prop */}
          <div className="md:col-span-2 bg-navy-900 rounded-2xl p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/30 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Sparkles className="text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Espírito da Marca</h3>
              <p className="text-blue-100 text-lg leading-relaxed max-w-md">
                "Cada brasileiro realizando seus sonhos com consciência financeira."
              </p>
            </div>
          </div>

          {/* Tagline */}
          <div className="bg-blue-500 rounded-2xl p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600" />
            <div className="relative z-10">
              <h3 className="text-sm font-bold uppercase tracking-wider opacity-80 mb-8">Tagline</h3>
              <p className="text-3xl font-display font-bold leading-tight">
                "Seu dinheiro, finalmente com sentido."
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm md:col-span-1">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-6 text-teal-600">
              <Target size={20} />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-4">Valores Nucleares</h3>
            <ul className="space-y-3">
              {['Clareza', 'Controle', 'Confiança', 'Ambição com método'].map((val, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  {val}
                </li>
              ))}
            </ul>
          </div>

          {/* Attributes */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600">
                <LayoutDashboard size={20} />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Atributos de Produto</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Plataforma Completa", icon: <LayoutDashboard size={16} /> },
                { label: "Finn (AI Advisor)", icon: <Sparkles size={16} /> },
                { label: "Interface Clara", icon: <Type size={16} /> },
                { label: "Segurança Total", icon: <CheckCircle2 size={16} /> },
              ].map((attr, i) => (
                <div key={i} className="group p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-3 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 cursor-default">
                  <div className="text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300 origin-left w-fit">
                    {attr.icon}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-navy-900 transition-colors">{attr.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Finn Character Section */}
      <Section
        id="finn"
        title="Finn — O Personagem"
        subtitle="AI Advisor + Parceiro. Inspirado em um consultor financeiro que é amigo."
        className="bg-white"
      >
        <div className="flex flex-col xl:flex-row gap-16 items-center">
          {/* Avatar Showcase */}
          <div className="flex-1 flex justify-center gap-8 md:gap-16">
            <div className="relative group">
              <div className="absolute -inset-4 bg-blue-100 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <FinnAvatar mode="advisor" />
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-teal-100 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <FinnAvatar mode="partner" />
            </div>
          </div>

          {/* Specs */}
          <div className="flex-1 w-full grid gap-6">
            <div className="p-6 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500 text-white rounded-lg">
                  <TrendingUp size={18} />
                </div>
                <h3 className="font-bold text-navy-900">Finn Advisor (Modo Análise)</h3>
              </div>
              <p className="text-slate-600 text-sm mb-4">Ativa quando há dados preocupantes, análises mensais ou projeções.</p>
              <div className="flex flex-wrap gap-2">
                {['Direto', 'Baseado em dados', 'Respeitoso'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded-md uppercase tracking-wide">{tag}</span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-teal-100 bg-teal-50/50 hover:bg-teal-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-teal-500 text-white rounded-lg">
                  <MessageSquare size={18} />
                </div>
                <h3 className="font-bold text-navy-900">Finn Parceiro (Modo Suporte)</h3>
              </div>
              <p className="text-slate-600 text-sm mb-4">Ativa em conquistas de metas, onboarding e momentos de progresso.</p>
              <div className="flex flex-wrap gap-2">
                {['Caloroso', 'Genuíno', 'Encorajador'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-white border border-teal-200 text-teal-700 text-xs font-bold rounded-md uppercase tracking-wide">{tag}</span>
                ))}
              </div>
            </div>

            <div className="mt-4 p-4 border-l-4 border-navy-900 bg-slate-50 rounded-r-xl">
              <p className="text-navy-900 font-medium italic">"Regra de Ouro: Finn nunca culpa. Finn nunca ignora. Finn nunca exagera."</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Visual System Section */}
      <Section id="visual" title="Sistema Visual" subtitle="Direção 'Journey': Seta de traço único que forma implicitamente um 'F'.">

        {/* Logo Construction */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2 bg-slate-100 rounded-lg"><Palette size={20} className="text-slate-600" /></div>
            <h3 className="text-2xl font-bold text-navy-900">Logo System</h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-12 rounded-3xl border border-slate-200 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
              <div className="relative z-10 transform scale-150">
                <Logo />
              </div>
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Grid de Construção</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-4">
                <Logo showText={false} />
                <span className="text-xs font-bold text-slate-400 uppercase">Símbolo Isolado</span>
              </div>
              <div className="bg-navy-900 p-8 rounded-2xl border border-navy-800 flex flex-col items-center justify-center gap-4">
                <Logo showText={false} variant="white" />
                <span className="text-xs font-bold text-slate-500 uppercase">Invertido</span>
              </div>
              <div className="col-span-2 bg-white p-8 rounded-2xl border border-slate-200 flex items-center justify-center">
                <Logo variant="monochrome" />
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-navy-900 mb-8">Paleta de Cores</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <ColorCard name="Navy 900" hex="#0A1628" rgb="10, 22, 40" usage="Fundo escuro, headers" />
            <ColorCard name="Navy 700" hex="#1B3A6B" rgb="27, 58, 107" usage="Cor Principal da Marca" />
            <ColorCard name="Blue 500" hex="#1E6FE8" rgb="30, 111, 232" usage="CTAs, links, ações" />
            <ColorCard name="Teal 500" hex="#00C2A0" rgb="0, 194, 160" usage="Finn Parceiro, sucesso" />
            <ColorCard name="Gray 100" hex="#F3F4F6" rgb="243, 244, 246" usage="Backgrounds" textColor="text-gray-500" />
          </div>
        </div>

        {/* Typography */}
        <div>
          <h3 className="text-2xl font-bold text-navy-900 mb-8">Tipografia</h3>
          <div className="bg-white p-10 rounded-3xl border border-slate-200 grid md:grid-cols-2 gap-16">
            <div className="space-y-12">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display Font</span>
                  <span className="text-xs font-mono text-slate-400">Google Fonts</span>
                </div>
                <h4 className="text-6xl font-display font-bold text-navy-900 mb-2">Sora</h4>
                <p className="text-slate-500">Uso restrito a headlines de campanha (Bold 800)</p>
                <div className="flex gap-2 mt-4">
                  <span className="w-8 h-8 rounded bg-navy-900 text-white flex items-center justify-center font-display font-bold">Aa</span>
                  <span className="w-8 h-8 rounded bg-slate-100 text-navy-900 flex items-center justify-center font-display font-bold">12</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interface Font</span>
                  <span className="text-xs font-mono text-slate-400">Google Fonts</span>
                </div>
                <h4 className="text-6xl font-sans font-bold text-navy-900 mb-2">Plus Jakarta</h4>
                <p className="text-slate-500">Interface, textos, títulos (400—800)</p>
                <div className="flex gap-2 mt-4">
                  <span className="w-8 h-8 rounded bg-navy-900 text-white flex items-center justify-center font-sans font-bold">Aa</span>
                  <span className="w-8 h-8 rounded bg-slate-100 text-navy-900 flex items-center justify-center font-sans font-bold">12</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400">Display / 56px</span>
                <p className="font-display font-bold text-4xl md:text-5xl text-navy-900 leading-[1.1]">
                  Seu dinheiro com sentido.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400">H1 / 48px</span>
                <p className="font-sans font-extrabold text-3xl md:text-4xl text-navy-900">
                  Planejamento Inteligente
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400">H2 / 36px</span>
                <p className="font-sans font-bold text-2xl md:text-3xl text-navy-900">
                  Metas e Objetivos
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400">Body / 16px</span>
                <p className="font-sans text-base text-slate-600 leading-relaxed max-w-md">
                  O Finn analisa seus gastos e sugere ajustes automáticos para que você atinja seus objetivos sem abrir mão do que importa hoje.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Voice Section */}
      <Section id="voice" title="Brand Voice" subtitle="Claro, Humano, Encorajador e Confiável." className="bg-navy-900" dark>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-navy-800/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
              <h4 className="text-teal-400 font-bold mb-6 text-lg flex items-center gap-2">
                <CheckCircle2 size={20} /> O que somos
              </h4>
              <ul className="space-y-4">
                {[
                  { t: "Direto, sem jargão", d: "Falamos a língua do usuário, não do banco." },
                  { t: "Caloroso e próximo", d: "Somos parceiros, não juízes." },
                  { t: "Positivo sem ser falso", d: "Celebramos vitórias reais." },
                  { t: "Preciso e consistente", d: "Dados corretos geram confiança." }
                ].map((item, i) => (
                  <li key={i} className="flex flex-col gap-1">
                    <span className="text-white font-bold">{item.t}</span>
                    <span className="text-slate-400 text-sm">{item.d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl border border-blue-500/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10">
                <div className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-4">Exemplo de Tagline</div>
                <p className="text-3xl font-display font-bold text-white leading-tight">
                  "Seu dinheiro, finalmente com sentido."
                </p>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl border border-teal-500/50 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 p-32 bg-white/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
              <div className="relative z-10">
                <div className="text-xs font-bold text-teal-200 uppercase tracking-wider mb-4">Landing Headline</div>
                <p className="text-2xl font-display font-bold text-white leading-tight">
                  "Conheça o Finn. Seu planejador financeiro pessoal — que pensa com você."
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo />
          <div className="text-sm text-slate-500 font-medium">
            © 2026 SPFP Squad Branding. Confidential Internal Document.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><ExternalLink size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

