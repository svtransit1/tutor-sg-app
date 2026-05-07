/**
 * PinGateScreen — Parent area PIN authentication gate.
 *
 * When tapping "Parent Area" from anywhere in the app, if a PIN has been set,
 * this screen appears. The user must enter the 4-digit PIN to proceed.
 *
 * Security:
 * - 5 failed attempts → 60-second cooldown
 * - Cooldown timer shown with countdown
 * - PIN verified via constant-time comparison
 *
 * Bilingual: EN + zh-Hans. Kid-safe (no data leaving device).
 * Accessibility: VoiceOver/TalkBack labels on all interactive elements.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type TextStyle,
} from 'react-native';
import { useI18n } from '@tutor-sg/i18n';
import {
  verifyPin,
  MAX_FAILED_ATTEMPTS,
  COOLDOWN_SECONDS,
} from './pin-storage';

// ── Constants ──────────────────────────────────────────────────────

const PIN_LENGTH = 4;

// ── Types ──────────────────────────────────────────────────────────

interface PinGateScreenProps {
  /** Called when PIN verification succeeds. */
  onAuthenticated?: () => void;
  /** Called when user wants to go back (e.g. dismiss parent area). */
  onDismiss?: () => void;
}

// ── Digit slot component ───────────────────────────────────────────

function DigitSlot({ filled, label }: { filled: boolean; label: string }) {
  return (
    <View
      style={[styles.digitSlot, filled && styles.digitSlotFilled]}
      accessibilityLabel={label}
    >
      <Text style={[styles.digitText, filled && styles.digitTextFilled]}>
        {filled ? '●' : ''}
      </Text>
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
      style={({ pressed }) => [
        styles.keypadBtn,
        pressed && styles.keypadBtnPressed,
      ]}
      onPress={() => onPress(value)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.keypadBtnText,
          value === '⌫' && styles.keypadBackspace,
        ]}
      >
        {value}
      </Text>
    </Pressable>
  );
}

// ── Screen Component ───────────────────────────────────────────────

export default function PinGateScreen({
  onAuthenticated,
  onDismiss,
}: PinGateScreenProps) {
  const { t } = useI18n();

  // ── State ──────────────────────────────────────────────────

  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] =
    useState<number>(MAX_FAILED_ATTEMPTS);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const [verifying, setVerifying] = useState(false);

  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Cooldown countdown ─────────────────────────────────────

  useEffect(() => {
    if (lockedUntil === null) {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
        cooldownTimer.current = null;
      }
      return;
    }

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((lockedUntil - Date.now()) / 1000),
      );
      setCooldownSecs(remaining);
      if (remaining <= 0) {
        setLockedUntil(null);
        setCooldownSecs(0);
        setError(null);
        setRemainingAttempts(MAX_FAILED_ATTEMPTS);
        if (cooldownTimer.current) {
          clearInterval(cooldownTimer.current);
          cooldownTimer.current = null;
        }
      }
    };

    tick();
    cooldownTimer.current = setInterval(tick, 1000);

    return () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
        cooldownTimer.current = null;
      }
    };
  }, [lockedUntil]);

  // ── Key press handler ──────────────────────────────────────

  const handleKeyPress = useCallback(
    async (value: string) => {
      // Clear error on new input
      if (error) setError(null);

      if (value === '⌫') {
        setPin((prev) => prev.slice(0, -1));
        return;
      }

      // Only accept numeric digits
      if (!/^\d$/.test(value)) return;

      if (pin.length >= PIN_LENGTH) return;
      const newPin = pin + value;
      setPin(newPin);

      // PIN complete → verify
      if (newPin.length === PIN_LENGTH) {
        setVerifying(true);
        try {
          const result = await verifyPin(newPin);
          if (result.success) {
            onAuthenticated?.();
          } else {
            setPin('');
            setRemainingAttempts(result.remainingAttempts);

            if (result.lockedUntil) {
              setLockedUntil(result.lockedUntil);
              setError(t('parent:pin_locked'));
            } else if (result.remainingAttempts > 0) {
              setError(
                t('parent:pin_wrong', {
                  attempts: String(result.remainingAttempts),
                }),
              );
              // Vibrate feedback on wrong PIN
              setPin('');
            } else {
              // Should not happen — locked state handled above
              setPin('');
            }
          }
        } catch {
          setPin('');
          setError(t('parent:pin_wrong', { attempts: String(remainingAttempts) }));
        } finally {
          setVerifying(false);
        }
      }
    },
    [pin, error, remainingAttempts, onAuthenticated, t],
  );

  // ── Render ─────────────────────────────────────────────────

  const isLocked = cooldownSecs > 0;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Dismiss button */}
        <Pressable
          style={styles.dismissButton}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={t('common:back') ?? 'Back'}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </Pressable>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔒</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('parent:pin_title')}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{t('parent:pin_subtitle')}</Text>

        {/* Error message */}
        {error && (
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            {error}
          </Text>
        )}

        {/* PIN digit slots */}
        <View
          style={[
            styles.pinRow,
            error && styles.pinRowError,
          ]}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <DigitSlot
              key={i}
              filled={i < pin.length}
              label={
                i < pin.length
                  ? t('parent:digit_filled', { position: String(i + 1) })
                  : t('parent:digit_empty', { position: String(i + 1) })
              }
            />
          ))}
        </View>

        {/* Attempts remaining indicator */}
        {!isLocked && remainingAttempts < MAX_FAILED_ATTEMPTS && !error && (
          <Text style={styles.attemptsText}>
            {t('parent:attempts_remaining', {
              count: String(remainingAttempts),
            })}
          </Text>
        )}

        {/* Cooldown indicator */}
        {isLocked && (
          <Text style={styles.cooldownText}>
            {t('parent:cooldown_timer', { seconds: String(cooldownSecs) })}
          </Text>
        )}

        {/* Numeric keypad */}
        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <KeypadButton
              key={digit}
              value={digit}
              onPress={handleKeyPress}
              disabled={verifying || isLocked}
              label={t('parent:keypad_digit', { value: digit })}
            />
          ))}
          <View style={styles.keypadSpacer} />
          <KeypadButton
            value="0"
            onPress={handleKeyPress}
            disabled={verifying || isLocked}
            label={t('parent:keypad_digit', { value: '0' })}
          />
          <KeypadButton
            value="⌫"
            onPress={handleKeyPress}
            disabled={verifying || isLocked || pin.length === 0}
            label={t('parent:keypad_backspace')}
          />
        </View>
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
    marginBottom: 8,
  },

  // Subtitle
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },

  // Error
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },

  // PIN row
  pinRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
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

  // Attempts
  attemptsText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center',
  },

  // Cooldown
  cooldownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 24,
    textAlign: 'center',
  },

  // Keypad
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 300,
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
} as TextStyle);
