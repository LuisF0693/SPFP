# Lead Forms Setup — SPFP Landing Page

## Overview

O sistema de Lead Forms foi implementado para capturar contatos de visitantes da landing page. Os dados são salvos no Supabase e podem ser consultados para follow-up.

## Database Setup

Execute o SQL abaixo no **Supabase SQL Editor** para criar a tabela de leads:

```sql
-- Criar tabela de leads
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  source VARCHAR(50) NOT NULL DEFAULT 'landing_page',
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar índice para buscar por email
CREATE INDEX idx_leads_email ON public.leads(email);

-- Criar índice para ordenar por data
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);

-- Criar política RLS para permitir inserção anônima
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts on leads"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow read leads for authenticated users"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Frontend Components

### 1. LeadForm Component (`src/components/landing/LeadForm.tsx`)

Modal com formulário de captura de leads com:
- Validação com Zod + React Hook Form
- Campos: Nome, Email, Telefone (opcional)
- Estados: idle, loading, success, error
- Integração com `leadService`

### 2. leadService (`src/services/leadService.ts`)

Serviço Supabase para:
- `saveLead()` - Salva novo lead
- `leadExists()` - Verifica duplicatas
- `getAllLeads()` - Lista leads (admin)
- `updateLeadStatus()` - Atualiza status

### 3. Hero Component (Updated)

Botões "Começar com Plataforma" e "Agendar Demo" agora abrem o modal de lead form.

## Usage

### Frontend
O usuário clica em um CTA e o modal aparece. Após validação e sucesso, recebe confirmação e pode fechar.

### Backend (Admin)
Acesse `https://app.supabase.com` > "Leads" table para gerenciar leads.

## Sources

Leads são categorizados por origem:
- `landing_page` - Botão "Começar com Plataforma"
- `demo_request` - Botão "Agendar Demo"
- `pricing` - Futuro: formulário na seção de pricing

## Status Workflow

- **new** - Lead recém-capturado
- **contacted** - Vendedor entrou em contato
- **converted** - Virou cliente

## Next Steps

1. ✅ Criar tabela no Supabase (execute SQL acima)
2. ✅ Verificar componentes e serviço funcionando
3. ⏳ Implementar webhook para enviar email de confirmação
4. ⏳ Dashboard admin para gerenciar leads
5. ⏳ Integração com CRM (Pipedrive, Hubspot)

## Testing

### Local
```bash
npm run dev
# Visite http://localhost:3000/transforme
# Clique em um CTA
# Preencha o formulário
# Deve salvar sem erros
```

### Verificar Supabase
```sql
SELECT * FROM public.leads ORDER BY created_at DESC LIMIT 10;
```

## Troubleshooting

### "Table doesn't exist"
- Execute o SQL setup acima no Supabase SQL Editor
- Verifique se há erro de permissão (RLS policies)

### "Email já existe"
- O sistema não permite duplicatas
- Usuário precisa usar email diferente

### Modal não abre
- Verifique se `LeadForm` está importado em `Hero.tsx`
- Teste no console: `document.querySelector('[aria-label="Fechar"]')`

## Security

- ✅ Email único (evita duplicatas)
- ✅ RLS habilitada (anônimos só podem inserir)
- ✅ Validação Zod no frontend
- ✅ HTTPS obrigatório em produção
- ⏳ reCAPTCHA (futuro)
