# Handoff — 2026-02-26
## N8N Sprint 2 + Marketing Content Automation

---

## O que foi feito nessa sessão

### 1. OPS Build Process — Marketing Content Automation
Pedro Valerio (OPS Chief) rodou o Build Process completo (4 fases + 4 QGs, score médio **87,75/100**) para o pipeline de automação de conteúdo orgânico do Marketing.

**Decisões arquiteturais:**
- Imagens: estáticas no Google Drive (usuário escolhe por post, cola URL na task do ClickUp)
- Texto: gerado 100% por Gemini
- Aprovação: CEO muda status no ClickUp → N8N publica automaticamente
- Plataformas Sprint 2: Instagram + Facebook (LinkedIn + Twitter ficam para Sprint 3)

---

### 2. Credenciais Meta configuradas

| Item | Valor |
|------|-------|
| Facebook Page ID | `104059618631446` |
| Instagram Business Account ID | `17841456474355323` |
| Page Access Token | permanente (não expira) |
| Facebook App ID | `1248085390756375` |

**Como foi obtido:** Token curto (Graph Explorer) → trocado por token longo (60d) via API → Page Access Token permanente extraído de `/me/accounts`.

---

### 3. ClickUp — Lista Calendário de Conteúdo

**List ID:** `901325854385`

**Statuses (em minúsculo — importante para a API):**
```
pauta → gerando → rascunho → aprovado → publicando → publicado / reprovado
```

**Custom Fields:**
| Campo | ID | Tipo |
|---|---|---|
| URL da Imagem | `8a7b85da-003f-4514-8e26-bd04c872bb97` | url |
| Texto Gerado | `3dbc1863-c7b7-4339-af00-716b69bc4b3f` | text |
| Erro Publicacao | `15a6c5e1-6857-4696-a442-eda4b8e0b354` | text |
| Plataformas | `1f440acb-87e9-4949-966c-f173bbc626d6` | labels |

**ClickUp Webhook registrado:**
- ID: `84418382-cdcb-44f0-b251-a676da1939ba`
- Evento: `taskStatusUpdated` na lista `901325854385`
- Endpoint: `https://n8n-production-40aa.up.railway.app/webhook/marketing-aprovacao`

---

### 4. N8N — 3 Workflows de Marketing criados e ativos

#### Workflow A — `[Marketing] Geração de Conteúdo`
- **ID:** `K8eUdBDjQF59W0Qm`
- **Trigger:** Schedule 07:00 diário
- **Fluxo:** Busca tasks com status `pauta` → Gemini gera texto (caption + story + hashtags) → salva no campo "Texto Gerado" → muda status para `rascunho` → email CEO
- **Modelo Gemini:** `gemini-1.5-flash`

#### Workflow B — `[Marketing] Publicação após Aprovação`
- **ID:** `oeBlszgsGdCVD5dA`
- **Trigger:** Webhook ClickUp (status → `aprovado`)
- **Fluxo:** Busca task completa → status `publicando` → Instagram Feed → Instagram Story → Facebook Feed → status `publicado` → email CEO
- **APIs:** Meta Graph API v25.0

#### Workflow C — `[Marketing] Lembrete de Aprovação Pendente`
- **ID:** `J2YTXbzknxfOZEX7`
- **Trigger:** Schedule 09:00 diário
- **Fluxo:** Busca tasks com status `rascunho` há +24h → email CEO com lista

---

### 5. Como usar o sistema (fluxo do CEO)

```
1. Criar task no ClickUp (lista "Calendário de Conteúdo")
   - Nome: tema/assunto do post
   - Campo "URL da Imagem": colar link público do Google Drive
   - Status: pauta

2. Às 07:00, N8N gera o texto automaticamente
   → Status muda para: rascunho
   → CEO recebe email com o texto gerado

3. CEO acessa a task no ClickUp
   → Revisa o texto no campo "Texto Gerado"
   → Se aprovado: muda status para "aprovado"
   → Se reprovado: muda para "reprovado" e edita manualmente

4. Ao aprovar, N8N publica automaticamente:
   → Instagram Feed ✅
   → Instagram Story ✅
   → Facebook Feed ✅
   → Status muda para: publicado
   → CEO recebe email de confirmação
```

**Nota sobre imagens:** A imagem no Google Drive precisa estar compartilhada como "Qualquer pessoa com o link pode visualizar" para o Instagram/Facebook conseguirem acessá-la.

---

## Pendências para próxima sessão

### Sprint 3 — Teste + LinkedIn + Twitter

- [ ] **Testar Workflow A** no N8N UI (botão "Test workflow")
- [ ] **Testar Workflow B** (criar task, aprovar, verificar publicação)
- [ ] **LinkedIn Developer App** — criar em `linkedin.com/developers`
  - Precisamos: Client ID + Client Secret
  - Permissões: `w_member_social` + `w_organization_social`
- [ ] **Twitter/X Developer App** — criar em `developer.twitter.com`
  - Precisamos: API Key + API Secret + Access Token + Access Token Secret
- [ ] **Adicionar LinkedIn e Twitter ao Workflow B** após credenciais

---

## Contexto geral — todos os workflows N8N ativos

| Workflow | ID | Trigger |
|---|---|---|
| [CS] Onboarding Hotmart | `KJ10jPoQcDqKbnXC` | Webhook |
| [Admin] Stripe→Supabase | `xwUVwXXn9yx9IKsc` | Webhook |
| [OPS] Churn Prevention | `7wYFUykzfZY6TwMx` | 08:00 |
| [OPS] Relatório Vendas | `eNNjHFOnFrh24VkL` | 07:00 |
| [Marketing] Geração | `K8eUdBDjQF59W0Qm` | 07:00 |
| [Marketing] Publicação | `oeBlszgsGdCVD5dA` | Webhook |
| [Marketing] Lembrete | `J2YTXbzknxfOZEX7` | 09:00 |

---

## Notas técnicas

- **N8N API Key expira:** 2026-03-27 — gerar nova antes disso
- **ClickUp Token:** `pk_284509678_M8OYY798KDVEIIJC405H3H430NR1QY57`
- **Gemini Key:** `AIzaSyCjgKjRsTj8zV1W_ZdZocnZCiPWbzLL_PY`
- **Supabase:** `jqmlloimcgsfjhhbenzk.supabase.co`
- Os status do ClickUp são **todos em minúsculo** (pauta, gerando, rascunho, etc.) — a API é case-sensitive

---

*Sessão conduzida por: Orion (aios-master) + Pedro Valerio (spfp-ops) + Gage (devops)*
*Score Build Process OPS: 87,75/100*
