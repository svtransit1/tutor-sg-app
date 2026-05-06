import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useOnboarding } from '../OnboardingProvider';
import { OnboardingStep, STEP_CONFIG } from '../types';
import { WelcomeScreen } from './WelcomeScreen';
import { ConsentScreen } from './ConsentScreen';
import { DeviceTierScreen } from './DeviceTierScreen';
import { ModelDownloadScreen } from './ModelDownloadScreen';
import { KidProfileScreen } from './KidProfileScreen';
import { FirstHomeworkScreen } from './FirstHomeworkScreen';
import { DoneScreen } from './DoneScreen';

const STEP_SCREENS: Record<OnboardingStep, React.ComponentType> = {
  welcome: WelcomeScreen,
  consent: ConsentScreen,
  'device-tier': DeviceTierScreen,
  'model-download': ModelDownloadScreen,
  'kid-profile': KidProfileScreen,
  'first-homework': FirstHomeworkScreen,
  done: DoneScreen,
};

/**
 * Renders the current onboarding step screen.
 * Back-navigation header is shown only for reversible steps.
 */
export function OnboardingOrchestrator() {
  const { state, goBack, canGoBack } = useOnboarding();
  const StepScreen = useMemo(() => STEP_SCREENS[state.currentStep], [state.currentStep]);
  const config = STEP_CONFIG[state.currentStep];

  return (
    <View style={styles.container}>
      {canGoBack && config.reversible ? (
        <View style={styles.backNav}>
          {/* Back button rendered by individual screens */}
        </View>
      ) : null}
      <StepScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backNav: { height: 0 }, // reserved for back nav if needed
});
