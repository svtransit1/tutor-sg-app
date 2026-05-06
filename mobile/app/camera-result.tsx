/**
 * Camera Result Screen — displays LLM inference response with scaffolded help.
 *
 * Uses the reusable ScaffoldedQuestion component set from
 * @/components/scaffolded-help for the hint-first AI response pattern.
 *
 * Layout per session:
 * 1. Header with subject badge + grade
 * 2. Encouragement card
 * 3. For each question: scaffolded help (hint → steps → solution)
 * 4. Follow-up chat input
 *
 * Design principles (from ADD §4.1):
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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSessionById } from '@/storage/sessions';
import ErrorScreen from '@/components/ErrorScreen';
import {
  ScaffoldedQuestion,
  EncouragementCard,
  FollowUpChat,
  SubjectBadge,
  SUBJECT_META,
  type SubjectKey,
  type Step,
  type ChatMessage,
} from '@/components/scaffolded-help';

// ── Types ──────────────────────────────────────────────────────────

interface QuestionDisplay {
  index: number;
  text: string;
  subject?: SubjectKey;
  topic?: string;
  hint: string;
  steps: Step[];
  fullSolution: string;
  followUp?: string;
}

interface SessionData {
  sessionId: string;
  subject: SubjectKey;
  grade: string;
  questionCount: number;
  inferenceResult: string; // JSON stringified InferenceResponse
}

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
  const [followUpMessages, setFollowUpMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  // ── Load Session Data ───────────────────────────────────────────

  useEffect(() => {
    if (!sessionId) {
      setError('No session data found');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const raw = await getSessionById(sessionId);
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
            subject: q.detectedSubject as SubjectKey | undefined,
            topic: q.detectedTopic as string | undefined,
            hint: (q.hint as string) ?? '',
            steps: (q.steps as Step[]) ?? [],
            fullSolution: (q.fullSolution as string) ?? '',
            followUp: q.suggestedFollowUp as string | undefined,
          }),
        );

        setSessionData(raw as SessionData);
        setQuestions(qs);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load session:', err);
        setError('Failed to load session data');
        setLoading(false);
      }
    })();
  }, [sessionId]);

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
      <View
        style={[
          styles.container,
          {
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            gap: 16,
            backgroundColor: isDark ? '#121212' : '#F8F9FA',
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={isDark ? '#90CAF9' : '#4A90D9'}
        />
        <Text
          style={[
            styles.loadingText,
            { color: isDark ? '#FFFFFF' : '#1A1A1A' },
          ]}
        >
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  // ── Error State ─────────────────────────────────────────────────

  if (error || !sessionData) {
    return (
      <ErrorScreen
        variant="session_expired"
        description={error ?? undefined}
        onAction={handleBackToHome}
      />
    );
  }

  // ── Subject Meta ────────────────────────────────────────────────

  const subjectMeta = SUBJECT_META[sessionData.subject] ?? SUBJECT_META.math;
  const sessionSubjectLabel = i18n.language === 'zh-Hans'
    ? t('kidHome.subjectsDescriptions.' + sessionData.subject, {
        defaultValue: t('kidHome.subjects.' + sessionData.subject),
      })
    : t('kidHome.subjects.' + sessionData.subject);

  // ── Main Render ─────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#F8F9FA' },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleBackToHome}
            accessibilityRole="button"
            accessibilityLabel={t('common.goBack')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text
              style={[
                styles.backButton,
                { color: isDark ? '#90CAF9' : '#2563EB' },
              ]}
            >
              ← {t('common.back')}
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? '#FFFFFF' : '#1A1A1A' },
            ]}
          >
            {t('cameraResult.title')}
          </Text>

          <TouchableOpacity
            onPress={handleRetake}
            accessibilityRole="button"
            accessibilityLabel={t('cameraResult.retake')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text
              style={[
                styles.retakeLink,
                { color: isDark ? '#90CAF9' : '#2563EB' },
              ]}
            >
              {t('cameraResult.retake')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subject badge + grade */}
        <View style={styles.subjectBadgeRow}>
          <SubjectBadge subject={sessionData.subject} label={sessionSubjectLabel} />
          <Text
            style={[
              styles.gradeBadge,
              { color: isDark ? '#AAAAAA' : '#6B7280' },
            ]}
          >
            {sessionData.grade} ·{' '}
            {t('cameraResult.questions', {
              count: questions.length,
            })}
          </Text>
        </View>
      </View>

      {/* Questions + Follow-up */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encouragement */}
        <EncouragementCard
          title={t('cameraResult.encouragement.title')}
          body={t('cameraResult.encouragement.body')}
        />

        {/* Question cards with scaffolded help */}
        {questions.map((question) => {
          return (
            <ScaffoldedQuestion
              key={question.index}
              index={question.index}
              questionText={question.text}
              subject={question.subject}
              topic={question.topic}
              hint={question.hint}
              steps={question.steps}
              fullSolution={question.fullSolution}
              followUpSuggestion={question.followUp}
              labels={{
                question: t('cameraResult.question', {
                  number: question.index,
                }),
                hint: t('cameraResult.hint'),
                showSteps: t('cameraResult.showSteps'),
                steps: t('cameraResult.steps'),
                showSolution: t('cameraResult.showSolution'),
                fullSolution: t('cameraResult.fullSolution'),
                tryThis: t('cameraResult.tryThis'),
              }}
            />
          );
        })}

        {/* Follow-up Chat */}
        <FollowUpChat
          messages={followUpMessages}
          inputValue={followUpText}
          onInputChange={setFollowUpText}
          onSend={handleSendFollowUp}
          placeholder={t('cameraResult.followUp.placeholder')}
          inputAccessibilityLabel={t('cameraResult.followUp.accessibility')}
          sendAccessibilityLabel={t('cameraResult.followUp.send')}
        />

        {/* Bottom Padding */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Back to Home */}
      <View
        style={[
          styles.bottomActions,
          { backgroundColor: isDark ? '#121212' : '#F8F9FA' },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.homeButton,
            { backgroundColor: isDark ? '#2563EB' : '#4A90D9' },
          ]}
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

  // ── Loading ──
  loadingText: { fontSize: 16, marginTop: 12 },

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
  gradeBadge: { fontSize: 12, fontWeight: '500' },

  // ── Scroll Area ──
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },

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
