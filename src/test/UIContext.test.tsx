import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UIProvider, useUI } from '../context/UIContext';

// Test component that uses the UI context
const TestComponent = () => {
  const { theme, setTheme, isDark } = useUI();
  return (
    <div>
      <p data-testid="theme">Theme: {theme}</p>
      <p data-testid="isDark">Is Dark: {isDark.toString()}</p>
      <button onClick={() => setTheme('light')} data-testid="btn-light">Light</button>
      <button onClick={() => setTheme('dark')} data-testid="btn-dark">Dark</button>
      <button onClick={() => setTheme('system')} data-testid="btn-system">System</button>
    </div>
  );
};

describe('UIContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('provides default theme preference from localStorage', () => {
    localStorage.setItem('spfp_theme_preference', 'dark');

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('Theme: dark');
    expect(screen.getByTestId('isDark')).toHaveTextContent('Is Dark: true');
  });

  it('defaults to system preference if no stored preference', () => {
    // Mock system preference to dark
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList);

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('Theme: system');
    expect(screen.getByTestId('isDark')).toHaveTextContent('Is Dark: true');
  });

  it('persists theme preference to localStorage when changed', async () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const lightButton = screen.getByTestId('btn-light');
    fireEvent.click(lightButton);

    await waitFor(() => {
      expect(localStorage.getItem('spfp_theme_preference')).toBe('light');
    });
  });

  it('applies dark class to document when theme is dark', async () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const darkButton = screen.getByTestId('btn-dark');
    fireEvent.click(darkButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('removes dark class when theme is light', async () => {
    document.documentElement.classList.add('dark');

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const lightButton = screen.getByTestId('btn-light');
    fireEvent.click(lightButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  it('respects light theme preference', async () => {
    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const lightButton = screen.getByTestId('btn-light');
    fireEvent.click(lightButton);

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('Theme: light');
      expect(screen.getByTestId('isDark')).toHaveTextContent('Is Dark: false');
    });
  });

  it('throws error when useUI is used outside UIProvider', () => {
    const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      try {
        return <>{children}</>;
      } catch (error) {
        return <div>Error caught</div>;
      }
    };

    expect(() => {
      render(<TestComponent />, { wrapper: ErrorBoundary });
    }).toThrow('useUI must be used within UIProvider');
  });

  it('updates isDark based on system preference when theme is system', async () => {
    const mockMediaQuery = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;

    vi.spyOn(window, 'matchMedia').mockReturnValue(mockMediaQuery);

    render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const systemButton = screen.getByTestId('btn-system');
    fireEvent.click(systemButton);

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('Theme: system');
    });
  });

  it('maintains theme preference across multiple component renderings', async () => {
    const { rerender } = render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const darkButton = screen.getByTestId('btn-dark');
    fireEvent.click(darkButton);

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('Theme: dark');
    });

    // Re-render doesn't reset the theme
    rerender(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('Theme: dark');
  });
});
