# PRD: Reestruturação UX do SPFP - Sidebar e Navegação

**Documento:** PRD-UX-RESTRUCTURE-SIDEBAR
**Versão:** 1.0
**Data:** 2026-02-06
**Status:** DRAFT - Aguardando Aprovação
**Autor:** @pm (Morgan - Product Manager)

---

## 1. Visão Geral

### 1.1 Resumo Executivo

Este PRD define a reestruturação completa da navegação lateral (sidebar) do SPFP, adicionando novas funcionalidades como **Parcelamentos**, **Aposentadoria** (separada de Objetivos), e **Aquisição** (análise de compra vs financiamento vs consórcio), além de correções de bugs nos cartões e melhorias na interface de lançamentos.

### 1.2 Problema

O sidebar atual apresenta uma estrutura linear que não reflete a hierarquia lógica das funcionalidades financeiras. Usuários têm dificuldade em:
- Encontrar funcionalidades relacionadas (contas, lançamentos, metas estão separadas)
- Visualizar parcelamentos de forma consolidada
- Acessar planejamento de aposentadoria de forma dedicada
- Tomar decisões de aquisição de bens (comprar vs financiar vs consórcio)

### 1.3 Solução Proposta

Reorganizar o sidebar com estrutura hierárquica colapsável:

```
📊 Dashboard
📋 Orçamento (expandível)
   ├─ Minhas Contas
   ├─ Lançamentos
   ├─ Metas
   └─ Parcelamentos (NOVA)
🎯 Objetivos
🏖️ Aposentadoria (NOVA - separada de Objetivos)
💰 Patrimônio
🏠 Aquisição (NOVA)
📈 Relatórios (redesign)
💡 Insights Financeiros
[REMOVIDO: Projeções]
```

---

## 2. Escopo

### 2.1 In Scope

| # | Feature | Prioridade |
|---|---------|------------|
| 1 | Reorganização do Sidebar com seções colapsáveis | P0 CRÍTICA |
| 2 | Nova aba: Parcelamentos | P0 CRÍTICA |
| 3 | Nova aba: Aposentadoria (separada) | P1 ALTA |
| 4 | Nova aba: Aquisição (compra vs financiamento vs consórcio) | P1 ALTA |
| 5 | Redesign: Relatórios (visual profissional) | P2 MÉDIA |
| 6 | Remoção: Aba Projeções | P2 MÉDIA |
| 7 | Bug Fix: Cartões - proprietário duplicado | P0 CRÍTICA |
| 8 | Bug Fix: Nome do dono nos lançamentos com cartão | P1 ALTA |
| 9 | UI: Emojis no formulário de novo lançamento | P2 MÉDIA |
| 10 | UI: Remover ícones, manter só emojis | P3 BAIXA |

### 2.2 Out of Scope

- Mudanças no Dashboard (já está funcionando bem)
- Mudanças em Investimentos
- Integração com APIs bancárias
- Funcionalidades de CRM/Admin

---

## 3. Requisitos Funcionais

### 3.1 RF-01: Sidebar Reorganizado

**Descrição:** Implementar nova estrutura hierárquica do sidebar com seções colapsáveis.

**Comportamento:**
1. Sidebar deve ter seções expandíveis/colapsáveis
2. Seção "Orçamento" agrupa: Contas, Lançamentos, Metas, Parcelamentos
3. Ícones à esquerda de cada item
4. Indicador visual de seção expandida/colapsada (chevron)
5. Estado de expansão persiste na sessão

**Estrutura Final:**
```
📊 Dashboard                    (link direto)
📋 Orçamento                    (seção expandível)
   ├─ 💳 Minhas Contas          (/accounts)
   ├─ 📝 Lançamentos            (/transactions)
   ├─ 🎯 Metas                  (/budget ou /goals-financial)
   └─ 📅 Parcelamentos          (/installments) [NOVA]
🎯 Objetivos                    (/goals) [SEM aposentadoria]
🏖️ Aposentadoria               (/retirement) [NOVA]
💰 Patrimônio                   (/patrimony)
🏠 Aquisição                    (/acquisition) [NOVA]
📈 Relatórios                   (/reports) [REDESIGN]
💡 Insights Financeiros         (/insights)
```

### 3.2 RF-02: Parcelamentos (Nova Aba)

**Descrição:** Tela dedicada para visualizar e gerenciar todas as parcelas ativas.

