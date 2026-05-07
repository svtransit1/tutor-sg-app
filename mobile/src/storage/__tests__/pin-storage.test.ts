const mockData = new Map<string, string>();

jest.mock('expo-secure-store', () => {
  const store = { data: new Map<string, string>() };
  return {
    getItemAsync: jest.fn(async (k: string) => store.data.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => { store.data.set(k, v); }),
    deleteItemAsync: jest.fn(async (k: string) => { store.data.delete(k); }),
    __mockStore__: store,
  };
});

import { savePin, isPinSet, verifyPin, clearPin, getRemainingAttempts, getLockedUntil, MAX_FAILED_ATTEMPTS, COOLDOWN_SECONDS } from '../pin-storage';

const SecureStore = jest.requireMock('expo-secure-store');

function resetStore() {
  SecureStore.__mockStore__.data.clear();
  SecureStore.getItemAsync.mockImplementation(async (k: string) => SecureStore.__mockStore__.data.get(k) ?? null);
  SecureStore.setItemAsync.mockImplementation(async (k: string, v: string) => { SecureStore.__mockStore__.data.set(k, v); });
  SecureStore.deleteItemAsync.mockImplementation(async (k: string) => { SecureStore.__mockStore__.data.delete(k); });
}

beforeEach(() => {
  resetStore();
  SecureStore.__mockStore__.data.set('parent.pin_failed_attempts', '3');
  SecureStore.__mockStore__.data.set('parent.pin_locked_until', '99999');
});

describe('savePin', () => {
  it('saves valid PIN and resets attempts', async () => {
    await savePin('1234');
    expect(SecureStore.__mockStore__.data.get('parent.pin')).toBe('1234');
    expect(SecureStore.__mockStore__.data.get('parent.pin_set')).toBe('true');
    expect(SecureStore.__mockStore__.data.get('parent.pin_failed_attempts')).toBe('0');
    expect(SecureStore.__mockStore__.data.has('parent.pin_locked_until')).toBe(false);
  });
  it('rejects invalid PINs', async () => {
    await expect(savePin('abcd')).rejects.toThrow('4 numeric digits');
    await expect(savePin('123')).rejects.toThrow('4 numeric digits');
    await expect(savePin('12345')).rejects.toThrow('4 numeric digits');
    await expect(savePin('')).rejects.toThrow('4 numeric digits');
  });
});

describe('isPinSet', () => {
  it('false not set', async () => { SecureStore.__mockStore__.data.clear(); expect(await isPinSet()).toBe(false); });
  it('true after save', async () => { await savePin('1234'); expect(await isPinSet()).toBe(true); });
  it('false after clear', async () => { await savePin('1234'); await clearPin(); expect(await isPinSet()).toBe(false); });
});

describe('verifyPin', () => {
  it('correct PIN', async () => {
    SecureStore.__mockStore__.data.clear();
    await savePin('1234');
    const r = await verifyPin('1234');
    expect(r.success).toBe(true);
    expect(r.remainingAttempts).toBe(MAX_FAILED_ATTEMPTS);
    expect(r.lockedUntil).toBeNull();
  });
  it('wrong PIN', async () => {
    SecureStore.__mockStore__.data.clear();
    await savePin('1234');
    const r = await verifyPin('0000');
    expect(r.success).toBe(false);
    expect(r.remainingAttempts).toBe(MAX_FAILED_ATTEMPTS - 1);
  });
  it('decrements', async () => {
    SecureStore.__mockStore__.data.clear();
    await savePin('1234');
    await verifyPin('0000');
    expect((await verifyPin('0000')).remainingAttempts).toBe(MAX_FAILED_ATTEMPTS - 2);
  });
  it('locks after max', async () => {
    SecureStore.__mockStore__.data.clear();
    await savePin('1234');
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) await verifyPin('0000');
    const r = await verifyPin('0000');
    expect(r.success).toBe(false);
    expect(r.remainingAttempts).toBe(0);
    expect(r.lockedUntil).not.toBeNull();
    expect(r.lockedUntil!).toBeGreaterThan(Date.now());
  });
  it('recovers after lockout', async () => {
    SecureStore.__mockStore__.data.clear();
    await savePin('1234');
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) await verifyPin('0000');
    SecureStore.__mockStore__.data.set('parent.pin_locked_until', String(Date.now() - 1000));
    SecureStore.__mockStore__.data.set('parent.pin_failed_attempts', String(MAX_FAILED_ATTEMPTS));
    expect((await verifyPin('1234')).success).toBe(true);
  });
  it('resets on success', async () => {
    SecureStore.__mockStore__.data.clear();
    await savePin('1234');
    await verifyPin('0000');
    expect(await getRemainingAttempts()).toBe(MAX_FAILED_ATTEMPTS - 1);
    await verifyPin('1234');
    expect(await getRemainingAttempts()).toBe(MAX_FAILED_ATTEMPTS);
  });
  it('fails when no PIN set', async () => {
    SecureStore.__mockStore__.data.clear();
    expect((await verifyPin('1234')).success).toBe(false);
  });
});

describe('cooldown', () => {
  it('not locked initially', async () => { SecureStore.__mockStore__.data.clear(); expect(await getLockedUntil()).toBeNull(); });
  it('locked after max attempts', async () => {
    SecureStore.__mockStore__.data.clear();
    await savePin('1234');
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) await verifyPin('0000');
    const lu = await getLockedUntil();
    expect(lu).not.toBeNull();
    expect(lu!).toBeGreaterThan(Date.now());
    expect(lu!).toBeLessThan(Date.now() + (COOLDOWN_SECONDS + 1) * 1000);
  });
});

describe('clearPin', () => {
  it('removes all keys', async () => {
    SecureStore.__mockStore__.data.clear();
    await savePin('1234');
    await clearPin();
    expect(SecureStore.__mockStore__.data.has('parent.pin')).toBe(false);
    expect(SecureStore.__mockStore__.data.has('parent.pin_set')).toBe(false);
    expect(SecureStore.__mockStore__.data.has('parent.pin_failed_attempts')).toBe(false);
    expect(SecureStore.__mockStore__.data.has('parent.pin_locked_until')).toBe(false);
  });
});
