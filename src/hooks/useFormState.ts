import { useState, useCallback, useMemo } from 'react';

interface UseFormStateOptions<T> {
  initialValues: T;
  onReset?: () => void;
}

interface UseFormStateReturn<T> {
  values: T;
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  reset: () => void;
  isDirty: boolean;
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
  setError: <K extends keyof T>(key: K, error: string) => void;
  clearError: <K extends keyof T>(key: K) => void;
  clearErrors: () => void;
}

/**
 * Custom hook for managing form state
 * Consolidates duplicate form state management across multiple form components
 * Used by: TransactionForm, GoalForm, InvestmentForm, PatrimonyForm
 */
export const useFormState = <T extends Record<string, any>>({
  initialValues,
  onReset,
}: UseFormStateOptions<T>): UseFormStateReturn<T> => {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>({});

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValuesState(prev => ({
      ...prev,
      [key]: value,
    }));
    // Clear error when field is modified
    if (errors[key]) {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, [errors]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    onReset?.();
  }, [initialValues, onReset]);

  const setError = useCallback(<K extends keyof T>(key: K, error: string) => {
    setErrorsState(prev => ({
      ...prev,
      [key]: error,
    }));
  }, []);

  const clearError = useCallback(<K extends keyof T>(key: K) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  return {
    values,
    setValue,
    setValues,
    reset,
    isDirty,
    isValid,
    errors,
    setError,
    clearError,
    clearErrors,
  };
};
