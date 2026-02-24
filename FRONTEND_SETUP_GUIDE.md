# Frontend Setup Guide — SPFP Landing Page

**Data:** 2026-02-23
**Projeto:** SPFP Landing Page `/transforme`
**Framework:** Next.js 15 (React 19 + TypeScript)
**Styling:** TailwindCSS
**Status:** 🚀 Ready to Code

---

## 1. PRÉ-REQUISITOS

### Instale Globalmente

```bash
# Node.js 18+ (verificar versão)
node --version

# npm (vem com Node)
npm --version

# Opcionais (melhor performance)
npm install -g pnpm
npm install -g bun
```

---

## 2. SETUP INICIAL (Passo-a-Passo)

### 2.1 Criar projeto Next.js

```bash
# Navegue até a pasta do projeto SPFP
cd "D:\Projetos Antigravity\SPFP\SPFP"

# Crie página de landing integrada ao projeto existente
# OU crie novo projeto se separate:

# Opção A: Se o projeto já tem Next.js
# (integrar na rota /transforme do projeto existente)

# Opção B: Novo projeto separado (para simplicidade)
npx create-next-app@latest . --typescript --tailwind --app
# Quando perguntado:
# - Use TypeScript? → Yes
# - Use ESLint? → Yes
# - Use Tailwind CSS? → Yes
# - Use src/ directory? → Yes
# - Use App Router? → Yes
# - Use Turbopack? → No (experimental)
# - Customize import alias? → No (use @/*)
```

### 2.2 Instalar Dependências Adicionais

```bash
npm install
# OR
pnpm install

# Dependências do projeto
npm install react-hook-form zod @hookform/resolvers
npm install framer-motion
npm install zustand # state management (se necessário)
npm install lucide-react # icons
npm install clsx tailwind-merge # utility helpers

# Dev dependencies
npm install -D typescript @types/react @types/node
npm install -D prettier prettier-plugin-tailwindcss
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D husky lint-staged
```

### 2.3 Estrutura de Diretórios

```
projeto/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home (/)
│   │   ├── transforme/
│   │   │   └── page.tsx        # Landing page (/transforme)
│   │   ├── api/
│   │   │   ├── leads/
│   │   │   │   └── route.ts    # POST /api/leads
│   │   │   ├── checkout/
│   │   │   │   └── route.ts    # POST /api/checkout-session
│   │   │   └── webhooks/
│   │   │       └── stripe.ts   # Stripe webhooks
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── landing/            # Landing page sections
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Header.tsx
│   │   │
│   │   ├── ui/                 # Reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Accordion.tsx
│   │   │
│   │   └── forms/              # Form components
│   │       ├── LeadForm.tsx
│   │       └── CheckoutForm.tsx
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useLead.ts
│   │   ├── useCheckout.ts
│   │   └── useLandingTracking.ts
│   │
│   ├── lib/                    # Utilities & helpers
│   │   ├── cn.ts             # classname merger
│   │   ├── constants.ts       # Constantes (pricing, etc)
│   │   └── types.ts           # TypeScript types
│   │
│   ├── services/              # API services
│   │   ├── leads.ts
│   │   ├── stripe.ts
│   │   └── email.ts
│   │
│   └── styles/                # Global styles
│       └── globals.css
│
├── public/                      # Static assets
│   ├── landing/
│   │   ├── hero-video.mp4
│   │   ├── hero-fallback.jpg
│   │   ├── icons/
│   │   └── avatars/
│   └── logo.svg
│
├── .env.local                  # Local environment variables
├── .env.example                # Template (commit this)
├── .eslintrc.json             # ESLint config
├── .prettierrc                 # Prettier config
├── tailwind.config.ts         # TailwindCSS config
├── tsconfig.json              # TypeScript config
├── next.config.ts             # Next.js config
├── package.json               # Dependencies
├── README.md                  # Documentation
└── .gitignore                 # Git ignore rules
```

---

## 3. CONFIGURAR FERRAMENTAS

