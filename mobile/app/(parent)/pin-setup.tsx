import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, type TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePinGate } from '../../src/parent-auth/pin-context';

const PIN_LENGTH = 4;

function DigitSlot({ filled, index }: { filled: boolean; index: number }) {
  return (
    <View
      style={[styles.digitSlot, filled && styles.digitSlotFilled]}
      accessibilityLabel={filled ? `Digit ${index + 1} entered` : `Digit ${index + 1}`}
    >
      <Text style={[styles.digitText, filled && styles.digitTextFilled]}>{filled ? '●' : ''}</Text>
    </View>
  );
}

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
      style={({ pressed }) => [styles.keypadBtn, pressed && styles.keypadBtnPressed]}
      onPress={() => onPress(value)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Key ${value}`}
    >
      <Text style={[styles.keypadBtnText, value === '⌫' && styles.keypadBackspace]}>{value}</Text>
    </Pressable>
  );
}

export default function PinSetupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { handleSetupPin } = usePinGate();

  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const [saving, setSaving] = useState(false);

  function triggerMismatch() {
    setMismatch(true);
    setTimeout(() => {
      setMismatch(false);
      setStep('enter');
      setPin('');
      setConfirmPin('');
    }, 800);
  }

  function handleKeyPress(value: string) {
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
          handleSetupPin(newConfirm, newConfirm)
            .catch(() => triggerMismatch())
            .finally(() => setSaving(false));
        } else {
          triggerMismatch();
        }
      }
    }
  }

  const currentDigits = step === 'enter' ? pin : confirmPin;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔐</Text>
        </View>
        <Text style={styles.title}>{t('parentAuth.setup.title')}</Text>
        <Text style={styles.body}>
          {t('parentAuth.setup.enterPin')}
        </Text>
        <Text style={styles.stepLabel}>
          {step === 'enter' ? t('parentAuth.setup.enterPin') : t('parentAuth.setup.confirmPin')}
        </Text>

        {mismatch && (
          <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="assertive">
            {t('parentAuth.pinsDontMatch')}
          </Text>
        )}

        <View style={[styles.pinRow, mismatch && styles.pinRowError]}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <DigitSlot key={i} filled={i < currentDigits.length} index={i} />
          ))}
        </View>

        <View style={styles.keypad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <KeypadButton key={digit} value={digit} onPress={handleKeyPress} disabled={saving} />
          ))}
          <View style={styles.keypadSpacer} />
          <KeypadButton value="0" onPress={handleKeyPress} disabled={saving} />
          <KeypadButton value="⌫" onPress={handleKeyPress} disabled={saving || currentDigits.length === 0} />
        </View>

        {step === 'confirm' && (
          <Pressable
            style={styles.backLink}
            onPress={() => { setStep('enter'); setConfirmPin(''); setPin(pin.slice(0, -1)); }}
            accessibilityRole="button"
            accessibilityLabel="Go back to enter PIN"
          >
            <Text style={styles.backLinkText}>← {t('parentAuth.setup.enterPin')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 28,
  },
  icon: { fontSize: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 24, color: '#6B7280', textAlign: 'center', marginBottom: 32, paddingHorizontal: 8 },
  stepLabel: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 12 },
  errorText: { fontSize: 14, fontWeight: '500', color: '#DC2626', marginBottom: 12, textAlign: 'center' },
  pinRow: { flexDirection: 'row', gap: 16, marginBottom: 32, justifyContent: 'center' },
  pinRowError: { opacity: 0.7 },
  digitSlot: {
    width: 56, height: 64, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB',
  },
  digitSlotFilled: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  digitText: { fontSize: 28, color: '#D1D5DB' },
  digitTextFilled: { color: '#2563EB' },
  keypad: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 12, maxWidth: 300, marginBottom: 24,
  },
  keypadBtn: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
  },
  keypadBtnPressed: { backgroundColor: '#E5E7EB' },
  keypadBtnText: { fontSize: 28, fontWeight: '500', color: '#1A1A1A' },
  keypadBackspace: { fontSize: 22, color: '#6B7280' },
  keypadSpacer: { width: 72, height: 72 },
  backLink: { paddingVertical: 8, paddingHorizontal: 16, marginBottom: 8 },
  backLinkText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
} as TextStyle);
