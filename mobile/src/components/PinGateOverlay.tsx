/**
 * PinGateOverlay — full-screen PIN entry overlay for parent area access.
 *
 * Per ADD §5.2: 4-digit PIN entry, 5 failed attempts → 60s cooldown.
 * Bilingual EN + zh-Hans. VoiceOver/TalkBack accessible.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PinGateState, PinGateActions } from '../hooks/usePinGate';

interface PinGateOverlayProps {
  state: PinGateState;
  actions: PinGateActions;
  onVerified: () => void;
  onDismiss?: () => void;
}

const PIN_LENGTH = 4;

export default function PinGateOverlay({
  state,
  actions,
  onVerified,
  onDismiss,
}: PinGateOverlayProps) {
  const { t } = useTranslation();
  const [pin, setPin] = useState<string[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [shakeActive, setShakeActive] = useState(false);

  // Reset PIN when overlay opens/closes
  useEffect(() => {
    setPin([]);
    setShakeActive(false);
  }, [state.isPinEntryVisible]);

  // Shake animation for wrong PIN
  const triggerShake = useCallback(() => {
    setShakeActive(true);
    Vibration.vibrate(Platform.OS === 'ios' ? 100 : 50);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => {
      setShakeActive(false);
    });
  }, [shakeAnim]);

  // Handle digit press
  const handleDigit = useCallback(
    async (digit: string) => {
      if (pin.length >= PIN_LENGTH) return;
      if (state.cooldownUntil > Date.now()) return;

      const newPin = [...pin, digit];
      setPin(newPin);

      if (newPin.length === PIN_LENGTH) {
        const pinString = newPin.join('');
        const verified = await actions.verifyPin(pinString);
        if (verified) {
          onVerified();
        } else {
          triggerShake();
        }
        // Clear after a brief delay so user sees the digits
        setTimeout(() => setPin([]), 300);
      }
    },
    [pin, state.cooldownUntil, actions, onVerified, triggerShake],
  );

  // Handle backspace
  const handleBackspace = useCallback(() => {
    if (pin.length > 0) setPin(pin.slice(0, -1));
  }, [pin]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    if (!onDismiss) return;
    actions.hidePinEntry();
    onDismiss();
  }, [actions, onDismiss]);

  if (!state.isPinEntryVisible) return null;

  // Cooldown remaining seconds
  const cooldownRemaining = state.cooldownUntil > Date.now()
    ? Math.ceil((state.cooldownUntil - Date.now()) / 1000)
    : 0;

  // Build error message
  const errorMessage = state.error === 'wrong'
    ? t('parentAuth.wrongPin')
    : state.error === 'cooldown'
    ? t('parentAuth.cooldownTimer', { seconds: cooldownRemaining })
    : null;

  return (
    <View style={styles.overlay} accessibilityViewIsModal accessibilityLiveRegion="polite">
      <View style={styles.container}>
        {/* Title */}
        <Text style={styles.title} accessibilityRole="header">
          {t('parentAuth.title')}
        </Text>
        <Text style={styles.instruction}>{t('parentAuth.enterPin')}</Text>

        {/* PIN dots */}
        <Animated.View
          style={[
            styles.dotsRow,
            shakeActive && { transform: [{ translateX: shakeAnim }] },
          ]}
          accessibilityLabel={`PIN entry, ${pin.length} of ${PIN_LENGTH} digits entered`}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: PIN_LENGTH, now: pin.length }}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < pin.length ? styles.dotFilled : styles.dotEmpty,
              ]}
            />
          ))}
        </Animated.View>

        {/* Error message */}
        {errorMessage && (
          <Text
            style={styles.error}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            {errorMessage}
          </Text>
        )}

        {/* Attempts remaining */}
        {!errorMessage && state.failedAttempts > 0 && state.cooldownUntil <= Date.now() && (
          <Text style={styles.attempts}>
            {t('parentAuth.attemptsRemaining', {
              count: MAX_ATTEMPTS - state.failedAttempts,
            })}
          </Text>
        )}

        {/* Numeric keypad */}
        <View style={styles.keypad} accessibilityRole="keyboard" aria-disabled={cooldownRemaining > 0}>
          {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row) => (
            <View key={row[0]} style={styles.keypadRow}>
              {row.map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={[
                    styles.key,
                    cooldownRemaining > 0 && styles.keyDisabled,
                  ]}
                  onPress={() => handleDigit(digit)}
                  disabled={cooldownRemaining > 0}
                  accessibilityRole="key"
                  accessibilityLabel={`${digit}`}
                  accessibilityState={{ disabled: cooldownRemaining > 0 }}
                >
                  <Text style={styles.keyText}>{digit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={styles.keypadRow}>
            {/* Empty space to maintain grid */}
            <View style={styles.key} />
            <TouchableOpacity
              style={[styles.key, cooldownRemaining > 0 && styles.keyDisabled]}
              onPress={() => handleDigit('0')}
              disabled={cooldownRemaining > 0}
              accessibilityRole="key"
              accessibilityLabel="0"
              accessibilityState={{ disabled: cooldownRemaining > 0 }}
            >
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.key}
              onPress={handleBackspace}
              accessibilityRole="key"
              accessibilityLabel="Delete"
            >
              <Text style={styles.keyBackspace}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dismiss */}
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
          >
            <Text style={styles.dismissText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: '88%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 28,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotEmpty: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  dotFilled: {
    backgroundColor: '#2563EB',
  },
  error: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  attempts: {
    fontSize: 13,
    color: '#F59E0B',
    marginBottom: 12,
    textAlign: 'center',
  },
  keypad: {
    width: '100%',
    maxWidth: 300,
    marginTop: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  key: {
    width: 72,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  keyDisabled: {
    opacity: 0.4,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  keyBackspace: {
    fontSize: 22,
    color: '#6B7280',
  },
  dismissBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  dismissText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
});
