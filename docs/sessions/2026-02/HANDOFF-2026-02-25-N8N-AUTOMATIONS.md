# Handoff — N8N Automations Setup
**Data:** 2026-02-25
**Sessão:** Infraestrutura N8N + Workflows de Onboarding e Stripe

---

## Infraestrutura Configurada

| Serviço | URL | Status |
|---|---|---|
| N8N | https://n8n-production-40aa.up.railway.app | ✅ Online |
| Evolution API | Railway (aguardando número dedicado) | ⏳ Pendente |
| PostgreSQL | Railway (mesmo projeto) | ✅ Online |
| App SPFP | https://spfp.vercel.app | ✅ Online |
| Supabase | https://jqmlloimcgsfjhhbenzk.supabase.co | ✅ Online |

### Variáveis de ambiente N8N no Railway
- `WEBHOOK_URL=https://n8n-production-40aa.up.railway.app/`
- `DB_TYPE=postgresdb` + variáveis do PostgreSQL Railway
- `N8N_BASIC_AUTH_ACTIVE=true`

---

## Credenciais Configuradas no N8N

| Serviço | Tipo | Status |
|---|---|---|
| Supabase | API Key (Service Role) | ✅ |
| ClickUp | API Key (`pk_...`) | ✅ |
| Stripe | Webhook configurado | ✅ |
| Brevo | API Key (`xkeysib-...`) | ✅ |
| SMTP Gmail | App Password port 465 | ❌ Railway bloqueia SMTP |
| Hotmart | Webhook configurado | ✅ |

---

## Workflows Construídos

### Workflow 1: Onboarding Hotmart
**Path webhook:** `/webhook/hotmart`
**Status:** ✅ Funcional (ativo em produção)

**Fluxo:**
```
Hotmart Webhook → Edit Fields → Code → ClickUp (criar tarefa CS) → Supabase (tabela purchases) → HTTP Request (Brevo email)
```

**Nodes:**
1. **Webhook** — recebe `purchase.complete` do Hotmart
2. **Edit Fields** — extrai buyer_name, buyer_email, product_name, transaction
3. **Code** — monta payload do email via Brevo
4. **ClickUp** — cria tarefa no CS Space com dados do comprador
5. **Supabase** — insere na tabela `purchases`
6. **HTTP Request (Brevo)** — envia email de boas-vindas

**Tabela Supabase `purchases`:**
| Coluna | Tipo |
|---|---|
| id | bigint (auto) |
| buyer_name | text |
| buyer_email | text |
| product_name | text |
| transaction_id | text |
| status | text |
| created_at | timestamptz |

**Email configurado:**
- Provider: Brevo (xkeysib- API key)
- From: `seuplanejadorfinanceiropessoal@gmail.com` via `@brevosend.com`
- Sem domínio verificado — só envia para emails próprios em teste
- Para produção: verificar domínio em resend.com/domains ou brevo.com

---

### Workflow 2: Stripe → Supabase (Payments)
**Path webhook:** `/webhook/stripe`
**Status:** ✅ Funcional (ativo em produção)

**Fluxo:**
```
Stripe Webhook → Code → HTTP Request (Supabase REST API)
```

**Nodes:**
1. **Webhook** — recebe `payment_intent.succeeded` e `checkout.session.completed`
2. **Code** — extrai e normaliza dados do pagamento
3. **HTTP Request** — insere via REST API do Supabase

**Supabase REST API:**
- URL: `https://jqmlloimcgsfjhhbenzk.supabase.co/rest/v1/payments`
- Headers: `apikey`, `Authorization: Bearer`, `Content-Type: application/json`, `Prefer: return=minimal`
- Body: Raw `{{$json.insertBody}}`

**Tabela Supabase `payments`:**
| Coluna | Tipo |
|---|---|
| id | bigint (auto) |
| stripe_event | text |
| amount | numeric |
| currency | text |
| customer_email | text |
| stripe_id | text |
| status | text |
| created_at | timestamptz |

**Code do node Code (Stripe):**
```javascript
const body = $input.item.json.body || $input.item.json;
const type = body.type;
const obj = body.data.object;

const amount = type === 'payment_intent.succeeded'
  ? obj.amount / 100
  : obj.amount_total / 100;

return [{
  json: {
    insertBody: JSON.stringify({
      stripe_event: type,
      amount: parseFloat(amount.toFixed(2)),
      currency: obj.currency || 'brl',
      customer_email: obj.receipt_email || obj.customer_details?.email || 'N/A',
      stripe_id: obj.id,
      status: 'paid'
    })
  }
}];
```

---

## Scripts de Teste

Salvos na área de trabalho do usuário:

**teste-n8n.ps1** — testa webhook Hotmart:
```powershell
$url = "https://n8n-production-40aa.up.railway.app/webhook/hotmart"
$body = '{"data":{"buyer":{"name":"Joao Teste","email":"joao@teste.com"},"product":{"name":"SPFP Premium"},"purchase":{"transaction":"HP123456789"}}}'
$headers = @{"Content-Type" = "application/json"}
Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
```

**teste-stripe.ps1** — testa webhook Stripe:
```powershell
$url = "https://n8n-production-40aa.up.railway.app/webhook/stripe"
$body = '{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_test_123456","amount":9700,"currency":"brl","receipt_email":"joao@teste.com"}}}'
$headers = @{"Content-Type" = "application/json"}
Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
```

---

## Pendências

| Item | Status | Ação necessária |
|---|---|---|
| Conta Azul API | ⏳ Aguardando aprovação | Quando aprovar: substituir Supabase node do Stripe pelo Conta Azul |
| WhatsApp Business | ⏳ Sem número dedicado | Comprar chip pré-pago (Tim/Vivo/Claro ~R$15) |
| Evolution API | ⏳ Bloqueada sem número | Subir no Railway após ter o número |
| Domínio email | ⏳ Sem domínio próprio | Registrar em registro.br (~R$40/ano) para envio em produção |

---

## Próximos Workflows (Sprint 2)

1. **Churn Prevention** — clientes inativos no Supabase → alerta CS
2. **Relatório diário de vendas** — ClickUp → email diário
3. **SDR automático** — WhatsApp → ClickUp (aguarda número dedicado)
4. **Hotmart → Conta Azul** — quando API Conta Azul for aprovada

---

## Lições Aprendidas

- Railway bloqueia portas SMTP (25, 465, 587) — usar Brevo/Resend via API
- N8N Supabase node v1 tem bug com campos numéricos — usar HTTP Request direto
- N8N webhook Test URL só funciona com "Listen for Test Event" ativo — usar Production URL com workflow ativo
- Variável `WEBHOOK_URL` obrigatória no Railway para N8N conhecer seu domínio público
- Brevo sem domínio verificado só envia para o próprio email da conta
