/**
 * usePinGate — PIN gate hook with expo-secure-store persistence.
 *
 * Per ADD §5.2: 4-digit PIN, stored locally (hashed, never leaves device),
 * 5 failed attempts → 60-second cooldown.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';

const PIN_STORAGE_KEY = 'tutor-sg:parent-pin';
const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 60;

export interface PinGateState {
  /** Whether a PIN has been set up. */
  hasPin: boolean | null; // null = still loading
  /** Is the PIN setup flow active (first-time)? */
  needsSetup: boolean;
  /** Is the PIN entry overlay visible? */
  isPinEntryVisible: boolean;
  /** Number of failed attempts in this session. */
  failedAttempts: number;
  /** Cooldount timestamp (ms) until next attempt allowed, or 0. */
  cooldownUntil: number;
  /** Error message for the current attempt. */
  error: string | null;
}

export interface PinGateActions {
  /** Check whether PIN exists in secure store. */
  checkPin: () => Promise<void>;
  /** Show the PIN entry overlay. */
  showPinEntry: () => void;
  /** Hide the PIN entry overlay. */
  hidePinEntry: () => void;
  /** Verify entered PIN against stored hash. */
  verifyPin: (pin: string) => Promise<boolean>;
  /** Set up a new PIN (first time). */
  setPin: (pin: string) => Promise<boolean>;
  /** Reset stored PIN (parent action in settings). */
  resetPin: () => Promise<void>;
  /** Dismiss setup flow. */
  skipSetup: () => void;
}

const INITIAL_STATE: PinGateState = {
  hasPin: null,
  needsSetup: false,
  isPinEntryVisible: false,
  failedAttempts: 0,
  cooldownUntil: 0,
  error: null,
};

/**
 * Simple hash for PIN (not crypto-secure — PINs are low-entropy already.
 * For v1, this provides obfuscation. Future: use expo-crypto on a salted hash.)
 */
function simpleHash(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit int
  }
  return `v1:${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

export function usePinGate(): PinGateState & PinGateActions {
  const [state, setState] = useState<PinGateState>(INITIAL_STATE);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  const checkPin = useCallback(async () => {
    try {
      const stored = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
      setState((prev) => ({
        ...prev,
        hasPin: stored !== null,
        needsSetup: stored === null,
        error: null,
      }));
    } catch {
      setState((prev) => ({ ...prev, hasPin: false, needsSetup: true }));
    }
  }, []);

  const showPinEntry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPinEntryVisible: true,
      error: null,
      // Reset cooldown if expired
      cooldownUntil: prev.cooldownUntil < Date.now() ? 0 : prev.cooldownUntil,
    }));
  }, []);

  const hidePinEntry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPinEntryVisible: false,
      error: null,
    }));
  }, []);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const storedHash = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
      if (!storedHash) {
        setState((prev) => ({ ...prev, error: 'No PIN set up' }));
        return false;
      }

      const enteredHash = simpleHash(pin);
      if (enteredHash === storedHash) {
        setState((prev) => ({
          ...prev,
          isPinEntryVisible: false,
          failedAttempts: 0,
          cooldownUntil: 0,
          error: null,
        }));
        return true;
      }

      // Wrong PIN
      const newAttempts = state.failedAttempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const cooldownEnd = Date.now() + COOLDOWN_SECONDS * 1000;
        setState((prev) => ({
          ...prev,
          failedAttempts: newAttempts,
          cooldownUntil: cooldownEnd,
          error: 'cooldown',
        }));

        // Start cooldown countdown
        if (cooldownTimer.current) clearInterval(cooldownTimer.current);
        cooldownTimer.current = setInterval(() => {
          setState((prev) => {
            if (Date.now() >= prev.cooldownUntil) {
              if (cooldownTimer.current) clearInterval(cooldownTimer.current);
              return { ...prev, cooldownUntil: 0, failedAttempts: 0, error: null };
            }
            return prev;
          });
        }, 1000);
      } else {
        setState((prev) => ({
          ...prev,
          failedAttempts: newAttempts,
          error: 'wrong',
        }));
      }
      return false;
    } catch {
      setState((prev) => ({ ...prev, error: 'Something went wrong' }));
      return false;
    }
  }, [state.failedAttempts]);

  const setPin = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const hash = simpleHash(pin);
      await SecureStore.setItemAsync(PIN_STORAGE_KEY, hash);
      setState((prev) => ({
        ...prev,
        hasPin: true,
        needsSetup: false,
        isPinEntryVisible: false,
        error: null,
      }));
      return true;
    } catch {
      setState((prev) => ({ ...prev, error: 'Failed to save PIN' }));
      return false;
    }
  }, []);

  const resetPin = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(PIN_STORAGE_KEY);
      setState(INITIAL_STATE);
    } catch {
      // Silently fail — nothing to delete
    }
  }, []);

  const skipSetup = useCallback(() => {
    setState((prev) => ({ ...prev, needsSetup: false, isPinEntryVisible: false }));
  }, []);

  return {
    ...state,
    checkPin,
    showPinEntry,
    hidePinEntry,
    verifyPin,
    setPin,
    resetPin,
    skipSetup,
  };
}

export { simpleHash };
