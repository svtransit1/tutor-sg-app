const React = require('react');

const mockUseTranslation = () => ({
  t: (key: string) => key,
  i18n: { language: 'en', changeLanguage: jest.fn() },
});

module.exports = {
  useTranslation: mockUseTranslation,
  initReactI18next: { type: '3rdParty', init: jest.fn() },
};
