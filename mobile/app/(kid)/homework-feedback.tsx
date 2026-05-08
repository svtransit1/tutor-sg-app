import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  type ViewStyle,
  type TextStyle,
  type TextInputContentSizeChangeEventData,
  type NativeSyntheticEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VoiceRecorder from '@/components/VoiceRecorder';
import ReadAloudButton from '@/components/ReadAloudButton';
import { useHomeworkSession } from '@/hooks/useHomeworkSession';
import type {
  HomeworkFeedbackResult,
  QuestionFeedback,
  ScaffoldedHelpTab,
} from '@/models/homework-feedback';
import type { Subject } from '@/storage/sessions';

interface FollowUp {
  id: string;
  role: 'kid' | 'tutor';
  text: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export default function HomeworkFeedbackScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const params = useLocalSearchParams<{ result: string }>();

  const [feedback] = useState<HomeworkFeedbackResult | null>(() => {
    try {
      return params.result
        ? (JSON.parse(params.result) as HomeworkFeedbackResult)
        : null;
    } catch {
      return null;
    }
  });

  const [activeTabs, setActiveTabs] = useState<Record<number, ScaffoldedHelpTab>>(
    {},
  );
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(44);
  const scrollRef = useRef<ScrollView>(null);

  // ── Session auto-save ──
  const {
    startSession,
    addEvent,
    incrementQuestionCount,
    closeSession,
    sessionId,
    isLoading: sessionLoading,
  } = useHomeworkSession();
  const sessionInitDone = useRef(false);

  useEffect(() => {
    if (!feedback || feedback.questions.length === 0) return;
    if (sessionInitDone.current) return;
    sessionInitDone.current = true;

    // Map subject from feedback model to storage model
    const feedbackSubject = feedback.questions[0]?.subject ?? 'math';
    const storageSubject: Subject =
      feedbackSubject === 'chinese_mt' ? 'chinese' : feedbackSubject;

    // Start session and log events asynchronously
    (async () => {
      try {
        await startSession(storageSubject);

        if (feedback.photoUri || feedback.ocrText) {
          await addEvent('ocr', {
            photoUri: feedback.photoUri ?? null,
            ocrText: feedback.ocrText ?? null,
          });
        }

        for (const q of feedback.questions) {
          await addEvent('llm_response', {
            questionNumber: q.questionNumber,
            topic: q.topic,
            hint: q.scaffoldedHelp.hint,
            guidedSteps: q.scaffoldedHelp.guidedSteps,
            solution: q.scaffoldedHelp.workedSolution,
          });
          await incrementQuestionCount();
        }
      } catch {
        // Session save is best-effort — never block the UI
      }
    })();
  }, [feedback, startSession, addEvent, incrementQuestionCount]);

  const handleTabChange = useCallback(
    (questionNumber: number, tab: ScaffoldedHelpTab) => {
      setActiveTabs((prev) => ({ ...prev, [questionNumber]: tab }));
    },
    [],
  );

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSendText = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const kidMsg: FollowUp = { id: generateId(), role: 'kid', text: trimmed };
    const tutorReply: FollowUp = {
      id: generateId(),
      role: 'tutor',
      text: t('homeworkFeedback.followUpTitle'),
    };

