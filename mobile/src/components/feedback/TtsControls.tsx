import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import TtsService, { type TtsLanguage, type TtsState } from '../../services/tts/TtsService';

export interface TtsControlsProps {
  /** Text content to read aloud. */
  text: string;
  /** Language for speech synthesis. */
  language?: TtsLanguage;
  /** i18n key for a label shown before the read-aloud button. */
  label?: string;
  /** Callback when speech completes naturally. */
  onDone?: () => void;
}

/**
 * TtsControls — reusable bilingual read-aloud button for homework feedback.
 *
 * Shows play/pause/stop controls with accessibility labels.
 * Handles speak → pause → resume → stop lifecycle.
 * Announces state changes to screen readers via live region.
 *
 * Usage:
 *   <TtsControls
 *     text="The answer is 42."
 *     language="en"
 *     label="tts.feedbackSolution"
 *   />
 */
export const TtsControls: React.FC<TtsControlsProps> = ({
  text,
  language = 'en',
  label,
  onDone,
}) => {
  const { t } = useTranslation();
  const [state, setState] = useState<TtsState>('idle');
  const [error, setError] = useState<string | null>(null);
  const liveRef = useRef<string>('');

  const handleStart = useCallback(() => {
    setState('speaking');
    setError(null);
    liveRef.current = t('tts.speaking');
  }, [t]);

  const handleDone = useCallback(() => {
    setState('idle');
    liveRef.current = '';
    onDone?.();
  }, [onDone]);

  const handleStopped = useCallback(() => {
    setState('idle');
    liveRef.current = '';
  }, []);

  const handleError = useCallback(
    (err: Error) => {
      setState('idle');
      setError(t('tts.error'));
      liveRef.current = t('tts.error');
    },
    [t],
  );

  const speak = useCallback(() => {
    TtsService.speak(text, language, {
      onStart: handleStart,
      onDone: handleDone,
      onStopped: handleStopped,
      onError: handleError,
    });
  }, [text, language, handleStart, handleDone, handleStopped, handleError]);

  const handlePause = useCallback(async () => {
    await TtsService.pause();
    setState('paused');
    liveRef.current = t('tts.paused');
  }, [t]);

  const handleResume = useCallback(async () => {
    await TtsService.resume();
    setState('speaking');
    liveRef.current = t('tts.speaking');
  }, [t]);

  const handleStop = useCallback(async () => {
    await TtsService.stop();
    setState('idle');
    liveRef.current = '';
  }, []);

  const handlePress = useCallback(() => {
    if (state === 'idle') {
      speak();
    } else if (state === 'paused') {
      handleResume();
    } else if (state === 'speaking') {
      handlePause();
    }
  }, [state, speak, handlePause, handleResume]);

  const handleLongPress = useCallback(() => {
    if (state !== 'idle') {
      handleStop();
    }
  }, [state, handleStop]);

  const labelText = label ? t(label) : '';

  return (
    <View style={styles.container}>
      {labelText ? (
        <Text style={styles.label} accessibilityRole="text">
          {labelText}
        </Text>
      ) : null}

      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[
            styles.button,
            state === 'speaking' && styles.buttonActive,
            state === 'paused' && styles.buttonPaused,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            state === 'idle'
              ? `${t('tts.readAloud')}${labelText ? ` — ${labelText}` : ''}`
              : state === 'speaking'
                ? t('tts.pause')
                : t('tts.resume')
          }
          accessibilityState={{ disabled: false, busy: state === 'speaking' }}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500}
        >
          <Text style={styles.buttonIcon}>
            {state === 'idle' ? '▶' : state === 'speaking' ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        {state !== 'idle' && (
          <TouchableOpacity
            style={[styles.button, styles.buttonStop]}
            accessibilityRole="button"
            accessibilityLabel={t('tts.stop')}
            onPress={handleStop}
          >
            <Text style={styles.buttonIcon}>⏹</Text>
          </TouchableOpacity>
        )}

        {state !== 'idle' && (
          <Text
            style={[styles.statusText, state === 'paused' && styles.statusPaused]}
            accessibilityRole="text"
          >
            {state === 'speaking' ? t('tts.speaking') : t('tts.paused')}
          </Text>
        )}
      </View>

      {error && (
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {error}
        </Text>
      )}

      {/* Screen-reader-only live region for state announcements */}
      <View accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.srOnly}>
        <Text>{liveRef.current}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#3A7BC8',
  },
  buttonPaused: {
    backgroundColor: '#F5A623',
  },
  buttonStop: {
    backgroundColor: '#D84A4A',
  },
  buttonIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusPaused: {
    color: '#F5A623',
  },
  errorText: {
    fontSize: 14,
    color: '#D84A4A',
    marginTop: 4,
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0,
  },
});

export default TtsControls;
