# Arquitetura de Integração Stripe - SPFP
## Sistema de Planejamento Financeiro Pessoal

**Data**: 2026-02-17
**Responsável**: Aria (Arquiteta)
**Status**: Design Completo - Pronto para Implementação

---

## Sumário Executivo

Este documento define a arquitetura completa para integração de pagamentos Stripe no SPFP, cobrindo:
- **4 Produtos Stripe** (2 one-time, 2 recurring)
- **2 Fluxos de Checkout** (Pagamento parcelado + Assinatura recorrente)
- **Backend Seguro** para operações sensíveis
- **Supabase Integration** para persistência de dados
- **Webhooks** para confirmação de pagamentos

---

## 1. ARQUITETURA DE SISTEMAS (Diagrama ASCII)

```
┌────────────────────────────────────────────────────────────────────────┐
│                            CLIENTE (Browser)                           │
├────────────────────────────────────────────────────────────────────────┤
│  React 19 + Stripe.js                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ SalesPage.tsx (Landing Page)                                    │  │
│  │  - Pricing Cards (4 planos)                                     │  │
│  │  - Stripe Payment Links / Checkout Buttons                      │  │
│  │  - Status de assinatura (isSubscribed, currentPlan)             │  │
│  └──────────┬──────────────────────────────────────────────────────┘  │
│             │ VITE_STRIPE_PUBLISHABLE_KEY (público)                    │
└─────────────┼────────────────────────────────────────────────────────┬─┘
              │                                                          │
              ▼                                                          │
┌─────────────────────────────────────────────────────────────────────┐ │
│            STRIPE.COM (External Service)                            │ │
├─────────────────────────────────────────────────────────────────────┤ │
│  • Payment Links (parcelado 12x)                                    │ │
│  • Checkout Sessions (customizável)                                 │ │
│  • Subscriptions (recorrente)                                       │ │
│  • Webhooks (payment_intent.succeeded, customer.subscription.*)    │ │
│                                                                      │ │
│  Products/Prices:                                                   │ │
│  ├─ prod_lite_installment (R$ 99,90 - 12x)                         │ │
│  ├─ prod_lite_subscription (R$ 99,90/mês)                          │ │
│  ├─ prod_premium_installment (R$ 349,90 - 12x)                     │ │
│  └─ prod_premium_subscription (R$ 349,90/mês)                      │ │
└──────────┬─────────────────────────────┬───────────────────────────┘ │
           │ webhook                     │ redirect_url                │
           │ (stripe.com → backend)      │ (Stripe → frontend)        │
           │                             │                             │
           ▼                             ▼                             │
        ┌────────────────────┐    ┌──────────────────┐               │
        │   Backend Node.js   │    │ Frontend Browser │               │
        │   (Express)         │    │ (success/cancel  │               │
        │ :3001              │    │  pages)          │               │
        └────────┬───────────┘    └──────┬───────────┘               │
                 │                        │                            │
                 │ SECRET_KEY (seguro)    │                            │
                 │                        └────────────────────────────┘
                 │
┌────────────────┼──────────────────────────────────────────────────────┐
│  BACKEND (Node.js + Express)                                          │
├────────────────┼──────────────────────────────────────────────────────┤
│                │                                                       │
│  POST /api/stripe/checkout-session                                   │
│  ├─ Valida planId (lite|premium)                                     │
│  ├─ Cria Stripe CheckoutSession                                      │
│  ├─ Salva sessionId no Supabase (stripe_sessions table)              │
│  └─ Retorna sessionId + redirect URL                                 │
│                                                                       │
│  POST /api/stripe/subscription                                       │
│  ├─ Valida planId (lite_sub|premium_sub)                             │
│  ├─ Cria Customer no Stripe (email)                                  │
│  ├─ Cria Subscription                                                │
│  └─ Retorna subscription_id para Supabase                            │
│                                                                       │
│  POST /api/stripe/webhook (Stripe Endpoint URL)                      │
│  ├─ Verifica assinatura do webhook (stripe secret)                   │
│  ├─ Processa eventos:                                                │
│  │  • payment_intent.succeeded → Ativa acesso (FinanceContext)       │
│  │  • customer.subscription.created → Salva subscription             │
│  │  • customer.subscription.updated → Atualiza status                │
│  │  • customer.subscription.deleted → Revoga acesso                  │
│  └─ Retorna 200 OK ao Stripe                                         │
│                                                                       │
│  POST /api/stripe/cancel-subscription                                │
│  ├─ Valida user_id                                                   │
│  ├─ Recupera subscription_id do Supabase                             │
│  ├─ Cancela no Stripe                                                │
│  └─ Webhook processa (customer.subscription.deleted)                 │
│                                                                       │
└────────────────┼──────────────────────────────────────────────────────┘
                 │
                 ▼
┌───────────────────────────────────────────────────────────────────────┐
│           SUPABASE (PostgreSQL + Realtime)                            │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Table: stripe_sessions                                               │
│  ├─ id (uuid, PK)                                                    │
│  ├─ user_id (uuid, FK → auth.users)                                  │
│  ├─ session_id (text) ← Stripe Checkout Session ID                   │
│  ├─ plan_id (text) - 'lite' | 'premium'                              │
│  ├─ amount (numeric) - R$ em centavos                                │
│  ├─ currency (text) - 'brl'                                          │
│  ├─ status (text) - 'pending' | 'completed' | 'failed'               │
│  ├─ created_at (timestamp)                                           │
│  └─ metadata (jsonb) - custom fields                                 │
│                                                                        │
│  Table: stripe_subscriptions                                          │
│  ├─ id (uuid, PK)                                                    │
│  ├─ user_id (uuid, FK → auth.users) [UNIQUE]                         │
│  ├─ stripe_customer_id (text)                                        │
│  ├─ stripe_subscription_id (text)                                    │
│  ├─ plan_id (text) - 'lite_sub' | 'premium_sub'                      │
│  ├─ status (text) - 'active' | 'past_due' | 'canceled'               │
│  ├─ current_period_start (timestamp)                                 │
│  ├─ current_period_end (timestamp)                                   │
│  ├─ cancel_at (timestamp, nullable)                                  │
│  ├─ created_at (timestamp)                                           │
│  └─ updated_at (timestamp)                                           │
│                                                                        │
│  Table: user_access (Nova)                                            │
│  ├─ id (uuid, PK)                                                    │
│  ├─ user_id (uuid, FK → auth.users) [UNIQUE]                         │
│  ├─ access_type (text) - 'lite' | 'premium' | 'none'                 │
│  ├─ access_granted_at (timestamp)                                    │
│  ├─ access_expires_at (timestamp, nullable)                          │
│  ├─ source (text) - 'stripe_payment' | 'stripe_subscription'         │
│  └─ updated_at (timestamp)                                           │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 2. FLUXOS DE DADOS

### Fluxo 1: Pagamento Parcelado (One-Time Payment - 12x)

```
Usuário → Click "Comprar Lite (R$ 99,90)" → SalesPage.tsx
   ↓
