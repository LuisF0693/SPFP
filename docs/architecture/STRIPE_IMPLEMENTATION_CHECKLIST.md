# Checklist de Implementação Stripe - SPFP

**Status**: Pronto para Fase 1
**Data de Criação**: 2026-02-17
**Responsável**: @dev (Dex) + @devops (Gage) + @qa (Quinn)

---

## FASE 0: SETUP STRIPE (1 dia)

### 0.1 Conta Stripe

- [ ] Acessar stripe.com
- [ ] Criar conta ou usar existente
- [ ] Verificar email
- [ ] Ativar "Test Mode" no dashboard
- [ ] Copiar chaves:
  - [ ] VITE_STRIPE_PUBLISHABLE_KEY (pk_test_...)
  - [ ] STRIPE_SECRET_KEY (sk_test_...)
- [ ] Salvar em `.env.example` + `.env.local` (gitignored)

### 0.2 Produtos Stripe (Dashboard)

#### Produto 1: SPFP Lite (One-Time)
- [ ] Criar produto "SPFP Lite - Acesso Permanente"
- [ ] Descrição: "Acesso a funcionalidades básicas"
- [ ] Adicionar 1 preço:
  - [ ] R$ 99.90 (one-time)
  - [ ] Copiar Price ID: `price_lite_onetime`
  - [ ] Salvar em .env

#### Produto 2: SPFP Premium (One-Time)
- [ ] Criar produto "SPFP Premium com IA - Acesso Permanente"
- [ ] Descrição: "Acesso completo com IA Gemini"
- [ ] Adicionar 1 preço:
  - [ ] R$ 349.90 (one-time)
  - [ ] Copiar Price ID: `price_premium_onetime`
  - [ ] Salvar em .env

#### Produto 3: SPFP Lite Subscription
- [ ] Criar produto "SPFP Lite - Assinatura Mensal"
- [ ] Descrição: "Acesso recorrente mensal"
- [ ] Adicionar 1 preço:
  - [ ] R$ 99.90 (monthly)
  - [ ] Copiar Price ID: `price_lite_monthly`
  - [ ] Salvar em .env

#### Produto 4: SPFP Premium Subscription
- [ ] Criar produto "SPFP Premium com IA - Assinatura Mensal"
- [ ] Descrição: "Acesso recorrente com IA premium"
- [ ] Adicionar 1 preço:
  - [ ] R$ 349.90 (monthly)
  - [ ] Copiar Price ID: `price_premium_monthly`
  - [ ] Salvar em .env

### 0.3 Configuração de Métodos de Pagamento

- [ ] Dashboard → Payment methods
- [ ] Ativar: Cards (Crédito/Débito)
- [ ] Ativar: PIX (Brasil)
- [ ] ❓ Boleto (decidir depois)
- [ ] Salvar

### 0.4 Webhook Configuration

- [ ] Gerar webhook endpoint URL: `https://api.spfp.com.br/api/stripe/webhook`
- [ ] Dashboard → Webhooks → Add endpoint
- [ ] URL: `https://localhost:3001/api/stripe/webhook` (test)
- [ ] Selecionar eventos:
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
- [ ] Copiar Webhook Signing Secret: `whsec_test_...`
- [ ] Salvar em .env: `STRIPE_WEBHOOK_SECRET`

### 0.5 Variáveis de Ambiente

**Arquivo: `.env.local` (gitignored)**
```env
# Stripe Test Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXX
STRIPE_SECRET_KEY=sk_test_XXX
STRIPE_WEBHOOK_SECRET=whsec_test_XXX

# Stripe Price IDs
STRIPE_PRICE_LITE_ONETIME=price_lite_onetime
STRIPE_PRICE_PREMIUM_ONETIME=price_premium_onetime
STRIPE_PRICE_LITE_MONTHLY=price_lite_monthly
STRIPE_PRICE_PREMIUM_MONTHLY=price_premium_monthly

# API Configuration
VITE_API_BASE_URL=http://localhost:3001
APP_URL=http://localhost:3000
```

---

## FASE 1: BACKEND SETUP (2-3 dias)

### 1.1 Dependências

