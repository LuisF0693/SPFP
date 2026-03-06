# UX Specialist Review — Technical Debt DRAFT
> Brownfield Discovery — Fase 6 | @ux-design-expert (Uma) | 2026-03-05
> Documento revisado: `docs/prd/technical-debt-DRAFT.md` (Fase 4, @architect)
> Referencia: `docs/frontend/frontend-spec.md` (Fase 3, @ux-design-expert)
> Substitui revisao anterior (2026-01-26 / Luna) — contexto pre-rebranding EPIC-013

---

## 1. Validacao dos Debitos de UX/Frontend no DRAFT

### TD-005 — Duplicacao ativa Goals v1+v2 / Retirement v1+v2

**Status: EXPANDIDO**

A descricao do DRAFT esta correta mas subestima o impacto de UX. Alem da confusao de navegacao, ha um problema de estado: usuarios que criaram metas em Goals v1 podem nao encontrar seus dados ao migrar para Goals v2 se os dois componentes nao compartilharem a mesma fonte de dados no FinanceContext. A duplicacao tambem gera degradacao silenciosa: quando features evoluem somente em v2, usuarios em v1 ficam com funcionalidade inferior sem saber.

O DRAFT menciona apenas "confusao de UX" mas omite o risco de perda de dados percebida e a degradacao silenciosa de funcionalidade.

A estimativa M (4-16h) esta correta apenas se a decisao de produto for tomada antes da implementacao. Sem decisao clara de qual versao e canonica, o esforco real sobe para L (16-40h) — refatoracao de estado, validacao de que dados de usuarios existentes sao preservados, testes de regressao nos dois fluxos.

**Adicao ao criterio de aceitacao:** Antes de iniciar implementacao, documentar qual versao e canonica e validar com o PO que todos os dados de usuarios existentes serao preservados na transicao. Rota antiga deve redirecionar com `history.replace`, nao `history.push`, para nao criar entrada fantasma no historico de navegacao.

---

### TD-006 — Ausencia de data-testid (impossibilita testes UI)

**Status: CONFIRMADO com ressalva de classificacao**

A descricao tecnica esta correta. No entanto, a classificacao como CRITICO e discutivel sob criterios de UX puro: `data-testid` e um debito de qualidade de engenharia, nao um debito que afeta o usuario final hoje. O impacto de UX e indireto — sem testabilidade, regressoes passam despercebidas e chegam ao usuario. A classificacao correta seria ALTO (nao CRITICO) sob a otica de UX.

Recomendacao: manter como CRITICO pela perspectiva de manutenibilidade/engenharia, mas documentar que o impacto no usuario e indireto e de longo prazo, nao imediato.

---

### TD-007 — Sem focus trap em modais (acessibilidade critica)

**Status: CONFIRMADO e EXPANDIDO**

A descricao esta correta. O DRAFT menciona "Onboarding, TransactionForm fullscreen" — o TransactionForm opera como fullscreen modal sem `<Layout>`, o que significa que o usuario pode Tab para elementos do DOM subjacente que estao visualmente bloqueados, criando uma experiencia de teclado completamente quebrada.

Impacto expandido que nao consta no DRAFT:
- Usuarios com motor impairment que dependem de teclado ficam presos ou perdem o contexto do modal
- Leitores de tela (NVDA, VoiceOver) continuam lendo o conteudo de fundo, criando confusao cognitiva grave
- A ausencia de `aria-modal="true"` no elemento de modal agrava o problema para tecnologias assistivas

A estimativa S (1-4h) esta correta apenas se uma biblioteca como `focus-trap-react` for usada. Implementacao manual com ARIA correto pode chegar a M (4-16h).

**Adicao ao criterio de aceitacao:** Adicionar `aria-modal="true"` e `role="dialog"` nos modais, alem do focus trap. Testar especificamente com NVDA no Windows (plataforma do dev principal conforme historico do projeto).

---

### TD-013 — Insights.tsx muito grande (~675 LOC)

**Status: CONFIRMADO com contexto adicional**

