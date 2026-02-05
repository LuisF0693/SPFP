# SPFP FASE 1 - DETAILED COMPONENT SPECIFICATIONS

**Designer:** Luna
**Focus:** Implementation-ready component specifications
**Date:** Fevereiro 2026

---

## TABLE OF CONTENTS

1. [SIDEBAR COMPONENTS](#sidebar-components)
2. [CREDIT CARD COMPONENTS](#credit-card-components)
3. [RETIREMENT COMPONENTS](#retirement-components)
4. [REUSABLE PATTERNS](#reusable-patterns)

---

## SIDEBAR COMPONENTS

### SidebarSection (Container)

**File:** `src/components/ui/SidebarSection.tsx`

**Purpose:** Base wrapper for collapsible sections

```typescript
interface SidebarSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  children: React.ReactNode;
  badge?: string | number;
  maxHeight?: string;
  variant?: 'default' | 'compact';
}
```

**Default State on Breakpoints:**

```
Desktop (≥768px): isExpanded = true
Mobile (<768px): isExpanded = false
```

**CSS Classes:**

```tailwind
// Container
"w-full py-3 px-4 border-b border-white/10 dark:border-white/5"

// Header (button)
"flex items-center justify-between cursor-pointer"
"hover:bg-white/5 dark:hover:bg-white/10 rounded-lg"
"transition-colors duration-200 py-2 px-2"
"group"

// Title text
"text-sm font-semibold text-slate-900 dark:text-white"
"group-hover:text-primary-500"

// Chevron icon
"text-slate-500 dark:text-slate-400"
"group-hover:text-primary-500"
"transition-transform duration-300"
"group-open:rotate-180"  /* or use state to manage */

// Content wrapper
"max-h-0 overflow-hidden transition-all duration-300"
"group-open:max-h-[1000px]"  /* Adjust height based on content */

// Content inner
"py-2 space-y-2"
```

**Event Handlers:**

```typescript
// On header click, toggle expanded state
const handleToggle = (e: React.MouseEvent) => {
  e.stopPropagation();
  onToggle?.(!isExpanded);
  // Log analytics (optional - STY-057)
};
```

**Accessibility:**

```html
<button
  onClick={handleToggle}
  aria-expanded={isExpanded}
  aria-controls={`${id}-content`}
  aria-label={`Expandir seção ${title}`}
>
  {icon}
  <span>{title}</span>
  <ChevronDown className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
</button>

<div id={`${id}-content`} role="region" aria-label={title}>
  {children}
</div>
```

---

### SidebarBudgetSection

**File:** `src/components/sidebar/SidebarBudgetSection.tsx`

**Purpose:** Display top 3 budget categories with progress

```typescript
interface Budget {
  category: string;
  icon: string;
  spent: number;
  limit: number;
}

interface SidebarBudgetSectionProps {
  budgets: Budget[];
  onCategoryClick?: (category: string) => void;
}
```

**Progress Bar Logic:**

```typescript
const getProgressColor = (percentage: number) => {
  if (percentage < 50) return 'bg-emerald-500';
  if (percentage < 80) return 'bg-amber-500';
  return 'bg-rose-500';
};

const getProgressClass = (percentage: number) => {
  return `w-[${percentage}%]`;  // TailwindCSS dynamic
};
```

**Item Template:**

```html
<div class="flex items-center justify-between py-3 px-2 hover:bg-white/5 rounded">
  <!-- Left: Icon + Name + Values -->
  <div class="flex items-center gap-2 flex-1">
    <span class="text-lg">{icon}</span>
    <div class="min-w-0">
      <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
        {category}
      </p>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        R$ {spent.toLocaleString()} / R$ {limit.toLocaleString()}
      </p>
    </div>
  </div>

  <!-- Right: Progress Bar -->
  <div class="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ml-2">
    <div
      class={`h-full ${getProgressColor(percentage)} transition-all duration-300`}
      style={{ width: `${Math.min(percentage, 100)}%` }}
    />
  </div>
</div>
```

**Click Handler:**

```typescript
// Click category → Navigate to /budget?category=alimentacao
const handleCategoryClick = (category: string) => {
  navigate(`/budget?category=${category.toLowerCase()}`);
  // Analytics: Track sidebar category click (STY-057)
};
```

**Data Source:**

```typescript
// In parent Sidebar component:
const { budgets } = useFinance();

// Filter and sort by current month spending
const topBudgets = useMemo(() => {
  return budgets
    .slice()
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);
}, [budgets]);
```

---

### SidebarAccountsSection

**File:** `src/components/sidebar/SidebarAccountsSection.tsx`

```typescript
interface Account {
  id: string;
  name: string;
  type: 'corrente' | 'poupanca' | 'investimento';
  bank: string;
  balance: number;
}

interface SidebarAccountsSectionProps {
  accounts: Account[];
  onAccountClick?: (accountId: string) => void;
  onAddClick?: () => void;
}
```

**Account Item Template:**

```html
<button
  class="w-full flex items-center gap-3 py-2 px-2 rounded hover:bg-primary-500/10 transition-colors"
  onClick={() => onAccountClick(account.id)}
>
  <!-- Bank Logo (component: BankLogo) -->
  <BankLogo bank={account.bank} size="sm" />

  <!-- Account Info -->
  <div class="flex-1 min-w-0 text-left">
    <p class="text-sm font-medium text-slate-900 dark:text-white truncate">
      {account.name}
    </p>
    <p class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
      R$ {account.balance.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </p>
  </div>
</button>
```

**Add Account Button:**

```html
<button
  class="w-full flex items-center justify-center gap-2 py-2 px-2 rounded
         text-primary-500 hover:bg-primary-500/10 transition-colors"
  onClick={onAddClick}
>
  <PlusCircle size={16} />
  <span class="text-xs font-medium">Adicionar Nova</span>
</button>
```

**Scrollable Container (if 8+ accounts):**

```tailwind
// Wrapper
"max-h-48 overflow-y-auto"
"[&::-webkit-scrollbar]:w-1"
"[&::-webkit-scrollbar-track]:bg-transparent"
"[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:bg-slate-600"
"[&::-webkit-scrollbar-thumb]:rounded-full"
```

---

### SidebarTransactionsSection

**File:** `src/components/sidebar/SidebarTransactionsSection.tsx`

```typescript
interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  confirmed: boolean;
  date: Date;
}

interface SidebarTransactionsSectionProps {
  transactions: Transaction[];
  onConfirm?: (transactionId: string) => Promise<void>;
  onItemClick?: (transactionId: string) => void;
}
```

**Transaction Item Template:**

```html
<div class="flex items-center justify-between gap-2 py-2 px-2 hover:bg-white/5 rounded group">
  <!-- Left: Category + Description + Status -->
  <div class="flex-1 min-w-0">
    <p class="text-sm text-slate-900 dark:text-white truncate">
      {description}
    </p>
    <div class="flex items-center gap-2 mt-1">
      <span class="text-xs text-slate-500 dark:text-slate-400">
        {formatDate(date, 'pt-BR')}
      </span>
      <span class={`text-xs px-2 py-0.5 rounded-full font-medium
        ${confirmed
          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
        }
      `}>
        {confirmed ? 'Confirmado' : 'Pendente'}
      </span>
    </div>
  </div>

  <!-- Right: Amount -->
  <p class="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
    R$ {Math.abs(amount).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}
  </p>

  <!-- Quick Action: Confirm Button (appears on hover) -->
  {!confirmed && (
    <button
      class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-emerald-500/20 rounded"
      title="Confirmar transação"
      onClick={() => onConfirm?.(id)}
    >
      <Check size={16} class="text-emerald-500" />
    </button>
  )}
</div>
```

**Data Filtering:**

```typescript
const unconfirmedTransactions = useMemo(() => {
  return transactions
    .filter(t => !t.confirmed && new Date(t.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // Show only 5
}, [transactions]);
```

---

### SidebarInstallmentsSection

**File:** `src/components/sidebar/SidebarInstallmentsSection.tsx`

```typescript
interface Installment {
  groupId: string;
  name: string;
  current: number;
  total: number;
  monthlyAmount: number;
  nextDueDate: Date;
}

interface SidebarInstallmentsSectionProps {
  installments: Installment[];
}
```

**Progress Color by Percentage:**

```typescript
const getProgressPercentage = (current: number, total: number) => {
  return (current / total) * 100;
};

const getInstallmentColor = (percentage: number) => {
  if (percentage <= 33) return 'bg-blue-500/20 border-blue-500';
  if (percentage <= 66) return 'bg-emerald-500/20 border-emerald-500';
  return 'bg-amber-500/20 border-amber-500';
};
```

**Installment Item Template:**

```html
<div class={`flex items-center justify-between py-2 px-2 rounded border ${getInstallmentColor(percentage)}`}>
  <!-- Left: Name + Progress -->
  <div class="flex-1">
    <p class="text-sm font-medium text-slate-900 dark:text-white">
      {name}
    </p>
    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
      [{current}/{total}] • R$ {monthlyAmount.toLocaleString('pt-BR')}
    </p>
  </div>

  <!-- Right: Mini Progress Bar -->
  <div class="w-16 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full overflow-hidden">
    <div
      class={`h-full transition-all duration-300 ${getColorFromPercentage(percentage)}`}
      style={{ width: `${percentage}%` }}
    />
  </div>
</div>
```

---

### SidebarDrawer (Mobile)

**File:** `src/components/ui/SidebarDrawer.tsx`

**Purpose:** Mobile drawer navigation (appears on < 768px)

```typescript
interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
```

**Implementation:**

```html
<!-- Backdrop -->
<Transition show={isOpen}>
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
    onClick={onClose}
    aria-hidden="true"
  />
</Transition>

<!-- Drawer Panel -->
<Transition show={isOpen}>
  <div
    class="fixed top-0 left-0 bottom-0 w-[85vw] max-w-xs
           bg-white dark:bg-slate-900
           shadow-xl z-50
           transform transition-transform duration-300"
    style={{
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    }}
  >
    <!-- Close Button -->
    <button
      class="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
      onClick={onClose}
      aria-label="Fechar menu"
    >
      <X size={24} />
    </button>

    <!-- Drawer Content (Sidebar sections) -->
    <div class="overflow-y-auto h-full pt-16 pb-4">
      {children}
    </div>
  </div>
</Transition>
```

**Animation:**

```css
transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
transform: translateX(-100%); /* Hidden */
transform: translateX(0);     /* Visible */
```

---

## CREDIT CARD COMPONENTS

### CreditCardDisplay (Container)

**File:** `src/components/creditcard/CreditCardDisplay.tsx`

```typescript
interface CardData {
  id: string;
  number: string;          // "1234" (last 4)
  cardholder: string;      // "FERNANDO SILVA"
  expiryDate: string;      // "02/27"
  cvv: string;             // Hidden
  bank: 'nubank' | 'bradesco' | 'itau' | 'caixa' | 'bb';
  person: 'A' | 'B' | 'shared';
  status: 'active' | 'blocked' | 'expired';
  isMainCard?: boolean;
}

interface CreditCardDisplayProps {
  card: CardData;
  cards?: CardData[]; // For carousel
  onReveal?: (cardId: string) => void;
  fullNumber?: string; // If already fetched
}
```

**Gradient by Bank:**

```typescript
const getBankGradient = (bank: string): string => {
  const gradients: Record<string, string> = {
    nubank: 'from-purple-600 to-purple-900',
    bradesco: 'from-blue-700 to-blue-900',
    itau: 'from-gray-700 to-gray-900',
    caixa: 'from-emerald-700 to-emerald-900',
    bb: 'from-blue-900 to-slate-900',
  };
  return gradients[bank] || gradients.itau;
};

const getPersonColor = (person: string): string => {
  if (person === 'A') return 'from-blue-700 to-blue-900';
  if (person === 'B') return 'from-pink-700 to-pink-900';
  return 'from-gray-700 to-gray-900';
};
```

**Container Structure:**

```html
<div
  class="relative w-full max-w-[480px] mx-auto"
  style={{ perspective: '1000px' }}
>
  <!-- Card Container with 3D perspective -->
  <CardContainer isHovered={isHovered}>
    <!-- Card Face -->
    <CardFace
      gradient={getPersonColor(card.person)}
      status={card.status}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card content */}
    </CardFace>
  </CardContainer>

  <!-- Reveal Toggle -->
  <CardRevealToggle
    isRevealed={isRevealed}
    onToggle={() => setIsRevealed(!isRevealed)}
  />

  <!-- Carousel Dots (if multiple) -->
  {cards && cards.length > 1 && (
    <CardCarouselIndicators
      total={cards.length}
      current={currentIndex}
      onSelect={setCurrentIndex}
    />
  )}
</div>
```

---

### CardFace

**File:** `src/components/creditcard/CardFace.tsx`

**Styling:**

```tailwind
// Container
"w-full h-[300px] rounded-2xl shadow-2xl"
"border border-white/20"
"relative overflow-hidden"
"transition-all duration-300"

// Gradient background
"bg-gradient-to-br {gradient}"

// Inner glow effect
"before:absolute before:inset-0"
"before:bg-gradient-to-br before:from-white/10 before:to-transparent"
"before:pointer-events-none"
```

**3D Transform on Hover:**

```typescript
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const rotateX = (y / rect.height - 0.5) * 15;
  const rotateY = (x / rect.width - 0.5) * -15;

  e.currentTarget.style.transform = `
    perspective(1000px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
    scale(1.05)
  `;
};

const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.transform = 'none';
};
```

**Card Content Grid:**

```html
<div class="h-full flex flex-col justify-between p-6 text-white relative z-10">
  <!-- Header: Bank info + icon -->
  <div class="flex justify-between items-start">
    <div>
      <p class="text-xs font-bold tracking-widest opacity-80">
        {bank.toUpperCase()}
      </p>
      <p class="text-[10px] tracking-[0.3em] opacity-60 mt-1">PREMIUM</p>
    </div>
    <BankIcon bank={bank} size={48} />
  </div>

  <!-- Middle: Card number (spacer) -->
  <div>
    <CardNumberDisplay
      isRevealed={isRevealed}
      number={number}
      fullNumber={fullNumber}
    />
  </div>

  <!-- Footer: Cardholder + Expiry -->
  <div class="flex justify-between items-end">
    <div>
      <p class="text-[8px] tracking-wider opacity-70 uppercase">TITULAR</p>
      <p class="text-sm font-bold tracking-wide mt-0.5">
        {cardholder}
      </p>
      <p class="text-[10px] opacity-60 mt-1">({personLabel})</p>
    </div>

    <div class="text-right">
      <p class="text-[8px] tracking-wider opacity-70 uppercase">VÁLIDO ATÉ</p>
      <p class="text-lg font-bold tracking-wider mt-0.5">
        {expiryDate}
      </p>
      <div class="mt-2 h-6 w-10 bg-white/20 rounded flex items-center justify-center">
        <p class="text-[6px] font-bold text-white">VISA</p>
      </div>
    </div>
  </div>
</div>
```

---

### CardNumberDisplay

**File:** `src/components/creditcard/CardNumberDisplay.tsx`

```typescript
interface CardNumberDisplayProps {
  isRevealed: boolean;
  number: string;        // "1234" (last 4)
  fullNumber?: string;   // "1234567890123456"
}
```

**Implementation:**

```html
<div class="space-y-3">
  <p class="text-[10px] tracking-wider opacity-70">NÚMERO DO CARTÃO</p>

  <div
    class="text-2xl font-mono font-bold tracking-[0.15em]
           transition-all duration-300"
    style={{
      opacity: isRevealing ? 0.7 : 1,
      filter: isRevealing ? 'blur(2px)' : 'blur(0)',
    }}
  >
    {isRevealed && fullNumber
      ? `${fullNumber.slice(0, 4)} ${fullNumber.slice(4, 8)} ${fullNumber.slice(8, 12)} ${fullNumber.slice(12, 16)}`
      : `•••• •••• •••• ${number}`
    }
  </div>
</div>
```

---

### CardRevealToggle

**File:** `src/components/creditcard/CardRevealToggle.tsx`

```html
<div class="flex items-center justify-center gap-2 mt-6">
  <input
    type="checkbox"
    id={`reveal-${cardId}`}
    checked={isRevealed}
    onChange={() => onToggle?.(!isRevealed)}
    class="w-5 h-5 rounded border-2 border-primary-500
           cursor-pointer accent-primary-500"
  />
  <label
    htmlFor={`reveal-${cardId}`}
    class="text-sm text-slate-600 dark:text-slate-300 cursor-pointer
           hover:text-slate-900 dark:hover:text-white transition-colors"
  >
    {isRevealed ? '☑️' : '☐'} Mostrar número completo
  </label>
</div>

<!-- Warning when revealed -->
{isRevealed && (
  <p class="text-xs text-rose-500 dark:text-rose-400 mt-2 text-center">
    ⚠️ Não compartilhe este número
  </p>
)}
```

---

### CardStateOverlay

**File:** `src/components/creditcard/CardStateOverlay.tsx`

**For blocked/expired cards:**

```html
<!-- Overlay -->
<div
  class={`absolute inset-0 rounded-2xl z-20
         ${status === 'blocked'
           ? 'bg-rose-500/20 border-2 border-rose-500'
           : 'bg-amber-500/20 border-2 border-amber-500'
         }
         opacity-0 hover:opacity-100 transition-opacity duration-200
         flex items-center justify-center`}
>
  <div class="text-center">
    {status === 'blocked' && (
      <>
        <p class="text-2xl">🔒</p>
        <p class="text-sm font-bold text-rose-600 dark:text-rose-400 mt-2">
          BLOQUEADO
        </p>
      </>
    )}
    {status === 'expired' && (
      <>
        <p class="text-2xl">⚠️</p>
        <p class="text-sm font-bold text-amber-600 dark:text-amber-400 mt-2">
          EXPIRADO
        </p>
        <p class="text-xs text-amber-500 dark:text-amber-300 mt-1">
          Renove seu cartão
        </p>
      </>
    )}
  </div>
</div>

<!-- Also adjust card opacity -->
{(status === 'blocked' || status === 'expired') && (
  <div class="absolute inset-0 rounded-2xl bg-black/30 z-10" />
)}
```

---

## RETIREMENT COMPONENTS

### RetirementDashPlanChart

**File:** `src/components/retirement/RetirementDashPlanChart.tsx`

```typescript
interface ProjectionData {
  year: number;
  age: number;
  conservador: number;
  moderado: number;
  agressivo: number;
}

interface RetirementDashPlanChartProps {
  data: ProjectionData[];
  targetYear: number;
  targetAmount: number;
  selectedScenario?: 'conservador' | 'moderado' | 'agressivo';
}
```

**Recharts Implementation:**

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

export const RetirementDashPlanChart: React.FC<RetirementDashPlanChartProps> = ({
  data,
  targetYear,
  targetAmount,
  selectedScenario = 'moderado',
}) => {
  const getScenarioOpacity = (scenario: string) => {
    return selectedScenario === scenario ? 1 : 0.4;
  };

  const getScenarioStroke = (scenario: string) => {
    return selectedScenario === scenario ? 4 : 2;
  };

  return (
    <LineChart data={data} width="100%" height={400} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
      <defs>
        <linearGradient id="colorConservador" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorModerado" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorAgressivo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
        </linearGradient>
      </defs>

      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />

      <XAxis
        dataKey="year"
        label={{ value: 'Anos de investimento', position: 'bottom', offset: 10 }}
        tick={{ fontSize: 12 }}
      />

      <YAxis
        label={{ value: 'Patrimônio (R$)', angle: -90, position: 'insideLeft' }}
        tick={{ fontSize: 12 }}
        tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
      />

      <Tooltip
        formatter={(value) => `R$ ${(value as number).toLocaleString('pt-BR')}`}
        contentStyle={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
        }}
      />

      <Legend />

      {/* Reference line for target date */}
      <ReferenceLine
        x={targetYear}
        stroke="#f43f5e"
        strokeDasharray="5 5"
        label={{ value: `Target: Ano ${targetYear}`, position: 'top' }}
        opacity={0.6}
      />

      {/* Lines for each scenario */}
      <Line
        type="monotone"
        dataKey="conservador"
        stroke="#f59e0b"
        strokeWidth={getScenarioStroke('conservador')}
        opacity={getScenarioOpacity('conservador')}
        fill="url(#colorConservador)"
        dot={false}
        isAnimationActive={true}
        animationDuration={800}
      />

      <Line
        type="monotone"
        dataKey="moderado"
        stroke="#3b82f6"
        strokeWidth={getScenarioStroke('moderado')}
        opacity={getScenarioOpacity('moderado')}
        fill="url(#colorModerado)"
        dot={false}
        isAnimationActive={true}
        animationDuration={800}
        animationDelay={100}
      />

      <Line
        type="monotone"
        dataKey="agressivo"
        stroke="#10b981"
        strokeWidth={getScenarioStroke('agressivo')}
        opacity={getScenarioOpacity('agressivo')}
        fill="url(#colorAgressivo)"
        dot={false}
        isAnimationActive={true}
        animationDuration={800}
        animationDelay={200}
      />
    </LineChart>
  );
};
```

---

### RetirementScenarioCards

**File:** `src/components/retirement/RetirementScenarioCards.tsx`

```typescript
interface ScenarioCardData {
  scenario: 'conservador' | 'moderado' | 'agressivo';
  patrimonioFinal: number;
  rendaAnual: number;
  tempoAteMeta: number;
  taxaRetorno: number;
  isRecommended?: boolean;
}

interface RetirementScenarioCardsProps {
  scenarios: ScenarioCardData[];
  selectedScenario?: string;
  onSelectScenario?: (scenario: string) => void;
}
```

**Card Template:**

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  {scenarios.map((scenario) => (
    <button
      key={scenario.scenario}
      onClick={() => onSelectScenario?.(scenario.scenario)}
      class={`relative p-6 rounded-lg border-2 transition-all duration-300
             ${selectedScenario === scenario.scenario
               ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
               : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
             }
            ${
              scenario.scenario === 'conservador'
                ? 'bg-amber-50 dark:bg-amber-900/10'
                : scenario.scenario === 'moderado'
                  ? 'bg-blue-50 dark:bg-blue-900/10'
                  : 'bg-emerald-50 dark:bg-emerald-900/10'
            }`}
    >
      {/* Recommended badge */}
      {scenario.isRecommended && (
        <div class="absolute top-4 right-4 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400
                    border border-emerald-500 rounded-full px-3 py-1 text-xs font-semibold">
          ✓ RECOMENDADO
        </div>
      )}

      {/* Title */}
      <div class="text-left mb-6">
        <p class="text-xl font-bold text-slate-900 dark:text-white">
          {scenario.scenario === 'conservador'
            ? '📊 Conservador'
            : scenario.scenario === 'moderado'
              ? '⚖️ Moderado'
              : '📈 Agressivo'}
        </p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {scenario.scenario === 'conservador'
            ? '3% retorno anual'
            : scenario.scenario === 'moderado'
              ? '5% retorno anual'
              : '7% retorno anual'}
        </p>
      </div>

      {/* Metrics */}
      <div class="space-y-4 text-left">
        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Patrimônio após 20 anos
          </p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            R$ {(scenario.patrimonioFinal / 1000000).toFixed(1)}M
          </p>
        </div>

        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Renda anual estimada
          </p>
          <p class="text-lg font-semibold text-slate-900 dark:text-white mt-1">
            R$ {scenario.rendaAnual.toLocaleString('pt-BR')}
          </p>
        </div>

        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Tempo até meta
          </p>
          <p class="text-lg font-semibold text-slate-900 dark:text-white mt-1">
            {scenario.tempoAteMeta} anos ({40 + scenario.tempoAteMeta} anos)
          </p>
        </div>

        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Taxa média de retorno
          </p>
          <p class="text-lg font-semibold text-slate-900 dark:text-white mt-1">
            {scenario.taxaRetorno}% a.a.
          </p>
        </div>
      </div>

      {/* Button */}
      <button class="w-full mt-6 py-3 rounded-lg font-semibold transition-all
                    bg-primary-500 text-white hover:bg-primary-600
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
        Selecionar este cenário
      </button>
    </button>
  ))}
</div>
```

---

### RetirementMilestones

**File:** `src/components/retirement/RetirementMilestones.tsx`

**Progress Bar Animation:**

```html
<div class="space-y-4">
  <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
    Próximos Milestones
  </h3>

  {milestones.map((milestone, index) => (
    <div key={milestone.label}>
      {/* Milestone Info */}
      <div class="flex justify-between items-start mb-2">
        <div>
          <p class="text-sm font-medium text-slate-900 dark:text-white">
            📌 {milestone.label}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {milestone.year} anos • R$ {(milestone.value / 1000000).toFixed(1)}M
          </p>
        </div>
        <span class="text-sm font-bold text-slate-600 dark:text-slate-300">
          {milestone.percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div
        class={`w-full h-2 rounded-full overflow-hidden
               ${
                 milestone.percentage === 100
                   ? 'bg-emerald-200 dark:bg-emerald-900/40'
                   : milestone.percentage >= 75
                     ? 'bg-blue-200 dark:bg-blue-900/40'
                     : 'bg-slate-200 dark:bg-slate-700'
               }`}
      >
        <div
          class={`h-full transition-all duration-500 ease-out
                 ${
                   milestone.percentage === 100
                     ? 'bg-emerald-500'
                     : milestone.percentage >= 75
                       ? 'bg-blue-500'
                       : 'bg-gray-500'
                 }`}
          style={{
            width: `${milestone.percentage}%`,
            animation: `fillProgress 0.6s ease-out ${index * 0.2}s both`,
          }}
        />
      </div>
    </div>
  ))}
</div>

<style>{`
  @keyframes fillProgress {
    from {
      width: 0;
    }
    to {
      width: var(--w);
    }
  }
`}</style>
```

---

## REUSABLE PATTERNS

### Progress Bar Component

**File:** `src/components/ui/ProgressBar.tsx`

```typescript
interface ProgressBarProps {
  percentage: number; // 0-100
  color?: 'success' | 'warning' | 'error' | 'info' | 'custom';
  customColor?: string;
  showLabel?: boolean;
  animated?: boolean;
  height?: 'sm' | 'md' | 'lg';
}
```

**Implementation:**

```tsx
const getColorClass = (color: string, percentage: number) => {
  if (color === 'custom') return '';

  if (percentage < 50) return 'bg-emerald-500';
  if (percentage < 80) return 'bg-amber-500';
  return 'bg-rose-500';
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = 'success',
  customColor,
  showLabel = false,
  animated = true,
  height = 'md',
}) => {
  const heightClass = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }[height];

  return (
    <div class={`w-full ${heightClass} bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden`}>
      <div
        class={`h-full ${getColorClass(color, percentage)} ${animated ? 'transition-all duration-300' : ''}`}
        style={{
          width: `${Math.min(percentage, 100)}%`,
          backgroundColor: customColor,
        }}
      />
      {showLabel && (
        <span class="absolute right-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          {percentage}%
        </span>
      )}
    </div>
  );
};
```

---

### Status Badge Component

**File:** `src/components/ui/StatusBadge.tsx`

```typescript
type Status = 'active' | 'pending' | 'confirmed' | 'blocked' | 'expired';

interface StatusBadgeProps {
  status: Status;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

**Implementation:**

```tsx
const statusStyles: Record<Status, { bg: string; text: string; icon: string }> = {
  active: { bg: 'bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: '✓' },
  pending: { bg: 'bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: '⏱' },
  confirmed: { bg: 'bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', icon: '✓' },
  blocked: { bg: 'bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', icon: '🔒' },
  expired: { bg: 'bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: '⚠️' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const style = statusStyles[status];
  const sizeClass = { sm: 'text-xs px-2 py-1', md: 'text-sm px-3 py-1.5', lg: 'text-base px-4 py-2' }[size];

  return (
    <span class={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClass} ${style.bg} ${style.text}`}>
      <span>{style.icon}</span>
      <span>{label || status}</span>
    </span>
  );
};
```

---

**End of Component Specifications**

**Prepared by:** Luna
**Date:** Fevereiro 2026
**Status:** READY FOR DEVELOPMENT

