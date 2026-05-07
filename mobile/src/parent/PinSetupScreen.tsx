import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { savePin } from '../storage/pin-storage';

const PIN_LENGTH = 4;
type PinStep = 'enter' | 'confirm';

interface PinSetupScreenProps { onComplete?: () => void; onSkip?: () => void; onDismiss?: () => void; skippable?: boolean; }

function DigitSlot({ filled, label }: { filled: boolean; label: string }) {
  return (
    <View style={[s.digitSlot, filled && s.digitSlotFilled]} accessibilityLabel={label}>
      <Text style={[s.digitText, filled && s.digitTextFilled]}>{filled ? '●' : ''}</Text>
    </View>
  );
}

function KeypadButton({ value, onPress, disabled, label }: { value: string; onPress: (v: string) => void; disabled?: boolean; label: string }) {
  return (
    <Pressable style={({ pressed }) => [s.keypadBtn, pressed && s.keypadBtnPressed]} onPress={() => onPress(value)} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={[s.keypadBtnText, value === '⌫' && s.keypadBackspace]}>{value}</Text>
    </Pressable>
  );
}

export default function PinSetupScreen({ onComplete, onSkip, onDismiss, skippable = true }: PinSetupScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<PinStep>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const [saving, setSaving] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = useCallback(() => {
    setMismatch(true);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
    setTimeout(() => { setMismatch(false); setStep('enter'); setPin(''); setConfirmPin(''); }, 1000);
  }, [shakeAnim]);

  const handleKeyPress = useCallback((value: string) => {
    if (value === '⌫') { if (step === 'enter') setPin(p => p.slice(0, -1)); else setConfirmPin(p => p.slice(0, -1)); return; }
    if (!/^\d$/.test(value)) return;
    if (step === 'enter') {
      if (pin.length >= PIN_LENGTH) return;
      const newPin = pin + value; setPin(newPin);
      if (newPin.length === PIN_LENGTH) setStep('confirm');
    } else {
      if (confirmPin.length >= PIN_LENGTH) return;
      const newConfirm = confirmPin + value; setConfirmPin(newConfirm);
      if (newConfirm.length === PIN_LENGTH) {
        if (newConfirm === pin) { setSaving(true); savePin(newConfirm).then(() => onComplete?.()).catch(() => triggerShake()).finally(() => setSaving(false)); }
        else { triggerShake(); }
      }
    }
  }, [step, pin, confirmPin, onComplete, triggerShake]);

  const handleGoBackToEnter = useCallback(() => { setStep('enter'); setConfirmPin(''); setPin(pin.slice(0, -1)); }, [pin]);
  const currentDigits = step === 'enter' ? pin : confirmPin;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.content}>
        {onDismiss && <Pressable style={s.dismissButton} onPress={onDismiss} accessibilityRole="button" accessibilityLabel={t('common.back')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}><Text style={s.dismissText}>✕</Text></Pressable>}
        <View style={s.iconWrap}><Text style={s.icon}>🔐</Text></View>
        <Text style={s.title}>{t('onboarding.parentPinSetup.title')}</Text>
        <Text style={s.body}>{t('onboarding.parentPinSetup.body')}</Text>
        <Text style={s.stepLabel}>{step === 'enter' ? t('onboarding.parentPinSetup.enterPin') : t('onboarding.parentPinSetup.confirmPin')}</Text>
        {mismatch && <Text style={s.errorText} accessibilityRole="alert" accessibilityLiveRegion="assertive">{t('onboarding.parentPinSetup.mismatch')}</Text>}
        <Animated.View style={[s.pinRow, mismatch && s.pinRowError, { transform: [{ translateX: shakeAnim }] }]}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <DigitSlot key={i} filled={i < currentDigits.length} label={step === 'confirm' ? t('onboarding.parentPinSetup.accessibility.confirmDigitInput', { position: String(i + 1) }) : t('onboarding.parentPinSetup.accessibility.digitInput', { position: String(i + 1) })} />
          ))}
        </Animated.View>
        <View style={s.keypad}>
          {['1','2','3','4','5','6','7','8','9'].map(d => <KeypadButton key={d} value={d} onPress={handleKeyPress} disabled={saving} label={d} />)}
          <View style={s.keypadSpacer} />
          <KeypadButton value="0" onPress={handleKeyPress} disabled={saving} label="0" />
          <KeypadButton value="⌫" onPress={handleKeyPress} disabled={saving || currentDigits.length === 0} label={t('common.back')} />
        </View>
        {step === 'confirm' && <Pressable style={s.backLink} onPress={handleGoBackToEnter} accessibilityRole="button" hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}><Text style={s.backLinkText}>← {t('onboarding.parentPinSetup.enterPin')}</Text></Pressable>}
        {skippable && <Pressable style={s.skipLink} onPress={onSkip} accessibilityRole="button" accessibilityLabel={t('onboarding.parentPinSetup.accessibility.skipButton')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}><Text style={s.skipLinkText}>{t('onboarding.parentPinSetup.skip')}</Text></Pressable>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, alignItems: 'center', justifyContent: 'center' },
  dismissButton: { position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  dismissText: { fontSize: 18, color: '#6B7280', fontWeight: '600' },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  icon: { fontSize: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 15, lineHeight: 22, color: '#6B7280', textAlign: 'center', marginBottom: 32, paddingHorizontal: 16 },
  stepLabel: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 12 },
  errorText: { fontSize: 14, fontWeight: '500', color: '#DC2626', marginBottom: 12, textAlign: 'center' },
  pinRow: { flexDirection: 'row', gap: 16, marginBottom: 32, justifyContent: 'center' },
  pinRowError: { opacity: 0.7 },
  digitSlot: { width: 56, height: 64, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  digitSlotFilled: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  digitText: { fontSize: 28, color: '#D1D5DB' },
  digitTextFilled: { color: '#2563EB' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 300, marginBottom: 24 },
  keypadBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  keypadBtnPressed: { backgroundColor: '#E5E7EB' },
  keypadBtnText: { fontSize: 28, fontWeight: '500', color: '#1A1A1A' },
  keypadBackspace: { fontSize: 22, color: '#6B7280' },
  keypadSpacer: { width: 72, height: 72 },
  backLink: { paddingVertical: 8, paddingHorizontal: 16, marginBottom: 8 },
  backLinkText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  skipLink: { paddingVertical: 10, paddingHorizontal: 20 },
  skipLinkText: { fontSize: 14, color: '#9CA3AF', fontWeight: '500', textDecorationLine: 'underline' },
});
