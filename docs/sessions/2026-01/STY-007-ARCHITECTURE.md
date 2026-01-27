# STY-007: Error Recovery Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Components                      │
│  (Dashboard, Insights, TransactionForm, Reports, etc.)          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
         ┌─────────────┴────────────┐
         │                          │
    ┌────▼─────────────┐    ┌──────▼──────────────┐
    │  AI Service      │    │ Finance Context     │
    │  (aiService.ts)  │    │ (FinanceContext.tsx)│
    └────┬─────────────┘    └──────┬──────────────┘
         │                         │
    ┌────▼─────────────┐    ┌──────▼──────────────┐
    │ Gemini API       │    │ Supabase            │
    │ OpenAI API       │    │ (PostgreSQL)        │
    └──────────────────┘    └─────────────────────┘

         ┌────────────────────────────────────────┐
         │   retryService.ts                      │
         │   (Exponential Backoff & Retry Logic)  │
         │                                        │
         │   • retryWithBackoff()                 │
         │   • detectErrorType()                  │
         │   • isRetryable()                      │
         │   • calculateBackoffDelay()            │
         │   • logDetailedError()                 │
         │   • getErrorMessage()                  │
         └────────────────────────────────────────┘
              ▲              ▲              ▲
              │              │              │
         ┌────┴────┐    ┌────┴────┐    ┌───┴─────┐
         │ AI      │    │ Market   │    │ PDF     │
         │ Service │    │ Data     │    │ Service │
         └─────────┘    │ Service  │    └─────────┘
                        └──────────┘
```

## Retry Flow Diagram

```
API Call
   │
   ▼
┌─────────────────────┐
│  retryWithBackoff() │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐      ┌─────────────────┐
│  Execute Operation  │─────▶│  Timeout Timer  │
└─────────────────────┘      └─────────────────┘
   │
   ├─ Success? ─────▶ Return Result
   │
   └─ Error? ──────┐
                    │
                    ▼
         ┌─────────────────────────┐
         │ detectErrorType()        │
         │ • NETWORK?              │
         │ • TIMEOUT?              │
         │ • RATE_LIMIT?           │
         │ • 404/401/400?          │
         │ • UNKNOWN?              │
         └─────────────────────────┘
                    │
                    ▼
         ┌─────────────────────────┐
         │ isRetryable()?          │
         └─────────────────────────┘
              │               │
         YES  │               │  NO
             ▼               ▼
      ┌────────────┐   ┌─────────────┐
      │ Backoff?   │   │ Fail Fast   │
      │ < maxRetry?│   │ Throw Error │
      └────────────┘   └─────────────┘
          │   │
      YES │   │ NO
         ▼   ▼
      ┌─────────────┐   ┌──────────────┐
      │ Calculate   │   │ Max Retries  │
      │ Delay       │   │ Exceeded     │
      │ + Jitter    │   │ Throw Error  │
      └─────────────┘   └──────────────┘
          │
          ▼
      ┌─────────────────────┐
      │ Wait (delay ms)     │
      └─────────────────────┘
          │
          ▼
      ┌─────────────────────┐
      │ Retry Operation     │
      │ (goto "Execute")    │
      └─────────────────────┘
```

## Error Type Detection Flow

```
Error Received
    │
    ▼
┌──────────────────────────┐
│ Check error.message      │
├──────────────────────────┤
│ "Failed to fetch"?       │──▶ NETWORK
│ "ECONNREFUSED"?          │──▶ NETWORK
│ "timeout"?               │──▶ TIMEOUT
│ "429"?                   │──▶ RATE_LIMIT
│ "404"?                   │──▶ NOT_FOUND
│ "401" / "403"?           │──▶ UNAUTHORIZED
│ "400"?                   │──▶ VALIDATION
│ status code?             │──▶ Check status
└──────────────────────────┘
    │
    ▼
Return ErrorType Enum
```

## Exponential Backoff Calculation

```
Formula: delay = min(
  initialDelay * multiplier^(attempt-1) + jitter,
  maxDelay
)

Example with defaults:
- initialDelayMs: 1000
- backoffMultiplier: 2
- maxDelayMs: 10000
- jitterFactor: 0.1

