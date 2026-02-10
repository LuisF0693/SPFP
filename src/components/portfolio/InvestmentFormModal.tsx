import React, { useState } from 'react';
import { X, Wallet, Landmark, BarChart3, Globe, Building2, PiggyBank } from 'lucide-react';
import { ActionButton } from '../ui/ActionButton';
import {
  Investment,
  InvestmentType,
  Currency,
  Liquidity,
  RateType,
  TesouroDiretoType,
  FundType,
  INVESTMENT_TYPE_LABELS,
  LIQUIDITY_LABELS,
} from '../../types/investments';

interface InvestmentFormModalProps {
  investment?: Investment;
  onClose: () => void;
  onSave: (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  goals?: { id: string; name: string }[];
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  tesouro: <Landmark className="w-5 h-5" />,
  cdb: <Landmark className="w-5 h-5" />,
  lci: <Landmark className="w-5 h-5" />,
  lca: <Landmark className="w-5 h-5" />,
  renda_fixa: <Landmark className="w-5 h-5" />,
  acao: <BarChart3 className="w-5 h-5" />,
  stock: <Globe className="w-5 h-5" />,
  reit: <Globe className="w-5 h-5" />,
  fii: <Building2 className="w-5 h-5" />,
  etf: <BarChart3 className="w-5 h-5" />,
  fundo: <PiggyBank className="w-5 h-5" />,
};

const TYPE_CATEGORIES = [
  { key: 'tesouro', label: 'Tesouro' },
  { key: 'cdb', label: 'CDB' },
  { key: 'renda_fixa', label: 'RF' },
  { key: 'acao', label: 'Ações' },
  { key: 'stock', label: 'Stocks' },
  { key: 'fundo', label: 'Fundos' },
];

export const InvestmentFormModal: React.FC<InvestmentFormModalProps> = ({
  investment,
  onClose,
  onSave,
  goals = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: investment?.name || '',
    ticker: investment?.ticker || '',
    type: investment?.type || ('acao' as InvestmentType),
    quantity: investment?.quantity || 1,
    average_price: investment?.average_price || 0,
    current_price: investment?.current_price || 0,
    currency: investment?.currency || ('BRL' as Currency),
    institution: investment?.institution || '',
    rate: investment?.rate || 0,
    rate_type: investment?.rate_type || ('pos_cdi' as RateType),
    maturity_date: investment?.maturity_date || '',
    liquidity: investment?.liquidity || ('D+1' as Liquidity),
    tesouro_type: investment?.tesouro_type || ('selic' as TesouroDiretoType),
    cnpj: investment?.cnpj || '',
    fund_type: investment?.fund_type || ('rf' as FundType),
    fund_manager: investment?.fund_manager || '',
    goal_id: investment?.goal_id || '',
    is_retirement: investment?.is_retirement || false,
    notes: investment?.notes || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
               type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleTypeSelect = (type: InvestmentType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      currency: ['stock', 'reit'].includes(type) ? 'USD' : 'BRL',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving investment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render type-specific fields
  const renderTypeFields = () => {
    switch (formData.type) {
      case 'tesouro':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                Tipo do Tesouro
              </label>
              <select
                name="tesouro_type"
                value={formData.tesouro_type}
                onChange={handleChange}
                className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
              >
                <option value="selic">Tesouro Selic</option>
                <option value="ipca">Tesouro IPCA+</option>
                <option value="prefixado">Tesouro Prefixado</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                  Taxa Contratada (% a.a.)
                </label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                  Vencimento
                </label>
                <input
                  type="date"
                  name="maturity_date"
                  value={formData.maturity_date}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                />
              </div>
            </div>
          </>
        );

      case 'cdb':
      case 'lci':
      case 'lca':
      case 'renda_fixa':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                  Tipo de Taxa
                </label>
                <select
                  name="rate_type"
                  value={formData.rate_type}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                >
                  <option value="pos_cdi">% do CDI</option>
                  <option value="pre">Prefixado</option>
                  <option value="ipca">IPCA +</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                  Taxa (%)
                </label>
                <input
                  type="number"
                  name="rate"
                  value={formData.rate}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                Vencimento
              </label>
              <input
                type="date"
                name="maturity_date"
                value={formData.maturity_date}
                onChange={handleChange}
                className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
              />
            </div>
          </>
        );

      case 'acao':
      case 'fii':
      case 'etf':
        return (
          <div>
            <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
              Ticker
            </label>
            <input
              type="text"
              name="ticker"
              value={formData.ticker}
              onChange={handleChange}
              placeholder="Ex: VALE3, PETR4"
              className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec] uppercase"
            />
          </div>
        );

      case 'stock':
      case 'reit':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                Ticker
              </label>
              <input
                type="text"
                name="ticker"
                value={formData.ticker}
                onChange={handleChange}
                placeholder="Ex: AAPL, MSFT, O"
                className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec] uppercase"
              />
            </div>
            <p className="text-xs text-[#637588] dark:text-[#92a4c9]">
              💵 Valores em Dólar (USD)
            </p>
          </>
        );

