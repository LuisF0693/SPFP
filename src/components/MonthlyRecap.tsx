import React, { useState, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, Target, Wallet,
    X, ChevronRight, ChevronLeft, Sparkles,
    Trophy, ArrowUpRight, ArrowDownRight,
    PieChart, Star, Zap
} from 'lucide-react';
import { formatCurrency } from '../utils';

interface MonthlyRecapProps {
    data: {
        userName: string;
        month: string;
        income: number;
        expense: number;
        savingsRate: number;
        topCategory: { name: string; spent: number };
        bestSavingCategory?: { name: string; saving: number };
        goalsReached: number;
        investmentGrowth: number;
    };
    onClose: () => void;
}

export const MonthlyRecap: React.FC<MonthlyRecapProps> = ({ data, onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = useMemo(() => [
        {
            id: 'welcome',
            title: 'Sua Retrospectiva Premium',
            subtitle: `${data.month} em revista`,
            content: (
                <div className="text-center space-y-6">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-30 animate-pulse"></div>
                        <div className="relative bg-white/10 p-10 rounded-[3rem] border border-white/20 backdrop-blur-xl">
                            <Sparkles size={80} className="text-blue-400 animate-glow" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-serif font-black text-white">Parabéns, {data.userName}!</h2>
                        <p className="text-xl text-blue-200 opacity-80">Vamos ver o que você conquistou este mês.</p>
                    </div>
                </div>
            ),
            bg: 'from-slate-950 via-blue-950 to-slate-950'
        },
        {
            id: 'cashflow',
            title: 'Fluxo de Caixa',
            content: (
                <div className="space-y-12 w-full max-w-sm">
                    <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <span className="text-emerald-400 font-bold flex items-center gap-2"><ArrowUpRight size={20} /> Entradas</span>
                            <span className="text-2xl font-black text-white">{formatCurrency(data.income)}</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <span className="text-blue-400 font-bold flex items-center gap-2"><ArrowDownRight size={20} /> Saídas</span>
                            <span className="text-2xl font-black text-white">{formatCurrency(data.expense)}</span>
                        </div>
                    </div>
                    <div className="p-8 glass rounded-[2rem] text-center border-emerald-500/20">
                        <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Taxa de Poupança</p>
                        <h3 className="text-5xl font-black text-emerald-400">{data.savingsRate.toFixed(1)}%</h3>
                        <p className="text-xs text-emerald-500/60 mt-2 font-bold">Excelente aproveitamento!</p>
                    </div>
                </div>
            ),
            bg: 'from-slate-950 via-emerald-950/30 to-slate-950'
        },
        {
            id: 'savings',
            title: 'Onde você brilhou',
            content: (
                <div className="text-center space-y-8">
                    <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                        <Trophy size={40} className="text-amber-500" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-white leading-tight">
                            Economia Master em <br />
                            <span className="text-amber-400 text-4xl">{data.bestSavingCategory?.name || 'Geral'}</span>
                        </h3>
                        <p className="text-lg text-gray-400">
                            Você poupou <span className="text-white font-bold">{formatCurrency(data.bestSavingCategory?.saving || 0)}</span> comparado ao planejado!
                        </p>
                    </div>
                </div>
            ),
            bg: 'from-slate-950 via-amber-950/20 to-slate-950'
        },
        {
            id: 'goals',
            title: 'Rumo ao Topo',
            content: (
                <div className="text-center space-y-8">
                    <div className="relative">
                        <Target size={120} className="text-blue-500 opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        <div className="text-7xl font-black text-white relative">{data.goalsReached}</div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold text-white">Marcos alcançados</h3>
                        <p className="text-gray-400">Você está cada vez mais perto da sua liberdade financeira.</p>
                    </div>
                    <div className="flex gap-2 justify-center">
                        {[1, 2, 3].map(i => <Star key={i} className={`text-blue-500 ${i <= data.goalsReached ? 'fill-blue-500' : 'opacity-20'}`} />)}
                    </div>
                </div>
            ),
            bg: 'from-slate-950 via-indigo-950/30 to-slate-950'
        },
        {
            id: 'finish',
            title: 'Pronto para o próximo?',
            content: (
                <div className="text-center space-y-8">
                    <Zap size={80} className="text-blue-400 mx-auto animate-pulse" />
                    <div className="space-y-4">
                        <h3 className="text-3xl font-serif font-bold text-white">Mantenha o Fôlego!</h3>
                        <p className="text-gray-400 max-w-xs mx-auto">Sua disciplina este mês foi o motor do seu crescimento patrimonial.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-2xl transition-all active:scale-95"
                    >
                        Fechar Retrospectiva
                    </button>
                </div>
            ),
            bg: 'from-slate-950 to-blue-900/40'
        }
    ], [data, onClose]);

    const next = () => currentSlide < slides.length - 1 && setCurrentSlide(s => s + 1);
    const prev = () => currentSlide > 0 && setCurrentSlide(s => s - 1);

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b ${slides[currentSlide].bg} transition-all duration-1000 animate-fade-in`}>
            {/* Progress Bars */}
            <div className="absolute top-8 left-4 right-4 flex gap-2 z-20">
                {slides.map((_, i) => (
                    <div key={i} className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-blue-500 transition-all duration-300 ${i === currentSlide ? 'w-full' : i < currentSlide ? 'w-full' : 'w-0'}`}
                        ></div>
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-16 left-0 right-0 px-8 flex justify-between items-center z-20">
                <h1 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">{slides[currentSlide].title}</h1>
                <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Slide Content */}
            <div className="relative w-full h-full flex items-center justify-center p-8">
                <div key={currentSlide} className="animate-slide-up w-full flex items-center justify-center">
                    {slides[currentSlide].content}
                </div>

                {/* Navigation Overlay (Invisible areas) */}
                <div className="absolute inset-0 flex">
                    <div className="w-1/3 h-full cursor-pointer" onClick={prev}></div>
                    <div className="w-2/3 h-full cursor-pointer" onClick={next}></div>
                </div>
            </div>

            {/* Navigation Indicators */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-10 z-20">
                <button
                    onClick={prev}
                    disabled={currentSlide === 0}
                    className={`p-4 rounded-full glass border border-white/10 transition-all ${currentSlide === 0 ? 'opacity-0' : 'hover:bg-white/10'}`}
                >
                    <ChevronLeft size={24} className="text-white" />
                </button>
                <button
                    onClick={next}
                    disabled={currentSlide === slides.length - 1}
                    className={`p-4 rounded-full glass border border-white/10 transition-all ${currentSlide === slides.length - 1 ? 'opacity-0' : 'hover:bg-white/10'}`}
                >
                    <ChevronRight size={24} className="text-white" />
                </button>
            </div>

            {/* Watermark */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-20">
                <span className="text-[10px] font-bold tracking-widest text-white uppercase italic">SPFP Premium Experience</span>
            </div>
        </div>
    );
};
