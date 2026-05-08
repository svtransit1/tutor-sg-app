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
import { useCallback, useRef } from 'react';

export type VoiceState = 'idle' | 'recording' | 'processing' | 'error';

export interface FollowUpInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSend: (text: string) => void;
  onVoiceResult?: (text: string) => void;
  onVoiceError?: (error: Error) => void;
  disabled?: boolean;
  voiceState?: VoiceState;
  onMicPress: () => void;
}

export function FollowUpInput({
  value: controlledValue,
  onChangeText: controlledOnChangeText,
  onSend,
  onVoiceResult,
  onVoiceError,
  disabled = false,
  voiceState = 'idle',
  onMicPress,
}: FollowUpInputProps) {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);

  const isRecording = voiceState === 'recording';

  const handleSend = useCallback(() => {
    const text = controlledValue ?? '';
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    onSend(trimmed);
    controlledOnChangeText?.('');
  }, [controlledValue, onSend, controlledOnChangeText]);

  const handleChangeText = useCallback(
    (text: string) => {
      controlledOnChangeText?.(text);
    },
    [controlledOnChangeText],
  );

  const micAccessibilityLabel = (() => {
    switch (voiceState) {
      case 'recording':
        return t('homework.followUp.micRecording');
      case 'processing':
        return t('homework.followUp.micProcessing');
      case 'error':
        return t('homework.followUp.micError');
      default:
        return t('homework.followUp.mic');
    }
  })();

  const micIcon = (() => {
    switch (voiceState) {
      case 'recording':
        return '\u23F9';
      case 'processing':
        return '\u23F3';
      case 'error':
        return '\u26A0';
      default:
        return '\uD83C\uDFA4';
    }
  })();

  const placeholderText = isRecording
    ? t('homework.followUp.placeholderRecording')
    : t('homework.followUp.placeholder');

  const hasText = (controlledValue ?? '').trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.container}>
        <Pressable
          style={[
            styles.micButton,
            voiceState === 'recording' && styles.micButtonRecording,
            voiceState === 'processing' && styles.micButtonProcessing,
            voiceState === 'error' && styles.micButtonError,
          ]}
          onPress={onMicPress}
          disabled={disabled || voiceState === 'processing'}
          accessibilityLabel={micAccessibilityLabel}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text
            style={[
              styles.micIcon,
              voiceState === 'recording' && styles.micIconRecording,
              voiceState === 'error' && styles.micIconError,
            ]}
            accessibilityElementsHidden
          >
            {micIcon}
          </Text>
        </Pressable>

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={controlledValue}
          onChangeText={handleChangeText}
          placeholder={placeholderText}
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          accessibilityLabel={placeholderText}
          editable={!disabled && !isRecording}
          textAlignVertical="center"
        />

        <Pressable
          style={[
            styles.sendButton,
            hasText && !disabled && styles.sendButtonActive,
          ]}
          onPress={handleSend}
          disabled={!hasText || disabled}
          accessibilityLabel={t('homework.followUp.send')}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text
            style={[
              styles.sendIcon,
              hasText && !disabled && styles.sendIconActive,
            ]}
            accessibilityElementsHidden
          >
            {'\u2191'}
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
  micButtonProcessing: {
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFB300',
  },
  micButtonError: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  micIcon: {
    fontSize: 20,
  },
  micIconRecording: {
    fontSize: 16,
  },
  micIconError: {
    color: '#FF9800',
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
