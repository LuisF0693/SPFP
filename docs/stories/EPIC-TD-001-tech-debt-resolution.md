# EPIC-TD-001: Resolucao de Debitos Tecnicos — SPFP Platform

> Brownfield Discovery — Fase 10 | @pm (Morgan) | 2026-03-05
> Baseado em: technical-debt-assessment.md (Fase 8 FINAL)

---

## Visao

O SPFP possui arquitetura funcional e pronta para producao, mas acumula 48 debitos tecnicos identificados no Brownfield Discovery que aumentam o risco de regressao, violacao de compliance e abandono de usuario a cada nova feature entregue. Resolver esses debitos de forma sistemica e estruturada protege os usuarios, o negocio e a velocidade de desenvolvimento das proximas sprints.

O impacto de negocio e direto:
- **Seguranca** — dados soft-deleted expostos via RLS incompleto coloca privacidade de usuarios em risco
- **Compliance** — ausencia de hard delete viola a LGPD (Lei 13.709/2018) e pode gerar multas e perda de confianca
- **Retencao** — duplicacao Goals/Retirement e ausencia de empty states causam abandono no D1 (primeiro dia de uso)
- **Velocidade futura** — FinanceContext monolitico e ausencia de testes travam cada nova feature com risco de regressao

---

## Objetivo

Elevar o score tecnico do SPFP de **35/70 (50%)** para **61/70 (87%)** ao final do Sprint 6, eliminando todos os debitos CRITICOS ate o Sprint 2 e construindo infraestrutura de qualidade que sustente crescimento seguro da plataforma.

---

## Escopo

### Incluido

- Resolucao dos 7 debitos CRITICOS (Sprint 1 e 2)
- Resolucao dos 10 debitos ALTOS priorizados (Sprint 2-4)
- Resolucao dos 12 debitos MEDIOS (Sprint 3-6)
- Resolucao dos debitos BAIXOS de menor esforco (Sprint 1-3)
- Criacao de infraestrutura de testes (unit + E2E)
- Refatoracao de FinanceContext e componentes grandes
- Conformidade LGPD (hard delete + data export)

### Fora do Escopo

- Novas features de produto (Finn RAG, novos modulos de investimento, etc.)
- Mudancas na identidade visual ou rebranding
- Integracao com novos provedores de pagamento
- Migracoes de dados de producao que nao sejam parte de fixes de debitos
- Particionamento de tabela transactions (aguardar 500K+ rows — TD-022)

---

## Stories (lista)

### Sprint 1 — Seguranca e Compliance (Semanas 1-2)

| Story ID | Titulo | Sprint | Prioridade |
|----------|--------|--------|-----------|
| TD-S1-001 | Fix RLS soft delete nas tabelas core | Sprint 1 | CRITICO |
| TD-S1-002 | Implementar hard_delete_user_data (LGPD) | Sprint 1 | CRITICO |
| TD-S1-003 | Fix soft delete em investments e patrimony | Sprint 1 | CRITICO |
| TD-S1-004 | Mover admin emails para variavel de ambiente | Sprint 1 | CRITICO |

### Sprint 2 — UX Critica e Acessibilidade (Semanas 3-4)

| Story ID | Titulo | Sprint | Prioridade |
|----------|--------|--------|-----------|
| TD-S2-001 | Deprecar Goals/Retirement v1 (escolher versao canonica) | Sprint 2 | CRITICO |
| TD-S2-002 | Implementar empty states pos-onboarding | Sprint 2 | ALTO |
| TD-S2-003 | Sistema global de toast notifications | Sprint 2 | ALTO |
| TD-S2-004 | Focus trap em modais (acessibilidade WCAG) | Sprint 2 | CRITICO |

### Sprint 3 — Testabilidade e Qualidade (Semanas 5-6)

| Story ID | Titulo | Sprint | Prioridade |
|----------|--------|--------|-----------|
| TD-S3-001 | Adicionar data-testid em componentes criticos | Sprint 3 | ALTO |
| TD-S3-002 | Split types.ts por dominio | Sprint 3 | MEDIO |
| TD-S3-003 | Refatorar Insights.tsx em sub-componentes | Sprint 3 | ALTO |
| TD-S3-004 | Refatorar Layout.tsx em 3 sistemas de navegacao | Sprint 3 | ALTO |
| TD-S3-005 | Error recovery universal (servicos faltantes) | Sprint 3 | MEDIO |