      case 'fundo':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                  Tipo de Fundo
                </label>
                <select
                  name="fund_type"
                  value={formData.fund_type}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                >
                  <option value="rf">Renda Fixa</option>
                  <option value="rv">Renda Variável</option>
                  <option value="multi">Multimercado</option>
                  <option value="cambial">Cambial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                  Gestora
                </label>
                <input
                  type="text"
                  name="fund_manager"
                  value={formData.fund_manager}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                CNPJ do Fundo
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1A2233] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e6e8eb] dark:border-[#2e374a]">
          <h2 className="text-xl font-bold text-[#111418] dark:text-white">
            {investment ? 'Editar Investimento' : 'Novo Investimento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#2e374a] text-[#637588] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-3">
              Tipo de Investimento
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {TYPE_CATEGORIES.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => handleTypeSelect(type.key as InvestmentType)}
                  className={`
                    flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
                    ${formData.type === type.key
                      ? 'border-[#135bec] bg-[#135bec]/10 text-[#135bec]'
                      : 'border-[#e6e8eb] dark:border-[#2e374a] text-[#637588] dark:text-[#92a4c9] hover:border-[#135bec]/50'
                    }
                  `}
                >
                  {TYPE_ICONS[type.key]}
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                Nome do Investimento
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: Tesouro Selic 2029, CDB Banco X"
                className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                {['acao', 'stock', 'reit', 'fii', 'etf'].includes(formData.type) ? 'Quantidade' : 'Valor Investido'}
              </label>
              <input
                type="number"
                name={['acao', 'stock', 'reit', 'fii', 'etf'].includes(formData.type) ? 'quantity' : 'average_price'}
                value={['acao', 'stock', 'reit', 'fii', 'etf'].includes(formData.type) ? formData.quantity : formData.average_price}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
              />
            </div>

            {['acao', 'stock', 'reit', 'fii', 'etf'].includes(formData.type) && (
              <div>
                <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                  Preço Médio ({formData.currency === 'USD' ? 'USD' : 'R$'})
                </label>
                <input
                  type="number"
                  name="average_price"
                  value={formData.average_price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                />
              </div>
            )}
          </div>

          {/* Type-specific fields */}
          {renderTypeFields()}

          {/* Common extra fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                Corretora/Instituição
              </label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                placeholder="Ex: XP, Nubank, Clear"
                className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
                Liquidez
              </label>
              <select
                name="liquidity"
                value={formData.liquidity}
                onChange={handleChange}
                className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
              >
                {Object.entries(LIQUIDITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Goal linking */}
          <div>
            <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
              Vincular a um Objetivo (opcional)
            </label>
            <select
              name="goal_id"
              value={formData.goal_id}
              onChange={handleChange}
              className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
            >
              <option value="">Nenhum objetivo</option>
              <option value="retirement">🎯 Aposentadoria</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name}
                </option>
              ))}
            </select>
          </div>

          {/* Retirement checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_retirement"
              checked={formData.is_retirement}
              onChange={handleChange}
              className="w-5 h-5 rounded border-[#e6e8eb] dark:border-[#2e374a] text-[#135bec] focus:ring-[#135bec]"
            />
            <span className="text-sm text-[#111418] dark:text-white">
              Este investimento é para aposentadoria
            </span>
          </label>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#637588] dark:text-[#92a4c9] mb-2">
              Notas (opcional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Anotações sobre este investimento..."
              className="w-full bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2.5 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#e6e8eb] dark:border-[#2e374a]">
            <ActionButton
              label="Cancelar"
              variant="secondary"
              onClick={onClose}
            />
            <ActionButton
              label={investment ? 'Salvar Alterações' : 'Adicionar Investimento'}
              type="submit"
              loading={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestmentFormModal;
