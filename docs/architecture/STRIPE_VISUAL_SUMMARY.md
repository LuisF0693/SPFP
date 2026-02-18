# Integração Stripe - Resumo Visual

---

## DIAGRAMA: Fluxo de Pagamento (12x Parcelado)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          LANDING PAGE (SalesPage.tsx)                   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ PRICING CARDS                                                  │    │
│  │                                                                │    │
│  │  ┌─────────────────┐    ┌─────────────────────┐              │    │
│  │  │ LITE - R$ 99.90 │    │ PREMIUM - R$ 349.90 │              │    │
│  │  │   (12x)         │    │    (12x)            │              │    │
│  │  │ [Comprar]       │    │ [Comprar] ⭐        │              │    │
│  │  └─────────────────┘    └─────────────────────┘              │    │
│  │                                                                │    │
│  │  ┌─────────────────┐    ┌─────────────────────┐              │    │
│  │  │ LITE - R$ 99.90 │    │ PREMIUM - R$ 349.90 │              │    │
│  │  │   (Mensal)      │    │  (Mensal)           │              │    │
│  │  │ [Assinar]       │    │ [Assinar]           │              │    │
│  │  └─────────────────┘    └─────────────────────┘              │    │
│  │                                                                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                              ↓ clique                                   │
│                      onClick={initiateCheckout}                        │
└─────────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND: POST /api/stripe/checkout                   │
│                                                                          │
│  1. Validar usuário (JWT)                                              │
│  2. Validar planId (lite|premium)                                      │
│  3. Mapear para STRIPE_PRICE_ID                                        │
│  4. Stripe API: createCheckoutSession({                               │
│       mode: 'payment',                                                 │
│       line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],        │
│       success_url: '/.../success?session_id={CHECKOUT_SESSION_ID}'  │
│       cancel_url: '/.../cancel'                                      │
│     })                                                                  │
│  5. Salvar em stripe_sessions table (status: 'pending')               │
│  6. Retorna { url, sessionId }                                        │
└─────────────────────────────────────────────────────────────────────────┘
         ↓ window.location.href = url
┌─────────────────────────────────────────────────────────────────────────┐
│                     STRIPE CHECKOUT (Hosted Page)                       │
│                                                                          │
│  [Stripe Logo]                                                         │
│                                                                          │
│  Seu pedido:                                                           │
│  ┌──────────────────────────────────┐                                  │
│  │ SPFP Lite                R$ 99.90 │                                  │
│  │ x 12 parcelas           de 8.33  │                                  │
│  │                                  │                                  │
│  │ Subtotal          R$ 99.90      │                                  │
│  │ Taxa de processam R$ 0.00       │                                  │
│  └──────────────────────────────────┘                                  │
│                                                                          │
│  Email: [user@email.com]                                              │
│  Cartão: [4242 4242 4242 4242] [MM/YY] [CVC]                         │
│  Parcelamento: 12x de R$ 8.33                                         │
│                                                                          │
│  [Comprar com segurança]  [Cancelar]                                  │
│                                                                          │
│  Powered by Stripe                                                     │
└─────────────────────────────────────────────────────────────────────────┘
         ↓ Usuário confirma + Stripe processa
┌─────────────────────────────────────────────────────────────────────────┐
│                        STRIPE (Backend)                                 │
│                                                                          │
│  • Valida cartão                                                       │
│  • Processa pagamento                                                  │
│  • Cria PaymentIntent (status: succeeded)                              │
│  • Envia webhook: payment_intent.succeeded                             │
└─────────────────────────────────────────────────────────────────────────┘
         ↓ HTTPS POST to https://api.spfp.com.br/api/stripe/webhook