### 3.1 TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 3.2 TailwindCSS (tailwind.config.ts)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F6FF',
          100: '#E0ECFF',
          200: '#B3D9FF',
          300: '#80C1FF',
          400: '#4DA8FF',
          500: '#1A90FF',
          600: '#0070CC',
          700: '#004399',
          800: '#002E66',
        },
      },
      spacing: {
        'section': '80px',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
```

### 3.3 ESLint (.eslintrc.json)

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 3.4 Prettier (.prettierrc)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 3.5 package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

### 3.6 Git Hooks (husky + lint-staged)

```bash
# Inicializar husky
npx husky install

# Criar pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

```json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## 4. VARIÁVEIS DE AMBIENTE

### .env.example

```
# Públicas (expose ao browser)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Privadas (server-only)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

SENDGRID_API_KEY=SG....

GOOGLE_ANALYTICS_ID=G-...

DATABASE_URL=postgresql://...
```

### .env.local (gitignore'd)

```
Copie do .env.example e preencha valores locais
```

---

## 5. COMEÇAR A CODIFICAR

### 5.1 Root Layout

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SPFP - Planejamento Financeiro Pessoal',
  description: 'Planeje suas finanças com IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  )
}
```

### 5.2 Landing Page Layout

```typescript
// src/app/transforme/page.tsx
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Pricing from '@/components/landing/Pricing'
import FAQ from '@/components/landing/FAQ'
import Footer from '@/components/landing/Footer'

export default function TransformePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
```

### 5.3 Primeiro Componente: Button

```typescript
// src/components/ui/Button.tsx
import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  children: ReactNode
  onClick?: () => void
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  children,
  onClick,
}: ButtonProps) {
  const baseStyles =
    'font-semibold rounded-lg transition-all duration-300 cursor-pointer'

  const variantStyles = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg md:h-12',
  }

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### 5.4 Helper Function: cn

```typescript
// src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 5.5 API Route: Criar Lead

```typescript
// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const leadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  persona: z.enum(['empreendedor', 'investidor', 'executivo', 'autonomo']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = leadSchema.parse(body)

    // TODO: Save to database (Supabase)
    // const { data: lead, error } = await supabase
    //   .from('leads')
    //   .insert([data])

    // TODO: Send email (SendGrid)
    // await sendWelcomeEmail(data.email)

    return NextResponse.json({ success: true, leadId: '123' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 400 }
    )
  }
}
```

---

## 6. EXECUTAR PROJETO

### Desenvolvimento

```bash
# Iniciar dev server
npm run dev

# Abrir em http://localhost:3000/transforme
```

### Build

```bash
# Criar build de produção
npm run build

# Testar build localmente
npm run start
```

### Linting & Formatting

```bash
# Verificar problemas
npm run lint

# Formatar automaticamente
npm run format

# Type checking
npm run type-check
```

---

## 7. PRÓXIMOS PASSOS

Após setup completo:

1. **Criar componentes da landing** (Hero, Features, Pricing)
2. **Implementar formulários** (Lead capture, checkout)
3. **Integrar APIs** (Supabase, Stripe, SendGrid)
4. **Adicionar analytics** (Google Analytics, Hotjar)
5. **Testes** (unit, integration, e2e)
6. **Deploy** (Vercel, GitHub Actions CI/CD)

---

## 8. TROUBLESHOOTING

### Erro: "Module not found"

```bash
# Limpar cache Next.js
rm -rf .next
npm run dev
```

### Erro: "TypeScript error"

```bash
# Verificar tipos
npm run type-check

# Atualizar tipos
npm install --save-dev @types/...
```

### Erro: "Tailwind classes not applying"

```bash
# Verificar content paths em tailwind.config.ts
# Reiniciar dev server
npm run dev
```

---

## ✅ Checklist

- [ ] Node.js 18+ instalado
- [ ] Projeto Next.js criado
- [ ] Dependências instaladas
- [ ] TypeScript configurado
- [ ] TailwindCSS funcionando
- [ ] ESLint & Prettier configurados
- [ ] Git hooks setup
- [ ] .env.local preenchido
- [ ] Dev server rodando (`npm run dev`)
- [ ] Landing page `/transforme` acessível

---

**Pronto para começar a codificar! 🚀**

Próximas tarefas:
1. `frontend-implementar-design.md` — Codificar componentes
2. `frontend-otimizar-performance.md` — Performance
3. `backend-setup-api.md` — APIs & integrações

---

## Quick Reference

```bash
# Create component
touch src/components/landing/Hero.tsx

# Create page
mkdir -p src/app/transforme && touch src/app/transforme/page.tsx

# Run tests
npm run test

# Format code
npm run format

# Deploy preview
npm run build && npm run start
```
