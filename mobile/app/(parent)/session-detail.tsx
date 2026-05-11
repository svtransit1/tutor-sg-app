import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, useColorScheme,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ParentSessionRepository, type ParentSession, type QuestionAttempt } from '@/storage/parentSessions';
import { generateSessionSummary } from '@/utils/sessionSummary';

const SUBJECT_ICONS: Record<string, string> = {
  math: '\uD83E\uDDEE',
  english: '\uD83D\uDCD6',
  science: '\uD83D\uDD2C',
  chinese: '\uD83C\uDF19',
};

const SUBJECT_FALLBACK = '\uD83D\uDCDA';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

function formatDuration(startIso: string, endIso: string | null): string | null {
  if (!endIso) return null;
  const sec = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000);
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  if (sec < 60) return `${sec}s`;
  if (s === 0) return `${min}m`;
  return `${min}m ${s}s`;
}

export default function ParentSessionDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const { id } = useLocalSearchParams<{ id: string }>();

  const [session, setSession] = useState<ParentSession | null>(null);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      ParentSessionRepository.getSession(id),
      ParentSessionRepository.getQuestionAttempts(id),
    ])
      .then(([s, a]) => {
        setSession(s);
        setAttempts(a);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleFlagToggle = useCallback(async () => {
    if (!session) return;
    await ParentSessionRepository.setParentFlagged(session.id, !session.parentFlagged);
    setSession(prev => prev ? { ...prev, parentFlagged: !prev.parentFlagged } : null);
  }, [session]);

  const bg = isDark ? '#121212' : '#F8F9FA';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const metaColor = isDark ? '#BBBBBB' : '#6B7280';
  const accentColor = isDark ? '#90CAF9' : '#2563EB';
  const borderColor = isDark ? '#333333' : '#E5E7EB';

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: bg, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={accentColor} accessibilityLabel={t('common.loading')} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: bg, paddingTop: insets.top }]}>
        <Text style={[styles.errorText, { color: metaColor }]}>
          {t('parent.sessionDetail.notFound')}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          style={styles.backButton}
        >
          <Text style={[styles.backText, { color: accentColor }]}>
            {'<'} {t('common.back')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const struggleCount = session.struggleIndicators.filter(Boolean).length;
  const correctRate = session.questionsAttempted > 0 && session.questionsCorrect !== null
    ? `${Math.round((session.questionsCorrect / session.questionsAttempted) * 100)}%`
    : '--';
  const summary = generateSessionSummary(session, attempts);
  const duration = formatDuration(session.startedAt, session.endedAt);

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.backRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.backTouchable}
          >
            <Text style={[styles.backText, { color: accentColor }]}>
              {'<'} {t('common.back')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleFlagToggle}
            accessibilityRole="button"
            accessibilityLabel={session.parentFlagged ? t('parent.sessionDetail.flagRemoveHint') : t('parent.sessionDetail.flagSessionHint')}
            style={styles.flagBtn}
          >
            <Text style={[styles.flagText, { color: session.parentFlagged ? '#F59E0B' : metaColor }]}>
              {session.parentFlagged ? '\u2605' : '\u2606'}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[styles.subjectHero, { backgroundColor: cardBg }]}
          accessibilityRole="header"
          accessibilityLabel={`${session.subject} ${session.topic || ''}`}
        >
          <Text style={styles.subjectIcon}>{SUBJECT_ICONS[session.subject] ?? SUBJECT_FALLBACK}</Text>
          <Text style={[styles.subjectLabel, { color: textColor }]}>
            {session.topic || session.subject}
          </Text>
          {session.parentFlagged && (
            <View style={styles.flaggedBadge} accessible accessibilityLabel={t('parent.sessionDetail.flaggedLabel')}>
              <Text style={styles.flaggedBadgeText}>{t('parent.sessionDetail.flaggedLabel')}</Text>
            </View>
          )}
        </View>

        <View
          style={[styles.infoCard, { backgroundColor: cardBg, borderColor }]}
          accessibilityLabel={t('parent.sessionDetail.infoCard')}
        >
          <InfoRow label={t('parent.sessionDetail.date')} value={formatDateTime(session.startedAt)} textColor={textColor} metaColor={metaColor} borderColor={borderColor} />
          {duration && <InfoRow label={t('parent.sessionDetail.duration')} value={duration} textColor={textColor} metaColor={metaColor} borderColor={borderColor} />}
          <InfoRow label={t('parent.sessionDetail.questions')} value={String(session.questionsAttempted)} textColor={textColor} metaColor={metaColor} borderColor={borderColor} />
          {session.questionsCorrect !== null && (
            <InfoRow label={t('parent.sessionDetail.correct')} value={`${session.questionsCorrect}/${session.questionsAttempted}`} textColor={textColor} metaColor={metaColor} borderColor={borderColor} />
          )}
          <InfoRow label={t('parent.sessionDetail.correctRate')} value={correctRate} textColor={textColor} metaColor={metaColor} borderColor={borderColor} />
          {struggleCount > 0 && (
            <InfoRow label={t('parent.sessionDetail.struggles')} value={String(struggleCount)} textColor={textColor} metaColor={metaColor} borderColor={borderColor} />
          )}
        </View>

        <View
          style={[styles.summaryCard, { backgroundColor: cardBg, borderColor }]}
          accessibilityLabel={t('parent.sessionDetail.aiSummarySection')}
        >
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            {t('parent.sessionDetail.aiSummarySection')}
          </Text>
          <Text style={[styles.summaryBody, { color: metaColor }]}>
            {summary}
          </Text>
        </View>

        {attempts.length > 0 && (
          <View
            style={[styles.timelineCard, { backgroundColor: cardBg, borderColor }]}
            accessibilityRole="list"
            accessibilityLabel={t('parent.sessionDetail.timeline')}
          >
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {t('parent.sessionDetail.timeline')}
            </Text>
            {attempts.map((a, i) => (
              <View
                key={a.id}
                style={[styles.timelineItem, i < attempts.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }]}
                accessible
                accessibilityLabel={`${t('parent.sessionDetail.question')} ${i + 1}: ${a.correct ? t('parent.sessionDetail.attemptResultCorrect') : t('parent.sessionDetail.attemptResultWrong')}, ${t('parent.sessionDetail.hints')}: ${a.hintsUsed}`}
              >
                <View style={styles.timelineLeft}>
                  <View style={[styles.dot, { backgroundColor: a.correct ? '#22C55E' : '#EF4444' }]} />
                  {i < attempts.length - 1 && <View style={[styles.line, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineQuestion, { color: textColor }]}>
                    {t('parent.sessionDetail.question')} {i + 1}
                  </Text>
                  <Text style={[styles.timelineMeta, { color: metaColor }]}>
                    {a.correct ? t('parent.sessionDetail.attemptResultCorrect') : t('parent.sessionDetail.attemptResultWrong')}
                    {' \u00B7 '}
                    {t('parent.sessionDetail.hints')}: {a.hintsUsed}
                    {' \u00B7 '}
                    {a.timeSeconds}{t('parent.sessionDetail.seconds')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, textColor, metaColor, borderColor }: { label: string; value: string; textColor: string; metaColor: string; borderColor: string }) {
  return (
    <View style={[infoStyles.row, { borderBottomColor: borderColor }]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[infoStyles.label, { color: metaColor }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: textColor }]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1,
  },
  label: { fontSize: 16 },
  value: { fontSize: 16, fontWeight: '500' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  backRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12,
  },
  backTouchable: { minHeight: 44, justifyContent: 'center' },
  backButton: { minHeight: 44, justifyContent: 'center' },
  backText: { fontSize: 16, fontWeight: '500' },
  flagBtn: { padding: 8, minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  flagText: { fontSize: 24 },
  subjectHero: {
    borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  subjectIcon: { fontSize: 48, marginBottom: 8 },
  subjectLabel: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  flaggedBadge: {
    backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8,
  },
  flaggedBadgeText: { fontSize: 14, color: '#92400E', fontWeight: '600' },
  infoCard: {
    borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  summaryCard: {
    borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  summaryBody: { fontSize: 16, lineHeight: 24 },
  timelineCard: {
    borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  timelineItem: {
    flexDirection: 'row', paddingVertical: 10,
  },
  timelineLeft: { width: 24, alignItems: 'center', marginRight: 12 },
  dot: {
    width: 12, height: 12, borderRadius: 6, marginTop: 4,
  },
  line: {
    width: 2, flex: 1, marginTop: 4,
  },
  timelineContent: { flex: 1 },
  timelineQuestion: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  timelineMeta: { fontSize: 16 },
  errorText: { fontSize: 16, marginBottom: 16 },
});
