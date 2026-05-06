import React, { useState } from 'react';
import { Linking, ScrollView, Switch, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../OnboardingProvider';
import { useTranslation } from 'react-i18next';
import { PRIVACY_POLICY_URL, buildConsentSnapshot } from '../privacy-preferences';

export function ConsentScreen() {
  const { t } = useTranslation();
  const { goNext, goBack, updateProgress } = useOnboarding();
  const [consented, setConsented] = useState(false);
  const [telemetryOptIn, setTelemetryOptIn] = useState(false);

  const continueWithConsent = () => {
    if (!consented) return;

    updateProgress(buildConsentSnapshot({ telemetryOptIn }));
    goNext();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('onboarding.consent.title', 'Privacy & Consent')}</Text>

      <View style={styles.promiseCard}>
        <Text style={styles.promiseTitle}>
          {t('onboarding.consent.promiseTitle', 'Your child’s homework stays on this device')}
        </Text>
        <Text style={styles.body}>
          {t(
            'onboarding.consent.promiseBody',
            'Photos, OCR text, written answers, and AI explanations are processed on this phone or tablet. They are not sent to our servers.',
          )}
        </Text>
      </View>

      <View style={styles.detailList}>
        <Text style={styles.detailItem}>
          {t('onboarding.consent.detailPhotos', '• Homework photos never leave the device.')}
        </Text>
        <Text style={styles.detailItem}>
          {t('onboarding.consent.detailAnswers', '• Typed or written answers stay local.')}
        </Text>
        <Text style={styles.detailItem}>
          {t(
            'onboarding.consent.detailTelemetry',
            '• Anonymous app-health telemetry is optional and starts off.',
          )}
        </Text>
      </View>

      <View style={styles.telemetryRow}>
        <View style={styles.telemetryCopy}>
          <Text style={styles.telemetryTitle}>
            {t('onboarding.consent.telemetryTitle', 'Share anonymous app health data')}
          </Text>
          <Text style={styles.telemetryBody}>
            {t(
              'onboarding.consent.telemetryBody',
              'Helps us fix crashes and download issues. It never includes photos, OCR text, or your child’s answers.',
            )}
          </Text>
        </View>
        <Switch
          value={telemetryOptIn}
          onValueChange={setTelemetryOptIn}
          testID="telemetry-opt-in"
          accessibilityLabel={t(
            'onboarding.consent.telemetryAccessibility',
            'Share anonymous app health data',
          )}
        />
      </View>

      <TouchableOpacity
        style={[styles.checkbox, consented && styles.checkboxActive]}
        onPress={() => setConsented(!consented)}
        testID="consent-checkbox"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consented }}
      >
        <Text style={styles.checkboxLabel}>
          {t('onboarding.consent.accept', 'I agree to the privacy policy')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        testID="privacy-policy-link"
      >
        <Text style={styles.policyLink}>
          {t('onboarding.consent.policyLink', 'Read the full privacy policy')}
        </Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity style={styles.backButton} onPress={goBack} testID="consent-back">
          <Text style={styles.backButtonText}>{t('onboarding.common.back', 'Back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !consented && styles.buttonDisabled]}
          onPress={continueWithConsent}
          disabled={!consented}
          testID="consent-continue"
        >
          <Text style={styles.buttonText}>{t('onboarding.common.next', 'Next')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
  promiseCard: { borderRadius: 8, borderWidth: 1, borderColor: '#B8D7C6', backgroundColor: '#F2FBF5', padding: 16, marginBottom: 16 },
  promiseTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#173B2B' },
  body: { fontSize: 16, lineHeight: 24, marginBottom: 24 },
  detailList: { gap: 8, marginBottom: 20 },
  detailItem: { fontSize: 16, lineHeight: 24, color: '#24332C' },
  telemetryRow: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#D8DDE3', marginBottom: 16 },
  telemetryCopy: { flex: 1 },
  telemetryTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  telemetryBody: { fontSize: 15, lineHeight: 21, color: '#4B5563' },
  checkbox: { padding: 12, marginBottom: 24, borderRadius: 8, borderWidth: 2, borderColor: '#ccc' },
  checkboxActive: { borderColor: '#4A90D9', backgroundColor: '#E8F0FE' },
  checkboxLabel: { fontSize: 16 },
  policyLink: { fontSize: 16, fontWeight: '600', color: '#1F6EB3', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  button: { backgroundColor: '#4A90D9', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12, flex: 1, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  backButton: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', flex: 1, alignItems: 'center' },
  backButtonText: { fontSize: 18, color: '#666' },
});
