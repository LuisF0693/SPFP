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

      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[9999] p-4">
          <div className="bg-gray-900 border border-red-500/50 rounded-xl max-w-2xl max-h-[80vh] overflow-auto p-6">
            <h1 className="text-2xl font-bold text-red-400 mb-4">🚨 Dashboard Error</h1>

            <div className="mb-6">
              <p className="text-sm text-gray-300 mb-2 font-semibold">Error Message:</p>
              <p className="text-base text-red-300 font-mono bg-red-900/20 p-3 rounded border border-red-500/30">
                {errorMessage}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-300 mb-2 font-semibold">Stack Trace:</p>
              <pre className="text-xs text-gray-400 bg-gray-800 p-4 rounded border border-gray-700 overflow-auto max-h-64 font-mono whitespace-pre-wrap break-words">
                {errorStack}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Copy to clipboard
                  const fullError = `${errorMessage}\n\n${errorStack}`;
                  navigator.clipboard.writeText(fullError);
                  alert('Error copied to clipboard');
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm"
              >
                📋 Copy Error
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm"
              >
                🔄 Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