Frontend chama: POST /api/stripe/checkout-session { planId: 'lite', mode: 'payment' }
   ↓
Backend Express:
  1. Valida planId e usuário
  2. Stripe API: createCheckoutSession({
       mode: 'payment',
       line_items: [{ price: STRIPE_PRICE_ID_LITE, quantity: 1 }],
       allow_promotion_codes: true,
       success_url: 'https://app.spfp.com.br/checkout/success?session_id={CHECKOUT_SESSION_ID}',
       cancel_url: 'https://app.spfp.com.br/checkout/cancel'
     })
  3. Salva em stripe_sessions table (status: 'pending')
  4. Retorna { url: checkout.url, sessionId: checkout.id }
   ↓
Frontend: window.location.href = checkout.url
   ↓
Stripe Checkout (hosted):
  - Usuário entra email/cartão
  - Stripe processa pagamento (12x automático configurado no Product)
  - Stripe cria payment_intent com status 'succeeded'
   ↓
Stripe → Backend Webhook (POST /api/stripe/webhook)
  Event: payment_intent.succeeded
  1. Valida assinatura do webhook
  2. Atualiza stripe_sessions (status: 'completed')
  3. Insere/atualiza user_access (access_type: 'lite', expires_at: 12 meses)
  4. Retorna 200 OK ao Stripe
   ↓
Usuário redirecionado para: https://app.spfp.com.br/checkout/success
  - Página mostra "Acesso Ativado!"
  - useAuth() detecta user.premium = true
  - Acesso ao Dashboard liberado
   ↓
FinanceContext carrega dados premium do usuário
```

### Fluxo 2: Assinatura Recorrente (Subscription - R$ 99,90/mês)

```
Usuário → Click "Assinar Lite (R$ 99,90/mês)" → SalesPage.tsx
   ↓
