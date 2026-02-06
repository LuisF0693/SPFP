import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary specifically for Dashboard to capture and log errors
 */
export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Stack:', error.stack);
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unknown error';
      const errorStack = this.state.error?.stack || 'No stack trace available';

      // Log to browser's local storage as backup
      if (typeof window !== 'undefined') {
        const errorLog = {
          message: errorMessage,
          stack: errorStack,
          timestamp: new Date().toISOString()
        };
        try {
          localStorage.setItem('dashboard_error', JSON.stringify(errorLog));
        } catch (e) {
          console.error('Failed to save error to localStorage:', e);
        }
      }

      return (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#111827', border: '2px solid #dc2626', borderRadius: '0.75rem', maxWidth: '800px', maxHeight: '80vh', overflow: 'auto', padding: '1.5rem', fontFamily: 'monospace' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#f87171', marginBottom: '1rem' }}>🚨 DASHBOARD ERROR</h1>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '0.5rem' }}>
              <p style={{ color: '#fca5a5', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>MESSAGE:</p>
              <p style={{ color: '#fecaca', fontSize: '1rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {errorMessage}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', maxHeight: '400px', overflow: 'auto' }}>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>STACK TRACE:</p>
              <pre style={{ color: '#d1d5db', fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                {errorStack}
              </pre>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  const fullError = `${errorMessage}\n\n${errorStack}`;
                  navigator.clipboard.writeText(fullError);
                  alert('✅ Error copied to clipboard!');
                }}
                style={{ flex: 1, padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                📋 Copy Error
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{ flex: 1, padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🔄 Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
