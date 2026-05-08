import {
  savePin, isPinSet, verifyPin, clearPin, recordFailedAttempt,
  getRemainingAttempts, getCooldownRemaining, resetAttemptCount,
  PIN_LENGTH, MAX_ATTEMPTS, COOLDOWN_SECONDS,
} from '../../storage/pin-storage';

jest.mock('expo-secure-store');

describe('pin-storage', () => {
  beforeEach(async () => {
    const SS = require('expo-secure-store');
    SS.__resetStore();
  });

  it('savePin rejects non-6-digit', async () => {
    await expect(savePin('12345')).rejects.toThrow();
    await expect(savePin('12345a')).rejects.toThrow();
    await expect(savePin('')).rejects.toThrow();
  });

  it('savePin accepts valid 6-digit', async () => {
    await expect(savePin('123456')).resolves.toBeUndefined();
  });

  it('isPinSet returns false initially', async () => {
    expect(await isPinSet()).toBe(false);
  });

  it('isPinSet returns true after save', async () => {
    await savePin('123456');
    expect(await isPinSet()).toBe(true);
  });

  it('verifyPin matches correctly', async () => {
    await savePin('123456');
    expect(await verifyPin('123456')).toBe(true);
    expect(await verifyPin('654321')).toBe(false);
    expect(await verifyPin('12345')).toBe(false);
  });

  it('verifyPin returns false when no pin stored', async () => {
    expect(await verifyPin('123456')).toBe(false);
  });

  it('clearPin removes pin', async () => {
    await savePin('123456');
    await clearPin();
    expect(await isPinSet()).toBe(false);
    expect(await verifyPin('123456')).toBe(false);
  });

  it('tracks failed attempts', async () => {
    expect(await getRemainingAttempts()).toBe(MAX_ATTEMPTS);
    await recordFailedAttempt();
    expect(await getRemainingAttempts()).toBe(MAX_ATTEMPTS - 1);
  });

  it('triggers cooldown after MAX_ATTEMPTS', async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) await recordFailedAttempt();
    expect(await getRemainingAttempts()).toBe(0);
    const cd = await getCooldownRemaining();
    expect(cd).toBeGreaterThan(0);
    expect(cd).toBeLessThanOrEqual(COOLDOWN_SECONDS);
  });

  it('resetAttemptCount restores attempts', async () => {
    await recordFailedAttempt();
    await recordFailedAttempt();
    await resetAttemptCount();
    expect(await getRemainingAttempts()).toBe(MAX_ATTEMPTS);
  });

  it('constants are correct', () => {
    expect(PIN_LENGTH).toBe(6);
    expect(MAX_ATTEMPTS).toBe(5);
    expect(COOLDOWN_SECONDS).toBe(30);
  });
});