- [ ] Verificar se `stripe` package está instalado
  ```bash
  npm install stripe
  npm list stripe
  ```
- [ ] Verificar se `express` está disponível (backend)
- [ ] Verificar se `@supabase/supabase-js` está instalado

### 1.2 Estrutura de Diretórios (Backend)

```
backend/
├── src/
│   ├── routes/
│   │   └── stripe.ts          ← criar
│   ├── controllers/
│   │   └── stripeController.ts ← criar
│   ├── services/
│   │   ├── stripeService.ts    ← criar
│   │   └── stripeWebhookService.ts ← criar (opcional)
│   ├── middleware/
│   │   ├── auth.ts             ← existente (usar)
│   │   └── verifyStripeWebhook.ts ← criar
│   ├── db/
│   │   ├── supabase.ts         ← usar existente
│   │   └── stripeQueries.ts    ← criar (queries helpers)
│   └── utils/
│       └── logger.ts           ← usar existente
```

- [ ] Criar diretórios conforme acima

### 1.3 Stripe Service (`backend/src/services/stripeService.ts`)

- [ ] Criar arquivo
- [ ] Implementar métodos:
  - [ ] `createCheckoutSession()`
  - [ ] `getSessionStatus()`
  - [ ] `getOrCreateCustomer()`
  - [ ] `createSubscription()`
  - [ ] `cancelSubscription()`
  - [ ] `constructWebhookEvent()`
- [ ] Exportar `stripeService` object
- [ ] Testes unitários (vitest)
  - [ ] Mock Stripe API
  - [ ] Validar retornos

### 1.4 Webhook Verification Middleware

- [ ] Criar `backend/src/middleware/verifyStripeWebhook.ts`
- [ ] Implementar:
  - [ ] Validar header `stripe-signature`
  - [ ] Usar `stripe.webhooks.constructEvent()`
  - [ ] Validar secret
  - [ ] Adicionar event ao request
  - [ ] Error handling
- [ ] Testes:
  - [ ] Teste com assinatura válida
  - [ ] Teste com assinatura inválida
  - [ ] Teste com header faltando

### 1.5 Stripe Controller

- [ ] Criar `backend/src/controllers/stripeController.ts`
- [ ] Implementar métodos:
  - [ ] `createCheckoutSession()` - POST endpoint
  - [ ] `getSessionStatus()` - GET endpoint
  - [ ] `createSubscription()` - POST endpoint
  - [ ] `getSubscription()` - GET endpoint
  - [ ] `cancelSubscription()` - POST endpoint
  - [ ] `handleWebhook()` - POST webhook
- [ ] Implementar webhook handlers:
  - [ ] `handlePaymentIntentSucceeded()`
  - [ ] `handleSubscriptionCreated()`
  - [ ] `handleSubscriptionUpdated()`
  - [ ] `handleSubscriptionDeleted()`
- [ ] Error handling com logging
- [ ] Testes:
  - [ ] Teste cada endpoint
  - [ ] Teste erros de validação
  - [ ] Teste webhook processing

### 1.6 Stripe Routes

- [ ] Criar `backend/src/routes/stripe.ts`
- [ ] Definir endpoints:
  ```
  POST   /api/stripe/checkout-session
  GET    /api/stripe/session-status/:id
  POST   /api/stripe/subscription
  GET    /api/stripe/subscription
  POST   /api/stripe/cancel-subscription
  POST   /api/stripe/webhook
  ```
- [ ] Aplicar middleware de auth
- [ ] Testes E2E de roteamento

### 1.7 Supabase Helpers

- [ ] Criar `backend/src/db/stripeQueries.ts` (optional but recommended)
- [ ] Implementar helpers:
  - [ ] `saveStripeSession()`
  - [ ] `updateStripeSession()`
  - [ ] `saveStripeSubscription()`
  - [ ] `updateStripeSubscription()`
  - [ ] `getUserAccess()`
  - [ ] `updateUserAccess()`
  - [ ] `revokeUserAccess()`
- [ ] Testes com Supabase (pode usar mock)

### 1.8 Error Handling

