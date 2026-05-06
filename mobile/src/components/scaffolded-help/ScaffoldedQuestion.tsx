/**
 * ScaffoldedQuestion — hint-first AI response display for a single question.
 *
 * Implements the scaffolded help pattern from ADD §4.1:
 * 1. Question text displayed
 * 2. Hint shown by default (always visible)
 * 3. "Show steps" button → reveals step-by-step guide
 * 4. "Show full solution" button → reveals full worked answer (only after steps)
 * 5. Optional follow-up suggestion
 *
 * Kid-friendly, bilingual via i18n (caller passes translated strings).
 * No analytics, no network calls.
 *
 * @see ADD §4.1 — Camera homework check flow
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import HintSection from './HintSection';
import StepsSection, { type Step } from './StepsSection';
import SolutionSection from './SolutionSection';
import { SUBJECT_META, type SubjectKey } from './SubjectBadge';

// ── Types ──────────────────────────────────────────────────────────

export interface ScaffoldedQuestionProps {
  /** 1-based question index */
  index: number;
  /** Question text displayed above the scaffolded help */
  questionText: string;
  /** Subject key for the question number circle colour */
  subject?: SubjectKey;
  /** Topic label (e.g. "Fractions", "Grammar") */
  topic?: string;
  /** Hint text (always visible) */
  hint: string;
  /** Step-by-step guide items */
  steps: Step[];
  /** Full solution text (revealed after steps) */
  fullSolution: string;
  /** Optional follow-up suggestion shown after steps are revealed */
  followUpSuggestion?: string;

  /** i18n labels passed through from caller */
  labels: {
    question: string;
    hint: string;
    showSteps: string;
    steps: string;
    showSolution: string;
    fullSolution: string;
    tryThis: string;
  };
}

// ── Component ──────────────────────────────────────────────────────

export default function ScaffoldedQuestion({
  index,
  questionText,
  subject,
  topic,
  hint,
  steps,
  fullSolution,
  followUpSuggestion,
  labels,
}: ScaffoldedQuestionProps) {
  const isDark = useColorScheme() === 'dark';
  const [revealedSteps, setRevealedSteps] = useState(false);
  const [revealedSolution, setRevealedSolution] = useState(false);

  const handleRevealSteps = useCallback(() => {
    setRevealedSteps(true);
  }, []);

  const handleRevealSolution = useCallback(() => {
    setRevealedSolution(true);
  }, []);

  // Subject colour for the question number circle
  const subjectColor = subject ? SUBJECT_META[subject]?.color ?? '#E3F2FD' : '#E3F2FD';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
      ]}
      accessibilityLabel={`${labels.question} ${index}`}
    >
      {/* Question header */}
      <View style={styles.questionHeader}>
        <View
          style={[
            styles.questionNumber,
            { backgroundColor: subjectColor },
          ]}
>
          <Text style={styles.questionNumberText}>{index}</Text>
        </View>
        <View style={styles.questionHeaderText}>
          <Text
            style={[
              styles.questionLabel,
              { color: isDark ? '#AAAAAA' : '#6B7280' },
            ]}
          >
            {labels.question}
          </Text>
          {topic && (
            <Text
              style={[
                styles.topicLabel,
                { color: isDark ? '#90CAF9' : '#2563EB' },
              ]}
            >
              {topic}
            </Text>
          )}
        </View>
      </View>

      {/* Question text */}
      <Text
        style={[
          styles.questionText,
          { color: isDark ? '#FFFFFF' : '#1A1A1A' },
        ]}
      >
        {questionText}
      </Text>

      {/* Divider */}
      <View
        style={[styles.divider, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]}
      />

      {/* Hint (always visible) */}
      <HintSection hint={hint} headingLabel={labels.hint} />

      {/* Steps (revealed on demand) */}
      {!revealedSteps ? (
        <TouchableOpacity
          style={[
            styles.revealButton,
            { borderColor: isDark ? '#4A90D9' : '#4A90D9' },
          ]}
          onPress={handleRevealSteps}
          accessibilityRole="button"
          accessibilityLabel={labels.showSteps}
        >
          <Text
            style={[
              styles.revealButtonText,
              { color: isDark ? '#90CAF9' : '#2563EB' },
            ]}
          >
            {labels.showSteps}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.revealedSection}>
          <StepsSection steps={steps} headingLabel={labels.steps} />

          {/* Full solution (revealed on demand, after steps) */}
          {!revealedSolution ? (
            <TouchableOpacity
              style={[
                styles.revealButton,
                { borderColor: '#4CAF50', marginTop: 12 },
              ]}
              onPress={handleRevealSolution}
              accessibilityRole="button"
              accessibilityLabel={labels.showSolution}
            >
              <Text style={[styles.revealButtonText, { color: '#4CAF50' }]}>
                {labels.showSolution}
              </Text>
            </TouchableOpacity>
          ) : (
            <SolutionSection
              solution={fullSolution}
              headingLabel={labels.fullSolution}
            />
          )}

          {/* Follow-up suggestion */}
          {followUpSuggestion && (
            <View
              style={[
                styles.followUpSuggestion,
                { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' },
              ]}
            >
              <Text
                style={[
                  styles.followUpLabel,
                  { color: isDark ? '#AAAAAA' : '#6B7280' },
                ]}
              >
                {labels.tryThis}
              </Text>
              <Text
                style={[
                  styles.followUpText,
                  { color: isDark ? '#E0E0E0' : '#1A1A1A' },
                ]}
              >
                {followUpSuggestion}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  questionHeaderText: { flex: 1 },
  questionLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
  },
  topicLabel: { fontSize: 11, fontWeight: '600' as const, marginTop: 1 },

  questionText: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  divider: { height: 1 },

  revealButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  revealButtonText: { fontSize: 14, fontWeight: '700' as const },

  revealedSection: { gap: 8 },

  followUpSuggestion: {
    padding: 12,
    borderRadius: 10,
    gap: 4,
    marginTop: 8,
  },
  followUpLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  followUpText: { fontSize: 14, lineHeight: 20 },
});
