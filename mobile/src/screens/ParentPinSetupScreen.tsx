import React, { useState, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { savePin, PIN_LENGTH } from '../storage/pin-storage';

type ScreenMode = 'setup' | 'change';
type Phase = 'old' | 'enter' | 'confirm';

interface Props {
  mode: ScreenMode;
  onComplete?: () => void;
  onSkip?: () => void;
  onCancel?: () => void;
  onVerifyOldPin?: (pin: string) => Promise<boolean>;
}

function DigitSlot({ filled, i }: { filled: boolean; i: number }) {
  return (
    <View style={[s.digitSlot, filled && s.digitSlotFilled]} accessibilityLabel={filled ? `Digit ${i + 1} entered` : `Digit ${i + 1}`}>
      <Text style={[s.digitText, filled && s.digitTextFilled]}>{filled ? '\u25CF' : ''}</Text>
    </View>
  );
}

function KeyBtn({ v, onPress, disabled }: { v: string; onPress: (v: string) => void; disabled?: boolean }) {
  return (
    <Pressable style={({ pressed }) => [s.keypadBtn, pressed && s.keypadBtnPressed]} onPress={() => onPress(v)} disabled={disabled} accessibilityRole="button" accessibilityLabel={`Key ${v}`}>
      <Text style={[s.keypadBtnText, v === '\u232B' && s.keypadBackspace]}>{v}</Text>
    </Pressable>
  );
}

export default function ParentPinSetupScreen({ mode, onComplete, onSkip, onCancel, onVerifyOldPin }: Props) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>(mode === 'change' ? 'old' : 'enter');
  const [oldPin, setOldPin] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const [wrongOld, setWrongOld] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const triggerMismatch = useCallback(() => {
    setMismatch(true);
    setTimeout(() => { setMismatch(false); setPhase('enter'); setPin(''); setConfirmPin(''); }, 800);
  }, []);

  const kp = useCallback((value: string) => {
    if (saving || saved) return;
    if (value === '\u232B') {
      if (phase === 'old') { setOldPin(p => p.slice(0, -1)); return; }
      if (phase === 'enter') { setPin(p => p.slice(0, -1)); return; }
      setConfirmPin(p => p.slice(0, -1)); return;
    }
    if (!/^\d$/.test(value)) return;
    setWrongOld(false);

    if (phase === 'old') {
      if (oldPin.length >= PIN_LENGTH) return;
      const np = oldPin + value;
      setOldPin(np);
      if (np.length === PIN_LENGTH) onVerifyOldPin?.(np).then(v => { if (v) { setPhase('enter'); setOldPin(''); } else { setWrongOld(true); setOldPin(''); } });
    } else if (phase === 'enter') {
      if (pin.length >= PIN_LENGTH) return;
      const np = pin + value;
      setPin(np);
      if (np.length === PIN_LENGTH) setPhase('confirm');
    } else {
      if (confirmPin.length >= PIN_LENGTH) return;
      const nc = confirmPin + value;
      setConfirmPin(nc);
      if (nc.length === PIN_LENGTH) {
        if (nc === pin) { setSaving(true); savePin(nc).then(() => { setSaved(true); setTimeout(() => onComplete?.(), 600); }).catch(() => triggerMismatch()).finally(() => setSaving(false)); }
        else triggerMismatch();
      }
    }
  }, [phase, pin, confirmPin, oldPin, onComplete, onVerifyOldPin, triggerMismatch, saving, saved]);

  const goBack = useCallback(() => {
    if (phase === 'confirm') { setPhase('enter'); setConfirmPin(''); setPin(pin.slice(0, -1)); }
    else if (phase === 'enter' && mode === 'change') { setPhase('old'); setPin(''); }
  }, [phase, pin, mode]);

  if (saved) return (
    <View style={s.container}><View style={s.content}>
      <View style={s.iconWrap}><Text style={s.icon}>{'\u2705'}</Text></View>
      <Text style={s.title}>{t('parentAuth.changePin.success')}</Text>
    </View></View>
  );

  const title = mode === 'change' ? t('parentAuth.changePin.title') : t('onboarding.parentPinSetup.title');
  const body = t('onboarding.parentPinSetup.body');
  let stepLabel: string;
  if (phase === 'old') stepLabel = t('parentAuth.changePin.enterOld');
  else if (phase === 'enter') stepLabel = mode === 'change' ? t('parentAuth.changePin.enterNew') : t('onboarding.parentPinSetup.enterPin');
  else stepLabel = t('onboarding.parentPinSetup.confirmPin');

  const cur = phase === 'old' ? oldPin : phase === 'enter' ? pin : confirmPin;

  return (
    <View style={s.container}><View style={s.content}>
      <View style={s.iconWrap}><Text style={s.icon}>{'\uD83D\uDD10'}</Text></View>
      <Text style={s.title}>{title}</Text>
      {mode !== 'change' && <Text style={s.body}>{body}</Text>}
      <Text style={s.stepLabel}>{stepLabel}</Text>
      {(mismatch || wrongOld) && <Text style={s.errorText} accessibilityRole="alert">{mismatch ? t('onboarding.parentPinSetup.mismatch') : t('parentAuth.changePin.wrongOld')}</Text>}
      <View style={[s.pinRow, (mismatch || wrongOld) && s.pinRowError]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => <DigitSlot key={i} filled={i < cur.length} i={i} />)}
      </View>
      <View style={s.keypad}>
        {['1','2','3','4','5','6','7','8','9'].map(d => <KeyBtn key={d} v={d} onPress={kp} disabled={saving} />)}
        <View style={s.keypadSpacer} />
        <KeyBtn v="0" onPress={kp} disabled={saving} />
        <KeyBtn v={'\u232B'} onPress={kp} disabled={saving || cur.length === 0} />
      </View>
      {(phase === 'confirm' || (phase === 'enter' && mode === 'change')) && (
        <Pressable style={s.backLink} onPress={goBack} accessibilityRole="button"><Text style={s.backLinkText}>{'\u2190'} {t('common.back')}</Text></Pressable>
      )}
      {mode === 'setup' && onSkip && (
        <Pressable style={s.skipLink} onPress={onSkip} accessibilityRole="button" accessibilityLabel={t('onboarding.parentPinSetup.accessibility.skipButton')}>
          <Text style={s.skipLinkText}>{t('onboarding.parentPinSetup.skip')}</Text>
        </Pressable>
      )}
      {mode === 'change' && onCancel && (
        <Pressable style={s.skipLink} onPress={onCancel} accessibilityRole="button"><Text style={s.skipLinkText}>{t('parentAuth.cancel')}</Text></Pressable>
      )}
    </View></View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  icon: { fontSize: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 24, color: '#6B7280', textAlign: 'center', marginBottom: 32, paddingHorizontal: 8 },
  stepLabel: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  errorText: { fontSize: 16, fontWeight: '500', color: '#DC2626', marginBottom: 12, textAlign: 'center' },
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
  backLinkText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  skipLink: { paddingVertical: 10, paddingHorizontal: 20 },
  skipLinkText: { fontSize: 16, color: '#9CA3AF', fontWeight: '500', textDecorationLine: 'underline' },
});
