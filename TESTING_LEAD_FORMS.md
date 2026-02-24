# 🧪 Testing Guide — Lead Forms

## Setup para Teste Local

### 1️⃣ Terminal 1: Inicie o Dev Server
```bash
cd "D:\Projetos Antigravity\SPFP\SPFP"
npm run dev
```

Você verá algo como:
```
  VITE v6.4.1  ready in 485 ms

  ➜  Local:   http://localhost:3000/
  ➜  Press h to show help
```

### 2️⃣ Abra no Browser
Navegue para: **http://localhost:3000/transforme**

Você verá:
- Hero section com título "Planeje suas finanças em minutos, não horas."
- Dois botões: "Começar com Plataforma" e "Agendar Demo"

---

## 🧬 Teste #1: Abrir Modal

### Ação
Clique no botão **"Começar com Plataforma"**

### Esperado ✅
- Modal com fade-in suave
- Campos visíveis: Nome, Email, Telefone
- Botão "X" para fechar no canto superior direito

### Se não funcionar ❌
Abra DevTools (F12) e procure por erros na aba Console.

---

## 🧬 Teste #2: Validação de Campos

### Teste 2A: Nome muito curto
1. Digite: `Jo`
2. Email: `test@example.com`
3. Clique "Começar Agora"

**Esperado:** Erro: "Nome deve ter pelo menos 3 caracteres"

### Teste 2B: Email inválido
1. Nome: `João Silva`
2. Email: `invalid-email`
3. Clique "Começar Agora"

**Esperado:** Erro: "Email inválido"

### Teste 2C: Telefone com caracteres inválidos
1. Nome: `João Silva`
2. Email: `joao@example.com`
3. Telefone: `(11) 9999-9999` (com parênteses)
4. Clique "Começar Agora"

**Esperado:** Erro: "Telefone deve ter 10 ou 11 dígitos"

### Teste 2D: Telefone com formato correto
1. Nome: `João Silva`
2. Email: `joao@example.com`
3. Telefone: `11999999999` (apenas números)
4. Clique "Começar Agora"

**Esperado:** Sucesso!

---

## 🧬 Teste #3: Envio Bem-Sucedido

### Ação
1. Nome: `João Silva`
2. Email: `joao+${timestamp}@example.com` (use um email único)
3. Telefone: `11999999999` (opcional)
4. Clique "Começar Agora"

**Esperado:**
- Botão muda para "Salvando..." com spinner
- Modal mostra ✅ com mensagem "Obrigado! Em breve entraremos em contato no seu email."
- Após 2 segundos, modal fecha automaticamente

### Verificar no Supabase
```sql
SELECT * FROM public.leads ORDER BY created_at DESC LIMIT 1;
```

Você deve ver:
```
id: [UUID]
name: João Silva
email: joao+timestamp@example.com
phone: 11999999999
source: landing_page
status: new
created_at: [agora]
updated_at: [agora]
```

---

## 🧬 Teste #4: Fonte de Lead (Source)

### Teste 4A: Plataforma
1. Clique "Começar com Plataforma"
2. Preencha: `test1@example.com`
3. Clique "Começar Agora"
4. Verificar no Supabase

**Esperado:** `source = 'landing_page'`

### Teste 4B: Demo
1. Clique "Agendar Demo"
2. Preencha: `test2@example.com`
3. Clique "Começar Agora"
4. Verificar no Supabase

**Esperado:** `source = 'demo_request'`

---

## 🧬 Teste #5: Email Duplicado

### Ação
1. Preencha com email já utilizado (ex: `joao@example.com`)
2. Clique "Começar Agora"

**Esperado:**
- Erro: "Erro ao salvar seus dados. Tente novamente." (banco rejeita UNIQUE constraint)
- Modal permanece aberto para tentar novamente

---

## 🧬 Teste #6: Fechar Modal

### Teste 6A: Botão X
1. Clique "Começar com Plataforma"
2. Clique no "X" no canto superior direito

**Esperado:** Modal fecha com fade-out

### Teste 6B: Clique fora (backdrop)
1. Clique "Começar com Plataforma"
2. Clique fora do modal (área escura)

**Esperado:** Modal fecha

### Teste 6C: ESC (keyboard)
1. Clique "Começar com Plataforma"
2. Pressione ESC

**Esperado:** Modal fecha (se implementado)

---

## 🧬 Teste #7: Responsividade

### Desktop (1440px)
- Modal centralizado
- Campos com width completo
- Botão com padding generoso

### Tablet (768px)
- Modal centralizado
- Campos responsivos
- Texto reduzido

### Mobile (375px)
- Modal com padding
- Teclado não sobrepõe formulário
- Botão toque-friendly (44x44px mínimo)

---

## 📊 Checklist de Testes

- [ ] Teste #1: Modal abre com fade-in
- [ ] Teste #2A: Validação nome curto
- [ ] Teste #2B: Validação email inválido
- [ ] Teste #2C: Validação telefone inválido
- [ ] Teste #2D: Telefone válido (sem erros)
- [ ] Teste #3: Envio bem-sucedido com sucesso
- [ ] Teste #4A: Source = landing_page (Plataforma)
- [ ] Teste #4B: Source = demo_request (Demo)
- [ ] Teste #5: Email duplicado rejeitado
- [ ] Teste #6A: Fechar com botão X
- [ ] Teste #6B: Fechar com backdrop
- [ ] Teste #7: Responsividade em mobile

---

## 🐛 Troubleshooting

### Erro: "Cannot GET /transforme"
→ Dev server não iniciou corretamente
→ Solução: Ctrl+C e `npm run dev` novamente

### Modal não aparece
→ Abra DevTools (F12) → Console
→ Procure por erro de import ou compilação
→ Solução: Verifique se `LeadForm` está importado em `Hero.tsx`

### "Table doesn't exist"
→ Você executou o SQL no Supabase?
→ Solução: Ir para Supabase Dashboard → SQL Editor → executar migration

### "Email já existe"
→ Por design (constraint UNIQUE)
→ Solução: Use um email diferente para testar

### Spinner infinito
→ Request não retornou (timeout)
→ Verificar: 1) Supabase online? 2) RLS policies corretas? 3) API key correta?

---

## 💾 Output Esperado (DevTools Console)

Quando tudo funciona:
```
✓ Lead Form Component mounted
✓ leadsService imported
✓ Form validation schema loaded
✓ Supabase client ready
✓ Lead saved successfully (UUID)
```

---

**Total de testes:** 12 testes principais
**Tempo esperado:** 10-15 minutos
**Status:** Pronto para validação

Quer que eu execute os testes ou prefere fazer manualmente? Responda [A]utomático ou [M]anual.