### Sprint 4 — Testes Unitarios e Arquitetura de AI (Semanas 7-8)

| Story ID | Titulo | Sprint | Prioridade |
|----------|--------|--------|-----------|
| TD-S4-001 | Split FinanceContext em sub-contexts por dominio | Sprint 4 | ALTO |
| TD-S4-002 | Testes unitarios FinanceContext (>= 80% cobertura) | Sprint 4 | ALTO |
| TD-S4-003 | Consolidar dual path de AI (Finn unico) | Sprint 4 | ALTO |

### Sprint 5 — Testes E2E e Observabilidade (Semanas 9-10)

| Story ID | Titulo | Sprint | Prioridade |
|----------|--------|--------|-----------|
| TD-S5-001 | Testes E2E Playwright (5+ cenarios criticos) | Sprint 5 | ALTO |
| TD-S5-002 | Real-time sync Supabase para transactions e goals | Sprint 5 | MEDIO |
| TD-S5-003 | Admin detection via Supabase (step 2) | Sprint 5 | ALTO |

### Sprint 6 — Performance e Backlog (Semanas 11-12)

| Story ID | Titulo | Sprint | Prioridade |
|----------|--------|--------|-----------|
| TD-S6-001 | Dashboard paginacao e virtual scroll | Sprint 6 | MEDIO |
| TD-S6-002 | Bundle size audit e otimizacao | Sprint 6 | BAIXO |
| TD-S6-003 | ImpersonationService refactor | Sprint 6 | ALTO |

---

## Criterios de Sucesso do Epic

O epic sera considerado bem-sucedido quando TODOS os criterios abaixo forem atingidos:

| Criterio | Meta |
|---------|------|
| Zero debitos CRITICOS abertos | 0 |
| Score consolidado dimensoes | >= 61/70 (87%) |
| Seguranca: RLS com filtro deleted_at | Todas as tabelas core |
| Compliance: hard delete LGPD ativo | Implementado e testado |
| UX: zero duplicacoes v1/v2 no sidebar | 0 |
| Testes: cobertura FinanceContext | >= 80% |
| Testes E2E rodando em CI | >= 5 cenarios passando |
| Nenhum componente > 400 LOC | 100% das paginas |
| Contraste WCAG AA validado | 100% das combinacoes |
| Bundle principal | < 500KB gzip |

---

## Dependencias

**Pre-requisitos antes de iniciar:**

1. Ambiente de staging configurado para testes de hard delete (nao fazer em producao sem validacao)
2. Decisao de produto sobre qual versao de Goals e Retirement e a canonica (v1 ou v2) — necessaria antes de TD-S2-001
3. Verificacao da cobertura de testes atual: `npm run test -- --coverage` para baseline real
4. Supabase CLI configurado localmente para aplicar migrations sem downtime

**Dependencias entre sprints:**

- Sprint 3 depende do Sprint 2 (toast system instalado antes de error recovery)
- Sprint 4 depende do Sprint 3 (data-testid e componentes refatorados antes dos testes E2E)
- Sprint 5 depende do Sprint 4 (FinanceContext refatorado antes dos testes unitarios completos)

---

## Riscos

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|-------------|---------|-----------|
| Migration RLS quebra queries em producao | Media | Alto | Testar em staging com copia do schema; rollback script pronto |
| Hard delete apaga dados em producao acidentalmente | Baixa | Critico | Funcao acessivel apenas via service_role; dupla confirmacao na UI |
| Decisao sobre Goals v1/v2 atrasa Sprint 2 | Alta | Medio | @po decide na planning do Sprint 2 com dados de uso (analytics) |
| Split FinanceContext introduz regressoes | Media | Alto | Feature flag para rollback; testes unitarios antes do split |
| Testes E2E flakey em CI | Media | Medio | Retry logic + screenshots em falha + ambiente dedicado de testes |
| Cobertura de testes atual ja e maior que zero | Alta | Baixo | Validar baseline antes de planejar Sprint 4 — ajustar metas se necessario |

---

## Referencias

- Assessment completo: `docs/architecture/technical-debt-assessment.md`
- Draft original: `docs/prd/technical-debt-DRAFT.md`
- DB Schema: `docs/architecture/SCHEMA.md`
- DB Audit: `docs/architecture/DB-AUDIT.md`
- Frontend Spec: `docs/architecture/frontend-spec.md`
- System Architecture: `docs/architecture/system-architecture.md`