- [ ] Usar padrão existente: `errorRecovery.ts` da SPFP
- [ ] Implementar em stripeService:
  ```typescript
  withErrorRecovery(
    () => stripe.checkout.sessions.create(...),
    'Create checkout session',
    { maxRetries: 2, userId }
  )
  ```
- [ ] Logger estruturado em webhook handler
- [ ] Error messages em português

### 1.9 Testes Backend

- [ ] Teste unitário: stripeService
- [ ] Teste unitário: webhook verification
- [ ] Teste integração: POST /api/stripe/checkout-session
- [ ] Teste integração: POST /api/stripe/webhook
- [ ] Cobertura: > 80%
- [ ] Comando: `npm run test`

---

## FASE 2: SUPABASE SETUP (1 dia)

### 2.1 Criar Tabelas SQL

- [ ] Executar migrations:
  - [ ] `stripe_sessions` table (ver STRIPE_INTEGRATION_ARCHITECTURE.md)
  - [ ] `stripe_subscriptions` table
  - [ ] `user_access` table
- [ ] Verificar no Supabase Dashboard → SQL Editor

### 2.2 Índices

- [ ] Criar índices:
  - [ ] `idx_stripe_sessions_user` on `stripe_sessions(user_id)`
  - [ ] `idx_stripe_sessions_status` on `stripe_sessions(status)`
  - [ ] `idx_stripe_subscriptions_user` on `stripe_subscriptions(user_id)`
  - [ ] `idx_stripe_subscriptions_status` on `stripe_subscriptions(status)`
  - [ ] `idx_user_access_user` on `user_access(user_id)`

### 2.3 Row Level Security (RLS)

- [ ] Habilitar RLS em 3 tabelas:
  - [ ] `stripe_sessions`
  - [ ] `stripe_subscriptions`
  - [ ] `user_access`
- [ ] Implementar políticas:
  - [ ] Usuários podem ler seus próprios dados
  - [ ] Service role pode fazer qualquer coisa (webhooks)
- [ ] Testes de RLS:
  - [ ] User A não pode ver dados de User B
  - [ ] Service role consegue atualizar

### 2.4 Verificação de Dados

- [ ] Inserir teste manual no Supabase
- [ ] Verificar no Dashboard:
  - [ ] Dados aparecem corretos
  - [ ] RLS funciona
  - [ ] Índices foram criados

---

## FASE 3: FRONTEND SETUP (2-3 dias)

### 3.1 Tipos TypeScript

- [ ] Criar `src/types/stripe.ts`
- [ ] Definir interfaces:
  - [ ] `StripeProduct`
  - [ ] `CheckoutSession`
  - [ ] `StripeSubscription`
  - [ ] `UserAccess`
  - [ ] `CheckoutResponse`
  - [ ] `SubscriptionResponse`
- [ ] Exportar tipos

### 3.2 Hook: useStripeCheckout

- [ ] Criar `src/hooks/useStripeCheckout.ts`
- [ ] Implementar:
  - [ ] `initiateCheckout(planId)` function
  - [ ] Loading state
  - [ ] Error state
  - [ ] Retry logic (usar errorRecovery)
- [ ] Testes:
  - [ ] Teste sucesso
  - [ ] Teste erro de rede
  - [ ] Teste erro de validação

### 3.3 Hook: useStripeSubscription

- [ ] Criar `src/hooks/useStripeSubscription.ts`
- [ ] Implementar:
  - [ ] `initiateSubscription(planId)` function
  - [ ] `cancelSubscription()` function
  - [ ] `getSubscriptionStatus()` function
  - [ ] Loading + error states
- [ ] Testes similares

### 3.4 Componente: PricingCard

- [ ] Criar `src/components/PricingCard.tsx`
- [ ] Implementar:
  - [ ] Props: product (StripeProduct)
  - [ ] Renderizar nome, preço, features
  - [ ] Botão "Comprar" ou "Assinar"
  - [ ] Loading state com spinner
  - [ ] Error message display
  - [ ] Badge "POPULAR" (opcional)
- [ ] Usar tailwindcss (glassmorphism + dark mode)
- [ ] Testes:
  - [ ] Renderização
  - [ ] Click handling
  - [ ] Loading/error states

