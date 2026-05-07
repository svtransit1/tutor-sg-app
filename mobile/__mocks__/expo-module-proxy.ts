module.exports = new Proxy(
  {},
  {
    get: (_target: unknown, prop: string) => {
      if (prop === 'default') return module.exports;
      return {};
    },
  },
);
