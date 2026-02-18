# Stripe Integration - Decisões & FAQ

**Documento de Referência para Perguntas Comuns e Decisões Pendentes**

---

## DECISÕES ARQUITETURAIS (Justificadas)

### 1. Por que Checkout Sessions em vez de Payment Links?

| Aspecto | Checkout Sessions | Payment Links |
|--------|------------------|----------------|
| **Flexibilidade** | ✅ Altamente customizável | ⚠️ Limitado |
| **URL Dinâmica** | ✅ Nova por transação | ❌ Reutilizável (rastreamento difícil) |
| **Rastreamento** | ✅ sessionId único | ⚠️ Difícil de rastrear por usuário |
| **UX** | ✅ Redirect customizável | ✅ Simples |
| **Webhook** | ✅ Confiável | ⚠️ Menos confiável |
| **Análise** | ✅ Detalhada por session | ⚠️ Agregada |

**Conclusão:**
Checkout Sessions são ideais quando você precisa rastrear por usuário/sessão. Payment Links são melhores para links estáticos reutilizáveis (ex: compartilhar no WhatsApp). Para SPFP, usar **Checkout Sessions** no fluxo principal.

---

### 2. Por que não implementar trial period (7 dias)?

**Razões:**
- Aumenta complexidade de billing (trial ends → charge)
- Requer lógica adicional para cancelamento durante trial
- Supabase precisa de timer/cron para expiração
- Stripe pode não processar cobrança se cartão foi removido durante trial

**Recomendação:**
Implementar trial **posteriormente** como feature separada. No MVP, focar em:
1. Compra simples (one-time)
2. Assinatura sem trial
3. Depois adicionar trial com lógica de retry

---

### 3. Por que Supabase como "cache" e não source of truth?

**Stripe = Source of Truth para Cobrança**
- ✅ Stripe tem dados definitivos (status, datas, histórico)
- ✅ Não pode permitir inconsistência com cobrança real
- ✅ Webhooks garantem sincronização eventual

**Supabase = Source of Truth para Estado de App**
- ✅ Aplicação lê dados de Supabase (rápido, sem latência)
- ✅ Webhooks atualizam Supabase em tempo real
- ✅ Se webhook falhar, retry automático do Stripe (24h)

**Fluxo Seguro:**
```
Stripe (evento) → Webhook → Supabase (update) → App lê Supabase
                     ↓
              Se webhook falha: Stripe retry
```

---

### 4. Por que não usar Stripe Customer Portal?

**Stripe Customer Portal:**
- ✅ Cancelamento de assinatura self-service
- ✅ Atualizar método de pagamento
- ⚠️ Hosted por Stripe (fora do design SPFP)
- ⚠️ Customização limitada
- ⚠️ Redireção externa (quebra UX)

**SPFP Custom Subscription Manager:**
- ✅ Integrado ao design visual
- ✅ Customização total
- ✅ Controle sobre fluxos
- ⚠️ Mais código para manter

**Recomendação:**
Implementar **ambos**:
1. MVP: Custom cancellation button (`POST /api/stripe/cancel-subscription`)
2. Later: Integrar Stripe Customer Portal como opção avançada

---

### 5. Por que 12 parcelas em vez de configurável?

**Stripe Pricing Plans:**
- Parcelamento é configurado no **Product** (não na sessão)
- Alterar parcelamento requer novo Product/Price no Stripe
- Cada combinação (3x, 6x, 12x) = novo Price ID

**Abordagem Recomendada:**
```
Criar em Stripe Dashboard:
├─ price_lite_installment_3x (R$ 99,90)  → parcelado em 3x
├─ price_lite_installment_6x (R$ 99,90)  → parcelado em 6x
├─ price_lite_installment_12x (R$ 99,90) → parcelado em 12x
└─ ... (mesmo para premium)
```

**Frontend:**
```typescript
interface PricingCard {
  installments: 3 | 6 | 12; // selector no card
  stripePriceId: string;    // baseado em seleção
}
```

**MVP:**
Usar apenas 12x. Expandir para 3x/6x depois se requisitado.

---

## DECISÕES ABERTAS (Requer Discussão)

### 1. Suportar Boleto/PIX?

| Método | Implementação | Conversão | Complexidade |
|--------|---------------|-----------|--------------|
| **Card (Crédito/Débito)** | ✅ Simples | 95% no Brasil | Baixa |
| **Pix** | ✅ Simples (via Stripe) | ~80% (instant) | Baixa |
| **Boleto** | ⚠️ Complexo (webhook 3-5d) | ~60% | Alta |

**Recomendação:**
- ✅ MVP: Card + Pix (ambos suportados pelo Stripe em 1 linha)
- ⏳ V2: Boleto (se dados mostram demanda)

