import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { InvestmentAsset, InvestmentType } from '../types';
import { ChevronLeft, CheckCircle, TrendingUp, Tag, Hash, DollarSign, Briefcase } from 'lucide-react';

interface InvestmentFormProps {
    onClose: () => void;
    initialData?: InvestmentAsset | null;
}

const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
    { value: 'STOCK', label: 'Ação (Stock)' },
    { value: 'FII', label: 'Fundo Imobiliário (FII)' },
    { value: 'ETF', label: 'ETF' },
    { value: 'FIXED_INCOME', label: 'Renda Fixa' },
    { value: 'CRYPTO', label: 'Criptomoeda' },
    { value: 'OTHER', label: 'Outro' },
];

const InvestmentForm: React.FC<InvestmentFormProps> = ({ onClose, initialData }) => {
    const { addInvestment, updateInvestment } = useFinance();

    const [ticker, setTicker] = useState('');
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [averagePrice, setAveragePrice] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');
    const [type, setType] = useState<InvestmentType>('STOCK');
    const [sector, setSector] = useState('');

    useEffect(() => {
        if (initialData) {
            setTicker(initialData.ticker);
            setName(initialData.name);
            setQuantity(initialData.quantity.toString());
            setAveragePrice(initialData.averagePrice.toString());
            setCurrentPrice(initialData.currentPrice.toString());
            setType(initialData.type);
            setSector(initialData.sector || '');
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticker || !quantity || !averagePrice) return;

        const assetData = {
            ticker: ticker.toUpperCase(),
            name: name || ticker.toUpperCase(),
            quantity: parseFloat(quantity),
            averagePrice: parseFloat(averagePrice),
            currentPrice: parseFloat(currentPrice) || parseFloat(averagePrice), // Default to avg if not set
            type,
            sector,
            lastUpdate: new Date().toISOString(),
        };

        if (initialData) {
            updateInvestment({ ...assetData, id: initialData.id });
        } else {
            addInvestment(assetData);
        }
        onClose();
    };

    return (
        <div className="bg-white w-full p-6 relative rounded-2xl">
            <div className="flex items-center mb-6">
                <button onClick={onClose} className="mr-4 p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">{initialData ? 'Editar Ativo' : 'Novo Aporte'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ticker / Código</label>
                        <div className="relative">
                            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={ticker}
                                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                                className="w-full pl-9 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 uppercase font-bold"
                                placeholder="PETR4"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <div className="relative">
                            <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as InvestmentType)}
                                className="w-full pl-9 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none appearance-none cursor-pointer"
                            >
                                {INVESTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Ativo (Opcional)</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Petroleo Brasileiro S.A."
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quantidade</label>
                        <div className="relative">
                            <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                step="0.000001"
                                required
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Preço Médio</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={averagePrice}
                                onChange={(e) => setAveragePrice(e.target.value)}
                                className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium"
                                placeholder="0,00"
                            />
                        </div>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Preço Atual</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={currentPrice}
                                onChange={(e) => setCurrentPrice(e.target.value)}
                                className="w-full pl-9 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium"
                                placeholder="0,00"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Setor (Opcional)</label>
                    <input
                        type="text"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Ex: Bancos, Tecnologia, Logística"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center"
                >
                    <CheckCircle className="mr-2" />
                    {initialData ? 'Salvar Alterações' : 'Adicionar Investimento'}
                </button>
            </form>
        </div>
    );
};

export default InvestmentForm;
