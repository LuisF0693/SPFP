# Manual Validation Guide - STY-016 E2E Tests

## 🎯 Objetivo

Validar manualmente que os **29 testes E2E** estão bem estruturados testando os cenários críticos da aplicação SPFP.

**Tempo estimado:** 15-20 minutos para 3 cenários

---

## 🚀 Setup Inicial

### Passo 1: Abrir Dois Terminais

**Terminal 1 - Dev Server:**
```bash
cd "D:\Projetos Antigravity\SPFP\SPFP"
npm run dev
```

Espere até ver:
```
  ➜  Local:   http://localhost:3000/
```

**Terminal 2 - Seus Comandos:**
```bash
cd "D:\Projetos Antigravity\SPFP\SPFP"
# Deixe aberto para rodar comandos
```

### Passo 2: Abrir App no Navegador

- Vá para: **http://localhost:3000/**
- Você deve ver a página de login ou home

---

## ✅ Validação Manual - 3 Cenários Críticos

### **CENÁRIO 1: Signup + First Transaction** (5 minutos)

**Corresponde ao teste:** `signup.spec.ts`

#### Passo 1.1: Signup
1. Na tela inicial, clique em **"Sign Up"** ou **"Criar Conta"**
2. Preencha:
   - **Email:** `test-$(date +%s)@example.com` (use um email único com timestamp)
   - **Senha:** `SecurePassword123!`
   - **Confirmar Senha:** `SecurePassword123!`
3. Clique **"Sign Up"** / **"Create Account"**

**✓ Esperado:** Ser redirecionado para `/dashboard`

#### Passo 1.2: Criar Primeira Transação
1. Clique em **"Transactions"** no menu
2. Clique em **"Add"** / **"New Transaction"** / **"+"**
3. Preencha o formulário:
   - **Description:** "Test Transaction 001"
   - **Amount:** "100.00"
   - **Category:** Selecione qualquer categoria
   - **Type:** Expense (se houver)
4. Clique **"Save"** / **"Create"** / **"Add"**

**✓ Esperado:** Transação aparece na lista com "Test Transaction 001" e "100.00"

#### 📋 Validação Checklist
- [ ] Signup página funciona
- [ ] Email/Senha aceitam input
- [ ] Redirecionamento para dashboard
- [ ] Dashboard carrega sem erros
- [ ] Menu de Transactions acessível
- [ ] Botão "Add Transaction" visível
- [ ] Formulário de transação se abre
- [ ] Campos de entrada funcionam
- [ ] Transação salva e aparece na lista

---

### **CENÁRIO 2: Recurring Transaction** (5 minutos)

**Corresponde ao teste:** `transactions.spec.ts`

#### Passo 2.1: Criar Transação Recorrente
1. Em **Transactions**, clique **"Add"**
2. Preencha:
   - **Description:** "Monthly Subscription"
   - **Amount:** "29.99"
   - **Category:** Utilities (ou similar)
3. Procure por:
   - **Checkbox "Recurring"** ou
   - **"Make this recurring"** ou
   - **Dropdown "Frequency"**
4. Se encontrar, marque como **"Monthly"** e clique **"Save"**

**✓ Esperado:** Transação criada com label de "Monthly" ou "Recurring"

#### Passo 2.2: Verificar Recorrência
1. Navegue para o **mês seguinte** (procure por botão "Next" ou setas)
2. Se a transação recorrente foi criada corretamente, ela deve aparecer **também no próximo mês**

**✓ Esperado:** "Monthly Subscription" visível em ambos os meses

#### 📋 Validação Checklist
- [ ] Opção "Recurring" encontrada no formulário
- [ ] Frequência pode ser selecionada
- [ ] Transação recorrente salva
- [ ] Aparece em próximos meses (se navegável)
- [ ] Valor e descrição corretos

---

### **CENÁRIO 3: Data Isolation (Multi-User)** (5-10 minutos)

**Corresponde ao teste:** `security.spec.ts`

#### Passo 3.1: Logout (Limpar Sessão)
1. Procure pelo menu (canto superior direito geralmente)
2. Clique em **"Logout"** / **"Sign Out"** / **"Exit"**
3. Confirmação se aparecer
4. Você deve ser redirecionado para `/login`

**✓ Esperado:** Sessão encerrada, redirecionado para login

