const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  execSync: jest.fn(),
  getAllAsync: jest.fn().mockResolvedValue([]),
  getAllSync: jest.fn().mockReturnValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getFirstSync: jest.fn().mockReturnValue(null),
  runAsync: jest.fn().mockResolvedValue({ changes: 0, lastInsertRowId: 0 }),
  runSync: jest.fn().mockReturnValue({ changes: 0, lastInsertRowId: 0 }),
  close: jest.fn(),
};

export function openDatabaseAsync() {
  return Promise.resolve(mockDb);
}
export function openDatabaseSync() {
  return mockDb;
}
export function deleteDatabaseAsync() {
  return Promise.resolve();
}
export default { openDatabaseAsync, openDatabaseSync, deleteDatabaseAsync };
