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
    router.push('/(onboarding)/consent');
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
        {/* Logo icon */}
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: isDark ? '#1E3A5F' : '#E8F4FD' },
          ]}
        >
          <Text style={styles.logoIcon} accessibilityRole="image" accessibilityLabel="Tutor SG app logo">
            📚
          </Text>
        </View>

        {/* Title & subtitle */}
        <Text
          style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}
          accessibilityRole="header"
        >
          {t('onboarding.welcome')}
        </Text>
        <Text
          style={[styles.subtitle, { color: isDark ? '#B0B0B0' : '#666666' }]}
          accessibilityRole="text"
        >
          {t('onboarding.welcomeSubtitle')}
        </Text>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isDark ? '#4A90D9' : '#2563EB' }]}
        onPress={handleGetStarted}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.getStarted')}
        activeOpacity={0.8}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <Text style={styles.buttonText}>
          {t('onboarding.getStarted')}
        </Text>
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
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
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
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
