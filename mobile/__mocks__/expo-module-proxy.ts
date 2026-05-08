// Catch-all mock for any expo-* module not specifically mapped
const mockExpoModule = new Proxy({}, {
  get: () => jest.fn(),
  apply: () => jest.fn(),
});
export default mockExpoModule;
