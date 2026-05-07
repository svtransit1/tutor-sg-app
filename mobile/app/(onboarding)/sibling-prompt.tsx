/**
 * Sibling Prompt route — Onboarding step 6/11.
 * Route: /onboarding/sibling-prompt
 *
 * Per Article 08 (The One Metric): early sibling detection for family-plan
 * north-star metric. After user chooses, stores intent and navigates.
 */
import React, { useCallback } from 'react';
import SiblingPromptScreen from '../../src/screens/onboarding/SiblingPromptScreen';
import { useOnboarding } from '../../src/onboarding';

export default function SiblingPromptRoute() {
  const { goNext, updateState } = useOnboarding();

  const handleAdd = useCallback(() => {
    updateState({ hasSiblings: true });
    goNext();
  }, [updateState, goNext]);

  const handleSkip = useCallback(() => {
    updateState({ hasSiblings: false });
    goNext();
  }, [updateState, goNext]);

  return (
    <SiblingPromptScreen
      onAdd={handleAdd}
      onSkip={handleSkip}
    />
  );
}