Frontend chama: POST /api/stripe/subscription { planId: 'lite_sub' }
   ↓
Backend Express:
  1. Valida planId
  2. Stripe API:
     a. getOrCreateCustomer({ email: user.email })
     b. createSubscription({
          customer: stripe_customer_id,
          items: [{ price: STRIPE_PRICE_ID_LITE_MONTHLY }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent']
        })
  3. Se payment_intent.status === 'requires_action':
     - Retorna { clientSecret, subscriptionId } para 3D Secure
  4. Salva em stripe_subscriptions (status: 'active' ou 'incomplete')
  5. Retorna { clientSecret, subscriptionId, requiresAction: boolean }
   ↓
Frontend (se requiresAction):
  - Usa Stripe.js confirmCardPayment(clientSecret)
  - Usuário completa 3D Secure se necessário
   ↓
Stripe → Backend Webhook (POST /api/stripe/webhook)
  Events: customer.subscription.created / payment_intent.succeeded
  1. Valida assinatura
  2. Atualiza stripe_subscriptions (status: 'active')
  3. Insere user_access (access_type: 'lite', expires_at: null ← recorrente)
  4. Retorna 200 OK
   ↓
Usuário redirecionado para Dashboard
   ↓
Mês seguinte: Stripe cobra automaticamente
  - Se falhar: Stripe tenta novamente
  - Se suceder: Webhook atualiza current_period_end
  - Se cancelado: customer.subscription.deleted → revoga acesso
```

### Fluxo 3: Verificação de Acesso (Frontend)

```
App.tsx carrega → AuthContext verifica user
   ↓
FinanceContext: useSafeFinance()
  1. Consulta user_access table pelo user_id
  2. Verifica: access_type !== 'none' E access_expires_at > now() (se one-time)
  3. Define: isAccessActive, currentPlan
   ↓
Dashboard/Features:
  - Se isAccessActive:
    - Mostra features PRO (AI insights, etc.)
    - Desbloqueia FinanceContext completo
  - Se não:
    - Mostra versão LITE
    - Modal: "Upgrade para PRO"
```

---

## 3. DECISÕES ARQUITETURAIS PRINCIPAIS

### 3.1 Stripe Checkout: Que Formato Usar?

| Decisão | Opção A: Payment Links | Opção B: Checkout Sessions |
|---------|------------------------|--------------------------|
| **Descrição** | URL pré-gerada, reutilizável | Sessão dinâmica, 1x use |
| **Flexibilidade** | Baixa (URL estática) | Alta (params dinâmicos) |
| **Customização** | Limitada (branding) | Completa (UX) |
| **Multi-uso** | Sim (mesmo link para todos) | Não (session per user) |
| **Rastreamento** | Difícil (sem session ID) | Fácil (sessionId único) |

**DECISÃO: CHECKOUT SESSIONS**
- Cada usuário gera uma sessão única
- Melhor rastreamento em `stripe_sessions` table
- Customização de URLs de sucesso/cancelamento
- Integração com Webhooks mais confiável

---

### 3.2 Armazenamento de Dados de Subscription

| Camada | Dados | Sincronização |
|--------|-------|---------------|
| **Stripe** | Source of Truth | Único |
| **Supabase** | Cache + Estado UI | Webhook-driven |
| **LocalStorage** | Estado temporal | Manual (useFinance) |

**Fluxo de Sincronização:**
```
Stripe (evento) → Webhook → Supabase (update) → FinanceContext (refetch) → UI
```

**Benefícios:**
- Supabase é source de truth para estado do app
- Stripe é source de truth para cobrança
- Webhooks garantem consistência eventual

---

### 3.3 Segurança: Onde Vive a Secret Key?

| Local | Public? | Função |
|-------|---------|--------|
| Frontend (.env) | SIM | `VITE_STRIPE_PUBLISHABLE_KEY` |
| Backend (.env) | NÃO | `STRIPE_SECRET_KEY` |
| Backend (memory) | NÃO | Webhook signing secret |

**Regra de Ouro:**
```
❌ NUNCA expor STRIPE_SECRET_KEY ao frontend
❌ NUNCA fazer API calls de Stripe direto do React
✅ SEMPRE passar por backend seguro
✅ SEMPRE validar webhooks com secret
```

---

### 3.4 Fluxo Pós-Pagamento: Confirmação Segura

**Problema:** Usuário completa pagamento mas frontend não sabe

**Solução:**
1. Frontend redireciona para `/checkout/success?session_id=xxx`
2. Frontend chama: `GET /api/stripe/session-status/:sessionId`
3. Backend:
   - Recupera Stripe session via API
   - Verifica status (paid vs. unpaid)
   - Retorna `{ status: 'paid', accessGranted: true }`
4. Frontend confia no backend (não confia em URL params)

```typescript
// ❌ INSEGURO
const isPaid = new URLSearchParams(location.search).get('paid') === 'true';

// ✅ SEGURO
const response = await fetch(`/api/stripe/session-status/${sessionId}`);
const { status } = await response.json();
const isPaid = status === 'paid';
```

---

### 3.5 Tratamento de Erros e Fallbacks

| Cenário | Ação |
|---------|------|
| Stripe indisponível | Mostrar modal "Tente novamente em 5min" |
| Webhook falha (timeout) | Stripe retry automático (24h) + Log em error_logs |
| Sessão expirada (24h) | Criar nova sessão, descartar antiga |
| Webhook duplicado | Idempotência via evento ID + timestamp |

**Implementar em errorRecovery.ts:**
```typescript
// Já existe padrão em CLAUDE.md, reutilizar!
withErrorRecovery(
  () => stripe.checkout.sessions.create(...),
  'Create checkout session',
  { maxRetries: 3, userId: user?.id }
);
```

---

## 4. STACK TÉCNICO DETALHADO

### 4.1 Frontend (React 19 + Stripe.js)

**Instalação:**
```bash
npm install @stripe/stripe-js
```

**Estrutura de Componentes:**
```
src/components/
├── SalesPage.tsx (landing, pricing cards)
├── PricingCard.tsx (reusável, com botão de compra)
├── checkout/
│   ├── CheckoutPage.tsx (parcelado)
│   ├── SubscriptionPage.tsx (recorrente)
│   ├── SuccessPage.tsx (confirmação)
│   └── CancelPage.tsx (cancelamento)
└── subscription/
    ├── SubscriptionManager.tsx (gerenciar plano)
    └── CancelModal.tsx (cancelar assinatura)
```

**Variáveis de Ambiente (.env.local):**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_XXX
VITE_API_BASE_URL=http://localhost:3001
```

### 4.2 Backend (Node.js + Express)

**Instalação:**
```bash
npm install stripe express
```

**Arquitetura:**
```
backend/
├── routes/
│   └── stripe.ts (endpoints)
├── controllers/
│   └── stripeController.ts (lógica)
├── services/
│   ├── stripeService.ts (Stripe API)
│   └── stripeWebhookService.ts (webhooks)
├── middleware/
│   └── verifyStripeWebhook.ts (validação)
└── db/
    └── stripeQueries.ts (Supabase)
```

**Endpoints:**

| Método | Path | Auth | Retorna |
|--------|------|------|---------|
| POST | `/api/stripe/checkout-session` | JWT | `{ url, sessionId }` |
| POST | `/api/stripe/subscription` | JWT | `{ clientSecret, subscriptionId }` |
| GET | `/api/stripe/session-status/:id` | JWT | `{ status, accessGranted }` |
| POST | `/api/stripe/webhook` | Signature | `{ received: true }` |
| POST | `/api/stripe/cancel-subscription` | JWT | `{ canceled: true }` |
| GET | `/api/stripe/subscription` | JWT | `{ subscription }` |

**Variáveis de Ambiente (.env):**
```env
STRIPE_SECRET_KEY=sk_live_XXX
STRIPE_WEBHOOK_SECRET=whsec_XXX
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJXXX
```

### 4.3 Supabase (PostgreSQL)

**Tabelas SQL:**
```sql
-- Tabela de Sessões de Checkout
CREATE TABLE IF NOT EXISTS stripe_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('lite', 'premium')),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'brl',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP DEFAULT (now() + INTERVAL '24 hours'),
  metadata JSONB,
  UNIQUE(user_id, session_id)
);

-- Tabela de Subscriptions
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('lite_sub', 'premium_sub')),
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'unpaid', 'canceled')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Tabela de Acesso de Usuários
CREATE TABLE IF NOT EXISTS user_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('lite', 'premium', 'none')),
  access_granted_at TIMESTAMP DEFAULT now(),
  access_expires_at TIMESTAMP, -- NULL = infinito (subscription)
  source TEXT NOT NULL CHECK (source IN ('stripe_payment', 'stripe_subscription', 'admin_grant', 'trial')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices
CREATE INDEX idx_stripe_sessions_user ON stripe_sessions(user_id);
CREATE INDEX idx_stripe_sessions_status ON stripe_sessions(status);
CREATE INDEX idx_stripe_subscriptions_user ON stripe_subscriptions(user_id);
CREATE INDEX idx_stripe_subscriptions_status ON stripe_subscriptions(status);
CREATE INDEX idx_user_access_user ON user_access(user_id);

-- Row Level Security (RLS)
ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users see own sessions" ON stripe_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users see own subscriptions" ON stripe_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users see own access" ON user_access
  FOR SELECT USING (auth.uid() = user_id);

-- Service role pode atualizar (webhooks)
CREATE POLICY "Service role manages sessions" ON stripe_sessions
  FOR ALL USING (auth.uid() = user_id OR current_setting('role') = 'service_role');

CREATE POLICY "Service role manages subscriptions" ON stripe_subscriptions
  FOR ALL USING (auth.uid() = user_id OR current_setting('role') = 'service_role');

CREATE POLICY "Service role manages access" ON user_access
  FOR ALL USING (auth.uid() = user_id OR current_setting('role') = 'service_role');
```

---

## 5. PRODUTOS STRIPE (Configuração Recomendada)

### 5.1 Produtos a Criar no Dashboard Stripe

**Produto 1: SPFP Lite (One-Time)**
```
Nome: SPFP Lite - Acesso Permanente
Descrição: Acesso a funcionalidades básicas do SPFP
Tipo: Standard

Preço 1:
  - Tipo: Billing period (faturamento único)
  - Valor: R$ 99,90
  - Recorrência: Nenhuma (one-time)
  - ID do Preço: price_lite_onetime

Preço 2 (para parcelamento no Stripe):
  - Tipo: Billing period
  - Valor: R$ 99,90
  - Parcelamento: 12 parcelas (configurado na conta Stripe)
  - ID do Preço: price_lite_installments
```

**Produto 2: SPFP Lite Subscription (Recurring)**
```
Nome: SPFP Lite - Assinatura Mensal
Descrição: Acesso recorrente mensal

Preço:
  - Tipo: Subscription
  - Valor: R$ 99,90
  - Recorrência: Mensal
  - ID do Preço: price_lite_monthly
```

**Produto 3: SPFP Premium (One-Time)**
```
Nome: SPFP Premium com IA - Acesso Permanente
Descrição: Acesso completo com IA Gemini

Preço 1:
  - Tipo: Billing period
  - Valor: R$ 349,90
  - Recorrência: Nenhuma
  - ID do Preço: price_premium_onetime

Preço 2 (parcelado):
  - Valor: R$ 349,90
  - Parcelamento: 12x
  - ID do Preço: price_premium_installments
```

**Produto 4: SPFP Premium Subscription (Recurring)**
```
Nome: SPFP Premium com IA - Assinatura Mensal
Descrição: Acesso recorrente com IA premium

Preço:
  - Tipo: Subscription
  - Valor: R$ 349,90
  - Recorrência: Mensal
  - ID do Preço: price_premium_monthly
```

### 5.2 Configurações Stripe Essenciais

**Webhooks Endpoint:**
```
URL: https://api.spfp.com.br/api/stripe/webhook
Método: POST
Eventos:
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_succeeded
  - invoice.payment_failed
```

**Modo de Pagamento:**
```
✅ Card (Crédito/Débito)
✅ Pix (Brasil, para melhorar conversão)
✅ Boleto (Brasil)
❓ Wallet (Apple Pay, Google Pay) - futura
```

---

## 6. FLUXO DE IMPLEMENTAÇÃO (Fases)

### Fase 1: Setup Backend (1-2 dias)
- [ ] Criar endpoints Express (`/api/stripe/*`)
- [ ] Implementar Stripe API calls (checkout, subscription)
- [ ] Setup webhook listener com validação
- [ ] Testes locais com Stripe CLI

### Fase 2: Supabase (1 dia)
- [ ] Executar migrações SQL
- [ ] Configurar RLS policies
- [ ] Testes de leitura/escrita

### Fase 3: Frontend (2-3 dias)
- [ ] Criar componentes de pricing
- [ ] Integração Stripe.js (checkout)
- [ ] Páginas de sucesso/cancelamento
- [ ] Verificação de acesso em FinanceContext

### Fase 4: Integração (1 dia)
- [ ] Testar fluxo completo E2E
- [ ] Configurar webhooks em produção
- [ ] Teste com cartão real (test account)

### Fase 5: Deploy & Monitoramento (1 dia)
- [ ] Deploy para produção
- [ ] Configurar alertas de webhook
- [ ] Documentação para time

---

## 7. TRATAMENTO DE ERROS (Error Recovery Pattern)

**Utilizar padrão existente em errorRecovery.ts:**

```typescript
// Exemplo: Criar checkout session
import { withErrorRecovery } from '../services/errorRecovery';

const handleBuyNow = async (planId: 'lite' | 'premium') => {
  try {
    const result = await withErrorRecovery(
      () => fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      }).then(r => r.json()),
      'Create Stripe checkout session',
      {
        maxRetries: 2,
        userId: user?.id,
        metadata: { planId }
      }
    );

    window.location.href = result.url;
  } catch (error: any) {
    showErrorToast(error.userMessage || 'Erro ao iniciar checkout');
  }
};
```

**Casos de Erro Tratados:**
- ❌ Network timeout → Retry automático
- ❌ Invalid plan ID → Erro de validação (sem retry)
- ❌ Stripe API down → Modo degradado + sugestão de tentar depois
- ❌ Webhook falha → Retry automático (Stripe), monitoramento manual

---

## 8. SEGURANÇA CHECKLIST

| Item | Implementar | Verificar |
|------|------------|-----------|
| VITE_STRIPE_KEY | ✅ Frontend (public) | Não expõe secret |
| STRIPE_SECRET_KEY | ✅ Backend only | .env + .gitignore |
| Webhook validation | ✅ Verificar signature | Usar `stripe.webhooks.constructEvent()` |
| HTTPS | ✅ Produção only | Redireciona HTTP → HTTPS |
| CORS | ✅ Whitelist origin | Apenas app.spfp.com.br |
| JWT validation | ✅ Auth middleware | Valida token antes de APIs |
| SQL injection | ✅ Usar Supabase SDK | Prepared statements |
| Idempotência | ✅ Webhook ID cache | Previne duplicatas |

---

## 9. MONITORAMENTO & OBSERVABILIDADE

### Logs Estruturados
```typescript
// Em webhooks/controllers
logger.info('Webhook processed', {
  eventId: event.id,
  eventType: event.type,
  userId: customer_id,
  timestamp: new Date().toISOString(),
  status: 'success' | 'failed'
});
```

### Métricas
- Checkout sessions criadas/dia
- Taxa de conversão (sessions → payments)
- Webhook latency
- Erro rate por tipo

### Alertas
- Webhook falhas consecutivas (> 3)
- Discrepância de dados (Stripe vs. Supabase)
- High error rate (> 5%)

---

## 10. DECISÕES ABERTAS (Para Discussão)

| Item | Opção A | Opção B | Decisão |
|------|---------|---------|---------|
| **Modo Pagamento via Boleto?** | Sim (Brasil) | Não (complexo) | Depende requisito |
| **Descontos/Cupons?** | Sim via Stripe | Não | TBD |
| **Trial Period?** | 7 dias free | Nenhum | TBD |
| **Downgrade automático?** | Premium → Lite | Cancelamento | TBD |
| **Reembolsos?** | Manual admin | Automático 30d | TBD |

---

## 11. REFERÊNCIAS E RECURSOS

**Documentação Official:**
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe API Reference](https://stripe.com/docs/api)

**Padrões SPFP:**
- Error Recovery: `src/services/errorRecovery.ts`
- Auth Pattern: `src/context/AuthContext.tsx`
- Supabase Integration: `src/supabase.ts`
- Service Pattern: `src/services/*.ts`

---

## 12. PRÓXIMAS AÇÕES (Checklist de Implementação)

- [ ] Criar conta Stripe (ou usar produção)
- [ ] Criar 4 produtos + preços no Stripe Dashboard
- [ ] Gerar STRIPE_SECRET_KEY e STRIPE_PUBLISHABLE_KEY
- [ ] Configurar Webhook endpoint
- [ ] Revisar arquitetura com @dev e @devops
- [ ] Iniciar Fase 1 (Backend)
- [ ] Documentar decisões finais

---

**Documento assinado por**: Aria (Arquiteta)
**Data**: 2026-02-17
**Status**: Pronto para Implementação ✅