**Como ativar Pix no Stripe:**
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card', 'alipay', 'wechat_pay'], // Stripe lista métodos
  // Stripe automaticamente mostra Pix para clientes no Brasil
});
```

---

### 2. Descontos/Cupons?

| Opção | Complexidade | Benefício |
|-------|-------------|-----------|
| **Nenhum desconto** | Baixa | Marketing simplificado |
| **Cupom fixo (ex: PROMO20)** | Média | Promoções automáticas |
| **Desconto dinâmico (API)** | Alta | Máxima flexibilidade |

**Recomendação (MVP):**
Não implementar. Cobrar preço fixo. Descontos podem ser adicionados depois via Stripe Dashboard (promo codes).

**Se precisar:**
```typescript
const session = await stripe.checkout.sessions.create({
  allow_promotion_codes: true, // Stripe Promocode Dashboard
});
```

---

### 3. Reembolso Automático?

| Política | Implementação | Risco |
|----------|---------------|-------|
| **Manual** | Admin portal (Stripe) | Demanda suporte |
| **Automático 30d** | Webhook + Cron | Abuso potencial |
| **Sem reembolso** | Nenhuma | Reclamações |

**Recomendação:**
- **MVP:** Reembolso manual (admin faz via Stripe Dashboard)
- **V2:** Adicionar API `POST /api/stripe/refund` com aprovação admin

---

### 4. Downgrade Automático?

**Cenário:** Usuário com Premium cancela → deve virar Lite?

| Opção | Lógica |
|-------|--------|
| **A: Downgrade automático** | Premium cancela → acesso Lite indefinido |
| **B: Sem acesso** | Premium cancela → acesso revogado completamente |
| **C: Período de graça** | Premium cancela → 7d free Lite, depois sem acesso |

**Recomendação:** **Opção B** (sem acesso)
- Mais simples
- Evita "trapped users"
- Se quiser Lite, usuário compra explicitamente

---

### 5. Métodos de Autenticação no Backend?

| Método | Segurança | Implementação |
|--------|-----------|---------------|
| **JWT (Bearer token)** | ✅ Alta | Simples (supabase.auth) |
| **API Key** | ⚠️ Média | Risco de vazamento |
| **Webhook Signature** | ✅ Alta | Stripe valida |

**Recomendação:**
- **Endpoints normais:** JWT (supabase.auth)
- **Webhook:** Signature do Stripe (nunca token)

```typescript
// ✅ Correto
router.post('/checkout-session', authMiddleware, controller);
router.post('/webhook', verifyStripeSignature, controller);

// ❌ Errado
router.post('/webhook', authMiddleware, controller); // Webhook não tem JWT!
```

---

## FAQ (Perguntas Frequentes)

### P1: E se o webhook falhar?

**R:** Stripe retry automático:
- Tenta por **24 horas** em intervalos exponenciais
- Você pode conferir em Stripe Dashboard → Events
- Se continuar falhando, verificar logs do servidor

**Implementar em produção:**
```typescript
// Adicionar ao webhook handler
logger.error('Webhook processing failed', {
  eventId: event.id,
  error: error.message,
  retryable: true
});

// Criar alerta no Sentry/monitoring
```

---

### P2: E se o usuário fecha o browser durante checkout?

**R:** Stripe session fica válida por **24 horas**
- Link na URL: `checkout.stripe.com?session_id=xxx`
- Usuário pode voltar e completar
- Após 24h: sessão expira, precisa criar nova

**Implementar:**
```typescript
// No frontend, salvar sessionId em localStorage
localStorage.setItem('stripe_session_id', sessionId);

// Se voltar e não tiver completado, redirecionar para checkout antigo
if (localStorage.getItem('stripe_session_id')) {
  const status = await fetch(`/api/stripe/session-status/${sessionId}`);
  if (status.payment_status === 'unpaid') {
    // Redirecionar para checkout antigo
  }
}
```

---

### P3: Como testar em desenvolvimento?

**R:** Usar Stripe Test Mode:
```bash
# 1. Em Stripe Dashboard, ativar "Test Mode"

# 2. Usar test keys:
STRIPE_PUBLIC_KEY=pk_test_XXX
STRIPE_SECRET_KEY=sk_test_XXX

# 3. Usar test cards:
# Sucesso: 4242 4242 4242 4242
# Falha: 4000 0000 0000 0002
# 3D Secure: 4000 0025 0000 3155

# 4. Localtest.me para webhooks:
npx stripe listen --forward-to localhost:3001/api/stripe/webhook
```

---

### P4: Como migrar de test para production?

**R:** Checklist:
```
[ ] Criar conta Stripe production
[ ] Obter chaves production (sk_live_XXX, pk_live_XXX)
[ ] Criar 4 produtos + preços em production
[ ] Configurar webhook endpoint (production URL)
[ ] Atualizar .env com chaves production
[ ] Testar com cartão real (usar test card last)
[ ] Ativar em Stripe Dashboard
[ ] Monitorar logs por 24h
```

---

### P5: Como garantir idempotência de webhooks?

**R:** Stripe garante **at-least-once delivery**:
```typescript
// Seu servidor pode receber o mesmo evento 2x
// Solução: Verificar se já processou

