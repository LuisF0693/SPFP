# Implementação Stripe - Guia Completo

## Visão Geral

Integração completa de pagamentos Stripe na landing page do SPFP, suportando 2 planos com 2 formas de pagamento cada:
- **Essencial**: R$ 99 (12x parcelado ou mensal)
- **Wealth Mentor**: R$ 349 (12x parcelado ou mensal)

## Arquitetura

### 1. Tipos (src/types/stripe.ts)

```typescript
// Tipos principais
PlanType = 'parcelado' | 'mensal'
PricingPlan = 'essencial' | 'estrategico' | 'wealth'

// Interfaces
CheckoutSession - Sessão de checkout do Stripe
StripeCheckoutResponse - Resposta do servidor para checkout
StripeSubscription - Assinatura mensal
PRICING_PLANS - Configuração dos preços
```

**Variáveis de Ambiente:**
```
VITE_STRIPE_PRICE_99_PARCELADO=price_1T1yllIZBkfjgy2X30qaXxQo
VITE_STRIPE_PRICE_99_MENSAL=price_1T1ym7IZBkfjgy2XXytc5SOt
VITE_STRIPE_PRICE_349_PARCELADO=price_1T1ymOIZBkfjgy2XPWFYJSGi
VITE_STRIPE_PRICE_349_MENSAL=price_1T1ymeIZBkfjgy2XtLyCqyBE
VITE_STRIPE_PUBLIC_KEY=pk_live_51SzZwBIZBkfjgy2X...
```

### 2. Hooks

#### useStripeCheckout (src/hooks/useStripeCheckout.ts)

Gerencia a criação de sessões de checkout com retry automático via ErrorRecoveryService.

**Props:**
```typescript
interface UseStripeCheckoutResult {
  loading: boolean;
  error: string | null;
  initiateCheckout: (priceId: string, planType: PlanType) => Promise<void>;
}
```

**Uso:**
```typescript
const { loading, error, initiateCheckout } = useStripeCheckout();

const handleClick = async () => {
  await initiateCheckout('price_1T1yllIZBkfjgy2X30qaXxQo', 'parcelado');
};
```

**Fluxo:**
1. Valida priceId
2. POST para `/api/stripe/checkout-session`
3. Retry automático (até 2 tentativas) em case de erro
4. Redireciona para Stripe Checkout URL
5. Error handling com mensagens em português

#### useStripeSubscription (src/hooks/useStripeSubscription.ts)

Gerencia assinatura mensal com error recovery.

**Props:**
```typescript
interface UseStripeSubscriptionResult {
  loading: boolean;
  error: string | null;
  createSubscription: (priceId: string) => Promise<void>;
}
```

**Uso:**
```typescript
const { loading, error, createSubscription } = useStripeSubscription();

const handleSubscribe = async () => {
  await createSubscription('price_1T1ym7IZBkfjgy2XXytc5SOt');
};
```

**Fluxo:**
1. Valida autenticação do usuário
2. POST para `/api/stripe/subscription`
3. Salva em Supabase (stripe_subscriptions table)
4. Redireciona para `/checkout-success?type=subscription`

### 3. Componente PricingCard (src/components/PricingCard.tsx)

Card de preço responsivo com suporte a Stripe.

**Props:**
```typescript
interface PricingCardProps {
  title: string;
  price: number; // ex: 99, 349
  description: string;
  features: PricingCardFeature[];
  priceIds: {
    parcelado: string;
    mensal: string;
  };
  featured?: boolean;
  isPopular?: boolean;
}
```

**Recursos:**
- Glassmorphism + dark mode (padrão SPFP)
- 2 botões de ação (parcelado + mensal)
- Badge "Com IA" para plano 99
- Badge "Mais Popular" quando featured/isPopular
- Loading states com spinner
- Error messages em português
- Cálculo automático de parcelas (preço / 12)

**Exemplo de Uso:**
```typescript
<PricingCard
  title="Essencial"
  price={99}
  description="Ideal para quem busca organização e simplicidade."
  isPopular={true}
  priceIds={{
    parcelado: process.env.VITE_STRIPE_PRICE_99_PARCELADO || '',
    mensal: process.env.VITE_STRIPE_PRICE_99_MENSAL || '',
  }}
  features={[
    { text: "Acesso completo ao App", included: true },
    { text: "Whatsapp Limitado", included: true, highlight: "Suporte" },
    { text: "Consultor IA", included: true },
    { text: "Relatórios Básicos", included: true },
  ]}
/>
```

### 4. Páginas de Sucesso/Cancelamento

#### CheckoutSuccess (src/components/pages/CheckoutSuccess.tsx)

Exibida após pagamento bem-sucedido. Mostra:
- Ícone de sucesso com animação
- Mensagens de confirmação
- Detalhes da transação
- Botão para acessar dashboard