**Funcionalidades:**
1. Lista todas as parcelas de todas as fontes (cartões, financiamentos)
2. Mostra: descrição, valor parcela, parcela atual/total, data vencimento
3. Campo para definir "Limite de gastos com parcelas" (valor mensal)
4. Indicador visual quando limite ultrapassado
5. Filtros: por cartão, por status (ativas, pagas, atrasadas)
6. Ordenação: por vencimento, por valor

**Mockup Conceitual:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Parcelamentos                                            │
├─────────────────────────────────────────────────────────────┤
│ Limite Mensal: R$ [______] │ Total em Parcelas: R$ 2.450,00│
│                            │ Status: ⚠️ 82% do limite      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🛒 iPhone 15 Pro                                        │ │
│ │ Cartão: Nubank (João)    │ 3/12 │ R$ 650,00 │ 15/03   │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🛋️ Sofá Retrátil                                        │ │
│ │ Cartão: Itaú (Maria)     │ 5/10 │ R$ 450,00 │ 20/03   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 RF-03: Aposentadoria (Nova Aba Separada)

**Descrição:** Separar planejamento de aposentadoria de Objetivos para dar destaque próprio.

**Componentes existentes a migrar:**
- `RetirementGoalForm.tsx`
- `RetirementDashPlanChart.tsx`
- `RetirementComparison.tsx`

**Funcionalidades:**
1. Formulário de configuração (já existe)
2. Gráfico de projeção bonito com 3 cenários (conservador, moderado, agressivo)
3. Cálculo de renda passiva (regra dos 4%)
4. Recomendações personalizadas

**Gráfico requerido:**
- Área chart com 3 linhas de projeção
- Eixo X: anos até aposentadoria
- Eixo Y: patrimônio acumulado
- Marcador do objetivo
- Gradientes de cores por cenário
- Tooltip interativo

### 3.4 RF-04: Aquisição (Nova Aba)

**Descrição:** Ferramenta para ajudar usuários a decidir entre comprar à vista, financiar ou consórcio.

**Inputs:**
- Tipo de bem: Imóvel, Veículo
- Valor do bem: R$ X
- Valor de entrada disponível: R$ X
- Taxa de financiamento: X% a.a.
- Prazo de financiamento: X meses
- Valor do consórcio: R$ X
- Taxa de administração consórcio: X%
- Prazo consórcio: X meses

**Outputs (comparação):**

| Cenário | Custo Total | Parcela Mensal | Tempo | Recomendação |
|---------|-------------|----------------|-------|--------------|
| À Vista | R$ 100.000 | - | Imediato | ⭐ Melhor se tem capital |
| Financiamento | R$ 180.000 | R$ 1.500 | 120 meses | ⚠️ Alto custo |
| Consórcio | R$ 130.000 | R$ 1.083 | 120 meses | ✅ Intermediário |

**Gráfico:**
- Barras comparativas do custo total
- Linha do tempo de cada cenário
- Indicador de "melhor opção" baseado no perfil

### 3.5 RF-05: Relatórios (Redesign)

**Descrição:** Melhorar visual dos relatórios para aspecto mais profissional.

**Melhorias:**
1. Cabeçalho com logo e período
2. Cards de métricas com gradientes
3. Gráficos maiores e mais legíveis
4. Tabelas com zebra striping
5. Tipografia profissional
6. Ícones mais sofisticados
7. Botão de exportar PDF mais visível

### 3.6 RF-06: Remoção de Projeções

**Descrição:** Remover aba de Projeções do sidebar e roteamento.

**Ações:**
1. Remover rota `/projections`
2. Remover item do sidebar
3. Manter componente `FutureCashFlow.tsx` (pode ser usado em Dashboard ou Relatórios futuramente)

---

## 4. Bug Fixes

### 4.1 BUG-01: Proprietário Duplicado no Cartão

**Problema:** Ao selecionar proprietário do cartão, "Cônjuge" aparece duas vezes na lista.

**Investigação Necessária:**
- Arquivo: `src/components/forms/AccountForm.tsx`
- Tipo: `AccountOwner = 'ME' | 'SPOUSE' | 'JOINT'`

**Solução:** Verificar duplicação no array de opções ou lógica de renderização.

### 4.2 BUG-02: Nome do Dono nos Lançamentos

**Problema:** Quando proprietário = "EU", deve mostrar nome do usuário logado, não "EU".

**Solução:**
1. Obter nome do usuário do `AuthContext` ou `userProfile`
2. Na seleção de cartão em lançamentos, mostrar: "Nome do Cartão - Nome do Dono"
   - Ex: "Nubank - João" em vez de "Nubank - EU"

---

