/**
 * FollowUpChat — chat message list + input bar for follow-up questions.
 *
 * Kid-friendly, bilingual via i18n (caller passes translated strings).
 * No analytics, no network calls.
 *
 * @see ADD §4.1 — Follow-up chat (kid can ask follow-ups after hints/solution)
 * @see ADD §9 — Quality bars (accessibility, bilingual)
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from 'react-native';

// ── Types ──────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface FollowUpChatProps {
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  /** i18n placeholder for input field */
  placeholder: string;
  /** i18n accessibility label for input field */
  inputAccessibilityLabel: string;
  /** i18n accessibility label for send button */
  sendAccessibilityLabel: string;
}

// ── Component ──────────────────────────────────────────────────────

export default function FollowUpChat({
  messages,
  inputValue,
  onInputChange,
  onSend,
  placeholder,
  inputAccessibilityLabel,
  sendAccessibilityLabel,
}: FollowUpChatProps) {
  const isDark = useColorScheme() === 'dark';
  const scrollRef = useRef<ScrollView>(null);

  const hasText = inputValue.trim().length > 0;

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!hasText) return;
    onSend();
  };

  if (messages.length === 0 && !inputValue) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Messages */}
      {messages.length > 0 && (
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {messages.map((msg, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                msg.role === 'user'
                  ? [
                      styles.userBubble,
                      { backgroundColor: isDark ? '#2563EB' : '#4A90D9' },
                    ]
                  : [
                      styles.assistantBubble,
                      { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' },
                    ],
              ]}
              accessibilityLabel={
                msg.role === 'user' ? `You: ${msg.text}` : `Tutor: ${msg.text}`
              }
            >
              <Text
                style={[
                  styles.bubbleText,
                  {
                    color:
                      msg.role === 'user'
                        ? '#FFFFFF'
                        : isDark
                          ? '#E0E0E0'
                          : '#1A1A1A',
                  },
                ]}
              >
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Input bar */}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6',
              color: isDark ? '#FFFFFF' : '#1A1A1A',
              borderColor: isDark ? '#444' : '#D1D5DB',
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#666' : '#9CA3AF'}
          value={inputValue}
          onChangeText={onInputChange}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          accessibilityLabel={inputAccessibilityLabel}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: hasText
                ? isDark
                  ? '#2563EB'
                  : '#4A90D9'
                : isDark
                  ? '#333'
                  : '#E5E7EB',
            },
          ]}
          onPress={handleSend}
          disabled={!hasText}
          accessibilityRole="button"
          accessibilityLabel={sendAccessibilityLabel}
        >
          <Text
            style={[
              styles.sendButtonText,
              {
                color: hasText
                  ? '#FFFFFF'
                  : isDark
                    ? '#666'
                    : '#9CA3AF',
              },
            ]}
          >
            ↑
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { gap: 8 },

  messagesScroll: { maxHeight: 200, gap: 8 },
  bubble: {
    padding: 12,
    borderRadius: 14,
    maxWidth: '85%',
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
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
  sendButtonText: { fontSize: 18, fontWeight: '700' as const },
});
