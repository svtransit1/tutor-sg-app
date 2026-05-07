import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../OnboardingProvider';

export function DoneScreen() {
  const { t } = useTranslation();
  const { state, goNext } = useOnboarding();

  const handleStart = () => {
    goNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('onboarding.done.title', 'All set!')}
      </Text>
      <Text style={styles.subtitle}>
        {t('onboarding.done.subtitle', 'Your AI tutor is ready.')}
      </Text>
      {state.kidName ? (
        <Text style={styles.greeting}>
          {t('onboarding.done.greeting', `Hi ${state.kidName}! Let's learn!`)}
        </Text>
      ) : null}
      <TouchableOpacity style={styles.button} testID="done-start" onPress={handleStart}>
        <Text style={styles.buttonText}>
          {t('onboarding.done.cta', 'Start learning')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 18, marginBottom: 16, textAlign: 'center' },
  greeting: { fontSize: 20, marginBottom: 32, textAlign: 'center', color: '#4A90D9' },
  button: { backgroundColor: '#4A90D9', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
