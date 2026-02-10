import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { RetirementSettings } from '../types/investments';

const DEFAULT_SETTINGS: RetirementSettings = {
  id: '',
  user_id: '',
  current_age: 30,
  retirement_age: 65,
  life_expectancy: 100,
  monthly_contribution: 2000,
  desired_monthly_income: 10000,
  annual_return_rate: 8,
  inflation_rate: 4.5,
  current_patrimony: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const STORAGE_KEY = 'spfp_retirement_settings';

export function useRetirementSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<RetirementSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage or Supabase
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try localStorage first (for offline/quick access)
        const storedSettings = localStorage.getItem(
          user ? `${STORAGE_KEY}_${user.id}` : STORAGE_KEY
        );

        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }

        // If authenticated, try Supabase
        if (user) {
          const { data, error: fetchError } = await supabase
            .from('retirement_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 = no rows found, which is ok
            console.warn('Error fetching retirement settings:', fetchError);
          }

          if (data) {
            const serverSettings = {
              ...data,
              id: data.id,
              user_id: data.user_id,
            };
            setSettings(serverSettings);
            // Update localStorage with server data
            localStorage.setItem(
              `${STORAGE_KEY}_${user.id}`,
              JSON.stringify(serverSettings)
            );
          }
        }
      } catch (err) {
        console.error('Failed to load retirement settings:', err);
        setError('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Update settings
  const updateSettings = useCallback(
    async (updates: Partial<RetirementSettings>) => {
      const newSettings = {
        ...settings,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Optimistic update
      setSettings(newSettings);

      // Save to localStorage
      const storageKey = user ? `${STORAGE_KEY}_${user.id}` : STORAGE_KEY;
      localStorage.setItem(storageKey, JSON.stringify(newSettings));

      // If authenticated, save to Supabase
      if (user) {
        try {
          const { id, created_at, ...upsertData } = newSettings;

          const { error: upsertError } = await supabase
            .from('retirement_settings')
            .upsert(
              {
                ...upsertData,
                user_id: user.id,
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: 'user_id',
              }
            );

          if (upsertError) {
            console.error('Failed to save retirement settings:', upsertError);
            setError('Erro ao salvar configurações');
          }
        } catch (err) {
          console.error('Failed to save retirement settings:', err);
          setError('Erro ao salvar configurações');
        }
      }
    },
    [settings, user]
  );

  // Reset to defaults
  const resetSettings = useCallback(() => {
    const defaultWithUser = {
      ...DEFAULT_SETTINGS,
      user_id: user?.id || '',
    };
    setSettings(defaultWithUser);

    const storageKey = user ? `${STORAGE_KEY}_${user.id}` : STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(defaultWithUser));
  }, [user]);

  // Calculate projections
  const calculateProjection = useCallback(() => {
    const {
      current_age,
      retirement_age,
      life_expectancy = 100,
      annual_return_rate,
      inflation_rate,
      monthly_contribution,
      desired_monthly_income,
      current_patrimony = 0,
    } = settings;

    // Real return rate
    const realReturn = (1 + annual_return_rate / 100) / (1 + inflation_rate / 100) - 1;
    const monthlyReturn = Math.pow(1 + realReturn, 1 / 12) - 1;

    let patrimony = current_patrimony;
    const yearsToRetirement = retirement_age - current_age;
    const monthsToRetirement = yearsToRetirement * 12;

    // Accumulation phase
    for (let i = 0; i < monthsToRetirement; i++) {
      patrimony += monthly_contribution;
      patrimony *= (1 + monthlyReturn);
    }

    const patrimonyAtRetirement = patrimony;

    // Calculate sustainable withdrawal rate
    const retirementYears = life_expectancy - retirement_age;
    const sustainableMonthlyIncome = patrimonyAtRetirement * (monthlyReturn / (1 - Math.pow(1 + monthlyReturn, -retirementYears * 12)));

    // Check if desired income is sustainable
    let finalPatrimony = patrimonyAtRetirement;
    for (let i = 0; i < retirementYears * 12; i++) {
      finalPatrimony -= desired_monthly_income;
      finalPatrimony *= (1 + monthlyReturn);
      if (finalPatrimony < 0) {
        finalPatrimony = 0;
        break;
      }
    }

    const isSustainable = finalPatrimony > 0;
    const yearsOfIncome = isSustainable ? retirementYears : Math.floor((patrimonyAtRetirement / desired_monthly_income) / 12);

    return {
      patrimonyAtRetirement: Math.round(patrimonyAtRetirement),
      sustainableMonthlyIncome: Math.round(sustainableMonthlyIncome),
      finalPatrimony: Math.round(finalPatrimony),
      isSustainable,
      yearsOfIncome,
      totalContributed: monthly_contribution * monthsToRetirement + current_patrimony,
      totalGains: Math.round(patrimonyAtRetirement - (monthly_contribution * monthsToRetirement + current_patrimony)),
    };
  }, [settings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    calculateProjection,
  };
}

export default useRetirementSettings;
