import React from 'react';

const Loading: React.FC<{ message?: string; subMessage?: string }> = ({
    message = "SINCRONIZANDO V360",
    subMessage = "Protegendo seus dados..."
}) => {
    return (
        <div
            className="h-screen w-full flex items-center justify-center bg-primary text-white"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Carregando"
        >
            <div className="flex flex-col items-center">
                <div
                    className="w-16 h-16 border-4 border-white/20 border-t-accent rounded-full animate-spin mb-6"
                    aria-hidden="true"
                ></div>
                <p className="text-xl font-bold tracking-widest animate-pulse">{message}</p>
                <p className="text-xs text-blue-300/60 mt-2">{subMessage}</p>
            </div>
        </div>
    );
};

export default Loading;
