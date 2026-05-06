/**
 * Onboarding state machine — pure transition functions.
 *
 * No side effects, no IO. Returns a new state or null if the transition
 * is invalid. Per Article 12 (First-90-Seconds Onboarding Dev Spec).
 */

import {
  OnboardingState,
  OnboardingStep,
  StepStatus,
  ONBOARDING_STEPS,
  STEP_CONFIG,
  initialOnboardingState,
} from './types';

// ── Step index map ─────────────────────────────────────────────────

const stepIndex = new Map<OnboardingStep, number>(
  ONBOARDING_STEPS.map((step, idx) => [step, idx]),
);

// ── Public transitions ─────────────────────────────────────────────

/**
 * Move to the next onboarding step.
 * Returns new state or null if at the final step or transition is invalid.
 */
export function goNext(state: OnboardingState): OnboardingState | null {
  const idx = stepIndex.get(state.currentStep);
  if (idx === undefined) return null;

  // Mark current step as completed
  const newSteps: Record<OnboardingStep, StepStatus> = {
    ...state.steps,
    [state.currentStep]: 'completed',
  };

  // If current step is 'done' or last step, cannot go further
  if (state.currentStep === 'done' || idx >= ONBOARDING_STEPS.length - 1) {
    return null;
  }

  const nextStep = ONBOARDING_STEPS[idx + 1];
  newSteps[nextStep] = 'in_progress';

  return { ...state, currentStep: nextStep, steps: newSteps };
}

/**
 * Go back to the previous reversible step.
 * Returns new state or null if cannot go back.
 */
export function goBack(state: OnboardingState): OnboardingState | null {
  const idx = stepIndex.get(state.currentStep);
  if (idx === undefined) return null;
  if (idx === 0) return null; // cannot go back from first step

  // Can only go back if current step is reversible
  const currentConfig = STEP_CONFIG[state.currentStep];
  if (!currentConfig.reversible) return null;

  // Find the nearest previous step that is reversible
  let prevIdx = idx - 1;
  while (prevIdx >= 0) {
    const prevStep = ONBOARDING_STEPS[prevIdx];
    const prevConfig = STEP_CONFIG[prevStep];
    if (prevConfig.reversible) {
      const newSteps: Record<OnboardingStep, StepStatus> = {
        ...state.steps,
        [state.currentStep]: 'not_started',
        [prevStep]: 'in_progress',
      };
      return { ...state, currentStep: prevStep, steps: newSteps };
    }
    prevIdx--;
  }

  return null; // no reversible step found
}

/**
 * Mark onboarding as complete — set all remaining steps to completed
 * and move to 'done' state.
 */
export function completeOnboarding(state: OnboardingState): OnboardingState {
  const completedSteps = Object.fromEntries(
    ONBOARDING_STEPS.map((s) => [s, 'completed'] as const),
  ) as Record<OnboardingStep, StepStatus>;

  return {
    ...state,
    currentStep: 'done',
    steps: completedSteps,
  };
}

/**
 * Check if onboarding is complete.
 */
export function isOnboardingComplete(state: OnboardingState): boolean {
  return state.currentStep === 'done';
}

/**
 * Resume from a persisted state — validates and repairs corrupted state.
 */
export function resumeOnboarding(
  persisted: Partial<OnboardingState>,
): OnboardingState {
  const base = initialOnboardingState();

  if (!persisted || Object.keys(persisted).length === 0) {
    // Fresh start
    base.steps.splash = 'in_progress';
    return base;
  }

  // Merge persisted data
  const merged: OnboardingState = {
    ...base,
    ...persisted,
  };

  // Ensure steps record is complete
  for (const step of ONBOARDING_STEPS) {
    if (!merged.steps[step]) {
      merged.steps[step] = 'not_started';
    }
  }

  // If already completed, short-circuit
  if (persisted.currentStep === 'done') {
    return merged;
  }

  // Find the first incomplete step
  let firstIncomplete: OnboardingStep | null = null;
  for (const step of ONBOARDING_STEPS) {
    if (merged.steps[step] !== 'completed') {
      firstIncomplete = step;
      break;
    }
  }

  if (firstIncomplete) {
    merged.currentStep = firstIncomplete;
    merged.steps[firstIncomplete] = 'in_progress';
  } else {
    merged.currentStep = 'done';
  }

  return merged;
}

/**
 * Get the Expo Router route path for the current onboarding step.
 */
export function getCurrentRoute(state: OnboardingState): string {
  const config = STEP_CONFIG[state.currentStep];
  if (!config || !config.hasScreen) return '/(onboarding)/splash';
  return `/(onboarding)/${config.route}`;
}

/**
 * Get display-friendly step number (1-indexed, ignoring splash).
 */
export function getStepNumber(step: OnboardingStep): {
  current: number;
  total: number;
} {
  // Exclude splash and done from display count
  const displaySteps = ONBOARDING_STEPS.filter(
    (s) => s !== 'splash' && s !== 'done',
  );
  const idx = displaySteps.indexOf(step);
  return {
    current: idx >= 0 ? idx + 1 : 1,
    total: displaySteps.length,
  };
}

/**
 * Determine if the user can navigate back from the current step.
 */
export function canGoBackFrom(state: OnboardingState): boolean {
  const config = STEP_CONFIG[state.currentStep];
  return config?.reversible === true && state.currentStep !== 'splash';
}

/**
 * Determine if the user can navigate forward from the current step.
 */
export function canGoNextFrom(state: OnboardingState): boolean {
  return state.currentStep !== 'done';
}
