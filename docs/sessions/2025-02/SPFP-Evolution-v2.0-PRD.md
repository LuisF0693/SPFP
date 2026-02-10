# SPFP Evolution v2.0 - Documentação Completa

**Data:** 2025-02-10
**Status:** Em Desenvolvimento
**Agentes Envolvidos:** Atlas, Morgan, Sophie, Aria, Luna, Max, Dex, Quinn

---

## 📊 1. Análise (Atlas - Analyst)

### Resumo Executivo

5 ideias propostas para evolução do SPFP, transformando de gerenciador financeiro básico para **Central de Planejamento Patrimonial Inteligente**.

### Features Analisadas

| Feature | Viabilidade | Impacto | Esforço |
|---------|-------------|---------|---------|
| Metas Financeiras Inteligentes | ✅ Alta | 🔥 Alto | Pequeno |
| Aposentadoria Avançada | ✅ Alta | 🔥 Alto | Médio |
| Design Moderno STITCH | ✅ Alta | 🔥 Alto | Médio-Alto |
| Gestão de Parcerias | ✅ Média-Alta | 🔥 Alto | Médio |
| Portfólio de Investimentos | ✅ Alta | 🔥🔥 Muito Alto | Alto |

### Priorização Recomendada

**Fase 1 - Fundação (Sprint 1-2)**
1. Design System STITCH - Base para tudo
2. Metas Inteligentes - Quick win, alto valor

**Fase 2 - Core Features (Sprint 3-4)**
3. Aposentadoria Avançada
4. Portfólio de Investimentos (MVP)

**Fase 3 - Expansão (Sprint 5-6)**
5. Portfólio Avançado - Vinculação com objetivos
6. Gestão de Parcerias - Feature B2B

---

## 📋 2. Product Requirements (Morgan - PM)

### Epic 1: Design System STITCH (P0 - 13 pts)

#### US-1.1: Implementar Design System Base (8 pts)
**Como** usuário do SPFP
**Quero** uma interface moderna e elegante
**Para** ter uma experiência premium ao gerenciar minhas finanças

