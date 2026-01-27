import React, { ReactElement } from 'react';
import {
  render,
  RenderOptions,
  RenderResult,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function that wraps components with necessary providers
 * Use this instead of RTL's render() in your tests
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Create mock user data for testing
 */
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id-123',
  email: 'test@example.com',
  user_metadata: {
    display_name: 'Test User',
    full_name: 'Test User',
  },
  ...overrides,
});

/**
 * Create mock transaction data for testing
 */
export const createMockTransaction = (overrides = {}) => ({
  id: `tx-${Date.now()}`,
  accountId: 'acc-001',
  date: new Date().toISOString().split('T')[0],
  description: 'Test Transaction',
  amount: 100,
  type: 'expense' as const,
  category: 'Alimentação',
  tags: [],
  notes: '',
  ...overrides,
});

/**
 * Create mock account data for testing
 */
export const createMockAccount = (overrides = {}) => ({
  id: `acc-${Date.now()}`,
  name: 'Test Account',
  balance: 1000,
  type: 'checking' as const,
  color: '#3B82F6',
  currency: 'BRL',
  institution: 'Test Bank',
  ...overrides,
});

/**
 * Create mock goal data for testing
 */
export const createMockGoal = (overrides = {}) => ({
  id: `goal-${Date.now()}`,
  name: 'Test Goal',
  targetAmount: 5000,
  currentAmount: 2000,
  category: 'Férias',
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  ...overrides,
});

/**
 * Wait for async operations with custom timeout
 */
export const waitForAsync = (ms = 0) =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a mock Supabase client for testing
 */
export const createMockSupabaseClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ unsubscribe: () => {} }),
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
});

/**
 * Type assertions for test data
 */
export const expectType = <T,>(value: unknown): T => value as T;

/**
 * Test data generators
 */
export const generators = {
  randomId: () => `${Math.random().toString(36).substr(2, 9)}`,
  randomEmail: () => `test-${Math.random().toString(36).substr(2, 5)}@example.com`,
  randomAmount: (min = 10, max = 10000) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
  futureDate: (days = 30) =>
    new Date(Date.now() + days * 24 * 60 * 60 * 1000),
};

/**
 * Re-export commonly used testing utilities
 */
export * from '@testing-library/react';
export { userEvent as default } from '@testing-library/user-event';
