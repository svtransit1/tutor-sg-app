const mockI18n = {
  t: (key: string) => key,
  language: 'en',
  changeLanguage: jest.fn(),
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: mockI18n,
  }),
};

module.exports = mockI18n;
