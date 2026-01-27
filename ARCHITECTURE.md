# SPFP Architecture Guide

This document provides a detailed overview of the SPFP (Sistema de Planejamento Financeiro Pessoal) system architecture. For quick reference, see [CLAUDE.md](./CLAUDE.md).

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Technology Stack](#technology-stack)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Authentication & Security](#authentication--security)
7. [AI Integration](#ai-integration)
8. [Database Design](#database-design)
9. [Data Flow](#data-flow)
10. [Deployment Architecture](#deployment-architecture)

## System Overview

SPFP is a full-stack financial planning application that combines:

- **Frontend**: React 19 with TypeScript and Vite
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI**: Google Gemini API for intelligent insights
- **UI Framework**: TailwindCSS with glassmorphism design
- **Data Visualization**: Recharts

The system enables users to:
- Track transactions and accounts
- Plan budgets and financial goals
- Analyze investments
- Monitor net worth (patrimony)
- Receive AI-powered financial insights
- Export reports as PDF/CSV

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser / Client                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    React Application                     │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │        Components (UI Layer)                      │    │   │
│  │  │  - Dashboard, Reports, Goals, Investments        │    │   │
│  │  │  - TransactionForm, TransactionList              │    │   │
│  │  │  - Insights (AI Chat), AdminCRM                  │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                        ↑                                   │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │      React Context (State Management)            │    │   │
│  │  │  - AuthContext (authentication, session)         │    │   │
│  │  │  - FinanceContext (all financial data)           │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                        ↑                                   │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │          Services Layer                           │    │   │
│  │  │  - aiService (Gemini, OpenAI-compatible)         │    │   │
│  │  │  - pdfService, csvService                        │    │   │
│  │  │  - logService, projectionService                 │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                        ↑                                   │   │
│  └────────────────────────┼────────────────────────────────┘   │
│                           │                                     │
│                    localStorage (per-user)                      │
└─────────────────────┬──────────────────────────────────────────┘
                      │ HTTPS
                      │
        ┌─────────────┴─────────────┬───────────────────┐
        │                           │                   │
┌──────▼──────────┐   ┌────────────▼──────────┐  ┌────▼──────────┐
│  Supabase Auth  │   │  Supabase Database    │  │ Google Gemini │
│  - OAuth2       │   │  - PostgreSQL         │  │ API           │
│  - Email/Pass   │   │  - Real-time Sync     │  │ - Chat        │
│  - Session      │   │  - Row-Level Security │  │ - Insights    │
└─────────────────┘   └───────────────────────┘  └───────────────┘
```

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.1 | UI library |
| TypeScript | ~5.8.2 | Type safety |
| Vite | 6.2.0 | Build tool |
| TailwindCSS | Latest | Styling |
| React Router DOM | 7.11.0 | Routing |
| Recharts | 3.5.1 | Charting |
| Lucide React | 0.556.0 | Icons |

### Backend

| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL database, Auth, Real-time |
| Google Gemini | AI-powered insights and chat |
| OpenAI-compatible API | Fallback AI provider |

### Development

| Tool | Purpose |
|------|---------|
| Vitest | Unit testing |
| React Testing Library | Component testing |
| JSDOM | DOM simulation |
| jsPDF | PDF generation |
| markdown-it | Markdown parsing |

## Component Architecture

### Component Hierarchy

```
App
├── Layout (mode: personal | crm)
│   ├── Sidebar
│   ├── TopBar
│   └── MainContent
│       ├── Dashboard
│       │   ├── DashboardWidget (various)
│       │   ├── AccountsOverview
│       │   └── RecentTransactions
│       ├── Accounts
│       ├── TransactionForm (Modal)
│       ├── TransactionList
│       │   └── TransactionCard (recurring, grouped)
│       ├── Budget
│       ├── Goals
│       ├── Investments
│       ├── Patrimony
│       ├── Reports
│       │   └── ReportFilters
│       ├── Insights
│       │   └── AIChat
│       ├── AdminCRM (admin-only)
│       └── Settings
├── AuthScreen (login/register)
├── PrivateRoute guard
└── AdminRoute guard
```

### Component Categories

#### Page Components
- **Dashboard**: Financial overview with widgets
- **Accounts**: Account management
- **TransactionList**: Transaction history with filters
- **Budget**: Budget planning and tracking
- **Goals**: Financial goals setup
- **Investments**: Investment portfolio
- **Patrimony**: Net worth tracking
- **Reports**: Financial reports and exports
- **Insights**: AI-powered financial insights
- **AdminCRM**: Admin impersonation and client management

#### UI Components (`src/components/ui/`)
- **Modal**: Generic modal dialog
- **Loading**: Loading spinner/skeleton
- **Card**: Card container
- **Button**: Button variants
- **Input**: Input fields
- **Select**: Dropdown select
- **Tabs**: Tabbed interface
- **Toast**: Notification system

#### Layout Components
- **Layout**: Main layout wrapper
- **Sidebar**: Navigation sidebar
- **TopBar**: Header bar

## State Management

### AuthContext

Manages user authentication and session:

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;

  // Methods
  signInWithGoogle(): Promise<void>;
  signInWithEmail(email, password): Promise<void>;
  registerWithEmail(email, password): Promise<void>;
  logout(): Promise<void>;
}
```

**Admin Detection:**
- Hardcoded `ADMIN_EMAILS` array in AuthContext
- Current admins: `nando062218@gmail.com`

### FinanceContext

Manages all financial data with localStorage sync:

```typescript
interface GlobalState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  investments: Investment[];
  patrimonyHistory: PatrimonyEntry[];
  dashboardLayout: DashboardLayout;

  // Metadata
  isSyncing: boolean;
  isInitialLoadComplete: boolean;
  isImpersonating: boolean;
}
```

**Key Features:**
- Per-user localStorage keys (prefixed with user ID)
- Supabase real-time sync (partially implemented)
- Admin impersonation support
- Transaction grouping for recurring/installment transactions

**Data Methods:**
```typescript
const {
  // State
  accounts, transactions, categories, budgets,
  goals, investments, patrimonyHistory,

  // Account operations
  addAccount, updateAccount, deleteAccount,

  // Transaction operations
  addTransaction, updateTransaction, deleteTransaction,
  deleteTransactionGroup, deleteTransactionGroupFromIndex,

  // Other operations
  addBudget, updateBudget, deleteBudget,
  addGoal, updateGoal, deleteGoal,
  // ... etc

  // Admin impersonation
  loadClientData, stopImpersonating,

  // Sync
  syncFinanceData
} = useFinance();
```

## Authentication & Security

### Authentication Flow

```
┌─────────────────────────────────────────┐
│         Authentication Methods          │
├─────────────────────────────────────────┤
│ • Google OAuth2                         │
│ • Email/Password Registration           │
│ • Email/Password Login                  │
│ • Email Confirmation                    │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│      Supabase Authentication            │
│  - Session Management                   │
│  - JWT Token Handling                   │
│  - Automatic Refresh                    │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│     Protected Routes & Components       │
│  - PrivateRoute Guard                   │
│  - AdminRoute Guard                     │
│  - useAuth() Hook                       │
└─────────────────────────────────────────┘
```

### Security Considerations

1. **API Keys**
   - Gemini API key exposed in Vite config (frontend-only)
   - Must be in `.env.local` and `.gitignore`
   - Consider backend proxy for production

2. **Admin Access**
   - Hardcoded email list in AuthContext
   - `/admin` route protected by AdminRoute guard
   - Update `ADMIN_EMAILS` for production

3. **Admin Impersonation**
   - Only accessible to admin users
   - Uses localStorage keys: `spfp_is_impersonating`, `spfp_impersonated_user_id`
   - Original admin state is preserved and restored

4. **User Data Isolation**
   - Data is separated per user via localStorage keys
   - Supabase row-level security (RLS) should enforce database-level isolation
   - Check `isImpersonating` before syncing authenticated user data

### Row-Level Security (RLS)

Supabase RLS policies should enforce:
- Users can only view their own transactions, accounts, budgets, etc.
- Admins can view client data when impersonating
- User metadata cannot be modified by other users

## AI Integration

### AI Service Architecture

```
┌──────────────────────────────┐
│      Components/UI           │
│  (Insights, Chat)            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│     aiService.ts             │
│  (Unified AI Interface)      │
├──────────────────────────────┤
│ • Message history            │
│ • System prompts             │
│ • Safety settings            │
│ • Provider abstraction       │
└──────────┬───────────────────┘
           │
    ┌──────┴──────────┐
    ▼                 ▼
┌─────────────┐  ┌──────────────┐
│   Gemini    │  │ OpenAI-like  │
│   API       │  │ Compatible   │
├─────────────┤  │ Endpoint     │
│ 1.5-flash   │  │              │
│ 2.0-flash   │  │ (Custom)     │
│ 1.5-pro     │  │              │
└─────────────┘  └──────────────┘
```

### Gemini Integration

**Models (with fallback chain):**
1. `gemini-2.0-flash-exp` - Latest
2. `gemini-1.5-flash` - Stable
3. `gemini-1.5-pro` - High quality

**Safety Settings:**
```typescript
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  // ... other categories
];
```

**Usage Pattern:**
```typescript
const response = await aiService.chat(
  messages,
  systemPrompt,
  preferredModel = 'gemini-1.5-flash'
);
```

### Chat History

**aiHistoryService.ts** persists conversations:
- Stores message history per user
- Allows resuming conversations
- Filters sensitive data before storage
- Integrates with Supabase for persistence

## Database Design

### Supabase Tables

```
┌──────────────────────────────────┐
│         auth.users               │
│  (Supabase Built-in)             │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│    public.user_profiles          │
│  - id (UUID, FK to auth.users)   │
│  - display_name                  │
│  - avatar_url                    │
│  - created_at                    │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│    public.accounts               │
│  - id (UUID, PK)                 │
│  - user_id (FK)                  │
│  - name                          │
│  - type (checking, savings, etc) │
│  - balance                       │
│  - currency                      │
│  - created_at, updated_at        │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│    public.transactions           │
│  - id (UUID, PK)                 │
│  - user_id (FK)                  │
│  - account_id (FK)               │
│  - category                      │
│  - amount                        │
│  - type (income, expense)        │
│  - description                   │
│  - date                          │
│  - groupId (for recurring)       │
│  - recurrence (if recurring)     │
│  - created_at, updated_at        │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│    public.budgets                │
│  - id (UUID, PK)                 │
│  - user_id (FK)                  │
│  - category                      │
│  - limit                         │
│  - month                         │
│  - created_at, updated_at        │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│    public.goals                  │
│  - id (UUID, PK)                 │
│  - user_id (FK)                  │
│  - title                         │
│  - target_amount                 │
│  - current_amount                │
│  - deadline                      │
│  - status                        │
│  - created_at, updated_at        │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│    public.investments            │
│  - id (UUID, PK)                 │
│  - user_id (FK)                  │
│  - ticker                        │
│  - shares                        │
│  - purchase_price                │
│  - current_price                 │
│  - notes                         │
│  - created_at, updated_at        │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│    public.ai_chat_history        │
│  - id (UUID, PK)                 │
│  - user_id (FK)                  │
│  - message                       │
│  - role (user, assistant)        │
│  - created_at                    │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│    public.user_activity_logs     │
│  - id (UUID, PK)                 │
│  - user_id (FK)                  │
│  - action                        │
│  - metadata                      │
│  - created_at                    │
└──────────────────────────────────┘
```

### Key Relationships

```
User (auth.users)
├── Accounts (1:N)
│   └── Transactions (1:N)
├── Budgets (1:N)
├── Goals (1:N)
├── Investments (1:N)
├── AI Chat History (1:N)
└── Activity Logs (1:N)
```

## Data Flow

### Transaction Flow Example

```
User Input
    ↓
TransactionForm Component
    ↓
handleAddTransaction() in FinanceContext
    ↓
Validate Data
    ↓
Add to Local State
    ↓
Sync to Supabase
    ↓
Update localStorage
    ↓
Real-time Listeners Trigger
    ↓
TransactionList Re-renders
```

### AI Insight Flow

```
User Message
    ↓
Insights Component
    ↓
aiService.chat()
    ↓
Load User Context (finances, history)
    ↓
Call Gemini API
    ↓
Stream Response
    ↓
Display in Chat UI
    ↓
Save to Chat History
```

## Deployment Architecture

### Development Environment

```
Local Machine
├── npm run dev
├── Vite Dev Server (localhost:3000)
├── .env.local (local config)
└── SQLite (if using locally)
```

### Staging Environment

```
Cloud Server
├── Docker Container
├── Node.js / Vite Build
├── Reverse Proxy (Nginx)
├── SSL/TLS Certificates
├── Environment Variables (secrets)
└── Connected to Staging Supabase
```

### Production Environment

```
CDN / Cloud Hosting
├── Static Build Output (dist/)
├── Global CDN Distribution
├── Cache Headers
├── Compression
├── Connected to Production Supabase
└── Environment Secrets Management
```

### CI/CD Pipeline

```
Code Push to GitHub
    ↓
GitHub Actions Triggered
    ├── Lint Check (TypeScript)
    ├── Unit Tests (Vitest)
    ├── Build Verification
    └── Security Scan (npm audit)
    ↓
If All Pass: PR Available for Merge
    ↓
Code Review + Approval
    ↓
Merge to Main
    ↓
Deploy to Production (automatic or manual)
```

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**: Route-based code splitting via React Router
2. **Lazy Loading**: Images and heavy components
3. **Memoization**: Use React.memo for expensive components
4. **State Management**: Context API with proper boundaries
5. **Bundle Size**: Monitor with build analysis

### Database Optimization

1. **Indexes**: Create indexes on frequently queried columns
2. **Pagination**: Implement pagination for large result sets
3. **Real-time Sync**: Limit subscriptions to relevant data
4. **Caching**: Client-side caching via localStorage and context

### API Optimization

1. **Request Batching**: Combine multiple requests when possible
2. **Response Caching**: Cache API responses appropriately
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Error Recovery**: Graceful fallbacks for API failures

## Future Improvements

1. **Real-time Sync**: Complete Supabase real-time implementation for all data types
2. **Offline Support**: Service workers for offline functionality
3. **Mobile App**: React Native for iOS/Android
4. **Advanced Analytics**: More sophisticated financial projections
5. **Multi-currency**: Support for multiple currency types
6. **Collaboration**: Share financial data with partners/advisors
7. **API**: Public API for third-party integrations
8. **Webhooks**: Event-driven integrations

---

For implementation details and quick reference, see [CLAUDE.md](./CLAUDE.md).
