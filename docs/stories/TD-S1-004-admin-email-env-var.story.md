# [TD-S1-004] Mover admin emails para variavel de ambiente

> Epic: EPIC-TD-001 | Sprint 1 | Prioridade: CRITICO
> Origem: TD-004 (system-architecture.md — Secao 11 / DT-003)
> Owner: @dev

---

## Contexto

A lista de emails administrativos do SPFP esta hardcoded em `src/context/AuthContext.tsx`:

```typescript
const ADMIN_EMAILS = ['nando062218@gmail.com'];
```

Isso cria tres problemas:

1. **Seguranca:** O email de admin e exposto no bundle JavaScript publico, inspecionavel por qualquer usuario via Chrome DevTools > Sources
2. **Operacional:** Adicionar ou remover um admin requer alteracao de codigo e deploy completo do frontend
3. **Escalabilidade:** Impossivel ter multiplos admins em producao sem code change

Esta story implementa o Step 1 (rapido): mover para variavel de ambiente `VITE_ADMIN_EMAILS`. O Step 2 (correto, via tabela Supabase) sera feito em TD-S5-003 no Sprint 5.

**Referencia:** `src/context/AuthContext.tsx:17` — linha aproximada onde `ADMIN_EMAILS` e definido

---

## Objetivo

Remover o email de admin hardcoded do bundle JavaScript publico, movendo a lista para variavel de ambiente Vite que e carregada em build time — reduzindo a superficie de ataque e permitindo gerenciamento sem deploy.

---

## Criterios de Aceitacao

- [ ] AC1: A constante `ADMIN_EMAILS` em `src/context/AuthContext.tsx` NAO contem mais emails hardcoded — le de `import.meta.env.VITE_ADMIN_EMAILS`
- [ ] AC2: O arquivo `.env.example` possui a variavel `VITE_ADMIN_EMAILS=admin@example.com` documentada com comentario explicativo
- [ ] AC3: O arquivo `.env.local` possui `VITE_ADMIN_EMAILS=nando062218@gmail.com` (ou o email correto) e NAO esta commitado no git (verificar `.gitignore`)
- [ ] AC4: A funcionalidade de admin continua funcionando: o usuario com email configurado na variavel de ambiente tem acesso ao `/admin` e ao AdminCRM
- [ ] AC5: A variavel aceita multiplos emails separados por virgula (ex: `VITE_ADMIN_EMAILS=admin1@example.com,admin2@example.com`) e o parsing e correto
- [ ] AC6: O email de admin NAO aparece em `npm run build` seguido de busca no bundle gerado (`dist/`) — verificado com `grep -r "nando062218" dist/`

---

## Tarefas Tecnicas

- [ ] Task 1: Ler `src/context/AuthContext.tsx` completo para entender onde `ADMIN_EMAILS` e usado e como a verificacao de admin e feita
- [ ] Task 2: Substituir o array hardcoded por leitura da variavel de ambiente:
  ```typescript
  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((email: string) => email.trim())
    .filter(Boolean);
  ```
- [ ] Task 3: Adicionar `VITE_ADMIN_EMAILS` ao `.env.example` com comentario sobre o formato (multiplos emails por virgula)
- [ ] Task 4: Verificar que `.env.local` esta no `.gitignore` — se nao estiver, adicionar
- [ ] Task 5: Atualizar `.env.local` com o valor real de `VITE_ADMIN_EMAILS`
- [ ] Task 6: Testar localmente: rodar `npm run dev`, logar com email admin, verificar que `/admin` esta acessivel
- [ ] Task 7: Fazer build (`npm run build`) e verificar que o email nao aparece no bundle com `grep -r "nando062218" dist/`
- [ ] Task 8: Documentar no `CLAUDE.md` (secao Security Considerations) que admin emails agora sao configurados via env var

---

## Definicao de Pronto

- [ ] Codigo revisado
- [ ] Email de admin nao aparece no bundle JavaScript publico (verificado via grep no dist/)
- [ ] Funcionalidade de admin testada localmente com a variavel de ambiente configurada
- [ ] `.env.example` atualizado com a nova variavel documentada
- [ ] `.env.local` nao commitado no git
- [ ] Nenhuma regressao na autenticacao de usuarios comuns

---

## Esforo Estimado

**S** (1-3 horas)
- Task 1 (leitura AuthContext): ~30min
- Task 2-5 (implementacao + env files): ~1h
- Task 6-8 (testes + build verification): ~1h

---

## Dependencias

Nenhuma — esta story e completamente independente e pode ser feita em paralelo com TD-S1-001 e TD-S1-002.

---

## Notas Tecnicas

- Arquivo principal: `src/context/AuthContext.tsx` — buscar por `ADMIN_EMAILS`
- Vite expoe variaveis de ambiente com prefixo `VITE_` via `import.meta.env.VITE_*`
- Variaveis `VITE_*` SAO incluidas no bundle de producao — a diferenca e que saem do codigo-fonte e vao para o processo de build (Vercel, Railway) onde sao injetadas
- Para seguranca total (email nunca no bundle), o Step 2 (tabela Supabase + Edge Function) sera necessario em TD-S5-003 — esta story e o passo intermediario
- O `.env.local` provavelmente ja esta no `.gitignore` — verificar antes de adicionar duplicata
- Referencia: `docs/architecture/technical-debt-assessment.md` — Secao 3 (TD-004), `docs/prd/technical-debt-DRAFT.md` — TD-004
