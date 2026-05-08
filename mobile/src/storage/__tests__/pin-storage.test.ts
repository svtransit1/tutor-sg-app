jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>()
  return {
    getItemAsync: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItemAsync: jest.fn((key: string, value: string) => {
      store.set(key, value)
      return Promise.resolve()
    }),
    deleteItemAsync: jest.fn((key: string) => {
      store.delete(key)
      return Promise.resolve()
    }),
    __RESET: () => store.clear(),
  }
})

import {
  savePin,
  isPinSet,
  verifyPin,
  clearPin,
  getFailedAttempts,
  incrementFailedAttempts,
  clearFailedAttempts,
  getCooldownRemaining,
  MAX_ATTEMPTS,
  COOLDOWN_SECONDS,
} from '../pin-storage'
import * as SecureStore from 'expo-secure-store'

beforeEach(() => {
  ;(SecureStore as any).__RESET()
  jest.clearAllMocks()
})

describe('savePin', () => {
  it('saves a valid 4-digit PIN', async () => {
    await savePin('1234')
    expect(await isPinSet()).toBe(true)
  })

  it('throws for non-4-digit PIN', async () => {
    await expect(savePin('123')).rejects.toThrow('PIN must be exactly 4 numeric digits')
    await expect(savePin('12345')).rejects.toThrow('PIN must be exactly 4 numeric digits')
    await expect(savePin('abcd')).rejects.toThrow('PIN must be exactly 4 numeric digits')
  })
})

describe('isPinSet', () => {
  it('returns false when no PIN is saved', async () => {
    expect(await isPinSet()).toBe(false)
  })

  it('returns true after PIN is saved', async () => {
    await savePin('2468')
    expect(await isPinSet()).toBe(true)
  })
})

describe('verifyPin', () => {
  it('returns true for correct PIN', async () => {
    await savePin('9876')
    expect(await verifyPin('9876')).toBe(true)
  })

  it('returns false for incorrect PIN', async () => {
    await savePin('9876')
    expect(await verifyPin('1234')).toBe(false)
  })

  it('returns false when no PIN is stored', async () => {
    expect(await verifyPin('1234')).toBe(false)
  })

  it('returns false for non-numeric input', async () => {
    await savePin('1234')
    expect(await verifyPin('abcd')).toBe(false)
  })
})

describe('clearPin', () => {
  it('removes PIN and resets attempts', async () => {
    await savePin('1111')
    await incrementFailedAttempts()
    await clearPin()
    expect(await isPinSet()).toBe(false)
    expect(await getFailedAttempts()).toBe(0)
  })
})

describe('failed attempts tracking', () => {
  it('starts at 0', async () => {
    expect(await getFailedAttempts()).toBe(0)
  })

  it('increments correctly', async () => {
    expect(await incrementFailedAttempts()).toBe(1)
    expect(await incrementFailedAttempts()).toBe(2)
    expect(await getFailedAttempts()).toBe(2)
  })

  it('triggers cooldown after MAX_ATTEMPTS', async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await incrementFailedAttempts()
    }
    const remaining = await getCooldownRemaining()
    expect(remaining).toBeGreaterThan(0)
    expect(remaining).toBeLessThanOrEqual(COOLDOWN_SECONDS * 1000)
  })

  it('resets with clearFailedAttempts', async () => {
    await incrementFailedAttempts()
    await clearFailedAttempts()
    expect(await getFailedAttempts()).toBe(0)
    expect(await getCooldownRemaining()).toBe(0)
  })
})

describe('cooldown', () => {
  it('returns 0 when no cooldown is set', async () => {
    expect(await getCooldownRemaining()).toBe(0)
  })
})
