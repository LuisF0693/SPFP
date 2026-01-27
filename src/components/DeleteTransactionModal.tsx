import React, { useState, useMemo } from 'react';
import { Transaction, Account } from '../types';
import { formatCurrency, getMonthName } from '../utils';
import { Trash2, Package, RefreshCw, AlertTriangle } from 'lucide-react';
import { Modal } from './ui/Modal';

type DeleteOption = 'single' | 'future' | 'all';

interface DeleteTransactionModalProps {
    transaction: Transaction;
    relatedTransactions: Transaction[];
    accounts: Account[];
    onDeleteSingle: () => void;
    onDeleteFuture: () => void;
    onDeleteAll: () => void;
    onClose: () => void;
}

/**
 * Modal for confirming deletion of grouped transactions (installments/recurring).
 * Provides options to delete single, future, or all related transactions.
 */
export const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = ({
    transaction,
    relatedTransactions,
    accounts,
    onDeleteSingle,
    onDeleteFuture,
    onDeleteAll,
    onClose
}) => {
    const [selectedOption, setSelectedOption] = useState<DeleteOption>('single');
    const [isDeleting, setIsDeleting] = useState(false);

    const isInstallment = transaction.groupType === 'INSTALLMENT';
    const currentIndex = transaction.groupIndex || 1;
    const totalCount = transaction.groupTotal || relatedTransactions.length;

    // Get account name
    const account = accounts.find(a => a.id === transaction.accountId);
    const accountName = account?.name || 'Conta';

    // Calculate values
    const calculations = useMemo(() => {
        const sortedTxs = [...relatedTransactions].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const futureTxs = sortedTxs.filter(t => (t.groupIndex || 0) >= currentIndex);
        const totalValue = sortedTxs.reduce((acc, t) => acc + t.value, 0);
        const futureValue = futureTxs.reduce((acc, t) => acc + t.value, 0);
        const remainingCount = futureTxs.length;

        // Get first transaction date for recurring
        const firstTx = sortedTxs[0];
        const firstDate = firstTx ? new Date(firstTx.date) : new Date();

        return {
            totalValue,
            futureValue,
            remainingCount,
            futureCount: futureTxs.length,
            allCount: sortedTxs.length,
            firstMonth: `${getMonthName(firstDate.getMonth()).slice(0, 3)}/${firstDate.getFullYear()}`,
            currentMonth: `${getMonthName(new Date(transaction.date).getMonth())}/${new Date(transaction.date).getFullYear()}`
        };
    }, [relatedTransactions, currentIndex, transaction.date]);

    // Get base description (without installment suffix)
    const baseDescription = transaction.description.replace(/\s*\(\d+\/\d+\)$/, '');

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            switch (selectedOption) {
                case 'single':
                    onDeleteSingle();
                    break;
                case 'future':
                    onDeleteFuture();
                    break;
                case 'all':
                    onDeleteAll();
                    break;
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const options: { value: DeleteOption; title: string; subtitle: string; count: number; total: number }[] = isInstallment
        ? [
            {
                value: 'single',
                title: `Excluir apenas esta parcela (${currentIndex}/${totalCount})`,
                subtitle: `Mantém as outras ${totalCount - 1} parcelas`,
                count: 1,
                total: transaction.value
            },
            {
                value: 'future',
                title: `Excluir esta e todas as futuras (${currentIndex}-${totalCount})`,
                subtitle: `Remove ${calculations.futureCount} parcelas`,
                count: calculations.futureCount,
                total: calculations.futureValue
            },
            {
                value: 'all',
                title: `Excluir TODAS as parcelas (1-${totalCount})`,
                subtitle: `Remove ${calculations.allCount} parcelas`,
                count: calculations.allCount,
                total: calculations.totalValue
            }
        ]
        : [
            {
                value: 'single',
                title: `Excluir apenas este mês (${calculations.currentMonth})`,
                subtitle: 'Mantém os lançamentos futuros',
                count: 1,
                total: transaction.value
            },
            {
                value: 'future',
                title: 'Excluir este e todos os futuros',
                subtitle: `Remove ${calculations.futureCount} lançamentos`,
                count: calculations.futureCount,
                total: calculations.futureValue
            },
            {
                value: 'all',
                title: 'Excluir TODA a recorrência (histórico + futuro)',
                subtitle: `Remove ${calculations.allCount} lançamentos`,
                count: calculations.allCount,
                total: calculations.totalValue
            }
        ];

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Excluir Transação"
            variant="dark"
            size="lg"
            headerIcon={
                <div className="p-2.5 bg-rose-500/10 rounded-xl" aria-hidden="true">
                    <Trash2 size={24} className="text-rose-500" />
                </div>
            }
            footer={
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        aria-label="Cancelar exclusão de transação"
                        className="flex-1 py-3 px-4 text-gray-400 font-bold text-sm hover:bg-white/5 rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        aria-label={isDeleting ? "Processando exclusão" : "Confirmar exclusão de transação"}
                        className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 group"
                    >
                        {isDeleting ? (
                            <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
                        ) : (
                            <>
                                <Trash2 size={16} className="group-hover:animate-shake" aria-hidden="true" />
                                Confirmar Exclusão
                            </>
                        )}
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                    {/* Info Card */}
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-white font-bold">
                            {isInstallment ? <Package size={18} className="text-blue-400" aria-hidden="true" /> : <RefreshCw size={18} className="text-indigo-400" aria-hidden="true" />}
                            <span>{baseDescription}</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            {isInstallment
                                ? `${totalCount}x de ${formatCurrency(transaction.value)} no ${accountName}`
                                : `${formatCurrency(transaction.value)}/mês • ${accountName}`
                            }
                        </p>
                        <div className="pt-2 border-t border-white/5 text-xs text-gray-500 space-y-1">
                            {isInstallment ? (
                                <>
                                    <p>Parcela atual: <span className="text-white font-bold">{currentIndex} de {totalCount}</span></p>
                                    <p>Valor total restante: <span className="text-white font-bold">{formatCurrency(calculations.futureValue)}</span> ({calculations.remainingCount} parcelas)</p>
                                </>
                            ) : (
                                <>
                                    <p>Recorrente desde: <span className="text-white font-bold">{calculations.firstMonth}</span></p>
                                    <p>Próximas ocorrências: <span className="text-white font-bold">{calculations.futureCount - 1} lançamentos futuros</span></p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Question */}
                    <p className="text-sm text-gray-300 font-medium">O que você deseja fazer?</p>

                    {/* Options */}
                    <div className="space-y-3">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSelectedOption(option.value)}
                                aria-label={`${option.title}: ${option.subtitle}`}
                                aria-pressed={selectedOption === option.value}
                                className={`w-full p-4 rounded-xl border text-left transition-all ${
                                    selectedOption === option.value
                                        ? 'bg-rose-500/10 border-rose-500/40'
                                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-rose-500/5 hover:border-rose-500/20'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            selectedOption === option.value
                                                ? 'border-rose-500 bg-rose-500'
                                                : 'border-gray-600'
                                        }`}
                                        aria-hidden="true"
                                    >
                                        {selectedOption === option.value && (
                                            <div className="w-2 h-2 bg-white rounded-full animate-scale-in" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-bold text-sm ${selectedOption === option.value ? 'text-rose-400' : 'text-gray-200'}`}>
                                            {option.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {option.subtitle} {option.value !== 'single' && `• Total: ${formatCurrency(option.total)}`}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Warning for all delete */}
                    {selectedOption === 'all' && (
                        <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl animate-fade-in" role="alert">
                            <AlertTriangle size={18} className="text-amber-500 shrink-0" aria-hidden="true" />
                            <p className="text-xs text-amber-400">
                                Esta ação removerá todo o histórico e não pode ser desfeita.
                            </p>
                        </div>
                    )}
            </div>
        </Modal>
    );
};
