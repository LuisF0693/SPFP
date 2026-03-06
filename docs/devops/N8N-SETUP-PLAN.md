# N8N Setup Plan — Hub Central de Automação SPFP
# Documento Técnico — DevOps / Gage

**Data:** 2026-02-25
**Autor:** Gage (DevOps Agent — AIOS)
**Classificação:** Plano de Infraestrutura Executável
**Escopo:** Configuração N8N como hub central para Marketing, Vendas, CS, Products, Admin, OPS

---

## Sumário Executivo

Este documento cobre a decisão de infraestrutura, arquitetura de credenciais, os 5 primeiros
workflows de alto impacto, configuração do WhatsApp Business, checklist completo de setup e
MCPs relevantes para acelerar o desenvolvimento das automações.

**Decisão central:** N8N self-hosted em VPS dedicado (justificativa na Seção 1).
**Tempo estimado até operacional:** 3–5 dias úteis para base funcional.
**Custo mensal estimado:** R$ 130–200/mês.

---

## 1. Decisão: N8N Self-Hosted vs Cloud

### Comparação

| Critério | Self-Hosted (VPS) | N8N Cloud | Railway/Render |
|----------|-------------------|-----------|----------------|
| Custo/mês | ~$20–40 USD | $20–50 USD | $10–25 USD |
| Controle total | SIM | NÃO | PARCIAL |
| Dados no Brasil | SIM (se VPS BR) | NÃO (EUA/EU) | NÃO |
| Limite de workflows | ILIMITADO | 5–20 (plano) | ILIMITADO |
| Limite de execuções | ILIMITADO | 5k–50k/mês | ILIMITADO |
| Manutenção | SUA RESPONSABILIDADE | Deles | Parcial |
| Uptime SLA | Depende do VPS | 99.9% | ~99% |
| LGPD/dados sensíveis | COMPLIANT | RISCO | RISCO |
| Credenciais criptografadas | Você controla | Deles | Parcial |
| White-label / domínio próprio | SIM | NÃO | NÃO |
| Integrações ilimitadas | SIM | Limitado no plano | SIM |

### Recomendação: Self-Hosted na DigitalOcean (Droplet)

**Justificativas:**

1. **LGPD** — A SPFP processa dados financeiros pessoais de clientes. Manter os dados em servidor
   sob controle direto elimina riscos de compliance e auditoria.

2. **Sem limites** — Com 6 squads e 15+ APIs integradas, workflows vão escalar rapidamente.
   Planos cloud ficam caros ou limitantes muito rápido.

3. **Custo** — Um Droplet de $20/mês (4GB RAM, 2 vCPU) suporta centenas de workflows simultâneos.
   N8N Cloud equivalente seria $50+/mês com restrições.

4. **Credenciais** — WhatsApp Business, Stripe, Conta Azul — todas ficam no seu ambiente, sem
   terceiros processando seus tokens OAuth.

5. **Domínio próprio** — `n8n.spfp.com.br` — profissional e isolado.

### Servidor Recomendado: DigitalOcean Droplet

**Especificação mínima:**
- **Droplet:** Basic, 4GB RAM / 2 vCPU / 80GB SSD
- **Região:** NYC3 ou SFO3 (latência OK para Brasil) — se LGPD crítico: escolha Frankfurt (EU)
- **OS:** Ubuntu 22.04 LTS
- **Custo:** $24 USD/mês (~R$ 130)

**Especificação recomendada (produção):**
- **Droplet:** Basic, 8GB RAM / 4 vCPU / 160GB SSD
- **Custo:** $48 USD/mês (~R$ 260)
- Justificado quando passar de 50 workflows ativos

**Alternativa econômica:** Hetzner Cloud (CX21 — €5.77/mês, 4GB RAM, Frankfurt)
- Mais barato, mesma qualidade, maior proximidade temporal com Brasil
- Cuidado: suporte é mais básico que DigitalOcean

### Custo Mensal Estimado (Self-Hosted)

| Item | Custo |
|------|-------|
| DigitalOcean Droplet (4GB) | $24 USD |
| Domínio (já existente ou novo) | $1–2 USD |
| Backup automático (DigitalOcean) | $4.80 USD |
| **Total USD** | ~$30 USD |
| **Total BRL (estimado)** | ~R$ 165/mês |

---

## 2. Arquitetura de Credenciais

### Princípio de Organização

Cada credencial no N8N deve ser nomeada no padrão:
```
[SQUAD]_[SERVIÇO]_[TIPO]
```
Exemplos: `MARKETING_META_OAUTH`, `VENDAS_CALENDLY_APIKEY`, `ADMIN_STRIPE_APIKEY`

### Mapa de Credenciais por API

