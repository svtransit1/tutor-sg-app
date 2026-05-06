/**
 * Type augmentation for i18next — provides autocomplete and type-checking
 * for all t() call keys.
 *
 * When you add a new key to en.json, TypeScript will enforce that only
 * existing keys are used in t() calls throughout the app.
 */

import type en from './locales/en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}

export type TranslationKey = keyof typeof en;
