/**
 * Kid Home Screen — post-onboarding landing page.
 *
 * Layout (top to bottom):
 * 1. Header: kid name + level badge + language switcher
 * 2. 4 subject tiles in a 2x2 grid (Math, English, Science, Chinese MT)
 * 3. Hero camera button ("Snap Homework" / 拍照问功课)
 * 4. First-session welcome banner (only on first visit with no sessions)
 *    OR Recent sessions list (last 3)
 *
 * Empty state modes:
 * - First visit + zero sessions → full "Welcome! Start here" hero with CTA
 * - Return visit + zero sessions → subtle "No sessions yet" text
 *
 * Accessibility: VoiceOver/TalkBack labels on all interactive elements.
 * Min touch target 44pt per ADD xA79.
 * Bilingual: all strings via i18n (EN + zh-Hans).
 */

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getRecentSessions } from '@/storage/sessions';
import type { KidSession } from '@/storage/sessions';
import {
  isFirstHomeVisit,
  markFirstHomeVisitComplete,
} from '@/storage/onboarding-state';

// --- Subject Tile Config ------------------------------------------------

interface SubjectTile {
  id: 'math' | 'english' | 'science' | 'chinese';
  icon: string;
  color: string;
  darkColor: string;
}

const SUBJECTS: SubjectTile[] = [
  { id: 'math', icon: '🧮', color: '#E8F5E9', darkColor: '#1B3D1B' },
  { id: 'english', icon: '📖', color: '#E3F2FD', darkColor: '#1A2A4A' },
  { id: 'science', icon: '🔬', color: '#FFF3E0', darkColor: '#4A2A00' },
  { id: 'chinese', icon: '🀄', color: '#FCE4EC', darkColor: '#4A1A2A' },
];

const SUBJECT_ICONS: Record<string, string> = {
  math: '🧮',
  english: '📖',
  science: '🔬',
  chinese: '🀄',
};

// --- Time Ago Helper ----------------------------------------------------

function timeAgo(dateStr: string, t: (key: string, opts?: object) => string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return t('kidHome.recentSessions.timeAgo.justNow');
  if (diffMin < 60) return t('kidHome.recentSessions.timeAgo.minutesAgo', { minutes: diffMin });
  if (diffHr < 24) return t('kidHome.recentSessions.timeAgo.hoursAgo', { hours: diffHr });
  return t('kidHome.recentSessions.timeAgo.yesterday');
}

// --- Screen -------------------------------------------------------------

