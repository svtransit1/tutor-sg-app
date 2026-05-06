/**
 * OnboardingProvider — React context for the onboarding state machine.
 *
 * Wraps the pure state machine functions and persists state to MMKV.
 * Provides navigation callbacks (goNext, goBack, jumpToStep) that
 * screens call after completing their step.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import {
  OnboardingState,
  OnboardingStep,
  initialOnboardingState,
  ONBOARDING_STEPS,
} from './types';
import {
  goNext,
  goBack,
  completeOnboarding,
  resumeOnboarding,
  getCurrentRoute,
  getStepNumber,
  canGoBackFrom,
  canGoNextFrom,
  isOnboardingComplete,
} from './machine';
import { useRouter, useSegments } from 'expo-router';
import {
  loadLocale,
  persistLocale,
  loadGrade,
  persistGrade,
  loadSubjects,
  persistSubjects,
  markOnboardingCompleted,
  isOnboardingCompleted,
} from '../storage/onboarding-state';

// ── Types ──────────────────────────────────────────────────────────

interface OnboardingContextValue {
  /** Current state machine state */
  state: OnboardingState;
  /** Move to the next step */
  goNext: () => void;
  /** Go back to the previous reversible step */
  goBack: () => void;
  /** Jump to a specific step (used for resume) */
  jumpToStep: (step: OnboardingStep) => void;
  /** Complete the entire onboarding flow */
  complete: () => void;
  /** Reset onboarding (clears all state) */
  reset: () => void;
  /** Update a partial piece of state */
  updateState: (patch: Partial<OnboardingState>) => void;
  /** Whether onboarding is fully complete */
  isComplete: boolean;
  /** Current step index for display */
  stepProgress: { current: number; total: number };
  /** Current Expo Router route for the onboarding screen */
  currentRoute: string;
  /** Can navigate back from current step */
  canGoBack: boolean;
  /** Can navigate forward from current step */
  canGoNext: boolean;
  /** Whether the provider has finished initializing from persistence */
  initialized: boolean;
}

// ── Context ────────────────────────────────────────────────────────

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

// ── Persistence helpers ────────────────────────────────────────────

const STEP_STORAGE_KEY = 'onboarding.steps';
const DEVICE_TIER_KEY = 'onboarding.device_tier';
const CURRENT_STEP_KEY = 'onboarding.current_step';
const SIBLING_PROFILES_KEY = 'onboarding.sibling_profiles';
const CAMERA_PERM_KEY = 'onboarding.camera_perm';
const NOTIF_PERM_KEY = 'onboarding.notif_perm';
const SIGNED_IN_KEY = 'onboarding.signed_in';

function persistStepState(steps: Record<OnboardingStep, string>): void {
  try {
    // We use a simple module-level cache — MMKV is synchronous
    const { MMKV } = require('react-native-mmkv');
    const storage = new MMKV({ id: 'onboarding-machine' });
    storage.set('onboarding.steps', JSON.stringify(steps));
  } catch {
    // swallow — persistence is best-effort
  }
}

function loadSteps(): Record<OnboardingStep, string> | null {
  try {
    const { MMKV } = require('react-native-mmkv');
    const storage = new MMKV({ id: 'onboarding-machine' });
    const raw = storage.getString('onboarding.steps');
    if (!raw) return null;
    return JSON.parse(raw) as Record<OnboardingStep, string>;
  } catch {
    return null;
  }
}

function persistSimpleValue(key: string, value: string): void {
  try {
    const { MMKV } = require('react-native-mmkv');
    const storage = new MMKV({ id: 'onboarding-machine' });
    storage.set(key, value);
  } catch {
    // best-effort
  }
}

function loadSimpleValue(key: string): string | null {
  try {
    const { MMKV } = require('react-native-mmkv');
    const storage = new MMKV({ id: 'onboarding-machine' });
    return storage.getString(key) ?? null;
  } catch {
    return null;
  }
}

