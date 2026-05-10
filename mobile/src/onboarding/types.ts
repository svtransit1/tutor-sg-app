/**
 * Onboarding step machine — types and transition rules.
 *
 * Per Article 12 (First-90-Seconds Onboarding Dev Spec):
 * Splash → LangPick → AgeGate → ParentPinSetup → ParentSignIn →
 * GradeSubjectPick → SiblingPrompt → DeviceTierResult →
 * PermissionPrimer → ModelDownload → ReadyLanding → Done
 */

export const ONBOARDING_STEPS = [
  'splash',
  'lang_pick',
  'age_gate',
  'parent_pin_setup',
  'parent_sign_in',
  'grade_subject_pick',
  'sibling_prompt',
  'device_tier_result',
  'permission_primer',
  'model_download',
  'ready_landing',
  'done',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export type StepStatus = 'not_started' | 'in_progress' | 'completed';

export interface OnboardingState {
  currentStep: OnboardingStep;
  steps: Record<OnboardingStep, StepStatus>;
  locale: 'en' | 'zh-Hans';
  name: string;
  grade: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | null;
  subjects: Array<'math' | 'english' | 'chinese' | 'science'>;
  deviceTier: 'high' | 'mid' | 'unsupported' | null;
  pinSet: boolean;
  hasSiblings: boolean;
  siblingProfiles: Array<{
    grade: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
    subjects: Array<'math' | 'english' | 'chinese' | 'science'>;
  }>;
  cameraPermissionGranted: boolean;
  notificationPermissionGranted: boolean;
  signedInViaParentAuth: boolean;
}

export interface StepConfig {
  /** Can user navigate back to this step? */
  reversible: boolean;
  /** Requires parent interaction? */
  requiresParent: boolean;
  /** Route path in Expo Router (relative to (onboarding)/) */
  route: string;
  /** Whether this step has a dedicated screen vs. is background-only */
  hasScreen: boolean;
}

export const STEP_CONFIG: Record<OnboardingStep, StepConfig> = {
  splash:               { reversible: false, requiresParent: false, route: 'splash',                hasScreen: true },
  lang_pick:            { reversible: true,  requiresParent: false, route: 'lang-pick',             hasScreen: true },
  age_gate:             { reversible: true,  requiresParent: true,  route: 'age-gate',              hasScreen: true },
  parent_pin_setup:     { reversible: false, requiresParent: true,  route: 'parent-pin-setup',      hasScreen: true },
  parent_sign_in:       { reversible: false, requiresParent: true,  route: 'parent-sign-in',        hasScreen: true },
  grade_subject_pick:   { reversible: false, requiresParent: true,  route: 'grade-subject-pick',    hasScreen: true },
  sibling_prompt:       { reversible: false, requiresParent: true,  route: 'sibling-prompt',        hasScreen: true },
  device_tier_result:   { reversible: false, requiresParent: false, route: 'device-tier-result',    hasScreen: true },
  permission_primer:    { reversible: false, requiresParent: false, route: 'permission-primer',     hasScreen: true },
  model_download:       { reversible: false, requiresParent: false, route: 'model-download',        hasScreen: true },
  ready_landing:        { reversible: false, requiresParent: false, route: 'ready-landing',         hasScreen: true },
  done:                 { reversible: false, requiresParent: false, route: 'done',                  hasScreen: false },
};

export function initialOnboardingState(): OnboardingState {
  return {
    currentStep: 'splash',
    steps: Object.fromEntries(
      ONBOARDING_STEPS.map((s) => [s, 'not_started'] as const),
    ) as Record<OnboardingStep, StepStatus>,
    locale: 'en',
    name: '',
    grade: null,
    subjects: ['math', 'english', 'chinese', 'science'],
    deviceTier: null,
    pinSet: false,
    hasSiblings: false,
    siblingProfiles: [],
    cameraPermissionGranted: false,
    notificationPermissionGranted: false,
    signedInViaParentAuth: false,
  };
}
