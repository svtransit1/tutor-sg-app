/**
 * DoneScreen / Ready Landing — Onboarding step 7/7.
 *
 * The final onboarding screen. Shows a celebration greeting, the camera CTA
 * as the primary action, and secondary subject tiles for practice questions.
 *
 * Route: /(onboarding)/done
 *
 * Layout (top to bottom):
 * 1. OnboardingProgressIndicator (step 7/7)
 * 2. Celebration circle + "All set!" title
 * 3. Greeting with kid name: "Hi [name]! Ready to learn?"
 * 4. Large camera CTA tile (primary action)
 * 5. Subject practice tiles row (secondary actions)
 * 6. "Parent area" link (PIN-gated)
 *
 * Behaviour:
 * - Tapping camera CTA marks onboarding complete + navigates to camera
 * - Tapping a subject tile marks onboarding complete + navigates to kid home
 * - "Parent area" link navigates to PIN-gated parent dashboard
 *
 * Bilingual: all strings via i18n (EN + zh-Hans).
 * Accessibility: VoiceOver/TalkBack labels on all interactive elements.
 */

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnboardingProgressIndicator from '@/components/OnboardingProgressIndicator';

// ── Subject Tile Config ─────────────────────────────────────────

interface PracticeTile {
  id: 'math' | 'english' | 'science' | 'chinese';
  icon: string;
  color: string;
  darkColor: string;
}

const PRACTICE_TILES: PracticeTile[] = [
  { id: 'math', icon: '🧮', color: '#E8F5E9', darkColor: '#1B3D1B' },
  { id: 'english', icon: '📖', color: '#E3F2FD', darkColor: '#1A2A4A' },
  { id: 'science', icon: '🔬', color: '#FFF3E0', darkColor: '#4A2A00' },
  { id: 'chinese', icon: '🀄', color: '#FCE4EC', darkColor: '#4A1A2A' },
];

// ── Screen ──────────────────────────────────────────────────────

export default function DoneScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  // TODO: Replace with actual kid name from onboarding state/profile store
  const kidName = 'Alex';

  const handleCameraPress = () => {
    // Mark onboarding complete and navigate to camera
    // TODO: Persist onboarding completed flag via MMKV
    router.replace('/(kid)/camera');
  };

  const handleSubjectPress = (_subjectId: string) => {
    // Mark onboarding complete and navigate to kid home
    // TODO: Persist onboarding completed flag via MMKV
    router.replace('/(kid)/home');
  };

  const handleParentAreaPress = () => {
    // Navigate to parent dashboard (PIN-gated)
    router.push('/(parent)/dashboard');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* Step indicator */}
      <OnboardingProgressIndicator currentStep={7} totalSteps={7} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration icon */}
        <View
          style={[
            styles.celebrationCircle,
            { backgroundColor: isDark ? '#1E3A5F' : '#E8F4FD' },
          ]}
          accessibilityRole="image"
          accessibilityLabel="Celebration star"
        >
          <Text style={styles.celebrationIcon}>⭐</Text>
        </View>

        {/* Title & subtitle */}
        <Text
          style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}
          accessibilityRole="header"
        >
          {t('onboarding.done.title')}
        </Text>
        <Text
          style={[styles.subtitle, { color: isDark ? '#B0B0B0' : '#666666' }]}
        >
          {t('onboarding.done.subtitle')}
        </Text>

        {/* Greeting with kid name */}
        <Text
          style={[styles.greeting, { color: isDark ? '#E0E0E0' : '#444444' }]}
        >
          {t('onboarding.done.greeting', { name: kidName })}
        </Text>

        {/* Hero Camera CTA */}
        <TouchableOpacity
          style={[
            styles.cameraButton,
            { backgroundColor: isDark ? '#2563EB' : '#4A90D9' },
          ]}
          onPress={handleCameraPress}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.done.cameraCta')}
          activeOpacity={0.8}
        >
          <View style={styles.cameraButtonContent}>
            <Text style={styles.cameraIcon}>📷</Text>
            <View style={styles.cameraTextBlock}>
              <Text style={styles.cameraTitle}>
                {t('onboarding.done.cameraCta')}
              </Text>
              <Text style={styles.cameraSubtitle}>
                {t('onboarding.done.cameraSubtitle')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Practice question prompt */}
        <Text
          style={[
            styles.practicePrompt,
            { color: isDark ? '#888888' : '#9CA3AF' },
          ]}
        >
          {t('onboarding.done.practicePrompt')}
        </Text>

        {/* Subject practice tiles (horizontal row) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectTilesRow}
        >
          {PRACTICE_TILES.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={[
                styles.subjectTile,
                {
                  backgroundColor: isDark ? tile.darkColor : tile.color,
                  borderColor: isDark ? 'transparent' : '#E5E7EB',
                },
              ]}
              onPress={() => handleSubjectPress(tile.id)}
              accessibilityRole="button"
              accessibilityLabel={t(`kidHome.subjects.${tile.id}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.subjectIcon}>{tile.icon}</Text>
              <Text
                style={[
                  styles.subjectTitle,
                  { color: isDark ? '#FFFFFF' : '#1A1A1A' },
                ]}
              >
                {t(`kidHome.subjects.${tile.id}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Parent area link — fixed at bottom */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity
          onPress={handleParentAreaPress}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.done.parentArea')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text
            style={[
              styles.parentAreaLink,
              { color: isDark ? '#90CAF9' : '#2563EB' },
            ]}
          >
            {t('onboarding.done.parentArea')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // Celebration
  celebrationCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  celebrationIcon: {
    fontSize: 40,
  },

  // Text
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  greeting: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },

  // Camera CTA
  cameraButton: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cameraIcon: {
    fontSize: 32,
  },
  cameraTextBlock: {
    flex: 1,
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cameraSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.85,
  },

  // Subject tiles
  practicePrompt: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 14,
  },
  subjectTilesRow: {
    gap: 12,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  subjectTile: {
    width: 110,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  subjectIcon: {
    fontSize: 32,
  },
  subjectTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  parentAreaLink: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