| API | Tipo Auth | Squad(s) | Notas |
|-----|-----------|----------|-------|
| WhatsApp Business (Z-API / Evolution) | Webhook + Token | Vendas, CS | Configurar primeiro |
| Meta Graph API (Instagram/Facebook) | OAuth 2.0 | Marketing | Requer App no Meta Developers |
| Google Drive API | OAuth 2.0 | Todos | 1 credencial compartilhada |
| Calendly | OAuth 2.0 / API Key | Vendas, CS | Ambos funcionam |
| ClickUp | API Key | OPS, Todos | 1 token por workspace |
| RD Station / ActiveCampaign | API Key | Marketing, CS | Escolher 1 plataforma |
| Canva API | OAuth 2.0 | Marketing, Products | Requer aprovação Canva |
| Conta Azul / Omie | OAuth 2.0 | Admin | Escolher 1 ERP |
| Stripe | API Key (Secret + Webhook) | Admin, Vendas | 2 chaves: test + prod |
| Hotmart / Eduzz | API Key + Webhook | Products | Ambos têm webhooks |
| Gupy | API Key | Admin (RH) | API REST |
| DocuSign / PandaDoc | OAuth 2.0 | Admin (Jurídico) | Ambos têm N8N node nativo |
| Supabase (SPFP DB) | API Key + URL | OPS, Admin | Integrar com app principal |

### Tipos de Autenticação

#### OAuth 2.0 (requer app registration + fluxo de autorização)
- Meta Graph API
- Google Drive
- Calendly
- Conta Azul / Omie
- DocuSign / PandaDoc
- Canva

**Ação necessária:** Criar App/Projeto no portal de desenvolvedores de cada serviço e obter
`client_id` + `client_secret`. O N8N cuida do fluxo OAuth automaticamente depois.

#### API Key (simples — copia e cola)
- ClickUp (Settings → Apps → API Token)
- RD Station / ActiveCampaign
- Stripe (Dashboard → Developers → API Keys)
- Hotmart / Eduzz
- Gupy
- Supabase

#### Webhook (N8N gera a URL — você cola no sistema externo)
- WhatsApp (Z-API ou Evolution API envia eventos para o N8N)
- Stripe (eventos de pagamento)
- Hotmart (eventos de compra/cancelamento)
- Calendly (eventos de agendamento)

### Ordem de Configuração (por dependência e impacto)

```
SEMANA 1 — Fundação
├── 1. Google Drive API          (usado por todos os squads)
├── 2. ClickUp API               (gestão de processos — backbone)
├── 3. WhatsApp Business         (Vendas + CS — maior impacto imediato)
└── 4. Supabase                  (conectar com o app SPFP)

SEMANA 2 — Revenue
├── 5. Stripe                    (pagamentos — crítico para Vendas/Admin)
├── 6. Hotmart ou Eduzz          (infoprodutos — Products)
├── 7. RD Station ou ActiveCampaign (email marketing — Marketing/CS)
└── 8. Calendly                  (agendamentos — Vendas/CS)

SEMANA 3 — Marketing & Admin
├── 9.  Meta Graph API           (Instagram/Facebook — Marketing)
├── 10. Conta Azul ou Omie       (ERP — Admin)
├── 11. DocuSign ou PandaDoc     (contratos — Admin/Jurídico)
└── 12. Gupy                     (RH — Admin)

SEMANA 4 — Conteúdo
└── 13. Canva API                (templates — Marketing/Products)
```

---

## 3. Primeiros 5 Workflows (por prioridade de impacto)

### Critérios de priorização
1. Impacto direto em receita (Vendas primeiro)
2. Volume de operações manuais eliminadas (CS onboarding)
3. Recorrência diária (notificações e relatórios)
4. Dependência de outros workflows (fundação primeiro)

---

### WORKFLOW 1 — SDR Automático: Lead WhatsApp → CRM + ClickUp

**Objetivo:** Quando um lead manda mensagem no WhatsApp, criar card no CRM, task no ClickUp
para o SDR e enviar mensagem de boas-vindas automaticamente.

**Impacto:** Elimina 100% do trabalho manual de qualificação inicial. SDR foca só em leads
quentes que já passaram pela triagem automática.

**Trigger:** Webhook — WhatsApp recebe mensagem (Z-API/Evolution API envia para N8N)

**Nodes no N8N:**
```
[Webhook] → [Switch: mensagem nova vs resposta?]
    ↓ nova
[HTTP Request: Z-API/Evolution — marcar como lido]
    ↓
[Function: extrair nome, número, mensagem]
    ↓
[ClickUp: criar task "Lead WhatsApp" na lista SDR]
    ↓
[HTTP Request: enviar mensagem WhatsApp de boas-vindas]
    ↓
[IF: mensagem contém palavras-chave de urgência?]
    ↓ sim
[Slack/WhatsApp: notificar SDR imediatamente]
    ↓ não
[End: lead em fila normal]
```

**APIs envolvidas:**
- WhatsApp Business (Z-API ou Evolution API) — entrada + saída
- ClickUp — criar task com dados do lead
- Slack (opcional) — notificar SDR

