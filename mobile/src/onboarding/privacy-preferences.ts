import { OnboardingState } from './types';

// TODO: replace with final privacy policy URL before production launch
export const PRIVACY_POLICY_URL = 'https://tutor-sg.example/privacy';

export interface ConsentSnapshot {
  privacyConsentAcceptedAt: string;
  privacyPolicyUrl: string;
  telemetryOptIn: boolean;
}

export function buildConsentSnapshot({
  telemetryOptIn,
  acceptedAt = new Date().toISOString(),
}: {
  telemetryOptIn: boolean;
  acceptedAt?: string;
}): ConsentSnapshot {
  return {
    privacyConsentAcceptedAt: acceptedAt,
    privacyPolicyUrl: PRIVACY_POLICY_URL,
    telemetryOptIn,
  };
}

export function getSentryInitFlag(
  state: Pick<Partial<OnboardingState>, 'privacyConsentAcceptedAt' | 'telemetryOptIn'>,
): boolean {
  return Boolean(state.privacyConsentAcceptedAt && state.telemetryOptIn);
}