┌─────────────────────────────────────────────────────────────────────────┐
│                   BACKEND: Webhook Handler                              │
│                                                                          │
│  1. Validar assinatura (stripe.webhooks.constructEvent)               │
│  2. Extrair event.data.object (PaymentIntent)                         │
│  3. Atualizar stripe_sessions (status: 'completed')                   │
│  4. Inserir/atualizar user_access:                                    │
│     { access_type: 'lite',                                            │
│       access_expires_at: now + 365 dias }                             │
│  5. Retornar 200 OK                                                   │
└─────────────────────────────────────────────────────────────────────────┘
         ↓ Redirect to /checkout/success?session_id=xxx
┌─────────────────────────────────────────────────────────────────────────┐
│                  FRONTEND: Success Page (React)                         │
│                                                                          │
│  1. useEffect({                                                        │
│       - GET /api/stripe/session-status/{sessionId}                    │
│       - Verificar se status === 'complete' && accessGranted           │
│     })                                                                  │
│                                                                          │
│  ✅ SUCESSO!                                                           │
│                                                                          │
│  Seu acesso foi ativado.                                              │
│  Redirecting to dashboard...                                          │
│                                                                          │
│  [Dashboard] [Voltar para Home]                                       │
└─────────────────────────────────────────────────────────────────────────┘
         ↓ navigate('/dashboard')
┌─────────────────────────────────────────────────────────────────────────┐
│                      DASHBOARD (Acesso Premium)                         │
│                                                                          │
│  ✅ Todas as features premium desbloqueadas                           │
│  ✅ IA Insights ativado                                               │
│  ✅ Dashboard completo carregado                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## DIAGRAMA: Fluxo de Assinatura Recorrente

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    [Clique em "ASSINAR LITE - R$ 99.90/mês"]            │
└─────────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────────┐
│         BACKEND: POST /api/stripe/subscription                          │
│                                                                          │
│  1. Validar usuário + planId (lite_sub|premium_sub)                   │
│  2. getOrCreateCustomer(email, userId):                                │
│     - Buscar customer existente no Stripe                             │
│     - Se não existe, criar novo                                       │
│  3. Stripe API: createSubscription({                                  │
│       customer: stripe_customer_id,                                   │
│       items: [{ price: STRIPE_PRICE_ID_MONTHLY }],                   │
│       payment_behavior: 'default_incomplete'                          │
│     })                                                                  │
│  4. Se payment_intent.status === 'requires_action':                   │
│     - Retornar clientSecret para 3D Secure                           │
│  5. Salvar em stripe_subscriptions (status: 'active'|'incomplete')    │
└─────────────────────────────────────────────────────────────────────────┘
         ↓ Retorna { clientSecret?, subscriptionId, requiresAction }
┌─────────────────────────────────────────────────────────────────────────┐
│                   FRONTEND: Confirmação 3D Secure (se needed)           │
│                                                                          │
│  if (requiresAction) {                                                 │
│    stripe.confirmCardPayment(clientSecret)                           │
│      → Usuário completa 3D Secure                                     │
│  }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────────┐
│            STRIPE: Processa Primeira Cobrança da Assinatura            │
│                                                                          │
│  • Valida cartão                                                       │
│  • Debita R$ 99.90                                                    │
│  • Cria Invoice                                                        │
│  • Envia webhooks:                                                     │
│    - customer.subscription.created                                    │
│    - payment_intent.succeeded                                         │
│    - invoice.payment_succeeded                                        │
└─────────────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                  BACKEND: Processa Webhooks                             │
│                                                                          │
│  Event: customer.subscription.created                                 │
│  └─ Atualizar stripe_subscriptions:                                   │
│     { status: 'active',                                               │
│       current_period_start: now,                                      │
│       current_period_end: now + 30d }                                 │
│                                                                          │
│  Event: payment_intent.succeeded                                      │
│  └─ Atualizar user_access:                                            │
│     { access_type: 'lite',                                            │
│       access_expires_at: null } ← infinito                            │
│                                                                          │
│  Retorna 200 OK                                                        │
└─────────────────────────────────────────────────────────────────────────┘
         ↓ Stripe redireciona para /checkout/success