A descricao esta correta. O frontend-spec.md confirma: "Muitos useState (10+)" em Insights.tsx. O impacto de UX e duplo: (1) manutenibilidade ruim = bugs de UI que chegam ao usuario sem deteccao previa; (2) o componente mistura logica de negocio (rate limit, historico) com renderizacao, tornando impossivel testar cenarios de UX isolados como "o que o usuario ve quando o Finn esta indisponivel" ou "qual e a UX quando o rate limit e atingido".

O split proposto no DRAFT (FinnChat, FinnDiagnosis, FinnRateLimit, FinnQuickChips) esta alinhado com a estrutura de UX real do componente. Aprovado como proposta.

---

### TD-014 — Layout.tsx muito grande (~467 LOC)

**Status: CONFIRMADO com impacto de UX subestimado**

O DRAFT trata como debito de manutenibilidade, mas ha impacto direto de UX: o Layout.tsx sem `memo()` (confirmado no frontend-spec.md — "Componente sem memo()") causa re-renders desnecessarios em toda a arvore de navegacao a cada mudanca de estado global. Usuarios percebem isso como micro-lags na navegacao entre paginas — especialmente noticel em dispositivos mid-range Android.

O split proposto (DesktopSidebar, MobileBottomNav, AdminSidebar) esta correto.

**Adicao ao criterio de aceitacao:** Cada componente resultante deve usar `React.memo()` onde aplicavel. Medir re-renders com React DevTools Profiler antes e depois da refatoracao.

---

### TD-015 — Sem sistema de toast notifications global

**Status: CONFIRMADO e EXPANDIDO**

O impacto de UX esta subestimado no DRAFT. A ausencia de toast system significa que falhas criticas sao silenciosas — o frontend-spec.md confirma "falhas silenciosas em FinanceContext". Quando o Supabase falha ao salvar uma transacao, o usuario nao recebe feedback e pode assumir que o dado foi salvo, criando um problema de integridade percebida.

Casos concretos de impacto real:
- Adicionar transacao com falha de rede: usuario cria duplicata ao tentar novamente
- Salvar meta com timeout: usuario perde dado sem saber
- Sync Supabase falha silenciosamente: estado local diverge do banco sem aviso visual

