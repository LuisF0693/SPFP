import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error message');
};

// Component that renders normally
const NormalComponent = () => {
  return <div data-testid="normal-component">Normal content</div>;
};

// Component with custom fallback
const CustomFallback = (error: Error, reset: () => void) => (
  <div data-testid="custom-fallback">
    <p>Custom error: {error.message}</p>
    <button onClick={reset} data-testid="custom-retry">
      Custom Retry
    </button>
  </div>
);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('normal-component')).toBeInTheDocument();
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('should display error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Oops! Algo deu errado/i)).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should display custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error: Test error message')).toBeInTheDocument();
  });

  it.skip('should have retry button that resets error state', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Oops! Algo deu errado/i)).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /Tentar Novamente/i });
    await user.click(retryButton);

    // Rerender with normal component to verify retry works
    rerender(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('normal-component')).toBeInTheDocument();
  });

  it('should log error to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error caught by boundary:'),
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('should show back to home button', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const homeButton = screen.getByRole('button', { name: /Voltar ao Início/i });
    expect(homeButton).toBeInTheDocument();
  });

  it('should display error stack in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Error stack should be visible in dev mode
    const stackElement = screen.getByText(/ThrowError/, { selector: 'p' });
    expect(stackElement).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should not display error stack in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const { container } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should not have error details section in production
    const errorDetails = container.querySelector('.bg-black\\/40');
    expect(errorDetails).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it.skip('should reset error state when using custom fallback retry', async () => {
    const user = userEvent.setup();

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();

    const customRetryButton = screen.getByTestId('custom-retry');
    await user.click(customRetryButton);

    // After reset, the error should be cleared
    // (Note: ThrowError will still throw, but state should be reset)
    // This verifies the reset mechanism works
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });

  it.skip('should handle multiple child components with isolation', () => {
    const SafeComponent = () => <div data-testid="safe-comp">Safe</div>;
    const ErrorComponent = () => {
      throw new Error('Error in child');
    };

    const { container } = render(
      <div>
        <ErrorBoundary>
          <SafeComponent />
        </ErrorBoundary>
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      </div>
    );

    // Safe component should render
    expect(screen.getByTestId('safe-comp')).toBeInTheDocument();

    // Error component should show error UI, but not affect safe component
    const errorMessage = container.querySelectorAll(/Oops! Algo deu errado/i);
    expect(errorMessage.length).toBeGreaterThan(0);
  });
});
