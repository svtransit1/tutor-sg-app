// Catch-all mock for expo-* modules not explicitly mocked
const handler: ProxyHandler<object> = {
  get: (target, prop) => {
    if (prop === 'default' || prop === '__esModule') return undefined;
    if (typeof prop === 'string') return jest.fn().mockReturnValue(undefined);
    return undefined;
  },
};

const proxy = new Proxy({}, handler);
export default proxy;
