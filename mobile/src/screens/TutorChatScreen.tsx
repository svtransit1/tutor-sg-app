/**
 * TutorChatScreen — full-screen chat interface with the AI tutor.
 *
 * Kids can type questions and receive scaffolded help responses.
 * Supports:
 * - Chat bubble conversation (user messages + AI responses)
 * - Streaming text animation for AI responses
 * - Typing indicator while LLM is generating
 * - Scaffolded help (hint → steps → solution) for structured responses
 * - Follow-up questions naturally chain within the conversation
 *
 * @see ADD §4.1 — Follow-up chat
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StreamingText from '@/components/StreamingText';
import TypingIndicator from '@/components/TypingIndicator';
import type { Step } from '@/components/scaffolded-help';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** Optional structured scaffolded help (parsed from LLM response) */
  scaffoldedHelp?: {
    hint?: string;
    steps?: Step[];
    fullSolution?: string;
  };
  /** Whether this message is still streaming */
  streaming?: boolean;
}

export interface TutorChatScreenProps {
  initialMessages?: ChatMessage[];
  onSendMessage: (text: string) => Promise<ChatMessage>;
  onBack?: () => void;
}

let msgCounter = 0;
function generateId(): string {
  msgCounter += 1;
  return `msg_${Date.now()}_${msgCounter}`;
}

