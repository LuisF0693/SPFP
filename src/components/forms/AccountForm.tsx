import React, { useState, useEffect } from 'react';
import { Account, AccountType, AccountOwner, CardNetwork } from '../../types';
import { X } from 'lucide-react';

interface AccountFormProps {
    onClose: () => void;
    initialData?: Account | null;
    onSubmit: (data: Omit<Account, 'id'>) => void;
}

const CARD_COLORS = [
    '#ef4444', '#8b5cf6', '#f97316', '#3b82f6',
    '#10b981', '#ec4899', '#0f172a', '#f59e0b',
];

export const AccountForm: React.FC<AccountFormProps> = ({ onClose, initialData, onSubmit }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<AccountType>('CHECKING');
    const [owner, setOwner] = useState<AccountOwner>('ME');
    const [balance, setBalance] = useState('');
    const [limit, setLimit] = useState('');
    const [lastFour, setLastFour] = useState('');
    const [network, setNetwork] = useState<CardNetwork>('MASTERCARD');
    const [closingDay, setClosingDay] = useState('');
    const [dueDay, setDueDay] = useState('');
    const [color, setColor] = useState(CARD_COLORS[6]);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setOwner(initialData.owner);
            setBalance(initialData.balance.toString());
            setLimit((initialData.limit || 0).toString());
            setLastFour(initialData.lastFour || '');
            setNetwork((initialData.network as CardNetwork) || 'MASTERCARD');
            setClosingDay((initialData.closingDay || '').toString());
            setDueDay((initialData.dueDay || '').toString());
            setColor(initialData.color || CARD_COLORS[6]);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            type,
            owner,
            balance: parseFloat(balance) || 0,
            limit: type === 'CREDIT_CARD' ? parseFloat(limit) || 0 : undefined,
            lastFour: type === 'CREDIT_CARD' ? lastFour : undefined,
            network: type === 'CREDIT_CARD' ? network : undefined,
            closingDay: type === 'CREDIT_CARD' ? parseInt(closingDay) || undefined : undefined,
            dueDay: type === 'CREDIT_CARD' ? parseInt(dueDay) || undefined : undefined,
            color,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Instituição</label>
                <input
                    type="text"
                    placeholder="Ex: Nubank, Itaú..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                    <select value={type} onChange={e => setType(e.target.value as AccountType)} className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white">
                        <option value="CHECKING">Conta Corrente</option>
                        <option value="CREDIT_CARD">Cartão de Crédito</option>
                        <option value="INVESTMENT">Investimento</option>
                        <option value="CASH">Dinheiro</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proprietário</label>
                    <select value={owner} onChange={e => setOwner(e.target.value as AccountOwner)} className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white">
                        <option value="ME">Minha Conta</option>
                        <option value="SPOUSE">Conta do Cônjuge</option>
                        <option value="JOINT">Conta Conjunta</option>
                    </select>
                </div>
            </div>

            {type === 'CREDIT_CARD' && (
                <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Final (4 dígitos)</label>
                            <input type="text" maxLength={4} placeholder="1234" value={lastFour} onChange={e => setLastFour(e.target.value.replace(/\D/g, ''))} className="w-full p-3 bg-white dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bandeira</label>
                            <select value={network} onChange={e => setNetwork(e.target.value as CardNetwork)} className="w-full p-3 bg-white dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white">
                                <option value="MASTERCARD">Mastercard</option>
                                <option value="VISA">Visa</option>
                                <option value="ELO">Elo</option>
                                <option value="AMEX">Amex</option>
                                <option value="OTHER">Outros</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dia Fechamento</label>
                            <input type="number" min={1} max={31} placeholder="Ex: 5" value={closingDay} onChange={e => setClosingDay(e.target.value)} className="w-full p-3 bg-white dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dia Vencimento</label>
                            <input type="number" min={1} max={31} placeholder="Ex: 10" value={dueDay} onChange={e => setDueDay(e.target.value)} className="w-full p-3 bg-white dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cor do Cartão</label>
                        <div className="flex flex-wrap gap-2">
                            {CARD_COLORS.map(c => (
                                <button key={c} type="button" onClick={() => setColor(c)} className={`w-10 h-10 rounded-full border-2 transition-transform min-h-[44px] min-w-[44px] ${color === c ? 'border-white scale-110 ring-2 ring-gray-400' : 'border-transparent'}`} style={{ backgroundColor: c }} aria-label={`Cor ${c}`} aria-pressed={color === c} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex space-x-2">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{type === 'CREDIT_CARD' ? "Fatura Atual" : "Saldo Atual"}</label>
                    <input type="number" step="0.01" placeholder="0,00" value={balance} onChange={e => setBalance(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none font-bold text-gray-900 dark:text-white" required />
                </div>
                {type === 'CREDIT_CARD' && (
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Limite Total</label>
                        <input type="number" step="0.01" placeholder="0,00" value={limit} onChange={e => setLimit(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none font-bold text-gray-900 dark:text-white" required />
                    </div>
                )}
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">{initialData ? 'Salvar Alterações' : 'Criar Conta'}</button>
        </form>
    );
};
