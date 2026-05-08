/**
 * Camera Result Screen — displays LLM inference response with scaffolded help.
 *
 * Layout per question:
 * 1. Question text (read-only)
 * 2. Subject + topic badge
 * 3. Hint (shown by default)
 * 4. "Show steps" → guided step-by-step walkthrough
 * 5. "Show full solution" → full worked answer (kid must explicitly ask)
 * 6. Follow-up chat input
 *
 * Design principles (from ADD §4.1 and DeepTutor architecture lift):
 * - Default behavior: hint first, never show full answer until kid asks
 * - Kid-friendly language, age-appropriate for detected grade
 * - Session auto-saved to Parent Log
 *
 * @see ADD §4.1 — Camera homework check flow
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSessionById } from '@/storage/sessions';

// ── Types ──────────────────────────────────────────────────────────

interface QuestionDisplay {
  index: number;
  text: string;
  subject?: string;
  topic?: string;
  hint: string;
  steps: { step: number; description: string; working?: string }[];
  fullSolution: string;
  followUp?: string;
  // UI state
  revealedSteps: boolean;
  revealedSolution: boolean;
}

interface SessionData {
  sessionId: string;
  subject: string;
  grade: string;
  questionCount: number;
  inferenceResult: string; // JSON stringified InferenceResponse
}

// ── Subject Icons & Colors ─────────────────────────────────────────

const SUBJECT_META: Record<string, { icon: string; color: string; label: string; labelZh: string }> = {
  math:       { icon: '🧮', color: '#E8F5E9', label: 'Math', labelZh: '数学' },
  english:    { icon: '📖', color: '#E3F2FD', label: 'English', labelZh: '英语' },
  science:    { icon: '🔬', color: '#FFF3E0', label: 'Science', labelZh: '科学' },
  chinese_mt: { icon: '🀄', color: '#FCE4EC', label: 'Chinese', labelZh: '华文' },
};

// ── Screen ─────────────────────────────────────────────────────────

export default function CameraResultScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [questions, setQuestions] = useState<QuestionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Follow-up chat state
  const [followUpText, setFollowUpText] = useState('');
  const [followUpMessages, setFollowUpMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([]);
  const scrollRef = useRef<ScrollView>(null);

  // ── Load Session Data ───────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      if (!sessionId) {
        setError('No session data found');
        setLoading(false);
        return;
      }

      try {
        const raw = await getSessionById(sessionId);
        if (cancelled) return;
        if (!raw) {
          setError('Session not found. The result may have expired.');
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(raw.inferenceResult);
        const qs: QuestionDisplay[] = (parsed.questions ?? []).map(
          (q: Record<string, unknown>, i: number) => ({
            index: (q.questionIndex as number) ?? i + 1,
            text: (q.questionText as string) ?? '',
            subject: q.detectedSubject as string | undefined,
            topic: q.detectedTopic as string | undefined,
            hint: (q.hint as string) ?? '',
            steps: (q.steps as QuestionDisplay['steps']) ?? [],
            fullSolution: (q.fullSolution as string) ?? '',
            followUp: q.suggestedFollowUp as string | undefined,
            revealedSteps: false,
            revealedSolution: false,
          }),
        );

        setSessionData(raw);
        setQuestions(qs);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load session:', err);
        setError('Failed to load session data');
        setLoading(false);
      }
    }

    loadSession();
    return () => { cancelled = true; };
  }, [sessionId]);

  // ── Toggle Steps / Solution ─────────────────────────────────────

  const handleRevealSteps = useCallback((index: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.index === index ? { ...q, revealedSteps: true } : q,
      ),
    );
    // Scroll to the steps after a brief delay
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  }, []);

  const handleRevealSolution = useCallback((index: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.index === index ? { ...q, revealedSolution: true } : q,
      ),
    );
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  }, []);

  // ── Follow-up Chat ──────────────────────────────────────────────

  const handleSendFollowUp = useCallback(() => {
    const text = followUpText.trim();
    if (!text) return;

    setFollowUpMessages((prev) => [...prev, { role: 'user', text }]);
    setFollowUpText('');

    // Mock follow-up response (real LLM call would happen here)
    setTimeout(() => {
      setFollowUpMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: t('cameraResult.followUp.mockResponse'),
        },
      ]);
    }, 1000);
  }, [followUpText, t]);

  // ── Navigation ──────────────────────────────────────────────────

  const handleBackToHome = useCallback(() => {
    router.replace('/(kid)/home');
  }, [router]);

  const handleRetake = useCallback(() => {
    router.replace('/(kid)/camera');
  }, [router]);

  // ── Loading State ───────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}>
        <ActivityIndicator size="large" color={isDark ? '#90CAF9' : '#4A90D9'} />
        <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  // ── Error State ─────────────────────────────────────────────────

  if (error || !sessionData) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}>
        <Text style={styles.errorIcon}>😅</Text>
        <Text style={[styles.errorText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          {error ?? t('cameraResult.error.notFound')}
        </Text>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: isDark ? '#2563EB' : '#4A90D9' }]}
          onPress={handleBackToHome}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{t('common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Subject Meta ────────────────────────────────────────────────

  const subjectMeta = SUBJECT_META[sessionData.subject] ?? SUBJECT_META.math;
  const isChinese = i18n.language === 'zh-Hans';

  // ── Main Render ─────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleBackToHome}
            accessibilityRole="button"
            accessibilityLabel={t('common.goBack')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.backButton, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
              ← {t('common.back')}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
            {t('cameraResult.title')}
          </Text>

          <TouchableOpacity
            onPress={handleRetake}
            accessibilityRole="button"
            accessibilityLabel={t('cameraResult.retake')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.retakeLink, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
              {t('cameraResult.retake')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subject badge */}
        <View style={[styles.subjectBadgeRow]}>
          <View style={[styles.subjectBadge, { backgroundColor: subjectMeta.color }]}>
            <Text style={styles.subjectBadgeIcon}>{subjectMeta.icon}</Text>
            <Text style={styles.subjectBadgeLabel}>
              {isChinese ? subjectMeta.labelZh : subjectMeta.label}
            </Text>
          </View>
          <Text style={[styles.gradeBadge, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
            {sessionData.grade} · {questions.length} {t('cameraResult.questions', { count: questions.length })}
          </Text>
        </View>
      </View>

      {/* Questions */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encouragement */}
        <View style={[styles.encouragementCard, { backgroundColor: isDark ? '#1A2A3A' : '#E8F4FD' }]}>
          <Text style={styles.encouragementIcon}>💪</Text>
          <View style={styles.encouragementTextBlock}>
            <Text style={[styles.encouragementTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
              {t('cameraResult.encouragement.title')}
            </Text>
            <Text style={[styles.encouragementBody, { color: isDark ? '#B0B0B0' : '#555555' }]}>
              {t('cameraResult.encouragement.body')}
            </Text>
          </View>
        </View>

        {questions.map((question) => {
          const qSubjectMeta = question.subject
            ? SUBJECT_META[question.subject] ?? subjectMeta
            : subjectMeta;

          return (
            <View
              key={question.index}
              style={[styles.questionCard, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}
            >
              {/* Question header */}
              <View style={styles.questionHeader}>
                <View style={[styles.questionNumber, { backgroundColor: qSubjectMeta.color }]}>
                  <Text style={styles.questionNumberText}>{question.index}</Text>
                </View>
                <View style={styles.questionHeaderText}>
                  <Text style={[styles.questionLabel, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
                    {t('cameraResult.question', { number: question.index })}
                  </Text>
                  {question.topic && (
                    <Text style={[styles.topicLabel, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
                      {question.topic}
                    </Text>
                  )}
                </View>
              </View>

              <Text style={[styles.questionText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                {question.text}
              </Text>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]} />

              {/* Hint (always visible) */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>💡</Text>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                    {t('cameraResult.hint')}
                  </Text>
                </View>
                <Text style={[styles.sectionBody, { color: isDark ? '#CCCCCC' : '#4A5568' }]}>
                  {question.hint}
                </Text>
              </View>

              {/* Steps (revealed on demand) */}
              {!question.revealedSteps ? (
                <TouchableOpacity
                  style={[styles.revealButton, { borderColor: isDark ? '#4A90D9' : '#4A90D9' }]}
                  onPress={() => handleRevealSteps(question.index)}
                  accessibilityRole="button"
                  accessibilityLabel={t('cameraResult.showSteps')}
                >
                  <Text style={[styles.revealButtonText, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
                    {t('cameraResult.showSteps')}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionIcon}>📝</Text>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                      {t('cameraResult.steps')}
                    </Text>
                  </View>
                  {question.steps.map((step) => (
                    <View key={step.step} style={styles.stepRow}>
                      <View style={[styles.stepCircle, { backgroundColor: isDark ? '#2A4A7A' : '#E8F4FD' }]}>
                        <Text style={[styles.stepNumber, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
                          {step.step}
                        </Text>
                      </View>
                      <View style={styles.stepContent}>
                        <Text style={[styles.stepDescription, { color: isDark ? '#CCCCCC' : '#4A5568' }]}>
                          {step.description}
                        </Text>
                        {step.working && (
                          <View style={[styles.workingBox, { backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB' }]}>
                            <Text style={[styles.workingText, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
                              {step.working}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}

                  {/* Full solution (revealed on demand, after steps) */}
                  {!question.revealedSolution ? (
                    <TouchableOpacity
                      style={[styles.revealButton, { borderColor: isDark ? '#4CAF50' : '#4CAF50', marginTop: 12 }]}
                      onPress={() => handleRevealSolution(question.index)}
                      accessibilityRole="button"
                      accessibilityLabel={t('cameraResult.showSolution')}
                    >
                      <Text style={[styles.revealButtonText, { color: '#4CAF50' }]}>
                        {t('cameraResult.showSolution')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.solutionBox, { backgroundColor: isDark ? '#1A3A1A' : '#F0FFF0' }]}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>✅</Text>
                        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                          {t('cameraResult.fullSolution')}
                        </Text>
                      </View>
                      <Text style={[styles.solutionText, { color: isDark ? '#CCCCCC' : '#2E7D32' }]}>
                        {question.fullSolution}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Suggested follow-up */}
              {question.followUp && question.revealedSteps && (
                <View style={[styles.followUpSuggestion, { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' }]}>
                  <Text style={[styles.followUpLabel, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
                    {t('cameraResult.tryThis')}
                  </Text>
                  <Text style={[styles.followUpText, { color: isDark ? '#E0E0E0' : '#1A1A1A' }]}>
                    {question.followUp}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Follow-up Chat Area */}
        {followUpMessages.length > 0 && (
          <View style={styles.followUpChatSection}>
            {followUpMessages.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.chatBubble,
                  msg.role === 'user'
                    ? [styles.userBubble, { backgroundColor: isDark ? '#2563EB' : '#4A90D9' }]
                    : [styles.assistantBubble, { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' }],
                ]}
              >
                <Text
                  style={[
                    styles.chatText,
                    { color: msg.role === 'user' ? '#FFFFFF' : isDark ? '#E0E0E0' : '#1A1A1A' },
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Bottom Padding for Input */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Follow-up Input */}
      <View style={[styles.followUpInputBar, {
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        borderTopColor: isDark ? '#333' : '#E5E7EB',
        paddingBottom: insets.bottom + 8,
      }]}>
        <TextInput
          style={[
            styles.followUpInput,
            {
              backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6',
              color: isDark ? '#FFFFFF' : '#1A1A1A',
              borderColor: isDark ? '#444' : '#D1D5DB',
            },
          ]}
          placeholder={t('cameraResult.followUp.placeholder')}
          placeholderTextColor={isDark ? '#666' : '#9CA3AF'}
          value={followUpText}
          onChangeText={setFollowUpText}
          onSubmitEditing={handleSendFollowUp}
          returnKeyType="send"
          accessibilityLabel={t('cameraResult.followUp.accessibility')}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: followUpText.trim() ? (isDark ? '#2563EB' : '#4A90D9') : (isDark ? '#333' : '#E5E7EB') }]}
          onPress={handleSendFollowUp}
          disabled={!followUpText.trim()}
          accessibilityRole="button"
          accessibilityLabel={t('cameraResult.followUp.send')}
        >
          <Text style={[styles.sendButtonText, { color: followUpText.trim() ? '#FFFFFF' : (isDark ? '#666' : '#9CA3AF') }]}>
            ↑
          </Text>
        </TouchableOpacity>
      </View>

      {/* Back to Home Button (after all content) */}
      <View style={[styles.bottomActions, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}>
        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: isDark ? '#2563EB' : '#4A90D9' }]}
          onPress={handleBackToHome}
          accessibilityRole="button"
          accessibilityLabel={t('cameraResult.backToHome')}
        >
          <Text style={styles.homeButtonText}>
            {t('cameraResult.backToHome')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },

  // ── Loading & Error ──
  loadingText: { fontSize: 16, marginTop: 12 },
  errorIcon: { fontSize: 48 },
  errorText: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  primaryButton: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // ── Header ──
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  retakeLink: { fontSize: 14, fontWeight: '600' },
  subjectBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectBadgeIcon: { fontSize: 14 },
  subjectBadgeLabel: { fontSize: 12, fontWeight: '600', color: '#1A1A1A' },
  gradeBadge: { fontSize: 12, fontWeight: '500' },

  // ── Scroll Area ──
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },

  // ── Encouragement ──
  encouragementCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    gap: 12,
    alignItems: 'center',
  },
  encouragementIcon: { fontSize: 28 },
  encouragementTextBlock: { flex: 1 },
  encouragementTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  encouragementBody: { fontSize: 13, lineHeight: 18 },

  // ── Question Card ──
  questionCard: {
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
  },
  questionNumberText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  questionHeaderText: { flex: 1 },
  questionLabel: { fontSize: 11, fontWeight: '500', textTransform: 'uppercase' },
  topicLabel: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  questionText: { fontSize: 15, fontWeight: '500', lineHeight: 22 },
  divider: { height: 1 },

  // ── Section (hint, steps, solution) ──
  section: { gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionBody: { fontSize: 14, lineHeight: 20, paddingLeft: 22 },

  // ── Steps ──
  stepRow: { flexDirection: 'row', gap: 10, paddingLeft: 2 },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumber: { fontSize: 12, fontWeight: '700' },
  stepContent: { flex: 1, gap: 4, paddingBottom: 8 },
  stepDescription: { fontSize: 14, lineHeight: 20 },
  workingBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  workingText: { fontSize: 14, fontWeight: '500', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  // ── Reveal Buttons ──
  revealButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  revealButtonText: { fontSize: 14, fontWeight: '700' },

  // ── Full Solution ──
  solutionBox: {
    padding: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 4,
  },
  solutionText: { fontSize: 14, lineHeight: 20 },

  // ── Follow-up Suggestion ──
  followUpSuggestion: {
    padding: 12,
    borderRadius: 10,
    gap: 4,
  },
  followUpLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  followUpText: { fontSize: 14, lineHeight: 20 },

  // ── Chat ──
  followUpChatSection: { gap: 8, paddingBottom: 8 },
  chatBubble: {
    padding: 12,
    borderRadius: 14,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  chatText: { fontSize: 14, lineHeight: 20 },

  // ── Follow-up Input Bar ──
  followUpInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  followUpInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 44,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: { fontSize: 18, fontWeight: '700' },

  // ── Bottom Actions ──
  bottomActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  homeButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
