const store = new Map<string, string>();

const SecureStore = {
  getItemAsync: jest.fn(async (key: string) => {
    return store.get(key) ?? null;
  }),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    store.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    store.delete(key);
  }),
  isAvailableAsync: jest.fn(async () => true),
  __resetStore: () => store.clear(),
};

export default SecureStore;
