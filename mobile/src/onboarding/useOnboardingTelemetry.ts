/**
 * Hook: useOnboardingTelemetry
 *
 * Wires telemetry events into the onboarding flow automatically.
 * Fires events on:
 * - Step viewed (when currentStep changes)
 * - Step completed (on forward transition)
 * - Back navigated (on backward transition)
 * - Onboarding completed
 *
 * All events are gated by the parent's telemetryOptIn choice.
 */

import { useTelemetry } from '../services/TelemetryProvider';
import { OnboardingStep } from './types';

/**
 * Convenience function to track a back navigation event.
 * Call from individual screens when goBack is pressed.
 */
export async function trackBackNavigation(
  track: ReturnType<typeof useTelemetry>['track'],
  from: OnboardingStep,
  to: OnboardingStep,
): Promise<void> {
  await track('onboarding_back_navigated', { from, to });
}
