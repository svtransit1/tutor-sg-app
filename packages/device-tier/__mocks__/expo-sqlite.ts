const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({}),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn().mockResolvedValue([]),
};

export const openDatabaseAsync = jest.fn().mockResolvedValue(mockDb);

export function __getMockDb() {
  return mockDb;
}

export function __resetMockDb() {
  mockDb.execAsync.mockClear();
  mockDb.runAsync.mockClear();
  mockDb.getFirstAsync.mockClear();
  mockDb.getAllAsync.mockClear();
  mockDb.getFirstAsync.mockResolvedValue(null);
}
