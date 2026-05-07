/**
 * ScaffoldedQuestion — hint-first AI response display for a single question.
 *
 * Implements the scaffolded help pattern from ADD §4.1:
 * 1. Question text displayed
 * 2. Hint shown by default (always visible)
 * 3. "Show steps" button → reveals step-by-step guide
 * 4. "Show full solution" button → reveals full worked answer (only after steps)
 * 5. Optional follow-up suggestion
 * 6. Backward navigation: kid can go back to previous levels at any time
 * 7. Session logging callbacks for parent log integration
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

export interface ScaffoldedQuestionProps {
  index: number;
  questionText: string;
  subject?: SubjectKey;
  topic?: string;
  hint: string;
  steps: Step[];
  fullSolution: string;
  followUpSuggestion?: string;
  onRevealSteps?: () => void;
  onRevealSolution?: () => void;
  onGoBackToHint?: () => void;
  onGoBackToSteps?: () => void;

  labels: {
    question: string;
    hint: string;
    showSteps: string;
    steps: string;
    showSolution: string;
    fullSolution: string;
    tryThis: string;
    goBackToHint: string;
    goBackToSteps: string;
    confirmSolutionTitle: string;
    confirmSolutionMessage: string;
    confirmCancel: string;
    confirmReveal: string;
  };
}

export default function ScaffoldedQuestion({
  index,
  questionText,
  subject,
  topic,
  hint,
  steps,
  fullSolution,
  followUpSuggestion,
  onRevealSteps,
  onRevealSolution,
  onGoBackToHint,
  onGoBackToSteps,
  labels,
}: ScaffoldedQuestionProps) {
  const isDark = useColorScheme() === 'dark';
  const [revealedSteps, setRevealedSteps] = useState(false);
  const [revealedSolution, setRevealedSolution] = useState(false);
  const [showingConfirm, setShowingConfirm] = useState(false);

  const handleRevealSteps = useCallback(() => {
    setRevealedSteps(true);
    onRevealSteps?.();
  }, [onRevealSteps]);

  const handleRequestSolution = useCallback(() => {
    setShowingConfirm(true);
  }, []);

  const handleConfirmSolution = useCallback(() => {
    setShowingConfirm(false);
    setRevealedSolution(true);
    onRevealSolution?.();
  }, [onRevealSolution]);

  const handleCancelSolution = useCallback(() => {
    setShowingConfirm(false);
  }, []);

  const handleGoBackToHint = useCallback(() => {
    setRevealedSteps(false);
    setRevealedSolution(false);
    setShowingConfirm(false);
    onGoBackToHint?.();
  }, [onGoBackToHint]);

  const handleGoBackToSteps = useCallback(() => {
    setRevealedSolution(false);
    setShowingConfirm(false);
    onGoBackToSteps?.();
  }, [onGoBackToSteps]);

  const subjectColor = subject ? SUBJECT_META[subject]?.color ?? '#E3F2FD' : '#E3F2FD';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' },
      ]}
      accessibilityLabel={`${labels.question} ${index}`}
    >
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

      <Text
        style={[
          styles.questionText,
          { color: isDark ? '#FFFFFF' : '#1A1A1A' },
        ]}
      >
        {questionText}
      </Text>

      <View
        style={[styles.divider, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]}
      />

      <HintSection hint={hint} headingLabel={labels.hint} />

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

          <TouchableOpacity
            style={styles.backLink}
            onPress={handleGoBackToHint}
            accessibilityRole="button"
            accessibilityLabel={labels.goBackToHint}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.backLinkText, { color: isDark ? '#90CAF9' : '#6B7280' }]}>
              ← {labels.goBackToHint}
            </Text>
          </TouchableOpacity>

          {!revealedSolution && !showingConfirm && (
            <TouchableOpacity
              style={[
                styles.revealButton,
                { borderColor: '#4CAF50', marginTop: 12 },
              ]}
              onPress={handleRequestSolution}
              accessibilityRole="button"
              accessibilityLabel={labels.showSolution}
            >
              <Text style={[styles.revealButtonText, { color: '#4CAF50' }]}>
                {labels.showSolution}
              </Text>
            </TouchableOpacity>
          )}

          {showingConfirm && (
            <View
              style={[
                styles.confirmBox,
                { backgroundColor: isDark ? '#2A1A1A' : '#FFF5F5' },
              ]}
              accessibilityLabel={labels.confirmSolutionTitle}
            >
              <Text
                style={[
                  styles.confirmTitle,
                  { color: isDark ? '#FFCCCC' : '#C0392B' },
                ]}
              >
                {labels.confirmSolutionTitle}
              </Text>
              <Text
                style={[
                  styles.confirmMessage,
                  { color: isDark ? '#CCCCCC' : '#4A5568' },
                ]}
              >
                {labels.confirmSolutionMessage}
              </Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.confirmCancelButton]}
                  onPress={handleCancelSolution}
                  accessibilityRole="button"
                  accessibilityLabel={labels.confirmCancel}
                >
                  <Text style={styles.confirmCancelText}>
                    {labels.confirmCancel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.confirmAcceptButton]}
                  onPress={handleConfirmSolution}
                  accessibilityRole="button"
                  accessibilityLabel={labels.confirmReveal}
                >
                  <Text style={styles.confirmAcceptText}>
                    {labels.confirmReveal}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {revealedSolution && (
            <>
              <SolutionSection
                solution={fullSolution}
                headingLabel={labels.fullSolution}
              />
              <TouchableOpacity
                style={styles.backLink}
                onPress={handleGoBackToSteps}
                accessibilityRole="button"
                accessibilityLabel={labels.goBackToSteps}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.backLinkText, { color: isDark ? '#90CAF9' : '#6B7280' }]}>
                  ← {labels.goBackToSteps}
                </Text>
              </TouchableOpacity>
            </>
          )}

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
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  divider: { height: 1 },

  revealButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  revealButtonText: { fontSize: 16, fontWeight: '700' as const },

  revealedSection: { gap: 8 },

  confirmBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E74C3C',
    gap: 10,
    marginTop: 8,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  confirmMessage: {
    fontSize: 16,
    lineHeight: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelButton: {
    backgroundColor: '#E5E7EB',
  },
  confirmAcceptButton: {
    backgroundColor: '#E74C3C',
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#374151',
  },
  confirmAcceptText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },

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
  followUpText: { fontSize: 16, lineHeight: 24 },

  backLink: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