**Output esperado:**
- Card criado no ClickUp com: nome, número, mensagem inicial, timestamp
- Mensagem automática enviada para o lead em <5 segundos
- SDR notificado se lead usar palavras como "urgente", "preciso", "hoje"

**Mensagem automática de boas-vindas:**
```
Oi [Nome]! Sou o assistente da SPFP.
Recebi sua mensagem e um especialista vai entrar em contato
em breve. Enquanto isso, o que melhor descreve sua situação?

1️⃣ Quero organizar minhas finanças
2️⃣ Tenho dívidas que quero quitar
3️⃣ Quero começar a investir
4️⃣ Outro
```

---

### WORKFLOW 2 — Onboarding Automático: Hotmart/Eduzz → CS + WhatsApp

**Objetivo:** Quando um cliente compra um produto/curso na Hotmart ou Eduzz, disparar
automaticamente: mensagem de boas-vindas no WhatsApp, criar task de onboarding no ClickUp
para o CS, e adicionar o cliente em sequência de email no RD Station/ActiveCampaign.

**Impacto:** CS deixa de fazer onboarding manual. Todos os clientes recebem o mesmo
tratamento imediatamente, independente do horário da compra.

**Trigger:** Webhook — Hotmart/Eduzz envia evento `purchase.complete`

**Nodes no N8N:**
```
[Webhook: Hotmart/Eduzz purchase.complete]
    ↓
[Function: extrair dados do cliente (nome, email, telefone, produto)]
    ↓
[HTTP Request: WhatsApp — enviar mensagem de boas-vindas personalizada]
    ↓
[ClickUp: criar task "Onboarding [Nome]" na lista CS com subtasks padrão]
    ↓
[RD Station / ActiveCampaign: adicionar contato + ativar sequência de emails]
    ↓
[Google Drive: criar pasta do cliente em /Clientes/[Nome]/]
    ↓
[Slack: notificar canal #cs-onboarding com dados do novo cliente]
```

**APIs envolvidas:**
- Hotmart / Eduzz — trigger (webhook)
- WhatsApp Business — boas-vindas
- ClickUp — task de onboarding com subtasks
- RD Station / ActiveCampaign — sequência de email
- Google Drive — pasta do cliente
- Slack — notificação interna CS

**Output esperado:**
- Cliente recebe WhatsApp personalizado em <2 minutos após compra
- Task no ClickUp com subtasks: "Enviar credenciais", "Call de boas-vindas", "Check-in 7 dias"
- Pasta criada no Drive: `/Clientes/2026/[Nome-Data]/`
- Email sequência iniciada automaticamente (Day 0, Day 3, Day 7, Day 14, Day 30)

---

### WORKFLOW 3 — Relatório Diário de Pipeline de Vendas

**Objetivo:** Todo dia às 8h, gerar e enviar para o canal do WhatsApp/Slack do time de
Vendas um resumo do pipeline: leads novos, calls agendadas, propostas enviadas, deals fechados.

**Impacto:** Elimina o trabalho manual de montar o daily report. Time de vendas começa o
dia com visibilidade total do pipeline sem abrir o CRM.

**Trigger:** Cron — todo dia às 08:00 (BRT = 11:00 UTC)

**Nodes no N8N:**
```
[Cron: 0 11 * * 1-5 (seg-sex, 08:00 BRT)]
    ↓
[ClickUp: buscar tasks criadas nas últimas 24h (lista SDR)]
    ↓
[ClickUp: buscar tasks com status "Proposta Enviada"]
    ↓
[ClickUp: buscar tasks fechadas nas últimas 24h]
    ↓
[Calendly: buscar calls agendadas para hoje]
    ↓
[Function: montar markdown do relatório]
    ↓
[HTTP Request: enviar para WhatsApp do grupo Vendas]
    ↓
[Slack: enviar para #vendas-daily]
```

**APIs envolvidas:**
- ClickUp — dados do pipeline
- Calendly — calls do dia
- WhatsApp Business — envio ao grupo
- Slack — canal interno

**Output esperado (formato da mensagem):**
```
📊 *Pipeline Vendas — [Data]*

🆕 Leads novos: X
📞 Calls hoje: X (links abaixo)
📄 Propostas abertas: X
✅ Fechamentos ontem: X (R$ X,XX)

*Calls de hoje:*
• 09:00 — João Silva (discovery)
• 14:30 — Maria Costa (fechamento)

_Veja detalhes no ClickUp →_
```

---

### WORKFLOW 4 — Renovação / Retenção: Churn Prevention Automático

**Objetivo:** Identificar clientes em risco de churn (sem login há X dias, NPS baixo, ticket
aberto sem resposta) e acionar automaticamente a sequência de retenção do CS.

