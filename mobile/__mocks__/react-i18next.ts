const mockT = (key: string) => key;
const mockI18n = { language: 'en', changeLanguage: jest.fn() };
export const useTranslation = () => ({ t: mockT, i18n: mockI18n });
