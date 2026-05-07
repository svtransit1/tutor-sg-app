/**
 * PinSetupScreen — Parent PIN setup flow.
 *
 * Two-step: enter 4-digit PIN → confirm by re-entering.
 * On match → save to secure store and call onComplete().
 * On mismatch → show error and reset to step 1.
 *
 * Part of the onboarding flow when no PIN is set yet.
 * Can also be accessed from Parent Settings to change PIN.
 *
 * Bilingual (EN + zh-Hans). Kid-safe (no data leaving device).
 * Accessibility: VoiceOver/TalkBack labels on all interactive elements.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useI18n } from '@tutor-sg/i18n';
import { savePin } from './pin-storage';

// ── Constants ──────────────────────────────────────────────────────

const PIN_LENGTH = 4;

// ── Types ──────────────────────────────────────────────────────────

type PinStep = 'enter' | 'confirm';

interface PinSetupScreenProps {
  /** Called when PIN setup completes (saved successfully). */
  onComplete?: () => void;
  /** Called when user taps "Skip — set up later". */
  onSkip?: () => void;
  /** Called when user wants to go back/dismiss. */
  onDismiss?: () => void;
  /** If true, show "Skip" option (onboarding mode). If false, PIN is required. */
  skippable?: boolean;
}

// ── Digit slot component ───────────────────────────────────────────

function DigitSlot({ filled, label }: { filled: boolean; label: string }) {
  return (
    <View style={[styles.digitSlot, filled && styles.digitSlotFilled]} accessibilityLabel={label}>
      <Text style={[styles.digitText, filled && styles.digitTextFilled]}>{filled ? '●' : ''}</Text>
    </View>
  );
}

// ── Numeric keypad button ──────────────────────────────────────────

function KeypadButton({
  value,
  onPress,
  disabled,
  label,
}: {
  value: string;
  onPress: (v: string) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.keypadBtn, pressed && styles.keypadBtnPressed]}
      onPress={() => onPress(value)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.keypadBtnText, value === '⌫' && styles.keypadBackspace]}>{value}</Text>
    </Pressable>
  );
}

// ── Screen Component ───────────────────────────────────────────────

export default function PinSetupScreen({
  onComplete,
  onSkip,
  onDismiss,
  skippable = true,
}: PinSetupScreenProps) {
  const { t } = useI18n();

  // ── State ──────────────────────────────────────────────────

  const [step, setStep] = useState<PinStep>('enter');
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [mismatch, setMismatch] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Mismatch feedback ──────────────────────────────────────

  const triggerMismatch = useCallback(() => {
    setMismatch(true);
    setTimeout(() => {
      setMismatch(false);
      setStep('enter');
      setPin('');
      setConfirmPin('');
    }, 1000);
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

      if (!/^\d$/.test(value)) return;

      if (step === 'enter') {
        if (pin.length >= PIN_LENGTH) return;
        const newPin = pin + value;
        setPin(newPin);

        if (newPin.length === PIN_LENGTH) {
          setStep('confirm');
        }
      } else {
        if (confirmPin.length >= PIN_LENGTH) return;
        const newConfirm = confirmPin + value;
        setConfirmPin(newConfirm);

        if (newConfirm.length === PIN_LENGTH) {
          if (newConfirm === pin) {
            setSaving(true);
            savePin(newConfirm)
              .then(() => onComplete?.())
              .catch(() => {
                triggerMismatch();
              })
              .finally(() => setSaving(false));
          } else {
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

  // ── Current display state ──────────────────────────────────

  const currentDigits = step === 'enter' ? pin : confirmPin;

  // ── Render ─────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Dismiss button */}
        {onDismiss && (
          <Pressable
            style={styles.dismissButton}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel={t('common:back') ?? 'Back'}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.dismissText}>✕</Text>
          </Pressable>
        )}

        {/* Icon */}
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔐</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('parent:pin_setup_title')}</Text>

        {/* Description */}
        <Text style={styles.body}>{t('parent:pin_setup_desc')}</Text>

        {/* Step label */}
        <Text style={styles.stepLabel}>
          {step === 'enter' ? t('parent:pin_setup') : t('parent:pin_confirm')}
        </Text>

        {/* Mismatch error */}
        {mismatch && (
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            {t('parent:pin_mismatch')}
          </Text>
        )}

        {/* PIN digit slots */}
        <View style={[styles.pinRow, mismatch && styles.pinRowError]}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <DigitSlot
              key={i}
              filled={i < currentDigits.length}
              label={
                step === 'confirm'
                  ? t('parent:digit_confirm', { position: String(i + 1) })
                  : t('parent:digit_empty', { position: String(i + 1) })
              }
            />
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
              label={t('parent:keypad_digit', { value: digit })}
            />
          ))}
          <View style={styles.keypadSpacer} />
          <KeypadButton
            value="0"
            onPress={handleKeyPress}
            disabled={saving}
            label={t('parent:keypad_digit', { value: '0' })}
          />
          <KeypadButton
            value="⌫"
            onPress={handleKeyPress}
            disabled={saving || currentDigits.length === 0}
            label={t('parent:keypad_backspace')}
          />
        </View>

        {/* Back link — during confirm step */}
        {step === 'confirm' && (
          <Pressable
            style={styles.backLink}
            onPress={handleGoBackToEnter}
            accessibilityRole="button"
            accessibilityLabel={t('parent:back_to_enter')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backLinkText}>← {t('parent:pin_setup')}</Text>
          </Pressable>
        )}

        {/* Skip link */}
        {skippable && (
          <Pressable
            style={styles.skipLink}
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel={t('parent:skip_pin_setup')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skipLinkText}>{t('parent:skip_pin_setup')}</Text>
          </Pressable>
        )}
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

  // Dismiss
  dismissButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dismissText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Icon
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },

  // Title
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },

  // Body
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },

  // Step label
  stepLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  // Error
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },

  // PIN row
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

  // Keypad
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

  // Back link
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
});
