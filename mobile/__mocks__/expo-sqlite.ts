const mockDb = {
  execAsync: jest.fn(),
  runAsync: jest.fn(() => Promise.resolve({ lastInsertRowId: 1 })),
  getAllAsync: jest.fn(() => Promise.resolve([])),
  getFirstAsync: jest.fn(() => Promise.resolve(null)),
};
export const openDatabaseAsync = jest.fn(() => Promise.resolve(mockDb));
export const openDatabaseSync = () => mockDb;
