import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

/**
 * Mapeamento de paths para contextos de seção do Finn.
 * Usado para passar contexto ao Insights via query string.
 */
const PATH_TO_CONTEXT: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/acquisition': 'aquisicao_financiamento',
  '/acquisitions': 'aquisicao_financiamento',
  '/installments': 'parcelamentos_divida',
  '/goals': 'metas_financeiras',
  '/goals-v2': 'metas_financeiras',
  '/investments': 'investimentos',
  '/portfolio': 'investimentos',
  '/budget': 'orcamento',
  '/patrimony': 'patrimonio',
  '/reports': 'relatorios',
  '/transactions': 'transacoes',
  '/admin': 'crm_clientes',
  '/partners': 'parcerias_receita',
  '/partnerships': 'parcerias_receita',
  '/retirement': 'aposentadoria',
  '/retirement-v2': 'aposentadoria',
  '/accounts': 'contas',
  '/automation': 'automacao',
  '/hub': 'crm_clientes',
};

/**
 * Resolve o contexto com base no pathname atual.
 * Usa correspondência exata primeiro, depois prefixo.
 */
function resolveContext(pathname: string): string {
  if (PATH_TO_CONTEXT[pathname]) {
    return PATH_TO_CONTEXT[pathname];
  }
  // Correspondência por prefixo para sub-rotas
  for (const [path, ctx] of Object.entries(PATH_TO_CONTEXT)) {
    if (pathname.startsWith(path + '/')) {
      return ctx;
    }
  }
  return 'dashboard';
}

/**
 * FinnWidget — botão flutuante contextual que direciona o usuário ao Finn (Insights)
 * com o contexto da seção atual pré-selecionado.
 *
 * Não é exibido na própria página /insights para evitar redundância.
 */
export const FinnWidget: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Não exibe o widget na página de insights (Finn já está aberto)
  if (location.pathname === '/insights') {
    return null;
  }

  const context = resolveContext(location.pathname);

  const handleClick = () => {
    void navigate(`/insights?context=${context}&source=widget`);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Abrir Finn — assistente financeiro contextual"
      title="Pergunte ao Finn sobre esta seção"
      className={[
        'fixed bottom-24 right-6 md:bottom-6 md:right-6 z-50',
        'flex items-center gap-2 px-4 py-3 rounded-full',
        'bg-white/10 backdrop-blur-md border border-white/20',
        'text-white font-semibold text-sm',
        'shadow-lg shadow-black/30',
        'hover:scale-105 hover:bg-white/15 hover:border-white/30',
        'transition-all duration-200 cursor-pointer',
        'select-none',
      ].join(' ')}
    >
      <Sparkles className="w-4 h-4 text-blue-300 flex-shrink-0" aria-hidden="true" />
      <span>Finn</span>
    </button>
  );
};

export default FinnWidget;
