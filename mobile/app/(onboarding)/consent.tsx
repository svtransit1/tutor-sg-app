import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Switch,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIVACY_POLICY_URL = 'https://tutor-sg.app/privacy'; // TODO: Boss to finalize

export default function ConsentScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);

  const handleOpenPrivacy = () => {
    Linking.openURL(PRIVACY_POLICY_URL);
  };

  const handleContinue = () => {
    // TODO: persist telemetryEnabled flag (MMKV/AsyncStorage) for Sentry init (AAAS-26)
    // Navigate to next onboarding step (step 3/7)
    // router.push('/(onboarding)/next-step');
  };

  const cardBg = isDark ? '#1E1E1E' : '#F5F5F5';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const subtitleColor = isDark ? '#B0B0B0' : '#666666';
  const bodyColor = isDark ? '#CCCCCC' : '#444444';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={[styles.title, { color: textColor }]} accessibilityRole="header">
          {t('onboarding.consent.title')}
        </Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>
          {t('onboarding.consent.subtitle')}
        </Text>

        {/* Device-only card */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            {t('onboarding.consent.deviceOnlyTitle')}
          </Text>
          <Text style={[styles.cardBody, { color: bodyColor }]}>
            {t('onboarding.consent.deviceOnlyBody')}
          </Text>
        </View>

        {/* Telemetry card */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: textColor, flex: 1 }]}>
              {t('onboarding.consent.telemetryTitle')}
            </Text>
            <Switch
              value={telemetryEnabled}
              onValueChange={setTelemetryEnabled}
              trackColor={{ false: '#767577', true: '#4A90D9' }}
              thumbColor={isDark ? '#f4f3f4' : '#ffffff'}
              accessibilityRole="switch"
              accessibilityLabel={
                telemetryEnabled
                  ? t('onboarding.consent.telemetryToggleOn')
                  : t('onboarding.consent.telemetryToggleOff')
              }
            />
          </View>
          <Text style={[styles.cardBody, { color: bodyColor }]}>
            {telemetryEnabled
              ? t('onboarding.consent.telemetryToggleOn')
              : t('onboarding.consent.telemetryToggleOff')}
          </Text>
        </View>

        {/* Privacy policy link */}
        <TouchableOpacity
          onPress={handleOpenPrivacy}
          style={styles.linkRow}
          accessibilityRole="link"
          accessibilityLabel={t('onboarding.consent.privacyPolicyLink')}
          activeOpacity={0.6}
        >
          <Text style={[styles.linkText, { color: '#2563EB' }]}>
            {t('onboarding.consent.privacyPolicyLink')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Continue button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isDark ? '#4A90D9' : '#2563EB' }]}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.consent.continue')}
          activeOpacity={0.8}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.buttonText}>
            {t('onboarding.consent.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  linkRow: {
    paddingVertical: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingBottom: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