#### Passo 3.2: Signup Novo Usuário
1. Clique em **"Sign Up"**
2. Preencha com **EMAIL DIFERENTE:**
   - **Email:** `user2-$(date +%s)@example.com`
   - **Senha:** `SecurePassword123!`
3. Clique **"Sign Up"**

**✓ Esperado:** Novo usuário criado, dashboard carregado

#### Passo 3.3: Verificar Isolamento
1. Vá para **Transactions**
2. Você deve ver uma lista **vazia ou apenas suas transações**
3. Não deve ver "Test Transaction 001" ou "Monthly Subscription" do usuário anterior

**✓ Esperado:** Dados do Usuário 1 não aparecem para Usuário 2

#### 📋 Validação Checklist
- [ ] Logout funciona
- [ ] Redirecionado para login
- [ ] Novo signup possível
- [ ] Dashboard carrega com novo usuário
- [ ] Transactions vazio ou contém apenas novas transações
- [ ] Sem dados do usuário anterior visível

---

## 📊 Matriz de Validação

Após completar os 3 cenários, marque o resultado:

| Cenário | Status | Observações |
|---------|--------|-------------|
| 1. Signup + First Transaction | ✓ Passou / ✗ Falhou | |
| 2. Recurring Transaction | ✓ Passou / ✗ Falhou | |
| 3. Data Isolation (Multi-User) | ✓ Passou / ✗ Falhou | |

---

## 🔍 Troubleshooting

### "Página não carrega em localhost:3000"
**Solução:**
```bash
# Terminal 1 - Verifique se servidor está rodando
npm run dev

# Verifique se porta 3000 está livre
netstat -an | grep 3000
```

### "Botões/Campos não aparecem com nomes esperados"
**Solução:**
- Procure por **ícones** (+ para adicionar, 🗑️ para deletar)
- Procure por **placeholders** em inputs
- Clique em elementos suspeitos para ver o que fazem

### "Transação recorrente não aparece no próximo mês"
**Solução:**
- A feature pode não estar implementada ainda
- Procure por:
  - View mensal com navegação
  - Calendário
  - Filtro de datas

### "Transação do usuário 1 aparece para usuário 2"
**⚠️ CRÍTICO - Falha de Segurança!**
- Isso é um bug sério
- Verificar localStorage (F12 → Application → Local Storage)
- Possível que dados estejam usando chave fixa ao invés de por usuário

---

## 📝 Checklist Final

Após validação manual, responda:

1. **Signup funciona?**
   - [ ] Sim
   - [ ] Não
   - [ ] Parcialmente

2. **Transações podem ser criadas?**
   - [ ] Sim
   - [ ] Não (qual erro?)
   - [ ] Parcialmente

3. **Dados estão isolados por usuário?**
   - [ ] Sim
   - [ ] Não (dados misturados!)
   - [ ] Não testado

4. **Algum seletor dos testes E2E precisa atualização?**
   - [ ] Não, seletores estão OK
   - [ ] Sim, lista abaixo:
     ```
     - Descrição do problema aqui
     - Seletor que não funcionou
     ```

5. **Próximos passos:**
   - [ ] Rodar testes E2E (npm run test:e2e)
   - [ ] Debugar erros com UI (npm run test:e2e:ui)
   - [ ] Corrigir seletores que falharam
   - [ ] Commitar tudo para git

---

## 🚀 Próximas Ações

### Se tudo passou ✅
```bash
# Commitar os testes
git add tests/e2e/
git commit -m "feat: Add E2E tests for 6 critical journeys (STY-016)"

# Depois rodar testes automaticamente
npm run test:e2e
```

### Se algo falhou ❌
1. Anote qual teste falhou
2. Identifique seletores que não funcionaram
3. Atualize no arquivo `.spec.ts`
4. Re-teste manualmente
5. Depois commite

---

## 📞 Dúvidas?

Se encontrar elementos não mapeados:
1. Abra **DevTools (F12)**
2. Use **Inspect Element** (seta no canto superior esquerdo)
3. Clique no elemento
4. Anote seu `data-testid`, `class`, `id`, ou texto visível
5. Atualize o teste com o seletor correto

---

**Data:** 2026-01-27
**Test Owner:** @qa (Quinn)
**Guia para:** STY-016 Validation Phase
