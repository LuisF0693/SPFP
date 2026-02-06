# STY-055: Redesign dos Relatórios

**Epic:** UX Restructure - Sidebar e Navegação
**PRD:** PRD-UX-RESTRUCTURE-SIDEBAR
**Priority:** P2 MÉDIA
**Effort:** 6h
**Status:** READY

---

## Descrição

Redesenhar a página de Relatórios para ter um visual mais profissional, com melhor tipografia, cards de métricas com gradientes, gráficos maiores e botão de exportar PDF mais visível.

## User Story

**Como** usuário do SPFP,
**Quero** relatórios com visual profissional,
**Para que** eu possa apresentar minha situação financeira de forma elegante.

---

## Acceptance Criteria

- [ ] **AC-1:** Cabeçalho com título estilizado e seletor de período
- [ ] **AC-2:** Cards de métricas principais com gradientes
- [ ] **AC-3:** Gráficos maiores e mais legíveis
- [ ] **AC-4:** Tabelas com zebra striping e bordas sutis
- [ ] **AC-5:** Tipografia profissional (hierarquia clara)
- [ ] **AC-6:** Ícones mais sofisticados e consistentes
- [ ] **AC-7:** Botão "Exportar PDF" grande e visível
- [ ] **AC-8:** Preview antes de exportar (opcional)
- [ ] **AC-9:** Modo de impressão otimizado (print CSS)
- [ ] **AC-10:** Responsivo para mobile

---

## Design Specifications

### Header
```
┌─────────────────────────────────────────────────────────────────┐
│ 📈 Relatórios Financeiros              [Jan 2026 ▼] [Exportar] │
│ Visão detalhada da sua saúde financeira                        │
└─────────────────────────────────────────────────────────────────┘
```

### Métricas Cards (Gradientes)
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   RECEITAS   │ │   DESPESAS   │ │    SALDO     │ │  ECONOMIA    │
│ ████████████ │ │ ████████████ │ │ ████████████ │ │ ████████████ │
│  R$ 15.000   │ │  R$ 12.000   │ │  R$ 3.000    │ │     20%      │
│     ↑ 5%     │ │     ↓ 2%     │ │    ↑ 15%     │ │   ↑ 3pts     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
    (Verde)         (Vermelho)        (Azul)         (Amarelo)
```

### Gradientes para Cards:
```css
/* Receitas - Verde */
.card-income { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }

/* Despesas - Vermelho */
.card-expense { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); }

/* Saldo - Azul */
.card-balance { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }

/* Economia - Amarelo/Dourado */
.card-savings { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
```

### Tabela Estilizada:
```css
.table-professional {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.table-professional th {
  background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.table-professional tr:nth-child(even) {
  background-color: #F9FAFB;
}

.table-professional tr:hover {
  background-color: #EBF5FF;
}
```

---

## Technical Implementation

### Componentes a Criar/Modificar:
```
src/components/reports/
├── ReportsPage.tsx (orquestrador - modificar Reports.tsx)
├── ReportHeader.tsx (cabeçalho com seletor)
├── ReportMetricsGrid.tsx (4 cards de métricas)
├── ReportMetricCard.tsx (card individual com gradiente)
├── ReportChartSection.tsx (gráficos maiores)
├── ReportTableSection.tsx (tabela estilizada)
└── ReportExportButton.tsx (botão de exportar)
```

### Card de Métrica:
```tsx
// src/components/reports/ReportMetricCard.tsx
interface ReportMetricCardProps {
  title: string;
  value: number;
  change: number; // percentual de mudança
  type: 'income' | 'expense' | 'balance' | 'savings';
  icon: React.ReactNode;
}

const GRADIENTS = {
  income: 'from-emerald-500 to-emerald-600',
  expense: 'from-red-500 to-red-600',
  balance: 'from-blue-500 to-blue-600',
  savings: 'from-amber-500 to-amber-600',
};

const ReportMetricCard: React.FC<ReportMetricCardProps> = ({
  title, value, change, type, icon
}) => {
  const isPositive = change >= 0;

  return (
    <div className={`
      bg-gradient-to-br ${GRADIENTS[type]}
      rounded-xl p-6 text-white shadow-lg
      transform hover:scale-105 transition-transform duration-200
    `}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/80 text-sm font-medium uppercase tracking-wide">
          {title}
        </span>
        <span className="text-white/60">{icon}</span>
      </div>

      <div className="text-3xl font-bold mb-2">
        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>

      <div className={`flex items-center text-sm ${isPositive ? 'text-white/90' : 'text-white/70'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {isPositive ? '+' : ''}{change.toFixed(1)}% vs mês anterior
      </div>
    </div>
  );
};
```

### Botão de Exportar:
```tsx
// src/components/reports/ReportExportButton.tsx
const ReportExportButton: React.FC<{ onExport: () => void; isLoading: boolean }> = ({
  onExport, isLoading
}) => {
  return (
    <button
      onClick={onExport}
      disabled={isLoading}
      className="
        flex items-center gap-2 px-6 py-3
        bg-gradient-to-r from-indigo-600 to-purple-600
        text-white font-semibold rounded-xl
        shadow-lg shadow-indigo-500/30
        hover:shadow-xl hover:shadow-indigo-500/40
        transform hover:-translate-y-0.5
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileDown className="w-5 h-5" />
          Exportar PDF
        </>
      )}
    </button>
  );
};
```

### CSS para Impressão:
```css
/* src/styles/print.css */
@media print {
  /* Esconder elementos não necessários */
  .sidebar, .header, .export-button, .filters {
    display: none !important;
  }

  /* Ajustar layout */
  .report-content {
    width: 100%;
    margin: 0;
    padding: 20px;
  }

  /* Forçar cores nos gradientes */
  .card-metric {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Evitar quebra de página em elementos */
  .metric-card, .chart-section {
    break-inside: avoid;
  }
}
```

---

## Tasks

- [ ] 1. Criar estrutura de pasta `src/components/reports/`
- [ ] 2. Criar `ReportHeader.tsx` com seletor de período
- [ ] 3. Criar `ReportMetricCard.tsx` com gradientes
- [ ] 4. Criar `ReportMetricsGrid.tsx` (grid 4 colunas)
- [ ] 5. Atualizar gráficos para tamanho maior (400px altura)
- [ ] 6. Criar tabela estilizada com zebra striping
- [ ] 7. Criar `ReportExportButton.tsx` com loading state
- [ ] 8. Adicionar CSS de impressão
- [ ] 9. Refatorar `Reports.tsx` para usar novos componentes
- [ ] 10. Testar exportação PDF
- [ ] 11. Responsividade mobile

---

## Dependencies

- **Bloqueado por:** Nenhum
- **Bloqueia:** Nenhum
- **Usa:** `pdfService.ts` para exportação

---

## Test Cases

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 1 | Carregar página | Cards com gradientes aparecem |
| 2 | Mudar período | Dados atualizam corretamente |
| 3 | Exportar PDF | PDF gerado com layout profissional |
| 4 | Hover nos cards | Efeito de escala suave |
| 5 | Print (Ctrl+P) | Layout otimizado para impressão |
| 6 | Mobile | Layout responsivo (1 coluna) |

---

## Definition of Done

- [ ] Visual profissional implementado
- [ ] Gradientes nos cards
- [ ] Gráficos maiores
- [ ] Tabela estilizada
- [ ] Botão exportar visível
- [ ] CSS de impressão
- [ ] Responsivo
- [ ] Sem erros no console

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** UX Restructure - Week 4
