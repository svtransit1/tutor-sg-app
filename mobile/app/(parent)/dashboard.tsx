import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SessionRepository } from '@/storage/sessions';
import type { KidSession } from '@/storage/sessions';

const SUBJECT_ICONS: Record<string, string> = {
  math: '🧮',
  english: '📖',
  science: '🔬',
  chinese: '🀄',
};

function getGroupLabel(key: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    today: t('parent.dashboard.groupToday'),
    yesterday: t('parent.dashboard.groupYesterday'),
    thisWeek: t('parent.dashboard.groupThisWeek'),
    older: t('parent.dashboard.groupOlder'),
  };
  return labels[key] ?? key;
}

function getSessionStatusLabel(session: KidSession, t: (key: string) => string): string {
  if (session.closedAt) return t('parent.dashboard.statusCompleted');
  return t('parent.dashboard.statusInProgress');
}

export default function ParentDashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const [groups, setGroups] = useState<{ label: string; sessions: KidSession[] }[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const bgColor = isDark ? '#121212' : '#FFFFFF';
  const surfaceColor = isDark ? '#1E1E1E' : '#F5F7FA';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#888888' : '#888';
  const borderColor = isDark ? '#333' : '#F0F0F0';

  const loadData = useCallback(async () => {
    try {
      const [grouped, count] = await Promise.all([
        SessionRepository.getSessionsForParent(50),
        SessionRepository.getSessionCount(),
      ]);
      setGroups(grouped);
      setSessionCount(count);
    } catch {
      setGroups([]);
      setSessionCount(0);
    }
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const hasSessions = groups.length > 0 && groups.some((g) => g.sessions.length > 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          {t('parent.dashboard.title')}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(parent)/settings')}
          style={styles.settingsButton}
          accessibilityRole="button"
          accessibilityLabel={t('parent.settings.title')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
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
        {/* Stats summary */}
        {hasSessions && (
          <View style={[styles.statsRow, { backgroundColor: surfaceColor }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {sessionCount}
              </Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>
                {t('parent.dashboard.totalSessions')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {groups.reduce((sum, g) => sum + g.sessions.filter((s) => s.closedAt).length, 0)}
              </Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>
                {t('parent.dashboard.completedSessions')}
              </Text>
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingState}>
            <Text style={[styles.loadingText, { color: mutedColor }]}>
              {t('parent.dashboard.loading')}
            </Text>
          </View>
        ) : !hasSessions ? (
          /* Empty state */
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              {t('parent.dashboard.emptyTitle')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: mutedColor }]}>
              {t('parent.dashboard.emptySubtitle')}
            </Text>
          </View>
        ) : (
          /* Session groups */
          <View style={styles.groupsContainer}>
            {groups.map((group) => (
              <View key={group.label} style={styles.groupSection}>
                <Text style={[styles.groupLabel, { color: mutedColor }]}>
                  {getGroupLabel(group.label, t)}
                </Text>
                {group.sessions.map((session) => (
                  <View
                    key={session.id}
                    style={[styles.sessionCard, { backgroundColor: surfaceColor, borderColor }]}
                    accessibilityRole="summary"
                    accessibilityLabel={`${session.subject} session, ${session.questionCount} questions`}
                  >
                    <Text style={styles.sessionIcon}>
                      {SUBJECT_ICONS[session.subject] ?? '📚'}
                    </Text>
                    <View style={styles.sessionInfo}>
                      <Text style={[styles.sessionSubject, { color: textColor }]}>
                        {t(`kidHome.subjects.${session.subject}`)}
                      </Text>
                      <Text style={[styles.sessionMeta, { color: mutedColor }]}>
                        {t('parent.dashboard.questions', { count: session.questionCount })}
                        {' · '}
                        {getSessionStatusLabel(session, t)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  settingsButton: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 22 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  statsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statNumber: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },

  loadingState: { alignItems: 'center', paddingVertical: 48 },
  loadingText: { fontSize: 15 },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },

  groupsContainer: { gap: 20 },

  groupSection: { gap: 8 },
  groupLabel: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
  },
  sessionIcon: { fontSize: 24, width: 36, textAlign: 'center' },
  sessionInfo: { flex: 1 },
  sessionSubject: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  sessionMeta: { fontSize: 13 },
});
