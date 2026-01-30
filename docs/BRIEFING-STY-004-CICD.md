# ⚙️ BRIEFING EXECUTIVO - STY-004: Setup GitHub Actions CI/CD Pipeline

**DESTINADO PARA:** DevOps Engineer
**PRIORIDADE:** 🔴 P0 CRÍTICA
**ESFORÇO:** 6 horas
**DATA:** 2026-01-30
**STATUS:** PRONTO PARA IMPLEMENTAÇÃO

---

## 📌 CONTEXTO

Atualmente, NÃO HÁ CI/CD. Qualquer dev pode fazer commit com:
- ❌ Código quebrado
- ❌ Testes falhando
- ❌ Tipos errados

**Objetivo:** Automático GitHub Actions que roda **TODA VEZ** que faz PR:
- ✅ ESLint (style check)
- ✅ TypeScript (type check)
- ✅ Tests (Vitest)
- ✅ Build (npm run build)
- ✅ BLOQUEIA merge se falhar

---

## ✅ O QUE FAZER (6 horas)

### **1. Criar Workflow YAML (2h)**

**Criar arquivo:** `.github/workflows/ci.yml`

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    name: Lint, Type Check, Test, Build

    steps:
      # 1. Checkout code
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # 2. Setup Node.js
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      # 3. Install dependencies
      - name: Install dependencies
        run: npm ci

      # 4. ESLint
      - name: Lint Code (ESLint)
        run: npm run lint
        continue-on-error: false

      # 5. TypeScript Type Check
      - name: Type Check (TypeScript)
        run: npx tsc --strict --noEmit
        continue-on-error: false

      # 6. Run Tests
      - name: Unit Tests (Vitest)
        run: npm run test:ci
        continue-on-error: false

      # 7. Build
      - name: Build Production
        run: npm run build
        continue-on-error: false

      # 8. Coverage Report (optional)
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: false

  # Security checks (optional, can add later)
  security:
    runs-on: ubuntu-latest
    name: Security Scan
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - name: Check for vulnerabilities
        run: npm audit --audit-level=moderate
        continue-on-error: true
```

**Resultado:** Quando alguém faz PR, todo o pipeline roda automaticamente.

---

### **2. Configure package.json Scripts (0.5h)**

**Arquivo:** `package.json`

**Verifique que tem estes scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx --fix",
    "test": "vitest",
    "test:ci": "vitest --run --coverage",
    "typecheck": "tsc --noEmit",
    "type-check": "tsc --strict --noEmit"
  }
}
```

**Se faltar algum:**
- Adicione o script
- Teste local: `npm run [script-name]`

---

### **3. Enable Branch Protection (1.5h)**

**No GitHub:**

1. Vá para: **Settings** → **Branches**
2. Clique em **Add rule**
3. **Branch name pattern:** `main`
4. Habilite:
   - [x] Require status checks to pass before merging
   - [x] Require branches to be up to date
   - [x] Require code reviews before merging (minimum: 2)
   - [x] Dismiss stale pull request approvals
   - [x] Require status checks:
     - Select: `test` job (required)
     - Select: `security` job (optional)

**Resultado:** PR NÃO pode fazer merge se CI falhar.

---

### **4. Test Workflow on Demo PR (1.5h)**

**Localmente:**

```bash
# Certifique que lint passa
npm run lint

# Certifique que typecheck passa
npm run type-check

# Certifique que testes passam
npm run test:ci

# Certifique que build funciona
npm run build

# Se tudo passou:
echo "✅ CI Pipeline está pronto"
```

**No GitHub:**

1. Crie branch: `git checkout -b test/ci-pipeline`
2. Faça pequeno commit: `git add . && git commit -m "test: verify ci pipeline"`
3. Faça push: `git push origin test/ci-pipeline`
4. Crie PR no GitHub
5. **Veja o workflow rodar** (Actions tab)
6. Verifique que todas as checks passam ✅
7. Feche/delete a PR depois do teste

---

### **5. Create CI/CD Runbook (0.5h)**

**Criar:** `docs/CI-CD-RUNBOOK.md`

```markdown
# CI/CD Pipeline Runbook

## Overview
GitHub Actions automatically runs on every PR to main/develop branches.

## Pipeline Stages
1. **Lint** (ESLint) - Code style checks
2. **Type Check** (TypeScript) - Type safety
3. **Tests** (Vitest) - Unit tests
4. **Build** (Vite) - Production build

## Workflow Status
- ✅ All green = PR is safe to merge
- 🔴 Any red = Must fix before merge

## Troubleshooting

### "Lint failed"
```bash
npm run lint  # Auto-fixes most issues
git add .
git commit -m "fix: lint errors"
git push
```

### "Type Check failed"
```bash
npm run type-check
# Fix types manually in reported files
```

### "Tests failed"
```bash
npm run test
# Debug failing tests locally
```

### "Build failed"
```bash
npm run build
# Check error message, usually missing dependency
```

## Manual Trigger
If you need to re-run:
1. Go to **Actions** tab on GitHub
2. Select the workflow
3. Click **Run workflow**

## Skipping CI (NOT RECOMMENDED)
```bash
git commit -m "feat: add feature [skip ci]"
# ⚠️ Use only for documentation changes
```
```

---

## 🎯 CHECKLIST

- [ ] Criar `.github/workflows/ci.yml`
- [ ] Verificar scripts em `package.json` (lint, test:ci, typecheck, build)
- [ ] Testar localmente: `npm run lint` (passa)
- [ ] Testar localmente: `npm run type-check` (passa)
- [ ] Testar localmente: `npm run test:ci` (passa)
- [ ] Testar localmente: `npm run build` (passa)
- [ ] Push para teste: criar branch test → PR → ver workflow rodar ✅
- [ ] Habilitar Branch Protection em Settings
- [ ] Criar `docs/CI-CD-RUNBOOK.md`
- [ ] Pronto! ✅

---

## 📊 EFFORT

| Tarefa | Tempo |
|--------|-------|
| Workflow YAML | 2h |
| Package.json scripts | 0.5h |
| Branch protection | 1.5h |
| Test on demo PR | 1.5h |
| Runbook docs | 0.5h |
| **TOTAL** | **6h** |

---

## 🚀 RESULTADO FINAL

Toda PR será automaticamente:
- ✅ Lintada
- ✅ Type-checked
- ✅ Testada
- ✅ Buildada
- 🔐 Bloqueada se falhar

---

**Criado por:** Dex (dev)
**Data:** 2026-01-30
**Status:** 🟢 READY FOR EXECUTION