### 3.5 Landing Page: SalesPage.tsx (Update)

- [ ] Atualizar para incluir 4 pricing cards:
  - [ ] Lite (12x)
  - [ ] Premium (12x)
  - [ ] Lite Subscription
  - [ ] Premium Subscription
- [ ] Organizar em grid (mobile-responsive)
- [ ] Adicionar seção "Planos" com scroll smooth
- [ ] Testes:
  - [ ] Cards renderizam
  - [ ] Botões funcionam
  - [ ] Mobile responsive

### 3.6 Success Page

- [ ] Criar `src/pages/CheckoutSuccess.tsx`
- [ ] Implementar:
  - [ ] Extrair `session_id` da URL
  - [ ] Chamar `GET /api/stripe/session-status/:id`
  - [ ] Verificar `status === 'paid'`
  - [ ] Mostrar mensagem de sucesso
  - [ ] Redirecionar para dashboard (3s)
- [ ] Testes:
  - [ ] Sucesso: session paid
  - [ ] Falha: session unpaid
  - [ ] Missing session_id

### 3.7 Cancel Page

- [ ] Criar `src/pages/CheckoutCancel.tsx`
- [ ] Implementar:
  - [ ] Mostrar mensagem "Pagamento cancelado"
  - [ ] Link "Voltar para planos"
  - [ ] Link "Voltar para home"
- [ ] Estilo similar a success page

### 3.8 Subscription Manager (Opcional MVP, V2)

- [ ] Criar `src/components/subscription/SubscriptionManager.tsx` (depois)
- [ ] Implementar:
  - [ ] Mostrar plano atual
  - [ ] Data de renovação
  - [ ] Botão "Cancelar assinatura"
  - [ ] Botão "Atualizar método de pagamento"
- [ ] Para V2

### 3.9 Atualizar Context: FinanceContext

- [ ] Adicionar ao GlobalState:
  ```typescript
  currentPlan: 'lite' | 'premium' | 'none';
  isSubscribed: boolean;
  subscriptionStatus: string | null;
  accessGrantedAt?: Date;
  accessExpiresAt?: Date;
  ```
- [ ] Implementar `checkUserAccess()` function
- [ ] Chamar no `useEffect` de inicialização
- [ ] Exportar via `useFinance()` hook
- [ ] Testes:
  - [ ] Carrega dados de user_access
  - [ ] Valida expiração (one-time)
  - [ ] Retorna estado correto

### 3.10 Atualizar App.tsx (Routes)

- [ ] Adicionar rota para `/checkout/success`
- [ ] Adicionar rota para `/checkout/cancel`
- [ ] Lazy load ambas (code splitting)
- [ ] Testar roteamento

### 3.11 Testes Frontend

- [ ] Teste unitário: useStripeCheckout hook
- [ ] Teste unitário: PricingCard component
- [ ] Teste integração: SalesPage + PricingCard
- [ ] Teste E2E: Clique em "Comprar" → Redireciona para Stripe
- [ ] Cobertura: > 70%

---

## FASE 4: INTEGRAÇÃO & E2E (1-2 dias)

### 4.1 Teste Local (Test Mode)

- [ ] Backend rodando: `npm run dev` (port 3001)
- [ ] Frontend rodando: `npm run dev` (port 3000)
- [ ] Stripe CLI: `stripe listen --forward-to localhost:3001/api/stripe/webhook`
- [ ] Verificar logs do CLI

### 4.2 Teste Completo: One-Time Payment

- [ ] Acessar `http://localhost:3000`
- [ ] Clique em "Comprar Lite (R$ 99.90)"
- [ ] Validar:
  - [ ] Redireciona para Stripe Checkout
  - [ ] Mostra produtos correto
  - [ ] Mostra preço R$ 99.90
- [ ] Preencher:
  - [ ] Email: teste@example.com
  - [ ] Cartão: 4242 4242 4242 4242
  - [ ] Data: 12/99 (futuro)
  - [ ] CVC: 123
  - [ ] Nome: Teste User