**Impacto:** CS proativo em vez de reativo. Retenção de 1 cliente vale mais que adquirir
5 novos (princípio Lincoln Murphy).

**Trigger:** Cron + Webhook — diariamente às 9h + evento de NPS baixo

**Nodes no N8N:**
```
[Cron: diário 09:00]
    ↓
[Supabase: buscar usuários sem login há > 7 dias]
    ↓
[ClickUp: verificar se já existe task de retenção aberta para esses usuários]
    ↓
[IF: task já existe?]
    ↓ não
[ClickUp: criar task "Retenção — [Nome]" para cs-retencao]
    ↓
[WhatsApp: enviar mensagem de check-in personalizada]
    ↓
[RD Station: pausar sequência de email padrão → ativar sequência de retenção]
    ↓
[Slack: notificar cs-retencao no canal #cs-alertas]
```

**APIs envolvidas:**
- Supabase — dados de engajamento do app SPFP
- ClickUp — tasks de retenção
- WhatsApp Business — mensagem de check-in
- RD Station / ActiveCampaign — troca de sequência
- Slack — alerta interno

**Output esperado:**
- Lista diária de clientes em risco no ClickUp com dados de contexto
- Mensagem WhatsApp enviada automaticamente (tom humano, não robótico)
- CS vê no canal #cs-alertas quem precisa de atenção hoje

**Mensagem de check-in exemplo:**
```
Oi [Nome]! Tudo bem?

Notei que faz alguns dias que você não acessa o SPFP.
Posso te ajudar com alguma coisa ou tem alguma dificuldade?

Estou aqui se precisar. 👋
```

---

### WORKFLOW 5 — Automação Financeira: Stripe → Conta Azul/Omie + Notificação Admin

**Objetivo:** Quando um pagamento é processado (ou falha) no Stripe, registrar
automaticamente na contabilidade (Conta Azul/Omie), atualizar status no ClickUp e notificar
o time financeiro.

**Impacto:** Elimina lançamento manual no ERP. Conciliação financeira diária automática.
Reduz risco de inconsistência entre Stripe e contabilidade.

**Trigger:** Webhook — Stripe envia eventos `payment_intent.succeeded` e `payment_intent.failed`

**Nodes no N8N:**
```
[Webhook: Stripe payment_intent.succeeded]
    ↓
[Function: extrair valor, cliente, produto, data, ID transação]
    ↓
[Conta Azul / Omie: criar lançamento de receita]
    ↓
[ClickUp: atualizar task do deal (status → Pago)]
    ↓
[WhatsApp/Slack: notificar #financeiro com resumo]
    ↓
--- Paralelo ---
[Webhook: Stripe payment_intent.failed]
    ↓
[Function: extrair dados + motivo da falha]
    ↓
[WhatsApp: notificar cliente sobre falha no pagamento]
    ↓
[ClickUp: criar task urgente para financeiro]
    ↓
[Slack: alertar #financeiro urgente]
```

**APIs envolvidas:**
- Stripe — trigger (webhooks de pagamento)
- Conta Azul / Omie — lançamento contábil
- ClickUp — atualização de status
- WhatsApp Business — notificação ao cliente (falha)
- Slack — notificação interna Admin

**Output esperado:**
- Cada pagamento aprovado cria lançamento automático no ERP em <30 segundos
- Falha de pagamento: cliente recebe WhatsApp automático + financeiro é alertado
- Dashboard de receita em tempo real no ClickUp para o Admin

---

## 4. Configuração do WhatsApp Business

### Qual solução usar: Z-API vs Evolution API vs Baileys

| Critério | Z-API | Evolution API | Baileys (direct) |
|----------|-------|---------------|-----------------|
| Tipo | SaaS (cloud) | Self-hosted | Biblioteca Node.js |
| Custo | R$ 149–349/mês | GRATUITO (self-host) | GRATUITO |
| Manutenção | Zero | Você gerencia | Alto |
| Estabilidade | Alta | Alta (bem mantida) | Variável |
| Multi-instâncias | Sim (plano) | Sim (ilimitado) | Manual |
| N8N Integration | Webhook nativo | Webhook nativo | Manual |
| Official WA API | Não (Web API) | Não (Web API) | Não (Web API) |
| WhatsApp Business Official | Sim (plano Pro) | Parcial | Não |
| Suporte BR | Excelente | Comunidade ativa | Baixo |

**Recomendação:** Evolution API (self-hosted no mesmo VPS do N8N)

**Justificativa:** Custo zero, ilimitado, controle total, comunidade ativa brasileira, integração
nativa com N8N via webhooks. Z-API é boa opção se preferir não gerenciar, mas o custo
mensal é significativo.

**Alternativa se já tiver conta Z-API ativa:** Manter Z-API e usar os webhooks dela no N8N.
O setup é idêntico — só muda a URL de onde vêm os eventos.

---

### Setup do Evolution API no VPS (junto com N8N)

