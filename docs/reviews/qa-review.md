# QA Gate Review — SPFP Brownfield Discovery
> Fase 7 | @qa (Quinn) | 2026-03-05
> Revisao independente dos documentos produzidos nas Fases 1-6

---

## Sumario Executivo

| Artefato | Score | Status |
|----------|-------|--------|
| system-architecture.md (Fase 1) | 5/5 | Completo |
| SCHEMA.md (Fase 2) | 5/5 | Completo |
| DB-AUDIT.md (Fase 2) | 4/5 | Completo com ressalva |
| frontend-spec.md (Fase 3) | 5/5 | Completo |
| technical-debt-DRAFT.md (Fase 4) | 5/5 | Completo |
| db-specialist-review.md (Fase 5) | 3/5 | Parcialmente desatualizado |
| ux-specialist-review.md (Fase 6) | 4/5 | Solido com ressalvas de baseline |

**Score Total da Discovery: 41/50**
**Veredicto: APPROVED**

---

## 1. Checklist de Completude por Documento

### 1.1 system-architecture.md (Fase 1 — @architect)

- [x] Cobre todos os aspectos do escopo da fase? — Sim. Stack, estrutura, patterns, dados, flows, debitos, seguranca, performance, recomendacoes.
- [x] Claims tem evidencias no codigo/schema? — Sim. ADMIN_EMAILS hardcoded confirmado em `src/context/AuthContext.tsx:17`. FinanceContext 1079 LOC verificado diretamente. LocalStorage key `visao360_v2_data_${userId}` plausivel.
- [x] Estimativas de esforco sao realistas? — Sim. DT-001 (XL/40h+) e conservador mas razoavel; split de contexto de 1079 LOC e genuinamente complexo.
- [x] Solucoes propostas sao implementaveis? — Sim. Split de sub-contexts, ImpersonationService, consolidacao do dual AI path sao todos padroes de mercado estabelecidos.
- [x] Nao ha contradicoes entre documentos? — Sim, com uma excecao documentada na Secao 4.

**Score: 5/5**

---

### 1.2 SCHEMA.md (Fase 2 — @data-engineer)

- [x] Cobre todos os aspectos do escopo da fase? — Sim. 52+ tabelas, 8+ views, 12+ functions, ERD, timeline de migrations, seguranca, indexes.
- [x] Claims tem evidencias no codigo/schema? — Sim. 18 arquivos de migration confirmados por glob. Estrutura de tabelas coerente com migrations lidas. `sent_atas.client_id` sem FK confirmado no codigo.
- [x] Estimativas de esforco sao realistas? — N/A (documento descritivo, nao prescritivo de esforco).
- [x] Solucoes propostas sao implementaveis? — Sim. Scripts SQL prontos e idiomaticos.
- [x] Nao ha contradicoes entre documentos? — Sim, com uma excecao documentada na Secao 4.

**Score: 5/5**

---

### 1.3 DB-AUDIT.md (Fase 2 — @data-engineer)

- [x] Cobre todos os aspectos do escopo da fase? — Sim. RLS, performance, qualidade de dados, soft delete, views, migrations, compliance, issues com fixes e scripts prontos.
- [x] Claims tem evidencias no codigo/schema? — Majoritariamente sim. RLS em tabelas core verificado em migrations. Issue do `deleted_at IS NULL` ausente nas politicas SELECT confirmado em `002-add-soft-delete.sql`.
- [x] Estimativas de esforco sao realistas? — Sim. Issue #1 (FK sent_atas, 30min), Issue #2 (RLS deleted_at, 1h) sao estimativas corretas para migrations simples.
- [x] Solucoes propostas sao implementaveis? — Sim. Scripts SQL incluidos sao corretos.
- [ ] Nao ha contradicoes entre documentos? — Parcialmente. O claim "98% RLS" conflita com o estado descrito no db-specialist-review (Fase 5). Ver Secao 4.

**Score: 4/5**

---

### 1.4 frontend-spec.md (Fase 3 — @ux-design-expert)