// ── Provider ───────────────────────────────────────────────────────

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();

  const [state, setState] = useState<OnboardingState>(() => {
    const fresh = initialOnboardingState();
    fresh.steps.splash = 'in_progress';
    return fresh;
  });
  const [initialized, setInitialized] = useState(false);
  const initializedRef = useRef(false);
  const mountedRef = useRef(true);

  // Load persisted state on mount
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const doInit = () => {
      // Check global onboarding completion first
      if (isOnboardingCompleted()) {
        const fresh = initialOnboardingState();
        fresh.currentStep = 'done';
        fresh.steps.done = 'completed';
        // Mark all previous steps as completed
        for (const step of ONBOARDING_STEPS) {
          fresh.steps[step] = 'completed';
        }
        setState(fresh);
        setInitialized(true);
        return;
      }

      // Load persisted steps
      const stepsRaw = loadSteps();
      if (stepsRaw) {
        // Build partial state from persistence
        const persisted: Partial<OnboardingState> = {
          currentStep: (loadSimpleValue(CURRENT_STEP_KEY) as OnboardingStep) || undefined,
          steps: stepsRaw as Record<OnboardingStep, 'not_started' | 'in_progress' | 'completed'>,
          locale: loadLocale(),
          grade: loadGrade(),
          subjects: loadSubjects() ?? undefined,
          deviceTier: loadSimpleValue(DEVICE_TIER_KEY) as 'high' | 'mid' | 'unsupported' | null,
          pinSet: loadSimpleValue('onboarding.pin_set') === 'true',
          hasSiblings: loadSimpleValue('onboarding.has_siblings') === 'true',
          cameraPermissionGranted: loadSimpleValue(CAMERA_PERM_KEY) === 'true',
          notificationPermissionGranted: loadSimpleValue(NOTIF_PERM_KEY) === 'true',
          signedInViaParentAuth: loadSimpleValue(SIGNED_IN_KEY) === 'true',
        };

        // Restore sibling profiles
        const siblingRaw = loadSimpleValue(SIBLING_PROFILES_KEY);
        if (siblingRaw) {
          try {
            persisted.siblingProfiles = JSON.parse(siblingRaw);
          } catch {
            // ignore
          }
        }

        const restored = resumeOnboarding(persisted);
        setState(restored);
      } else {
        // Fresh start
        const fresh = initialOnboardingState();
        fresh.steps.splash = 'in_progress';
        setState(fresh);
      }

      setInitialized(true);
    };

    doInit();
  }, []);

  // Persist state changes
  useEffect(() => {
    if (!initialized) return;

    persistStepState(state.steps);
    persistSimpleValue(CURRENT_STEP_KEY, state.currentStep);
    if (state.deviceTier) {
      persistSimpleValue(DEVICE_TIER_KEY, state.deviceTier);
    }
    if (state.pinSet) {
      persistSimpleValue('onboarding.pin_set', 'true');
    }
    if (state.hasSiblings) {
      persistSimpleValue('onboarding.has_siblings', 'true');
    }
    if (state.siblingProfiles.length > 0) {
      persistSimpleValue(SIBLING_PROFILES_KEY, JSON.stringify(state.siblingProfiles));
    }
    persistSimpleValue(CAMERA_PERM_KEY, String(state.cameraPermissionGranted));
    persistSimpleValue(NOTIF_PERM_KEY, String(state.notificationPermissionGranted));
    persistSimpleValue(SIGNED_IN_KEY, String(state.signedInViaParentAuth));
  }, [state, initialized]);

  // ── Navigation routing ─────────────────────────────────────

  useEffect(() => {
    if (!initialized) return;

    const route = getCurrentRoute(state);

    // Only navigate if we're not already on this route
    const currentPath = segments.join('/');
    const targetPath = route.replace(/^\//, '').replace(/^\(onboarding\)\//, '');

    if (isOnboardingComplete(state)) {
      // Navigate to (kid) group if not already there
      if (!currentPath.startsWith('(kid)')) {
        router.replace('/(kid)/home');
      }
    } else {
      // Navigate to the correct onboarding screen
      const onboardingPath = `/(onboarding)/${targetPath}`;
      if (currentPath !== `(onboarding)/${targetPath}` && !currentPath.includes(targetPath)) {
        router.replace(onboardingPath as any);
      }
    }
  }, [state.currentStep, initialized]);

  // ── Actions ─────────────────────────────────────────────────

  const handleGoNext = useCallback(() => {
    setState((prev) => {
      const result = goNext(prev);
      if (result) {
        // Persist locale/grade/subjects through the old API too
        if (result.locale !== prev.locale) persistLocale(result.locale);
        if (result.grade !== prev.grade && result.grade) persistGrade(result.grade);
        if (result.subjects !== prev.subjects && result.subjects.length > 0) {
          persistSubjectsFromState(result.subjects);
        }
        return result;
      }
      return prev;
    });
  }, []);

  const handleGoBack = useCallback(() => {
    setState((prev) => {
      const result = goBack(prev);
      return result ?? prev;
    });
  }, []);

  const jumpToStep = useCallback((step: OnboardingStep) => {
    setState((prev) => {
      const newSteps = { ...prev.steps };
      // Reset all steps after the target
      let found = false;
      for (const s of ONBOARDING_STEPS) {
        if (s === step) {
          found = true;
          newSteps[s] = 'in_progress';
        } else if (found) {
          newSteps[s] = 'not_started';
        }
      }
      return { ...prev, currentStep: step, steps: newSteps };
    });
  }, []);

  const handleComplete = useCallback(() => {
    setState((prev) => {
      const result = completeOnboarding(prev);
      // Mark global onboarding completion
      markOnboardingCompleted();
      return result;
    });
  }, []);

  const handleReset = useCallback(() => {
    const fresh = initialOnboardingState();
    fresh.steps.splash = 'in_progress';
    setState(fresh);
  }, []);

  const updateState = useCallback((patch: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  // ── Memoized values ────────────────────────────────────────

  const value = useMemo<OnboardingContextValue>(
    () => ({
      state,
      goNext: handleGoNext,
      goBack: handleGoBack,
      jumpToStep,
      complete: handleComplete,
      reset: handleReset,
      updateState,
      isComplete: isOnboardingComplete(state),
      stepProgress: getStepNumber(state.currentStep),
      currentRoute: getCurrentRoute(state),
      canGoBack: canGoBackFrom(state),
      canGoNext: canGoNextFrom(state),
      initialized,
    }),
    [
      state,
      handleGoNext,
      handleGoBack,
      jumpToStep,
      handleComplete,
      handleReset,
      updateState,
      initialized,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return ctx;
}

// ── Internal helpers ───────────────────────────────────────────────

function persistSubjectsFromState(subjects: string[]): void {
  try {
    const { MMKV } = require('react-native-mmkv');
    const storage = new MMKV({ id: 'onboarding' });
    storage.set('onboarding.subjects', JSON.stringify(subjects));
  } catch {
    // best-effort
  }
}