#### Pré-requisito: Docker e Docker Compose instalados

```bash
# Instalar Docker no Ubuntu 22.04
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
```

#### docker-compose.yml completo (N8N + Evolution API + Redis + PostgreSQL)

```yaml
version: '3.8'

services:

  # ─── PostgreSQL — Banco de dados N8N ───────────────────────────────────────
  postgres:
    image: postgres:15-alpine
    container_name: spfp_postgres
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: TROQUE_ESTA_SENHA
      POSTGRES_DB: n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    networks:
      - spfp_network

  # ─── Redis — Cache Evolution API ───────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: spfp_redis
    restart: always
    networks:
      - spfp_network

  # ─── N8N — Hub de Automação ─────────────────────────────────────────────────
  n8n:
    image: n8nio/n8n:latest
    container_name: spfp_n8n
    environment:
      # Database
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: TROQUE_ESTA_SENHA
      # N8N Config
      N8N_HOST: n8n.spfp.com.br
      N8N_PORT: 5678
      N8N_PROTOCOL: https
      WEBHOOK_URL: https://n8n.spfp.com.br/
      N8N_ENCRYPTION_KEY: GERE_UMA_CHAVE_32_CHARS
      # Timezone
      GENERIC_TIMEZONE: America/Sao_Paulo
      TZ: America/Sao_Paulo
      # Auth básica (adicionar depois SSO)
      N8N_BASIC_AUTH_ACTIVE: "true"
      N8N_BASIC_AUTH_USER: admin
      N8N_BASIC_AUTH_PASSWORD: TROQUE_ESTA_SENHA_N8N
      # Email (para notificações de erros)
      N8N_EMAIL_MODE: smtp
      N8N_SMTP_HOST: smtp.gmail.com
      N8N_SMTP_PORT: 587
      N8N_SMTP_USER: seu-email@spfp.com.br
      N8N_SMTP_PASS: SUA_SENHA_APP_GMAIL
      N8N_DEFAULT_BINARY_DATA_MODE: filesystem
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres
      - redis
    restart: always
    networks:
      - spfp_network

  # ─── Evolution API — WhatsApp ───────────────────────────────────────────────
  evolution_api:
    image: atendai/evolution-api:latest
    container_name: spfp_evolution
    environment:
      SERVER_URL: https://whatsapp.spfp.com.br
      AUTHENTICATION_TYPE: apikey
      AUTHENTICATION_API_KEY: GERE_UMA_APIKEY_SEGURA
      # Redis
      REDIS_ENABLED: "true"
      REDIS_URI: redis://redis:6379
      # Webhook global para N8N
      WEBHOOK_GLOBAL_ENABLED: "true"
      WEBHOOK_GLOBAL_URL: https://n8n.spfp.com.br/webhook/whatsapp
      WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS: "true"
      WEBHOOK_EVENTS_MESSAGES_UPSERT: "true"
      WEBHOOK_EVENTS_CONNECTION_UPDATE: "true"
      WEBHOOK_EVENTS_QRCODE_UPDATED: "true"
    ports:
      - "8080:8080"
    volumes:
      - evolution_data:/evolution/instances
    depends_on:
      - redis
    restart: always
    networks:
      - spfp_network

volumes:
  postgres_data:
  n8n_data:
  evolution_data:

networks:
  spfp_network:
    driver: bridge
```

#### Deploy no servidor

```bash
# No servidor (DigitalOcean Droplet)
mkdir -p /opt/spfp-automation
cd /opt/spfp-automation

# Criar o arquivo docker-compose.yml com o conteúdo acima
nano docker-compose.yml

# Subir tudo
docker-compose up -d

# Verificar logs
docker-compose logs -f n8n
docker-compose logs -f evolution_api
```

---

### Configuração do Nginx (Proxy Reverso + SSL)

```bash
# Instalar Nginx + Certbot
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx

# Criar configuração Nginx para N8N
sudo nano /etc/nginx/sites-available/n8n.spfp.com.br
```

```nginx
server {
    server_name n8n.spfp.com.br;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}

server {
    server_name whatsapp.spfp.com.br;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar sites
sudo ln -s /etc/nginx/sites-available/n8n.spfp.com.br /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Gerar SSL (gratuito via Let's Encrypt)
sudo certbot --nginx -d n8n.spfp.com.br -d whatsapp.spfp.com.br
```

---

### Conectar WhatsApp ao Evolution API

```bash
# 1. Criar instância WhatsApp via API
curl -X POST https://whatsapp.spfp.com.br/instance/create \
  -H "apikey: SUA_APIKEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "spfp-principal",
    "token": "spfp-principal",
    "qrcode": true
  }'

# 2. Buscar QR Code para conexão
curl https://whatsapp.spfp.com.br/instance/connect/spfp-principal \
  -H "apikey: SUA_APIKEY"

# 3. A API retorna um QR code em base64 — escanear com WhatsApp Business
# 4. Verificar status de conexão
curl https://whatsapp.spfp.com.br/instance/connectionState/spfp-principal \
  -H "apikey: SUA_APIKEY"
```