- [ ] Clicar "Comprar com segurança"
- [ ] Validar:
  - [ ] Redireciona para `/checkout/success?session_id=xxx`
  - [ ] Mostra "Sucesso!"
  - [ ] Redireciona para dashboard (3s)
- [ ] Backend logs:
  - [ ] POST `/api/stripe/checkout-session` received
  - [ ] Stripe API called
  - [ ] `stripe_sessions` table updated
  - [ ] Webhook received `payment_intent.succeeded`
  - [ ] `user_access` table updated
  - [ ] Status 200 OK

### 4.3 Teste Completo: Subscription

- [ ] Acessar `http://localhost:3000`
- [ ] Clique em "Assinar Lite (R$ 99.90/mês)"
- [ ] Validar:
  - [ ] POST `/api/stripe/subscription` chamado
  - [ ] Retorna `clientSecret` (se 3D Secure required)
- [ ] Preencher cartão (igual anterior)
- [ ] Validar:
  - [ ] Redireciona para `/checkout/success`
  - [ ] Mostra "Sucesso!"
- [ ] Backend logs:
  - [ ] `stripe_subscriptions` table updated
  - [ ] `user_access` table updated com `expires_at: null`
  - [ ] Webhook: `customer.subscription.created`

### 4.4 Teste Cancelamento

- [ ] Dashboard (após subscription criada)
- [ ] Botão "Cancelar assinatura" (se implementado)
- [ ] Validar:
  - [ ] POST `/api/stripe/cancel-subscription` chamado
  - [ ] Backend processa
  - [ ] Stripe recebe cancelamento
  - [ ] Webhook: `customer.subscription.deleted`
  - [ ] `user_access` revogado

### 4.5 Teste de Erros

- [ ] Cartão declinado: 4000 0000 0000 0002
  - [ ] Validar erro tratado
  - [ ] Mensagem em português
- [ ] Timeout de rede:
  - [ ] Usar DevTools (throttle)
  - [ ] Validar retry
- [ ] Webhook timeout:
  - [ ] Parar backend
  - [ ] Fazer checkout
  - [ ] Stripe retry automático (24h)

### 4.6 Cobertura de Testes

- [ ] Unitário: > 80%
- [ ] Integração: > 70%
- [ ] E2E: Fluxos críticos cobertos
- [ ] Comando: `npm run test:coverage`

---

## FASE 5: DEPLOY & MONITORAMENTO (1 dia)

### 5.1 Preparação Production

- [ ] Criar conta Stripe production (if not exists)
- [ ] Criar 4 produtos em production
- [ ] Gerar chaves production:
  - [ ] `pk_live_XXX`
  - [ ] `sk_live_XXX`
  - [ ] `whsec_live_XXX`
- [ ] Salvar no Vercel/ambiente production (não .env)

### 5.2 Environment Production

- [ ] Update `.env.production`:
  ```env
  VITE_STRIPE_PUBLISHABLE_KEY=pk_live_XXX
  STRIPE_SECRET_KEY=sk_live_XXX
  STRIPE_WEBHOOK_SECRET=whsec_live_XXX
  VITE_API_BASE_URL=https://api.spfp.com.br
  APP_URL=https://app.spfp.com.br
  ```

### 5.3 Webhook Production

- [ ] Stripe Dashboard → Webhooks
- [ ] Adicionar endpoint:
  - [ ] URL: `https://api.spfp.com.br/api/stripe/webhook`
  - [ ] Selecionar eventos (igual test)
  - [ ] Copiar secret para .env.production

### 5.4 HTTPS & SSL

- [ ] Verificar domínio tem SSL válido
- [ ] Teste HTTPS em browser
- [ ] Verificar certificado válido

### 5.5 Deploy Backend

- [ ] `git add`, `git commit`, `git push`
- [ ] Deploy via CI/CD (GitHub Actions, etc.)
- [ ] Verificar logs:
  - [ ] Aplicação rodando
  - [ ] Conexão Supabase OK
  - [ ] Stripe keys carregadas

### 5.6 Deploy Frontend

- [ ] Vercel / similar
- [ ] Build: `npm run build`
- [ ] Preview antes de deploy
- [ ] Deploy production
- [ ] Verificar:
  - [ ] Pricing cards carregam
  - [ ] Botões "Comprar" funcionam
  - [ ] Redireciona para Stripe corretamente

