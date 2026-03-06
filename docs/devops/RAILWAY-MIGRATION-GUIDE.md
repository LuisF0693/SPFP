# Railway Migration Guide — N8N + Evolution API
# Gage (DevOps Agent — AIOS SPFP)

**Data:** 2026-02-25
**Autor:** Gage (DevOps Agent — AIOS)
**Objetivo:** Migrar N8N do n8n.cloud para Railway (zero custo) + hospedar Evolution API para WhatsApp Business
**Contexto:** N8N atual em `spfp.app.n8n.cloud`, app SPFP em `spfp.vercel.app` com Supabase

---

## Visão Geral

O Railway oferece **$5 USD/mês de crédito gratuito** sem precisar de cartão de crédito inicialmente. N8N + Evolution API juntos consomem em média **$3–4.50 USD/mês** dentro desse limite.

### Estimativa de Consumo no Railway

| Serviço | RAM | CPU | Custo estimado/mês |
|---------|-----|-----|--------------------|
| N8N | 512MB–1GB | 0.5 vCPU | ~$2.00–3.00 |
| Evolution API | 256MB–512MB | 0.25 vCPU | ~$1.00–1.50 |
| PostgreSQL (plugin) | Incluído | — | Incluído no plano |
| **Total** | — | — | **~$3.00–4.50** |

> O crédito gratuito de $5/mês cobre os dois serviços com folga.

---

## Parte 1: Migração N8N para Railway

### Passo 1: Criar Conta e Projeto no Railway