---

### Configuração de Webhooks no N8N para WhatsApp

No N8N, criar um workflow com Webhook node na URL:
```
https://n8n.spfp.com.br/webhook/whatsapp
```

O Evolution API envia para esse endpoint todos os eventos de mensagens.

**Estrutura do payload recebido:**
```json
{
  "event": "messages.upsert",
  "instance": "spfp-principal",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false
    },
    "message": {
      "conversation": "Texto da mensagem"
    },
    "messageTimestamp": 1708900000,
    "pushName": "Nome do Contato"
  }
}
```

---

### Casos de Uso Imediatos

#### SDR (Vendas)
- Lead envia mensagem → triagem automática → card no CRM
- Resposta automática de qualificação com menu de opções
- Notificação do SDR apenas para leads quentes (palavras-chave)
- Follow-up automático após 24h sem resposta do lead

#### Onboarding (CS)
- Cliente compra → WhatsApp de boas-vindas em <2 minutos
- Envio automático de link de acesso + instruções de primeiros passos
- Checkin automático no Day 3 e Day 7
- Escalada para humano se cliente não responder em 24h

#### Suporte (CS)
- Cliente envia "suporte" ou "problema" → abrir ticket no ClickUp automaticamente
- Triagem por palavras-chave: técnico / financeiro / dúvida / cancelamento
- SLA automático: resposta em 2h (úteis) — alerta se ultrapassar
- Escalada para cs-retencao se palavras como "cancelar", "sair", "caro" forem detectadas

---

## 5. Checklist de Setup Completo

### PRÉ-SETUP (antes de tocar no servidor)

- [ ] **DNS** — Criar registros A no DNS do domínio:
  - `n8n.spfp.com.br` → IP do VPS
  - `whatsapp.spfp.com.br` → IP do VPS
  - Aguardar propagação (15 min – 48h)

- [ ] **APIs — Levantar credenciais:**
  - [ ] ClickUp: Settings → Apps → API Token
  - [ ] WhatsApp: número disponível para conectar (não pode estar em uso no web.whatsapp.com)
  - [ ] Stripe: Dashboard → Developers → API Keys (copiar Secret Key)
  - [ ] Hotmart/Eduzz: Painel → Configurações → API
  - [ ] RD Station / ActiveCampaign: Conta → Integrações → API Key
  - [ ] Supabase: Settings → API (service_role key + URL)

- [ ] **Decisões a tomar:**
  - [ ] Confirmar qual ERP: Conta Azul OU Omie
  - [ ] Confirmar qual email marketing: RD Station OU ActiveCampaign
  - [ ] Confirmar qual docusign: DocuSign OU PandaDoc
  - [ ] Confirmar se já tem Z-API ativa (se sim, usar Z-API em vez de Evolution API)

---

### FASE 1: Servidor e Infraestrutura

- [ ] **1.1** — Criar Droplet na DigitalOcean (4GB RAM, Ubuntu 22.04)
- [ ] **1.2** — Configurar SSH key (não usar senha root)
- [ ] **1.3** — Configurar firewall UFW:
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```
- [ ] **1.4** — Instalar Docker + Docker Compose
- [ ] **1.5** — Criar `/opt/spfp-automation/` e subir `docker-compose.yml`
- [ ] **1.6** — Verificar containers rodando: `docker-compose ps`
- [ ] **1.7** — Instalar Nginx
- [ ] **1.8** — Configurar virtual hosts para `n8n.spfp.com.br` e `whatsapp.spfp.com.br`
- [ ] **1.9** — Gerar certificados SSL via Certbot
- [ ] **1.10** — Verificar N8N acessível em `https://n8n.spfp.com.br`

---

### FASE 2: WhatsApp Business

- [ ] **2.1** — Se Evolution API: criar instância via curl (ver Seção 4)
- [ ] **2.2** — Se Z-API já ativa: copiar Instance Token e Secret Token do painel Z-API
- [ ] **2.3** — Escanear QR Code com WhatsApp Business (número dedicado)
- [ ] **2.4** — Verificar status `connected` via API
- [ ] **2.5** — Testar envio de mensagem:
  ```bash
  # Evolution API
  curl -X POST https://whatsapp.spfp.com.br/message/sendText/spfp-principal \
    -H "apikey: SUA_APIKEY" \
    -H "Content-Type: application/json" \
    -d '{"number": "5511999999999", "text": "Teste N8N funcionando!"}'
  ```
- [ ] **2.6** — Configurar webhook no Evolution API apontando para N8N
- [ ] **2.7** — Criar workflow de teste no N8N (Webhook → Log) e confirmar recebimento

---

### FASE 3: Credenciais no N8N

