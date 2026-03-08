# Sessão 2026-03-08 — Marketing CRM + Integrações

**Data:** 2026-03-08
**Agentes:** Orion (Orchestrator), Gage (DevOps)
**Status:** Concluída ✅

---

## O que foi feito

### 1. Seed completo de marketing no CRM (`commit 980ad44`)

Expandido o `CompanyContext.tsx` com **82 tasks** em **3 novos boards** no Squad Marketing:

#### Board: Calendário 90 Dias (51 tasks)
- 12 semanas de conteúdo completo
- Semana 1-4 (Março/Abril): Por que o dinheiro some, Planilha vs Sistema, Objetivos financeiros, Renda variável
- Semana 5-8 (Abril/Maio): Ansiedade financeira, Dívidas, Investimentos, Casais
- Semana 9-12 (Maio/Junho): Aposentadoria, Resultados 90 dias, Depoimentos, Lançamento
- Cada semana: 3 Reels (Seg/Qua/Sex) + 1 YouTube + LinkedIn repurpose + Stories recorrentes
- Fonte: `docs/marketing/CALENDARIO-EDITORIAL-90-DIAS.md`

#### Board: Email Marketing (13 tasks)
- Setup MailerLite: listas, tags de automação (CONSULTA_REALIZADA, CLIENTE_ATIVO)
- Sequência pós-consulta: 7 emails (D+1, D+3, D+5, D+7, D+10, D+14, D+30)
- Email boas-vindas (novo cliente pagante)
- Newsletter semanal
- QA e publicação da automação
- Fonte: `docs/marketing/SEQUENCIA-EMAIL-NURTURING.md`
- ⚠️ **PENDENTE:** Escrever os emails e configurar automação no MailerLite (ver seção abaixo)

#### Board: Meta Ads (18 tasks)
- Landing page completa (5 seções): HERO, Prova Social, O que acontece, Sobre o Luis, CTA + LGPD
- Pixel Facebook instalado no site
- 3 audiências: Custom (lista contatos), Lookalike 1-3%, Retargeting
- 3 criativos: Reel adaptado (A), Imagem estática (B), Carrossel "3 erros" (C)
- Campanha 1: R$30/dia com 3 ADSETs (Prospecting R$15, Lookalike R$10, Retargeting R$5)
- Regras de escala e fase de aprendizado (14 dias sem mexer)
- Fonte: `docs/marketing/CAMPANHA-META-ADS-ESTRUTURA.md`

#### Lógica de seed atualizada
- `seedDefaultBoards` agora é **idempotente** — adiciona apenas boards faltantes
- `loadBoards` sempre chama `seedDefaultBoards` (não só quando vazio)
- Garante que usuários com boards antigos recebem os novos automaticamente

---

### 2. Fix navegação Marketing Hub (`commit d95ec8b`)

**Problema:** Squad Marketing sempre abria o MarketingHub (gestão de conteúdo) ignorando os boards de tarefas.

**Solução:** Adicionado toggle de abas no `SquadView.tsx`:
- **📣 Marketing Hub** — gestão de conteúdo, biblioteca, calendário editorial (padrão)
- **📋 Boards & Tasks** — boards Kanban com todas as tasks do planejamento

**Arquivo alterado:** `src/components/company/SquadView.tsx`

---

### 3. Integração Cal.com → Make.com → MailerLite ✅

**Problema:** Calendly Free não suporta webhooks (requer plano Standard ~R$55/mês).

**Solução:** Migração para Cal.com (gratuito, suporta webhooks) + Make.com como middleware.

#### Stack da integração
```
Cal.com (agendamento)
  → Webhook BOOKING_CREATED
  → Make.com (Custom Webhook)
  → MailerLite (Create/Update Subscriber)
  → Lista "Leads Consulta Gratuita"
```

#### Configuração Cal.com
- Settings → Developer → Webhooks → New Webhook
- Subscriber URL: URL do Make.com
- Trigger: `BOOKING_CREATED`
- Status: **Ativo** ✅

#### Configuração Make.com
- Cenário: "Integration Webhooks, MailerLite"
- Módulo 1: Webhooks → Custom Webhook (escuta Cal.com)
- Módulo 2: MailerLite → Create/Update a Subscriber
  - Email: `payload → attendees → email`
  - Name: `payload → attendees → name`
  - Groups: `Leads Consulta Gratuita`
- Schedule: **Immediately** (roda 24/7 na nuvem) ✅

#### Resultado
Toda consulta agendada no Cal.com → lead entra automaticamente no MailerLite.

---

## Tarefas Pendentes

### ⚠️ P1 — Escrever e configurar sequência de 7 emails no MailerLite
**Prioridade:** Alta — necessário para nurturing pós-consulta
**Estimativa:** 2-3 horas

Emails a escrever e configurar no MailerLite:
1. Email 1 (D+1): Resumo personalizado da consulta
2. Email 2 (D+3): Case real "Rafael" — R$890/mês em assinaturas
3. Email 3 (D+5): Finn vs apps gratuitos
4. Email 4 (D+7): ROI — R$99 vs R$300-600 descobertos
5. Email 5 (D+10): Vagas abertas (urgência real)
6. Email 6 (D+14): Último contato — saída limpa
7. Email 7 (D+30): Reengajamento com novidade real

**Trigger:** tag `CONSULTA_REALIZADA` adicionada manualmente pelo Luis após cada consulta

**Referência completa:** `docs/marketing/SEQUENCIA-EMAIL-NURTURING.md`

**Como configurar no MailerLite:**
1. Automations → Create automation
2. Trigger: "Subscriber is assigned a tag" → `CONSULTA_REALIZADA`
3. Adicionar cada email com o delay correto
4. Publicar automação

### ⚠️ P2 — Regenerar token do Calendly
Token foi compartilhado em sessão — risco de segurança.
- Calendly → Settings → Integrations → API → deletar token atual → gerar novo
- (Calendly não está mais em uso após migração para Cal.com — opcional)

### ⚠️ P3 — Atualizar link da bio do Instagram
- Trocar link do Calendly para o novo link do **Cal.com**
- Atualizar todos os CTAs nos Reels futuros

### P4 — Email boas-vindas (novo cliente pagante)
- Configurar automação com trigger `CLIENTE_ATIVO`
- Email B1 imediato após pagamento confirmado
- Referência: `docs/marketing/SEQUENCIA-EMAIL-NURTURING.md`

### P5 — Newsletter semanal
- Configurar envio toda segunda-feira no MailerLite
- Estrutura: 1 insight + 1 pergunta reflexiva + 1 CTA leve

---

## Commits desta sessão

| Commit | Descrição |
|--------|-----------|
| `980ad44` | feat: seed completo de marketing no CRM — 82 tasks em 3 novos boards |
| `d95ec8b` | feat: toggle Hub/Boards no squad Marketing |

---

## Arquitetura de Marketing Atual

```
Instagram pessoal Luis (canal principal)
  ↓ agendamento
Cal.com (gratuito)
  ↓ webhook BOOKING_CREATED
Make.com (free — 1.000 ops/mês)
  ↓ Create/Update Subscriber
MailerLite (free até 1.000 contatos)
  ↓ tag CONSULTA_REALIZADA (manual — Luis)
  ↓ sequência 7 emails automática (⚠️ PENDENTE configurar)
```

---

**Próxima sessão recomendada:** Configurar sequência de 7 emails no MailerLite (P1).
