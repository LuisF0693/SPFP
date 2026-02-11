import React from 'react';
import { Logo } from '../Logo';

const Loading: React.FC<{ message?: string; subMessage?: string }> = ({
    message = "CARREGANDO",
    subMessage = "Preparando sua experiência..."
}) => {
    return (
        <div
            className="h-screen w-full flex items-center justify-center bg-black text-white"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Carregando"
        >
            <div className="flex flex-col items-center">
                {/* Logo animada */}
                <div className="mb-8 animate-pulse">
                    <Logo size={80} variant="icon" />
                </div>

                {/* Spinner */}
                <div
                    className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"
                    aria-hidden="true"
                ></div>

                {/* Texto */}
                <p className="text-lg font-bold tracking-[0.3em] text-blue-400 animate-pulse">{message}</p>
                <p className="text-xs text-gray-500 mt-2 tracking-wider">{subMessage}</p>

                {/* SPFP Text */}
                <p className="text-2xl font-serif font-bold text-white mt-6 tracking-widest">SPFP</p>
                <p className="text-[10px] text-blue-400/60 tracking-[0.2em] uppercase">Planejador Financeiro Pessoal</p>
            </div>
        </div>
    );
};

export default Loading;
