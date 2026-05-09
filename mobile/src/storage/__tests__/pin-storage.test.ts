import { openDatabaseAsync } from 'expo-sqlite';
import {
  getPinStatus,
  setPin,
  verifyPin,
  resetFailedAttempts,
} from '../pin-storage';
import { resetDb } from '../database';

let mockDb: {
  execAsync: jest.Mock;
  runAsync: jest.Mock;
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
};

beforeEach(async () => {
  resetDb();
  jest.clearAllMocks();
  mockDb = await openDatabaseAsync();
});

const TEST_HASH = 'a1b2c3d4e5f6';

describe('getPinStatus', () => {
  it('returns isSet false when no pin row', async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);
    const status = await getPinStatus();
    expect(status.isSet).toBe(false);
    expect(status.isLocked).toBe(false);
    expect(status.failedAttempts).toBe(0);
  });

  it('returns pin status when set', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1, pin_hash: TEST_HASH, failed_attempts: 0,
      locked_until: null, created_at: '', updated_at: '',
    });
    const status = await getPinStatus();
    expect(status.isSet).toBe(true);
    expect(status.isLocked).toBe(false);
  });

  it('detects locked state', async () => {
    const future = new Date(Date.now() + 30_000).toISOString();
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1, pin_hash: TEST_HASH, failed_attempts: 5,
      locked_until: future, created_at: '', updated_at: '',
    });
    const status = await getPinStatus();
    expect(status.isSet).toBe(true);
    expect(status.isLocked).toBe(true);
    expect(status.lockedUntil).toBe(future);
  });
});

describe('setPin', () => {
  it('inserts new pin row when none exists', async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 1 });

    await setPin(TEST_HASH);
    const args = mockDb.runAsync.mock.calls[0];
    const sql = args[0] as string;
    expect(sql).toContain('INSERT INTO parent_pin');
    expect(args[1]).toBe(TEST_HASH);
    expect(args).toHaveLength(4);
  });

  it('updates existing pin row', async () => {
    mockDb.getFirstAsync.mockResolvedValue({ id: 1 });
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 1 });

    await setPin(TEST_HASH);
    const sql = mockDb.runAsync.mock.calls[0][0] as string;
    expect(sql).toContain('UPDATE parent_pin');
  });
});

describe('verifyPin', () => {
  it('returns false when no pin set', async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);
    const result = await verifyPin(TEST_HASH);
    expect(result).toBe(false);
  });

  it('returns true for matching pin', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1, pin_hash: TEST_HASH, failed_attempts: 0,
      locked_until: null, created_at: '', updated_at: '',
    });
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 1 });

    const result = await verifyPin(TEST_HASH);
    expect(result).toBe(true);
  });

  it('returns false for mismatched pin', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1, pin_hash: TEST_HASH, failed_attempts: 0,
      locked_until: null, created_at: '', updated_at: '',
    });

    const result = await verifyPin('wronghash');
    expect(result).toBe(false);
    const sql = mockDb.runAsync.mock.calls[0][0] as string;
    expect(sql).toContain('SET failed_attempts = ?');
    expect(mockDb.runAsync.mock.calls[0][1]).toBe(1);
  });

  it('locks after 5 failed attempts', async () => {
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1, pin_hash: TEST_HASH, failed_attempts: 4,
      locked_until: null, created_at: '', updated_at: '',
    });

    const result = await verifyPin('wronghash');
    expect(result).toBe(false);
    const sql = mockDb.runAsync.mock.calls[0][0] as string;
    expect(sql).toContain('SET failed_attempts = ?, locked_until = ?');
    expect(mockDb.runAsync.mock.calls[0][1]).toBe(5);
  });

  it('returns false when locked', async () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    mockDb.getFirstAsync.mockResolvedValue({
      id: 1, pin_hash: TEST_HASH, failed_attempts: 5,
      locked_until: future, created_at: '', updated_at: '',
    });

    const result = await verifyPin(TEST_HASH);
    expect(result).toBe(false);
  });
});

describe('resetFailedAttempts', () => {
  it('clears failed attempts and lock', async () => {
    mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 1 });
    await resetFailedAttempts();
    const sql = mockDb.runAsync.mock.calls[0][0] as string;
    expect(sql).toContain('SET failed_attempts = 0, locked_until = NULL');
  });
});