## 5. Melhorias de UI

### 5.1 UI-01: Emojis no Formulário de Lançamentos

**Problema:** Emojis de categoria estão fora do formulário de novo lançamento.

**Solução:** Mover seletor de emoji/sentimento para dentro do formulário, na etapa de seleção de categoria.

### 5.2 UI-02: Remover Ícones, Manter Emojis

**Problema:** Sistema usa tanto ícones (Lucide) quanto emojis para categorias.

**Solução:** Padronizar apenas emojis para simplificar.

---

## 6. Requisitos Não-Funcionais

### 6.1 Performance
- Sidebar deve carregar < 100ms
- Transição de collapse/expand < 200ms (animação suave)
- Novas telas devem ter Lighthouse Performance > 85

### 6.2 Acessibilidade
- ARIA labels em todos os botões de expansão
- Navegação por teclado (Tab, Enter, Arrow keys)
- Alto contraste para indicadores de status

### 6.3 Responsividade
- Mobile: sidebar transforma em drawer ou bottom nav
- Tablet: sidebar colapsável com ícones
- Desktop: sidebar completo expandido

---

## 7. Design System

### 7.1 Cores
- Seção ativa: `bg-primary/10` com borda esquerda `border-l-2 border-primary`
- Hover: `hover:bg-gray-100 dark:hover:bg-gray-800`
- Texto: `text-gray-700 dark:text-gray-300`

### 7.2 Ícones/Emojis
| Seção | Emoji |
|-------|-------|
| Dashboard | 📊 |
| Orçamento | 📋 |
| Contas | 💳 |
| Lançamentos | 📝 |
| Metas | 🎯 |
| Parcelamentos | 📅 |
| Objetivos | 🎯 |
| Aposentadoria | 🏖️ |
| Patrimônio | 💰 |
| Aquisição | 🏠 |
| Relatórios | 📈 |
| Insights | 💡 |

### 7.3 Animações
- Collapse/Expand: `transition-all duration-200 ease-in-out`
- Hover: `transition-colors duration-150`

---

## 8. Stories Derivadas

| Story ID | Título | Esforço | Prioridade |
|----------|--------|---------|------------|
| STY-051 | Reestruturar Sidebar com Seções Colapsáveis | 8h | P0 |
| STY-052 | Implementar Aba de Parcelamentos | 12h | P0 |
| STY-053 | Separar Aposentadoria de Objetivos | 6h | P1 |
| STY-054 | Implementar Aba de Aquisição | 10h | P1 |
| STY-055 | Redesign dos Relatórios | 6h | P2 |
| STY-056 | Bug Fix: Proprietário Duplicado Cartão | 2h | P0 |
| STY-057 | Bug Fix: Nome do Dono em Lançamentos | 3h | P1 |
| STY-058 | UI: Emojis no Formulário de Lançamentos | 3h | P2 |
| STY-059 | Remover Aba de Projeções | 1h | P2 |
| **TOTAL** | | **51h** | |

---

## 9. Métricas de Sucesso

| Métrica | Baseline | Target |
|---------|----------|--------|
| Tempo para encontrar Parcelamentos | N/A (não existe) | < 3 cliques |
| Usuários usando Aquisição/mês | N/A | > 30% |
| Satisfação com navegação (NPS) | Não medido | > 8 |
| Bugs relacionados a cartões | 2+ | 0 |

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Quebrar navegação existente | Média | Alto | Feature flag, testes E2E |
| Performance degradada | Baixa | Médio | Lazy loading, memoização |
| Curva de aprendizado usuários | Baixa | Baixo | Onboarding tooltip |

---

## 11. Timeline Proposta

| Semana | Stories | Entregáveis |
|--------|---------|-------------|
| 1 | STY-051, STY-056 | Sidebar novo + Bug cartão |
| 2 | STY-052, STY-057 | Parcelamentos + Bug lançamentos |
| 3 | STY-053, STY-054 | Aposentadoria + Aquisição |
| 4 | STY-055, STY-058, STY-059 | Relatórios + UI + Cleanup |

**Total:** 4 semanas de desenvolvimento

---

## 12. Aprovações

| Papel | Nome | Status | Data |
|-------|------|--------|------|
| Product Owner | - | PENDENTE | - |
| Tech Lead | - | PENDENTE | - |
| UX Designer | - | PENDENTE | - |

---

**Criado por:** @pm (Morgan - Product Manager), Synkra AIOS
**Última Atualização:** 2026-02-06
**Próxima Revisão:** Após aprovação do PO
