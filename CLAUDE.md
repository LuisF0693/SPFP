# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SPFP** (Sistema de Planejamento Financeiro Pessoal) is a personal financial planning and AI-powered insights application built with React 19, TypeScript, and Vite. It provides comprehensive financial management features including transaction tracking, budgeting, investments, goals, and AI-driven financial insights powered by Google Gemini.

- **Technology**: React 19 + TypeScript + Vite
- **UI Framework**: TailwindCSS with glassmorphism and dark mode
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI**: Google Gemini API (chat-based financial insights)
- **Charts**: Recharts (financial data visualization)
- **Documentation**: PDF export via jsPDF
- **Routing**: React Router DOM v7

## Core Operating Rules

### NEVER
- Implement without showing options first (always present as "1. X, 2. Y, 3. Z" format)
- Delete/remove content without asking first
- Delete anything created in the last 7 days without explicit approval
- Change something that was already working
- Pretend work is done when it isn't
- Process batch work without validating one item first
- Add features that weren't requested
- Use mock data when real data exists in the database
- Explain/justify when receiving criticism (just fix it)
- Trust AI/subagent output without verification
- Create from scratch when similar components exist in the codebase

### ALWAYS
- Present options to user as "1. X, 2. Y, 3. Z" format before deciding
- Use `AskUserQuestion` tool for any clarifications or ambiguities
- Check existing components and utilities before creating new ones
- Read COMPLETE schema/types before proposing database or state changes
- Investigate root cause when an error persists
- Commit changes to git before moving to the next task
- Create handoff notes in `docs/sessions/YYYY-MM/` at end of session

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test:ui
```

## Project Structure

```
src/
├── components/          # React components (UI, pages, features)
│   ├── ui/             # Reusable UI components (Loading, modals, etc.)
│   ├── Layout.tsx      # Main layout wrapper (personal/crm modes)
│   ├── Dashboard.tsx   # Financial dashboard
│   ├── Accounts.tsx    # Account management
│   ├── TransactionForm.tsx
│   ├── TransactionList.tsx
│   ├── Goals.tsx       # Financial goals tracking
│   ├── Investments.tsx
│   ├── Patrimony.tsx   # Wealth/patrimony tracking
│   ├── Reports.tsx
│   ├── Insights.tsx    # AI-powered financial insights
│   ├── Budget.tsx
│   ├── AdminCRM.tsx    # Admin panel (impersonation, client management)
│   └── ...
├── context/            # React Context providers
│   ├── AuthContext.tsx # Authentication (Supabase, Google OAuth, email/password)
│   └── FinanceContext.tsx # Global financial state (transactions, accounts, budgets, etc.)
├── services/           # Business logic & API integrations
│   ├── aiService.ts    # Unified AI service (Google Gemini, OpenAI-compatible APIs)
│   ├── geminiService.ts
│   ├── aiHistoryService.ts # AI chat history persistence
│   ├── pdfService.ts   # PDF generation and export
│   ├── csvService.ts   # CSV import/export for transactions
│   ├── MarketDataService.ts # Market data fetching for investments
│   ├── projectionService.ts # Financial projections
│   └── logService.ts   # User interaction logging
├── data/               # Static data & constants
│   └── initialData.ts  # Initial accounts, categories, transactions
├── utils/              # Utility functions
│   └── (formatting, calculations, helpers)
├── test/               # Test files
├── types/              # TypeScript interfaces & types
├── supabase.ts         # Supabase client initialization
├── App.tsx             # Root component with routing & auth
└── main.tsx            # Entry point
```

## Key Architecture Patterns

### Authentication & State Management

1. **AuthContext** (`src/context/AuthContext.tsx`)
   - Manages user session via Supabase Auth
   - Supports: Google OAuth, email/password registration & login
   - Provides `useAuth()` hook exposing `{ user, session, loading, isAdmin, signInWithGoogle, signInWithEmail, registerWithEmail, logout }`
   - Admin detection: `ADMIN_EMAILS` array in AuthContext (currently: `nando062218@gmail.com`)

2. **FinanceContext** (`src/context/FinanceContext.tsx`)
   - Global financial state with localStorage sync (per-user storage keys)
   - Provides `useFinance()` hook for accessing all financial data
   - Manages: accounts, transactions, categories, goals, investments, patrimony, budgets
   - **Admin Impersonation**: Admins can impersonate clients via `AdminCRM` component
     - Persisted via `spfp_is_impersonating` and `spfp_impersonated_user_id` localStorage keys
     - Separate state restoration for admin when exiting impersonation
   - **Data Sync**: Supabase real-time sync with `isSyncing` and `isInitialLoadComplete` flags
   - Transaction groups: Supports recurring/installment transactions via `groupId` field

### Routing Architecture

- **PrivateRoute**: Guards authenticated user routes, redirects to `/login` if no user
- **AdminRoute**: Guards admin-only routes (e.g., `/admin`), redirects to `/dashboard` if not admin
- **Sales Page** (`/`): Public landing page shown to non-authenticated users
- **Layout Modes**: `Layout` component accepts `mode="personal"` or `mode="crm"` for different sidebars/UIs

### AI Integration Pattern

**aiService.ts** provides unified interface supporting multiple AI providers:
- **Google Gemini**: Primary provider with fallback across model versions (1.5-flash, 2.0-flash-exp, 1.5-pro)
- **OpenAI-compatible**: Secondary provider for custom endpoints
- Handles message history, system prompts, and safety settings
- Used by Insights component and AI chat features

## Important Implementation Notes

### Adding New Features

When adding features that persist data:
1. Add new state to `GlobalState` interface in `FinanceContext`
2. Initialize in `getInitialState()` function
3. Create add/update/delete functions for that data
4. Export from `useFinance()` hook
5. Consider localStorage sync strategy and Supabase table structure

### Admin Impersonation Logic

The impersonation system (used in AdminCRM):
- Admin calls `loadClientData(userId)` to load a specific client's financial data
- Client data replaces admin's state; admin's original state is saved
- When admin calls `stopImpersonating()`, original state is restored
- Critical: Check `isImpersonating` flag before syncing authenticated user data (see App.tsx:52)

### Supabase Integration

- Client: `src/supabase.ts` initializes Supabase with environment variables
- Auth: Handled via `AuthContext` (no manual client calls needed in components)
- Real-time sync: `FinanceContext` manages subscriptions (not yet fully implemented for all data types)
- Storage: User data cached in localStorage with fallback to initial data

### PDF & CSV Export

- **PDF**: `pdfService.ts` generates styled PDFs of reports, transactions, and statements
- **CSV**: `csvService.ts` handles transaction import/export (common banking format)
- Both use components data and format for download

### Security Considerations

- **API Keys**: Gemini API key exposed in Vite config (frontend-only) — ensure `.env.local` is in `.gitignore`
- **Admin Emails**: Hardcoded in `AuthContext.tsx` — update `ADMIN_EMAILS` array for production
- **Impersonation**: Only accessible via `/admin` route (AdminRoute guard) — limited to admin users
- **User Data**: Separated per user via localStorage keys; no cross-user data leakage in local storage

## Common Development Tasks

### Adding a New Transaction Type or Category

1. Update `CategoryIcon.tsx` with new icon mapping
2. Add category to `INITIAL_CATEGORIES` in `src/data/initialData.ts`
3. Update transaction form UI if needed (e.g., category selector)

### Modifying AI Prompts or Behavior

1. Edit prompt strings in `Insights.tsx` or relevant component
2. Adjust safety settings in `aiService.ts` if needed (HarmCategory thresholds)
3. Test with different Gemini models by updating `preferredModel` param

### Adding New Dashboard Widgets

1. Define widget in `DashboardWidget` type and `DEFAULT_LAYOUT`
2. Create component in `src/components/`
3. Render conditionally in `Dashboard.tsx` based on `dashboardLayout` visibility
4. Update `Settings.tsx` to allow toggling widget visibility

### Handling Recurring/Installment Transactions

Transactions with `groupId` are treated as groups:
- `deleteTransactionGroup(groupId)` deletes all transactions in that group
- `deleteTransactionGroupFromIndex(groupId, fromIndex)` deletes from specific index onward
- When adding recurring: generate same `groupId` for all occurrences

## Configuration & Environment

- **Vite Config** (`vite.config.ts`):
  - Development server on port 3000
  - Path alias: `@` → `src/`
  - Exposes `GEMINI_API_KEY` to frontend via `process.env`

- **TypeScript** (`tsconfig.json`):
  - Target: ES2022
  - Path alias: `@/*` → `src/*`
  - JSX: react-jsx

- **Environment Variables** (`.env.local`):
  - `GEMINI_API_KEY`: Required for AI features
  - Supabase keys: Set in Vite config (check with DevOps)

## Testing

- Test runner: Vitest
- Framework: React Testing Library + JSDOM
- Test location: `src/test/` directory
- Run: `npm run test` or `npm run test:ui`

## Notes for Future Development

1. **Real-time Sync**: FinanceContext has `isSyncing` flag but not all data types have Supabase listeners — implement for critical tables (transactions, goals, investments)
2. **Performance**: Consider pagination for transaction lists (currently loads all in memory)
3. **Error Handling**: Enhance error messages and recovery UX (especially for AI/Gemini failures)
4. **Mobile Responsiveness**: Recharts and modals need testing on mobile devices
5. **Accessibility**: Review ARIA labels and keyboard navigation for financial forms
