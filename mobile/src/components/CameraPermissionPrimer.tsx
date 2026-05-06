/**
 * CameraPermissionPrimer — kid-friendly permission primer screen
 *
 * Shown BEFORE the system camera permission dialog. Explains why the
 * app needs camera access in kid-appropriate language, then triggers
 * the system permission request on CTA tap.
 *
 * Flow:
 * 1. Primer shown (kid sees friendly explanation)
 * 2. Kid taps "Allow Camera" → triggers system permission dialog
 * 3. If granted → camera preview shows (parent navigates or passes callback)
 * 4. If denied → ErrorScreen with "Enable camera access" (handled by caller)
 *
 * Bilingual: all strings via i18n (EN + zh-Hans).
 * Kid-safe: no analytics, no network calls.
 * Accessibility: VoiceOver/TalkBack labels, role="alert" container.
 * Dark mode: full support via useColorScheme.
 *
 * @see ADD §4.1 — Camera homework check flow (permission primer pattern)
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Props ──────────────────────────────────────────────────────────

export interface CameraPermissionPrimerProps {
  /** Called when kid taps the primary "Allow Camera" button */
  onAllow: () => void;
  /** Called when kid taps the "Not now" secondary button */
  onSkip: () => void;
  /** Optional custom container style */
  style?: ViewStyle;
}

// ── Component ──────────────────────────────────────────────────────

export default function CameraPermissionPrimer({
  onAllow,
  onSkip,
  style,
}: CameraPermissionPrimerProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#F0F7FF' },
        { paddingTop: insets.top, paddingBottom: insets.bottom + 16 },
        style,
      ]}
      accessibilityRole="alert"
      accessibilityLabel={t('cameraScreen.primer.accessibility')}
    >
      {/* Top illustration area */}
      <View style={styles.illustrationArea}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isDark ? '#1E3A5F' : '#E3F2FD',
              borderColor: isDark ? '#2A4A7A' : '#BBDEFB',
            },
          ]}
        >
          <Text style={styles.icon}>📷</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentArea}>
        {/* Title */}
        <Text
          style={[
            styles.title,
            { color: isDark ? '#FFFFFF' : '#1A1A1A' },
          ]}
          accessibilityRole="header"
        >
          {t('cameraScreen.primer.title')}
        </Text>

        {/* Body */}
        <Text
          style={[
            styles.body,
            { color: isDark ? '#B0B0B0' : '#4A5568' },
          ]}
        >
          {t('cameraScreen.primer.body')}
        </Text>

        {/* Privacy note */}
        <View
          style={[
            styles.privacyNote,
            {
              backgroundColor: isDark ? '#1A2A2A' : '#E8F5E9',
              borderColor: isDark ? '#2A4A3A' : '#C8E6C9',
            },
          ]}
          accessibilityRole="summary"
          accessibilityLabel={t('cameraScreen.primer.privacyNote')}
        >
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text
            style={[
              styles.privacyText,
              { color: isDark ? '#A5D6A7' : '#2E7D32' },
            ]}
          >
            {t('cameraScreen.primer.privacyNote')}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsArea}>
        {/* Primary: Allow Camera */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: isDark ? '#2563EB' : '#4A90D9' },
          ]}
          onPress={onAllow}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('cameraScreen.primer.cta')}
        >
          <Text style={styles.primaryButtonIcon}>📸</Text>
          <Text style={styles.primaryButtonText}>
            {t('cameraScreen.primer.cta')}
          </Text>
        </TouchableOpacity>

        {/* Secondary: Not now */}
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              borderColor: isDark ? '#555' : '#D1D5DB',
              backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
            },
          ]}
          onPress={onSkip}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('cameraScreen.primer.secondary')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              { color: isDark ? '#AAAAAA' : '#6B7280' },
            ]}
          >
            {t('cameraScreen.primer.secondary')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  } satisfies ViewStyle,

  // ── Illustration Area ──
  illustrationArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  } satisfies ViewStyle,
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  } satisfies ViewStyle,
  icon: {
    fontSize: 56,
  } satisfies TextStyle,

  // ── Content Area ──
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 24,
  } satisfies ViewStyle,
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.3,
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 12,
  } satisfies TextStyle,

  // ── Privacy Note ──
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  } satisfies ViewStyle,
  privacyIcon: {
    fontSize: 18,
  } satisfies TextStyle,
  privacyText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    flexShrink: 1,
  } satisfies TextStyle,

  // ── Actions Area ──
  actionsArea: {
    gap: 12,
    paddingBottom: 8,
  } satisfies ViewStyle,

  // ── Primary Button ──
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 16,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  } satisfies ViewStyle,
  primaryButtonIcon: {
    fontSize: 22,
  } satisfies TextStyle,
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  } satisfies TextStyle,

  // ── Secondary Button ──
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
  } satisfies ViewStyle,
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  } satisfies TextStyle,
});
