import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SessionRepository } from '@/storage/sessions';
import type { KidSession } from '@/storage/sessions';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const SUBJECT_ICONS: Record<string, string> = {
  math: '🧮',
  english: '📖',
  science: '🔬',
  chinese: '🀄',
};

function formatTimeAgo(dateStr: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return t('kidHome.recentSessions.timeAgo.justNow');
  if (diffMin < 60) return t('kidHome.recentSessions.timeAgo.minutesAgo', { minutes: diffMin });
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return t('kidHome.recentSessions.timeAgo.hoursAgo', { hours: diffHrs });
  return t('kidHome.recentSessions.timeAgo.yesterday');
}

export default function KidHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [sessions, setSessions] = useState<KidSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const recent = await SessionRepository.getRecentSessions(5);
      setSessions(recent);
    } catch {
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    loadSessions().finally(() => setLoading(false));
  }, [loadSessions]);

  const hasSessions = sessions.length > 0;
  const showEmptyState = !loading && !hasSessions && showWelcomeBanner;

  const handleCameraPress = useCallback(() => {
    router.push('/(kid)/homework-camera');
  }, [router]);

  const handleHistoryPress = useCallback(() => {
    router.push('/(kid)/history');
  }, [router]);

  const handleDismissBanner = useCallback(() => {
    setShowWelcomeBanner(false);
  }, []);

  const bgColor = isDark ? '#121212' : '#F8F9FA';
  const surfaceColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#888888' : '#9CA3AF';
  const borderColor = isDark ? '#333' : '#E5E7EB';
  const primaryColor = isDark ? '#90CAF9' : '#2563EB';

  const renderEmptyState = () => (
    <View
      style={[styles.emptyBanner, { backgroundColor: surfaceColor, borderColor }]}
      accessibilityRole="summary"
      accessibilityLabel={t('kidHome.firstSession.accessibility.welcomeBanner')}
    >
      <Text style={styles.emptyBannerIcon}>🌟</Text>
      <Text style={[styles.emptyBannerTitle, { color: textColor }]}>
        {t('kidHome.firstSession.welcomeTitle')}
      </Text>
      <Text style={[styles.emptyBannerBody, { color: mutedColor }]}>
        {t('kidHome.firstSession.welcomeBody')}
      </Text>

      <View style={styles.emptyCtaGroup}>
        <TouchableOpacity
          style={[styles.primaryCta, { backgroundColor: primaryColor }]}
          onPress={handleCameraPress}
          accessibilityRole="button"
          accessibilityLabel={t('kidHome.firstSession.ctaCamera')}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryCtaText}>
            {t('kidHome.firstSession.ctaCamera')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryCta, { borderColor: primaryColor }]}
          onPress={handleCameraPress}
          accessibilityRole="button"
          accessibilityLabel={t('kidHome.firstSession.ctaPractice')}
          activeOpacity={0.7}
        >
          <Text style={[styles.secondaryCtaText, { color: primaryColor }]}>
            {t('kidHome.firstSession.ctaPractice')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleDismissBanner}
        accessibilityRole="button"
        accessibilityLabel={t('kidHome.firstSession.dismiss')}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={[styles.dismissLink, { color: mutedColor }]}>
          {t('kidHome.firstSession.dismiss')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSessionItem = ({ item }: { item: KidSession }) => (
    <View
      style={[styles.sessionCard, { backgroundColor: surfaceColor, borderColor }]}
      accessibilityRole="summary"
      accessibilityLabel={t('kidHome.accessibility.recentSession', {
        subject: t(`kidHome.subjects.${item.subject}`),
        time: formatTimeAgo(item.createdAt, t),
        questions: item.questionCount,
      })}
    >
      <Text style={styles.sessionIcon}>
        {SUBJECT_ICONS[item.subject] ?? '📚'}
      </Text>
      <View style={styles.sessionInfo}>
        <Text style={[styles.sessionSubject, { color: textColor }]}>
          {t(`kidHome.subjects.${item.subject}`)}
        </Text>
        <Text style={[styles.sessionMeta, { color: mutedColor }]}>
          {t('kidHome.recentSessions.questions', { count: item.questionCount })}
        </Text>
      </View>
      <Text style={[styles.sessionTime, { color: mutedColor }]}>
        {formatTimeAgo(item.createdAt, t)}
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor },
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: textColor }]}>
              {t('kidHome.header.greeting', { name: t('app.name') })}
            </Text>
            <View style={[styles.levelBadge, { backgroundColor: isDark ? '#1B3D1B' : '#E8F5E9' }]}>
              <Text style={[styles.levelText, { color: isDark ? '#81C784' : '#2E7D32' }]}>
                {t('kidHome.header.levelBadge', { level: 1 })}
              </Text>
            </View>
          </View>
          <LanguageSwitcher />
        </View>

        {/* Snap Homework tile */}
        <TouchableOpacity
          style={[styles.cameraTile, { backgroundColor: surfaceColor, borderColor }]}
          onPress={handleCameraPress}
          accessibilityRole="button"
          accessibilityLabel={t('kidHome.camera.accessibility')}
          activeOpacity={0.7}
        >
          <View style={[styles.cameraIconContainer, { backgroundColor: isDark ? '#1A2A4A' : '#EBF2FF' }]}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
          <View style={styles.cameraTileText}>
            <Text style={[styles.cameraTileTitle, { color: textColor }]}>
              {t('kidHome.camera.title')}
            </Text>
            <Text style={[styles.cameraTileSubtitle, { color: mutedColor }]}>
              {t('kidHome.camera.subtitle')}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: mutedColor }]}>›</Text>
        </TouchableOpacity>

        {/* Empty state / Recent sessions */}
        {showEmptyState && renderEmptyState()}

        {hasSessions && (
          <View style={styles.sessionsSection}>
            <View style={styles.sessionsHeader}>
              <Text style={[styles.sessionsTitle, { color: textColor }]}>
                {t('kidHome.recentSessions.title')}
              </Text>
              <TouchableOpacity
                onPress={handleHistoryPress}
                accessibilityRole="button"
                accessibilityLabel={t('kidHome.accessibility.viewAll')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.viewAllLink, { color: primaryColor }]}>
                  {t('kidHome.recentSessions.viewAll')}
                </Text>
              </TouchableOpacity>
            </View>

            {sessions.map((session) => (
              <View key={session.id}>
                {renderSessionItem({ item: session })}
              </View>
            ))}
          </View>
        )}

        {/* Bottom spacer for scroll comfort */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } satisfies ViewStyle,

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  } satisfies ViewStyle,

  // ── Header ──

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  } satisfies ViewStyle,

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  } satisfies ViewStyle,

  greeting: {
    fontSize: 22,
    fontWeight: '700',
  } satisfies TextStyle,

  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  } satisfies ViewStyle,

  levelText: {
    fontSize: 12,
    fontWeight: '600',
  } satisfies TextStyle,

  // ── Camera tile ──

  cameraTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  } satisfies ViewStyle,

  cameraIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  } satisfies ViewStyle,

  cameraIcon: {
    fontSize: 26,
  } satisfies TextStyle,

  cameraTileText: {
    flex: 1,
    gap: 3,
  } satisfies ViewStyle,

  cameraTileTitle: {
    fontSize: 17,
    fontWeight: '700',
  } satisfies TextStyle,

  cameraTileSubtitle: {
    fontSize: 13,
  } satisfies TextStyle,

  chevron: {
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 8,
  } satisfies TextStyle,

  // ── Empty state (first-session banner) ──

  emptyBanner: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  } satisfies ViewStyle,

  emptyBannerIcon: {
    fontSize: 48,
    marginBottom: 16,
  } satisfies TextStyle,

  emptyBannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  } satisfies TextStyle,

  emptyBannerBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  } satisfies TextStyle,

  emptyCtaGroup: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  } satisfies ViewStyle,

  primaryCta: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  } satisfies ViewStyle,

  primaryCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  } satisfies TextStyle,

  secondaryCta: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
  } satisfies ViewStyle,

  secondaryCtaText: {
    fontSize: 15,
    fontWeight: '600',
  } satisfies TextStyle,

  dismissLink: {
    fontSize: 13,
    textDecorationLine: 'underline',
  } satisfies TextStyle,

  // ── Recent sessions ──

  sessionsSection: {
    marginBottom: 8,
  } satisfies ViewStyle,

  sessionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  } satisfies ViewStyle,

  sessionsTitle: {
    fontSize: 17,
    fontWeight: '700',
  } satisfies TextStyle,

  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
  } satisfies TextStyle,

  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  } satisfies ViewStyle,

  sessionIcon: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  } satisfies TextStyle,

  sessionInfo: {
    flex: 1,
    gap: 2,
    marginLeft: 8,
  } satisfies ViewStyle,

  sessionSubject: {
    fontSize: 15,
    fontWeight: '600',
  } satisfies TextStyle,

  sessionMeta: {
    fontSize: 13,
  } satisfies TextStyle,

  sessionTime: {
    fontSize: 12,
  } satisfies TextStyle,

  bottomSpacer: {
    height: 32,
  } satisfies ViewStyle,
});
