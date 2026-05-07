import { MMKV } from 'react-native-mmkv';
import { Grade } from './onboarding-state';

export type AvatarId = 'cat' | 'dog' | 'rabbit' | 'panda' | 'owl' | 'tiger' | 'koala' | 'lion';

export interface KidProfile {
  id: string;
  name: string;
  grade: Grade;
  avatarId: AvatarId;
  createdAt: string;
  updatedAt: string;
}

export const AVATAR_EMOJIS: Record<AvatarId, string> = {
  cat: '\u{1F431}',
  dog: '\u{1F436}',
  rabbit: '\u{1F430}',
  panda: '\u{1F43C}',
  owl: '\u{1F989}',
  tiger: '\u{1F42F}',
  koala: '\u{1F428}',
  lion: '\u{1F981}',
};

export const AVATAR_IDS: AvatarId[] = ['cat', 'dog', 'rabbit', 'panda', 'owl', 'tiger', 'koala', 'lion'];
export const MAX_KIDS = 4;

const STORAGE_ID = 'kid-profiles';
const KEY_PROFILE_PREFIX = 'kid_profile.';
const KEY_COUNT = 'kid_profile.count';

let _store: MMKV | null = null;

function store(): MMKV {
  if (!_store) _store = new MMKV({ id: STORAGE_ID });
  return _store;
}

export function addKidProfile(profile: KidProfile): void {
  const count = getKidCount();
  if (count >= MAX_KIDS) return;
  store().set(`${KEY_PROFILE_PREFIX}${profile.id}`, JSON.stringify(profile));
  store().set(KEY_COUNT, String(count + 1));
}

export function updateKidProfile(profile: KidProfile): void {
  store().set(`${KEY_PROFILE_PREFIX}${profile.id}`, JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }));
}

export function deleteKidProfile(id: string): void {
  store().delete(`${KEY_PROFILE_PREFIX}${id}`);
  const count = getKidCount();
  store().set(KEY_COUNT, String(Math.max(0, count - 1)));
}

export function getKidProfile(id: string): KidProfile | null {
  const raw = store().getString(`${KEY_PROFILE_PREFIX}${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as KidProfile;
  } catch {
    return null;
  }
}

export function getAllKidProfiles(): KidProfile[] {
  const count = getKidCount();
  const profiles: KidProfile[] = [];
  const allKeys = store().getAllKeys();
  const profileKeys = allKeys.filter((k) => k.startsWith(KEY_PROFILE_PREFIX));
  for (const key of profileKeys) {
    const raw = store().getString(key);
    if (raw) {
      try {
        const profile = JSON.parse(raw) as KidProfile;
        profiles.push(profile);
      } catch {
        /* skip malformed entries */
      }
    }
  }
  return profiles.slice(0, count);
}

export function getKidCount(): number {
  const raw = store().getString(KEY_COUNT);
  if (!raw) return 0;
  const count = parseInt(raw, 10);
  return isNaN(count) ? 0 : Math.min(count, MAX_KIDS);
}

export function clearAllKidProfiles(): void {
  const allKeys = store().getAllKeys();
  allKeys.forEach((k) => {
    if (k.startsWith(KEY_PROFILE_PREFIX) || k === KEY_COUNT) {
      store().delete(k);
    }
  });
}
