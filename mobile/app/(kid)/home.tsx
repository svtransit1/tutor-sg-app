/**
 * Kid Home Screen — post-onboarding landing page.
 *
 * Layout (top to bottom):
 * 1. Header: kid name + level badge + language switcher
 * 2. 4 subject tiles in a 2x2 grid (Math, English, Science, Chinese MT)
 * 3. Hero camera button ("Snap Homework" / 拍照问功课)
 * 4. Recent sessions list (last 3)
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
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return t('kidHome.recentSessions.timeAgo.yesterday');
  return t('kidHome.recentSessions.timeAgo.daysAgo', { days: diffDays });
}

// --- Screen -------------------------------------------------------------

export default function KidHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [sessions, setSessions] = useState<KidSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

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
    router.push('/(kid)/camera');
  };

  const handleSubjectPress = (_subjectId: string) => {
    handleCameraPress();
  };

  const handleSessionPress = useCallback(
    (session: KidSession) => {
      router.push(`/(kid)/camera-result?sessionId=${session.id}`);
    },
    [router],
  );

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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

        {/* Hero Camera Button */}
        <TouchableOpacity
          style={[styles.cameraButton, { backgroundColor: isDark ? '#2563EB' : '#4A90D9' }]}
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

        {/* Recent Sessions */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={[styles.recentTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
              {t('kidHome.recentSessions.title')}
            </Text>
            {sessions.length > 0 && (
              <TouchableOpacity
                onPress={handleViewAllHistory}
                accessibilityRole="button"
                accessibilityLabel={t('kidHome.recentSessions.viewAllA11y')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.viewAllLink, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
                  {t('kidHome.recentSessions.viewAll')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={[styles.emptyText, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
                {t('kidHome.recentSessions.empty')}
              </Text>
            </View>
          ) : (
            <View style={styles.sessionList}>
              {sessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={[styles.sessionCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}
                  onPress={() => handleSessionPress(session)}
                  accessibilityRole="button"
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
                    <Text style={[styles.sessionSubject, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                      {t(`kidHome.subjects.${session.subject}`)}
                    </Text>
                    <Text style={styles.sessionMeta}>
                      {timeAgo(session.createdAt, t)}
                      {' · '}
                      {t('kidHome.recentSessions.questions', { count: session.questionCount })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

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
  levelText: { fontSize: 16, fontWeight: '600' },
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
  langText: { fontSize: 16, fontWeight: '700' },

  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8, marginBottom: 16 },
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
  subjectDescription: { fontSize: 16, lineHeight: 22 },

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
  cameraSubtitle: { fontSize: 16, color: '#FFFFFF', opacity: 0.85 },

  recentSection: { marginBottom: 8 },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentTitle: { fontSize: 18, fontWeight: '700' },
  viewAllLink: { fontSize: 16, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 24 },
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
  sessionMeta: { fontSize: 16, color: '#6B7280' },
});