┌─────────────────────────────────────────────────────────────────────────┐
│                     FRONTEND: Dashboard (Acesso Ativado)                │
│                                                                          │
│  ✅ Assinatura ativa                                                   │
│  ✅ Próxima cobrança: em 30 dias                                      │
│  ✅ [Gerenciar assinatura] [Cancelar]                                 │
└─────────────────────────────────────────────────────────────────────────┘
         ↓ A cada 30 dias automaticamente
┌─────────────────────────────────────────────────────────────────────────┐
│              STRIPE: Renovação Automática (Mês Seguinte)               │
│                                                                          │
│  current_period_end == today ?                                        │
│  └─ SIM: Cobrar R$ 99.90 automaticamente                              │
│     ├─ Se sucesso: invoice.payment_succeeded → webhook                │
│     ├─ Se falha: invoice.payment_failed → retry automático            │
│     └─ Webhook: customer.subscription.updated                         │
│                                                                          │
│  Repetir infinitamente até cancelamento                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## DIAGRAMA: Estrutura de Dados (Supabase)

```
┌──────────────────────────────────────────────────────────────────────┐
│                      auth.users (Supabase Auth)                      │
├──────────────────────────────────────────────────────────────────────┤
│ id (uuid)      │ email            │ email_confirmed_at  │ ...        │
├────────────────┼──────────────────┼─────────────────────┼────────────┤
│ abc-123        │ user@email.com   │ 2026-02-17          │ ...        │
│ xyz-789        │ other@email.com  │ 2026-02-15          │ ...        │
└────────────────────────────────────────────────────────────────────┬──┘
                                                                       │
        ┌──────────────────────────────────────────────────────────┬──┘
        │                                                           │
        ▼                                                           ▼
┌──────────────────────────────────────────────┐  ┌──────────────────────────────┐
│      stripe_sessions (Checkout One-Time)     │  │  stripe_subscriptions        │
├──────────────────────────────────────────────┤  ├──────────────────────────────┤
│ id (uuid)     | PK                           │  │ id (uuid)         | PK       │
│ user_id (fk) | FK → auth.users              │  │ user_id (fk)     | FK, UNQ  │
│ session_id    | Stripe ID                   │  │ stripe_customer  | Unique   │
│ plan_id       | 'lite' | 'premium'          │  │ stripe_subsc_id  | Unique   │
│ amount        | Em centavos                 │  │ plan_id          | Sub type │
│ currency      | 'brl'                       │  │ status           | active   │
│ status        | pending|completed|failed    │  │ current_period_s | timestamp│
│ created_at    | timestamp                   │  │ current_period_e | timestamp│
│ expires_at    | 24h                         │  │ cancel_at        | nullable │
│ metadata      | JSON (custom)               │  │ created_at       | timestamp│
│               |                              │  │ updated_at       | timestamp│
└──────────────────────────────────────────────┘  └──────────────────────────────┘
                   ↑                                          ↑
                   │ webhook: payment_intent.succeeded       │ webhook: subscription.*
                   │                                         │
        ┌──────────┴─────────────────────────────┬──────────┴───────┐
        │                                        │                  │
        ▼                                        ▼                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      user_access (Estado de Acesso)                  │
├──────────────────────────────────────────────────────────────────────┤
│ id (uuid)              │ PK                                          │
│ user_id (fk)           │ FK → auth.users [UNIQUE]                   │
│ access_type            │ 'lite' | 'premium' | 'none'                │
│ access_granted_at      │ timestamp (quando ativou)                  │
│ access_expires_at      │ timestamp (null = infinito)               │
│ source                 │ 'stripe_payment'|'stripe_subscription'... │
│ created_at             │ timestamp                                  │
│ updated_at             │ timestamp                                  │
├──────────────────────────────────────────────────────────────────────┤
│ Exemplo 1: One-Time Payment                                         │
│ abc-123 │ lite │ 2026-02-17 │ 2027-02-17 │ stripe_payment │ ...  │
│                                                                      │
│ Exemplo 2: Subscription (Ativa)                                     │
│ xyz-789 │ premium │ 2026-01-15 │ null │ stripe_subscription │ ... │
│                                                                      │
│ Exemplo 3: Sem Acesso                                              │
│ old-456 │ none │ 2025-01-15 │ 2025-07-15 │ stripe_payment │ ...  │
│                                          ↑ expirou                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## DIAGRAMA: Verificação de Acesso (Runtime)

```
┌─────────────────────────────────────────────────────────────┐
│   App.tsx carrega → AuthContext valida JWT                 │
│        ↓                                                    │
│        user = { id: 'abc-123', email: 'user@...' }         │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│  FinanceContext: useSafeFinance()                           │
│        ↓                                                    │
│  1. SELECT * FROM user_access WHERE user_id = 'abc-123'   │
│  2. Verificar:                                              │
│     - access_type !== 'none' ?                             │
│     - access_expires_at > now() ? (se one-time)           │
│                                                            │
│  Resultados:                                               │
│  ┌─────────────────────────────────┐                      │
│  │ isAccessActive: true/false      │                      │
│  │ currentPlan: 'lite'|'premium'   │                      │
│  │ isSubscribed: true/false        │                      │
│  │ accessExpiresAt: Date|null      │                      │
│  └─────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│  Dashboard.tsx renderiza baseado em acesso                 │
│                                                            │
│  if (isAccessActive) {                                    │
│    return <Dashboard mode={currentPlan} />                │
│  } else {                                                 │
│    return <UpgradeModal />                               │
│  }                                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## DIAGRAMA: Statuses de Transições