- [x] Cobre todos os aspectos do escopo da fase? — Sim. Rotas (publicas, privadas, admin), design system, inventario de componentes, flows de usuario, estados de UX, a11y, performance, debitos categorizados por prioridade.
- [x] Claims tem evidencias no codigo/schema? — Sim. `/goals-v2` e `/retirement-v2` confirmados por grep em `App.tsx` e `Layout.tsx`. FinnAvatar.tsx e Onboarding.tsx listados existem de fato (criados no EPIC-013).
- [x] Estimativas de esforco sao realistas? — Sim. Score 31/50 e coerente com as evidencias de inconsistencias v1/v2, baixo score de acessibilidade (4/10), e error handling (4/10).
- [x] Solucoes propostas sao implementaveis? — Sim. Todas as P0 sao implementaveis em 1-4h cada.
- [x] Nao ha contradicoes entre documentos? — Sim.

**Score: 5/5**

---

### 1.5 technical-debt-DRAFT.md (Fase 4 — @architect)

- [x] Cobre todos os aspectos do escopo da fase? — Sim. Consolidacao excelente das tres fases, 35 debitos inventariados, roadmap de 6 sprints, mapa de dependencias explicitp, apendice de rastreabilidade.
- [x] Claims tem evidencias no codigo/schema? — Sim. Todos os debitos rastreiam ao documento fonte via apendice. Contagem de 35 debitos confirmada na tabela mestre (TD-001 a TD-035).
- [x] Estimativas de esforco sao realistas? — Majoritariamente sim. Sprint 4 (TD-008 FinanceContext split XL + TD-011 testes L simultaneamente) esta sobrecarregado — 56-90h em uma sprint. O restante e razoavel.
- [x] Solucoes propostas sao implementaveis? — Sim. Criterios de aceitacao claros e verificaveis para todos os 7 debitos CRITICOS.
- [x] Nao ha contradicoes entre documentos? — Sim, com uma excecao editorial documentada na Secao 4.

**Score: 5/5**

---

### 1.6 db-specialist-review.md (Fase 5 — Nova/Data Specialist)

- [ ] Cobre todos os aspectos do escopo da fase? — Parcialmente. O documento foi produzido em 2026-01-26 — 40 dias antes das Fases 1-4 — e referencia uma arquitetura ANTERIOR: tabela `user_data` JSON blob e `interaction_logs`. O SCHEMA.md (Marco 2026) documenta um banco normalizado de 52+ tabelas sem mencionar essas tabelas como ativas. O documento esta **desatualizado**.
- [ ] Claims tem evidencias no codigo/schema? — Parcialmente. Os claims sobre `user_data` sem RLS e `interaction_logs` sem politicas sao baseados no schema de Janeiro 2026. A migration `001-add-rls-policies.sql` adiciona RLS nessas tabelas, mas elas nao aparecem no schema normalizado atual.
- [x] Estimativas de esforco sao realistas? — Sim, para o escopo que o documento avalia.
- [x] Solucoes propostas sao implementaveis? — Sim, mas parte ja foi implementada nas migrations subsequentes.
- [ ] Nao ha contradicoes entre documentos? — Contradiz o DB-AUDIT.md em relacao ao estado atual do RLS (ver Secao 4).

**Score: 3/5** — Documento valido historicamente, mas desatualizado em relacao ao estado atual do banco. A Fase 5 deveria ter sido re-executada contra o schema de Marco 2026.

---

### 1.7 ux-specialist-review.md (Fase 6 — Luna/UX Specialist)

- [x] Cobre todos os aspectos do escopo da fase? — Sim. Acessibilidade, mobile, memoization, dark mode, charts, design tokens, modais, skeletons, com debitos adicionados nao previstos na PRD original.
- [ ] Claims tem evidencias no codigo/schema? — Parcialmente. O claim "30 componentes React e 8.816 linhas de codigo" e de 2026-01-26. Apos EPIC-013 (2026-03-04) foram adicionados FinnAvatar.tsx, Onboarding.tsx, Branding.tsx e outros. A contagem esta desatualizada, mas os problemas identificados continuam validos no estado atual.
- [x] Estimativas de esforco sao realistas? — Sim. Total de 48h para correcoes UX e razoavel para 1 dev + 1 designer.
- [x] Solucoes propostas sao implementaveis? — Sim. Exemplos de codigo prontos para uso direto.
- [x] Nao ha contradicoes entre documentos? — Nao ha contradicoes materiais com outros documentos.

