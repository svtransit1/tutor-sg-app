/**
 * History screen — full session history list for the kid area.
 *
 * Shows all past homework sessions in reverse chronological order
 * with pull-to-refresh and infinite-scroll pagination.
 *
 * Per ADD §4.2: kid-facing session list.
 * Bilingual EN + zh-Hans. Kid-safe: no analytics SDKs.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getPaginatedSessions } from '../../src/storage/sessions';
import type { KidSession } from '../../src/storage/sessions';

const SUBJECT_ICONS: Record<string, string> = {
  math: '🧮',
  english: '📖',
  science: '🔬',
  chinese: '🀄',
};

const PAGE_SIZE = 20;

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

export default function KidHistoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const [sessions, setSessions] = useState<KidSession[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadPage = useCallback(async (pageNum: number, replaceExisting: boolean) => {
    try {
      const result = await getPaginatedSessions(pageNum, PAGE_SIZE);
      if (replaceExisting) {
        setSessions(result.sessions);
      } else {
        setSessions((prev) => [...prev, ...result.sessions]);
      }
      setTotal(result.total);
      setPage(pageNum);
    } catch {
      // silent fail — keep existing data
    }
  }, []);

  useEffect(() => {
    loadPage(1, true).finally(() => setInitialLoading(false));
  }, [loadPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPage(1, true);
    setRefreshing(false);
  }, [loadPage]);

  const onLoadMore = useCallback(async () => {
    if (loadingMore || sessions.length >= total) return;
    setLoadingMore(true);
    await loadPage(page + 1, false);
    setLoadingMore(false);
  }, [loadingMore, sessions.length, total, page, loadPage]);

  const handleSessionPress = useCallback(
    (session: KidSession) => {
      router.push(`/(kid)/camera-result?sessionId=${session.id}`);
    },
    [router],
  );

  const renderSessionItem = useCallback(
    ({ item }: { item: KidSession }) => (
      <TouchableOpacity
        style={[
          styles.sessionCard,
          { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
        ]}
        onPress={() => handleSessionPress(item)}
        accessibilityRole="button"
        accessibilityLabel={t('history.accessibility.sessionItem', {
          subject: t(`kidHome.subjects.${item.subject}`),
          time: timeAgo(item.createdAt, t),
          questions: item.questionCount,
        })}
        activeOpacity={0.7}
      >
        <Text style={styles.sessionIcon}>
          {SUBJECT_ICONS[item.subject] ?? '📚'}
        </Text>
        <View style={styles.sessionInfo}>
          <Text
            style={[styles.sessionSubject, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}
            numberOfLines={1}
          >
            {t(`kidHome.subjects.${item.subject}`)}
          </Text>
          <Text style={styles.sessionMeta}>
            {timeAgo(item.createdAt, t)}
            {' · '}
            {t('kidHome.recentSessions.questions', { count: item.questionCount })}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    ),
    [isDark, handleSessionPress, t],
  );

  const renderFooter = () => {
    if (sessions.length === 0) return null;
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={isDark ? '#90CAF9' : '#2563EB'} />
        </View>
      );
    }
    if (sessions.length >= total && total > 0) {
      return (
        <View style={styles.footerEnd}>
          <Text style={[styles.footerEndText, { color: isDark ? '#888888' : '#9CA3AF' }]}>
            {t('history.noMore')}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => {
    if (initialLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          {t('history.title')}
        </Text>
        <Text style={[styles.emptyText, { color: isDark ? '#888888' : '#9CA3AF' }]}>
          {t('history.empty')}
        </Text>
      </View>
    );
  };

  const keyExtractor = useCallback((item: KidSession) => String(item.id), []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#F8F9FA' },
        { paddingTop: insets.top },
      ]}
    >
      <FlatList
        data={sessions}
        renderItem={renderSessionItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.headerBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.backArrow, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
                &lt; {t('common.back')}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]} accessibilityRole="header">
              {t('history.title')}
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#FFFFFF' : '#4A90D9'}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  backArrow: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 60,
  },

  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    minHeight: 60,
  },
  sessionIcon: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sessionMeta: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 22,
    color: '#9CA3AF',
    fontWeight: '300',
  },

  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerEnd: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerEndText: {
    fontSize: 13,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
