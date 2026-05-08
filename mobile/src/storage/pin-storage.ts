/**
 * PIN storage — secures the parent 4-digit PIN using the OS keychain.
 *
 * iOS: Keychain Services (via expo-secure-store)
 * Android: EncryptedSharedPreferences (via expo-secure-store)
 *
 * Following the pattern of onboarding-state.ts but for sensitive data.
 * Never store PIN in MMKV, SQLite, or AsyncStorage.
 */

import * as SecureStore from 'expo-secure-store'

const KEY_PIN = 'parent.pin'
const KEY_PIN_SET = 'parent.pin_set'

export async function savePin(pin: string): Promise<void> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 numeric digits')
  }
  await SecureStore.setItemAsync(KEY_PIN, pin)
  await SecureStore.setItemAsync(KEY_PIN_SET, 'true')
}

export async function isPinSet(): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(KEY_PIN_SET)
  return raw === 'true'
}

export async function verifyPin(input: string): Promise<boolean> {
  if (!/^\d{4}$/.test(input)) return false
  const stored = await SecureStore.getItemAsync(KEY_PIN)
  if (!stored) return false
  if (stored.length !== input.length) return false
  let result = 0
  for (let i = 0; i < stored.length; i++) {
    result |= stored.charCodeAt(i) ^ input.charCodeAt(i)
  }
  return result === 0
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_PIN)
  await SecureStore.deleteItemAsync(KEY_PIN_SET)
  await clearFailedAttempts()
}

const KEY_FAILED_ATTEMPTS = 'parent.pin_failed_attempts'
const KEY_COOLDOWN_UNTIL = 'parent.pin_cooldown_until'

export const MAX_ATTEMPTS = 5
export const COOLDOWN_SECONDS = 60

export async function getFailedAttempts(): Promise<number> {
  try {
    const raw = await SecureStore.getItemAsync(KEY_FAILED_ATTEMPTS)
    return raw ? parseInt(raw, 10) : 0
  } catch {
    return 0
  }
}

export async function incrementFailedAttempts(): Promise<number> {
  const current = await getFailedAttempts()
  const next = current + 1
  await SecureStore.setItemAsync(KEY_FAILED_ATTEMPTS, String(next))

  if (next >= MAX_ATTEMPTS) {
    const until = String(Date.now() + COOLDOWN_SECONDS * 1000)
    await SecureStore.setItemAsync(KEY_COOLDOWN_UNTIL, until)
  }

  return next
}

export async function clearFailedAttempts(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_FAILED_ATTEMPTS)
  await SecureStore.deleteItemAsync(KEY_COOLDOWN_UNTIL)
}

export async function getCooldownRemaining(): Promise<number> {
  try {
    const raw = await SecureStore.getItemAsync(KEY_COOLDOWN_UNTIL)
    if (!raw) return 0
    const until = parseInt(raw, 10)
    if (isNaN(until)) return 0
    return Math.max(0, until - Date.now())
  } catch {
    return 0
  }
}
