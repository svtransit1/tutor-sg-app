import { MMKV } from 'react-native-mmkv';
const STORAGE_ID = 'onboarding';
const KEY_LOCALE = 'onboarding.locale';
let _store: MMKV | null = null;
function store(): MMKV {
  if (!_store) _store = new MMKV({ id: STORAGE_ID });
  return _store;
}
export function persistLocale(locale: 'en' | 'zh-Hans'): void {
  store().set(KEY_LOCALE, locale);
}
export function loadLocale(): 'en' | 'zh-Hans' {
  const raw = store().getString(KEY_LOCALE);
  if (raw === 'zh-Hans') return 'zh-Hans';
  return 'en';
}