A proposta de `react-hot-toast` ou `sonner` esta correta. `sonner` e preferivel por compatibilidade com Tailwind dark mode e design system SPFP existente (Navy-900 #0A1628).

**Adicao ao criterio de aceitacao:** Toast de loading para operacoes assincronas com duracao > 500ms. Toast de sucesso com confirmacao visual. Toast de erro com acao de retry quando aplicavel. Toasts de sucesso devem ter duracao curta (2-3s); erros devem persistir ate dismiss manual.

---

### TD-016 — Contraste WCAG nao validado (#6AA9F4 em fundo escuro)

**Status: CORRIGIDO — escopo incompleto no DRAFT**

O DRAFT menciona apenas `#6AA9F4` sobre fundo dark. A analise do design system no frontend-spec.md revela que varios outros pares de cores precisam de validacao:

| Par de Cores | Uso | Risco Estimado |
|-------------|-----|----------------|
| `#6AA9F4` (Blue-SPFP) sobre `#0A1628` (Navy-900) | Texto auxiliar sobre fundo principal | ALTO — ratio estimado ~3.8:1, abaixo do 4.5:1 exigido WCAG AA |
| `#92a4c9` (text-secondary-dark) sobre `#1A2233` (surface-dark) | Textos secundarios em cards | ALTO — cinza claro em superficie escura |
| `#00C2A0` (Teal-500/Finn) sobre `#0A1628` | Indicadores Finn e metas sobre fundo principal | MEDIO — teal pode ser adequado mas nao validado |
| `#1B85E3` (Blue-Logo) sobre `#0A1628` | Links e acoes primarias | MEDIO |
| `#2e374a` (border-dark) como texto sobre `#1A2233` | Bordas e separadores | BAIXO — elemento nao-textual |

A auditoria deve cobrir TODOS os pares, nao apenas o `#6AA9F4`. A estimativa S (1-4h) para auditoria esta correta, mas a correcao dos tokens que falharem pode exigir ate M (4-16h) considerando impacto no design system e necessidade de validacao pos-correcao.

**Adicao ao criterio de aceitacao:** Relatorio de auditoria deve documentar ratio medido de cada par (nao apenas pass/fail). Tokens corrigidos devem ser atualizados no `tailwind.config.js` para garantir consistencia futura.

---

### TD-026 — Mobile: Recharts overflow em telas pequenas

**Status: CONFIRMADO com impacto expandido**

O DRAFT menciona apenas o risco de overflow. O mobile bottom navigation tem 8 items (frontend-spec.md), o que ja cria uma experiencia densa em telas pequenas. Charts que fazem overflow sobre isso criam um layout quebrado que impede o usuario de ver dados financeiros criticos no dispositivo mais comum de acesso no Brasil.

Viewports criticos para testar: 320px (iPhone SE — ainda amplamente usado no Brasil), 375px (iPhone 13 mini/padrao), 390px (iPhone 14).

O Dashboard usa `DashboardChart` e `DashboardMetrics` como sub-componentes — ambos precisam de `ResponsiveContainer` com `minHeight` adequado e comportamento de fallback para viewports estreitos.

---

### TD-027 — useEffect cleanup ausente — risco de memory leaks

**Status: CONFIRMADO**

O frontend-spec.md confirma a vulnerabilidade especificamente em `Insights.tsx`. Em termos de UX, memory leaks acumulados ao longo de uma sessao longa causam degradacao de performance perceptivel: o chat do Finn fica lento, animacoes falham, o app fica irresponsivo. Os usuarios power — que mais usam o Finn em sessoes longas — sao exatamente os mais afetados.

---

### TD-032 — Animacoes sem prefers-reduced-motion

**Status: CONFIRMADO com severidade subestimada**

O DRAFT classifica como BAIXO. Da perspectiva de UX/a11y, este deveria ser MEDIO: usuarios com vestibular disorders e epilepsia fotossensivel podem ter sintomas fisicos com as animacoes existentes (pulse-slow 4s infinite, glow 2s infinite, breathing). O `prefers-reduced-motion` e um media query de 1-2 linhas por animacao — o esforco e XS mas o impacto de nao implementar e potencialmente severo para um subconjunto de usuarios.

**Recomendacao formal:** Elevar de BAIXO para MEDIO no inventario de debitos.

---

### TD-033 — Skeleton colors nao alinhados ao tema

**Status: CONFIRMADO**

Loading states visualmente inconsistentes com o design system criam flashes visuais na transicao de loading para conteudo carregado. Em um produto financeiro premium como o SPFP, esses detalhes sao relevantes para a percepcao de confiabilidade — especialmente considerando o rebranding EPIC-013 que elevou o nivel visual do produto.

---

## 2. Debitos de UX/Frontend Nao Capturados no DRAFT

Os itens abaixo constam explicitamente no documento fonte `frontend-spec.md` (Secao 8, lista P0) mas foram omitidos do DRAFT. Tres dos cinco debitos P0 de UX identificados na Fase 3 nao foram capturados.

### TD-036 — TransactionForm sem Layout wrapper (UX inconsistente)

**Severidade: CRITICO | Esforco: M (4-16h) | Origem: frontend-spec.md Sec.8 P0**

O DRAFT nao capturou este debito apesar de constar como P0 no documento fonte.

**Problema:** TransactionForm opera como fullscreen modal na rota `/transactions/add` sem o wrapper `<Layout>`. O usuario perde o sidebar de navegacao, header, e contexto de posicao no app. Para cancelar, precisa usar o botao voltar do navegador — sem nav consistente. Em mobile, perde o bottom navigation completamente.

**Impacto no fluxo:** Adicionar uma transacao e a acao mais frequente do usuario no app. Um fluxo de UX inconsistente aqui afeta a sessao mais repetida do produto. A inconsistencia e especialmente confusa porque todas as outras rotas tem o Layout normalmente.

**Proposta:** Integrar TransactionForm ao Layout com slideover panel lateral (desktop) ou bottom sheet (mobile), mantendo contexto de navegacao. Evitar reutilizar o padrao de fullscreen modal que demonstrou os problemas acima.

---

### TD-037 — Ausencia de error boundaries granulares em paginas criticas

**Severidade: ALTO | Esforco: S (1-4h) | Origem: frontend-spec.md Sec.8 P0**

**Problema:** Existe um `ErrorBoundary` global, mas sem boundaries por pagina. Se o componente `Insights.tsx` lancar um erro nao tratado (ex: falha de API Gemini), o boundary global derruba toda a aplicacao — o usuario perde acesso ao Dashboard, Transacoes, e todos os dados da sessao.

Com boundaries granulares, o erro ficaria isolado em Insights e o usuario poderia navegar para outras partes do app normalmente.

**Impacto:** Erros no Finn dependem de API externa (Gemini) com variabilidade alta. A combinacao de alta probabilidade de erro com alto impacto (derruba todo o app) e critica.

**Proposta:** `<ErrorBoundary>` individual envolvendo Insights, Goals, AdminCRM, Budget, e Patrimony. Fallback com mensagem amigavel ("O Finn esta descansando, tente novamente em breve") e link para Dashboard.

---

### TD-038 — Dashboard, TransactionList e Patrimony sem empty states visuais

**Severidade: ALTO | Esforco: S (1-4h) | Origem: frontend-spec.md Sec.5**

**Problema:** Novos usuarios que completam o onboarding chegam ao Dashboard e veem um layout vazio sem orientacao. Nao ha indicacao do que fazer primeiro, nenhum CTA, nenhuma explicacao. A mesma ausencia existe em TransactionList (lista vazia sem texto) e Patrimony.

**Impacto no onboarding:** O onboarding com Finn (5 telas — bem implementado no EPIC-013) termina e entrega o usuario em um Dashboard vazio sem next steps claros. Isso quebra o first value moment do produto: o usuario completou o onboarding mas nao sabe como comecar a usar o app.

**Proposta:** Empty states com `<FinnAvatar mode="partner" />`, texto orientador contextual, e CTA primario em Dashboard ("Adicione sua primeira transacao"), TransactionList ("Sem transacoes — adicionar agora"), Goals ("Crie sua primeira meta"), e Patrimony ("Registre seus ativos").

---

### TD-039 — TransactionForm e Patrimony sem loading states em submit

**Severidade: MEDIO | Esforco: S (1-4h) | Origem: frontend-spec.md Sec.5**

**Problema:** Quando o usuario salva uma transacao ou ativo de patrimonio e ha latencia de rede, o botao de submit nao da feedback visual de loading. O usuario pode clicar multiplas vezes, criando registros duplicados no banco.

**Proposta:** Estado de loading no botao de submit (`disabled + spinner`) durante operacoes assincronas em TransactionForm e Patrimony. Previne duplicatas e comunica progresso ao usuario.

---

### TD-040 — Input fields sem aria-describedby (associacao com mensagens de erro)

**Severidade: MEDIO | Esforco: S (1-4h) | Origem: frontend-spec.md Sec.6**

**Problema:** Quando um campo de formulario tem erro de validacao, a mensagem de erro nao esta programaticamente associada ao campo via `aria-describedby`. Leitores de tela nao anunciam o erro quando o usuario foca o campo — o usuario de leitor de tela precisa navegar pelo formulario inteiro para descobrir onde estao os erros.

**Proposta:** Adicionar `aria-describedby="campo-error-id"` e `aria-invalid="true"` nos inputs com erro em TransactionForm, Login, e Settings. Garantir que a mensagem de erro tenha o ID correspondente.

---

### TD-041 — Goals, Insights e Budget com cobertura ARIA insuficiente

**Severidade: MEDIO | Esforco: M (4-16h) | Origem: frontend-spec.md Sec.6**

**Problema:** As paginas mais ricas em interacoes do app (Goals, Insights/Finn chat, Budget) tem ARIA insuficiente. Botoes de progresso de metas, mensagens de chat do Finn, graficos de orcamento — nenhum desses elementos tem descricoes ARIA adequadas que permitam uso por leitores de tela.

**Proposta:** Auditoria ARIA especifica para Goals, Insights, e Budget. Prioridade: elementos interativos (botoes, inputs, controles de chart), depois elementos informativos (mensagens Finn, alertas de orcamento, indicadores de progresso de metas).

---

### TD-042 — Recharts sem custom tooltips acessiveis

**Severidade: MEDIO | Esforco: M (4-16h) | Origem: frontend-spec.md Sec.8 P2**

**Problema:** Os tooltips padrao do Recharts nao sao acessiveis por teclado e nao tem ARIA adequado. Usuarios que nao usam mouse nao conseguem acessar os dados dos graficos financeiros (Dashboard, Budget, Reports). Em um app de financas, os dados dos graficos sao informacao critica — nao decorativa.

**Proposta:** Custom `<CustomTooltip>` component com `role="tooltip"` e `aria-label`. Implementar navegacao por teclado nos pontos de dados dos graficos (Tab entre pontos do LineChart/BarChart/AreaChart).

---

### TD-043 — SalesPage sem micro-copy de confianca e social proof

**Severidade: MEDIO | Esforco: M (4-16h)**

**Problema nao capturado em nenhum documento anterior:** A SalesPage e o primeiro ponto de contato do usuario potencial. Ausencias identificadas na analise:
- Sem social proof (numero de usuarios, depoimentos, casos reais)
- Sem micro-copy de confianca proxima ao CTA primario ("Seus dados protegidos — LGPD compliant", "Cancele quando quiser")
- Rota `/transforme` listada no frontend-spec.md com "propósito unclear" — possivelmente landing alternativa sem manutencao ativa, pode estar entregando experiencia degradada a usuarios que chegam por esse caminho

**Proposta:** Auditoria de conversao da SalesPage com foco em: (1) clareza do value proposition baseado nas taglines aprovadas do EPIC-013, (2) social proof autentico, (3) reducao de ansiedade no CTA. Investigar proposta da rota `/transforme` e deprecar se nao tiver funcao ativa.

---

## 3. Impact Map de UX

Para os debitos criticos e altos, mapeamento do impacto real nos fluxos de usuario:

### TD-005 — Duplicacao Goals v1+v2

| Dimensao | Avaliacao |
|---------|----------|
| Fluxo afetado | Planejamento de metas e aposentadoria — nucleo do produto |
| Usuarios impactados | 100% dos usuarios autenticados (sidebar sempre visivel) |
| Frequencia do problema | A cada sessao — sidebar com items duplicados sempre presente |
| Severidade | Alta — usuario nao sabe qual versao usar; dados percebidos como inconsistentes |
| Risco de churn | Medio — confusao nao impede uso, mas degrada confianca no produto |

### TD-007 — Sem focus trap em modais

| Dimensao | Avaliacao |
|---------|----------|
| Fluxo afetado | Onboarding (novos usuarios) e adicao de transacoes (fluxo mais frequente) |
| Usuarios impactados | ~2-5% de usuarios que usam teclado ou tecnologias assistivas; risco legal ilimitado |
| Frequencia | A cada uso de modal — critico no onboarding (primeira experiencia do usuario) |
| Severidade | Critica para usuarios de teclado — modal inutilizavel |
| Risco de churn | Alto para publico com necessidades de acessibilidade |

### TD-015 — Sem toast notifications

| Dimensao | Avaliacao |
|---------|----------|
| Fluxo afetado | Qualquer operacao de escrita: transacao, meta, sync Supabase |
| Usuarios impactados | 100% dos usuarios ativos (todas as operacoes de dado) |
| Frequencia | Multiplas vezes por sessao |
| Severidade | Alta quando ha falha — usuario nao sabe se dado foi salvo; pode criar duplicatas |
| Risco de churn | Alto — dados perdidos ou duplicados destroem confianca em produto financeiro |

### TD-036 — TransactionForm sem Layout (novo)

| Dimensao | Avaliacao |
|---------|----------|
| Fluxo afetado | Adicionar transacao — acao mais frequente do produto |
| Usuarios impactados | 100% dos usuarios ativos |
| Frequencia | Multiplas vezes por sessao para usuarios ativos |
| Severidade | Media — funcionalidade preservada, mas contexto de navegacao perdido |
| Risco de churn | Baixo-medio — irritante recorrente, especialmente em mobile |

### TD-038 — Ausencia de empty states (novo)

| Dimensao | Avaliacao |
|---------|----------|
| Fluxo afetado | First value moment — primeiro acesso pos-onboarding |
| Usuarios impactados | 100% dos novos usuarios |
| Frequencia | Uma vez por usuario (momento critico de primeiro uso) |
| Severidade | Alta — usuario perdido logo apos onboarding = abandono imediato |
| Risco de churn | Alto — usuarios que nao entendem o que fazer no D1 raramente retornam |

### TD-016 — Contraste WCAG nao validado

| Dimensao | Avaliacao |
|---------|----------|
| Fluxo afetado | Todo o app — design system global |
| Usuarios impactados | ~8% populacao com deficiencia visual; todos em ambientes de baixa luminosidade |
| Frequencia | Constante — todo elemento com cor afetada |
| Severidade | Varia de media (leitura dificultada) a critica (ilegibilidade total) |
| Risco de churn | Medio — nao impede uso para maioria, mas degrada experiencia continuamente |

---

## 4. Quick Wins de UX

Debitos resolviveis em menos de 2h com impacto imediato no usuario:

| ID | O que mudar | Onde | Como |
|----|------------|------|------|
| TD-033 | Alinhar skeleton colors ao tema dark SPFP | `src/components/ui/Skeleton.tsx` | Substituir cores hardcoded por `bg-navy-700/50` e `bg-navy-600/30` |
| TD-032 | Adicionar prefers-reduced-motion | `tailwind.config.js` + componentes com animacoes | Envolver animacoes `pulse-slow`, `glow`, `breathing` com `@media (prefers-reduced-motion: reduce)` |
| TD-039 | Loading state no botao de submit | `TransactionForm.tsx` — botao principal | `disabled={isSubmitting}` + `<Loader2 className="animate-spin" />` |
| TD-037 | Error boundary em Insights | `App.tsx` — rota `/insights` | `<ErrorBoundary fallback={<FinnUnavailable />}>` ao redor da rota |
| TD-038 (parcial) | Empty state no Dashboard | `Dashboard.tsx` — condicional sem transacoes | `<FinnAvatar mode="partner" />` + CTA quando `transactions.length === 0` |
| TD-016 (auditoria) | Testar contraste dos 4 pares principais | Browser + axe DevTools | Executar axe no Dashboard, anotar ratios — 30min de auditoria, zero codigo |

---

## 5. UX Debt vs Feature Debt

Separacao clara dos tipos de debito — frequentemente confundidos no DRAFT:

### REGRESSIONS — Debitos que degradam UX existente (deveria funcionar, esta quebrado)

| ID | Debito | Tipo de Regressao |
|----|--------|-----------------|
| TD-007 | Sem focus trap em modais | Navegacao por teclado quebrada — deveria funcionar WCAG AA |
| TD-015 | Sem toast notifications | Feedback de operacoes ausente — usuario opera sem confirmacao |
| TD-016 | Contraste nao validado | Legibilidade comprometida — design system com defeito de acessibilidade |
| TD-032 | Sem prefers-reduced-motion | Sistema de acessibilidade ignorado — pode causar desconforto fisico |
| TD-036 | TransactionForm sem Layout | Fluxo mais frequente com UX inconsistente com o restante do app |
| TD-039 | Sem loading state em forms | Prevencao de duplicatas ausente — usuario cria registros multiplos sem querer |
| TD-040 | Inputs sem aria-describedby | Associacao de erros quebrada para leitores de tela |

### NEW CAPABILITIES — Features ausentes (nao eram promessa, sao oportunidades)

| ID | Debito | Feature Ausente |
|----|--------|----------------|
| TD-017 | Sem data export (LGPD) | Exportacao de dados — nova feature regulatoria |
| TD-018 | Sem real-time sync | Atualizacao em tempo real — nova feature de produto |
| TD-021 | Sem full-text search | Busca textual em transacoes — nova feature de usabilidade |
| TD-028 | Strings sem i18n | Internacionalizacao — nova feature futura |
| TD-038 | Sem empty states | Orientacao pos-onboarding — nova feature de UX de ativacao |
| TD-042 | Recharts sem tooltips acessiveis | Navegacao de graficos por teclado — nova feature de a11y |
| TD-043 | SalesPage sem social proof | Elementos de conversao — nova feature de growth |

**Nota importante para o roadmap:** O Sprint 2 do DRAFT mistura regressions (TD-007, TD-016) com new capabilities (TD-005). Regressions tem precedencia sobre new capabilities com mesma severidade — corrigir o que esta quebrado antes de adicionar o que falta.

---

## 6. Priorizacao de UX por Business Impact

Reordenando debitos de UX por impacto no negocio (nao apenas severidade tecnica):

### Tier 1 — Churn Risk (debitos que fazem usuarios desistirem)

| ID | Debito | Por que e Churn Risk |
|----|--------|--------------------|
| TD-015 | Sem toast / falhas silenciosas | Dados "perdidos" destroem confianca em produto financeiro — churn imediato |
| TD-038 | Sem empty states no Dashboard | Novos usuarios nao entendem o que fazer — abandono no primeiro dia (D1) |
| TD-005 | Duplicacao Goals/Retirement v1+v2 | Confusao sobre qual dado e "real" — usuarios questionam integridade do app |
| TD-036 | TransactionForm sem Layout | Fluxo mais frequente com UX inconsistente — irritante cronica em mobile |

### Tier 2 — Conversion Risk (debitos que afetam trial-to-paid)

| ID | Debito | Por que e Conversion Risk |
|----|--------|--------------------------|
| TD-037 | Sem error boundaries granulares | App que "quebra" durante trial -> nao assina |
| TD-007 | Sem focus trap em modais | Onboarding com UX quebrada de teclado -> trial negativo |
| TD-043 | SalesPage sem social proof | Landing page nao convence -> nao inicia trial |
| TD-016 | Contraste nao validado | App visualmente ilegivel para ~8% dos usuarios -> nao percebe valor |

### Tier 3 — Retention Risk (debitos que afetam uso recorrente)

| ID | Debito | Por que e Retention Risk |
|----|--------|-------------------------|
| TD-026 | Mobile Recharts overflow | Usuarios mobile nao conseguem ver dados -> param de usar em mobile |
| TD-042 | Recharts sem tooltips acessiveis | Dados de graficos inacessiveis por teclado -> decisao financeira prejudicada |
| TD-039 | Forms sem loading states | Duplicatas de dados -> frustracao recorrente com limpeza manual |
| TD-032 | Sem prefers-reduced-motion | Desconforto fisico para usuarios sensiveis -> abandono silencioso |
| TD-027 | Memory leaks (useEffect) | Degradacao de performance em sessoes longas -> power users afetados |
| TD-033 | Skeleton colors errados | Micro-degradacao de percepcao de qualidade -> erosao de confianca premium |

---

## 7. Recomendacao Final

### Aprovacao dos debitos de UX no DRAFT

**APROVADO COM RESSALVAS**

Os debitos de UX capturados no DRAFT sao validos e as propostas de solucao estao geralmente corretas. As ressalvas que exigem correcao antes do QA Gate:

1. **5 debitos de UX nao capturados (TD-036 a TD-040)** — Omitidos apesar de constarem explicitamente no documento fonte `frontend-spec.md` Secao 8. O DRAFT perdeu 3 dos 5 P0 de UX listados na Fase 3. Estes precisam ser adicionados ao inventario e ao roadmap.

2. **TD-032 com severidade subestimada** — Classificado como BAIXO mas deveria ser MEDIO dado o impacto de saude para usuarios com vestibular disorders.

3. **TD-016 com escopo incompleto** — Auditoria de contraste deve cobrir todos os pares de cor do design system SPFP, nao apenas o `#6AA9F4`.

4. **Estimativa de TD-005 pode estar subestimada** — Sem decisao de produto documentada, o esforco real pode ser L (16-40h), nao M (4-16h).

5. **TD-015 no roadmap do DRAFT esta correto (Sprint 2)** — Mas deve ser posicionado como pre-requisito para TD-037 e TD-039, nao apenas para TD-019 conforme diagrama de dependencias atual.

### Debito mais urgente de UX na visao da especialista

**TD-038 — Ausencia de empty states no Dashboard e TransactionList**

Justificativa: Este debito afeta 100% dos novos usuarios no momento mais critico do produto — o primeiro acesso pos-onboarding. O SPFP tem um onboarding cuidadoso com Finn (5 telas implementadas no EPIC-013) mas o "post-onboarding state" — o momento logo apos o onboarding terminar — esta completamente sem design. E como ter uma porta de entrada cuidadosa que leva a uma sala vazia sem sinaleiras.

A janela de maior risco de churn e os primeiros 5 minutos: usuarios que nao entendem o que fazer logo apos o onboarding raramente retornam. O custo de correcao e baixo (S, 1-4h) e o impacto e imediato e mensuravel via taxa de retencao no D1.

**Co-urgente:** TD-015 (toast notifications) — falhas silenciosas em produto financeiro destroem confianca de forma irreversivel. Um usuario que "perdeu" uma transacao e vai para um concorrente.

### Comentarios para o @architect

1. **TD-008 (FinanceContext split) e pre-requisito para empty states granulares:** Os empty states ideais verificam estado por dominio (`accounts.length === 0`, `transactions.length === 0`). O split de contextos facilita isso. Recomendo implementar empty states simples agora (verificando o estado atual do FinanceContext) e refinar com estados granulares pos-split — nao bloquear o TD-038 esperando o TD-008.

2. **TD-013 (Insights split) deve ser acompanhado de design specs:** O split proposto (FinnChat, FinnDiagnosis, FinnRateLimit, FinnQuickChips) abre a oportunidade de projetar estados de loading e error especificos por sub-fluxo. Recomendo que a implementacao inclua design specs para cada estado (loading, error, empty, rate-limited) — nao apenas refatoracao estrutural.

3. **TD-010 (Dual AI path) tem impacto de UX indireto:** Se o rate limiting so funciona no caminho do Finn Edge Function, usuarios que caem no caminho do SDK direto (aiService.ts) podem nao receber o overlay "Finn bloqueado" corretamente. Isso cria inconsistencia de UX onde o mesmo usuario pode ver experiencias diferentes dependendo do caminho de codigo executado.

4. **Mobile-first para TD-036:** A integracao do TransactionForm ao Layout deve priorizar mobile. Sugiro bottom sheet (slide-up panel) para mobile e slideover lateral para desktop — ambos mantendo contexto de navegacao. O padrao de fullscreen modal que existe hoje ja demonstrou problemas (falta de contexto de nav, focus trap ausente) — nao reutilizar.

5. **Rota `/transforme` precisa de decisao:** O frontend-spec.md marca esta rota como "propósito unclear". Se for uma landing page alternativa sem manutencao, pode estar entregando experiencia degradada a usuarios que chegam por esse caminho. Recomendar investigacao e decisao de deprecacao se nao tiver funcao ativa documentada.

---

> Produzido por @ux-design-expert (Uma) — Brownfield Discovery Fase 6
> Debitos do DRAFT revisados: 35 | Debitos validados: 13 de UX/Frontend | Debitos novos identificados: 8 (TD-036 a TD-043)
> Veredicto: APROVADO COM RESSALVAS
> Ressalvas: 5 debitos ausentes no inventario + 2 severidades incorretas + 1 escopo incompleto
> Proximo passo: @qa (Aria) — QA Gate Fase 7
