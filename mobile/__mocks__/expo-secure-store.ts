const store = new Map<string, string>();
const getItemAsync = jest.fn(async (key: string) => store.get(key) ?? null);
const setItemAsync = jest.fn(async (key: string, value: string) => { store.set(key, value); });
const deleteItemAsync = jest.fn(async (key: string) => { store.delete(key); });
const isAvailableAsync = jest.fn(async () => true);
const __resetStore = () => store.clear();
export { getItemAsync, setItemAsync, deleteItemAsync, isAvailableAsync, __resetStore };
