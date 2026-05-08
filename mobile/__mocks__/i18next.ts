module.exports = {
  t: (k: string) => k,
  language: 'en',
  changeLanguage: () => Promise.resolve(),
  use: () => ({ init: () => {} }),
};