- [ ] **3.1** — Acessar `https://n8n.spfp.com.br`
- [ ] **3.2** — Criar credencial: ClickUp (API Key)
- [ ] **3.3** — Criar credencial: Supabase / HTTP (URL + service_role key)
- [ ] **3.4** — Criar credencial: WhatsApp/Z-API (HTTP Request com header apikey)
- [ ] **3.5** — Criar credencial: Stripe (API Key)
- [ ] **3.6** — Criar credencial: Hotmart/Eduzz (API Key + Webhook Secret)
- [ ] **3.7** — Criar credencial: RD Station / ActiveCampaign (API Key)
- [ ] **3.8** — Criar credencial: Google Drive (OAuth — via Google Cloud Console)
- [ ] **3.9** — Criar credencial: Meta Graph API (OAuth — via Meta Developers)
- [ ] **3.10** — Criar credencial: Calendly (OAuth ou API Key)
- [ ] **3.11** — Criar credencial: Conta Azul / Omie (OAuth)
- [ ] **3.12** — Criar credencial: DocuSign / PandaDoc (OAuth)
- [ ] **3.13** — Criar credencial: Gupy (API Key)

---

### FASE 4: Workflows

- [ ] **4.1** — Importar/criar **Workflow 1**: SDR Automático WhatsApp → ClickUp
  - [ ] Testar com número pessoal
  - [ ] Verificar criação de task no ClickUp
  - [ ] Verificar resposta automática enviada
  - [ ] Ativar workflow em produção

- [ ] **4.2** — Importar/criar **Workflow 2**: Onboarding Hotmart → CS + WhatsApp
  - [ ] Testar com compra de teste na Hotmart
  - [ ] Verificar WhatsApp enviado ao cliente
  - [ ] Verificar task criada no ClickUp CS
  - [ ] Verificar contato adicionado no email marketing
  - [ ] Ativar workflow em produção

- [ ] **4.3** — Importar/criar **Workflow 3**: Relatório Diário de Vendas
  - [ ] Testar execução manual
  - [ ] Verificar mensagem recebida no grupo WhatsApp
  - [ ] Ativar Cron (08:00 BRT)

- [ ] **4.4** — Importar/criar **Workflow 4**: Churn Prevention
  - [ ] Configurar query no Supabase (usuários sem login)
  - [ ] Testar com usuário de teste
  - [ ] Ativar Cron (09:00 BRT)

- [ ] **4.5** — Importar/criar **Workflow 5**: Stripe → ERP + Notificações
  - [ ] Configurar webhook no Stripe Dashboard
  - [ ] Testar com pagamento de teste (modo test)
  - [ ] Verificar lançamento criado no ERP
  - [ ] Ativar para produção

---

### FASE 5: Monitoramento e Manutenção

- [ ] **5.1** — Configurar alertas de erro no N8N (email em caso de workflow falhando)
- [ ] **5.2** — Configurar backup automático do PostgreSQL:
  ```bash
  # Cron job para backup diário
  0 3 * * * docker exec spfp_postgres pg_dump -U n8n n8n > /backups/n8n_$(date +\%Y\%m\%d).sql
  ```
- [ ] **5.3** — Configurar DigitalOcean Droplet Backups (automático, $4.80/mês)
- [ ] **5.4** — Criar workflow de healthcheck no N8N:
  - Cron diário → verificar se Evolution API está conectada → alertar se não
- [ ] **5.5** — Documentar todas as credenciais em cofre seguro (1Password ou Bitwarden)
- [ ] **5.6** — Testar restore de backup (simular disaster recovery)

---

## 6. MCPs Relevantes para Claude Code

MCPs que o @devops pode adicionar para acelerar o desenvolvimento das automações N8N.

### MCP 1: ClickUp MCP (Oficial)

**Propósito:** Criar tasks, lists, spaces, update statuses, comentar direto do Claude Code
sem abrir o browser.

**Uso no contexto SPFP:** OPS squad usa ClickUp como backbone. MCP permitiria que o
Automation Architect crie e gerencie tasks programaticamente durante o design de workflows.

```bash
# Adicionar via @devops *add-mcp
# MCP: clickup
# Repositório: https://github.com/clickup/mcp-server-clickup
```

**Configuração em `~/.claude.json`:**
```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": ["-y", "@clickup/mcp-server"],
      "env": {
        "CLICKUP_API_TOKEN": "SEU_TOKEN_CLICKUP"
      }
    }
  }
}
```

---

### MCP 2: N8N MCP (Community)

**Propósito:** Listar workflows, executar workflows, criar nodes, inspecionar execuções
direto do Claude Code.

**Uso no contexto SPFP:** Permite que o Automation Architect crie workflows N8N via
prompts, sem usar a interface gráfica. Acelera muito a construção dos primeiros 5 workflows.

