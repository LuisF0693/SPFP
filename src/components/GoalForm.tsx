import React, { useState, useEffect } from 'react';
import { Goal, CategoryIconName } from '../types';
import { X, Target, Calendar, Calculator, Palette } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface GoalFormProps {
    onClose: () => void;
    initialData?: Goal | null;
    onSubmit: (goal: Omit<Goal, 'id'>) => void;
    onUpdate: (goal: Goal) => void;
}

const COLORS = [
    '#3b82f6', // Indigo
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#6366f1', // Violet
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
];

const ICONS: CategoryIconName[] = ['cart', 'travel', 'home', 'car', 'gift', 'game', 'health', 'edu', 'tech'];

export const GoalForm: React.FC<GoalFormProps> = ({ onClose, initialData, onSubmit, onUpdate }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [color, setColor] = useState(COLORS[0]);
    const [icon, setIcon] = useState<CategoryIconName>('cart');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setTargetAmount(initialData.targetAmount.toString());
            setCurrentAmount(initialData.currentAmount.toString());
            setDeadline(initialData.deadline.split('T')[0]);
            setColor(initialData.color);
            setIcon((initialData.icon as CategoryIconName) || 'cart');
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name,
            targetAmount: Number(targetAmount),
            currentAmount: Number(currentAmount),
            deadline: new Date(deadline).toISOString(),
            color,
            icon,
            status: 'IN_PROGRESS' as const
        };

        if (initialData) {
            onUpdate({ ...initialData, ...payload });
        } else {
            onSubmit(payload);
        }
        onClose();
    };

    return (
        <div className="bg-[#0f172a] w-full max-w-lg rounded-2xl p-6 border border-gray-800 text-white relative">
            <button
                onClick={onClose}
                aria-label="Fechar formulário de meta"
                className="absolute top-4 right-4 p-3 text-gray-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
                <X size={20} aria-hidden="true" />
            </button>

            <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, color: color }}>
                    <CategoryIcon iconName={icon} size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold">{initialData ? 'Editar Meta' : 'Nova Meta'}</h2>
                    <p className="text-sm text-gray-500">Defina seus objetivos financeiros</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Meta</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#1e293b] border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                        placeholder="Ex: Viagem Europa, Carro Novo..."
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Alvo</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                            <input
                                type="number"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                className="w-full bg-[#1e293b] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Atual</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                            <input
                                type="number"
                                value={currentAmount}
                                onChange={(e) => setCurrentAmount(e.target.value)}
                                className="w-full bg-[#1e293b] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Limite</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full bg-[#1e293b] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cor e Ícone</label>
                    <div className="flex gap-2 mb-3">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                aria-label={`Cor ${c}`}
                                aria-pressed={color === c}
                                className={`w-11 h-11 rounded-full border-2 transition-transform ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {ICONS.map(i => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setIcon(i)}
                                aria-label={`Ícone ${i}`}
                                aria-pressed={icon === i}
                                className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all min-h-[44px] min-w-[44px] ${icon === i ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-gray-700 bg-[#1e293b] text-gray-500 hover:text-white'}`}
                            >
                                <CategoryIcon iconName={i} size={20} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all"
                    >
                        {initialData ? 'Salvar Alterações' : 'Criar Meta'}
                    </button>
                </div>
            </form>
        </div>
    );
};