Attempt 1: 1000ms
Attempt 2: 2000ms (±100ms jitter)
Attempt 3: 4000ms (±400ms jitter)
Attempt 4: 8000ms (±800ms jitter)
Attempt 5: 10000ms (capped) (±1000ms jitter)

Visual:
Attempt │ Delay (ms) │ Backoff │ Cumulative
────────┼────────────┼─────────┼────────────
   1    │ Immediate  │ 0       │ 0
   2    │ 2000       │ 2000    │ 2000
   3    │ 4000       │ 4000    │ 6000
   4    │ 8000       │ 8000    │ 14000
   5    │ 10000      │ 10000   │ 24000 (total wait time)
```

## Service Integration Points

### AI Service (aiService.ts)

```
chatWithAI()
    │
    ├─ Provider = "google"?
    │       │
    │       └─▶ handleGoogleGemini()
    │           │
    │           └─▶ For each model:
    │               │
    │               └─▶ retryWithBackoff({
    │                       operation: chat.sendMessage(),
    │                       maxRetries: 2,
    │                       timeoutMs: 30000
    │                   })
    │
    └─ Provider = "openai-compatible"?
            │
            └─▶ handleOpenAICompatible()
                │
                └─▶ retryWithBackoff({
                        operation: fetch() + POST,
                        maxRetries: 3,
                        timeoutMs: 30000
                    })
```

### Market Data Service (MarketDataService.ts)

```
getQuotes(tickers)
    │
    └─▶ For each CORS proxy:
        │
        └─▶ retryWithBackoff({
                operation: fetch(proxy + ticker_url),
                maxRetries: 2,
                timeoutMs: 10000
            })
            │
            ├─ Success? ──▶ Return market data
            │
            └─ Failed? ───▶ Try next proxy
```

### PDF Service (pdfService.ts)

```
extractTextFromPDF(file)
    │
    ├─▶ retryWithBackoff({
    │       operation: pdfjsLib.getDocument(),
    │       maxRetries: 2,
    │       timeoutMs: 15000
    │   })
    │
    └─▶ For each page:
        │
        └─▶ retryWithBackoff({
                operation: pdf.getPage(),
                maxRetries: 1,
                timeoutMs: 10000
            })

parsePDF(file, geminiToken)
    │
    ├─▶ extractTextFromPDF(file)
    │
    ├─ Has geminiToken?
    │   │
    │   └─▶ retryWithBackoff({
    │           operation: parseBankStatementWithAI(),
    │           maxRetries: 1,
    │           timeoutMs: 30000
    │       })
    │
    └─ Fallback:
        │
        └─▶ parseBankStatementRules(text)
```

### Finance Context (FinanceContext.tsx)

```
useEffect() - Initial Load
    │
    └─▶ retryWithBackoff({
            operation: supabase.select().eq().single(),
            maxRetries: 2,
            timeoutMs: 10000
        })

saveToCloud(newState)
    │
    └─▶ setTimeout(1500ms, () => {
            │
            └─▶ retryWithBackoff({
                    operation: supabase.upsert(),
                    maxRetries: 3,
                    timeoutMs: 10000
                })
        })

fetchAllUserData()
    │
    └─▶ retryWithBackoff({
            operation: supabase.select(),
            maxRetries: 3,
            timeoutMs: 15000
        })

loadClientData(userId)
    │
    └─▶ retryWithBackoff({
            operation: supabase.select().eq().single(),
            maxRetries: 3,
            timeoutMs: 10000
        })
```

## Error Handling Pipeline

```
Error occurs
    │
    ▼
logDetailedError()
    │
    ├─ Log timestamp
    ├─ Log error type
    ├─ Log message
    ├─ Log status code
    ├─ Log stack trace
    └─ Log metadata
    │
    ▼
