import React from 'react';

export const useTranslation = () => ({
  t: (key: string) => key,
  i18n: { language: 'en', changeLanguage: jest.fn() },
  ready: true,
});

export const Trans = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const initReactI18next = { type: '3rdParty' as const, init: jest.fn() };
export default { useTranslation, Trans, initReactI18next };
