import * as SecureStore from 'expo-secure-store';

const KEY_PIN = 'parent.pin';
const KEY_PIN_SET = 'parent.pin_set';
const KEY_ATTEMPT_COUNT = 'parent.pin_attempt_count';
const KEY_COOLDOWN_UNTIL = 'parent.pin_cooldown_until';

const PIN_LENGTH = 6;
const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30;

export async function savePin(pin: string): Promise<void> {
  if (!/^\d{6}$/.test(pin)) {
    throw new Error('PIN must be exactly 6 numeric digits');
  }
  await SecureStore.setItemAsync(KEY_PIN, pin);
  await SecureStore.setItemAsync(KEY_PIN_SET, 'true');
  await SecureStore.setItemAsync(KEY_ATTEMPT_COUNT, '0');
}

export async function isPinSet(): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(KEY_PIN_SET);
  return raw === 'true';
}

export async function verifyPin(input: string): Promise<boolean> {
  if (!/^\d{6}$/.test(input)) return false;
  const stored = await SecureStore.getItemAsync(KEY_PIN);
  if (!stored) return false;
  if (stored.length !== input.length) return false;
  let result = 0;
  for (let i = 0; i < stored.length; i++) {
    result |= stored.charCodeAt(i) ^ input.charCodeAt(i);
  }
  return result === 0;
}

export async function getAttemptCount(): Promise<number> {
  const raw = await SecureStore.getItemAsync(KEY_ATTEMPT_COUNT);
  return raw ? parseInt(raw, 10) : 0;
}

export async function recordFailedAttempt(): Promise<void> {
  const count = await getAttemptCount();
  const newCount = count + 1;
  await SecureStore.setItemAsync(KEY_ATTEMPT_COUNT, newCount.toString());
  if (newCount >= MAX_ATTEMPTS) {
    const cooldownUntil = Date.now() + COOLDOWN_SECONDS * 1000;
    await SecureStore.setItemAsync(KEY_COOLDOWN_UNTIL, cooldownUntil.toString());
  }
}

export async function resetAttemptCount(): Promise<void> {
  await SecureStore.setItemAsync(KEY_ATTEMPT_COUNT, '0');
  await SecureStore.deleteItemAsync(KEY_COOLDOWN_UNTIL);
}

export async function getCooldownRemaining(): Promise<number> {
  const raw = await SecureStore.getItemAsync(KEY_COOLDOWN_UNTIL);
  if (!raw) return 0;
  const cooldownUntil = parseInt(raw, 10);
  const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
  if (remaining === 0) await resetAttemptCount();
  return remaining;
}

export async function getRemainingAttempts(): Promise<number> {
  const cooldown = await getCooldownRemaining();
  if (cooldown > 0) return 0;
  const count = await getAttemptCount();
  return Math.max(0, MAX_ATTEMPTS - count);
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY_PIN);
  await SecureStore.deleteItemAsync(KEY_PIN_SET);
  await resetAttemptCount();
}

export { PIN_LENGTH, MAX_ATTEMPTS, COOLDOWN_SECONDS };
