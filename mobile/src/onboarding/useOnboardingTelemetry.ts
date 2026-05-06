/**
 * Hook: useOnboardingTelemetry
 *
 * Wires telemetry events into the onboarding flow automatically.
 * Fires events on:
 * - Onboarding started (once on mount)
 * - Step viewed (when currentStep changes)
 * - Step completed (on forward step transition)
 * - Back navigated (on backward step transition)
 * - Onboarding completed (when isComplete becomes true)
 *
 * All events are gated by the parent's telemetryOptIn choice.
 * The TelemetryProvider must be an ancestor in the React tree.
 */

import { useEffect, useRef } from 'react';
import { useTelemetry } from '../services/TelemetryProvider';
import { OnboardingStep } from './types';

const STEP_LABELS: Record<string, string> = {
  welcome: 'welcome',
  consent: 'consent',
  'device-tier': 'device_tier',
  'model-download': 'model_download',
  'kid-profile': 'kid_profile',
  'first-homework': 'first_homework',
  done: 'done',
};

/**
 * Tracks automatic onboarding lifecycle events.
 *
 * @param currentStep  The current onboarding step (from state machine).
 * @param isComplete   Whether onboarding has finished.
 * @param previousStepRef  Ref holding the previous step for comparison.
 */
export function useOnboardingTelemetry(
  currentStep: OnboardingStep,
  isComplete: boolean,
  previousStepRef: React.MutableRefObject<OnboardingStep | null>,
): void {
  const { track } = useTelemetry();
  const startedRef = useRef(false);
  const completedRef = useRef(false);

  // Fire onboarding_started once on mount (if not done already)
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    track('onboarding_started', {
      step: STEP_LABELS[currentStep] ?? currentStep,
    });
  }, [currentStep, track]);

  // Fire step_viewed / back / completed when step changes
  useEffect(() => {
    const prev = previousStepRef.current;
    if (prev === null) {
      previousStepRef.current = currentStep;
      return;
    }
    if (prev === currentStep) return;

    const stepLabel = STEP_LABELS[currentStep] ?? currentStep;

    // Detect backward navigation
    const stepOrder = ['welcome', 'consent', 'device-tier', 'model-download', 'kid-profile', 'first-homework', 'done'];
    const prevIdx = stepOrder.indexOf(prev);
    const currIdx = stepOrder.indexOf(currentStep);

    if (currIdx < prevIdx) {
      track('onboarding_back_navigated', {
        from: prev,
        to: currentStep,
      });
    } else {
      // Forward transition — previous step was completed
      track('onboarding_step_completed', {
        step: prev,
        step_label: STEP_LABELS[prev] ?? prev,
      });
    }

    // Fire step_viewed for the new step
    track('onboarding_step_viewed', {
      step: currentStep,
      step_label: stepLabel,
    });

    previousStepRef.current = currentStep;
  }, [currentStep, track, previousStepRef]);

  // Fire onboarding_completed
  useEffect(() => {
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      track('onboarding_completed', {
        final_step: currentStep,
      });
    }
  }, [isComplete, currentStep, track]);
}

/**
 * Helper to track a consent_given event from the ConsentScreen.
 * Call this after setOptIn has been called so the event is recorded.
 */
export async function trackConsentGiven(
  track: ReturnType<typeof useTelemetry>['track'],
  telemetryOptIn: boolean,
): Promise<void> {
  await track('consent_given', { telemetryOptIn });
}

/**
 * Helper to track first_homework_submitted from FirstHomeworkScreen.
 */
export async function trackFirstHomeworkSubmitted(
  track: ReturnType<typeof useTelemetry>['track'],
  params?: { subject?: string; level?: string },
): Promise<void> {
  await track('first_homework_submitted', {
    subject: params?.subject ?? 'unknown',
    level: params?.level ?? 'unknown',
  });
}

/**
 * Helper to track first_feedback_received from FeedbackScreen.
 */
export async function trackFirstFeedbackReceived(
  track: ReturnType<typeof useTelemetry>['track'],
  params?: { duration_sec?: number },
): Promise<void> {
  await track('first_feedback_received', {
    duration_sec: params?.duration_sec ?? 0,
  });
}