```
CHECKOUT SESSION:
┌──────────┐      webhook:success      ┌─────────────┐
│ pending  ├────────────────────────────▶ completed   │
└──────────┘                            └─────────────┘
     │
     │ 24h timeout
     ▼
┌──────────┐
│ expired  │
└──────────┘

SUBSCRIPTION:
             webhook:created            webhook:updated
┌──────────┐─────────────────────┐──────────────────────┐
│          │                     │                      │
▼          ▼                     ▼                      ▼
pending    active    past_due (retry)    canceled
                     ↑           ↓
                     └───────────┘
                  (payment fails)

PAID ACCESS:
┌──────────────────────┐    webhook:succeeded      ┌──────────┐
│ before purchase      │──────────────────────────▶ │  active  │
│ (access_type: none)  │                          │ (lite)   │
└──────────────────────┘                          └────┬─────┘
                                                       │
                                        ONE-TIME: 365d │ expires
                                        RECUR: null    │
                                                       ▼
                                           ┌──────────────────┐
                                           │  expired/inactive│
                                           │ (access_type:none)
                                           └──────────────────┘
```

---

## DIAGRAMA: Arquitetura de Segurança

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                           │
│                                                                 │
│  VITE_STRIPE_PUBLISHABLE_KEY = pk_live_XXX (SEGURO, PUBLIC)  │
│                                                                 │
│  ✅ Pode fazer: POST to /api/stripe/checkout-session         │
│  ❌ Nunca pode: ter acesso a STRIPE_SECRET_KEY              │
│  ❌ Nunca pode: chamar Stripe API diretamente               │
└──────────────────────────────────────┬──────────────────────────┘
                                       │ HTTPS
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
        ┌────────────────────────┐         ┌──────────────────────────┐
        │  Your Backend (Node)    │         │  Stripe API (https)      │
        │                        │         │                          │
        │  STRIPE_SECRET_KEY = ? │         │  Only accepts            │
        │  .env (SEGURO, PRIVADO)│         │  secret key              │
        │                        │         │                          │
        │  Endpoints:            │         │  Webhooks via:           │
        │  POST /checkout        │         │  signature verify        │
        │  POST /subscription    │         │  (webhook secret)        │
        │  POST /webhook         │         │                          │
        │  DELETE /subscription  │         └──────────────────────────┘
        │                        │
        │  ✅ Pode: usar secret key
        │  ✅ Pode: validar webhooks
        │  ✅ Pode: acessar API Stripe
        │  ❌ Nunca: expor secret ao frontend
        └────────────────────────┘
                    │
                    │ Supabase SDK (com JWT)
                    │
                    ▼
        ┌────────────────────────┐
        │  Supabase PostgreSQL    │
        │                        │
        │  stripe_sessions       │
        │  stripe_subscriptions  │
        │  user_access           │
        │                        │
        │  RLS Policies: ✅      │
        │  - Usuário vê próprio  │
        │  - Service role edita  │
        └────────────────────────┘

