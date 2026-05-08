import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import { useTranslation } from 'react-i18next'

export type VoiceRecorderState = 'idle' | 'recording' | 'processing' | 'error'

export interface VoiceRecorderProps {
  onStateChange?: (state: VoiceRecorderState) => void
  onResult?: (text: string) => void
  onError?: (error: Error) => void
  recordingDuration?: number
  processingDuration?: number
}

const MIC_ICON = '🎤'
const STOP_ICON = '⏹'
const PROCESSING_ICON = '⏳'

function RecordingPulse({ isDark }: { isDark: boolean }) {
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [pulseAnim])

  return (
    <Animated.Text
      style={[
        styles.recordingIndicator,
        { color: isDark ? '#FF6B6B' : '#DC2626', opacity: pulseAnim },
      ]}
      accessibilityRole="text"
    >
      {'\u{1F534}'}
    </Animated.Text>
  )
}

export default function VoiceRecorder({
  onStateChange,
  onResult,
  onError,
  recordingDuration,
  processingDuration,
}: VoiceRecorderProps) {
  const { t } = useTranslation()
  const isDark = useColorScheme() === 'dark'
  const [voiceState, setVoiceState] = useState<VoiceRecorderState>('idle')
  const stateRef = useRef(voiceState)
  const onStateChangeRef = useRef(onStateChange)
  const onErrorRef = useRef(onError)
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const processingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  stateRef.current = voiceState
  onStateChangeRef.current = onStateChange
  onErrorRef.current = onError

  const callOnStateChange = useCallback((newState: VoiceRecorderState) => {
    onStateChangeRef.current?.(newState)
  }, [])

  const clearAllTimers = useCallback(() => {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current)
      processingTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearAllTimers()
    }
  }, [clearAllTimers])

  const enterProcessing = useCallback(() => {
    setVoiceState('processing')
    callOnStateChange('processing')
    processingTimerRef.current = setTimeout(() => {
      if (stateRef.current === 'processing') {
        setVoiceState('error')
        callOnStateChange('error')
        onErrorRef.current?.(new Error('Voice processing timed out'))
      }
    }, processingDuration ?? 100)
  }, [callOnStateChange, processingDuration])

  const stopRecording = useCallback(() => {
    clearAllTimers()
    enterProcessing()
  }, [clearAllTimers, enterProcessing])

  const startRecording = useCallback(() => {
    setVoiceState('recording')
    callOnStateChange('recording')
    if (recordingDuration != null && recordingDuration > 0) {
      recordingTimerRef.current = setTimeout(() => {
        if (stateRef.current === 'recording') {
          stopRecording()
        }
      }, recordingDuration)
    }
  }, [callOnStateChange, recordingDuration, stopRecording])

  const retryRecording = useCallback(() => {
    clearAllTimers()
    startRecording()
  }, [clearAllTimers, startRecording])

  const resetVoice = useCallback(() => {
    clearAllTimers()
    setVoiceState('idle')
    callOnStateChange('idle')
  }, [clearAllTimers, callOnStateChange])

  const completeTranscription = useCallback(
    (text: string) => {
      clearAllTimers()
      setVoiceState('idle')
      callOnStateChange('idle')
      onResult?.(text)
    },
    [clearAllTimers, callOnStateChange, onResult],
  )

  const handleMicPress = useCallback(() => {
    if (voiceState === 'recording') {
      stopRecording()
    } else if (voiceState === 'idle') {
      startRecording()
    }
  }, [voiceState, startRecording, stopRecording])

  const bgColor = isDark ? '#1A1A1A' : '#FFFFFF'

  return (
    <View
      style={[styles.container, { backgroundColor: bgColor }]}
      testID="voice-recorder"
    >
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.micButton, { opacity: voiceState === 'processing' ? 0.4 : 1 }]}
          onPress={handleMicPress}
          disabled={voiceState === 'processing'}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={
            voiceState === 'recording'
              ? t('homeworkFeedback.accessibility.stopRecording')
              : t('homeworkFeedback.accessibility.voiceButton')
          }
        >
          <Text style={styles.micIcon}>
            {voiceState === 'recording' ? STOP_ICON : MIC_ICON}
          </Text>
        </TouchableOpacity>

        {voiceState === 'recording' && (
          <View style={styles.statusRow}>
            <RecordingPulse isDark={isDark} />
            <Text
              style={[styles.statusText, { color: isDark ? '#CCCCCC' : '#6B7280' }]}
            >
              {t('homeworkFeedback.voiceRecording')}
            </Text>
          </View>
        )}

        {voiceState === 'processing' && (
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>{PROCESSING_ICON}</Text>
            <Text
              style={[styles.statusText, { color: isDark ? '#CCCCCC' : '#6B7280' }]}
            >
              {t('homeworkFeedback.voiceProcessing')}
            </Text>
          </View>
        )}

        {voiceState === 'error' && (
          <View style={styles.statusRow}>
            <Text
              style={[styles.statusText, { color: isDark ? '#CCCCCC' : '#6B7280', flex: 1 }]}
            >
              {t('homeworkFeedback.voiceError')}
            </Text>
            <TouchableOpacity
              onPress={retryRecording}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('homeworkFeedback.voiceRetry')}
            >
              <Text
                style={[
                  styles.retryText,
                  { color: isDark ? '#60A5FA' : '#2563EB' },
                ]}
              >
                {t('homeworkFeedback.voiceRetry')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  } satisfies ViewStyle,

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
  } satisfies ViewStyle,

  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,

  micIcon: {
    fontSize: 22,
  } satisfies TextStyle,

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  } satisfies ViewStyle,

  statusIcon: {
    fontSize: 16,
  } satisfies TextStyle,

  statusText: {
    fontSize: 14,
  } satisfies TextStyle,

  recordingIndicator: {
    fontSize: 16,
  } satisfies TextStyle,

  retryText: {
    fontSize: 14,
    fontWeight: '600',
    paddingLeft: 8,
  } satisfies TextStyle,
})
