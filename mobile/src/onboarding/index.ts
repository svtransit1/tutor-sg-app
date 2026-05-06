/**
 * Onboarding state machine — public exports.
 *
 * Per Article 12 (First-90-Seconds Onboarding Dev Spec).
 */

export { OnboardingProvider, useOnboarding } from './OnboardingProvider';
export {
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
export {
  ONBOARDING_STEPS,
  STEP_CONFIG,
  initialOnboardingState,
} from './types';

export type {
  OnboardingStep,
  OnboardingState,
  StepStatus,
  StepConfig,
} from './types';