### 5.7 Teste Production (First Transaction)

- [ ] ⚠️ Usar cartão real (small amount, ex: R$ 1)
- [ ] Ou usar test card em live mode (Stripe permite em account dashboard)
- [ ] Monitorar:
  - [ ] Stripe Dashboard → Events
  - [ ] Backend logs (Sentry, CloudWatch)
  - [ ] Supabase logs
  - [ ] Webhook requests

### 5.8 Monitoramento

- [ ] Configurar alertas:
  - [ ] Webhook failures (Slack)
  - [ ] API errors (Sentry)
  - [ ] Database errors (Supabase alerts)
- [ ] Dashboard com métricas:
  - [ ] Checkout sessions/dia
  - [ ] Taxa de conversão
  - [ ] Webhook latency
- [ ] Status page (opcional)

### 5.9 Rollback Plan

- [ ] Se houver critical issue:
  - [ ] Desativar endpoints Stripe (feature flag)
  - [ ] Redirecionar a "Coming soon"
  - [ ] Notificar time
- [ ] Database: backup automático (Supabase handles)

### 5.10 Post-Deploy (24h Monitoring)

- [ ] Verificar logs a cada hora por 24h
- [ ] Monitorar taxa de erro
- [ ] Verificar webhook processing
- [ ] Validar dados em Supabase
- [ ] Testar completo (checkout, success, access)
- [ ] Check rate limiting (se applicable)

---

## CHECKLIST FINAL (Sign-Off)

### Code Quality
- [ ] Linting passa: `npm run lint`
- [ ] Type checking passa: `npm run typecheck`
- [ ] Tests passam: `npm run test`
- [ ] Coverage > threshold
- [ ] Sem warnings

### Security
- [ ] Secret key nunca no frontend
- [ ] Webhook signature validado
- [ ] HTTPS em production
- [ ] JWT validado
- [ ] RLS policies corretas
- [ ] No SQL injection
- [ ] CORS properly configured

### Performance
- [ ] Checkout página carrega < 2s
- [ ] API response < 500ms
- [ ] Webhook processa < 1s
- [ ] Database queries otimizadas

### Documentation
- [ ] README atualizado
- [ ] API documentation completa
- [ ] Deployment guide escrito
- [ ] Troubleshooting guide
- [ ] Code comments onde necessário

### Testing
- [ ] Unit tests > 80% coverage
- [ ] Integration tests
- [ ] E2E: fluxos críticos
- [ ] Erro cases testados
- [ ] Performance tested

### Team Knowledge
- [ ] Design review com @architect
- [ ] Code review com @qa
- [ ] Security review (if any)
- [ ] Deployment review com @devops
- [ ] Documentation revisionada

### Sign-Off
- [ ] @dev: implementação completa
- [ ] @qa: testes passam
- [ ] @architect: design aprovado
- [ ] @devops: deploy pronto
- [ ] @po: requisitos atendidos

---

## TEMPO ESTIMADO

| Fase | Atividade | Tempo | Responsável |
|------|-----------|-------|-------------|
| 0 | Stripe Setup | 1 dia | @devops |
| 1 | Backend | 2-3 dias | @dev |
| 2 | Supabase | 1 dia | @dev + @architect |
| 3 | Frontend | 2-3 dias | @dev |
| 4 | Integração E2E | 1-2 dias | @dev + @qa |
| 5 | Deploy & Monitor | 1 dia | @devops + @dev |
| **TOTAL** | | **9-12 dias** | |

**Paralelização possível:**
- Fases 1, 2, 3 podem rodar em paralelo (2 devs)
- Fase 4 requer ambos (integração)
- Fase 5: @devops lida, @dev suporta

---

## RASTREAMENTO

Use este checklist em paralelo com:
- Story no GitHub (linked issues)
- Kanban board (Trello/GitHub Projects)
- Daily standups
- PR reviews

**Salvar status diariamente** para não perder progresso.

---

**Documento Vivo**: Atualizar conforme progresso real da implementação.
