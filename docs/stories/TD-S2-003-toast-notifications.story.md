# [TD-S2-003] Sistema global de toast notifications

> Epic: EPIC-TD-001 | Sprint 2 | Prioridade: ALTO
> Origem: TD-015 (frontend-spec.md — Secao 5)
> Owner: @dev

---

## Contexto

O SPFP nao possui um sistema centralizado de feedback ao usuario. Erros e confirmacoes sao tratados de forma inconsistente: inline em alguns componentes, via `console.error` ou completamente silenciosa em outros (especialmente no `FinanceContext.tsx`). Isso significa que operacoes criticas como "adicionar transacao", "salvar meta", "sync com Supabase" podem falhar sem o usuario saber.

**Evidencia tecnica (frontend-spec.md — Secao 5):**
> "Sem toast notifications globais; falhas silenciosas em FinanceContext."

Alem disso, o sistema de toast sera a base para a story TD-S3-005 (error recovery universal) no Sprint 3 — o canal de exibicao de erros deve existir antes de universalizar o error recovery.

---

## Objetivo

Instalar e integrar um sistema de toast notifications que forneca feedback visual consistente para acoes do usuario em toda a aplicacao — sucessos, erros e estados de loading.

---

## Criterios de Aceitacao

- [ ] AC1: Biblioteca de toast instalada (sonner ou react-hot-toast) e configurada em `src/main.tsx` ou `src/App.tsx` — Toaster/Sonner renderizado na raiz da arvore
- [ ] AC2: Toast de sucesso aparece ao adicionar uma transacao — mensagem: "Transacao adicionada com sucesso"
- [ ] AC3: Toast de sucesso aparece ao salvar uma meta — mensagem: "Meta salva com sucesso"
- [ ] AC4: Toast de erro aparece quando uma operacao de Supabase falha — mensagem em portugues, sem stack trace tecnico exposto ao usuario
- [ ] AC5: Toast de loading aparece durante operacoes longas (sync Supabase) e e substituido por sucesso ou erro ao completar
- [ ] AC6: Toast de sucesso aparece ao excluir uma transacao — mensagem: "Transacao excluida" com botao "Desfazer" (opcional, se viavel)
- [ ] AC7: Toasts tem estilos distintos para sucesso (verde/teal), erro (vermelho), aviso (amarelo) e loading (neutro) — alinhados ao design system SPFP
- [ ] AC8: Toasts fecham automaticamente apos 4 segundos (sucesso) ou 6 segundos (erro) e podem ser fechados manualmente
- [ ] AC9: Maximos 3 toasts visiveis simultaneamente — os mais antigos sao removidos ao atingir o limite
- [ ] AC10: Toasts funcionam em dark mode — backgrounds e textos visiveis no tema escuro da plataforma

---

## Tarefas Tecnicas

- [ ] Task 1: Instalar biblioteca — `npm install sonner` (recomendado por compatibilidade com React 19 e customizacao de tema) ou `npm install react-hot-toast`
- [ ] Task 2: Configurar `<Toaster />` em `src/App.tsx` ou `src/main.tsx` com theme="dark" e position="top-right"
- [ ] Task 3: Criar helper `src/utils/toast.ts` com funcoes wrappers (`showSuccess`, `showError`, `showLoading`, `dismissToast`) para centralizar customizacoes
- [ ] Task 4: Em `src/context/FinanceContext.tsx`, adicionar toasts nas operacoes criticas: adicionar/editar/excluir transacao, adicionar/editar meta, operacoes de sync Supabase que falham
- [ ] Task 5: Em `src/components/TransactionForm.tsx`, substituir alertas inline por toasts de sucesso/erro
- [ ] Task 6: Em `src/components/Goals.tsx`, adicionar toast ao criar/editar/excluir meta
- [ ] Task 7: Customizar estilos do toast para alinhar com a paleta SPFP (Navy dark background, Teal para sucesso, texto branco)
- [ ] Task 8: Testar cada ponto de toast: sucesso, erro forcado (desligar network), e loading durante operacao lenta

---

## Definicao de Pronto

- [ ] Biblioteca instalada e Toaster configurado na raiz da aplicacao
- [ ] Helper `toast.ts` criado e sendo usado (nao chamadas diretas espalhadas)
- [ ] Toasts implementados em pelo menos 10 pontos de acao do usuario
- [ ] Estilos alinhados ao dark mode e paleta SPFP — revisado visualmente
- [ ] Testado: sucesso ao adicionar transacao, erro ao falhar operacao, loading durante sync
- [ ] Nenhuma regressao nos componentes modificados

---

## Esforo Estimado

**S** (2-4 horas)
- Task 1-3 (instalacao + helper): ~1h
- Task 4-6 (integracao nos componentes): ~2h
- Task 7-8 (customizacao + testes): ~1h

---

## Dependencias

Nenhuma — esta story e independente e pode ser feita em paralelo com TD-S2-001 e TD-S2-002.

Esta story e pre-requisito para:
- TD-S3-005 (error recovery universal) — o sistema de toast deve existir antes

---

## Notas Tecnicas

- Sonner (https://sonner.emilkowal.ski/) e compativel com React 19 e tem melhor suporte a dark mode que react-hot-toast
- API: `toast.success('msg')`, `toast.error('msg')`, `toast.loading('msg')`, `toast.dismiss(id)`
- Para theme dark: `<Toaster theme="dark" richColors />` — `richColors` ativa cores semanticas automaticas
- Arquivo helper a criar: `src/utils/toast.ts`
- Buscar em `src/context/FinanceContext.tsx` por `console.error` e `catch` para identificar erros silenciosos
- Buscar em todos os componentes por `alert(` para substituir por toast
- Referencia: `docs/prd/technical-debt-DRAFT.md` — TD-015, `docs/architecture/technical-debt-assessment.md` — Secao 4 (TD-015)