**Score: 4/5** — Solido na substancia; baseline de codigo e de versao anterior.

---

## 2. Validacao de Claims

### 2.1 Claims Verificados

| Claim | Documento | Resultado |
|-------|-----------|-----------|
| "FinanceContext ~1000+ LOC" | system-architecture.md | VALIDADO — arquivo tem exatamente 1079 linhas |
| "ADMIN_EMAILS hardcoded em AuthContext" | system-architecture.md | VALIDADO — `AuthContext.tsx:17` confirmado |
| "18 migrations" | SCHEMA.md | VALIDADO — 18 arquivos `.sql` confirmados por glob |
| "Goals v1+v2 coexistem no sidebar" | frontend-spec.md | VALIDADO — `/goals-v2` e `/retirement-v2` em `App.tsx` e `Layout.tsx` |
| "35 debitos tecnicos identificados" | technical-debt-DRAFT.md | VALIDADO — contagem confirmada na tabela mestre TD-001 a TD-035 |
| "sent_atas.client_id sem FK" | SCHEMA.md | VALIDADO — ausencia de FK constraint confirmada no SCHEMA |
| "RLS deleted_at ausente nas politicas SELECT" | DB-AUDIT.md | VALIDADO — migration `002-add-soft-delete.sql:23` mostra que a correcao existe apenas na funcao de soft delete, nao nas politicas SELECT das tabelas core |
| "Dual path de IA (Finn vs aiService)" | system-architecture.md | NAO VERIFICAVEL neste review (sem acesso ao runtime), mas coerente com a arquitetura descrita |
| "Score DB 32/40 (80%)" | DB-AUDIT.md | NAO VERIFICAVEL diretamente, mas metodologia clara e pontuacao coerente com evidencias |

### 2.2 Claim Inconsistente — RLS Coverage (98%)

**Claim:** DB-AUDIT.md afirma "RLS em 98% das tabelas (50 de 52+) — EXCELENTE".

**Evidencia contradita:** A migration `001-add-rls-policies.sql` cria RLS apenas para `user_data` e `interaction_logs` — tabelas nao listadas no SCHEMA.md atual. Isso indica que existem tabelas no banco que foram criadas antes da normalizacao (Janeiro 2026) e que ainda podem existir no Supabase sem RLS adequado.

**Interpretacao provavel:** O DB-AUDIT.md (Marco 2026) auditou apenas as tabelas do schema normalizado atual, sem considerar tabelas legadas que podem ainda existir no Supabase. O claim de 98% e correto para o schema documentado, mas incompleto se tabelas legadas existirem com dados.

**Classificacao:** INCONSISTENTE — requer verificacao no Supabase dashboard.

---

## 3. Gaps Criticos — O que Faltou Documentar

### GAP-001 — Tabelas Legadas com Dados no Banco Ativo (Seguranca)
Nenhuma das Fases 1-4 documenta o estado das tabelas legadas (`user_data`, `interaction_logs`) que existem em migrations mas nao aparecem no SCHEMA.md. Se essas tabelas contem dados reais de usuarios com RLS desatualizado ou ausente, ha risco de exposicao. A Fase 5 identifica o problema, mas e de Janeiro 2026 e nao foi reconciliada com a Fase 2.

### GAP-002 — Cobertura de Testes Real (Quantificada)
O technical-debt-DRAFT afirma "cobertura de testes praticamente nula" e "Qualidade de Testes 2/10". O glob do repositorio revelou 45+ arquivos em `src/test/` incluindo `financeContextLogic.test.ts`, `softDelete.test.ts`, `errorRecovery.test.ts`, `integration/`, `a11y/`. O numero real de testes e a cobertura (%) nunca foram medidos e documentados. Pode haver divergencia entre o claim de "2/10" e a realidade.

### GAP-003 — Pipeline de CI/CD e Processo de Deploy
Nenhuma fase documenta: processo de deploy atual (Vercel? Railway? Manual?), presenca ou ausencia de CI/CD ativo, ambientes de staging, e processo de aplicacao de migrations em producao. Sprint 5 menciona CI/CD como trabalho futuro, mas sem baseline do estado atual.

