/**
 * Onboarding step machine — types and transition rules.
 *
 * Steps: welcome → consent → device-tier → model-download → kid-profile → first-homework → done
 */

export const ONBOARDING_STEPS = [
  'welcome',
  'consent',
  'device-tier',
  'model-download',
  'kid-profile',
  'first-homework',
  'done',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export type StepStatus = 'not_started' | 'in_progress' | 'completed';

export interface OnboardingState {
  currentStep: OnboardingStep;
  steps: Record<OnboardingStep, StepStatus>;
  deviceTier?: 'high' | 'mid' | 'unsupported';
  privacyConsentAcceptedAt?: string;
  privacyPolicyUrl?: string;
  telemetryOptIn?: boolean;
  kidName?: string;
  kidLevel?: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
  kidLanguage?: 'en' | 'zh-Hans';
}

export interface StepConfig {
  reversible: boolean;
  requiresParent: boolean;
}

export const STEP_CONFIG: Record<OnboardingStep, StepConfig> = {
  welcome: { reversible: true, requiresParent: false },
  consent: { reversible: true, requiresParent: true },
  'device-tier': { reversible: true, requiresParent: false },
  'model-download': { reversible: false, requiresParent: false },
  'kid-profile': { reversible: false, requiresParent: true },
  'first-homework': { reversible: false, requiresParent: false },
  done: { reversible: false, requiresParent: false },
};

export function initialOnboardingState(): OnboardingState {
  return {
    currentStep: 'welcome',
    steps: Object.fromEntries(
      ONBOARDING_STEPS.map((s) => [s, 'not_started'] as const),
    ) as Record<OnboardingStep, StepStatus>,
  };
}
