import React from 'react';
import { FileDown, Loader2 } from 'lucide-react';

interface ReportExportButtonProps {
    onExport: () => void;
    isLoading: boolean;
}

export const ReportExportButton: React.FC<ReportExportButtonProps> = ({
    onExport,
    isLoading
}) => {
    return (
        <button
            onClick={onExport}
            disabled={isLoading}
            className="
                flex items-center gap-2.5 px-6 py-4
                bg-gradient-to-r from-indigo-600 to-purple-600
                text-white font-bold text-xs uppercase tracking-widest
                rounded-2xl
                shadow-lg shadow-indigo-500/30
                hover:shadow-xl hover:shadow-indigo-500/40
                hover:from-indigo-500 hover:to-purple-500
                transform hover:-translate-y-0.5
                transition-all duration-200 ease-out
                disabled:opacity-50 disabled:cursor-not-allowed
                disabled:hover:translate-y-0 disabled:hover:shadow-lg
                print:hidden
            "
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Gerando...</span>
                </>
            ) : (
                <>
                    <FileDown className="w-5 h-5" />
                    <span>Exportar PDF</span>
                </>
            )}
        </button>
    );
};
