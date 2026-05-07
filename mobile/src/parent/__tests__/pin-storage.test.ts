/**
 * Tests for pin-storage module.
 *
 * Uses vi.mock for expo-secure-store. The mock is set up in vitest.setup.ts.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  savePin,
  isPinSet,
  verifyPin,
  clearPin,
  getRemainingAttempts,
  getLockedUntil,
  MAX_FAILED_ATTEMPTS,
  COOLDOWN_SECONDS,
} from '../pin-storage';
import * as SecureStore from 'expo-secure-store';

// Get the mock store from global (set up in vitest.setup.ts)
const mockStore = (globalThis as any).__SECURE_STORE_MOCK__ as Map<string, string>;

beforeEach(() => {
  mockStore.clear();
  vi.clearAllMocks();
});

// ── Tests ──────────────────────────────────────────────────────────

describe('savePin()', () => {
  it('saves a valid 4-digit PIN', async () => {
    await savePin('1234');
    expect(mockStore.get('parent.pin')).toBe('1234');
    expect(mockStore.get('parent.pin_set')).toBe('true');
  });

  it('throws on non-numeric PIN', async () => {
    await expect(savePin('abcd')).rejects.toThrow('PIN must be exactly 4 numeric digits');
  });

  it('throws on short PIN', async () => {
    await expect(savePin('123')).rejects.toThrow('PIN must be exactly 4 numeric digits');
  });

  it('throws on long PIN', async () => {
    await expect(savePin('12345')).rejects.toThrow('PIN must be exactly 4 numeric digits');
  });

  it('throws on empty PIN', async () => {
    await expect(savePin('')).rejects.toThrow('PIN must be exactly 4 numeric digits');
  });
});

describe('isPinSet()', () => {
  it('returns false when no PIN has been saved', async () => {
    expect(await isPinSet()).toBe(false);
  });

  it('returns true after PIN is saved', async () => {
    await savePin('1234');
    expect(await isPinSet()).toBe(true);
  });

  it('returns false after PIN is cleared', async () => {
    await savePin('1234');
    await clearPin();
    expect(await isPinSet()).toBe(false);
  });
});

describe('verifyPin()', () => {
  it('returns success for correct PIN', async () => {
    await savePin('1234');
    const result = await verifyPin('1234');
    expect(result.success).toBe(true);
    expect(result.remainingAttempts).toBe(MAX_FAILED_ATTEMPTS);
    expect(result.lockedUntil).toBeNull();
  });

  it('returns failure for wrong PIN', async () => {
    await savePin('1234');
    const result = await verifyPin('0000');
    expect(result.success).toBe(false);
    expect(result.remainingAttempts).toBe(MAX_FAILED_ATTEMPTS - 1);
    expect(result.lockedUntil).toBeNull();
  });

  it('decrements remaining attempts on wrong PIN', async () => {
    await savePin('1234');
    await verifyPin('0000');
    const result = await verifyPin('0000');
    expect(result.success).toBe(false);
    expect(result.remainingAttempts).toBe(MAX_FAILED_ATTEMPTS - 2);
  });

  it('locks out after MAX_FAILED_ATTEMPTS wrong attempts', async () => {
    await savePin('1234');
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      await verifyPin('0000');
    }
    const result = await verifyPin('0000');
    expect(result.success).toBe(false);
    expect(result.remainingAttempts).toBe(0);
    expect(result.lockedUntil).not.toBeNull();
    expect(result.lockedUntil!).toBeGreaterThan(Date.now());
  });

  it('returns success after lockout expires', async () => {
    await savePin('1234');
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      await verifyPin('0000');
    }

    // Manually set lockout to past
    mockStore.set('parent.pin_locked_until', String(Date.now() - 1000));
    mockStore.set('parent.pin_failed_attempts', String(MAX_FAILED_ATTEMPTS));

    const result = await verifyPin('1234');
    expect(result.success).toBe(true);
  });

  it('resets counter on successful verification', async () => {
    await savePin('1234');
    await verifyPin('0000');
    expect(await getRemainingAttempts()).toBe(MAX_FAILED_ATTEMPTS - 1);

    await verifyPin('1234');
    expect(await getRemainingAttempts()).toBe(MAX_FAILED_ATTEMPTS);
  });

  it('returns failure when no PIN has been set', async () => {
    const result = await verifyPin('1234');
    expect(result.success).toBe(false);
  });
});

describe('clearPin()', () => {
  it('removes all PIN-related keys', async () => {
    await savePin('1234');
    await clearPin();
    expect(mockStore.has('parent.pin')).toBe(false);
    expect(mockStore.has('parent.pin_set')).toBe(false);
    expect(mockStore.has('parent.pin_failed_attempts')).toBe(false);
    expect(mockStore.has('parent.pin_locked_until')).toBe(false);
  });
});

describe('getRemainingAttempts()', () => {
  it('returns max when no failed attempts', async () => {
    expect(await getRemainingAttempts()).toBe(MAX_FAILED_ATTEMPTS);
  });

  it('returns reduced count after failures', async () => {
    await savePin('1234');
    await verifyPin('0000');
    expect(await getRemainingAttempts()).toBe(MAX_FAILED_ATTEMPTS - 1);
  });
});

describe('getLockedUntil()', () => {
  it('returns null when not locked', async () => {
    expect(await getLockedUntil()).toBeNull();
  });

  it('returns timestamp when locked', async () => {
    await savePin('1234');
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      await verifyPin('0000');
    }
    const lockedUntil = await getLockedUntil();
    expect(lockedUntil).not.toBeNull();
    expect(lockedUntil!).toBeGreaterThan(Date.now());
    expect(lockedUntil!).toBeLessThan(Date.now() + (COOLDOWN_SECONDS + 1) * 1000);
  });
});
