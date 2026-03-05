# HANDOFF — 2026-03-04
## EPIC-013: Rebranding Completo + Finn Centralizado

**Sessão:** 2026-03-04
**Status:** ✅ Tudo entregue e em produção
**Commits:** `301e9aa` (EPIC-013) → `3182a12` (Finn proxy) → `3c54654` (limites)

---

## O que foi feito

### 1. EPIC-013 — Rebranding da Plataforma (8 stories)

Implementação completa do rebranding baseado no Brand Guidelines v1.1 aprovado pelo Squad Branding.

#### Story 13.1 — Design System
**Arquivo:** `tailwind.config.js`
- Paleta SPFP adicionada: `navy-900` (#0A1628), `navy-700` (#1B3A6B), `blue-logo` (#1B85E3), `teal-500` (#00C2A0), `blue-spfp` (#6AA9F4)
- Fontes: `Plus Jakarta Sans` como fonte principal, `Sora` como display
- Fonte anterior (Inter puro) substituída

#### Story 13.2 — Logo + Favicon + Meta Tags
**Arquivos:** `src/components/Logo.tsx`, `index.html`
- `Logo.tsx`: substituiu SVG inline por `<img>` apontando para `/branding/logo.png` (ícone) e `/branding/app-icon.png` (símbolo)
- `index.html`: meta description, OG tags, Twitter Card e favicon atualizados. `theme-color: #0A1628`. Google Fonts com Plus Jakarta Sans + Sora + Inter

#### Story 13.3 — SalesPage
**Arquivo:** `src/components/SalesPage.tsx`
- Headline: **"A consultoria do Luis. A inteligência do Finn."**
- Sub-headline: "Você merece mais do que um app. Você merece um especialista — com IA do seu lado."
- Tagline: "Consultoria especializada. Inteligência que nunca dorme."
- Benefícios atualizados: Consultoria com especialista / Finn monitora 24h / Tudo em um só lugar
- CTAs: "Quero começar" + "Ver como funciona"

#### Story 13.4 — FinnAvatar
**Arquivo:** `src/components/FinnAvatar.tsx` *(novo)*

Componente reutilizável para representar o Finn em qualquer tela.

```tsx
<FinnAvatar
  mode="advisor"   // 'advisor' (azul) | 'partner' (teal)
  size="md"        // 'sm' | 'md' | 'lg' | 'xl'
  showLabel={true} // mostra "Finn · Advisor" ou "Finn · Parceiro"
  className=""
/>
```

Assets: `/public/branding/finn-advisor.png` + `/public/branding/finn-partner.png`

#### Story 13.5 — Insights (Finn Identity)
**Arquivo:** `src/components/Insights.tsx`
- Header: FinnAvatar substituiu ícone ShieldCheck
- Title: "Agente SPFP Premium" → **"Finn"**
- Bubbles de chat: ícone `<Bot>` → `<FinnAvatar mode="advisor" size="sm" />`
- Timestamp: "Agente SPFP" → **"Finn"**
- Loading: "Finn está analisando..." com dots azuis (#1B85E3)
- Placeholder: "Pergunte ao Finn sobre suas finanças..."
- Empty state: FinnAvatar xl + "Oi. Eu sou o Finn."
- System prompt: identidade atualizada para "Finn" (não mais "Agente SPFP Premium")

#### Story 13.6 — Onboarding
**Arquivo:** `src/components/Onboarding.tsx` *(novo)*

5 telas de boas-vindas com Finn para novos usuários.

**Telas:**
1. "Olá! Eu sou o Finn." — Finn partner mode
2. "Tudo em um só lugar." — Finn advisor mode
3. "A consultoria do Luis." — posiciona a consultoria como produto principal
4. "A inteligência do Finn." — explica o Finn como feature
5. "Pronto para começar?" — CTA para adicionar primeira conta

**Trigger no App.tsx:**
- Aparece para usuários autenticados sem transações que ainda não viram
- Flag salva em `localStorage`: `spfp_onboarding_seen_{userId}`
- Botão "X" para pular

#### Story 13.7 — Brand Voice nos Touchpoints
**Arquivos:** `src/components/MonthlyRecap.tsx`, `src/components/Goals.tsx`, `src/components/Layout.tsx`

- **MonthlyRecap:** FinnAvatar partner no slide de boas-vindas e no slide final
- **Goals:** Finn celebra quando metas são atingidas (`FinnAvatar mode="partner"`)
- **Layout:** Item de navegação renomeado de "Insights Financeiros 💡" → "Finn · Insights 🤖"

#### Story 13.8 — QA Visual
- Build de produção: **0 erros TypeScript**, warnings de chunk size são pré-existentes
- Import `Bot` removido do Insights.tsx (não mais utilizado)

---

### 2. Finn Centralizado — API do Luis (sem API key para clientes)

**Problema resolvido:** Clientes precisavam configurar API key própria (UX ruim). Agora o Finn usa a chave do Luis, guardada no servidor.

#### Arquitetura

```
Cliente (React) ──JWT──▶ Supabase Edge Function (finn-chat)
                                  │
                    ┌─────────────┼──────────────┐
                    ▼             ▼              ▼
              Valida JWT    Verifica plano   Registra uso
              (auth.users)  (stripe_subs)   (finn_usage)
                                  │
                                  ▼
                          Gemini API 1.5 Flash
                          (GEMINI_API_KEY secret)
```

#### Arquivos criados/modificados

**`supabase/functions/finn-chat/index.ts`** *(novo)*
- Edge Function Deno que roda no servidor Supabase
- GEMINI_API_KEY guardada via `supabase secrets set` (nunca exposta ao cliente)
- Autenticação JWT obrigatória
- Rate limiting por plano (veja tabela abaixo)
- Resiliente: funciona sem a tabela `finn_usage` (sem rate limit)

**`supabase/migrations/20260304_finn_usage.sql`** *(novo)*
- Tabela `finn_usage` com RLS
- Aplicado manualmente no Supabase Dashboard SQL Editor

**`src/services/aiService.ts`**
- Função `callFinnProxy(messages)` adicionada
- Usa JWT do usuário via `supabase.auth.getSession()`
- Propaga erros `isRateLimit` e `isNoPlan` para UI

**`src/components/Insights.tsx`**
- `hasToken` → sempre `true` (Finn sempre disponível via plataforma)
- Usa `callFinnProxy()` quando usuário não tem chave própria
- Usuários com chave própria em Settings continuam usando a sua
- Contador de uso no header: `3/10 msgs` com barra de progresso
- Overlay de limite atingido com mensagem clara
- Overlay de "sem plano" com CTA para assinar

**`src/supabase.ts`**
- Exporta `SUPABASE_URL` para reutilização no aiService

#### Rate Limits

| Plano | Limite/mês | Comportamento ao atingir |
|-------|-----------|--------------------------|
| Essencial (R$99) | **10 msgs** | Overlay com CTA para upgrade Wealth Mentor |
| Wealth Mentor (R$349) | **15 msgs** | Overlay informando renovação no próximo mês |
| Sem plano ativo | **Bloqueado** | Overlay "Finn é exclusivo para assinantes" |

#### Configuração em produção

```bash
# Segredo configurado (não exposto em nenhum arquivo commitado)
supabase secrets set GEMINI_API_KEY=AIzaSy...

# Edge Function deployada em
https://supabase.com/dashboard/project/jqmlloimcgsfjhhbenzk/functions
```

#### Custo estimado

Com 100 clientes ativos usando os limites máximos:
- 100 × 15 msgs = 1.500 conversas/mês
- ~2.000 tokens cada = ~3M tokens/mês
- Gemini 1.5 Flash: **~R$ 1-3/mês total**

---

## Assets de Brand (referência)

| Asset | Caminho | Uso |
|-------|---------|-----|
| Logo completo | `/public/branding/logo.png` | `<Logo variant="full" />` |
| App Icon | `/public/branding/app-icon.png` | `<Logo variant="icon" />` + favicon |
| Finn Advisor | `/public/branding/finn-advisor.png` | `<FinnAvatar mode="advisor" />` |
| Finn Partner | `/public/branding/finn-partner.png` | `<FinnAvatar mode="partner" />` |

---

## Próximas sessões sugeridas

- [ ] **Monitorar uso do Finn** — acompanhar `finn_usage` no dashboard e ajustar limites conforme necessário
- [ ] **Aumentar limite Wealth Mentor** — após validar custo real com base no uso
- [ ] **RAG / Base de conhecimento** — alimentar o Finn com livros e metodologia SPFP (Supabase pgvector)
- [ ] **Notificação de limite** — email automático quando usuário atinge 80% do limite

---

## Commits desta sessão

| Hash | Descrição |
|------|-----------|
| `301e9aa` | feat: EPIC-013 — Rebranding completo da plataforma SPFP |
| `3182a12` | feat: Finn centralizado — proxy Supabase Edge Function com rate limiting |
| `3c54654` | feat: ajustar limites do Finn — Essencial 10, Wealth 15, sem trial |
