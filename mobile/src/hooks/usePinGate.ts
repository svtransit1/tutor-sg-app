import { useState, useEffect, useRef } from 'react';
import {
  verifyPin, recordFailedAttempt, getRemainingAttempts,
  getCooldownRemaining, resetAttemptCount, isPinSet, PIN_LENGTH,
} from '../storage/pin-storage';

export function usePinGate(onSuccess: () => void, onDismiss: () => void) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [pinExists, setPinExists] = useState(false);
  const tm = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      setPinExists(await isPinSet());
      const cd = await getCooldownRemaining();
      if (cd > 0) startCD(cd);
      else setAttemptsLeft(await getRemainingAttempts());
    })();
    return () => { if (tm.current) clearInterval(tm.current); };
  }, []);

  const startCD = (sec: number) => {
    let r = sec;
    setCooldown(r);
    tm.current = setInterval(() => { r--; if (r <= 0) { if (tm.current) clearInterval(tm.current); setCooldown(0); resetAttemptCount().then(() => { setAttemptsLeft(5); setError(''); }); } else setCooldown(r); }, 1000);
  };

  const kp = async (value: string) => {
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
        else setError(`Wrong PIN. ${r} attempt(s) remaining.`);
        setPin('');
      }
    }
  };

  const dismiss = () => { if (tm.current) clearInterval(tm.current); onDismiss(); };

  return { pin, error, cooldown, attemptsLeft, pinExists, handleKeyPress: kp, handleDismiss: dismiss, checkPinExists: async () => { const e = await isPinSet(); setPinExists(e); return e; } };
}
