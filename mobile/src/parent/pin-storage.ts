/**
 * PIN storage — secures the parent 4-digit PIN using the OS keychain.
 *
 * iOS: Keychain Services (via expo-secure-store)
 * Android: EncryptedSharedPreferences (via expo-secure-store)
 *
 * Never store PIN in MMKV, SQLite, or AsyncStorage.
 * Follows the same pattern as the aaas-252 branch but adapted for this project.
 */

import * as SecureStore from 'expo-secure-store';

// ── Constants ──────────────────────────────────────────────────────

const KEY_PIN = 'parent.pin';
const KEY_PIN_SET = 'parent.pin_set';
const KEY_FAILED_ATTEMPTS = 'parent.pin_failed_attempts';
const KEY_LOCKED_UNTIL = 'parent.pin_locked_until';

export const MAX_FAILED_ATTEMPTS = 5;
export const COOLDOWN_SECONDS = 60;

// ── Public API ─────────────────────────────────────────────────────

/**
 * Save a 4-digit PIN to the OS secure store.
 * Validates that pin is exactly 4 numeric digits.
 */
export async function savePin(pin: string): Promise<void> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 numeric digits');
  }
  await SecureStore.setItemAsync(KEY_PIN, pin);
  await SecureStore.setItemAsync(KEY_PIN_SET, 'true');
  // Reset failed attempts on new PIN
  await SecureStore.setItemAsync(KEY_FAILED_ATTEMPTS, '0');
  await SecureStore.deleteItemAsync(KEY_LOCKED_UNTIL);
}

/**
 * Check whether a PIN has been set.
 */
export async function isPinSet(): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(KEY_PIN_SET);
  return raw === 'true';
}

/**
 * Verify a 4-digit PIN against the stored PIN.
 * Returns an object with { success, remainingAttempts, lockedUntil }.
 * Implements cooldown: MAX_FAILED_ATTEMPTS wrong → COOLDOWN_SECONDS lockout.
 */
export async function verifyPin(input: string): Promise<{
  success: boolean;
  remainingAttempts: number;
  lockedUntil: number | null;
}> {
  // Check lockout
  const lockedUntil = await getLockedUntil();
  const now = Date.now();
  if (lockedUntil !== null && now < lockedUntil) {
    return {
      success: false,
      remainingAttempts: 0,
      lockedUntil,
    };
  }

  // Clear expired lockout
  if (lockedUntil !== null && now >= lockedUntil) {
    await clearLockout();
  }

  // Invalid format
  if (!/^\d{4}$/.test(input)) {
    await incrementFailedAttempts();
    const remaining = await getRemainingAttempts();
    return {
      success: false,
      remainingAttempts: remaining,
      lockedUntil: null,
    };
  }

  const stored = await SecureStore.getItemAsync(KEY_PIN);
  if (!stored) {
    return {
      success: false,
      remainingAttempts: 0,
      lockedUntil: null,
    };
  }

  // Constant-time-ish comparison
  const match = constantTimeCompare(input, stored);

  if (match) {
    // Reset failed attempts on success
    await SecureStore.setItemAsync(KEY_FAILED_ATTEMPTS, '0');
    await SecureStore.deleteItemAsync(KEY_LOCKED_UNTIL);
    return {
      success: true,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
      lockedUntil: null,
    };
  }

  // Wrong PIN — increment counter
  const attempts = await incrementFailedAttempts();
  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - attempts);

  if (remaining <= 0) {
    // Lock out
    const lockUntil = now + COOLDOWN_SECONDS * 1000;
    await SecureStore.setItemAsync(KEY_LOCKED_UNTIL, String(lockUntil));
    return { success: false, remainingAttempts: 0, lockedUntil: lockUntil };
  }

  return { success: false, remainingAttempts: remaining, lockedUntil: null };
}

/**
 * Get remaining attempts before lockout.
 */
export async function getRemainingAttempts(): Promise<number> {
  const raw = await SecureStore.getItemAsync(KEY_FAILED_ATTEMPTS);
  const attempts = raw ? Number(raw) : 0;
  return Math.max(0, MAX_FAILED_ATTEMPTS - attempts);
}

/**
 * Get lockout expiry timestamp (ms since epoch), or null if not locked.
 */
export async function getLockedUntil(): Promise<number | null> {
  const raw = await SecureStore.getItemAsync(KEY_LOCKED_UNTIL);
  if (!raw) return null;
  const ts = Number(raw);
  return Number.isFinite(ts) ? ts : null;
}

/**
 * Remove the stored PIN (e.g. if parent wants to reset).
 */
export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_PIN);
  await SecureStore.deleteItemAsync(KEY_PIN_SET);
  await SecureStore.deleteItemAsync(KEY_FAILED_ATTEMPTS);
  await SecureStore.deleteItemAsync(KEY_LOCKED_UNTIL);
}

// ── Internal helpers ───────────────────────────────────────────────

async function incrementFailedAttempts(): Promise<number> {
  const raw = await SecureStore.getItemAsync(KEY_FAILED_ATTEMPTS);
  const current = raw ? Number(raw) : 0;
  const next = current + 1;
  await SecureStore.setItemAsync(KEY_FAILED_ATTEMPTS, String(next));
  return next;
}

async function clearLockout(): Promise<void> {
  await SecureStore.setItemAsync(KEY_FAILED_ATTEMPTS, '0');
  await SecureStore.deleteItemAsync(KEY_LOCKED_UNTIL);
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
