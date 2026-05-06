import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

const KEYS = {
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LOCALE: 'prefs.locale',
  GRADE: 'prefs.grade',
  SUBJECTS: 'prefs.subjects',
  CHILD_PROFILES: 'prefs.child_profiles',
  DEVICE_TIER: 'prefs.device_tier',
  MODEL_DOWNLOADED: 'prefs.model_downloaded',
} as const;

export interface ChildProfile {
  grade: string;
  subjects: string[];
}

export interface OnboardingState {
  locale: 'en' | 'zh-Hans';
  grade: string;
  subjects: string[];
  childProfiles: ChildProfile[];
  deviceTier: 'high' | 'low' | 'unsupported';
  modelDownloaded: boolean;
}

export function setOnboardingCompleted(value: boolean): void {
  storage.set(KEYS.ONBOARDING_COMPLETED, value);
}

export function isOnboardingCompleted(): boolean {
  return storage.getBoolean(KEYS.ONBOARDING_COMPLETED) ?? false;
}

export function setLocale(locale: 'en' | 'zh-Hans'): void {
  storage.set(KEYS.LOCALE, locale);
}

export function getLocale(): 'en' | 'zh-Hans' {
  return (storage.getString(KEYS.LOCALE) as 'en' | 'zh-Hans' | null) ?? 'en';
}

export function setGrade(grade: string): void {
  storage.set(KEYS.GRADE, grade);
}

export function getGrade(): string | null {
  return storage.getString(KEYS.GRADE) ?? null;
}

export function setSubjects(subjects: string[]): void {
  storage.set(KEYS.SUBJECTS, JSON.stringify(subjects));
}

export function getSubjects(): string[] {
  const raw = storage.getString(KEYS.SUBJECTS);
  return raw ? JSON.parse(raw) : [];
}

export function addChildProfile(profile: ChildProfile): void {
  const existing = getChildProfiles();
  if (existing.length >= 4) return; // cap at 4 (family plan)
  storage.set(KEYS.CHILD_PROFILES, JSON.stringify([...existing, profile]));
}

export function getChildProfiles(): ChildProfile[] {
  const raw = storage.getString(KEYS.CHILD_PROFILES);
  return raw ? JSON.parse(raw) : [];
}

export function setDeviceTier(tier: 'high' | 'low' | 'unsupported'): void {
  storage.set(KEYS.DEVICE_TIER, tier);
}

export function getDeviceTier(): 'high' | 'low' | 'unsupported' | null {
  return (storage.getString(KEYS.DEVICE_TIER) as 'high' | 'low' | 'unsupported' | null) ?? null;
}

export function setModelDownloaded(value: boolean): void {
  storage.set(KEYS.MODEL_DOWNLOADED, value);
}

export function isModelDownloaded(): boolean {
  return storage.getBoolean(KEYS.MODEL_DOWNLOADED) ?? false;
}

export function getOnboardingState(): OnboardingState {
  return {
    locale: getLocale(),
    grade: getGrade() ?? '—',
    subjects: getSubjects(),
    childProfiles: getChildProfiles(),
    deviceTier: getDeviceTier() ?? 'low',
    modelDownloaded: isModelDownloaded(),
  };
}

export function resetOnboarding(): void {
  storage.clearAll();
}
