/**
 * PIN storage — secures the parent 4-digit PIN using the OS keychain.
 *
 * iOS: Keychain Services (via expo-secure-store)
 * Android: EncryptedSharedPreferences (via expo-secure-store)
 *
 * Following the pattern of onboarding-state.ts but for sensitive data.
 * Never store PIN in MMKV, SQLite, or AsyncStorage.
 */

import * as SecureStore from 'expo-secure-store';

// ── Constants ──────────────────────────────────────────────────────

const KEY_PIN = 'parent.pin';
const KEY_PIN_SET = 'parent.pin_set';

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
 * Returns true if the pin matches, false otherwise.
 * No timing side-channel — comparison is constant-time-ish.
 */
export async function verifyPin(input: string): Promise<boolean> {
  if (!/^\d{4}$/.test(input)) return false;
  const stored = await SecureStore.getItemAsync(KEY_PIN);
  if (!stored) return false;
  // Constant-time-ish comparison to avoid timing side-channel
  if (stored.length !== input.length) return false;
  let result = 0;
  for (let i = 0; i < stored.length; i++) {
    result |= stored.charCodeAt(i) ^ input.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Remove the stored PIN (e.g. if parent wants to reset).
 */
export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_PIN);
  await SecureStore.deleteItemAsync(KEY_PIN_SET);
}