### GAP-004 — Monitoramento em Producao
Sem documentacao de alertas ativos, logs centralizados, uptime monitoring. system-architecture.md menciona Sentry como "futuro" mas nao ha baseline do que existe hoje.

### GAP-005 — Volume de Dados em Producao
Nenhuma fase documenta: numero de usuarios ativos, volume de transacoes, tamanho das tabelas no Supabase. Relevante para priorizar TD-022 (particionamento) e avaliar urgencia de paginacao (TD-029).

### GAP-006 — Edge Functions Deployadas
system-architecture.md menciona `finn-chat`. SCHEMA.md menciona `grant_user_access`, `user_has_access`, `revoke_user_access` como RPCs. Nenhuma fase lista TODAS as Edge Functions/RPCs existentes com contratos de API, autenticacao, rate limits, e erros possiveis.

---

## 4. Contradicoes Identificadas

### CONTRADICAO-001 — Estado do RLS (Alta Severidade)
- **Fase 2 (DB-AUDIT.md, Marco 2026):** "RLS em 98% das tabelas — EXCELENTE"
- **Fase 5 (db-specialist-review.md, Janeiro 2026):** "`user_data` table: NENHUMA politica definida — Criticidade MAXIMA"

**Causa:** Documentos produzidos em momentos diferentes do projeto (40 dias de diferenca). O schema evoluiu significativamente entre Janeiro e Marco 2026.

**Resolucao necessaria:** Verificar no Supabase dashboard se `user_data` e `interaction_logs` existem com dados e qual o estado atual de suas politicas RLS. Incluir resultado no Fase 8.

**Severidade:** ALTA — afeta a avaliacao de seguranca.

---

### CONTRADICAO-002 — Cobertura de Testes (Media Severidade)
- **technical-debt-DRAFT.md (TD-011):** "A camada central de estado nao possui testes unitarios"
- **Evidencia de codigo:** `src/test/financeContextLogic.test.ts` existe no repositorio

**Causa:** O arquivo pode ser um test stub sem implementacao real, ou testa logica isolada sem cobrir o FinanceContext como React Context (via React Testing Library).

**Resolucao necessaria:** Executar `npm run test -- --coverage` e incluir resultado no Fase 8.

**Severidade:** MEDIA — afeta a precisao do inventario de debitos, nao as solucoes propostas.

---

### CONTRADICAO-003 — Score Consolidado (Baixa Severidade)
- **technical-debt-DRAFT.md, Executive Summary:** "Score Consolidado Estimado: 70/100"
- **technical-debt-DRAFT.md, Secao 9:** "Score Atual: 29/60 (48%)"

Dois metodos de pontuacao diferentes sem explicar a diferenca. Cria confusao sobre qual numero comunicar a stakeholders.

**Resolucao necessaria:** Escolher UMA metodologia no documento final.

**Severidade:** BAIXA — editorial.

---

## 5. Riscos Nao Endereçados pelos Documentos

### RISCO-001 — Tabelas Legadas com Dados (Seguranca — CRITICO POTENCIAL)
Se `user_data` e `interaction_logs` existem no Supabase com dados financeiros reais e RLS desatualizado (sem `AND deleted_at IS NULL` ou com politicas incorretas), ha risco de exposicao de dados de usuarios via Supabase SDK direto. Nenhuma das Fases 1-4 verificou este cenario.

**Por que nao endereçado:** Discrepancia temporal entre Fase 5 (Janeiro 2026) e Fases 1-4 (Marco 2026).

---

### RISCO-002 — Rate Limiting do Finn: Attack Surface (Seguranca — Medio)
O rate limit do Finn (10/15 msgs/mes) e implementado na Edge Function `finn-chat`. Nenhum documento analisa se e possivel bypassar a Edge Function chamando a API do Gemini diretamente (TD-010 menciona o dual path, mas nao o angulo de seguranca). Um usuario poderia usar a chave da API exposta no bundle (TD-010 + system-architecture.md Secao 11: "Gemini API key: Frontend") para contornar o rate limit.

**Por que nao endereçado:** Mencionado separadamente como "dual path" (manutenibilidade) e "chave exposta" (seguranca), mas a combinacao como vetor de ataque nao foi articulada.

---

