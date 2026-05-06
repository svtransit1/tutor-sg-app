const i18n = {
  t: (key: string) => key,
  use: () => i18n,
  init: jest.fn().mockResolvedValue(undefined),
  changeLanguage: jest.fn().mockResolvedValue(undefined),
  language: 'en',
  languages: ['en', 'zh-Hans'],
  isInitialized: true,
  on: jest.fn(),
  off: jest.fn(),
};

export const t = i18n.t;
export default i18n;
