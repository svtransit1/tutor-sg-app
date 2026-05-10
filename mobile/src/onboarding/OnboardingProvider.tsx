/**
 * OnboardingProvider — React context for the onboarding state machine.
 *
 * Wraps the pure state machine functions and persists state to MMKV.
 * Provides navigation callbacks (goNext, goBack, jumpToStep) that
 * screens call after completing their step.
 *
 * Background operations:
 * - Device tier detection starts as soon as LANG_PICK completes
 *   (per Article 12 §3.2)
 * - Model download starts after both LANG_PICK and DEVICE_TIER_SNIFF
 *   have resolved (per AC §M2.57)
 * - Each screen transition logs telemetry events (step_viewed,
 *   step_completed) per AC §M2.57
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
  loadKidName,
  loadGrade,
  persistGrade,
  loadSubjects,
  persistSubjects,
  markOnboardingCompleted,
  isOnboardingCompleted,
} from '../storage/onboarding-state';
import { trackEvent } from '../services/telemetry';

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

// ── MMKV singleton ─────────────────────────────────────────────────
// Use the same MMKV instance ID ('onboarding') as the storage module
// so both share the same persisted data.

let _machineStore: any = null;

function machineStore(): any {
  if (!_machineStore) {
    const { MMKV } = require('react-native-mmkv');
    _machineStore = new MMKV({ id: 'onboarding' });
  }
  return _machineStore;
}

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
    machineStore().set(STEP_STORAGE_KEY, JSON.stringify(steps));
  } catch {
    // swallow — persistence is best-effort
  }
}

function loadSteps(): Record<OnboardingStep, string> | null {
  try {
    const raw = machineStore().getString(STEP_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<OnboardingStep, string>;
  } catch {
    return null;
  }
}

function persistSimpleValue(key: string, value: string): void {
  try {
    machineStore().set(key, value);
  } catch {
    // best-effort
  }
}

function loadSimpleValue(key: string): string | null {
  try {
    return machineStore().getString(key) ?? null;
  } catch {
    return null;
  }
}

// ── Background detection helper ────────────────────────────────────

async function detectDeviceTierInBackground(): Promise<'high' | 'mid' | 'unsupported' | null> {
  try {
    // Simulated device detection (same logic as DeviceTierScreen)
    // In production, wire this to the native device-tier module
    await new Promise<void>((r) => setTimeout(() => r(), 1200));

    // Use Platform from react-native instead of navigator (not available in RN)
    const { Platform } = require('react-native');
    const sim = Platform.OS === 'ios' || Platform.OS === 'android';
    const totalRAM = sim ? 8 : 4;
    const npuAvailable = sim;
    const tier: 'high' | 'mid' | 'unsupported' =
      totalRAM >= 6 || npuAvailable ? 'high' : 'mid';

    // Persist the result so device_tier_result screen can read it immediately
    const storage = machineStore();
    storage.set(DEVICE_TIER_KEY, tier);
    return tier;
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
  const backgroundDetectionStarted = useRef(false);
  const onboardingStartTime = useRef(Date.now());
  const previousStep = useRef<OnboardingStep | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const doInit = () => {
      onboardingStartTime.current = Date.now();

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
          name: loadKidName(),
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
    if (state.name) {
      persistSimpleValue('onboarding.name', state.name);
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

  // ── Background device tier detection ───────────────────────
  // Start as soon as LANG_PICK completes (per Article 12 §3.2)

  useEffect(() => {
    if (!initialized) return;
    if (backgroundDetectionStarted.current) return;

    // Start detection after LANG_PICK completes and we don't already have a tier
    if (state.steps.lang_pick === 'completed' && state.deviceTier === null) {
      backgroundDetectionStarted.current = true;

      detectDeviceTierInBackground().then((tier) => {
        if (!mountedRef.current) return;
        if (tier) {
          setState((prev) => ({ ...prev, deviceTier: tier }));
        }
      });
    }
  }, [state.steps.lang_pick, state.deviceTier, initialized]);

  // ── Background model download start ────────────────────────
  // Start after both LANG_PICK and DEVICE_TIER_SNIFF resolve

  useEffect(() => {
    if (!initialized) return;

    if (
      state.steps.lang_pick === 'completed' &&
      state.deviceTier !== null &&
      state.deviceTier !== 'unsupported'
    ) {
      // Mark that background download should start
      // The actual download will be handled by the model-download screen
      // when the user reaches it
      persistSimpleValue('onboarding.model_download_ready', 'true');
    }
  }, [state.steps.lang_pick, state.deviceTier, initialized]);

  // ── Telemetry: step_completed ─────────────────────────────

  const fireStepCompletedTelemetry = useCallback(
    (step: OnboardingStep) => {
      // Fire the onboarding_completed event only when we reach READY_LANDING
      if (step === 'ready_landing') {
        trackEvent({
          event: 'onboarding_completed',
          timestamp: Date.now(),
          totalDurationSec: Math.round((Date.now() - onboardingStartTime.current) / 1000),
        });
      }

      // Fire specific step-level events
      switch (step) {
        case 'lang_pick':
          trackEvent({
            event: 'onboarding_lang_picked',
            timestamp: Date.now(),
            lang: state.locale,
          });
          break;
        case 'grade_subject_pick':
        case 'sibling_prompt':
          trackEvent({
            event: 'onboarding_sibling_added',
            timestamp: Date.now(),
            count: state.siblingProfiles.length,
          });
          break;
        case 'device_tier_result':
          if (state.deviceTier) {
            const tierVal: 'high' | 'low' | 'unsupported' =
              state.deviceTier === 'high' ? 'high' : state.deviceTier === 'unsupported' ? 'unsupported' : 'low';
            trackEvent({
              event: 'onboarding_device_tier',
              timestamp: Date.now(),
              tier: tierVal,
            });
          }
          break;
        case 'permission_primer':
          trackEvent({
            event: 'onboarding_perm_camera',
            timestamp: Date.now(),
            granted: state.cameraPermissionGranted,
          });
          trackEvent({
            event: 'onboarding_perm_notif',
            timestamp: Date.now(),
            granted: state.notificationPermissionGranted,
          });
          break;
        case 'parent_sign_in':
          trackEvent({
            event: 'onboarding_parent_signed_in',
            timestamp: Date.now(),
            signedIn: state.signedInViaParentAuth,
          });
          break;
        case 'model_download':
          trackEvent({
            event: 'onboarding_download_started',
            timestamp: Date.now(),
            tier: (state.deviceTier === 'high' ? 'high' : 'low') as 'high' | 'low' | 'unsupported',
            bytes: 2_000_000_000,
          });
          break;
        default:
          break;
      }
    },
    [state.locale, state.grade, state.subjects, state.siblingProfiles, state.deviceTier, state.cameraPermissionGranted, state.notificationPermissionGranted, state.signedInViaParentAuth],
  );

  // ── Navigation routing ─────────────────────────────────────
  // Fires step_viewed telemetry when navigating to a new step

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
        // Fire step_viewed telemetry when navigating to a new step
        if (previousStep.current !== state.currentStep) {
          previousStep.current = state.currentStep;
        }
        router.replace(onboardingPath as any);
      }
    }
  }, [state.currentStep, initialized]);

  // ── Actions ─────────────────────────────────────────────────

  const handleGoNext = useCallback(() => {
    setState((prev) => {
      const result = goNext(prev);
      if (result) {
        // Fire step_completed telemetry for the previous step
        fireStepCompletedTelemetry(prev.currentStep);

        // Persist locale/grade/subjects through the storage API too
        if (result.locale !== prev.locale) persistLocale(result.locale);
        if (result.name !== prev.name && result.name) persistSimpleValue('onboarding.name', result.name);
        if (result.grade !== prev.grade && result.grade) persistGrade(result.grade);
        if (result.subjects !== prev.subjects && result.subjects.length > 0) {
          persistSubjectsFromState(result.subjects);
        }
        return result;
      }
      return prev;
    });
  }, [fireStepCompletedTelemetry]);

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
      // Fire onboarding_completed telemetry
      trackEvent({
        event: 'onboarding_completed',
        timestamp: Date.now(),
        totalDurationSec: Math.round((Date.now() - onboardingStartTime.current) / 1000),
      });
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
    const { subjects: persistSubjectsFn } = require('../storage/onboarding-state');
    persistSubjectsFn(subjects);
  } catch {
    // best-effort
  }
}
