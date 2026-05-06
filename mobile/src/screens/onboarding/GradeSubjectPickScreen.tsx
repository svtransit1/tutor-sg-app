/**
 * GradeSubjectPickScreen — onboarding step 4/7.
 *
 * Purpose: Let the parent/guardian select:
 * 1. Child's grade (P1–P6) in a horizontal scroll
 * 2. Subjects (Math, English, Science, Chinese) — all on by default
 * 3. "All subjects" toggle
 * 4. Optional sibling prompt ("Add another child?")
 *
 * Persists selections to onboarding state.
 * Bilingual (EN + zh-Hans). Kid-safe (no data leaving device).
 *
 * @see AAAS-246
 * @see onboarding dev spec §3.6-3.7
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { persistGrade, persistSubjects } from '../../storage/onboarding-state';
import type { Grade, SubjectId } from '../../storage/onboarding-state';

// ── Constants ──────────────────────────────────────────────────────

const GRADES: Grade[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

const SUBJECTS: { id: SubjectId; icon: string; i18nKey: string }[] = [
  { id: 'math', icon: '🧮', i18nKey: 'onboarding.gradePick.subjectMath' },
  { id: 'english', icon: '📖', i18nKey: 'onboarding.gradePick.subjectEnglish' },
  { id: 'science', icon: '🔬', i18nKey: 'onboarding.gradePick.subjectScience' },
  { id: 'chinese', icon: '🀄', i18nKey: 'onboarding.gradePick.subjectChinese' },
];

const ALL_SUBJECT_IDS: SubjectId[] = SUBJECTS.map((s) => s.id);

// ── Props ──────────────────────────────────────────────────────────

interface GradeSubjectPickScreenProps {
  /** Called when selection is complete and persisted. */
  onComplete?: () => void;
  /** Called when "Add another child" is chosen — passes current selections. */
  onAddSibling?: () => void;
}

// ── Component ──────────────────────────────────────────────────────

