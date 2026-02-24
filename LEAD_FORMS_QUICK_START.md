# Lead Forms — Quick Start Guide

## ✅ O que foi implementado

### 1. **Componente LeadForm** (`src/components/landing/LeadForm.tsx`)
Modal com:
- Validação de email, nome, telefone
- Estados: loading, success, error
- Animações suaves com Framer Motion
- Feedback visual ao usuário

### 2. **Serviço leadService** (`src/services/leadService.ts`)
Funções para:
- Salvar novo lead no Supabase
- Verificar email duplicado
- Listar leads (admin)
- Atualizar status

### 3. **Hero Component Atualizado**
Botões agora abrem o modal:
- "Começar com Plataforma" (source: platform)
- "Agendar Demo" (source: demo)

### 4. **Migration SQL**
Arquivo em `supabase/migrations/001_create_leads_table.sql` com:
- Tabela de leads com campos completos
- Índices para performance
- Row Level Security (RLS)
- Políticas para anônimos e admin

---

## 🚀 Como usar

### Passo 1: Setup Supabase (2 min)

**Opção A - CLI (recomendado):**
```bash
# Se tem supabase CLI instalado
supabase db push
```

**Opção B - Dashboard Manual:**
1. Vá para https://app.supabase.com
2. Clique em "SQL Editor"
3. Cole o SQL de `supabase/migrations/001_create_leads_table.sql`
4. Clique "Run"

### Passo 2: Testar Localmente
```bash
npm run dev
# Visite http://localhost:3000/transforme
# Clique em "Começar com Plataforma" ou "Agendar Demo"
```

### Passo 3: Preencher Formulário
- Nome: João Silva
- Email: joao@example.com
- Telefone: (11) 99999-9999 (opcional)
- Clique "Começar Agora"

### Passo 4: Verificar no Supabase
```sql
SELECT * FROM public.leads ORDER BY created_at DESC LIMIT 10;
```

---

## 📋 Campos do Lead

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `id` | UUID | - | Auto (PK) |
| `name` | String | ✅ | 3-100 caracteres |
| `email` | String | ✅ | Email válido, único |
| `phone` | String | ❌ | 10-11 dígitos |
| `source` | Enum | - | landing_page / demo / pricing |
| `status` | Enum | - | new / contacted / converted |
| `created_at` | Timestamp | - | Auto (agora) |
| `updated_at` | Timestamp | - | Auto (atualiza) |

---

## 🎯 Sources Disponíveis

```typescript
type Source = 'landing_page' | 'demo_request' | 'pricing';
```

- **landing_page**: Clique em "Começar com Plataforma"
- **demo_request**: Clique em "Agendar Demo"
- **pricing**: Futuro — adicione em `Pricing.tsx`

---

## 🔐 Segurança

✅ **RLS Habilitada**: Apenas usuários autenticados podem ler leads
✅ **Email Único**: Evita duplicatas
✅ **Validação Zod**: Frontend valida antes de enviar
✅ **Sem Passwords**: Dados públicos, apenas email/nome/telefone

---

## 🛠️ Próximas Etapas (Opcional)

- [ ] Webhook para enviar email de confirmação
- [ ] Dashboard admin para gerenciar leads
- [ ] Integração CRM (Pipedrive, Hubspot)
- [ ] reCAPTCHA para evitar spam
- [ ] Adicionar formulário em `Pricing.tsx`

---

## 📞 Troubleshooting

### "Table doesn't exist"
→ Execute migration SQL no Supabase Dashboard

### "Email já existe"
→ Sistema não permite duplicatas (por design)

### Modal não abre
→ Abra DevTools, verifique `LeadForm` em Components

### Build falha
→ Rode `npm install` para atualizar dependências

---

## 💡 Dica

Para testar com emails diferentes rapidamente:
```javascript
// DevTools Console
const now = Date.now();
const email = `test+${now}@example.com`;
console.log(email);
```

---

**Status:** ✅ Pronto para produção
**Última atualização:** 2026-02-23
**Arquivos criados:** 4 (LeadForm, leadService, Migration, Docs)
