/**
 * PinSetupScreen — full-screen PIN setup flow for first-time parent area access.
 *
 * Per ADD §5.2: parent sets a 4-digit PIN during first parent area access.
 * Bilingual EN + zh-Hans. VoiceOver/TalkBack accessible.
 */
import React, { useState, useRef, useCallback } from 'react';
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
import type { PinGateActions } from '../hooks/usePinGate';

interface PinSetupScreenProps {
  actions: PinGateActions;
  onComplete: () => void;
  onSkip?: () => void;
}

type SetupPhase = 'enter' | 'confirm' | 'mismatch';

const PIN_LENGTH = 4;

export default function PinSetupScreen({
  actions,
  onComplete,
  onSkip,
}: PinSetupScreenProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<SetupPhase>('enter');
  const [firstPin, setFirstPin] = useState<string[]>([]);
  const [secondPin, setSecondPin] = useState<string[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [shakeActive, setShakeActive] = useState(false);

  const triggerShake = useCallback(() => {
    setShakeActive(true);
    Vibration.vibrate(Platform.OS === 'ios' ? 100 : 50);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => setShakeActive(false));
  }, [shakeAnim]);

  // Reset to enter phase
  const resetToEnter = useCallback(() => {
    setPhase('enter');
    setFirstPin([]);
    setSecondPin([]);
    setShakeActive(false);
  }, []);

  // Handle digit press
  const handleDigit = useCallback(
    async (digit: string) => {
      if (phase === 'enter') {
        if (firstPin.length >= PIN_LENGTH) return;
        const newPin = [...firstPin, digit];
        setFirstPin(newPin);
        if (newPin.length === PIN_LENGTH) {
          // Move to confirm phase after brief delay
          setTimeout(() => {
            setPhase('confirm');
          }, 200);
        }
      } else if (phase === 'confirm' || phase === 'mismatch') {
        if (secondPin.length >= PIN_LENGTH) return;
        const newPin = [...secondPin, digit];
        setSecondPin(newPin);
        if (newPin.length === PIN_LENGTH) {
          const entered = firstPin.join('');
          const confirmed = newPin.join('');
          if (entered === confirmed) {
            // PINs match — save
            const saved = await actions.setPin(entered);
            if (saved) {
              onComplete();
            }
          } else {
            // Mismatch — shake and reset confirmation
            triggerShake();
            setTimeout(() => {
              setPhase('mismatch');
              setSecondPin([]);
            }, 400);
          }
        }
      }
    },
    [phase, firstPin, secondPin, actions, onComplete, triggerShake],
  );

  const handleBackspace = useCallback(() => {
    if (phase === 'enter' && firstPin.length > 0) {
      setFirstPin(firstPin.slice(0, -1));
    } else if ((phase === 'confirm' || phase === 'mismatch') && secondPin.length > 0) {
      setSecondPin(secondPin.slice(0, -1));
    } else if (phase === 'confirm' && secondPin.length === 0) {
      // Go back to enter phase
      resetToEnter();
    }
  }, [phase, firstPin, secondPin, resetToEnter]);

  const currentPin = phase === 'enter' ? firstPin : secondPin;
  const activePinLength = currentPin.length;

  return (
    <View style={styles.container} accessibilityViewIsModal accessibilityLiveRegion="polite">
      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.title} accessibilityRole="header">
          {t('parentAuth.setup.title')}
        </Text>
        <Text style={styles.instruction}>
          {phase === 'enter'
            ? t('parentAuth.setup.enterPin')
            : t('parentAuth.setup.confirmPin')}
        </Text>

        {/* PIN dots */}
        <Animated.View
          style={[
            styles.dotsRow,
            shakeActive && { transform: [{ translateX: shakeAnim }] },
          ]}
          accessibilityLabel={`PIN ${phase}, ${activePinLength} of ${PIN_LENGTH} digits entered`}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: PIN_LENGTH, now: activePinLength }}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < activePinLength ? styles.dotFilled : styles.dotEmpty,
              ]}
            />
          ))}
        </Animated.View>

        {/* Mismatch error */}
        {phase === 'mismatch' && (
          <Text
            style={styles.error}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            {t('parentAuth.pinsDontMatch')}
          </Text>
        )}

        {/* Numeric keypad */}
        <View style={styles.keypad}>
          {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row) => (
            <View key={row[0]} style={styles.keypadRow}>
              {row.map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={styles.key}
                  onPress={() => handleDigit(digit)}
                  accessibilityRole="key"
                  accessibilityLabel={`${digit}`}
                >
                  <Text style={styles.keyText}>{digit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={styles.keypadRow}>
            <View style={styles.key} />
            <TouchableOpacity
              style={styles.key}
              onPress={() => handleDigit('0')}
              accessibilityRole="key"
              accessibilityLabel="0"
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

        {/* Skip button */}
        {onSkip && phase === 'enter' && firstPin.length === 0 && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel={t('parentAuth.setup.skip', 'Skip — set up later')}
          >
            <Text style={styles.skipText}>
              {t('parentAuth.setup.skip', 'Skip — set up later')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '88%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
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
  keyText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  keyBackspace: {
    fontSize: 22,
    color: '#6B7280',
  },
  skipBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