export default function GradeSubjectPickScreen({
  onComplete,
  onAddSibling,
}: GradeSubjectPickScreenProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<SubjectId>>(
    new Set(ALL_SUBJECT_IDS),
  );
  const [showSiblingPrompt, setShowSiblingPrompt] = useState(false);

  const allSubjectsSelected = useMemo(
    () => ALL_SUBJECT_IDS.every((s) => selectedSubjects.has(s)),
    [selectedSubjects],
  );

  const canContinue = selectedGrade !== null && selectedSubjects.size > 0;

  // ── Handlers ─────────────────────────────────────────────────

  const handleGradeSelect = useCallback((grade: Grade) => {
    setSelectedGrade(grade);
  }, []);

  const handleSubjectToggle = useCallback((subjectId: SubjectId) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  }, []);

  const handleAllSubjectsToggle = useCallback(() => {
    setSelectedSubjects((prev) => {
      if (ALL_SUBJECT_IDS.every((s) => prev.has(s))) {
        return new Set(); // deselect all
      }
      return new Set(ALL_SUBJECT_IDS); // select all
    });
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedGrade) return;
    persistGrade(selectedGrade);
    persistSubjects(Array.from(selectedSubjects));
    setShowSiblingPrompt(true);
    onComplete?.();
  }, [selectedGrade, selectedSubjects, onComplete]);

  const handleAddSibling = useCallback(() => {
    onAddSibling?.();
  }, [onAddSibling]);

  const handleSkipSibling = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  // ── Styles (dynamic) ────────────────────────────────────────

  const bgColor = isDark ? '#121212' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#AAAAAA' : '#6B7280';
  const cardBg = isDark ? '#1E1E1E' : '#F9FAFB';
  const borderColor = isDark ? '#333333' : '#E5E7EB';
  const selectedBg = isDark ? '#2C5282' : '#E3F2FD';
  const selectedBorder = isDark ? '#63B3ED' : '#4A90D9';

  // ── Render ──────────────────────────────────────────────────

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bgColor }]}
      contentContainerStyle={styles.content}
    >
      {/* Title */}
      <Text style={[styles.title, { color: textColor }]}>
        {t('onboarding.gradePick.title')}
      </Text>

      {/* Grade picker — horizontal row */}
      <Text
        style={[styles.sectionLabel, { color: mutedColor }]}
        accessibilityRole="header"
      >
        {t('onboarding.gradePick.title')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gradeRow}
        accessibilityLabel="Grade selection"
      >
        {GRADES.map((grade) => {
          const isSelected = selectedGrade === grade;
          return (
            <TouchableOpacity
              key={grade}
              style={[
                styles.gradeChip,
                {
                  backgroundColor: isSelected ? selectedBg : cardBg,
                  borderColor: isSelected ? selectedBorder : borderColor,
                },
              ]}
              onPress={() => handleGradeSelect(grade)}
              accessibilityRole="button"
              accessibilityLabel={
                isSelected
                  ? t('onboarding.gradePick.accessibility.gradeSelected', {
                      grade,
                    })
                  : t('onboarding.gradePick.accessibility.gradeOption', {
                      grade,
                    })
              }
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.gradeText,
                  {
                    color: isSelected ? '#1565C0' : textColor,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {t(`onboarding.gradePick.grade${grade}` as any)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Subject selection */}
      <Text style={[styles.sectionLabel, { color: mutedColor, marginTop: 28 }]}>
        {t('onboarding.gradePick.subjectTitle')}
      </Text>

      {/* All subjects toggle */}
      <TouchableOpacity
        style={[
          styles.allSubjectsRow,
          { borderBottomColor: borderColor },
        ]}
        onPress={handleAllSubjectsToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: allSubjectsSelected }}
        accessibilityLabel={t('onboarding.gradePick.allSubjects')}
      >
        <Text style={[styles.allSubjectsLabel, { color: textColor }]}>
          {t('onboarding.gradePick.allSubjects')}
        </Text>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: allSubjectsSelected ? '#4A90D9' : 'transparent',
              borderColor: allSubjectsSelected ? '#4A90D9' : borderColor,
            },
          ]}
        >
          {allSubjectsSelected && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Subject chips */}
      <View style={styles.subjectGrid}>
        {SUBJECTS.map((subject) => {
          const isSelected = selectedSubjects.has(subject.id);
          return (
            <TouchableOpacity
              key={subject.id}
              style={[
                styles.subjectChip,
                {
                  backgroundColor: isSelected ? selectedBg : cardBg,
                  borderColor: isSelected ? selectedBorder : borderColor,
                },
              ]}
              onPress={() => handleSubjectToggle(subject.id)}
              accessibilityRole="switch"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={t(
                'onboarding.gradePick.accessibility.subjectToggle',
                {
                  subject: t(subject.i18nKey as any),
                  state: isSelected
                    ? t('onboarding.gradePick.accessibility.subjectOn')
                    : t('onboarding.gradePick.accessibility.subjectOff'),
                },
              )}
            >
              <Text style={styles.subjectIcon}>{subject.icon}</Text>
              <Text
                style={[
                  styles.subjectLabel,
                  {
                    color: isSelected ? '#1565C0' : textColor,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {t(subject.i18nKey as any)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Hint text */}
      <Text style={[styles.hint, { color: mutedColor }]}>
        {t('onboarding.gradePick.subjectHint')}
      </Text>

      {/* Continue button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          {
            backgroundColor: canContinue ? '#4A90D9' : borderColor,
            opacity: canContinue ? 1 : 0.5,
          },
        ]}
        onPress={handleContinue}
        disabled={!canContinue}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canContinue }}
        accessibilityLabel={t('onboarding.gradePick.continue')}
      >
        <Text style={styles.continueText}>
          {t('onboarding.gradePick.continue')}
        </Text>
      </TouchableOpacity>

      {/* Sibling prompt */}
      {showSiblingPrompt && (
        <View style={[styles.siblingPrompt, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.siblingTitle, { color: textColor }]}>
            {t('onboarding.siblingPrompt.title')}
          </Text>
          <Text style={[styles.siblingSubtitle, { color: mutedColor }]}>
            {t('onboarding.siblingPrompt.subtitle')}
          </Text>
          <View style={styles.siblingActions}>
            <TouchableOpacity
              style={[styles.siblingButton, { backgroundColor: '#4A90D9' }]}
              onPress={handleAddSibling}
              accessibilityRole="button"
            >
              <Text style={styles.siblingButtonText}>
                {t('onboarding.siblingPrompt.addAnother')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.siblingButton, styles.siblingSkipButton]}
              onPress={handleSkipSibling}
              accessibilityRole="button"
            >
              <Text style={[styles.siblingButtonText, { color: mutedColor }]}>
                {t('onboarding.siblingPrompt.skip')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Grade picker
  gradeRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  gradeChip: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 18,
    fontWeight: '600',
  },

  // All subjects toggle
  allSubjectsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  allSubjectsLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Subjects
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
  },
  subjectIcon: {
    fontSize: 20,
  },
  subjectLabel: {
    fontSize: 15,
  },

  // Hint
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 16,
    marginBottom: 8,
  },

  // Continue
  continueButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Sibling prompt
  siblingPrompt: {
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  siblingTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  siblingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  siblingActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  siblingButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  siblingSkipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  siblingButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