### RISCO-003 — Audit Trail de Impersonacao Mutavel (Compliance — Medio)
logService.ts permite ao admin inserir logs de interacao, mas a politica RLS de `interaction_logs` (db-specialist-review Secao Fase 5) permite ao proprio admin deletar seus proprios logs. Um admin malicioso poderia acessar dados de um cliente e apagar o rastro. TD-009 aborda a complexidade de estado, mas nao o angulo de auditoria imutavel para compliance.

**Por que nao endereçado:** TD-009 foca em dessincronizacao de estado, nao em imutabilidade de audit trail.

---

### RISCO-004 — Sem Disaster Recovery Documentado (Operacional — Medio)
TD-025 menciona ausencia de rollback scripts para migrations. Mais critico: nao ha documentacao de processo de backup, RPO/RTO targets, ou procedimento de restauracao em caso de migration corrompida em producao. Se uma migration ruim for aplicada, o processo de recuperacao e desconhecido.

---

## 6. Qualidade do Roadmap (technical-debt-DRAFT.md)

### 6.1 Sequenciamento Logico

O mapa de dependencias (Secao 7 do DRAFT) e o ponto mais forte do documento. Analise sprint por sprint:

| Decisao de Sequenciamento | Avaliacao |
|--------------------------|-----------|
| TD-001/002/003 sao independentes (migrations isoladas) | CORRETO |
| TD-020 (types split) precede TD-008 (FinanceContext split) | CORRETO — tipos por dominio sao prerequisito para contextos por dominio |
| TD-015 (toast) precede TD-019 (error recovery universal) | CORRETO — toast e o canal de exibicao dos erros |
| TD-006+013+014 precedem TD-012 (E2E) | CORRETO — sem testids e com componentes grandes, testes E2E sao frageis |
| TD-024 (views DB) precede TD-029 (paginacao dashboard) | CORRETO — views fornecem as agregacoes necessarias |
| TD-008 (FinanceContext) precede TD-011 (testes) e TD-018 (real-time) | CORRETO |

**Conclusao: Sequenciamento logico APROVADO.**

### 6.2 Carga dos Sprints

| Sprint | Esforco Estimado | Avaliacao |
|--------|-----------------|-----------|
| Sprint 1 (Seguranca) | 8-12h | Realista para 1 semana |
| Sprint 2 (UX Critica) | 12-20h | Realista para 2 pessoas em 1 semana |
| Sprint 3 (Testabilidade) | 20-30h | Marginalmente sobrecarregado — 7 itens (M/S) |
| Sprint 4 (Testes Unitarios) | 30-50h | SOBRECARREGADO — TD-008 (XL) + TD-011 (L) = 56-90h em uma sprint |
| Sprint 5 (E2E + Observabilidade) | 25-40h | Razoavel com 2 owners |
| Sprint 6 (Performance) | 20-35h | Razoavel |

**Problema principal: Sprint 4.** Combinar TD-008 (FinanceContext split, XL/40h+) com TD-011 (testes, L/16-40h) na mesma sprint e irreal. FinanceContext tem 1079 LOC com sub-sistemas entrelaçados — o split sozinho merece uma sprint completa.

### 6.3 Criterios de Done

Todos os 7 debitos CRITICOS possuem criterios de aceitacao claros com checkboxes verificaveis. Este e o ponto mais forte do DRAFT — a rastreabilidade entre debito e criterio de conclusao e excelente.

### 6.4 Quick Wins

Sprint 1 concentra 4 fixes de esforco XS (TD-001, TD-003, TD-031, TD-035) junto a fixes S (TD-002, TD-004, TD-017). Quick wins reais que demonstram progresso imediato sem risco de regressao. APROVADO.

---

## 7. Score de Qualidade da Discovery

| Dimensao | Score | Observacao |
|----------|-------|-----------|
| Completude | 8/10 | Gaps de tabelas legadas, cobertura de testes real, CI/CD e Edge Functions nao documentados |
| Precisao | 7/10 | Claims principais validados; inconsistencia de RLS e contradicao de testes rebaixam |
| Rastreabilidade | 9/10 | Apendice de rastreabilidade no DRAFT e excelente; todas as fases identificam fonte dos claims |
| Acionabilidade | 9/10 | Scripts SQL prontos, Criterios de Aceitacao claros, roadmap com owners sugeridos, mapa de dependencias |
| Priorizacao | 8/10 | Sprint 4 sobrecarregado; restante do sequenciamento correto e bem justificado |
| **Score Total** | **41/50** | |

