import { openDatabaseAsync } from 'expo-sqlite';
import { getDb, resetDb } from '../database';

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

describe('getDb', () => {
  it('returns a db instance', async () => {
    const db = await getDb();
    expect(db).toBe(mockDb);
  });

  it('calls execAsync with DDL on first open', async () => {
    await getDb();
    expect(mockDb.execAsync).toHaveBeenCalledTimes(1);
    const ddl = mockDb.execAsync.mock.calls[0][0] as string;
    expect(ddl).toContain('CREATE TABLE IF NOT EXISTS kid_sessions');
    expect(ddl).toContain('CREATE TABLE IF NOT EXISTS session_events');
    expect(ddl).toContain('CREATE TABLE IF NOT EXISTS kid_progress');
    expect(ddl).toContain('CREATE TABLE IF NOT EXISTS kid_profiles');
    expect(ddl).toContain('CREATE TABLE IF NOT EXISTS parent_pin');
  });

  it('returns the same db instance on subsequent calls', async () => {
    const db1 = await getDb();
    const db2 = await getDb();
    expect(db1).toBe(db2);
    expect(mockDb.execAsync).toHaveBeenCalledTimes(1);
  });

  it('reopens after resetDb', async () => {
    const db1 = await getDb();
    expect(db1).toBe(mockDb);

    resetDb();
    jest.clearAllMocks();

    const db2 = await getDb();
    expect(db2).toBe(mockDb);
    expect(mockDb.execAsync).toHaveBeenCalledTimes(1);
  });
});
