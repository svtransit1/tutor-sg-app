/**
 * Sibling Prompt route — Onboarding step 6/10.
 * Route: /onboarding/sibling-prompt
 *
 * Per Article 12 §3.6: Soft prompt to add another child profile.
 * Skippable. Caps at 4 profiles (matches family-plan IAP scope).
 * Integrates with OnboardingProvider for state machine + persistence.
 */
import React, { useCallback } from 'react';
import SiblingPromptScreen from '../../src/screens/onboarding/SiblingPromptScreen';
import { useOnboarding } from '../../src/onboarding';
import { loadChildCount, loadSiblingProfile } from '../../src/storage/onboarding-state';

/**
 * Read sibling profiles from the onboarding-state MMKV store and convert
 * them to the format expected by the onboarding context.
 */
function readSyncedSiblingProfiles() {
  const count = loadChildCount();
  const profiles: Array<{ grade: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6'; subjects: Array<'math' | 'english' | 'chinese' | 'science'> }> = [];
  for (let i = 1; i < count; i++) {
    const p = loadSiblingProfile(i);
    if (p) {
      profiles.push({ grade: p.grade, subjects: p.subjects });
    }
  }
  return profiles;
}

export default function SiblingPromptRoute() {
  const { goNext, updateState } = useOnboarding();

  const handleContinue = useCallback(() => {
    // Sync sibling profiles from screen's MMKV store into onboarding context
    const siblingProfiles = readSyncedSiblingProfiles();
    updateState({
      hasSiblings: siblingProfiles.length > 0,
      siblingProfiles,
    });
    goNext();
  }, [updateState, goNext]);

  const handleSkip = useCallback(() => {
    // No siblings added — mark and proceed
    updateState({ hasSiblings: false });
    goNext();
  }, [updateState, goNext]);

  return (
    <SiblingPromptScreen
      onComplete={handleContinue}
      onSkip={handleSkip}
    />
  );
}
