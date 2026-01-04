import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { InvestmentAsset } from '../types';
import { Download, Upload, X, FileJson, AlertTriangle, Check } from 'lucide-react';

interface InvestmentImportExportProps {
    onClose: () => void;
}

const InvestmentImportExport: React.FC<InvestmentImportExportProps> = ({ onClose }) => {
    const { investments, addInvestment, deleteInvestment } = useFinance();
    const [importData, setImportData] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [mode, setMode] = useState<'EXPORT' | 'IMPORT'>('EXPORT');

    const handleExport = () => {
        const dataStr = JSON.stringify(investments, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `investimentos_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSuccessMsg('Arquivo exportado com sucesso!');
    };

    const handleImport = () => {
        try {
            if (!importData) return;
            const parsed = JSON.parse(importData);
            if (!Array.isArray(parsed)) throw new Error('O formato deve ser uma lista de ativos.');

            // Validate structure loosely
            let addedCount = 0;
            parsed.forEach((item: any) => {
                if (item.ticker && item.quantity && item.type) {
                    // Check if already exists to update or just add
                    // For simplicity, we just add always or we could implement upsert.
                    // Let's assume we want to APPEND imported data, creating new entries.
                    addInvestment({
                        ticker: item.ticker,
                        name: item.name || item.ticker,
                        quantity: Number(item.quantity),
                        averagePrice: Number(item.averagePrice) || 0,
                        currentPrice: Number(item.currentPrice) || Number(item.averagePrice) || 0,
                        type: item.type || 'OTHER',
                        sector: item.sector || '',
                        lastUpdate: new Date().toISOString()
                    });
                    addedCount++;
                }
            });

            setSuccessMsg(`${addedCount} ativos importados com sucesso!`);
            setImportData('');
            setError('');
        } catch (e) {
            setError('Erro ao processar JSON. Verifique o formato.');
        }
    };

    return (
        <div className="bg-white w-full p-6 relative rounded-2xl shadow-xl max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Importar / Exportar</h2>
                <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => { setMode('EXPORT'); setError(''); setSuccessMsg(''); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'EXPORT' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Exportar
                </button>
                <button
                    onClick={() => { setMode('IMPORT'); setError(''); setSuccessMsg(''); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'IMPORT' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Importar
                </button>
            </div>

            {successMsg && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center">
                    <Check size={16} className="mr-2" />
                    {successMsg}
                </div>
            )}

            {mode === 'EXPORT' ? (
                <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileJson size={32} />
                    </div>
                    <p className="text-gray-600 text-sm px-4">
                        Gere um arquivo JSON contendo todos os seus {investments.length} ativos cadastrados para backup.
                    </p>
                    <button
                        onClick={handleExport}
                        className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center"
                    >
                        <Download size={18} className="mr-2" />
                        Baixar Backup
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-xs flex items-start">
                        <AlertTriangle size={16} className="mr-2 shrink-0 mt-0.5" />
                        <span>Cole o conteúdo JSON de um backup anterior. Novos ativos serão adicionados à sua lista atual.</span>
                    </div>
                    <textarea
                        className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-mono focus:border-blue-500"
                        placeholder='[{"ticker": "PETR4", "quantity": 100, ...}]'
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                    ></textarea>
                    {error && (
                        <div className="text-red-500 text-xs font-bold">{error}</div>
                    )}
                    <button
                        onClick={handleImport}
                        disabled={!importData}
                        className="w-full py-3 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                        <Upload size={18} className="mr-2" />
                        Processar Importação
                    </button>
                </div>
            )}
        </div>
    );
};

export default InvestmentImportExport;
