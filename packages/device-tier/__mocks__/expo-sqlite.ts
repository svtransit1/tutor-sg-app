interface MockDb {
  execAsync: jest.Mock;
  runAsync: jest.Mock;
  getFirstAsync: jest.Mock;
  getAllAsync: jest.Mock;
}

const mockDb: MockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({}),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn().mockResolvedValue([]),
};

export const openDatabaseAsync = jest.fn().mockResolvedValue(mockDb);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function __getMockDb(): any {
  return mockDb;
}

export function __resetMockDb() {
  mockDb.execAsync.mockClear();
  mockDb.runAsync.mockClear();
  mockDb.getFirstAsync.mockClear();
  mockDb.getAllAsync.mockClear();
  mockDb.getFirstAsync.mockResolvedValue(null);
}
