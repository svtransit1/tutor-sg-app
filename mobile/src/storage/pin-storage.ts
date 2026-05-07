import * as SecureStore from 'expo-secure-store';

const KEY_PIN = 'parent.pin';
const KEY_PIN_SET = 'parent.pin_set';
const KEY_FAILED_ATTEMPTS = 'parent.pin_failed_attempts';
const KEY_LOCKED_UNTIL = 'parent.pin_locked_until';

export const MAX_FAILED_ATTEMPTS = 5;
export const COOLDOWN_SECONDS = 60;

export async function savePin(pin: string): Promise<void> {
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be exactly 4 numeric digits');
  await SecureStore.setItemAsync(KEY_PIN, pin);
  await SecureStore.setItemAsync(KEY_PIN_SET, 'true');
  await SecureStore.setItemAsync(KEY_FAILED_ATTEMPTS, '0');
  await SecureStore.deleteItemAsync(KEY_LOCKED_UNTIL);
}

export async function isPinSet(): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(KEY_PIN_SET);
  return raw === 'true';
}

export async function verifyPin(input: string): Promise<{ success: boolean; remainingAttempts: number; lockedUntil: number | null }> {
  const lockedUntil = await getLockedUntil();
  const now = Date.now();
  if (lockedUntil !== null && now < lockedUntil) return { success: false, remainingAttempts: 0, lockedUntil };
  if (lockedUntil !== null && now >= lockedUntil) await clearLockout();
  if (!/^\d{4}$/.test(input)) { await incrementFailedAttempts(); return { success: false, remainingAttempts: await getRemainingAttempts(), lockedUntil: null }; }
  const stored = await SecureStore.getItemAsync(KEY_PIN);
  if (!stored) return { success: false, remainingAttempts: 0, lockedUntil: null };
  if (constantTimeCompare(input, stored)) {
    await SecureStore.setItemAsync(KEY_FAILED_ATTEMPTS, '0');
    await SecureStore.deleteItemAsync(KEY_LOCKED_UNTIL);
    return { success: true, remainingAttempts: MAX_FAILED_ATTEMPTS, lockedUntil: null };
  }
  const attempts = await incrementFailedAttempts();
  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - attempts);
  if (remaining <= 0) {
    const lockUntil = now + COOLDOWN_SECONDS * 1000;
    await SecureStore.setItemAsync(KEY_LOCKED_UNTIL, String(lockUntil));
    return { success: false, remainingAttempts: 0, lockedUntil: lockUntil };
  }
  return { success: false, remainingAttempts: remaining, lockedUntil: null };
}

export async function getRemainingAttempts(): Promise<number> {
  const raw = await SecureStore.getItemAsync(KEY_FAILED_ATTEMPTS);
  return Math.max(0, MAX_FAILED_ATTEMPTS - (raw ? Number(raw) : 0));
}

export async function getLockedUntil(): Promise<number | null> {
  const raw = await SecureStore.getItemAsync(KEY_LOCKED_UNTIL);
  if (!raw) return null;
  const ts = Number(raw);
  return Number.isFinite(ts) ? ts : null;
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_PIN);
  await SecureStore.deleteItemAsync(KEY_PIN_SET);
  await SecureStore.deleteItemAsync(KEY_FAILED_ATTEMPTS);
  await SecureStore.deleteItemAsync(KEY_LOCKED_UNTIL);
}

async function incrementFailedAttempts(): Promise<number> {
  const raw = await SecureStore.getItemAsync(KEY_FAILED_ATTEMPTS);
  const next = ((raw ? Number(raw) : 0)) + 1;
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
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
