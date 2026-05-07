import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  OnboardingState,
  initialOnboardingState,
  STEP_CONFIG,
} from './types';
import { transition, resumeOnboarding, isOnboardingComplete } from './machine';
import { getOnboardingState, setOnboardingState, clearOnboardingState, PersistedOnboardingState } from '../storage';

interface OnboardingContextValue {
  state: OnboardingState;
  goNext: () => boolean;
  goBack: () => boolean;
  isComplete: boolean;
  canGoBack: boolean;
  canGoNext: boolean;
  updateProgress: (patch: Partial<OnboardingState>) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function persistedToState(persisted: PersistedOnboardingState | null): OnboardingState {
  if (!persisted) {
    const fresh = initialOnboardingState();
    fresh.steps['welcome'] = 'in_progress';
    return fresh;
  }
  return resumeOnboarding({
    currentStep: persisted.currentStep as OnboardingState['currentStep'],
    steps: persisted.steps as OnboardingState['steps'],
    deviceTier: persisted.deviceTier,
    privacyConsentAcceptedAt: persisted.privacyConsentAcceptedAt,
    privacyPolicyUrl: persisted.privacyPolicyUrl,
    telemetryOptIn: persisted.telemetryOptIn,
    kidName: persisted.kidName,
    kidLevel: persisted.kidLevel as OnboardingState['kidLevel'],
    kidLanguage: persisted.kidLanguage as OnboardingState['kidLanguage'],
  });
}

function stateToPersisted(state: OnboardingState): PersistedOnboardingState {
  return {
    currentStep: state.currentStep,
    steps: Object.fromEntries(Object.entries(state.steps)) as PersistedOnboardingState['steps'],
    deviceTier: state.deviceTier,
    privacyConsentAcceptedAt: state.privacyConsentAcceptedAt,
    privacyPolicyUrl: state.privacyPolicyUrl,
    telemetryOptIn: state.telemetryOptIn,
    kidName: state.kidName,
    kidLevel: state.kidLevel,
    kidLanguage: state.kidLanguage,
  };
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    const fresh = initialOnboardingState();
    fresh.steps['welcome'] = 'in_progress';
    return fresh;
  });
  const [initialized, setInitialized] = useState(false);
  const initializedRef = useRef(false);

  // Load persisted state on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      const persisted = await getOnboardingState();
      const restored = persistedToState(persisted);
      setState(restored);
      setInitialized(true);
    })();
  }, []);

  // Persist on every state change (after initial load)
  useEffect(() => {
    if (!initialized) return;
    setOnboardingState(stateToPersisted(state)).catch(() => {});
  }, [state, initialized]);

  const goNext = useCallback((): boolean => {
    let didTransition = false;
    setState((prev) => {
      const result = transition(prev, 'next');
      if (result) {
        didTransition = true;
        return result;
      }
      return prev;
    });
    return didTransition;
  }, []);

  const goBack = useCallback((): boolean => {
    let didTransition = false;
    setState((prev) => {
      const result = transition(prev, 'back');
      if (result) {
        didTransition = true;
        return result;
      }
      return prev;
    });
    return didTransition;
  }, []);

  const updateProgress = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(async () => {
    const fresh = initialOnboardingState();
    fresh.steps['welcome'] = 'in_progress';
    setState(fresh);
    await clearOnboardingState();
  }, []);

  const complete = isOnboardingComplete(state);
  const canGoBack = STEP_CONFIG[state.currentStep]?.reversible && state.currentStep !== 'welcome';
  const canGoNext = state.currentStep !== 'done';

  return (
    <OnboardingContext.Provider
      value={{ state, goNext, goBack, isComplete: complete, canGoBack, canGoNext, updateProgress, reset }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return ctx;
}
