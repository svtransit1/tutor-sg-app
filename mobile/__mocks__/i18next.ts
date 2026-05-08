const i18n = {
  use: () => i18n,
  init: () => Promise.resolve(),
  changeLanguage: () => Promise.resolve(),
  t: (key: string) => key,
  language: 'en',
};
export default i18n;
