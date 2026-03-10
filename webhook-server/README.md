# SPFP Webhook Server

Real-time: **ClickUp → Claude Agents → Social Media**

Quando algo muda no ClickUp, os agentes já sabem e agem.

---

## O que faz

| Evento no ClickUp | Ação automática |
|-------------------|-----------------|
| Conteúdo → APROVADO | Posta no Instagram / YouTube / LinkedIn |
| Novo lead no SDR | Agente SDR qualifica e comenta na task |
| Lead → SQL | Cria task no Pipeline Closer + Agente Closer age |
| Deal → GANHO | Cria task de Onboarding no CS + Agente CS age |
| Novo ticket de Suporte | Agente N1 faz triagem e responde |

---

## Deploy no Vercel (5 minutos)

### 1. Instalar Vercel CLI
```bash
npm i -g vercel
```

### 2. Entrar na pasta e fazer deploy
```bash
cd webhook-server
npm install
vercel
```

Responda às perguntas do CLI:
- Project name: `spfp-webhook`
- Framework: Other
- Root directory: `./`

### 3. Configurar variáveis de ambiente no Vercel
```bash
vercel env add CLICKUP_API_TOKEN
vercel env add CLICKUP_WEBHOOK_SECRET
vercel env add ANTHROPIC_API_KEY

# Social media (configurar depois conforme precisar):
vercel env add META_ACCESS_TOKEN
vercel env add INSTAGRAM_BUSINESS_ACCOUNT_ID
vercel env add YOUTUBE_REFRESH_TOKEN
vercel env add LINKEDIN_ACCESS_TOKEN
```

Ou via dashboard: vercel.com → seu projeto → Settings → Environment Variables

### 4. Registrar webhook no ClickUp

Após o deploy, você vai ter uma URL como:
`https://spfp-webhook.vercel.app`

No ClickUp:
1. Settings → Integrations → Webhooks → + New Webhook
2. Endpoint URL: `https://spfp-webhook.vercel.app/webhook/clickup`
3. Events: selecionar:
   - `taskCreated`
   - `taskStatusUpdated`
4. Space: SPFP Workspace
5. Copiar o **Webhook Secret** e adicionar no Vercel env

### 5. Testar
```
GET https://spfp-webhook.vercel.app/health
```
Deve retornar status das integrações.

---

## Rodar localmente

```bash
cp .env.example .env
# Editar .env com suas credenciais

npm install
npm run dev
```

Para testar localmente com o ClickUp, use ngrok:
```bash
npx ngrok http 3001
# Copiar a URL HTTPS gerada e registrar como webhook no ClickUp
```

---

## Configurar Social Media

### Instagram
1. Criar conta no Meta for Developers: developers.facebook.com
2. Criar app → Instagram → Instagram Graph API
3. Conectar Instagram Business Account
4. Gerar token de longa duração (60 dias)
5. Copiar: `META_ACCESS_TOKEN` e `INSTAGRAM_BUSINESS_ACCOUNT_ID`

### YouTube
1. Google Cloud Console → APIs & Services → YouTube Data API v3
2. Criar credenciais OAuth 2.0
3. Gerar refresh token via OAuth playground
4. Copiar: `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN`

### LinkedIn
1. LinkedIn Developer Portal → Criar app
2. Solicitar permissões: `w_member_social`
3. Gerar access token
4. Copiar: `LINKEDIN_ACCESS_TOKEN`

---

## Estrutura

```
webhook-server/
├── index.mjs              ← Servidor Express + roteador de eventos
├── config.mjs             ← IDs e configuração (ClickUp, Claude, etc.)
├── vercel.json            ← Config de deploy Vercel
├── handlers/
│   ├── editorial.mjs      ← Conteúdo aprovado → posta nas redes
│   └── pipeline.mjs       ← Vendas/CS → agentes em tempo real
├── integrations/
│   ├── clickup.mjs        ← API helper
│   ├── instagram.mjs      ← Meta Graph API
│   ├── youtube.mjs        ← YouTube Data API v3
│   └── linkedin.mjs       ← LinkedIn API v2
└── agents/
    └── claude.mjs         ← Claude AI — SDR, Closer, CS, Marketing
```

---

## Agentes disponíveis

| Agente | Quando dispara | O que faz |
|--------|----------------|-----------|
| SDR | Novo lead no pipeline | Qualifica, pontua fit, sugere primeiro contato |
| Closer | Lead vira SQL | Prepara abordagem + estrutura Discovery Call |
| CS Onboarding | Deal ganho | Plano de ativação 72h + first value checklist |
| CS Suporte N1 | Novo ticket | Triagem, classifica severidade, responde ou escala |
| Content Manager | Conteúdo aprovado | Valida checklist de publicação por canal |

*Pedro Valerio, OPS Architect — SPFP*
