export type {
  EntitlementTier,
  FeatureId,
  FeatureGate,
} from './feature-gates';

export { FEATURE_GATES } from './feature-gates';

// Re-export error state components for convenience
export { ErrorState, ErrorBanner, OnboardingErrorFallback } from './onboarding/ErrorStates';
export type { ErrorKind, ErrorAction, ErrorStateConfig } from './onboarding/ErrorStates';

export { CameraErrorScreen, CameraErrorBanner, OcrFallbackPanel } from './camera/CameraErrors';
export type { CameraErrorKind, CameraErrorConfig } from './camera/CameraErrors';
