import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SessionRepository } from '@/storage/sessions';
import type { KidSession } from '@/storage/sessions';

const SUBJECT_ICONS: Record<string, string> = {
  math: '🧮',
  english: '📖',
  science: '🔬',
  chinese: '🀄',
};

function formatSessionDate(dateStr: string, t: (key: string) => string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return t('kidHistory.yesterday') + ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getSessionStatusLabel(session: KidSession, t: (key: string) => string): string {
  if (session.closedAt) return t('kidHistory.status.completed');
  if (session.questionCount > 0) return t('kidHistory.status.inProgress');
  return t('kidHistory.status.opened');
}

export default function KidHistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [sessions, setSessions] = useState<KidSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const all = await SessionRepository.getRecentSessions(100);
      setSessions(all);
    } catch {
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    loadSessions().finally(() => setLoading(false));
  }, [loadSessions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  }, [loadSessions]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const bgColor = isDark ? '#121212' : '#F8F9FA';
  const surfaceColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#888888' : '#9CA3AF';
  const borderColor = isDark ? '#333' : '#E5E7EB';

  const renderSession = ({ item }: { item: KidSession }) => (
    <View
      style={[styles.sessionCard, { backgroundColor: surfaceColor, borderColor }]}
      accessibilityRole="summary"
      accessibilityLabel={t('kidHistory.accessibility.sessionCard', {
        subject: t(`kidHome.subjects.${item.subject}`),
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
        <View style={styles.sessionMetaRow}>
          <Text style={[styles.sessionMeta, { color: mutedColor }]}>
            {t('kidHistory.questions', { count: item.questionCount })}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: item.closedAt
                  ? (isDark ? '#1B3D1B' : '#E8F5E9')
                  : (isDark ? '#3A2A00' : '#FFF8E1'),
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: item.closedAt
                    ? (isDark ? '#81C784' : '#2E7D32')
                    : (isDark ? '#FFD54F' : '#F57F17'),
                },
              ]}
            >
              {getSessionStatusLabel(item, t)}
            </Text>
          </View>
        </View>
      </View>
      <Text style={[styles.sessionTime, { color: mutedColor }]}>
        {formatSessionDate(item.createdAt, t)}
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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[styles.backLink, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
            ← {t('common.back')}
          </Text>
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: textColor }]}
          accessibilityRole="header"
        >
          {t('kidHistory.title')}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Session list */}
      <FlatList
        data={sessions}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSession}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#FFFFFF' : '#4A90D9'}
          />
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={[styles.emptyText, { color: mutedColor }]}>
                {t('kidHistory.empty')}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backLink: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  headerSpacer: { width: 50 },

  listContent: { padding: 16, gap: 10, paddingBottom: 32 },

  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sessionIcon: { fontSize: 28, width: 40, textAlign: 'center' },
  sessionInfo: { flex: 1, gap: 4 },
  sessionSubject: { fontSize: 16, fontWeight: '600' },
  sessionMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionMeta: { fontSize: 13 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  sessionTime: { fontSize: 12 },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 24 },
});
