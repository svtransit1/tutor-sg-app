import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { verifyPin, MAX_FAILED_ATTEMPTS } from '../storage/pin-storage';

const PIN_LENGTH = 4;

interface PinGateScreenProps { onAuthenticated?: () => void; onDismiss?: () => void; }

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

export default function PinGateScreen({ onAuthenticated, onDismiss }: PinGateScreenProps) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState(MAX_FAILED_ATTEMPTS);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (lockedUntil === null) { if (timer.current) { clearInterval(timer.current); timer.current = null; } return; }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setCooldownSecs(remaining);
      if (remaining <= 0) { setLockedUntil(null); setCooldownSecs(0); setError(null); setRemainingAttempts(MAX_FAILED_ATTEMPTS); if (timer.current) { clearInterval(timer.current); timer.current = null; } }
    };
    tick(); timer.current = setInterval(tick, 1000);
    return () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } };
  }, [lockedUntil]);

  const handleKeyPress = useCallback(async (value: string) => {
    if (error) setError(null);
    if (value === '⌫') { setPin(p => p.slice(0, -1)); return; }
    if (!/^\d$/.test(value) || pin.length >= PIN_LENGTH) return;
    const newPin = pin + value; setPin(newPin);
    if (newPin.length === PIN_LENGTH) {
      setVerifying(true);
      try {
        const result = await verifyPin(newPin);
        if (result.success) onAuthenticated?.();
        else { setPin(''); setRemainingAttempts(result.remainingAttempts); setError(result.lockedUntil ? t('parentAuth.cooldown') : t('parentAuth.wrongPin')); if (result.lockedUntil) setLockedUntil(result.lockedUntil); }
      } catch { setPin(''); setError(t('parentAuth.wrongPin')); } finally { setVerifying(false); }
    }
  }, [pin, error, onAuthenticated, t]);
  const isLocked = cooldownSecs > 0;

  return (
    <View style={s.container}>
      <View style={s.content}>
        {onDismiss && <Pressable style={s.dismissButton} onPress={onDismiss} accessibilityRole="button" accessibilityLabel={t('common.back')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}><Text style={s.dismissText}>✕</Text></Pressable>}
        <View style={s.iconWrap}><Text style={s.icon}>🔒</Text></View>
        <Text style={s.title}>{t('parentAuth.title')}</Text>
        <Text style={s.subtitle}>{t('parentAuth.enterPin')}</Text>
        {error && <Text style={s.errorText} accessibilityRole="alert" accessibilityLiveRegion="assertive">{error}</Text>}
        <View style={[s.pinRow, !!error && s.pinRowError]}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => <DigitSlot key={i} filled={i < pin.length} label={`${t('parentAuth.title')} digit ${i + 1}`} />)}
        </View>
        {!isLocked && remainingAttempts < MAX_FAILED_ATTEMPTS && !error && <Text style={s.attemptsText}>{t('parentAuth.attemptsRemaining', { count: remainingAttempts })}</Text>}
        {isLocked && <Text style={s.cooldownText}>{t('parentAuth.cooldownTimer', { seconds: cooldownSecs })}</Text>}
        <View style={s.keypad}>
          {['1','2','3','4','5','6','7','8','9'].map(d => <KeypadButton key={d} value={d} onPress={handleKeyPress} disabled={verifying || isLocked} label={d} />)}
          <View style={s.keypadSpacer} />
          <KeypadButton value="0" onPress={handleKeyPress} disabled={verifying || isLocked} label="0" />
          <KeypadButton value="⌫" onPress={handleKeyPress} disabled={verifying || isLocked || pin.length === 0} label={t('common.back')} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'center', justifyContent: 'center' },
  dismissButton: { position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  dismissText: { fontSize: 18, color: '#6B7280', fontWeight: '600' },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  icon: { fontSize: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, color: '#6B7280', textAlign: 'center', marginBottom: 32, paddingHorizontal: 16 },
  errorText: { fontSize: 14, fontWeight: '500', color: '#DC2626', marginBottom: 16, textAlign: 'center' },
  pinRow: { flexDirection: 'row', gap: 16, marginBottom: 12, justifyContent: 'center' }, pinRowError: { opacity: 0.7 },
  digitSlot: { width: 56, height: 64, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  digitSlotFilled: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  digitText: { fontSize: 28, color: '#D1D5DB' }, digitTextFilled: { color: '#2563EB' },
  attemptsText: { fontSize: 13, color: '#9CA3AF', marginBottom: 24, textAlign: 'center' },
  cooldownText: { fontSize: 14, fontWeight: '600', color: '#DC2626', marginBottom: 24, textAlign: 'center' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 300 },
  keypadBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  keypadBtnPressed: { backgroundColor: '#E5E7EB' },
  keypadBtnText: { fontSize: 28, fontWeight: '500', color: '#1A1A1A' }, keypadBackspace: { fontSize: 22, color: '#6B7280' },
  keypadSpacer: { width: 72, height: 72 },
});
