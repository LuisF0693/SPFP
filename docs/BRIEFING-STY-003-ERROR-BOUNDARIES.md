# 🛡️ BRIEFING EXECUTIVO - STY-003: Implement Error Boundaries

**DESTINADO PARA:** Frontend Developer
**PRIORIDADE:** 🔴 P0 CRÍTICA
**ESFORÇO:** 4 horas
**DATA:** 2026-01-30
**STATUS:** PRONTO PARA IMPLEMENTAÇÃO

---

## 📌 CONTEXTO

Atualmente, se UM componente quebra, **a APP INTEIRA CAI**. Branco fatal. Sem recovery.

**Objetivo:** Colocar "airbags" (Error Boundaries) para:
- ✅ Isolar erro em um componente
- ✅ Mostrar mensagem amigável
- ✅ Permitir retry
- ✅ App continua funcional

---

## ✅ O QUE FAZER (4 horas)

### **1. Criar ErrorBoundary Component (1.5h)**

**Criar novo arquivo:** `src/components/ui/ErrorBoundary.tsx`

```typescript
import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  level?: 'global' | 'regional'; // For tracking
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error(`❌ Error Boundary (${this.props.level || 'regional'}):`, error);
    console.error('Component Stack:', errorInfo.componentStack);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Future: Send to Sentry/monitoring service
    // logErrorToMonitoring(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback from props
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Oops! Algo deu errado
            </h2>
            <p className="text-gray-600 mb-4">
              Desculpe, ocorreu um erro inesperado nesta seção.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-100 p-3 rounded mb-4 text-xs text-gray-700">
                <summary className="cursor-pointer font-bold">
                  Detalhes do erro (dev)
                </summary>
                <p className="mt-2">{this.state.error.toString()}</p>
              </details>
            )}
            <button
              onClick={this.handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### **2. Add Global Boundary in Layout (0.5h)**

**Arquivo:** `src/components/Layout.tsx`

**Procure por:**
```typescript
export const Layout = ({ mode = 'personal' }: LayoutProps) => {
  return (
    <div>
      {/* Current JSX */}
    </div>
  );
};
```

**Adicione ErrorBoundary GLOBAL (top-level):**
```typescript
import { ErrorBoundary } from './ui/ErrorBoundary';

export const Layout = ({ mode = 'personal' }: LayoutProps) => {
  return (
    <ErrorBoundary level="global">
      <div>
        {/* Current JSX */}
      </div>
    </ErrorBoundary>
  );
};
```

**Resultado:** Qualquer erro na app é capturado. Usuário vê mensagem em vez de branco.

---

### **3. Add Regional Boundaries (1.5h)**

**Wrap TRÊS componentes críticos:**

#### 3a. Dashboard.tsx
```typescript
// src/components/Dashboard.tsx
<ErrorBoundary level="regional" fallback={DashboardErrorFallback}>
  <div>
    {/* Dashboard JSX */}
  </div>
</ErrorBoundary>
```

#### 3b. TransactionForm.tsx
```typescript
// src/components/TransactionForm.tsx
<ErrorBoundary level="regional" fallback={FormErrorFallback}>
  <form>
    {/* Form JSX */}
  </form>
</ErrorBoundary>
```

#### 3c. Insights.tsx
```typescript
// src/components/Insights.tsx
<ErrorBoundary level="regional" fallback={InsightsErrorFallback}>
  <div>
    {/* Insights JSX */}
  </div>
</ErrorBoundary>
```

**Resultado:** Se Dashboard quebra, Transaction Form continua funcionando.

---

### **4. Create Tests (1h)**

**Criar:** `src/test/ErrorBoundary.test.tsx`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// Suppress console errors during tests
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

// Component that throws error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Safe content</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('catches error and displays fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Oops! Algo deu errado')).toBeInTheDocument();
  });

  it('retry button resets error state', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryBtn = screen.getByText('Tentar Novamente');
    retryBtn.click();

    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('logs error to console', () => {
    const consoleSpy = vi.spyOn(console, 'error');

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error Boundary'),
      expect.any(Error)
    );
  });
});
```

**Executar:**
```bash
npm run test -- ErrorBoundary.test.tsx
# Esperado: ✅ All tests passing
```

---

## 🎯 CHECKLIST

- [ ] Criar `src/components/ui/ErrorBoundary.tsx`
- [ ] Adicionar `<ErrorBoundary>` em `Layout.tsx` (global)
- [ ] Adicionar `<ErrorBoundary>` em `Dashboard.tsx` (regional)
- [ ] Adicionar `<ErrorBoundary>` em `TransactionForm.tsx` (regional)
- [ ] Adicionar `<ErrorBoundary>` em `Insights.tsx` (regional)
- [ ] Criar testes em `src/test/ErrorBoundary.test.tsx`
- [ ] Executar: `npm run test` (all tests pass)
- [ ] Executar: `npm run build` (no errors)
- [ ] Manual test: Injetar erro em componente → verificar fallback UI aparece
- [ ] Verificar retry button funciona

---

## 📊 EFFORT

| Tarefa | Tempo |
|--------|-------|
| ErrorBoundary component | 1.5h |
| Layout global boundary | 0.5h |
| Regional boundaries (3) | 1.5h |
| Tests | 1h |
| **TOTAL** | **4h** |

---

## 🧪 TESTE MANUAL

**Para testar que ErrorBoundary funciona:**

1. Abra `src/components/Dashboard.tsx`
2. Na função render, adicione:
```typescript
throw new Error('TEST ERROR');
```
3. Salve
4. Vá para o app no browser
5. Veja a página mostrar "Oops! Algo deu errado" em vez de branco
6. Clique "Tentar Novamente"
7. **Remove o `throw`** e salve - page volta ao normal
8. ✅ ErrorBoundary está funcionando!

---

## 📞 DÚVIDAS?

- **"Vai afetar performance?"** → Não, ErrorBoundary é nativo React
- **"Precisa conectar com Sentry?"** → Futura (STY-041). Por agora, só console.error
- **"Posso customizar a mensagem de erro?"** → Sim! Use prop `fallback` com componente custom

---

**Criado por:** Dex (dev)
**Data:** 2026-01-30
**Status:** 🟢 READY FOR EXECUTION
