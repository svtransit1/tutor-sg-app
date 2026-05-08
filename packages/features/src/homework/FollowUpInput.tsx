import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useCallback } from 'react';

export interface FollowUpInputProps {
  onSend: (text: string) => void;
  onMicPress: () => void;
  isRecording: boolean;
}

export function FollowUpInput({
  onSend,
  onMicPress,
  isRecording,
}: FollowUpInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    onSend(trimmed);
    setText('');
  }, [text, onSend]);

  const micAccessibilityLabel = isRecording
    ? t('homework.followUp.micRecording')
    : t('homework.followUp.mic');

  const placeholderText = isRecording
    ? t('homework.followUp.placeholderRecording')
    : t('homework.followUp.placeholder');

  const hasText = text.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.container}>
        <Pressable
          style={[
            styles.micButton,
            isRecording && styles.micButtonRecording,
          ]}
          onPress={onMicPress}
          accessibilityLabel={micAccessibilityLabel}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text
            style={[
              styles.micIcon,
              isRecording && styles.micIconRecording,
            ]}
            accessibilityElementsHidden
          >
            {isRecording ? '⏹' : '🎤'}
          </Text>
        </Pressable>

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholderText}
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          accessibilityLabel={placeholderText}
          editable={!isRecording}
          textAlignVertical="center"
        />

        <Pressable
          style={[
            styles.sendButton,
            hasText && styles.sendButtonActive,
          ]}
          onPress={handleSend}
          disabled={!hasText}
          accessibilityLabel={t('homework.followUp.send')}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text
            style={[
              styles.sendIcon,
              hasText && styles.sendIconActive,
            ]}
            accessibilityElementsHidden
          >
            ↑
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 8,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonRecording: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#EF5350',
  },
  micIcon: {
    fontSize: 20,
  },
  micIconRecording: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#F5F7FA',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1A1A2E',
    lineHeight: 22,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#4A90D9',
  },
  sendIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#B0BEC5',
  },
  sendIconActive: {
    color: '#fff',
  },
});