```bash
# MCP: n8n
# Repositório: https://github.com/leonardsellem/n8n-mcp-server (community)
# Ou usar n8n REST API diretamente via HTTP Request
```

**Configuração:**
```json
{
  "mcpServers": {
    "n8n": {
      "command": "npx",
      "args": ["-y", "n8n-mcp-server"],
      "env": {
        "N8N_API_URL": "https://n8n.spfp.com.br/api/v1",
        "N8N_API_KEY": "SEU_N8N_API_KEY"
      }
    }
  }
}
```

**Nota:** Para gerar a N8N API Key: `n8n.spfp.com.br` → Settings → API → Create API Key

---

### MCP 3: Supabase MCP (Oficial)

**Propósito:** Query no banco de dados SPFP, inspecionar tabelas, rodar migrations
direto do Claude Code.

**Uso no contexto SPFP:** Workflows 4 (Churn Prevention) precisam consultar o Supabase.
MCP permite prototipar as queries antes de colocar no N8N.

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": {
        "SUPABASE_URL": "https://seu-projeto.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "SEU_SERVICE_ROLE_KEY"
      }
    }
  }
}
```

---

### MCP 4: Stripe MCP (Oficial)

**Propósito:** Listar pagamentos, criar produtos, inspecionar webhooks, testar eventos
diretamente do Claude Code.

**Uso no contexto SPFP:** Workflow 5 (Stripe → ERP). Permite testar a lógica de
reconciliação sem precisar abrir o Stripe Dashboard.

```json
{
  "mcpServers": {
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp-server-stripe"],
      "env": {
        "STRIPE_SECRET_KEY": "sk_test_..."
      }
    }
  }
}
```

---

### MCP 5: Google Drive MCP

**Propósito:** Criar pastas, mover arquivos, listar documentos direto do Claude Code.

**Uso no contexto SPFP:** Workflow 2 (Onboarding) cria pasta do cliente no Drive.
MCP permite testar e gerenciar a estrutura de pastas programaticamente.

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "npx",
      "args": ["-y", "@google/mcp-server-gdrive"],
      "env": {
        "GDRIVE_CREDENTIALS_PATH": "/path/to/credentials.json"
      }
    }
  }
}
```

---

### Ordem de adição dos MCPs (por prioridade)

```
PRIORIDADE 1 (adicionar antes de construir workflows):
├── Supabase MCP      — queries para Workflow 4
└── N8N MCP           — criação de workflows programaticamente

PRIORIDADE 2 (durante construção dos workflows):
├── ClickUp MCP       — gestão de tasks OPS
└── Stripe MCP        — testar Workflow 5

PRIORIDADE 3 (após workflows base funcionando):
└── Google Drive MCP  — automações de documentos
```

---

## Apêndice: Variáveis de Ambiente — Template

Arquivo `.env` para o `docker-compose.yml` (nunca commitar no git):

```bash
# PostgreSQL
POSTGRES_PASSWORD=senha_segura_aqui

# N8N
N8N_BASIC_AUTH_PASSWORD=senha_n8n_admin
N8N_ENCRYPTION_KEY=chave_32_chars_aleatoria_aqui
N8N_SMTP_PASS=senha_app_gmail

# Evolution API
EVOLUTION_API_KEY=apikey_segura_aqui

# Para gerar chave de 32 chars:
# node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## Apêndice: Estrutura de Pastas Google Drive Recomendada

```
/SPFP/
├── Clientes/
│   └── 2026/
│       └── [Nome-Cliente-YYYY-MM-DD]/
│           ├── Onboarding/
│           ├── Contratos/
│           └── Relatórios/
├── Marketing/
│   ├── Campanhas/
│   ├── Assets/
│   └── Relatórios/
├── Vendas/
│   ├── Propostas/
│   └── Contratos/
├── Financeiro/
│   ├── 2026/
│   │   ├── 01-Janeiro/
│   │   └── ...
│   └── Relatórios/
└── OPS/
    ├── Processos/
    └── Automações/
```

---

## Apêndice: Estrutura ClickUp Recomendada

```
Space: SPFP
├── Marketing/
│   ├── Campanhas Ativas
│   ├── Calendário de Conteúdo
│   └── Relatórios
├── Vendas/
│   ├── Pipeline SDR
│   ├── Pipeline Closer
│   └── Deals Fechados
├── CS/
│   ├── Onboarding Ativos
│   ├── Suporte Aberto
│   └── Retenção em Risco
├── Products/
│   ├── Backlog
│   ├── Em Desenvolvimento
│   └── Publicados
├── Admin/
│   ├── Financeiro
│   ├── RH/Contratações
│   └── Jurídico/Contratos
└── OPS/
    ├── Processos em Mapeamento
    ├── Processos em Build
    └── Processos Entregues
```

---

*Documento gerado por Gage (DevOps Agent — AIOS SPFP) em 2026-02-25*
*Versão: 1.0 — Plano Técnico Executável*