**Critérios de Aceite:**
- [ ] Paleta de cores implementada (primary: #135bec, bg-dark: #101622, surface: #1A2233)
- [ ] Tipografia Inter aplicada globalmente
- [ ] Cards com bordas arredondadas (rounded-2xl) e sombras suaves
- [ ] Glassmorphism em elementos sobrepostos
- [ ] Scrollbar customizada para dark mode
- [ ] Ícones Material Symbols integrados

#### US-1.2: Componentes UI Reutilizáveis (5 pts)
**Critérios de Aceite:**
- [ ] `<StatCard>` - Card de estatística com ícone, valor, variação
- [ ] `<ChartCard>` - Container para gráficos com filtros de período
- [ ] `<DataTable>` - Tabela estilizada com hover, filtros, exportação
- [ ] `<ActionButton>` - Botão primário com ícone e animação
- [ ] `<SidebarNav>` - Navegação lateral responsiva

---

### Epic 2: Metas Financeiras Inteligentes (P1 - 11 pts)

#### US-2.1: Sugestão Automática de Metas (5 pts)
**Como** usuário
**Quero** que o sistema sugira valores de meta baseados no mês anterior
**Para** definir metas realistas

**Critérios de Aceite:**
- [ ] Sistema calcula renda líquida do mês anterior (receitas - despesas)
- [ ] Sugestão exibida ao criar/editar meta
- [ ] Se fevereiro → usa dados de janeiro
- [ ] Fallback: média dos últimos 3 meses se disponível
- [ ] Exibe "Baseado em sua renda de [mês]: R$ X.XXX"

#### US-2.2: Edição Visual de Metas (3 pts)
**Critérios de Aceite:**
- [ ] Valor da meta exibido inline (não em mensagem/toast)
- [ ] Click no valor → transforma em input editável
- [ ] Scroll horizontal para múltiplas metas
- [ ] Salvamento automático ao sair do campo (debounce 500ms)
- [ ] Feedback visual de salvamento (✓ verde)

#### US-2.3: Carousel de Metas (3 pts)
**Critérios de Aceite:**
- [ ] Scroll horizontal com snap points
- [ ] Indicadores de posição (dots)
- [ ] Swipe gesture em mobile
- [ ] Botões de navegação em desktop
- [ ] Animação suave de transição

---

### Epic 3: Aposentadoria Avançada (P1 - 18 pts)

#### US-3.1: Parâmetros Editáveis de Aposentadoria (5 pts)
**Critérios de Aceite:**
- [ ] Campo: Taxa de retorno anual (default: 8%)
- [ ] Campo: Taxa de inflação (default: 4.5%)
- [ ] Campo: Idade atual (calculada do perfil ou manual)
- [ ] Campo: Idade de aposentadoria (default: 65)
- [ ] Campo: Idade limite do gráfico (default: 100)
- [ ] Recálculo em tempo real ao alterar

#### US-3.2: Gráfico de Projeção até 100 Anos (8 pts)
**Critérios de Aceite:**
- [ ] Gráfico de área com duas fases: acumulação (verde) + retirada (laranja)
- [ ] Linha vertical marcando idade de aposentadoria
- [ ] Eixo X: idade (atual → 100)
- [ ] Eixo Y: patrimônio projetado
- [ ] Tooltip com detalhes ao hover
- [ ] Linha de "zona de segurança" (patrimônio mínimo)

#### US-3.3: Simulação de Retiradas (5 pts)
**Critérios de Aceite:**
- [ ] Campo: Valor de retirada mensal desejado
- [ ] Cálculo considera inflação nas retiradas
- [ ] Gráfico mostra depleção gradual do patrimônio
- [ ] Alerta se patrimônio zera antes dos 100 anos
- [ ] Sugestão de retirada sustentável (regra dos 4%)

---

### Epic 4: Gestão de Parcerias (P3 - 13 pts)

#### US-4.1: Cadastro de Parceiros (3 pts)
**Critérios de Aceite:**
- [ ] Campos: Nome, Email, Telefone, % Comissão padrão
- [ ] Lista de parceiros cadastrados
- [ ] Edição e exclusão de parceiros
- [ ] Validação de % (0-100)

#### US-4.2: Registro de Clientes de Parceria (5 pts)
**Critérios de Aceite:**
- [ ] Campos: Nome cliente, Valor contratado, Parceiro, Taxa comissão
- [ ] Cálculo automático: Comissão total = Valor × Taxa%
- [ ] Split automático: Minha parte (50%) | Parte parceiro (50%)
- [ ] Status: Pendente | Pago
- [ ] Data do fechamento

#### US-4.3: Dashboard de Parcerias (5 pts)
**Critérios de Aceite:**
- [ ] Card: Total comissões do mês
- [ ] Card: Minha parte (50%)
- [ ] Card: Parte parceiros (50%)
- [ ] Tabela: Clientes recentes com valores
- [ ] Filtro por parceiro e período

---

### Epic 5: Portfólio de Investimentos (P1 - 41 pts)

#### US-5.1: Nova Aba de Portfólio (5 pts)
**Critérios de Aceite:**
- [ ] Nova rota: /portfolio
- [ ] Menu lateral com ícone de portfólio
- [ ] Layout seguindo design STITCH
- [ ] Cards: Patrimônio total, Lucro do dia, Retorno da carteira

#### US-5.2: Cadastro de Investimentos por Tipo (13 pts)

| Tipo | Campos Obrigatórios |
|------|---------------------|
| Tesouro Direto | Tipo (Selic/IPCA/Pré), Vencimento, Valor, Taxa contratada |
| CDB/LCI/LCA | Instituição, Taxa (% CDI ou Pré), Vencimento, Valor |
| Renda Fixa Outros | Emissor, Tipo, Taxa, Vencimento, Valor |
| Ações BR | Ticker, Quantidade, Preço médio, Corretora |
| Stocks (USD) | Ticker, Quantidade, Preço médio (USD), Corretora |
| REITs (USD) | Ticker, Quantidade, Preço médio (USD), Corretora |
| Fundos | Nome, CNPJ, Gestora, Tipo (RF/RV/Multi), Valor |

**Critérios de Aceite:**
- [ ] Formulário dinâmico baseado no tipo selecionado
- [ ] Campo: Corretora (comum a todos)
- [ ] Campo: Liquidez (D+0, D+1, D+30, Vencimento)
- [ ] Validação de campos obrigatórios

#### US-5.3: Vinculação com Objetivos (8 pts)
**Critérios de Aceite:**
- [ ] Campo opcional: "Objetivo vinculado" no cadastro
- [ ] Dropdown com objetivos existentes + "Aposentadoria"
- [ ] Ao vincular: valor do investimento soma no progresso do objetivo
- [ ] Na tela de Objetivos: mostrar investimentos atrelados
- [ ] Exibir % que cada investimento representa do objetivo

#### US-5.4: Integração com Aposentadoria (5 pts)
**Critérios de Aceite:**
- [ ] Investimentos com objetivo "Aposentadoria" aparecem no gráfico
- [ ] Linha adicional: patrimônio atual investido
- [ ] Lista de investimentos atrelados à aposentadoria
- [ ] % de cada investimento no total de aposentadoria
- [ ] Soma total investido para aposentadoria em destaque

#### US-5.5: Alocação de Ativos (5 pts)
**Critérios de Aceite:**
- [ ] Gráfico donut com % por categoria
- [ ] Categorias: Renda Variável, Renda Fixa, FIIs, Internacional
- [ ] Legenda com valores absolutos
- [ ] Cores consistentes com design STITCH

#### US-5.6: Tabela de Ativos (5 pts)
**Critérios de Aceite:**
- [ ] Colunas: Ativo, Tipo, Quantidade, Preço médio, Valor atual, Rentabilidade
- [ ] Ordenação por qualquer coluna
- [ ] Filtro por tipo de ativo
- [ ] Busca por nome/ticker
- [ ] Exportação CSV
- [ ] Rentabilidade em badge verde/vermelho

---

## 🎯 3. Visão Estratégica (Sophie - PO)

### Product Vision Statement

> **"Transformar o SPFP de um gerenciador financeiro em uma Central de Planejamento Patrimonial Inteligente, onde cada investimento tem propósito e cada meta tem caminho claro."**

### Posicionamento

**De:** App de controle financeiro pessoal
**Para:** Plataforma de planejamento patrimonial com inteligência

### Diferencial Competitivo

Nenhum concorrente brasileiro conecta:
- Cada real investido → a um objetivo específico
- Cada objetivo → ao plano de aposentadoria
- Visualização completa do ciclo de vida financeiro (hoje → 100 anos)

### KPIs de Sucesso

| KPI | Meta v2.0 |
|-----|-----------|
| Investimentos cadastrados/usuário | ≥ 5 |
| % investimentos vinculados a objetivos | ≥ 60% |
| Uso da projeção aposentadoria | ≥ 40% usuários |
| Tempo na plataforma | +30% |
| NPS | ≥ 50 |

### Princípios UX Validados

1. **Valor Visível** - Mostrar valores na tela, não em mensagens
2. **Edição In-Place** - Click para editar, sem modais desnecessários
3. **Conexão Clara** - Sempre mostrar relação investimento ↔ objetivo
4. **Projeção Tangível** - Gráfico até 100 anos torna futuro concreto
5. **Premium Feel** - Design STITCH transmite confiança e sofisticação

### Go-to-Market

**Mensagem Principal:**
> "Agora cada investimento tem um propósito. Veja seu futuro até os 100 anos."

---

## 🏗️ 4. Arquitetura Técnica (Aria - Architect)

### Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** TailwindCSS + Design System STITCH
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **Charts:** Recharts
- **State:** Context API (FinanceContext, InvestmentContext)

### Schema Supabase

#### Tabela: `investments`

```sql
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificação
  name VARCHAR(255) NOT NULL,
  ticker VARCHAR(20),
  type VARCHAR(50) NOT NULL,

  -- Valores
  quantity DECIMAL(18,8) DEFAULT 1,
  average_price DECIMAL(18,2) NOT NULL,
  current_price DECIMAL(18,2),
  currency VARCHAR(3) DEFAULT 'BRL',

  -- Detalhes por tipo
  institution VARCHAR(255),
  rate DECIMAL(8,4),
  rate_type VARCHAR(20),
  maturity_date DATE,
  liquidity VARCHAR(20),

  -- Fundos específicos
  cnpj VARCHAR(20),
  fund_type VARCHAR(20),

  -- Vinculação
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  is_retirement BOOLEAN DEFAULT false,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela: `retirement_settings`

```sql
CREATE TABLE retirement_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  current_age INTEGER NOT NULL DEFAULT 30,
  retirement_age INTEGER NOT NULL DEFAULT 65,
  life_expectancy INTEGER NOT NULL DEFAULT 100,

  annual_return_rate DECIMAL(5,2) DEFAULT 8.00,
  inflation_rate DECIMAL(5,2) DEFAULT 4.50,

  monthly_contribution DECIMAL(18,2) DEFAULT 0,
  desired_monthly_income DECIMAL(18,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela: `partners` (P3)

```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  default_commission_rate DECIMAL(5,2) DEFAULT 10.00,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabela: `partnership_clients` (P3)

```sql
CREATE TABLE partnership_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,

  client_name VARCHAR(255) NOT NULL,
  contract_value DECIMAL(18,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,

  total_commission DECIMAL(18,2) GENERATED ALWAYS AS (contract_value * commission_rate / 100) STORED,
  my_share DECIMAL(18,2) GENERATED ALWAYS AS (contract_value * commission_rate / 100 * 0.5) STORED,
  partner_share DECIMAL(18,2) GENERATED ALWAYS AS (contract_value * commission_rate / 100 * 0.5) STORED,

  status VARCHAR(20) DEFAULT 'pending',
  closed_at DATE DEFAULT CURRENT_DATE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Estrutura de Arquivos

```
src/
├── components/
│   ├── ui/                          # Design System
│   │   ├── design-tokens.ts
│   │   ├── StatCard.tsx
│   │   ├── ChartCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── ActionButton.tsx
│   │   ├── InlineEdit.tsx
│   │   ├── Carousel.tsx
│   │   └── index.ts
│   │
│   ├── portfolio/                   # Feature: Portfólio
│   │   ├── Portfolio.tsx
│   │   ├── PortfolioStats.tsx
│   │   ├── AssetAllocation.tsx
│   │   ├── AssetTable.tsx
│   │   ├── InvestmentForm.tsx
│   │   └── InvestmentTypeFields.tsx
│   │
│   ├── goals/                       # Feature: Metas
│   │   ├── Goals.tsx
│   │   ├── GoalCard.tsx
│   │   ├── GoalCarousel.tsx
│   │   ├── GoalSuggestion.tsx
│   │   └── LinkedInvestments.tsx
│   │
│   ├── retirement/                  # Feature: Aposentadoria
│   │   ├── Retirement.tsx
│   │   ├── RetirementSettings.tsx
│   │   ├── RetirementChart.tsx
│   │   ├── WithdrawalSimulator.tsx
│   │   └── RetirementInvestments.tsx
│   │
│   └── partnerships/                # Feature: Parcerias (P3)
│       ├── Partnerships.tsx
│       ├── PartnerList.tsx
│       ├── ClientList.tsx
│       └── CommissionSummary.tsx
```

### Design Tokens

```typescript
export const colors = {
  primary: '#135bec',
  primaryHover: '#1048c7',
  primaryLight: 'rgba(19, 91, 236, 0.1)',

  background: {
    light: '#f6f6f8',
    dark: '#101622',
  },

  surface: {
    light: '#FFFFFF',
    dark: '#1A2233',
  },

  border: {
    light: '#e6e8eb',
    dark: '#2e374a',
  },

  text: {
    primary: { light: '#111418', dark: '#FFFFFF' },
    secondary: { light: '#637588', dark: '#92a4c9' },
  },

  success: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
  danger: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
};
```

### Tipos TypeScript

```typescript
export type InvestmentType =
  | 'tesouro' | 'cdb' | 'lci' | 'lca' | 'renda_fixa'
  | 'acao' | 'stock' | 'reit' | 'fundo';

export type Currency = 'BRL' | 'USD';
export type Liquidity = 'D+0' | 'D+1' | 'D+30' | 'D+60' | 'D+90' | 'maturity';
export type RateType = 'pre' | 'pos_cdi' | 'ipca';
export type FundType = 'rf' | 'rv' | 'multi' | 'cambial';

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  ticker?: string;
  type: InvestmentType;
  quantity: number;
  average_price: number;
  current_price?: number;
  currency: Currency;
  institution?: string;
  rate?: number;
  rate_type?: RateType;
  maturity_date?: string;
  liquidity?: Liquidity;
  cnpj?: string;
  fund_type?: FundType;
  goal_id?: string;
  is_retirement: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RetirementSettings {
  id: string;
  user_id: string;
  current_age: number;
  retirement_age: number;
  life_expectancy: number;
  annual_return_rate: number;
  inflation_rate: number;
  monthly_contribution: number;
  desired_monthly_income: number;
}
```

---

## 📊 Resumo de Story Points

| Prioridade | Stories | Points |
|------------|---------|--------|
| P0 - Crítico | 2 | 13 |
| P1 - Alta | 10 | 62 |
| P2 - Média | 2 | 8 |
| P3 - Baixa | 3 | 13 |
| **Total** | **17** | **96** |

---

## 🔄 Próximos Passos

1. ✅ Atlas (Analyst) - Análise completa
2. ✅ Morgan (PM) - Requisitos documentados
3. ✅ Sophie (PO) - Visão estratégica validada
4. ✅ Aria (Architect) - Arquitetura definida
5. 🔄 Luna (UX) - Design detalhado
6. ⏳ Max (SM) - Sprint planning
7. ⏳ Dex (Dev) - Implementação
8. ⏳ Quinn (QA) - Revisão

---

*Documento gerado automaticamente pelo AIOS Squad*
