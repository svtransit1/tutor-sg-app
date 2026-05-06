import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KidLevel } from '../i18n';
import { MAX_KIDS } from '../i18n';
import type { StepStatus } from '../onboarding/types';

const STORAGE_KEY = '@tutor_sg:kids';

export interface KidProfile {
  id: string;
  name: string;
  level: KidLevel;
  language: 'en' | 'zh-Hans';
  createdAt: string;
  updatedAt: string;
}

function generateId(): string {
  return `kid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function loadKids(): Promise<KidProfile[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as KidProfile[];
  } catch {
    return [];
  }
}

async function saveKids(kids: KidProfile[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(kids));
}

export async function addKid(
  name: string,
  level: KidLevel,
  language: 'en' | 'zh-Hans',
): Promise<KidProfile | null> {
  const kids = await loadKids();
  if (kids.length >= MAX_KIDS) return null;

  const now = new Date().toISOString();
  const newKid: KidProfile = {
    id: generateId(),
    name: name.trim(),
    level,
    language,
    createdAt: now,
    updatedAt: now,
  };

  kids.push(newKid);
  await saveKids(kids);
  return newKid;
}

export async function updateKid(
  id: string,
  updates: { name?: string; level?: KidLevel; language?: 'en' | 'zh-Hans' },
): Promise<KidProfile | null> {
  const kids = await loadKids();
  const idx = kids.findIndex((k) => k.id === id);
  if (idx === -1) return null;

  const existing = kids[idx]!;
  kids[idx] = {
    ...existing,
    ...(updates.name !== undefined && { name: updates.name.trim() }),
    ...(updates.level !== undefined && { level: updates.level }),
    ...(updates.language !== undefined && { language: updates.language }),
    updatedAt: new Date().toISOString(),
  };

  await saveKids(kids);
  return kids[idx]!;
}

export async function deleteKid(id: string): Promise<boolean> {
  const kids = await loadKids();
  const filtered = kids.filter((k) => k.id !== id);
  if (filtered.length === kids.length) return false;
  await saveKids(filtered);
  return true;
}

export async function getKids(): Promise<KidProfile[]> {
  return loadKids();
}

export async function getKid(id: string): Promise<KidProfile | null> {
  const kids = await loadKids();
  return kids.find((k) => k.id === id) ?? null;
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const flag = await AsyncStorage.getItem('@tutor_sg:onboarding_done');
  return flag === 'true';
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem('@tutor_sg:onboarding_done', 'true');
}

export async function getLocale(): Promise<string | null> {
  return AsyncStorage.getItem('@tutor_sg:locale');
}

export async function setLocale(locale: string): Promise<void> {
  await AsyncStorage.setItem('@tutor_sg:locale', locale);
}

// ── Onboarding state machine persistence ──────────────────────────

const ONBOARDING_STATE_KEY = '@tutor_sg:onboarding_state_v1';

export interface PersistedOnboardingState {
  currentStep: string;
  steps: Record<string, StepStatus>;
  deviceTier?: 'high' | 'mid' | 'unsupported';
  privacyConsentAcceptedAt?: string;
  privacyPolicyUrl?: string;
  telemetryOptIn?: boolean;
  kidName?: string;
  kidLevel?: string;
  kidLanguage?: string;
}

export async function getOnboardingState(): Promise<PersistedOnboardingState | null> {
  const raw = await AsyncStorage.getItem(ONBOARDING_STATE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedOnboardingState;
  } catch {
    return null;
  }
}

export async function setOnboardingState(state: PersistedOnboardingState): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(state));
}

export async function clearOnboardingState(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_STATE_KEY);
}
