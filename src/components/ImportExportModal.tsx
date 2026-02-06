import React, { useState } from 'react';
import { Upload, Download, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import { exportTransactionsToCSV, parseCSV, parseCSVWithAI } from '../services/csvService';
import { extractTextFromPDF, generatePDFReport, parsePDF } from '../services/pdfService';
import { parseBankStatementWithAI } from '../services/geminiService';
import { useSafeFinance } from '../hooks/useSafeFinance';
import { Transaction } from '../types';
import { generateId, formatDate, formatCurrency } from '../utils';
import { Modal } from './ui/Modal';

interface ImportExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'import' | 'export';
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose, initialTab = 'import' }) => {
    const { transactions, addManyTransactions, categories } = useSafeFinance();
    const [activeTab, setActiveTab] = useState<'import' | 'export'>(initialTab);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewData, setPreviewData] = useState<Partial<Transaction>[]>([]);
    const [importSource, setImportSource] = useState<'csv' | 'pdf' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [parsingMode, setParsingMode] = useState<'ai' | 'rules' | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const { userProfile } = useSafeFinance();

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

                const hasToken = !!userProfile.geminiToken;
                setParsingMode(hasToken ? 'ai' : 'rules');

                const parsed = await parseCSVWithAI(text, userProfile.geminiToken);

                if (!parsed || parsed.length === 0) {
                    throw new Error("Não foi possível encontrar transações neste arquivo CSV.");
                }

                // Standardize CSV preview data if needed
                const structuredTransactions = parsed.map((t: any) => ({
                    id: t.id || generateId(),
                    date: t.date || new Date().toISOString().split('T')[0],
                    description: t.description || 'Sem descrição',
                    value: Math.abs(t.value || 0),
                    type: t.type || (t.value < 0 ? 'EXPENSE' : 'INCOME'),
                    categoryId: t.categoryId || 'uncategorized',
                    accountId: 'default',
                    paid: false,
                    spender: 'ME'
                }));

                setPreviewData(structuredTransactions);
            } else if (file.name.endsWith('.pdf')) {
                setImportSource('pdf');

                const hasToken = !!userProfile.geminiToken;
                setParsingMode(hasToken ? 'ai' : 'rules');

                const aiParsed = await parsePDF(file, userProfile.geminiToken);

                if (!aiParsed || aiParsed.length === 0) {
                    throw new Error("Não foi possível encontrar transações neste arquivo.");
                }

                // Enhance AI data with IDs and defaults
                const structuredTransactions = aiParsed.map((t: any) => ({
                    id: generateId(),
                    date: t.date || new Date().toISOString().split('T')[0],
                    description: t.description || 'Sem descrição',
                    value: Math.abs(t.value || 0),
                    type: t.type || (t.value < 0 ? 'EXPENSE' : 'INCOME'),
                    categoryId: t.categoryId || 'uncategorized',
                    accountId: 'default',
                    paid: false,
                    spender: 'ME'
                }));
                setPreviewData(structuredTransactions);
            } else {
                setError('Formato não suportado. Use CSV ou PDF.');
            }
        } catch (err: any) {
            console.error("Erro no processamento:", err);
            if (err.message.includes('PDF')) {
                setError(`Erro no PDF: ${err.message}`);
            } else if (err.message.includes('CSV')) {
                setError(`Erro no CSV: ${err.message}`);
            } else {
                setError(err.message || 'Erro ao processar arquivo. Verifique se o formato é válido.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === previewData.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(previewData.map(t => t.id as string)));
        }
    };

    const toggleSelectItem = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const updatePreviewItem = (id: string, updates: Partial<Transaction>) => {
        setPreviewData(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const importSingle = (id: string) => {
        const item = previewData.find(t => t.id === id);
        if (item) {
            // @ts-ignore
            addManyTransactions([item as Transaction]);
            setPreviewData(prev => prev.filter(t => t.id !== id));
            const nextSelected = new Set(selectedIds);
            nextSelected.delete(id);
            setSelectedIds(nextSelected);
        }
    };

    const confirmImport = () => {
        const selectedItems = previewData.filter(t => selectedIds.has(t.id as string));
        if (selectedItems.length > 0) {
            // @ts-ignore - Partial vs transaction strict match
            addManyTransactions(selectedItems as Transaction[]);
            setPreviewData(prev => prev.filter(t => !selectedIds.has(t.id as string)));
            setSelectedIds(new Set());
            if (previewData.length === selectedItems.length) {
                onClose();
            }
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-emerald-600" />
                    Dados & Relatórios
                </div>
            }
            variant="light"
            size="xl"
            contentClassName="p-0"
            headerClassName="rounded-t-2xl"
        >
            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800" role="tablist">
                    <button
                        onClick={() => setActiveTab('import')}
                        role="tab"
                        aria-selected={activeTab === 'import'}
                        aria-controls="import-panel"
                        className={`flex-1 py-4 text-sm font-medium transition-all ${activeTab === 'import'
                            ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        Importar Transações
                    </button>
                    <button
                        onClick={() => setActiveTab('export')}
                        role="tab"
                        aria-selected={activeTab === 'export'}
                        aria-controls="export-panel"
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
                        <div id="import-panel" role="tabpanel" aria-labelledby="import-tab">
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
                                        <div className="flex flex-col">
                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 italic">
                                                Revisar {previewData.length} transações
                                            </h3>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mt-1 ${parsingMode === 'ai' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {parsingMode === 'ai' ? '✨ Processado com IA' : importSource === 'csv' ? '📋 CSV Processado' : '📋 Processado com Regras (Offline)'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setPreviewData([]);
                                                setParsingMode(null);
                                            }}
                                            className="text-sm text-red-500 hover:underline"
                                        >
                                            Cancelar
                                        </button>
                                    </div>

                                    <div className="max-h-[350px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 sticky top-0 z-10">
                                                <tr>
                                                    <th className="p-2 w-10 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={previewData.length > 0 && selectedIds.size === previewData.length}
                                                            onChange={toggleSelectAll}
                                                            aria-label="Selecionar todas as transações"
                                                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                        />
                                                    </th>
                                                    <th className="p-2 font-medium w-24">Data</th>
                                                    <th className="p-2 font-medium">Descrição</th>
                                                    <th className="p-2 font-medium w-32">Categoria</th>
                                                    <th className="p-2 font-medium text-right w-24">Valor</th>
                                                    <th className="p-2 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {previewData.map((t) => (
                                                    <tr key={t.id} className={`${selectedIds.has(t.id as string) ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}>
                                                        <td className="p-2 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.has(t.id as string)}
                                                                onChange={() => toggleSelectItem(t.id as string)}
                                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="date"
                                                                value={t.date}
                                                                onChange={(e) => updatePreviewItem(t.id as string, { date: e.target.value })}
                                                                className="w-full bg-transparent border-none p-0 text-gray-600 dark:text-gray-300 focus:ring-0 text-xs"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="text"
                                                                value={t.description}
                                                                onChange={(e) => updatePreviewItem(t.id as string, { description: e.target.value })}
                                                                className="w-full bg-transparent border-none p-0 text-gray-900 dark:text-white font-medium focus:ring-0 text-xs"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <select
                                                                value={t.categoryId}
                                                                onChange={(e) => updatePreviewItem(t.id as string, { categoryId: e.target.value })}
                                                                className="w-full bg-transparent border-none p-0 text-gray-600 dark:text-gray-400 focus:ring-0 text-xs"
                                                            >
                                                                <option value="uncategorized">Sem Categoria</option>
                                                                {categories.map(cat => (
                                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className={`p-2 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            <div className="flex items-center justify-end gap-1">
                                                                <span>{t.type === 'INCOME' ? '+' : '-'}</span>
                                                                <input
                                                                    type="number"
                                                                    value={t.value}
                                                                    onChange={(e) => updatePreviewItem(t.id as string, { value: parseFloat(e.target.value) || 0 })}
                                                                    className="w-20 bg-transparent border-none p-0 text-right focus:ring-0 text-xs font-bold"
                                                                    step="0.01"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <button
                                                                onClick={() => importSingle(t.id as string)}
                                                                aria-label={`Importar transação: ${t.description}`}
                                                                className="p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full transition-colors"
                                                            >
                                                                <Check className="w-4 h-4" aria-hidden="true" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <button
                                        onClick={confirmImport}
                                        disabled={selectedIds.size === 0}
                                        aria-label={selectedIds.size > 0 ? `Importar ${selectedIds.size} transações selecionadas` : 'Nenhuma transação selecionada'}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:hover:scale-100 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                    >
                                        <Check className="w-5 h-5" aria-hidden="true" />
                                        {selectedIds.size > 0
                                            ? `Importar ${selectedIds.size} selecionados`
                                            : 'Selecione itens para importar'}
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3" role="alert">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}
                        </div>
                        </div>
                    ) : (
                        <div id="export-panel" role="tabpanel" aria-labelledby="export-tab" className="space-y-4">
                            <button
                                onClick={() => exportTransactionsToCSV(transactions)}
                                aria-label="Exportar transações como CSV"
                                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform" aria-hidden="true">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Exportar CSV</h3>
                                    <p className="text-sm text-gray-500">Formato compatível com Excel e Planilhas.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => generatePDFReport(transactions, categories, 'Mês Atual')}
                                aria-label="Gerar relatório em PDF"
                                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform" aria-hidden="true">
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
        </Modal>
    );
};
