# EPIC-013: Rebranding Completo da Plataforma SPFP

**Status:** Ready for Development
**PM:** Morgan (📋)
**Data:** 2026-03-04
**Prioridade:** Alta — alinha produto com Brand Guidelines v1.1 aprovadas

---

## Objetivo

Implementar o rebranding completo da plataforma SPFP com base nas Brand Guidelines v1.1 e Brand Voice v1.1 aprovadas pelo Squad Branding. Substituir a identidade visual antiga (spirograph + LF + Inter + black) pela nova identidade (F/seta + SPFP + Plus Jakarta Sans + Navy/Teal).

---

## Contexto e Motivação

O Squad Branding SPFP (squads/spfp-branding/) definiu e aprovou:
- **Logo:** PNG sem fundo `public/branding/logo.png` — símbolo F/seta dupla, 15° como elemento de marca
- **App Icon:** PNG sem fundo `public/branding/app-icon.png`
- **Paleta:** Navy-900 (#0A1628), Navy-700 (#1B3A6B), Blue-Logo (#1B85E3), Teal-500 (#00C2A0)
- **Tipografia:** Plus Jakarta Sans (principal) + Sora (display)
- **Finn:** AI advisor com 2 modos — Advisor (azul) e Parceiro (teal)
- **Posicionamento:** Consultoria do Luis = herói premium / Finn = feature 24/7
- **Tagline:** "Consultoria especializada. Inteligência que nunca dorme."
- **Headline:** "A consultoria do Luis. A inteligência do Finn."

**Brand Guidelines:** `squads/spfp-branding/outputs/BRAND-GUIDELINES-v1.1.md`
**Brand Voice:** `squads/spfp-branding/outputs/BRAND-VOICE-v1.1.md`

---

## Gap Atual vs. Target

| Elemento | Estado Atual | Target (v1.1) |
|----------|-------------|---------------|
| Cor primária | `#000000` + `#3b82f6` | `#0A1628` + `#1B85E3` |
| Font | Inter | Plus Jakarta Sans |
| Logo | Spirograph SVG + "LF" | PNG sem fundo aprovado |
| Favicon | SVG inline com "LF" | F/seta PNG |
| Meta title | "SPFP - Consultor IA para suas Finanças 24/7" | "SPFP — Seu Planejador Financeiro Pessoal" |
| Headline Sales | "Sua liberdade financeira começa no controle" | "A consultoria do Luis. A inteligência do Finn." |
| Tagline Sales | "Inteligência Patrimonial Premium" | "Consultoria especializada. Inteligência que nunca dorme." |
| Finn Avatar | Ausente | Componente dual-mode (Advisor + Partner) |
| Onboarding | Não existe | 5 telas aprovadas com Finn |
| Brand Voice | Não aplicado | Tom de voz consistente em todo o app |

---

## Stories

### Story 13.1 — Design System: Paleta + Tipografia
**Agente:** @dev
**Pontos:** 3
**Arquivo:** `docs/stories/13.1.story.md`

Atualizar `tailwind.config.js` com a nova paleta de cores e importar Plus Jakarta Sans no `index.html` substituindo Inter. Atualizar variáveis CSS globais.

**Arquivos afetados:**
- `tailwind.config.js`
- `index.html` (Google Fonts import)
- `src/index.css` (variáveis CSS se existirem)

---

### Story 13.2 — Logo, Favicon e Meta Tags
**Agente:** @dev
**Pontos:** 2
**Arquivo:** `docs/stories/13.2.story.md`

Substituir o componente `Logo.tsx` (spirograph+LF) pelo novo logo PNG. Atualizar favicon inline no HTML. Atualizar meta title e description.

**Arquivos afetados:**
- `src/components/Logo.tsx`
- `index.html` (favicon SVG → link para PNG, meta tags)
- `public/favicon.ico` ou `public/favicon.png`

---

### Story 13.3 — Sales Page: Novo Posicionamento
**Agente:** @dev + @ux-design-expert
**Pontos:** 5
**Arquivo:** `docs/stories/13.3.story.md`

Atualizar `SalesPage.tsx` com o novo headline, tagline, copy de benefícios e call-to-action alinhados ao Brand Voice v1.1. Aplicar nova paleta visual.

**Copy aprovado:**
- Badge: "Planejamento Financeiro Pessoal"
- Headline: "A consultoria do Luis. A inteligência do Finn."
- Sub-headline: "Você merece mais do que um app. Você merece um especialista — com IA do seu lado."
- Tagline: "Consultoria especializada. Inteligência que nunca dorme."

**Arquivos afetados:**
- `src/components/SalesPage.tsx`

---

### Story 13.4 — Componente FinnAvatar
**Agente:** @dev
**Pontos:** 3
**Arquivo:** `docs/stories/13.4.story.md`

Criar componente reutilizável `FinnAvatar.tsx` com os dois modos (advisor/partner) usando os PNGs aprovados. Suportar tamanhos: sm (32px), md (40px), lg (80px), xl (120px).

**Assets disponíveis:**
- `public/branding/finn-advisor.png`
- `public/branding/finn-partner.png`

**Arquivos criados:**
- `src/components/FinnAvatar.tsx`

---

### Story 13.5 — Insights/IA: Finn com Identidade
**Agente:** @dev
**Pontos:** 5
**Arquivo:** `docs/stories/13.5.story.md`

Atualizar `Insights.tsx` para usar o nome "Finn", integrar o `FinnAvatar` (modo advisor por padrão, parceiro em celebrações), aplicar o brand voice nos textos da interface. Substituir ícone genérico "Bot" pelo avatar.

**Brand Voice a aplicar:**
- Nome: "Finn" (nunca "IA", "Bot", "Assistente")
- Mensagens seguem `BRAND-VOICE-v1.1.md` seção 2
- Placeholder: "Pergunte ao Finn sobre suas finanças..."

**Arquivos afetados:**
- `src/components/Insights.tsx`

---

### Story 13.6 — Onboarding: 5 Telas com Finn
**Agente:** @dev + @ux-design-expert
**Pontos:** 8
**Arquivo:** `docs/stories/13.6.story.md`

Criar componente de onboarding `Onboarding.tsx` com 5 telas aprovadas. Exibir para novos usuários no primeiro acesso (checar flag no perfil do usuário). Tela 3 apresenta o Finn com avatar Partner.

**Copy aprovado (BRAND-VOICE-v1.1.md seção 5):**
1. "Bem-vindo ao SPFP" — "Aqui sua vida financeira faz sentido, de verdade."
2. "Tudo sobre seu dinheiro, em um só lugar"
3. "Oi. Eu sou o Finn." — apresentação com FinnAvatar Partner
4. "O melhor dos dois mundos" — consultoria + IA
5. "Registre seu primeiro gasto" — primeira ação

**Arquivos criados/afetados:**
- `src/components/Onboarding.tsx`
- `src/context/FinanceContext.tsx` (flag `onboardingCompleted`)
- `src/App.tsx` (trigger do onboarding)

---

### Story 13.7 — MonthlyRecap e Touchpoints com Brand Voice
**Agente:** @dev
**Pontos:** 3
**Arquivo:** `docs/stories/13.7.story.md`

Atualizar `MonthlyRecap.tsx` com FinnAvatar (modo Partner para celebrações), brand voice e nova paleta. Revisar outros componentes que exibem mensagens do sistema para alinhar ao tom aprovado.

**Arquivos afetados:**
- `src/components/MonthlyRecap.tsx`
- Outros componentes com mensagens de celebração/alerta (a identificar)

---

### Story 13.8 — QA Visual: Auditoria Pós-Rebranding
**Agente:** @qa
**Pontos:** 5
**Arquivo:** `docs/stories/13.8.story.md`

Auditoria visual completa pós-rebranding: verificar consistência de cores, tipografia, logo, Finn, copy em todas as telas. Gerar relatório de conformidade com Brand Guidelines v1.1.

**Checklist:**
- [ ] Nenhuma referência ao logo antigo (spirograph/LF) visível
- [ ] Plus Jakarta Sans aplicada em todo o app
- [ ] Paleta Nova usada consistentemente (sem `#3b82f6` genérico fora do padrão)
- [ ] Finn nomeado corretamente em todas as telas
- [ ] Onboarding exibe corretamente para novo usuário
- [ ] Sales Page com copy novo
- [ ] WCAG AA mantido (contrastes)
- [ ] Dark mode compatível com nova paleta

---

## Critérios de Sucesso do EPIC

- [ ] Nenhum elemento da identidade antiga visível no app
- [ ] Logo PNG sem fundo exibido em header, onboarding e Sales Page
- [ ] Plus Jakarta Sans carregando corretamente
- [ ] Finn com avatar em Insights e Onboarding
- [ ] Sales Page com novo posicionamento (consultoria herói)
- [ ] Onboarding com 5 telas para novos usuários
- [ ] QA visual aprovado (13.8 Done)
- [ ] Deploy produção via @devops

---

## Sequência de Execução

```
13.1 Design System (base)
  ↓
13.2 Logo + Favicon (base)
  ↓ ↓
13.3 Sales Page    13.4 FinnAvatar (componente)
                        ↓
                   13.5 Insights
                   13.6 Onboarding
                   13.7 MonthlyRecap
  ↓
13.8 QA Visual
  ↓
Deploy @devops
```

**13.1 e 13.2 são fundação** — devem ser feitas primeiro.
**13.3, 13.4 são independentes entre si** após 13.1+13.2.
**13.5, 13.6, 13.7 dependem de 13.4** (FinnAvatar).
**13.8 depende de todas** — QA no final.

---

## Referências

- Brand Guidelines: `squads/spfp-branding/outputs/BRAND-GUIDELINES-v1.1.md`
- Brand Voice: `squads/spfp-branding/outputs/BRAND-VOICE-v1.1.md`
- Assets: `public/branding/` (logo.png, app-icon.png, finn-advisor.png, finn-partner.png)
- Página /branding: `src/components/Branding.tsx` (referência visual)

---

*EPIC-013 criado por Morgan (PM) · 2026-03-04*
