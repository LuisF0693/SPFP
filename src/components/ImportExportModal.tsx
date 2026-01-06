import React, { useState } from 'react';
import { X, Upload, Download, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { exportTransactionsToCSV, parseCSV } from '../services/csvService';
import { extractTextFromPDF, generatePDFReport } from '../services/pdfService';
import { parseBankStatementWithAI } from '../services/geminiService';
import { useFinance } from '../context/FinanceContext';
import { Transaction } from '../types';
import { generateId, formatDate, formatCurrency } from '../utils';

interface ImportExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'import' | 'export';
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose, initialTab = 'import' }) => {
    const { transactions, addManyTransactions, categories } = useFinance();
    const [activeTab, setActiveTab] = useState<'import' | 'export'>(initialTab);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewData, setPreviewData] = useState<Partial<Transaction>[]>([]);
    const [importSource, setImportSource] = useState<'csv' | 'pdf' | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setError(null);
        setPreviewData([]);

        try {
            if (file.name.endsWith('.csv')) {
                setImportSource('csv');
                const text = await file.text();
                const parsed = parseCSV(text);
                setPreviewData(parsed);
            } else if (file.name.endsWith('.pdf')) {
                setImportSource('pdf');
                // AI Flow
                const text = await extractTextFromPDF(file);
                const aiParsed = await parseBankStatementWithAI(text);

                // Enhance AI data with IDs and defaults
                const structuredTransactions = aiParsed.map((t: any) => ({
                    id: generateId(),
                    date: t.date,
                    description: t.description,
                    value: Math.abs(t.value), // Ensure value is positive for internal logic usually, stored with type
                    type: t.type || (t.value < 0 ? 'EXPENSE' : 'INCOME'),
                    categoryId: t.categoryId || 'uncategorized',
                    accountId: 'default' // Would selection in UI
                }));
                setPreviewData(structuredTransactions);
            } else {
                setError('Formato não suportado. Use CSV ou PDF.');
            }
        } catch (err) {
            console.error(err);
            setError('Erro ao processar arquivo. Verifique se o formato é válido ou se a API Key está configurada.');
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmImport = () => {
        if (previewData.length > 0) {
            // @ts-ignore - Partial vs transaction strict match
            addManyTransactions(previewData as Transaction[]);
            onClose();
            // Optional: Show success toast
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-emerald-600" />
                        Dados & Relatórios
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`flex-1 py-4 text-sm font-medium transition-all ${activeTab === 'import'
                            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        Importar Transações
                    </button>
                    <button
                        onClick={() => setActiveTab('export')}
                        className={`flex-1 py-4 text-sm font-medium transition-all ${activeTab === 'export'
                            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        Exportar Relatórios
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[300px]">
                    {activeTab === 'import' ? (
                        <div className="space-y-6">
                            {!previewData.length ? (
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 text-center hover:border-emerald-500 transition-colors group relative">
                                    <input
                                        type="file"
                                        accept=".csv,.pdf"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={isProcessing}
                                    />
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                            {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Clique ou arraste seu arquivo aqui
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Suporta <strong>CSV</strong> ou <strong>PDF</strong> (faturas e extratos).
                                            </p>
                                            <p className="text-xs text-emerald-600 mt-1 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full inline-block">
                                                ✨ IA Powered: Lemos seu PDF automaticamente
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                            Revisar {previewData.length} transações
                                        </h3>
                                        <button
                                            onClick={() => setPreviewData([])}
                                            className="text-sm text-red-500 hover:underline"
                                        >
                                            Cancelar
                                        </button>
                                    </div>

                                    <div className="max-h-[250px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 sticky top-0">
                                                <tr>
                                                    <th className="p-3 font-medium">Data</th>
                                                    <th className="p-3 font-medium">Descrição</th>
                                                    <th className="p-3 font-medium text-right">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {previewData.map((t, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                        <td className="p-3 text-gray-600 dark:text-gray-300">{formatDate(t.date || '')}</td>
                                                        <td className="p-3 text-gray-900 dark:text-white font-medium">{t.description}</td>
                                                        <td className={`p-3 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {formatCurrency(t.value || 0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <button
                                        onClick={confirmImport}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                    >
                                        <Check className="w-5 h-5" />
                                        Confirmar Importação
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={() => exportTransactionsToCSV(transactions)}
                                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Exportar CSV</h3>
                                    <p className="text-sm text-gray-500">Formato compatível com Excel e Planilhas.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => generatePDFReport(transactions, categories, 'Mês Atual')}
                                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Relatório em PDF</h3>
                                    <p className="text-sm text-gray-500">Documento formatado para impressão.</p>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