const processedEvents = new Set<string>();

router.post('/webhook', async (req, res) => {
  const eventId = req.body.id;

  // Verificar se já processado (último 24h)
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .single();

  if (existing) {
    return res.json({ received: true }); // Já processado
  }

  // Processar novo evento
  // ... seu código ...

  // Salvar como processado
  await supabase.from('webhook_events').insert({ stripe_event_id: eventId });

  res.json({ received: true });
});
```

---

### P6: Como lidar com cartão declinado em assinatura?

**R:** Stripe retry automático:
```
Dia 0: Cobrança 1 (falha)
Dia 3: Cobrança 2 (retry)
Dia 5: Cobrança 3 (retry final)

Após 3x falha: subscription status = "past_due"
Webhook: customer.subscription.updated (status: past_due)

App pode:
1. Mostrar "Método de pagamento falhou"
2. Link para atualizar cartão no Stripe Portal
3. Ou implementar custom update form
```

---

### P7: Como calcular preço com imposto/taxa?

**R:** Recomendação:
```
Preço no frontend = final (já inclui tudo)
Imposto no Stripe = 0 (simplificar)

Se precisar:
- ICMS (estadual) = backend calcula
- PIS/Cofins (federal) = backend calcula
- Stripe Tax = feature premium (setup complexo)

MVP: Preço final, sem detalhamento de impostos
```

---

### P8: Como implementar "2-step" (confirmar antes de cobrar)?

**R:** Usar `payment_intent.requires_confirmation`:
```typescript
// Backend
const paymentIntent = await stripe.paymentIntents.create({
  amount: 9990,
  currency: 'brl',
  confirm: false, // Não cobrar ainda
  metadata: { userId }
});

// Frontend: Mostrar confirmação visual
// Usuário clica "Confirmar compra"
// Então chamar: stripe.confirmCardPayment(clientSecret)
```

---

### P9: Como rastrear conversão (qual plano o usuário escolheu)?

**R:** Usar metadata + analytics:
```typescript
// Backend: salvar planId em metadata
const session = await stripe.checkout.sessions.create({
  metadata: {
    userId: user.id,
    planId: 'lite', // ou 'premium'
    source: 'landing_page', // rastreamento de origem
  }
});

// Analytics (Mixpanel, Amplitude, GA):
analytics.track('checkout_initiated', {
  plan: 'lite',
  price: 99.90,
  timestamp: new Date()
});

// Em sucesso:
analytics.track('purchase_completed', {
  plan: 'lite',
  amount: 99.90,
  timestamp: new Date()
});
```

---

### P10: E se precisar de múltiplas moedas (USD, EUR)?

**R:** Stripe suporta natively:
```typescript
// Detectar locale/país
const currency = userCountry === 'BR' ? 'brl' : 'usd';

const session = await stripe.checkout.sessions.create({
  currency, // 'brl' ou 'usd'
  line_items: [{ price: getPriceId(currency, planId) }]
});

// Stripe Product pode ter múltiplos preços (em moedas diferentes)
// Price ID diferente por moeda: price_lite_brl vs price_lite_usd
```

**MVP:** Apenas BRL. Expandir depois.

---

## PRÓXIMAS ETAPAS

**Recomendado em Ordem:**

### Semana 1: Setup
- [ ] Criar conta Stripe production
- [ ] Criar 4 produtos + preços
- [ ] Gerar chaves (test + live)
- [ ] Configurar webhook endpoint

### Semana 2: Backend
- [ ] Implementar endpoints Express
- [ ] Setup Supabase tabelas
- [ ] Implementar webhook handler
- [ ] Testes com Stripe CLI

### Semana 3: Frontend
- [ ] Componentes de pricing
- [ ] Integração Stripe.js
- [ ] Páginas de sucesso/cancelamento
- [ ] Verificação de acesso

### Semana 4: Integração & Deploy
- [ ] E2E testing
- [ ] Deploy staging
- [ ] Deploy production
- [ ] Monitoramento 24h

---

## REFERÊNCIAS RÁPIDAS

**Documentação:**
- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe API Reference](https://stripe.com/docs/api)

**Ferramentas:**
- Stripe CLI: `stripe listen`, `stripe trigger`
- Stripe Dashboard: Testes, logs, webhooks
- Localtest.me: Desenvolvimento local com HTTPS

**Status Codes HTTP (Backend):**
- `200`: Sucesso
- `201`: Criado
- `400`: Erro de validação
- `401`: Não autenticado
- `403`: Não autorizado
- `500`: Erro servidor

---

**Documento Vivo**: Atualizar conforme novas decisões e perguntas
