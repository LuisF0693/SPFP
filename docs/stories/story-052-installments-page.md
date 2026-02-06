# STY-052: Implementar Aba de Parcelamentos

**Epic:** UX Restructure - Sidebar e Navegação
**PRD:** PRD-UX-RESTRUCTURE-SIDEBAR
**Priority:** P0 CRÍTICA
**Effort:** 12h
**Status:** READY

---

## Descrição

Criar nova página dedicada para visualização e gerenciamento de todas as parcelas ativas do usuário, incluindo limite de gastos com parcelas e alertas quando ultrapassar.

## User Story

**Como** usuário do SPFP,
**Quero** ver todas as minhas parcelas em uma única tela,
**Para que** eu possa controlar meus compromissos parcelados e não ultrapassar meu limite.

---

## Acceptance Criteria

- [ ] **AC-1:** Nova rota `/installments` funcionando
- [ ] **AC-2:** Lista todas as parcelas de todas as fontes (cartões, transações parceladas)
- [ ] **AC-3:** Cada parcela mostra: descrição, valor, parcela X/Y, data vencimento, cartão/conta
- [ ] **AC-4:** Campo para definir "Limite Mensal de Parcelas" (R$)
- [ ] **AC-5:** Indicador visual do total atual vs limite (progress bar)
- [ ] **AC-6:** Alerta visual quando > 80% do limite
- [ ] **AC-7:** Alerta crítico quando > 100% do limite
- [ ] **AC-8:** Filtro por cartão/conta
- [ ] **AC-9:** Filtro por status: Ativas, Pagas, Atrasadas
- [ ] **AC-10:** Ordenação por: Vencimento, Valor, Cartão
- [ ] **AC-11:** Mostra nome do cartão + nome do dono (ex: "Nubank - João")
- [ ] **AC-12:** Design responsivo (mobile/tablet/desktop)

---

## Technical Implementation

### Nova Rota:
```typescript
// App.tsx
<Route path="/installments" element={
  <PrivateRoute>
    <Layout mode="personal">
      <Installments />
    </Layout>
  </PrivateRoute>
} />
```

### Novo Componente:
```
src/components/Installments.tsx
```

### Estrutura de Dados:
```typescript
interface InstallmentView {
  id: string;
  description: string;
  amount: number;
  currentInstallment: number;
  totalInstallments: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  cardId?: string;
  cardName?: string;
  cardOwner?: string; // Nome do dono
  transactionId?: string;
  groupId?: string;
}

interface InstallmentLimitConfig {
  monthlyLimit: number;
  alertThreshold: number; // default 0.8 (80%)
}
```

### Lógica de Agregação:
1. Buscar transações com `groupType === 'INSTALLMENT'`
2. Agrupar por `groupId`
3. Calcular parcela atual vs total
4. Enriquecer com dados do cartão (nome, dono)
5. Ordenar por data de vencimento

### Componentes Internos:
```
Installments/
├── InstallmentsPage.tsx (orquestrador)
├── InstallmentCard.tsx (card individual)
├── InstallmentLimitBar.tsx (barra de progresso + limite)
├── InstallmentFilters.tsx (filtros e ordenação)
└── InstallmentEmpty.tsx (estado vazio)
```

---

## UI Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│ 📅 Parcelamentos                                    [Filtros ▼] │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Limite Mensal: R$ 3.000,00                                  │ │
│ │ ████████████████████░░░░░░░░░░ R$ 2.450,00 (82%)           │ │
│ │ ⚠️ Atenção: Próximo do limite!                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Próximas a vencer:                                              │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📱 iPhone 15 Pro                                  Parcela   │ │
│ │ Nubank - João                                     3/12     │ │
│ │ R$ 650,00                              Vence: 15/03/2026   │ │
│ │ ⏳ Em 9 dias                                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🛋️ Sofá Tok&Stok                                  Parcela   │ │
│ │ Itaú - Maria                                      5/10     │ │
│ │ R$ 450,00                              Vence: 20/03/2026   │ │
│ │ ⏳ Em 14 dias                                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🏋️ Academia Smart Fit                             Parcela   │ │
│ │ Santander - João                                 12/12     │ │
│ │ R$ 89,90                               Vence: 05/03/2026   │ │
│ │ ⚠️ Última parcela!                                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tasks

- [ ] 1. Criar componente `Installments.tsx`
- [ ] 2. Adicionar rota `/installments` em App.tsx
- [ ] 3. Implementar lógica de agregação de parcelas do FinanceContext
- [ ] 4. Criar componente `InstallmentCard`
- [ ] 5. Criar componente `InstallmentLimitBar`
- [ ] 6. Implementar filtros (cartão, status)
- [ ] 7. Implementar ordenação (vencimento, valor)
- [ ] 8. Adicionar campo de limite mensal (persistir em userProfile ou localStorage)
- [ ] 9. Implementar alertas visuais (80%, 100%)
- [ ] 10. Mostrar nome do cartão + dono do cartão
- [ ] 11. Criar estado vazio (sem parcelas)
- [ ] 12. Responsividade mobile

---

## Dependencies

- **Bloqueado por:** STY-051 (Sidebar deve ter o item Parcelamentos)
- **Bloqueia:** Nenhum

---

## Test Cases

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 1 | Sem parcelas | Mostra estado vazio com mensagem |
| 2 | Com parcelas | Lista todas as parcelas ativas |
| 3 | Definir limite | Campo salva e persiste valor |
| 4 | 82% do limite | Barra amarela + alerta "Atenção" |
| 5 | 105% do limite | Barra vermelha + alerta "Limite ultrapassado!" |
| 6 | Filtrar por cartão | Mostra só parcelas do cartão selecionado |
| 7 | Ordenar por vencimento | Parcelas mais próximas primeiro |
| 8 | Cartão com dono | Mostra "Nubank - João" não "Nubank - ME" |

---

## Definition of Done

- [ ] Rota funcionando
- [ ] Lista parcelas corretamente
- [ ] Limite configurável
- [ ] Alertas visuais funcionando
- [ ] Filtros e ordenação funcionando
- [ ] Nome do dono aparece corretamente
- [ ] Responsivo
- [ ] Sem erros no console

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** UX Restructure - Week 2