export default function KidHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [sessions, setSessions] = useState<KidSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Welcome banner visibility — shown on first-ever home screen visit
  // when there are no sessions yet. Dismissed by user action or after
  // a session is created (on next refresh).
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeInitDone, setWelcomeInitDone] = useState(false);

  // Demo data: kid name + level (will be replaced from profile storage)
  const kidName = 'Alex';
  const kidLevel = 3;

  const loadSessions = useCallback(async () => {
    try {
      const recent = await getRecentSessions(3);
      setSessions(recent);
    } catch {
      setSessions([]);
    }
  }, []);

  // Initialise welcome state on mount
  useEffect(() => {
    loadSessions().then(() => {
      const firstVisit = isFirstHomeVisit();
      setShowWelcome(firstVisit);
      setWelcomeInitDone(true);
    });
  }, [loadSessions]);

  // If sessions appear (e.g. after navigating back from camera),
  // auto-dismiss the welcome banner.
  useEffect(() => {
    if (sessions.length > 0 && showWelcome) {
      setShowWelcome(false);
      markFirstHomeVisitComplete();
    }
  }, [sessions, showWelcome]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  }, [loadSessions]);

  const handleSwitchLanguage = () => {
    const current = i18n.language;
    const next = current === 'zh-Hans' ? 'en' : 'zh-Hans';
    i18n.changeLanguage(next);
  };

  const handleCameraPress = () => {
    // Dismiss welcome when user takes action
    if (showWelcome) {
      setShowWelcome(false);
      markFirstHomeVisitComplete();
    }
    router.push('/(kid)/camera');
  };

  const handleSubjectPress = (_subjectId: string) => {
    handleCameraPress();
  };

  const handlePracticePress = (_subjectId: string) => {
    // Mark first visit done and start a practice session
    if (showWelcome) {
      setShowWelcome(false);
      markFirstHomeVisitComplete();
    }
    // For now, navigate to camera as the practice entry point.
    // Future: route to a subject-specific practice flow.
    router.push('/(kid)/camera');
  };

  const handleDismissWelcome = () => {
    setShowWelcome(false);
    markFirstHomeVisitComplete();
  };

  const handleViewAllHistory = () => {
    router.push('/(kid)/history');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#F8F9FA' },
        { paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: 20 }]}>
        <View style={styles.headerLeft}>
          <Text
            style={[styles.greeting, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}
            accessibilityRole="header"
          >
            {t('kidHome.header.greeting', { name: kidName })}
          </Text>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: isDark ? '#2A4A7A' : '#E8F4FD' },
            ]}
          >
            <Text
              style={[styles.levelText, { color: isDark ? '#90CAF9' : '#2563EB' }]}
              accessibilityLabel={t('kidHome.header.levelBadge', { level: kidLevel })}
            >
              {t('kidHome.header.levelBadge', { level: kidLevel })}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.langButton, { backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF' }]}
          onPress={handleSwitchLanguage}
          accessibilityRole="button"
          accessibilityLabel={t('kidHome.header.switchLanguage')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.langText, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
            {i18n.language === 'zh-Hans' ? 'EN' : '中文'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#FFFFFF' : '#4A90D9'}
          />
        }
      >
        {/* Subject Tiles (2x2 grid) */}
        <View style={styles.subjectsGrid}>
          {SUBJECTS.map((subject) => (
            <TouchableOpacity
              key={subject.id}
              style={[
                styles.subjectTile,
                {
                  backgroundColor: isDark ? subject.darkColor : subject.color,
                  borderColor: isDark ? 'transparent' : '#E5E7EB',
                  // Dim subject tiles on first visit — activate after first session
                  opacity: showWelcome ? 0.45 : 1,
                },
              ]}
              onPress={() => handleSubjectPress(subject.id)}
              accessibilityRole="button"
              accessibilityLabel={t('kidHome.accessibility.subjectTile', {
                subject: t(`kidHome.subjects.${subject.id}`),
              })}
              activeOpacity={0.7}
            >
              <Text style={styles.subjectIcon}>{subject.icon}</Text>
              <Text style={[styles.subjectTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                {t(`kidHome.subjects.${subject.id}`)}
              </Text>
              <Text
                style={[styles.subjectDescription, { color: isDark ? '#AAAAAA' : '#6B7280' }]}
                numberOfLines={2}
              >
                {t(`kidHome.subjectsDescriptions.${subject.id}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hint text when subject tiles are dimmed (first visit) */}
        {showWelcome && (
          <Text
            style={[
              styles.subjectsHint,
              { color: isDark ? '#888888' : '#9CA3AF' },
            ]}
            accessibilityRole="text"
          >
            {t('kidHome.firstSession.subjectsHint')}
          </Text>
        )}

        {/* Hero Camera Button */}
        <TouchableOpacity
          style={[
            styles.cameraButton,
            {
              backgroundColor: isDark ? '#2563EB' : '#4A90D9',
              // Extra prominence on first visit when welcome hero is shown
              ...(showWelcome ? { shadowOpacity: 0.45, elevation: 8 } : {}),
            },
          ]}
          onPress={handleCameraPress}
          accessibilityRole="button"
          accessibilityLabel={t('kidHome.camera.accessibility')}
          activeOpacity={0.8}
        >
          <View style={styles.cameraButtonContent}>
            <Text style={styles.cameraIcon}>📷</Text>
            <View style={styles.cameraTextBlock}>
              <Text style={styles.cameraTitle}>{t('kidHome.camera.title')}</Text>
              <Text style={styles.cameraSubtitle}>{t('kidHome.camera.subtitle')}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bottom Section: Welcome Banner OR Recent Sessions */}
        {welcomeInitDone && showWelcome && sessions.length === 0 ? (
          /* ── First-Session Welcome Hero ── */
          <View
            style={[
              styles.welcomeHero,
              { backgroundColor: isDark ? '#1A2A3A' : '#E8F4FD' },
            ]}
            accessibilityRole="summary"
            accessibilityLabel={t('kidHome.firstSession.accessibility.welcomeBanner')}
          >
            {/* Celebration icon */}
            <View
              style={[
                styles.welcomeCircle,
                { backgroundColor: isDark ? '#2A4A7A' : '#FFFFFF' },
              ]}
            >
              <Text style={styles.welcomeCircleIcon}>🚀</Text>
            </View>

            {/* Welcome title */}
            <Text
              style={[styles.welcomeTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}
            >
              {t('kidHome.firstSession.welcomeTitle')}
            </Text>

            {/* Welcome body */}
            <Text
              style={[
                styles.welcomeBody,
                { color: isDark ? '#B0B0B0' : '#555555' },
              ]}
            >
              {t('kidHome.firstSession.welcomeBody')}
            </Text>

            {/* Primary CTA: take first homework photo */}
            <TouchableOpacity
              style={[
                styles.firstSessionCta,
                { backgroundColor: isDark ? '#2563EB' : '#4A90D9' },
              ]}
              onPress={handleCameraPress}
              accessibilityRole="button"
              accessibilityLabel={t('kidHome.firstSession.ctaCamera')}
              activeOpacity={0.8}
            >
              <Text style={styles.firstSessionCtaIcon}>📸</Text>
              <Text style={styles.firstSessionCtaText}>
                {t('kidHome.firstSession.ctaCamera')}
              </Text>
            </TouchableOpacity>

            {/* Practice question prompt + subject chips */}
            <Text
              style={[
                styles.practicePrompt,
                { color: isDark ? '#888888' : '#9CA3AF' },
              ]}
            >
              {t('kidHome.firstSession.ctaPractice')}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.practiceChipsRow}
            >
              {SUBJECTS.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.practiceChip,
                    {
                      backgroundColor: isDark ? subject.darkColor : subject.color,
                      borderColor: isDark ? 'transparent' : '#D1D5DB',
                    },
                  ]}
                  onPress={() => handlePracticePress(subject.id)}
                  accessibilityRole="button"
                  accessibilityLabel={t(
                    'kidHome.firstSession.accessibility.practiceTile',
                    { subject: t(`kidHome.subjects.${subject.id}`) },
                  )}
                  activeOpacity={0.7}
                >
                  <Text style={styles.practiceChipIcon}>{subject.icon}</Text>
                  <Text
                    style={[
                      styles.practiceChipLabel,
                      { color: isDark ? '#FFFFFF' : '#1A1A1A' },
                    ]}
                  >
                    {t(`kidHome.subjects.${subject.id}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Dismiss link */}
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismissWelcome}
              accessibilityRole="button"
              accessibilityLabel={t('kidHome.firstSession.dismiss')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text
                style={[
                  styles.dismissText,
                  { color: isDark ? '#90CAF9' : '#6B7280' },
                ]}
              >
                {t('kidHome.firstSession.dismiss')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Recent Sessions ── */
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={[styles.recentTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                {t('kidHome.recentSessions.title')}
              </Text>
              {sessions.length > 0 && (
                <TouchableOpacity
                  onPress={handleViewAllHistory}
                  accessibilityRole="button"
                  accessibilityLabel={t('kidHome.accessibility.subjectTile', {
                    subject: t('kidHome.recentSessions.title'),
                  })}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.viewAllLink, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
                    View all &gt;
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {sessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={[styles.emptyText, { color: isDark ? '#888888' : '#9CA3AF' }]}>
                  {t('kidHome.recentSessions.empty')}
                </Text>
              </View>
            ) : (
              <View style={styles.sessionList}>
                {sessions.map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    style={[
                      styles.sessionCard,
                      { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
                    ]}
                    accessibilityRole="summary"
                    accessibilityLabel={t('kidHome.accessibility.recentSession', {
                      subject: t(`kidHome.subjects.${session.subject}`),
                      time: timeAgo(session.createdAt, t),
                      questions: session.questionCount,
                    })}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.sessionIcon}>
                      {SUBJECT_ICONS[session.subject] ?? '📚'}
                    </Text>
                    <View style={styles.sessionInfo}>
                      <Text
                        style={[
                          styles.sessionSubject,
                          { color: isDark ? '#FFFFFF' : '#1A1A1A' },
                        ]}
                      >
                        {t(`kidHome.subjects.${session.subject}`)}
                      </Text>
                      <Text style={styles.sessionMeta}>
                        {timeAgo(session.createdAt, t)}
                        {' · '}
                        {t('kidHome.recentSessions.questions', {
                          count: session.questionCount,
                        })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// --- Styles -------------------------------------------------------------

const TILE_MIN_HEIGHT = 120;
const CAMERA_BUTTON_MIN_HEIGHT = 56;
const CORNER_RADIUS = 16;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },

  // ── Header ──

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greeting: { fontSize: 22, fontWeight: '700' },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  levelText: { fontSize: 13, fontWeight: '600' },
  langButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  langText: { fontSize: 14, fontWeight: '700' },

  // ── Subject Tiles ──

  subjectsHint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 12,
  },

  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  subjectTile: {
    width: '47%',
    minHeight: TILE_MIN_HEIGHT + 40,
    padding: 16,
    borderRadius: CORNER_RADIUS,
    borderWidth: 1,
    justifyContent: 'flex-start',
  },
  subjectIcon: { fontSize: 36, marginBottom: 8 },
  subjectTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subjectDescription: { fontSize: 13, lineHeight: 18 },

  // ── Camera Button ──

  cameraButton: {
    borderRadius: CORNER_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    minHeight: CAMERA_BUTTON_MIN_HEIGHT,
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cameraIcon: { fontSize: 32 },
  cameraTextBlock: { flex: 1 },
  cameraTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  cameraSubtitle: { fontSize: 14, color: '#FFFFFF', opacity: 0.85 },

  // ── Welcome Hero (first-session empty state) ──

  welcomeHero: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: CORNER_RADIUS,
    marginBottom: 8,
    gap: 12,
  },
  welcomeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeCircleIcon: { fontSize: 34 },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  welcomeBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
    marginBottom: 4,
  },

  // First-session primary CTA
  firstSessionCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: '100%',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  firstSessionCtaIcon: { fontSize: 24 },
  firstSessionCtaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Practice chips
  practicePrompt: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  practiceChipsRow: {
    gap: 10,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  practiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  practiceChipIcon: { fontSize: 18 },
  practiceChipLabel: { fontSize: 14, fontWeight: '600' },

  // Dismiss link
  dismissButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  dismissText: {
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  // ── Recent Sessions ──

  recentSection: { marginBottom: 8 },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentTitle: { fontSize: 18, fontWeight: '700' },
  viewAllLink: { fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 24 },
  sessionList: { gap: 10 },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sessionIcon: { fontSize: 28, width: 40, textAlign: 'center' },
  sessionInfo: { flex: 1 },
  sessionSubject: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  sessionMeta: { fontSize: 13, color: '#9CA3AF' },
});