export default function TutorChatScreen({
  initialMessages = [],
  onSendMessage,
  onBack,
}: TutorChatScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const hasText = inputText.trim().length > 0;

  // Auto-scroll when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isProcessing]);

  // ── Send Message ──

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isProcessing) return;

    setInputText('');
    setIsProcessing(true);

    const userMsg: ChatMessage = { id: generateId(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await onSendMessage(text);

      if (response.scaffoldedHelp) {
        setMessages((prev) => [
          ...prev,
          { ...response, id: generateId(), streaming: false },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { ...response, id: generateId(), streaming: false },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'assistant', text: t('tutorChat.errorResponse'), streaming: false },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, isProcessing, onSendMessage, t]);

  // ── Scaffolded Sections ──

  const [revealedSections, setRevealedSections] = useState<
    Record<string, { steps: boolean; solution: boolean }>
  >({});

  const handleRevealSteps = useCallback((msgId: string) => {
    setRevealedSections((prev) => ({
      ...prev,
      [msgId]: { ...prev[msgId], steps: true, solution: false },
    }));
  }, []);

  const handleRevealSolution = useCallback((msgId: string) => {
    setRevealedSections((prev) => ({
      ...prev,
      [msgId]: { ...prev[msgId], solution: true },
    }));
  }, []);

  // ── Suggestions ──

  const showSuggestions = messages.length <= 1 && !isProcessing;

  // ── Render Message ──

  const renderMessage = (msg: ChatMessage) => {
    if (msg.role === 'user') {
      return (
        <View
          key={msg.id}
          style={[
            styles.bubble,
            styles.userBubble,
            { backgroundColor: isDark ? '#2563EB' : '#4A90D9' },
          ]}
          accessibilityLabel={`You: ${msg.text}`}
          accessibilityRole="text"
        >
          <Text style={styles.userBubbleText}>{msg.text}</Text>
        </View>
      );
    }

    const hasScaffolded = msg.scaffoldedHelp;
    const section = revealedSections[msg.id];

    return (
      <View key={msg.id} style={styles.assistantMessageBlock}>
        {msg.streaming ? (
          <StreamingText text={msg.text} speed={35} style={styles.assistantBubbleText} />
        ) : (
          <View
            style={[
              styles.bubble,
              styles.assistantBubble,
              { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' },
            ]}
            accessibilityLabel={`Tutor: ${msg.text}`}
            accessibilityRole="text"
          >
            <Text
              style={[styles.assistantBubbleText, { color: isDark ? '#E0E0E0' : '#1A1A1A' }]}
            >
              {msg.text}
            </Text>
          </View>
        )}

        {hasScaffolded && !msg.streaming && (
          <View style={styles.scaffoldedBlock}>
            {msg.scaffoldedHelp!.hint && (
              <View
                style={[styles.hintCard, { backgroundColor: isDark ? '#1A2A3A' : '#E8F4FD' }]}
                accessibilityLabel={`Hint: ${msg.scaffoldedHelp!.hint}`}
              >
                <Text style={styles.hintIcon}>💡</Text>
                <Text style={[styles.hintHeading, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                  {t('tutorChat.hint')}
                </Text>
                <Text style={[styles.hintText, { color: isDark ? '#CCCCCC' : '#4A5568' }]}>
                  {msg.scaffoldedHelp!.hint}
                </Text>
              </View>
            )}

            {msg.scaffoldedHelp!.steps && msg.scaffoldedHelp!.steps.length > 0 && (
              <>
                {!section?.steps ? (
                  <TouchableOpacity
                    style={[styles.revealButton, { borderColor: isDark ? '#4A90D9' : '#4A90D9' }]}
                    onPress={() => handleRevealSteps(msg.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t('tutorChat.showSteps')}
                  >
                    <Text style={[styles.revealButtonText, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
                      {t('tutorChat.showSteps')}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.revealedSteps}>
                    <View style={styles.stepsHeader}>
                      <Text style={styles.stepsIcon}>📝</Text>
                      <Text style={[styles.stepsHeading, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                        {t('tutorChat.steps')}
                      </Text>
                    </View>
                    {msg.scaffoldedHelp!.steps!.map((step) => (
                      <View key={step.step} style={styles.stepRow}>
                        <View
                          style={[styles.stepCircle, { backgroundColor: isDark ? '#2A4A7A' : '#E8F4FD' }]}
                        >
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

                    {!section?.solution && (
                      <TouchableOpacity
                        style={[styles.revealButton, { borderColor: '#4CAF50', marginTop: 8 }]}
                        onPress={() => handleRevealSolution(msg.id)}
                        accessibilityRole="button"
                        accessibilityLabel={t('tutorChat.showSolution')}
                      >
                        <Text style={[styles.revealButtonText, { color: '#4CAF50' }]}>
                          {t('tutorChat.showSolution')}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {section?.solution && msg.scaffoldedHelp!.fullSolution && (
                      <View style={[styles.solutionCard, { backgroundColor: isDark ? '#1A3A1A' : '#F0FFF0' }]}>
                        <View style={styles.solutionHeader}>
                          <Text style={styles.solutionIcon}>✅</Text>
                          <Text style={[styles.solutionHeading, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                            {t('tutorChat.fullSolution')}
                          </Text>
                        </View>
                        <Text style={[styles.solutionText, { color: isDark ? '#CCCCCC' : '#2E7D32' }]}>
                          {msg.scaffoldedHelp!.fullSolution}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  // ── Main Render ──

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
        <View style={styles.headerContent}>
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={t('common.goBack')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={[styles.backButton, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
                ← {t('common.back')}
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
              {t('tutorChat.title')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? '#888888' : '#9CA3AF' }]}>
              {t('tutorChat.subtitle')}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && !isProcessing && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🤖</Text>
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
              {t('tutorChat.emptyState.title')}
            </Text>
            <Text style={[styles.emptyBody, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
              {t('tutorChat.emptyState.body')}
            </Text>
          </View>
        )}

        {messages.map(renderMessage)}

        {isProcessing && (
          <View style={styles.typingRow}>
            <TypingIndicator label={t('tutorChat.thinking')} />
          </View>
        )}

        {showSuggestions && (
          <View style={styles.suggestionsRow}>
            {['math', 'english', 'science'].map((subj) => (
              <TouchableOpacity
                key={subj}
                style={[styles.suggestionChip, { backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF', borderColor: isDark ? '#444' : '#E5E7EB' }]}
                onPress={() => setInputText(t(`tutorChat.suggestion.${subj}`))}
                accessibilityRole="button"
                accessibilityLabel={t(`tutorChat.suggestion.${subj}`)}
              >
                <Text style={styles.suggestionChipText}>{t(`tutorChat.suggestion.${subj}`)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 12 }} />
      </ScrollView>

      {/* Input Bar */}
      <View
        style={[styles.inputBar, { paddingBottom: insets.bottom + 8, backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF', borderTopColor: isDark ? '#333' : '#E5E7EB' }]}
      >
        <View style={[styles.inputRow, { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6', borderColor: isDark ? '#444' : '#D1D5DB' }]}>
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}
            placeholder={t('tutorChat.inputPlaceholder')}
            placeholderTextColor={isDark ? '#666' : '#9CA3AF'}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!isProcessing}
            accessibilityLabel={t('tutorChat.inputAccessibility')}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: hasText && !isProcessing ? (isDark ? '#2563EB' : '#4A90D9') : (isDark ? '#333' : '#E5E7EB') }]}
            onPress={handleSend}
            disabled={!hasText || isProcessing}
            accessibilityRole="button"
            accessibilityLabel={t('tutorChat.send')}
          >
            <Text style={[styles.sendButtonText, { color: hasText && !isProcessing ? '#FFFFFF' : (isDark ? '#666' : '#9CA3AF') }]}>
              ↑
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  backButton: { fontSize: 15, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  chatScroll: { flex: 1 },
  chatContent: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },
  bubble: { padding: 13, borderRadius: 16, maxWidth: '85%', marginBottom: 4 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  userBubbleText: { color: '#FFFFFF', fontSize: 15, lineHeight: 21 },
  assistantBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  assistantBubbleText: { fontSize: 15, lineHeight: 22 },
  assistantMessageBlock: { gap: 8 },
  typingRow: { alignSelf: 'flex-start', marginBottom: 4 },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, paddingBottom: 8 },
  suggestionChip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  suggestionChipText: { fontSize: 13, fontWeight: '600', color: '#4A5568' },
  scaffoldedBlock: { gap: 8, paddingLeft: 4 },
  hintCard: { padding: 12, borderRadius: 10, gap: 6 },
  hintIcon: { fontSize: 16 },
  hintHeading: { fontSize: 14, fontWeight: '700' },
  hintText: { fontSize: 14, lineHeight: 20 },
  revealedSteps: { gap: 6 },
  stepsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepsIcon: { fontSize: 16 },
  stepsHeading: { fontSize: 14, fontWeight: '700' },
  stepRow: { flexDirection: 'row', gap: 8, paddingLeft: 2 },
  stepCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepNumber: { fontSize: 11, fontWeight: '700' },
  stepContent: { flex: 1, gap: 4, paddingBottom: 6 },
  stepDescription: { fontSize: 13, lineHeight: 19 },
  workingBox: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginTop: 2 },
  workingText: { fontSize: 13, fontWeight: '500' },
  solutionCard: { padding: 12, borderRadius: 10, gap: 6 },
  solutionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  solutionIcon: { fontSize: 16 },
  solutionHeading: { fontSize: 14, fontWeight: '700' },
  solutionText: { fontSize: 13, lineHeight: 19 },
  revealButton: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', alignSelf: 'flex-start' },
  revealButtonText: { fontSize: 13, fontWeight: '700' },
  inputBar: { paddingHorizontal: 16, paddingTop: 8, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 22, borderWidth: 1, paddingLeft: 16, paddingRight: 4, paddingVertical: 4, gap: 6 },
  textInput: { flex: 1, fontSize: 15, paddingVertical: 6, maxHeight: 80 },
  sendButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sendButtonText: { fontSize: 16, fontWeight: '700' },
});
