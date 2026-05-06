import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const handleGetStarted = () => {
    router.push('/(onboarding)/language-select');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        {/* App logo — icon + label pair */}
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: isDark ? '#1E3A5F' : '#E8F4FD' },
          ]}
          accessibilityRole="image"
          accessibilityLabel="tutor-sg"
        >
          <Text style={styles.logoIcon}>📚</Text>
        </View>

        {/* Title with icon */}
        <View style={styles.titleRow}>
          <Text style={styles.titleIcon}>✨</Text>
          <Text
            style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}
            accessibilityRole="header"
          >
            {t('onboarding.welcome.title')}
          </Text>
        </View>

        {/* Tagline — subtitle appears as the tagline per spec */}
        <View style={styles.taglineRow}>
          <Text style={styles.taglineIcon}>🎯</Text>
          <Text
            style={[styles.subtitle, { color: isDark ? '#B0B0B0' : '#666666' }]}
          >
            {t('onboarding.welcome.tagline')}
          </Text>
        </View>

        {/* Description text */}
        <Text
          style={[styles.description, { color: isDark ? '#888888' : '#999999' }]}
        >
          {t('onboarding.welcome.subtitle')}
        </Text>
      </View>

      {/* CTA Button with icon */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isDark ? '#4A90D9' : '#2563EB' }]}
        onPress={handleGetStarted}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.welcome.cta')}
        activeOpacity={0.8}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.buttonIcon}>🚀</Text>
          <Text style={styles.buttonText}>
            {t('onboarding.welcome.cta')}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 56,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  titleIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  taglineIcon: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
