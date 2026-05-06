import {
  OnboardingState,
  OnboardingStep,
  StepStatus,
  ONBOARDING_STEPS,
  STEP_CONFIG,
  initialOnboardingState,
} from './types';

/**
 * Pure transition function — no side effects, no IO.
 * Returns a new state or null if the transition is invalid.
 */
export function transition(
  state: OnboardingState,
  action: 'next' | 'back',
): OnboardingState | null {
  const { currentStep, steps } = state;
  const idx = ONBOARDING_STEPS.indexOf(currentStep);

  if (idx < 0 || idx >= ONBOARDING_STEPS.length) return null;

  if (action === 'next') {
    const newSteps = { ...steps };
    newSteps[currentStep] = 'completed';

    const nextIdx = idx + 1;
    if (nextIdx >= ONBOARDING_STEPS.length) return null;

    const nextStep = ONBOARDING_STEPS[nextIdx];
    newSteps[nextStep] = 'in_progress';

    return { ...state, currentStep: nextStep, steps: newSteps };
  }

  // back
  if (!STEP_CONFIG[currentStep].reversible) return null;
  if (idx === 0) return null; // can't go back from first step

  const prevIdx = idx - 1;
  // Can only go back to a reversible step
  const prevStep = ONBOARDING_STEPS[prevIdx];
  if (!STEP_CONFIG[prevStep].reversible && prevStep !== 'model-download' && prevStep !== 'kid-profile') {
    return null;
  }

  const newSteps = { ...steps };
  newSteps[currentStep] = 'not_started';
  newSteps[prevStep] = 'in_progress';

  return { ...state, currentStep: prevStep, steps: newSteps };
}

/**
 * Complete the onboarding flow — mark all steps completed and set currentStep to 'done'.
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
  return state.currentStep === 'done' || state.steps['done'] === 'completed';
}

/**
 * Resume from persisted state — validates and fixes corrupted state.
 */
export function resumeOnboarding(
  persisted: Partial<OnboardingState>,
): OnboardingState {
  const base = initialOnboardingState();

  if (!persisted || Object.keys(persisted).length === 0) {
    // Fresh start — mark first step in_progress
    base.steps['welcome'] = 'in_progress';
    return base;
  }

  // Merge persisted data
  const merged: OnboardingState = { ...base, ...persisted };

  // Ensure steps record is complete
  for (const step of ONBOARDING_STEPS) {
    if (!merged.steps[step]) {
      merged.steps[step] = 'not_started';
    }
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
    // All completed but currentStep wasn't 'done'
    merged.currentStep = 'done';
    merged.steps['done'] = 'completed';
  }

  return merged;
}
