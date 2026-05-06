/**
 * ParentPinSetupScreen — onboarding step 3/7: PIN setup.
 *
 * Purpose: Local 4-digit PIN to gate the Parent Log later.
 * Per M2 onboarding UX spec §3.4:
 * - Two-step: enter 4 digits → re-enter to confirm
 * - Mismatch → visual feedback + reset to step 1
 * - PIN stored in Keychain (iOS) / EncryptedSharedPreferences (Android)
 * - Optional "Skip — set up later" link
 *
 * Uses Pressable instead of TouchableOpacity to avoid RN Animated dependency
 * which can cause React version mismatch in test environments.
 *
 * Bilingual (EN + zh-Hans). Kid-safe (no data leaving device).
 * Accessibility: VoiceOver/TalkBack labels on all interactive elements.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { savePin } from '../../storage/pin-storage';

// ── Constants ──────────────────────────────────────────────────────

const PIN_LENGTH = 4;

// ── Types ──────────────────────────────────────────────────────────

type PinStep = 'enter' | 'confirm';

interface ParentPinSetupScreenProps {
  /** Called when PIN setup completes (saved successfully). */
  onComplete?: () => void;
  /** Called when user taps "Skip — set up later". */
  onSkip?: () => void;
}

// ── Digit slot component ───────────────────────────────────────────

function DigitSlot({ filled, index }: { filled: boolean; index: number }) {
  return (
    <View
      style={[styles.digitSlot, filled && styles.digitSlotFilled]}
      accessibilityLabel={filled ? `Digit ${index + 1} entered` : `Digit ${index + 1}`}
    >
      <Text style={[styles.digitText, filled && styles.digitTextFilled]}>
        {filled ? '●' : ''}
      </Text>
    </View>
  );
}

// ── Numeric keypad component ───────────────────────────────────────

function KeypadButton({
  value,
  onPress,
  disabled,
}: {
  value: string;
  onPress: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.keypadBtn,
        pressed && styles.keypadBtnPressed,
      ]}
      onPress={() => onPress(value)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Key ${value}`}
    >
      <Text style={[styles.keypadBtnText, value === '⌫' && styles.keypadBackspace]}>
        {value}
      </Text>
    </Pressable>
  );
}

// ── Screen Component ───────────────────────────────────────────────

export default function ParentPinSetupScreen({
  onComplete,
  onSkip,
}: ParentPinSetupScreenProps) {
  const { t } = useTranslation();

  // ── State ──────────────────────────────────────────────────

  const [step, setStep] = useState<PinStep>('enter');
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [mismatch, setMismatch] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Mismatch feedback ──────────────────────────────────────

  const triggerMismatch = useCallback(() => {
    setMismatch(true);
    // Reset to enter step after a brief delay
    setTimeout(() => {
      setMismatch(false);
      setStep('enter');
      setPin('');
      setConfirmPin('');
    }, 800);
  }, []);

  // ── Key press handler ──────────────────────────────────────

  const handleKeyPress = useCallback(
    (value: string) => {
      if (value === '⌫') {
        if (step === 'enter') {
          setPin((prev) => prev.slice(0, -1));
        } else {
          setConfirmPin((prev) => prev.slice(0, -1));
        }
        return;
      }

      // Only accept numeric digits
      if (!/^\d$/.test(value)) return;

      if (step === 'enter') {
        if (pin.length >= PIN_LENGTH) return;
        const newPin = pin + value;
        setPin(newPin);

        // Pin complete → move to confirm step
        if (newPin.length === PIN_LENGTH) {
          setStep('confirm');
        }
      } else {
        // confirm step
        if (confirmPin.length >= PIN_LENGTH) return;
        const newConfirm = confirmPin + value;
        setConfirmPin(newConfirm);

        // Confirmation complete → compare
        if (newConfirm.length === PIN_LENGTH) {
          if (newConfirm === pin) {
            // Match! Save and proceed
            setSaving(true);
            savePin(newConfirm)
              .then(() => onComplete?.())
              .catch(() => {
                triggerMismatch();
              })
              .finally(() => setSaving(false));
          } else {
            // Mismatch — show error and reset
            triggerMismatch();
          }
        }
      }
    },
    [step, pin, confirmPin, onComplete, triggerMismatch],
  );

  // ── Go back from confirm to enter ──────────────────────────

  const handleGoBackToEnter = useCallback(() => {
    setStep('enter');
    setConfirmPin('');
    setPin(pin.slice(0, -1));
  }, [pin]);

  // ── I18n strings ───────────────────────────────────────────

  const title = t('onboarding.parentPinSetup.title');
  const body = t('onboarding.parentPinSetup.body');
  const enterLabel = t('onboarding.parentPinSetup.enterPin');
  const confirmLabel = t('onboarding.parentPinSetup.confirmPin');
  const mismatchLabel = t('onboarding.parentPinSetup.mismatch');
  const skipLabel = t('onboarding.parentPinSetup.skip');

  const currentDigits = step === 'enter' ? pin : confirmPin;

  // ── Render ─────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon area */}
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔐</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Body copy */}
        <Text style={styles.body}>{body}</Text>

        {/* Step label */}
        <Text style={styles.stepLabel}>
          {step === 'enter' ? enterLabel : confirmLabel}
        </Text>

        {/* Mismatch error */}
        {mismatch && (
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            {mismatchLabel}
          </Text>
        )}

        {/* PIN digit slots */}
        <View
          style={[
            styles.pinRow,
            mismatch && styles.pinRowError,
          ]}
          accessibilityElementsHidden={false}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <DigitSlot key={i} filled={i < currentDigits.length} index={i} />
          ))}
        </View>

        {/* Numeric keypad */}
        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <KeypadButton
              key={digit}
              value={digit}
              onPress={handleKeyPress}
              disabled={saving}
            />
          ))}
          <View style={styles.keypadSpacer} />
          <KeypadButton
            value="0"
            onPress={handleKeyPress}
            disabled={saving}
          />
          <KeypadButton
            value="⌫"
            onPress={handleKeyPress}
            disabled={saving || currentDigits.length === 0}
          />
        </View>

        {/* Back link — only during confirm step */}
        {step === 'confirm' && (
          <Pressable
            style={styles.backLink}
            onPress={handleGoBackToEnter}
            accessibilityRole="button"
            accessibilityLabel="Go back to enter PIN"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backLinkText}>
              ← {t('onboarding.parentPinSetup.enterPin')}
            </Text>
          </Pressable>
        )}

        {/* Skip link */}
        <Pressable
          style={styles.skipLink}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.parentPinSetup.accessibility.skipButton')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipLinkText}>{skipLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  icon: {
    fontSize: 40,
  },

  // Title
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },

  // Body
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },

  // Step label
  stepLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  // Error text
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },

  // PIN row — 4 digit slots
  pinRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
    justifyContent: 'center',
  },
  pinRowError: {
    opacity: 0.7,
  },

  digitSlot: {
    width: 56,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  digitSlotFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  digitText: {
    fontSize: 28,
    color: '#D1D5DB',
  },
  digitTextFilled: {
    color: '#2563EB',
  },

  // Numeric keypad
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 300,
    marginBottom: 24,
  },
  keypadBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  keypadBtnPressed: {
    backgroundColor: '#E5E7EB',
  },
  keypadBtnText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  keypadBackspace: {
    fontSize: 22,
    color: '#6B7280',
  },
  keypadSpacer: {
    width: 72,
    height: 72,
  },

  // Back link (during confirm step — go back to re-enter PIN)
  backLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backLinkText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Skip link
  skipLink: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipLinkText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
} as TextStyle);