FLUXO SEGURO:
1. Frontend: POST /api/stripe/checkout (sem secret)
2. Backend: Valida JWT, chama Stripe API com secret
3. Stripe: Retorna session URL
4. Frontend: Redireciona para Stripe (seguro, hosted)
5. Stripe: Processa pagamento
6. Stripe: Webhook → Backend (valida signature)
7. Backend: Atualiza Supabase
8. Frontend: Lê user_access (via RLS)

NUNCA:
❌ Expor sk_live_XXX ao frontend
❌ Chamar Stripe API direto do React
❌ Confiar em dados do frontend para acesso
✅ SEMPRE validar no backend
```

---

## TABELA RÁPIDA: Endpoints

```
╔════════════════════════════════════════════════════════════════════╗
║                     BACKEND ENDPOINTS                              ║
╠════════════════════════════════════════════════════════════════════╣
║ POST   /api/stripe/checkout-session       │ Auth: JWT            ║
║        planId: 'lite'|'premium'            │ Retorna: { url }     ║
║                                             │                      ║
║ GET    /api/stripe/session-status/:id     │ Auth: JWT            ║
║        → status: 'paid'|'unpaid'           │ Retorna: { status }  ║
║                                             │                      ║
║ POST   /api/stripe/subscription            │ Auth: JWT            ║
║        planId: 'lite_sub'|'premium_sub'    │ Retorna: { secret }  ║
║                                             │                      ║
║ GET    /api/stripe/subscription            │ Auth: JWT            ║
║        → dados da assinatura atual         │ Retorna: { sub }     ║
║                                             │                      ║
║ POST   /api/stripe/cancel-subscription    │ Auth: JWT            ║
║        → cancela assinatura                │ Retorna: { canceled} ║
║                                             │                      ║
║ POST   /api/stripe/webhook                │ Auth: Signature      ║
║        event: Stripe Event                 │ Retorna: { received}║
║                                             │                      ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## CHECKLIST: Antes de Implementar

```
SETUP STRIPE:
□ Conta Stripe criada (test + live)
□ 4 Produtos criados (lite, premium, lite_sub, premium_sub)
□ 4 Preços criados (99.90 + 349.90, mensal)
□ Webhook endpoint configurado

BACKEND SETUP:
□ Express server pronto
□ Stripe SDK instalado (@stripe/stripe-js)
□ Supabase SDK instalado
□ 3 tabelas criadas (stripe_sessions, subscriptions, user_access)
□ RLS policies implementadas
□ .env com chaves (SK + PK)

FRONTEND SETUP:
□ React 19 com TypeScript
□ Stripe.js library (npm install @stripe/stripe-js)
□ useStripeCheckout hook criado
□ PricingCard component criado
□ Success/Cancel pages criadas

TESTES:
□ Teste com cartão 4242 4242 4242 4242 (test mode)
□ Webhook local com Stripe CLI
□ E2E: checkout → webhook → acesso → dashboard

DEPLOY:
□ Chaves production no .env
□ Webhook endpoint apontando para live
□ HTTPS ativado
□ Monitoring/logs configurado
□ Alerta para webhook failures

```

---

**Este documento é visual. Para detalhes técnicos, ver:**
- `STRIPE_INTEGRATION_ARCHITECTURE.md` (Completo)
- `STRIPE_CODE_PATTERNS.md` (Exemplos)
- `STRIPE_DECISIONS_FAQ.md` (FAQ)