1. Acesse [railway.app](https://railway.app) e clique em **"Start a New Project"**
2. Autentique com GitHub (recomendado — facilita deploys futuros)
3. Na tela inicial, clique em **"New Project"**
4. Selecione **"Empty Project"** (vamos configurar manualmente)
5. Dê um nome ao projeto: `spfp-automation`

> O Railway vai gerar uma URL pública para cada serviço automaticamente no formato `nome-projeto-production.up.railway.app`.

---

### Passo 2: Adicionar PostgreSQL Plugin (banco do N8N)

O N8N precisa de um banco de dados PostgreSQL para persistir workflows, credenciais e histórico de execuções.

1. No painel do projeto `spfp-automation`, clique em **"+ New"**
2. Selecione **"Database"**
3. Selecione **"Add PostgreSQL"**
4. Railway vai provisionar automaticamente. Aguarde ~30 segundos.
5. Clique no serviço PostgreSQL criado e vá em **"Variables"**
6. Copie os valores que você vai precisar:
   - `PGHOST` → hostname do banco
   - `PGPORT` → porta (geralmente `5432`)
   - `PGDATABASE` → nome do banco
   - `PGUSER` → usuário
   - `PGPASSWORD` → senha

> O Railway também fornece a variável `DATABASE_URL` no formato `postgresql://user:pass@host:port/db` — você pode usá-la diretamente.

---

### Passo 3: Deploy do N8N via Docker Image

1. No painel do projeto, clique em **"+ New"**
2. Selecione **"Docker Image"**
3. No campo de imagem, insira: `n8nio/n8n`
4. Clique em **"Deploy"** — o Railway vai baixar a imagem e iniciar o container

Aguarde o primeiro deploy completar (pode levar 1–2 minutos).

---

### Passo 4: Configurar Variáveis de Ambiente do N8N

No serviço N8N criado, clique em **"Variables"** e adicione as seguintes variáveis uma a uma:

```bash
# ── Banco de Dados (PostgreSQL Railway) ──────────────────────────────────────
# Copie os valores do plugin PostgreSQL que você criou no Passo 2
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=${{Postgres.PGHOST}}
DB_POSTGRESDB_PORT=${{Postgres.PGPORT}}
DB_POSTGRESDB_DATABASE=${{Postgres.PGDATABASE}}
DB_POSTGRESDB_USER=${{Postgres.PGUSER}}
DB_POSTGRESDB_PASSWORD=${{Postgres.PGPASSWORD}}

# ── Configuração do N8N ───────────────────────────────────────────────────────
# Substitua pela URL pública que o Railway gerar para o seu serviço N8N
# Exemplo: n8n-production-abc123.up.railway.app
N8N_HOST=n8n-production-SEU-HASH.up.railway.app
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n-production-SEU-HASH.up.railway.app/

# ── Chave de Criptografia (IMPORTANTE: gere uma chave forte) ─────────────────
# Execute no terminal para gerar: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
N8N_ENCRYPTION_KEY=cole_aqui_sua_chave_de_32_chars

# ── Timezone ──────────────────────────────────────────────────────────────────
GENERIC_TIMEZONE=America/Sao_Paulo
TZ=America/Sao_Paulo

# ── Autenticação Básica (proteger acesso ao N8N) ─────────────────────────────
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=escolha_uma_senha_forte

# ── Porta de exposição ────────────────────────────────────────────────────────
PORT=5678
```

> **Como usar referências entre serviços no Railway:**
> O Railway suporta sintaxe `${{NomeServico.VARIAVEL}}` para referenciar variáveis de outro serviço no mesmo projeto. Use `${{Postgres.PGHOST}}` para não precisar copiar os valores manualmente.

---

### Passo 5: Configurar Domínio Público no Railway

1. No serviço N8N, clique em **"Settings"**
2. Na seção **"Networking"**, clique em **"Generate Domain"**
3. O Railway vai gerar uma URL como `n8n-production-abc123.up.railway.app`
4. Copie essa URL e atualize as variáveis `N8N_HOST` e `WEBHOOK_URL` com ela
5. Clique em **"Redeploy"** para aplicar as variáveis atualizadas

> Você também pode configurar um domínio customizado (ex: `n8n.seudominio.com`) em Settings → Custom Domain. Requer apontar o DNS para o Railway.

---

### Passo 6: Exportar Workflows do n8n.cloud e Importar no Railway

#### Exportar do n8n.cloud

1. Acesse `spfp.app.n8n.cloud` e faça login
2. Vá em **Settings** → **"Export"** (canto superior direito)
3. Selecione todos os workflows que quer migrar
4. Clique em **"Export"** — vai baixar um arquivo `.json` com todos os workflows

**Alternativa — exportar individualmente:**
1. Abra cada workflow
2. Clique no menu de 3 pontos (⋮) → **"Download"**
3. Salve o arquivo `.json` de cada workflow

#### Importar no N8N Railway

1. Acesse seu N8N no Railway: `https://n8n-production-SEU-HASH.up.railway.app`
2. Faça login com as credenciais que você configurou em `N8N_BASIC_AUTH_USER/PASSWORD`
3. Clique em **"Workflows"** no menu lateral
4. Clique em **"Import from File"** ou **"+"** → **"Import"**
5. Selecione o arquivo `.json` exportado do n8n.cloud
6. Revise os workflows importados — as credenciais precisarão ser reconfiguradas (ver Parte 3)

> As credenciais (API keys, OAuth tokens) **não são exportadas** por questões de segurança. Você vai precisar recriá-las no N8N Railway.

---

### Passo 7: Verificar que está Funcionando

Execute estes checks em ordem:

```bash
# 1. Verificar que N8N responde (substitua pela sua URL Railway)
curl -I https://n8n-production-SEU-HASH.up.railway.app/healthz

# Resposta esperada: HTTP/2 200

# 2. Verificar conexão com PostgreSQL
# No N8N Railway → Settings → System → Database Connection Status
# Deve aparecer "Connected"

# 3. Testar webhook (criar workflow de teste no N8N primeiro)
curl -X POST https://n8n-production-SEU-HASH.up.railway.app/webhook/teste \
  -H "Content-Type: application/json" \
  -d '{"teste": "ok"}'
```

**Checklist de verificação:**
- [ ] N8N abre no browser sem erro
- [ ] Login funciona com as credenciais configuradas
- [ ] Workflows importados aparecem na lista
- [ ] Settings → System mostra banco de dados conectado
- [ ] Ao ativar um workflow, não aparece erro de banco

---

## Parte 2: Evolution API no Railway (WhatsApp Business)

### Passo 1: Adicionar Novo Serviço Evolution API

1. No mesmo projeto `spfp-automation` no Railway
2. Clique em **"+ New"** → **"Docker Image"**
3. Insira a imagem: `atendai/evolution-api:latest`
4. Clique em **"Deploy"**

---

### Passo 2: Configurar Variáveis de Ambiente da Evolution API

No serviço Evolution API, clique em **"Variables"** e adicione:

```bash
# ── URL pública da Evolution API no Railway ───────────────────────────────────
# Gere primeiro em Settings → Generate Domain, depois cole aqui
SERVER_URL=https://evolution-production-SEU-HASH.up.railway.app

# ── Autenticação ──────────────────────────────────────────────────────────────
# Gere uma chave forte: node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
AUTHENTICATION_TYPE=apikey
AUTHENTICATION_API_KEY=cole_sua_apikey_segura_aqui

# ── Banco de Dados (pode usar o mesmo PostgreSQL do N8N) ─────────────────────
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=${{Postgres.DATABASE_URL}}

# ── Configuração de Instâncias ────────────────────────────────────────────────
DEL_INSTANCE=false
QRCODE_LIMIT=30

# ── Webhook Global → aponta para o N8N ───────────────────────────────────────
# Substitua pela URL real do seu webhook N8N
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=https://n8n-production-SEU-HASH.up.railway.app/webhook/whatsapp
WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=true

# ── Eventos a capturar (mensagens e status de conexão) ───────────────────────
WEBHOOK_EVENTS_MESSAGES_UPSERT=true
WEBHOOK_EVENTS_MESSAGES_UPDATE=true
WEBHOOK_EVENTS_CONNECTION_UPDATE=true
WEBHOOK_EVENTS_QRCODE_UPDATED=true
WEBHOOK_EVENTS_SEND_MESSAGE=false

# ── Porta ─────────────────────────────────────────────────────────────────────
PORT=8080
```

> O campo `DATABASE_CONNECTION_URI` pode usar a referência `${{Postgres.DATABASE_URL}}` do Railway para apontar para o mesmo PostgreSQL do N8N. Isso centraliza tudo em um único banco.

---

### Passo 3: Gerar Domínio Público para Evolution API

1. No serviço Evolution API → **Settings** → **"Generate Domain"**
2. Copie a URL gerada (ex: `evolution-production-abc123.up.railway.app`)
3. Atualize a variável `SERVER_URL` com essa URL
4. Clique em **"Redeploy"**

---

### Passo 4: Configurar Webhook para Apontar ao N8N

O webhook já foi configurado nas variáveis acima via `WEBHOOK_GLOBAL_URL`. Mas você também precisa criar o endpoint no N8N que vai receber esses eventos.

**No N8N (Railway):**
1. Crie um novo workflow
2. Adicione o node **"Webhook"**
3. Configure:
   - **HTTP Method:** POST
   - **Path:** `whatsapp`
   - **Response Mode:** "Respond to Webhook"
4. Copie a URL gerada: `https://n8n-production-SEU-HASH.up.railway.app/webhook/whatsapp`
5. Ative o workflow (toggle para ON)

Essa URL já está configurada na variável `WEBHOOK_GLOBAL_URL` da Evolution API — os dois serviços estão conectados.

---

### Passo 5: Conectar o WhatsApp Business (Escanear QR Code)

#### Criar uma instância WhatsApp

```bash
# Substitua pelos seus valores reais
EVOLUTION_URL="https://evolution-production-SEU-HASH.up.railway.app"
EVOLUTION_APIKEY="sua_apikey_configurada"

# Criar instância
curl -X POST "$EVOLUTION_URL/instance/create" \
  -H "apikey: $EVOLUTION_APIKEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "spfp-whatsapp",
    "token": "spfp-whatsapp",
    "qrcode": true
  }'
```

#### Obter o QR Code para escanear

```bash
# Buscar QR Code (retorna base64 ou URL da imagem)
curl "$EVOLUTION_URL/instance/connect/spfp-whatsapp" \
  -H "apikey: $EVOLUTION_APIKEY"
```

A resposta vai conter um campo `qrcode` com a string base64. Para visualizar:
1. Copie o valor `base64` do campo `qrcode`
2. Acesse [base64.guru/converter/decode/image](https://base64.guru/converter/decode/image)
3. Cole o base64 e baixe a imagem do QR Code
4. Abra o WhatsApp Business no celular → Menu → Dispositivos vinculados → Escanear QR Code

> Use um número de WhatsApp **dedicado** para o bot. Não pode ser um número que você usa pessoalmente, pois o WhatsApp Web vai desconectar.

#### Verificar status da conexão

```bash
curl "$EVOLUTION_URL/instance/connectionState/spfp-whatsapp" \
  -H "apikey: $EVOLUTION_APIKEY"
```

Resposta esperada quando conectado:
```json
{
  "instance": {
    "instanceName": "spfp-whatsapp",
    "state": "open"
  }
}
```

---

### Passo 6: Testar que está Recebendo Mensagens

#### Teste 1: Enviar mensagem de saída

```bash
curl -X POST "$EVOLUTION_URL/message/sendText/spfp-whatsapp" \
  -H "apikey: $EVOLUTION_APIKEY" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Teste de conexão N8N + Evolution API no Railway funcionando!"
  }'
```

#### Teste 2: Verificar se N8N está recebendo os webhooks

1. No N8N, abra o workflow de teste com o Webhook node
2. Clique em **"Listen for test event"**
3. Envie uma mensagem para o número do WhatsApp conectado (pelo celular)
4. O N8N deve mostrar o payload recebido em tempo real

**Payload de exemplo que você vai receber:**
```json
{
  "event": "messages.upsert",
  "instance": "spfp-whatsapp",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "ABCDEF123456"
    },
    "message": {
      "conversation": "Texto da mensagem enviada"
    },
    "messageTimestamp": 1708900000,
    "pushName": "Nome do Contato"
  }
}
```

---

## Parte 3: Primeiras Credenciais a Configurar no N8N Railway

Após o setup, configure as credenciais nesta ordem de prioridade (maior impacto primeiro):

### 1. ClickUp API Key

**Onde obter:** ClickUp → Menu do usuário → Settings → Apps → API Token

**No N8N:**
1. Settings → Credentials → New Credential
2. Selecione: **"ClickUp API"**
3. Cole o token
4. Nomeie: `CLICKUP_APIKEY_PRINCIPAL`

---

### 2. Supabase (URL + Service Role Key)

**Onde obter:** Supabase Dashboard → seu projeto → Settings → API

**No N8N (2 opções):**

**Opção A — HTTP Request com header:**
1. New Credential → **"Header Auth"**
2. Name: `Authorization`, Value: `Bearer SEU_SERVICE_ROLE_KEY`
3. Nomeie: `SUPABASE_AUTH`
4. Use em HTTP Request nodes com base URL: `https://SEU-PROJETO.supabase.co/rest/v1/`

**Opção B — Supabase node nativo (se disponível):**
1. New Credential → **"Supabase"**
2. Host: `https://SEU-PROJETO.supabase.co`
3. Service Role Key: `eyJ...`
4. Nomeie: `SUPABASE_SPFP`

---

### 3. Stripe (Secret Key + Webhook Secret)

**Onde obter:**
- Secret Key: Stripe Dashboard → Developers → API Keys → Secret key
- Webhook Secret: Stripe Dashboard → Developers → Webhooks → seu endpoint → Signing secret

**No N8N:**
1. New Credential → **"Stripe API"**
2. API Key: `sk_live_...` (ou `sk_test_...` para testes)
3. Nomeie: `STRIPE_LIVE` ou `STRIPE_TEST`

**Para o Webhook Secret (usado para validar eventos):**
1. New Credential → **"HTTP Header Auth"**
2. Name: `stripe-signature`, Value: `whsec_...`
3. Nomeie: `STRIPE_WEBHOOK_SECRET`

> Configure o webhook no Stripe Dashboard apontando para:
> `https://n8n-production-SEU-HASH.up.railway.app/webhook/stripe`

---

### 4. Hotmart (Eventos de Compra)

**Onde obter:** Hotmart → Ferramentas → Desenvolvedor → Credenciais

**No N8N:**
1. New Credential → **"HTTP Header Auth"**
2. Name: `Authorization`, Value: `Bearer SEU_TOKEN_HOTMART`
3. Nomeie: `HOTMART_API`

**Para receber eventos de compra (webhook):**
- No Hotmart → Ferramentas → Webhooks → adicionar URL:
  `https://n8n-production-SEU-HASH.up.railway.app/webhook/hotmart`

---

### 5. Eduzz (alternativa ao Hotmart)

**Onde obter:** Eduzz → Conta → API

**No N8N:**
1. New Credential → **"HTTP Query Auth"**
2. Name: `api_key`, Value: `SEU_TOKEN_EDUZZ`
3. Nomeie: `EDUZZ_API`

---

### 6. RD Station

**Onde obter:** RD Station → Configurações → Integrações → Gerador de Token

**No N8N:**
1. New Credential → **"RD Station Marketing API"** (node nativo se disponível)
2. Ou: **"OAuth2"** com os dados do App RD Station
3. Nomeie: `RDSTATION_PRINCIPAL`

---

### 7. ActiveCampaign (alternativa ao RD Station)

**Onde obter:** ActiveCampaign → Settings → Developer → API Access

**No N8N:**
1. New Credential → **"ActiveCampaign API"**
2. API URL: `https://SUA-CONTA.api-us1.com`
3. API Key: `seu_token`
4. Nomeie: `ACTIVECAMPAIGN_PRINCIPAL`

---

## Parte 4: Primeiro Workflow — SDR Automático

Este é o workflow de maior impacto imediato: WhatsApp recebe mensagem → identifica lead → cria card no ClickUp → responde automaticamente com menu de triagem.

### Arquitetura do Workflow

```
[1. Webhook — Recebe mensagem WhatsApp]
         ↓
[2. IF — É mensagem nova? (não enviada por mim)]
         ↓ sim
[3. Function — Extrair dados do contato]
         ↓
[4. HTTP Request — Buscar lead no Supabase/ClickUp]
         ↓
[5. IF — Lead já existe?]
    ↓ não                    ↓ sim
[6A. ClickUp — Criar card]  [6B. ClickUp — Atualizar card existente]
         ↓                            ↓
[7. HTTP Request — Marcar mensagem como lida na Evolution API]
         ↓
[8. IF — Contém palavras de urgência?]
    ↓ sim                    ↓ não
[9A. Enviar notificação    [9B. Enviar mensagem de
     ao SDR (WhatsApp       triagem automática
     pessoal/Slack)]        com menu de opções]
         ↓
[10. END]
```

---

### Nodes Detalhados (em ordem de execução)

#### Node 1: Webhook (Trigger)

- **Tipo:** Webhook
- **Method:** POST
- **Path:** `whatsapp`
- **Response Mode:** Respond to Webhook
- **Response Code:** 200

```
URL gerada: https://n8n-production-SEU-HASH.up.railway.app/webhook/whatsapp
```

---

#### Node 2: IF — Filtrar mensagens recebidas

- **Tipo:** IF
- **Condição:**
  - Campo: `{{$json["data"]["key"]["fromMe"]}}`
  - Operação: Equal
  - Valor: `false`

> Isso garante que só processamos mensagens recebidas de outros, não as mensagens que o próprio bot enviou.

---

#### Node 3: Function — Extrair dados do contato

- **Tipo:** Code (JavaScript)

```javascript
const data = $input.first().json.data;
const key = data.key;
const message = data.message;

// Extrair número limpo (remover @s.whatsapp.net)
const rawJid = key.remoteJid;
const phone = rawJid.replace('@s.whatsapp.net', '').replace('@g.us', '');

// Extrair texto da mensagem (pode vir em campos diferentes)
const text = message.conversation
  || message.extendedTextMessage?.text
  || message.imageMessage?.caption
  || '[mídia]';

// Nome do contato
const name = data.pushName || 'Sem nome';

return [{
  json: {
    phone,
    name,
    text,
    timestamp: data.messageTimestamp,
    instanceName: $json.instance,
    messageId: key.id,
    isGroup: rawJid.includes('@g.us')
  }
}];
```

---

#### Node 4: IF — Ignorar grupos

- **Tipo:** IF
- **Condição:**
  - Campo: `{{$json["isGroup"]}}`
  - Operação: Equal
  - Valor: `false`

> Opcional: se não quiser processar mensagens de grupos, adicione esse filtro.

---

#### Node 5: HTTP Request — Buscar lead no ClickUp

- **Tipo:** HTTP Request
- **Method:** GET
- **URL:** `https://api.clickup.com/api/v2/list/SUA_LIST_ID_SDR/task`
- **Authentication:** Header Auth (credencial ClickUp)
- **Query Parameters:**
  - `custom_field`: filtra por número de telefone se tiver custom field configurado
  - Ou buscar por nome: `search={{$json["name"]}}`

---

#### Node 6A: ClickUp — Criar card de lead novo

- **Tipo:** ClickUp
- **Operation:** Create Task
- **List ID:** ID da sua lista "Pipeline SDR" no ClickUp
- **Name:** `Lead WA — {{$json["name"]}}`
- **Description:**
```
📱 Telefone: {{$json["phone"]}}
💬 Primeira mensagem: {{$json["text"]}}
🕐 Data: {{new Date($json["timestamp"] * 1000).toLocaleString('pt-BR')}}
📍 Canal: WhatsApp
```
- **Status:** `Novo Lead`
- **Priority:** `Normal`

---

#### Node 7: HTTP Request — Marcar mensagem como lida

- **Tipo:** HTTP Request
- **Method:** POST
- **URL:** `https://evolution-production-SEU-HASH.up.railway.app/chat/markMessageAsRead/spfp-whatsapp`
- **Authentication:** Header Auth (credencial Evolution API)
- **Body (JSON):**
```json
{
  "readMessages": [
    {
      "id": "{{$('Node 3 — Extrair dados').first().json.messageId}}",
      "fromMe": false,
      "remote": "{{$('Node 3 — Extrair dados').first().json.phone}}@s.whatsapp.net"
    }
  ]
}
```

---

#### Node 8: IF — Detectar urgência

- **Tipo:** IF
- **Condição:**
  - Campo: `{{$json["text"].toLowerCase()}}`
  - Operação: Contains
  - Valor: `urgente` OU `hoje` OU `preciso` OU `cancelar` OU `problema`

> Use o modo "OR" para checar múltiplas palavras-chave.

---

#### Node 9A: HTTP Request — Notificar SDR (lead urgente)

- **Tipo:** HTTP Request
- **Method:** POST
- **URL:** `https://evolution-production-SEU-HASH.up.railway.app/message/sendText/spfp-whatsapp`
- **Body:**
```json
{
  "number": "55119NUMERO_DO_SDR",
  "text": "⚠️ *Lead urgente no WhatsApp!*\n\n*Nome:* {{$('Node 3 — Extrair dados').first().json.name}}\n*Número:* {{$('Node 3 — Extrair dados').first().json.phone}}\n*Mensagem:* {{$('Node 3 — Extrair dados').first().json.text}}\n\n_Responda agora._"
}
```

---

#### Node 9B: HTTP Request — Enviar menu de triagem ao lead

- **Tipo:** HTTP Request
- **Method:** POST
- **URL:** `https://evolution-production-SEU-HASH.up.railway.app/message/sendText/spfp-whatsapp`
- **Body:**
```json
{
  "number": "{{$('Node 3 — Extrair dados').first().json.phone}}",
  "text": "Oi {{$('Node 3 — Extrair dados').first().json.name}}! 👋\n\nSou o assistente da SPFP — Sistema de Planejamento Financeiro Pessoal.\n\nRecebi sua mensagem e um especialista vai entrar em contato em breve!\n\nEnquanto isso, o que melhor descreve sua situação financeira agora?\n\n1️⃣ Quero organizar minhas finanças\n2️⃣ Tenho dívidas que quero quitar\n3️⃣ Quero começar a investir\n4️⃣ Já sou cliente e preciso de ajuda\n\nResponda com o número da opção. 😊"
}
```

---

### Como Importar o Workflow no N8N

Se preferir importar em vez de construir node a node:

1. Crie um arquivo `sdr-workflow.json` com a estrutura do N8N
2. No N8N Railway → Workflows → Import → selecione o arquivo
3. Atualize as URLs da Evolution API e N8N com os seus valores do Railway
4. Reconfigure as credenciais (ClickUp, Evolution API)
5. Ative o workflow

---

### Testando o Workflow Completo

1. Ative o workflow no N8N (toggle para ON)
2. Envie uma mensagem para o número WhatsApp conectado pelo celular
3. Verifique no N8N: vá em **Executions** → deve aparecer uma execução nova
4. Verifique no ClickUp: deve aparecer um card novo na lista do SDR
5. No celular, deve receber o menu automático de triagem em menos de 5 segundos

---

## Alertas e Pontos de Atenção

> **Limite Railway:** O plano gratuito tem $5/mês de crédito. Se o consumo ultrapassar esse valor, o Railway vai pausar os serviços até o próximo mês. Monitore em Railway → Usage.

> **WhatsApp ToS:** A Evolution API usa a API não oficial do WhatsApp (engenharia reversa). O número pode ser banido se:
> - Enviar spam ou mensagens em massa não solicitadas
> - Muitos destinatários reportarem como spam
> - Volume anormal de mensagens em curto período
> Comece com volume baixo e aumente gradualmente.

> **Reconexão do WhatsApp:** O WhatsApp desconecta periodicamente (especialmente se o servidor reiniciar). Configure um workflow de healthcheck no N8N para verificar o status da conexão diariamente e alertar você se desconectar.

> **Credenciais não migram:** Os workflows exportados do n8n.cloud têm referências a credenciais que não existem no Railway. Após importar, cada workflow vai mostrar erro de credencial — você precisa mapear manualmente para as novas credenciais.

> **Variáveis de ambiente no Railway:** Toda vez que você atualizar uma variável de ambiente no Railway, ele faz um redeploy automático do serviço. Normal e esperado.

> **Sleep mode:** No plano gratuito do Railway, serviços que ficam sem tráfego por um longo período podem entrar em sleep. N8N com cron jobs ativos não vai dormir, mas se ficar sem workflows ativos, pode levar alguns segundos para "acordar" na primeira requisição.

---

## Estimativa de Tempo de Setup

| Tarefa | Tempo estimado |
|--------|----------------|
| Criar conta Railway + projeto | 5 min |
| PostgreSQL plugin + N8N deploy | 10 min |
| Configurar variáveis N8N | 10 min |
| Exportar/importar workflows | 15 min |
| Deploy Evolution API | 10 min |
| Conectar WhatsApp (QR Code) | 5 min |
| Configurar credenciais N8N | 30 min |
| Construir workflow SDR | 45–60 min |
| **Total estimado** | **~2–2.5 horas** |

---

## Referências

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- N8N Docker Image: [hub.docker.com/r/n8nio/n8n](https://hub.docker.com/r/n8nio/n8n)
- Evolution API Docs: [doc.evolution-api.com](https://doc.evolution-api.com)
- N8N Railway Deploy (community): [community.n8n.io](https://community.n8n.io)
- Documento anterior (VPS self-hosted): `docs/devops/N8N-SETUP-PLAN.md`

---

*Gerado por Gage (DevOps Agent — AIOS SPFP) em 2026-02-25*
*Versão: 1.0 — Railway Migration Guide*
