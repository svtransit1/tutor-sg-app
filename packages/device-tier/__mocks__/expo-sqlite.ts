const mockExecAsync = jest.fn().mockResolvedValue(undefined);
const mockRunAsync = jest.fn().mockResolvedValue({});
const mockGetAllAsync = jest.fn().mockResolvedValue([]);
const mockGetFirstAsync = jest.fn().mockResolvedValue(null);

const mockDb = { execAsync: mockExecAsync, runAsync: mockRunAsync, getAllAsync: mockGetAllAsync, getFirstAsync: mockGetFirstAsync };

export const openDatabaseAsync = jest.fn().mockResolvedValue(mockDb);
export function __getMockDb() { return mockDb; }
export function __resetMockDb() {
  mockExecAsync.mockReset().mockResolvedValue(undefined);
  mockRunAsync.mockReset().mockResolvedValue({});
  mockGetAllAsync.mockReset().mockResolvedValue([]);
  mockGetFirstAsync.mockReset().mockResolvedValue(null);
}
