import React, { createContext, useContext, useCallback, useState, type ReactNode } from 'react';

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  language: string;
  grade?: number;
  subjects: string[];
}

interface OnboardingContextValue {
  state: OnboardingState;
  updateState: (updates: Partial<OnboardingState>) => void;
  goNext: () => void;
  goBack: () => void;
  setStep: (step: number) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    totalSteps: 11,
    language: 'en',
    subjects: [],
  });

  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const goNext = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, prev.totalSteps) }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  }, []);

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  return (
    <OnboardingContext.Provider value={{ state, updateState, goNext, goBack, setStep }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    // Return a no-op default so screens can render outside the provider during dev
    return {
      state: { currentStep: 1, totalSteps: 11, language: 'en', subjects: [] },
      updateState: () => {},
      goNext: () => {},
      goBack: () => {},
      setStep: () => {},
    };
  }
  return ctx;
}