isRetryable()?
    │
    ├─ YES ──▶ Attempt retry with backoff
    │
    └─ NO ───▶ getErrorMessage()
              │
              ▼
        Convert to user-friendly message
              │
              ├─ NETWORK ──────▶ "Erro de conexão..."
              ├─ TIMEOUT ──────▶ "Operação demorou..."
              ├─ RATE_LIMIT ───▶ "Muitas requisições..."
              ├─ NOT_FOUND ────▶ "Recurso não encontrado..."
              ├─ UNAUTHORIZED ─▶ "Acesso negado..."
              ├─ VALIDATION ───▶ "Dados inválidos..."
              └─ UNKNOWN ──────▶ "Erro desconhecido..."
              │
              ▼
        Throw RetryError with context
              │
              ├─ code: ErrorType
              ├─ isRetryable: boolean
              ├─ originalError: Error
              ├─ attempts: number
              └─ lastAttemptTime: number
```

## State Management in Retry

```
┌──────────────────────┐
│   RetryConfig        │
├──────────────────────┤
│ maxRetries: 3        │
│ initialDelayMs: 1000 │
│ maxDelayMs: 10000    │
│ timeoutMs: 5000      │
│ backoffMultiplier: 2 │
│ jitterFactor: 0.1    │
│ onRetry?: callback   │
│ operationName?: str  │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│   Retry Loop         │
├──────────────────────┤
│ for (attempt 1 to 3) │
│   try                │
│     result = await   │
│       operation()    │
│     return result    │
│   catch (error)      │
│     if !retryable    │
│       throw error    │
│     if attempt = max │
│       throw error    │
│     delay = backoff()│
│     sleep(delay)     │
│     continue         │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│   RetryError         │
├──────────────────────┤
│ message: string      │
│ code: ErrorType      │
│ isRetryable: boolean │
│ originalError: Error │
│ attempts: number     │
│ lastAttemptTime: num │
└──────────────────────┘
```

## File Dependencies

```
retryService.ts
    └─ No external dependencies (native APIs only)
       └─ Promise
       └─ setTimeout
       └─ console
       └─ Error
       └─ Math

aiService.ts
    ├─ retryService.ts ✓
    └─ @google/generative-ai

MarketDataService.ts
    ├─ retryService.ts ✓
    └─ Native fetch

pdfService.ts
    ├─ retryService.ts ✓
    ├─ pdfjs-dist
    ├─ jspdf
    ├─ geminiService.ts

FinanceContext.tsx
    ├─ retryService.ts ✓
    ├─ supabase client
    └─ React

retryService.test.ts
    ├─ vitest
    ├─ retryService.ts
    └─ No runtime dependencies
```

## Configuration Matrix

| Service | Retries | Initial Delay | Max Delay | Timeout | Purpose |
|---------|---------|---------------|-----------|---------|---------|
| Gemini | 2 | 500ms | 10s | 30s | AI chat calls |
| OpenAI | 3 | 1000ms | 10s | 30s | Alternative AI |
| Market Data | 2 | 800ms | 10s | 10s | Stock quotes |
| PDF Load | 2 | 500ms | 10s | 15s | PDF.js init |
| PDF Page | 1 | 300ms | 10s | 10s | Page extract |
| Supabase Save | 3 | 500ms | 10s | 10s | Cloud sync |
| Supabase Fetch | 2 | 500ms | 10s | 10s | Initial load |
| Supabase All | 3 | 1000ms | 10s | 15s | Admin fetch |
| Load Client | 3 | 500ms | 10s | 10s | Impersonate |

## Monitoring Points

```
Per Attempt:
├─ Attempt number (1-3)
├─ Operation name
├─ Error type detected
├─ Is retryable?
├─ Next delay if retrying
└─ Callback invoked?

On Failure:
├─ Total attempts made
├─ Total elapsed time
├─ Last error message
├─ Error context (code, status, etc.)
├─ Original error preserved
└─ User-friendly message

On Success:
├─ Attempt number succeeded
├─ Total elapsed time
├─ Operation name
└─ Result returned
```

## Performance Characteristics

```
Best Case (no retry):
└─ Latency: T (operation time)
└─ Network calls: 1

Worst Case (3 retries):
└─ Latency: T + 1000 + 2000 + 4000 = T + 7000ms
└─ Network calls: 4

Average Case (1 retry):
└─ Latency: T + 1000 = T + 1000ms
└─ Network calls: 2

Memory:
└─ Per retry: ~100 bytes (error context)
└─ No persistent state: O(1)
```

---

**This architecture ensures reliable API calls with minimal overhead and maximum compatibility.**
