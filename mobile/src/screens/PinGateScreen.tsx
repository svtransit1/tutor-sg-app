import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  verifyPin, recordFailedAttempt, getRemainingAttempts,
  getCooldownRemaining, resetAttemptCount, PIN_LENGTH,
} from '../storage/pin-storage';

interface Props { onSuccess: () => void; onDismiss: () => void; }

function Slot({ filled, i }: { filled: boolean; i: number }) {
  return (
    <View style={[s.digitSlot, filled && s.digitSlotFilled]} accessibilityLabel={filled ? `Digit ${i + 1} entered` : `Digit ${i + 1}`}>
      <Text style={[s.digitText, filled && s.digitTextFilled]}>{filled ? '\u25CF' : ''}</Text>
    </View>
  );
}

function KBtn({ v, onPress, disabled }: { v: string; onPress: (v: string) => void; disabled?: boolean }) {
  return (
    <Pressable style={({ pressed }) => [s.keypadBtn, pressed && s.keypadBtnPressed, disabled && s.keypadBtnDisabled]} onPress={() => onPress(v)} disabled={disabled} accessibilityRole="button" accessibilityLabel={`Key ${v}`}>
      <Text style={[s.keypadBtnText, v === '\u232B' && s.keypadBackspace, disabled && s.keypadBtnTextDisabled]}>{v}</Text>
    </Pressable>
  );
}

export default function PinGateScreen({ onSuccess, onDismiss }: Props) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const tm = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { init(); return () => { if (tm.current) clearInterval(tm.current); }; }, []);

  const init = useCallback(async () => {
    const cd = await getCooldownRemaining();
    if (cd > 0) startCD(cd);
    else setAttemptsLeft(await getRemainingAttempts());
  }, []);

  const startCD = useCallback((sec: number) => {
    let r = sec;
    setCooldown(r);
    tm.current = setInterval(() => { r--; if (r <= 0) { if (tm.current) clearInterval(tm.current); setCooldown(0); resetAttemptCount().then(() => { setAttemptsLeft(5); setError(''); }); } else setCooldown(r); }, 1000);
  }, []);

  const kp = useCallback(async (value: string) => {
    if (cooldown > 0) return;
    if (value === '\u232B') { setPin(p => p.slice(0, -1)); setError(''); return; }
    if (!/^\d$/.test(value)) return;
    const np = pin + value;
    setPin(np);
    if (np.length === PIN_LENGTH) {
      if (await verifyPin(np)) { await resetAttemptCount(); onSuccess(); }
      else {
        await recordFailedAttempt();
        const r = await getRemainingAttempts();
        if (r <= 0) { const cd = await getCooldownRemaining(); if (cd > 0) startCD(cd); }
        else { setAttemptsLeft(r); setError(t('parentAuth.wrongPin', { attempts: r })); }
        setPin('');
      }
    }
  }, [pin, cooldown, onSuccess, startCD, t]);

  const dismiss = useCallback(() => { if (tm.current) clearInterval(tm.current); onDismiss(); }, [onDismiss]);

  return (
    <View style={s.overlay}><View style={s.container}>
      <Pressable style={s.dismissArea} onPress={dismiss} accessibilityRole="button" accessibilityLabel={t('parentAuth.accessibility.dismissOverlay')} />
      <View style={s.content}>
        <View style={s.iconWrap}><Text style={s.icon}>{'\uD83D\uDD12'}</Text></View>
        <Text style={s.title}>{t('parentAuth.title')}</Text>
        <Text style={s.body}>{t('parentAuth.enterPin')}</Text>
        <Text style={s.attemptsLabel}>{attemptsLeft > 0 && attemptsLeft <= 3 ? t('parentAuth.attemptsRemaining', { count: attemptsLeft }) : ''}</Text>
        {cooldown > 0 ? (
          <View style={s.cooldownContainer}><Text style={s.cooldownText} accessibilityRole="alert">{t('parentAuth.cooldown', { seconds: cooldown })}</Text></View>
        ) : (
          <>
            {error ? <Text style={s.errorText} accessibilityRole="alert">{error}</Text> : null}
            <View style={s.pinRow}>{Array.from({ length: PIN_LENGTH }).map((_, i) => <Slot key={i} filled={i < pin.length} i={i} />)}</View>
            <View style={s.keypad}>
              {['1','2','3','4','5','6','7','8','9'].map(d => <KBtn key={d} v={d} onPress={kp} />)}
              <View style={s.keypadSpacer} />
              <KBtn v="0" onPress={kp} />
              <KBtn v={'\u232B'} onPress={kp} disabled={pin.length === 0} />
            </View>
          </>
        )}
        <Pressable style={s.cancelBtn} onPress={dismiss} accessibilityRole="button" accessibilityLabel={t('parentAuth.accessibility.cancelButton')}><Text style={s.cancelBtnText}>{t('parentAuth.cancel')}</Text></Pressable>
      </View>
    </View></View>
  );
}

const s = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 },
  container: { flex: 1, justifyContent: 'flex-end' },
  dismissArea: { flex: 1 },
  content: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, alignItems: 'center' },
  iconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  icon: { fontSize: 32 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22, color: '#6B7280', textAlign: 'center', marginBottom: 8 },
  attemptsLabel: { fontSize: 13, color: '#9CA3AF', marginBottom: 8, minHeight: 20 },
  errorText: { fontSize: 14, fontWeight: '500', color: '#DC2626', marginBottom: 12, textAlign: 'center' },
  cooldownContainer: { paddingVertical: 40, alignItems: 'center' },
  cooldownText: { fontSize: 18, fontWeight: '600', color: '#DC2626', textAlign: 'center' },
  pinRow: { flexDirection: 'row', gap: 14, marginBottom: 28, justifyContent: 'center' },
  digitSlot: { width: 50, height: 58, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' },
  digitSlotFilled: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  digitText: { fontSize: 24, color: '#D1D5DB' },
  digitTextFilled: { color: '#2563EB' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 280 },
  keypadBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  keypadBtnPressed: { backgroundColor: '#E5E7EB' },
  keypadBtnDisabled: { backgroundColor: '#F9FAFB', opacity: 0.5 },
  keypadBtnText: { fontSize: 26, fontWeight: '500', color: '#1A1A1A' },
  keypadBtnTextDisabled: { color: '#D1D5DB' },
  keypadBackspace: { fontSize: 20, color: '#6B7280' },
  keypadSpacer: { width: 64, height: 64 },
  cancelBtn: { marginTop: 24, paddingVertical: 10, paddingHorizontal: 20 },
  cancelBtnText: { fontSize: 15, color: '#9CA3AF', fontWeight: '500' },
});
