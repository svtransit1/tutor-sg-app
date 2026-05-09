import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useColorScheme, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { FirstUseWalkthrough } from '@/components/FirstUseWalkthrough';
import { isTutorialShown, markTutorialShown } from '@/storage/tutorial-storage';
import { getRecentSessions } from '@/storage/sessions';
import type { KidSession } from '@/storage/sessions';

const SUBJECT_ICONS: Record<string, string> = {
  math: '🧮',
  english: '📖',
  science: '🔬',
  chinese: '🀄',
};

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

function formatTimeSpent(seconds: number, t: (key: string, opts?: object) => string): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (seconds < 60) return t('kidHome.recentSessions.timeSpent', { minutes: 0, seconds: sec });
  if (sec === 0) return t('kidHome.recentSessions.timeSpent', { minutes: min, seconds: 0 });
  return t('kidHome.recentSessions.timeSpent', { minutes: min, seconds: sec });
}

export default function KidHomeScreen() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [sessions, setSessions] = useState<KidSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    isTutorialShown().then((shown) => {
      if (!shown) setShowWalkthrough(true);
    });
  }, []);

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

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    markTutorialShown();
  };

  const handleWalkthroughSkip = () => {
    setShowWalkthrough(false);
    markTutorialShown();
  };

  const handleSessionPress = useCallback((session: KidSession) => {
    router.push(`/(kid)/photo-review?sessionId=${session.id}`);
  }, []);

  const handleViewAllHistory = () => {
    router.push('/(kid)/history');
  };

  const sessionList = (
    <View style={styles.recentSection}>
      <View style={styles.recentHeader}>
        <Text style={[styles.recentTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          {t('kidHome.recentSessions.title')}
        </Text>
        {sessions.length > 0 && (
          <Pressable
            onPress={handleViewAllHistory}
            accessibilityRole="button"
            accessibilityLabel={t('kidHome.recentSessions.viewAllA11y')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.viewAllLink, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
              {t('kidHome.recentSessions.viewAll')}
            </Text>
          </Pressable>
        )}
      </View>

      {sessions.length === 0 ? (
        <Text style={[styles.emptyText, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
          {t('kidHome.recentSessions.empty')}
        </Text>
      ) : (
        <View style={styles.sessionList}>
          {sessions.map((session) => (
            <Pressable
              key={session.id}
              style={[styles.sessionCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}
              onPress={() => handleSessionPress(session)}
              accessibilityRole="button"
              accessibilityLabel={t('kidHome.accessibility.recentSession', {
                subject: t(`kidHome.subjects.${session.subject}`),
                time: timeAgo(session.createdAt, t),
                questions: session.questionCount,
              })}
            >
              <Text style={styles.sessionIcon}>
                {SUBJECT_ICONS[session.subject] ?? '📚'}
              </Text>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionSubject, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                  {t(`kidHome.subjects.${session.subject}`)}
                </Text>
                <Text style={[styles.sessionMeta, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
                  {timeAgo(session.createdAt, t)}
                  {' · '}
                  {t('kidHome.recentSessions.questions', { count: session.questionCount })}
                  {session.timeSpent > 0 && (
                    <>
                      {' · '}
                      {formatTimeSpent(session.timeSpent, t)}
                    </>
                  )}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>tutor-sg</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
          {t('kidHome.firstSession.ctaCamera')}
        </Text>

        {sessionList}

        <Pressable style={styles.parentButton} onPress={() => router.push('/(parent)')} accessibilityRole="button">
          <Text style={styles.parentButtonText}>{t('onboarding.done.parentArea')}</Text>
        </Pressable>
      </ScrollView>

      <FirstUseWalkthrough
        visible={showWalkthrough}
        onComplete={handleWalkthroughComplete}
        onSkip={handleWalkthroughSkip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32 },
  title: { fontSize: 32, fontWeight: '700', marginTop: 60, marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  parentButton: { marginTop: 32, paddingVertical: 14, paddingHorizontal: 32, backgroundColor: '#F3F4F6', borderRadius: 12, alignSelf: 'center' },
  parentButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  recentSection: { marginBottom: 8 },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  recentTitle: { fontSize: 18, fontWeight: '700' },
  viewAllLink: { fontSize: 16, fontWeight: '600' },
  emptyText: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingVertical: 32 },
  sessionList: { gap: 10 },
  sessionCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  sessionIcon: { fontSize: 28, width: 40, textAlign: 'center' },
  sessionInfo: { flex: 1 },
  sessionSubject: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  sessionMeta: { fontSize: 16 },
});
