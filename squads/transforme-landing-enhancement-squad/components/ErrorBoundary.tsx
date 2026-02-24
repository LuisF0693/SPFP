/**
 * ErrorBoundary - Catch React errors in landing page components
 * Prevents entire page from crashing if component fails
 */

import React, { Component, ReactNode } from 'react';
import { ErrorBoundaryProps } from './types';

/**
 * Error state for boundary
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary component - Catches errors in child components
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<div>Component failed to load</div>}>
 *   <HeroV2 />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Log error to console and external service
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({ errorInfo });

    // Call external error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service (e.g., Sentry)
    this.logErrorToService(error, errorInfo);
  }

  /**
   * Log error to external service
   */
  private logErrorToService(error: Error, errorInfo: React.ErrorInfo): void {
    try {
      // Send to your error logging service
      const errorData = {
        message: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Example: Send to custom endpoint
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData),
      // }).catch(err => console.error('Failed to log error:', err));

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Error logged]', errorData);
      }
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }

  /**
   * Reset error state
   */
  private resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    // If error occurred, show fallback
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="w-full py-20 px-4 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Algo deu errado
            </h2>
            <p className="text-gray-600 mb-6">
              Desculpe, houve um problema ao carregar este componente. Tente novamente.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left bg-gray-100 p-4 rounded text-xs text-gray-700 overflow-auto max-h-64">
                <summary className="cursor-pointer font-semibold mb-2">
                  Detalhes do erro (dev only)
                </summary>
                <pre className="whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={this.resetError}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
