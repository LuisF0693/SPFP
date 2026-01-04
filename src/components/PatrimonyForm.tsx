import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PatrimonyItem, PatrimonyType } from '../types';
import { ChevronLeft, CheckCircle, Tag, DollarSign, Calculator, Plane } from 'lucide-react';

interface PatrimonyFormProps {
    onClose: () => void;
    initialData?: PatrimonyItem | null;
}

const PATRIMONY_TYPES: { value: PatrimonyType; label: string }[] = [
    { value: 'REAL_ESTATE', label: 'Imóvel' },
    { value: 'VEHICLE', label: 'Veículo' },
    { value: 'MILES', label: 'Milhas / Pontos' },
    { value: 'FINANCIAL', label: 'Outros Ativos Financeiros' },
    { value: 'OTHER', label: 'Outros Bens' },
    { value: 'DEBT', label: 'Dívida / Passivo' },
];

const PatrimonyForm: React.FC<PatrimonyFormProps> = ({ onClose, initialData }) => {
    const { addPatrimonyItem, updatePatrimonyItem } = useFinance();

    const [name, setName] = useState('');
    const [type, setType] = useState<PatrimonyType>('REAL_ESTATE');
    const [value, setValue] = useState('');
    const [quantity, setQuantity] = useState(''); // For miles
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setValue(initialData.value.toString());
            setQuantity(initialData.quantity ? initialData.quantity.toString() : '');
            setDescription(initialData.description || '');
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !value) return;

        const itemData = {
            name,
            type,
            value: parseFloat(value),
            quantity: type === 'MILES' && quantity ? parseFloat(quantity) : undefined,
            description,
            acquisitionDate: new Date().toISOString()
        };

        if (initialData) {
            updatePatrimonyItem({ ...itemData, id: initialData.id });
        } else {
            addPatrimonyItem(itemData);
        }
        onClose();
    };

    return (
        <div className="bg-white w-full p-6 relative rounded-2xl">
            <div className="flex items-center mb-6">
                <button onClick={onClose} className="mr-4 p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">{initialData ? 'Editar Registro' : 'Novo Registro'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Patrimônio</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {PATRIMONY_TYPES.map(t => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setType(t.value)}
                                className={`p-3 text-sm font-medium rounded-xl border transition-all ${type === t.value
                                    ? type === 'DEBT' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Item</label>
                    <div className="relative">
                        <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-9 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                            placeholder={type === 'MILES' ? 'Ex: Latam Pass' : "Ex: Apartamento Centro"}
                        />
                    </div>
                </div>

                {type === 'MILES' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de Milhas</label>
                        <div className="relative">
                            <Plane size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full pl-9 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                                placeholder="Ex: 50000"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {type === 'DEBT' ? 'Valor da Dívida (Saldo Devedor)' : 'Valor Estimado (R$)'}
                    </label>
                    <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="number"
                            required
                            step="0.01"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full pl-9 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-lg"
                            placeholder="0,00"
                        />
                    </div>
                    {type === 'MILES' && quantity && value && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <Calculator size={12} className="mr-1" />
                            Preço do milheiro: R$ {((parseFloat(value) / parseFloat(quantity)) * 1000).toFixed(2)}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
                        placeholder="Detalhes adicionais..."
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className={`w-full py-4 text-white font-bold text-lg rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center ${type === 'DEBT' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                            }`}
                    >
                        <CheckCircle className="mr-2" />
                        {initialData ? 'Salvar Alterações' : 'Salvar Registro'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatrimonyForm;
