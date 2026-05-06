import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingProvider';
import { useTranslation } from 'react-i18next';

export function WelcomeScreen() {
  const { t } = useTranslation();
  const { goNext } = useOnboarding();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.welcome.title', 'Welcome!')}</Text>
      <Text style={styles.subtitle}>
        {t('onboarding.welcome.subtitle', 'Your AI tutor is ready to help')}
      </Text>
      <TouchableOpacity style={styles.button} onPress={goNext} testID="welcome-continue">
        <Text style={styles.buttonText}>{t('onboarding.common.next', 'Next')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32, textAlign: 'center' },
  button: { backgroundColor: '#4A90D9', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