**Query Params:**
- `type`: 'checkout' (padrão) ou 'subscription'
- `session_id`: ID da sessão (opcional)

#### CheckoutCancel (src/components/pages/CheckoutCancel.tsx)

Exibida quando usuário cancela o pagamento. Mostra:
- Ícone de alerta
- Motivo do cancelamento
- Opções para tentar novamente
- Link para voltar aos planos

### 5. Integração na SalesPage (src/components/SalesPage.tsx)

```typescript
<div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
  {/* Plano Essencial */}
  <PricingCard
    title="Essencial"
    price={99}
    description="Ideal para quem busca organização e simplicidade."
    isPopular={true}
    priceIds={{
      parcelado: process.env.VITE_STRIPE_PRICE_99_PARCELADO || '',
      mensal: process.env.VITE_STRIPE_PRICE_99_MENSAL || '',
    }}
    features={[...]}
  />

  {/* Plano Wealth Mentor */}
  <PricingCard
    title="Wealth Mentor"
    price={349}
    description="Gestão de elite com acompanhamento personalizado."
    featured={true}
    priceIds={{
      parcelado: process.env.VITE_STRIPE_PRICE_349_PARCELADO || '',
      mensal: process.env.VITE_STRIPE_PRICE_349_MENSAL || '',
    }}
    features={[...]}
  />
</div>
```

### 6. Rotas (src/App.tsx)

```typescript
<Route path="/checkout-success" element={<CheckoutSuccess />} />
<Route path="/checkout-cancel" element={<CheckoutCancel />} />
```

## Backend (APIs Necessárias)

### POST /api/stripe/checkout-session

**Request:**
```json
{
  "priceId": "price_1T1yllIZBkfjgy2X30qaXxQo",
  "planType": "parcelado",
  "metadata": {
    "planType": "parcelado",
    "timestamp": "2024-02-17T..."
  }
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/stripe/subscription

**Request:**
```json
{
  "priceId": "price_1T1ym7IZBkfjgy2XXytc5SOt",
  "email": "user@example.com",
  "userId": "user_123",
  "metadata": {
    "planType": "mensal",
    "timestamp": "2024-02-17T..."
  }
}
```

**Response:**
```json
{
  "subscriptionId": "sub_...",
  "status": "active"
}
```

## Padrões Utilizados

### Error Recovery
Todos os hooks utilizam `withErrorRecovery()` para:
- Retry automático com exponential backoff
- Captura de contexto de erro
- Mensagens amigáveis em português
- Logging estruturado

### TypeScript
- Strict mode habilitado
- Interfaces bem-definidas
- Type-safe em toda a implementação

### Testes
- `useStripeCheckout.test.ts`: 8 testes cobrindo POST, redirect, errors
- `PricingCard.test.tsx`: 11 testes cobrindo renderização, buttons, badges

## Fluxo de Pagamento

### Pagamento Parcelado (12x)
```
Usuário clica "12x R$ 8,25"
  ↓
useStripeCheckout.initiateCheckout(priceId, 'parcelado')
  ↓
POST /api/stripe/checkout-session
  ↓
Redireciona para Stripe Checkout
  ↓
Usuário completa pagamento
  ↓
Redireciona para /checkout-success
```

### Assinatura Mensal
```
Usuário clica "R$ 99/mês"
  ↓
Valida autenticação (useAuth)
  ↓
useStripeSubscription.createSubscription(priceId)
  ↓
POST /api/stripe/subscription
  ↓
Salva em Supabase stripe_subscriptions
  ↓
Redireciona para /checkout-success?type=subscription
```

## Considerações de Produção

1. **Webhook Stripe**: Implementar webhook para confirmar pagamentos
2. **Supabase RLS**: Configurar row-level security para tabela stripe_subscriptions
3. **Email**: Enviar confirmação de pagamento via Supabase functions
4. **Status de Acesso**: Atualizar FinanceContext com status de premium
5. **Cancelamento**: Implementar endpoint para cancelamento de assinatura
6. **Refund**: Suportar reembolsos quando necessário

## Debugging

### Variáveis Úteis de Debug
```typescript
// No console do navegador
console.log(process.env.VITE_STRIPE_PUBLIC_KEY);
console.log(process.env.VITE_STRIPE_PRICE_99_PARCELADO);
```

### CommonErrors
- "ID do plano não configurado" - Verificar .env.local
- "Erro ao processar pagamento" - Verificar conectividade com /api/stripe/checkout-session
- "É necessário estar conectado" - Usuário não autenticado para assinatura mensal

## Commits Relacionados
- `dc9ceea`: feat(stripe): implementar integração de pagamentos Stripe na landing page
