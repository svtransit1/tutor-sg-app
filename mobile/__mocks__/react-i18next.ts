import React from 'react';

const mockChangeLanguage = jest.fn();

export const useTranslation = () => ({
  t: (key: string) => key,
  i18n: { language: 'en', changeLanguage: mockChangeLanguage },
  ready: true,
});

export const __mockChangeLanguage = mockChangeLanguage;

export const Trans = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const initReactI18next = { type: '3rdParty' as const, init: jest.fn() };
export default { useTranslation, Trans, initReactI18next };