---

## 8. Veredicto Final

### APPROVED

A discovery pode prosseguir para Fase 8 (Technical Debt Assessment Final — @architect).

**Justificativa:**
- Score de qualidade: 41/50 (acima do limiar de 35/50)
- Nenhuma contradicao critica invalida as conclusoes principais
- Todos os 7 debitos CRITICOS identificados com solucao proposta e Criterios de Aceitacao
- Roadmap e viavel: 6 sprints para 35 debitos e razoavel, com Sprint 4 necessitando ajuste
- Quick wins de seguranca e compliance no Sprint 1 demonstram priorizacao correta

### Pontos Obrigatorios para a Fase 8

Os seguintes 5 itens devem ser endereçados pelo @architect no assessment final:

**1. Reconciliar tabelas legadas no Supabase**
Verificar no dashboard do Supabase se `user_data` e `interaction_logs` existem com dados. Se existirem, adicionar auditoria de RLS dessas tabelas ao inventario de debitos (potencialmente TD-036). Se foram descontinuadas, documentar isso explicitamente.

**2. Quantificar cobertura de testes real**
Executar `npm run test -- --coverage` e incluir o relatorio no assessment. O claim "cobertura praticamente nula" (2/10) precisa ser quantificado. Os 45+ arquivos de teste encontrados podem elevar esse score.

**3. Resolver o score duplicado**
Escolher UMA metodologia de pontuacao (70/100 subjetivo OU 29/60 calculado) e usar consistentemente. Eliminar a contradicao para clareza com stakeholders.

**4. Dividir Sprint 4 em duas sprints**
Sprint 4a: TD-008 (FinanceContext split) + TD-020 (types split)
Sprint 4b: TD-011 (testes unitarios FinanceContext) + TD-010 (dual AI consolidado)
Isso torna o roadmap mais realista e aumenta a probabilidade de execucao bem-sucedida.

**5. Documentar Edge Functions existentes**
Adicionar secao listando todas as Edge Functions deployadas com contratos de API, autenticacao, rate limits e pontos de falha conhecidos.

### Recomendacoes Nao Blocantes (para assessment mais robusto)

- Atualizar db-specialist-review.md com estado atual do schema (documento desatualizado cria confusao)
- Incluir baseline de CI/CD e deploy atual (estado zero antes do Sprint 1)
- Articular RISCO-002 (Gemini API key + dual AI = bypass de rate limit) como debito de seguranca explicito

---

## Apendice — Rastreabilidade do QA Review

| Finding | Evidencia Verificada |
|---------|---------------------|
| FinanceContext 1079 LOC | Leitura direta `src/context/FinanceContext.tsx` — ultima linha: 1079 |
| ADMIN_EMAILS hardcoded | Grep confirmado: `AuthContext.tsx:17` |
| 18 migrations | Glob `supabase/migrations/*.sql` — 18 arquivos |
| Goals v1+v2 coexistem | Grep `/goals-v2` em `App.tsx` e `Layout.tsx` — 2 arquivos encontrados |
| 45+ arquivos de teste | Glob `src/test/**` — 45 arquivos encontrados (vs. claim de "testes ausentes") |
| `deleted_at IS NULL` em RLS | `002-add-soft-delete.sql:23` — padrão correto existe mas apenas na funcao de recuperacao, nao nas politicas SELECT |
| RLS legacy `user_data` | `001-add-rls-policies.sql` — politicas apenas para `user_data` e `interaction_logs` (tabelas legadas) |
| db-specialist data Jan 2026 | Cabecalho: "Data: 2026-01-26" vs. Fases 1-4 de 2026-03-05 |
| SCHEMA.md nao menciona user_data | Leitura completa do SCHEMA.md — tabela ausente do schema normalizado |

---

> @qa (Quinn) — Brownfield Discovery Fase 7 | QA Gate
> Score da Discovery: 41/50 | Veredicto: APPROVED
> Proximo passo: @architect — Fase 8 (Technical Debt Assessment Final)
> Data: 2026-03-05