    setFollowUps((prev) => [...prev, kidMsg, tutorReply]);
    setInputText('');
    setInputHeight(44);
    scrollToBottom();
  }, [inputText, t, scrollToBottom]);

  const handleVoiceResult = useCallback(
    (text: string) => {
      const kidMsg: FollowUp = { id: generateId(), role: 'kid', text };
      const tutorReply: FollowUp = {
        id: generateId(),
        role: 'tutor',
        text: t('homeworkFeedback.followUpTitle'),
      };
      setFollowUps((prev) => [...prev, kidMsg, tutorReply]);
      scrollToBottom();
    },
    [t, scrollToBottom],
  );

  const handleVoiceError = useCallback((_error: Error) => {
    // handled by VoiceRecorder internal state
  }, []);

  const handleBack = useCallback(() => {
    if (sessionId) {
      closeSession().catch(() => {});
    }
    router.back();
  }, [router, sessionId, closeSession]);

  const bgColor = isDark ? '#121212' : '#F8F9FA';
  const surfaceColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#888888' : '#9CA3AF';
  const borderColor = isDark ? '#333' : '#E5E7EB';

  if (!feedback || feedback.questions.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: bgColor },
          { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={[styles.emptyText, { color: textColor }]}>
          No feedback available
        </Text>
        <TouchableOpacity
          style={[
            styles.backBtn,
            { backgroundColor: isDark ? '#2563EB' : '#4A90D9' },
          ]}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t('homeworkFeedback.backToHome')}
        >
          <Text style={styles.backBtnText}>
            {t('homeworkFeedback.backToHome')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderScaffoldedTabs(q: QuestionFeedback) {
    const active = activeTabs[q.questionNumber] ?? 'hint';
    const tabs: ScaffoldedHelpTab[] = ['hint', 'steps', 'solution'];
    const tabI18nKeys: Record<ScaffoldedHelpTab, string> = {
      hint: t('homeworkFeedback.tabHint'),
      steps: t('homeworkFeedback.tabSteps'),
      solution: t('homeworkFeedback.tabSolution'),
    };

    let content = '';
    if (active === 'hint') content = q.scaffoldedHelp.hint;
    if (active === 'steps')
      content = q.scaffoldedHelp.guidedSteps
        .map((s, i) => `${i + 1}. ${s}`)
        .join('\n');
    if (active === 'solution') content = q.scaffoldedHelp.workedSolution;

    return (
      <View>
        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const isActive = active === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  isActive && {
                    backgroundColor: isDark ? '#2563EB' : '#4A90D9',
                  },
                  !isActive && { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' },
                ]}
                onPress={() => handleTabChange(q.questionNumber, tab)}
                accessibilityRole="tab"
                accessibilityLabel={tabI18nKeys[tab]}
                accessibilityState={{ selected: isActive }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? '#FFFFFF' : mutedColor },
                  ]}
                >
                  {tabI18nKeys[tab]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.readAloudRow}>
          <ReadAloudButton text={content} />
        </View>
        <View
          style={[
            styles.helpContent,
            { backgroundColor: isDark ? '#1A1A1A' : '#F9FAFB' },
          ]}
        >
          <Text
            style={[styles.helpText, { color: isDark ? '#D0D0D0' : '#374151' }]}
            selectable
          >
            {content}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
            borderBottomColor: borderColor,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={t('common.goBack')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text
              style={[
                styles.backLink,
                { color: isDark ? '#90CAF9' : '#2563EB' },
              ]}
            >
              ← {t('common.back')}
            </Text>
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: textColor }]}
            accessibilityRole="header"
          >
            {t('homeworkFeedback.title')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Questions + Chat */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Question feedback cards */}
        {feedback.questions.map((q) => (
          <View
            key={q.questionNumber}
            style={[
              styles.questionCard,
              {
                backgroundColor: surfaceColor,
                borderColor,
              },
            ]}
            accessibilityLabel={`${t('homeworkFeedback.questionLabel', { number: q.questionNumber })} — ${q.topic}`}
          >
            <View style={styles.questionHeader}>
              <View
                style={[
                  styles.questionBadge,
                  { backgroundColor: isDark ? '#2A4A7A' : '#E8F4FD' },
                ]}
              >
                <Text
                  style={[
                    styles.questionBadgeText,
                    { color: isDark ? '#90CAF9' : '#2563EB' },
                  ]}
                >
                  {t('homeworkFeedback.questionLabel', {
                    number: q.questionNumber,
                  })}
                </Text>
              </View>
              <Text
                style={[styles.topicLabel, { color: mutedColor }]}
                numberOfLines={1}
              >
                {q.topic}
              </Text>
            </View>
            {renderScaffoldedTabs(q)}
          </View>
        ))}

        {/* Follow-up chat */}
        {followUps.length > 0 && (
          <View style={styles.chatSection}>
            {followUps.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.chatBubble,
                  msg.role === 'kid'
                    ? [
                        styles.chatBubbleKid,
                        {
                          backgroundColor: isDark ? '#2563EB' : '#4A90D9',
                        },
                      ]
                    : [
                        styles.chatBubbleTutor,
                        {
                          backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6',
                          borderColor,
                        },
                      ],
                ]}
                accessibilityRole="text"
                accessibilityLabel={msg.text}
              >
                <Text
                  style={[
                    styles.chatText,
                    {
                      color:
                        msg.role === 'kid' ? '#FFFFFF' : textColor,
                    },
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Bottom input bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
            borderTopColor: borderColor,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        {/* Voice input */}
        <VoiceRecorder
          onResult={handleVoiceResult}
          onError={handleVoiceError}
          style={styles.voiceRecorder}
        />

        {/* Text input row */}
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6',
                color: textColor,
                borderColor,
                height: Math.min(inputHeight, 100),
              },
            ]}
            placeholder={t('homeworkFeedback.textPlaceholder')}
            placeholderTextColor={mutedColor}
            value={inputText}
            onChangeText={setInputText}
            onContentSizeChange={(e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) =>
              setInputHeight(e.nativeEvent.contentSize.height)
            }
            multiline
            textAlignVertical="center"
            accessibilityLabel={t('homeworkFeedback.accessibility.textInput')}
            returnKeyType={Platform.OS === 'android' ? 'none' : 'default'}
            blurOnSubmit
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  inputText.trim().length > 0
                    ? isDark
                      ? '#2563EB'
                      : '#4A90D9'
                    : isDark
                      ? '#2A2A2A'
                      : '#E5E7EB',
              },
            ]}
            onPress={handleSendText}
            disabled={inputText.trim().length === 0}
            accessibilityRole="button"
            accessibilityLabel={t('homeworkFeedback.accessibility.sendButton')}
            accessibilityState={{ disabled: inputText.trim().length === 0 }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sendButtonText,
                {
                  color:
                    inputText.trim().length > 0
                      ? '#FFFFFF'
                      : mutedColor,
                },
              ]}
            >
              {t('homeworkFeedback.send')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Voice input hint */}
        <Text
          style={[styles.inputHint, { color: mutedColor }]}
        >
          {t('homeworkFeedback.voiceInputHint')}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } satisfies ViewStyle,

  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  } satisfies ViewStyle,

  emptyIcon: {
    fontSize: 48,
  } satisfies TextStyle,

  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  } satisfies TextStyle,

  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  } satisfies ViewStyle,

  backBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  } satisfies TextStyle,

  // ── Header ──

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  } satisfies ViewStyle,

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } satisfies ViewStyle,

  backLink: {
    fontSize: 15,
    fontWeight: '600',
  } satisfies TextStyle,

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  } satisfies TextStyle,

  headerSpacer: {
    width: 50,
  } satisfies ViewStyle,

  // ── Question cards ──

  scrollArea: {
    flex: 1,
  } satisfies ViewStyle,

  scrollContent: {
    padding: 16,
    gap: 16,
  } satisfies ViewStyle,

  questionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  } satisfies ViewStyle,

  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  } satisfies ViewStyle,

  questionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  } satisfies ViewStyle,

  questionBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  } satisfies TextStyle,

  topicLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  } satisfies TextStyle,

  // ── Scaffolded help tabs ──

  tabRow: {
    flexDirection: 'row',
    gap: 6,
  } satisfies ViewStyle,

  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  } satisfies ViewStyle,

  tabText: {
    fontSize: 13,
    fontWeight: '600',
  } satisfies TextStyle,

  helpContent: {
    borderRadius: 10,
    padding: 14,
    minHeight: 60,
  } satisfies ViewStyle,

  readAloudRow: {
    paddingTop: 10,
    paddingBottom: 4,
  } satisfies ViewStyle,

  helpText: {
    fontSize: 15,
    lineHeight: 22,
  } satisfies TextStyle,

  // ── Follow-up chat ──

  chatSection: {
    gap: 8,
  } satisfies ViewStyle,

  chatBubble: {
    maxWidth: '85%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  } satisfies ViewStyle,

  chatBubbleKid: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  } satisfies ViewStyle,

  chatBubbleTutor: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  } satisfies ViewStyle,

  chatText: {
    fontSize: 15,
    lineHeight: 22,
  } satisfies TextStyle,

  // ── Bottom bar ──

  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  } satisfies ViewStyle,

  voiceRecorder: {
    marginBottom: 0,
  } satisfies ViewStyle,

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  } satisfies ViewStyle,

  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    lineHeight: 22,
    maxHeight: 100,
  } satisfies ViewStyle,

  sendButton: {
    width: 56,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,

  sendButtonText: {
    fontSize: 14,
    fontWeight: '700',
  } satisfies TextStyle,

  inputHint: {
    fontSize: 11,
    textAlign: 'center',
    paddingBottom: 2,
  } satisfies TextStyle,
});
