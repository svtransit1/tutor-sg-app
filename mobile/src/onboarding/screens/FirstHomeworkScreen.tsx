import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingProvider';
import { useTranslation } from 'react-i18next';

export function FirstHomeworkScreen() {
  const { t } = useTranslation();
  const { goNext } = useOnboarding();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('onboarding.firstHomework.title', 'Try your first homework!')}
      </Text>
      <Text style={styles.subtitle}>
        {t(
          'onboarding.firstHomework.subtitle',
          'Snap a photo of your homework and get AI-powered help.',
        )}
      </Text>
      <View style={styles.steps}>
        <Text style={styles.stepText}>
          {t('onboarding.firstHomework.step1', '1. Point your camera at the homework')}
        </Text>
        <Text style={styles.stepText}>
          {t('onboarding.firstHomework.step2', '2. Take a clear photo')}
        </Text>
        <Text style={styles.stepText}>
          {t('onboarding.firstHomework.step3', '3. Get hints and guidance — not just answers!')}
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={goNext} testID="firstHomework-start">
        <Text style={styles.buttonText}>
          {t('onboarding.firstHomework.cta', "Let's go!")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 32, textAlign: 'center' },
  steps: { marginBottom: 32, alignItems: 'flex-start', alignSelf: 'stretch' },
  stepText: { fontSize: 16, marginBottom: 12, lineHeight: 24 },
  button: { backgroundColor: '#4A90D9', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
