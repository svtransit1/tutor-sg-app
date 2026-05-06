/**
 * QuestionSegmentationList — renders detected questions as individual cards.
 *
 * After OCR + question segmentation, display each detected question as a
 * scrollable vertical list of QuestionCards. Each card shows:
 * - Question number
 * - First 80 characters of detected text
 * - Subject badge (Math/English/Science/Chinese)
 * - Tap to open scaffolded help
 * - Unreadable items show manual-input fallback card
 *
 * Kid-friendly: min 16pt font, high contrast, VoiceOver/TalkBack.
 *
 * @see ADD §4.1 — Camera homework check flow, step 4
 * @see M2-22 — Question segmentation UI
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  useColorScheme,
} from 'react-native';
import { useTranslation } from 'react-i18next';

// ── Types ──────────────────────────────────────────────────────────

export interface SegmentedQuestion {
  /** Unique question ID within the session */
  id: string;
  /** Question number (1-indexed display) */
  number: number;
  /** Full detected text from OCR */
  text: string;
  /** Subject detected by classifier */
  subject: 'math' | 'english' | 'science' | 'chinese_mt' | null;
  /** Whether OCR confidence was too low to read */
  unreadable: boolean;
}

interface QuestionSegmentationListProps {
  /** Array of segmented questions from OCR pipeline */
  questions: SegmentedQuestion[];
  /** Called when a readable question is tapped */
  onQuestionTap?: (question: SegmentedQuestion) => void;
  /** Called when the manual-input fallback is tapped */
  onManualInputTap?: (question: SegmentedQuestion) => void;
}

// ── Subject metadata ──────────────────────────────────────────────

const SUBJECT_META: Record<
  string,
  { icon: string; color: string; labelKey: string }
> = {
  math: { icon: '🧮', color: '#E8F5E9', labelKey: 'kidHome.subjects.math' },
  english: { icon: '📖', color: '#E3F2FD', labelKey: 'kidHome.subjects.english' },
  science: { icon: '🔬', color: '#FFF3E0', labelKey: 'kidHome.subjects.science' },
  chinese_mt: { icon: '🀄', color: '#FCE4EC', labelKey: 'kidHome.subjects.chinese' },
};

// ── QuestionCard sub-component ────────────────────────────────────

interface QuestionCardProps {
  question: SegmentedQuestion;
  onTap: () => void;
  onManualInputTap: () => void;
  t: (key: string) => string;
  isDark: boolean;
}

function QuestionCard({
  question,
  onTap,
  onManualInputTap,
  t,
  isDark,
}: QuestionCardProps) {
  const truncated =
    question.text.length > 80
      ? question.text.slice(0, 80) + '…'
      : question.text;

  const subjectMeta = question.subject
    ? SUBJECT_META[question.subject]
    : null;

  const bgColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#AAAAAA' : '#6B7280';
  const borderColor = isDark ? '#333333' : '#E5E7EB';

  // Unreadable card — manual input fallback
  if (question.unreadable) {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          styles.unreadableCard,
          {
            backgroundColor: isDark ? '#1E1E1E' : '#FFF8E1',
            borderColor: isDark ? '#5D4037' : '#FFE082',
          },
        ]}
        onPress={onManualInputTap}
        accessibilityRole="button"
        accessibilityLabel={`${t('cameraResult.question')} ${question.number} — ${t('cameraManualInput.title')}`}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.numberBadge,
              { backgroundColor: isDark ? '#5D4037' : '#FFECB3' },
            ]}
          >
            <Text
              style={[
                styles.numberText,
                { color: isDark ? '#FFCC80' : '#E65100' },
              ]}
            >
              {question.number}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              {t('cameraResult.question')} {question.number}
            </Text>
            <Text
              style={[
                styles.unreadableTag,
                { color: isDark ? '#FFCC80' : '#E65100' },
              ]}
            >
              ⚠️ {t('cameraManualInput.title')}
            </Text>
          </View>
        </View>
        <Text
          style={[styles.cardBody, { color: mutedColor }]}
          numberOfLines={2}
        >
          {truncated}
        </Text>
      </TouchableOpacity>
    );
  }

  // Readable card
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bgColor, borderColor }]}
      onPress={onTap}
      accessibilityRole="button"
      accessibilityLabel={`${t('cameraResult.question')} ${question.number}, ${subjectMeta ? t(subjectMeta.labelKey as any) : ''}`}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View
          style={[styles.numberBadge, { backgroundColor: '#E3F2FD' }]}
        >
          <Text style={[styles.numberText, { color: '#1565C0' }]}>
            {question.number}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            {t('cameraResult.question')} {question.number}
          </Text>
          {subjectMeta && (
            <View
              style={[
                styles.subjectTag,
                { backgroundColor: subjectMeta.color },
              ]}
            >
              <Text style={styles.subjectIcon}>{subjectMeta.icon}</Text>
              <Text style={styles.subjectLabel}>
                {t(subjectMeta.labelKey as any)}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Text
        style={[styles.cardBody, { color: textColor }]}
        numberOfLines={2}
      >
        {truncated}
      </Text>
    </TouchableOpacity>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function QuestionSegmentationList({
  questions,
  onQuestionTap,
  onManualInputTap,
}: QuestionSegmentationListProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const renderItem = useCallback(
    ({ item }: { item: SegmentedQuestion }) => (
      <QuestionCard
        question={item}
        onTap={() => onQuestionTap?.(item)}
        onManualInputTap={() => onManualInputTap?.(item)}
        t={t}
        isDark={isDark}
      />
    ),
    [onQuestionTap, onManualInputTap, t, isDark],
  );

  const keyExtractor = useCallback(
    (item: SegmentedQuestion) => item.id,
    [],
  );

  if (questions.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
        ]}
      >
        <Text
          style={[
            styles.emptyText,
            { color: isDark ? '#AAAAAA' : '#6B7280' },
          ]}
        >
          {t('cameraResult.error.notFound')}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={questions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={[
        styles.listContent,
        { backgroundColor: isDark ? '#121212' : '#F9FAFB' },
      ]}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      accessibilityLabel="Homework questions"
    />
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  unreadableCard: {
    borderStyle: 'dashed',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  subjectIcon: {
    fontSize: 12,
  },
  subjectLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  unreadableTag: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 21,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
