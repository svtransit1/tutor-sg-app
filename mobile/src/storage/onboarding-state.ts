/**
 * Onboarding state persistence — MMKV-backed store.
 *
 * Persists user choices made during the onboarding flow:
 * - Language preference (from LANG_PICK)
 * - Child grade (P1–P6)
 * - Selected subjects
 * - Onboarding completion flag
 * - Child profile(s) for family plan support
 *
 * Following the same pattern as model-download-state.ts.
 */
import { MMKV } from 'react-native-mmkv';

// ── Types ──────────────────────────────────────────────────────────

export type Grade = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
export type SubjectId = 'math' | 'english' | 'chinese' | 'science';

export interface ChildProfile {
  grade: Grade;
  subjects: SubjectId[];
}

export interface OnboardingState {
  locale: 'en' | 'zh-Hans';
  currentChild: ChildProfile;
  siblingProfiles: ChildProfile[];
  completed: boolean;
}

// ── Constants ──────────────────────────────────────────────────────

const STORAGE_ID = 'onboarding';
const KEY_LOCALE = 'onboarding.locale';
const KEY_GRADE = 'onboarding.grade';
const KEY_SUBJECTS = 'onboarding.subjects';
const KEY_COMPLETED = 'onboarding.completed';
const KEY_CHILD_COUNT = 'onboarding.child_count';
const KEY_SIBLING_PREFIX = 'onboarding.sibling.';
const KEY_FIRST_HOME_VISIT = 'onboarding.first_home_visit';

let _store: MMKV | null = null;

function store(): MMKV {
  if (!_store) _store = new MMKV({ id: STORAGE_ID });
  return _store;
}

// ── Locale ─────────────────────────────────────────────────────────

export function persistLocale(locale: 'en' | 'zh-Hans'): void {
  store().set(KEY_LOCALE, locale);
}

export function loadLocale(): 'en' | 'zh-Hans' {
  const raw = store().getString(KEY_LOCALE);
  if (raw === 'zh-Hans') return 'zh-Hans';
  return 'en'; // default
}

// ── Grade ──────────────────────────────────────────────────────────

export function persistGrade(grade: Grade): void {
  store().set(KEY_GRADE, grade);
}

export function loadGrade(): Grade | null {
  const raw = store().getString(KEY_GRADE);
  if (!raw) return null;
  // Validate it's a valid grade
  if (['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].includes(raw)) {
    return raw as Grade;
  }
  return null;
}

// ── Subjects ───────────────────────────────────────────────────────

export function persistSubjects(subjects: SubjectId[]): void {
  store().set(KEY_SUBJECTS, JSON.stringify(subjects));
}

export function loadSubjects(): SubjectId[] | null {
  const raw = store().getString(KEY_SUBJECTS);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SubjectId[];
    // Validate each entry
    const valid: SubjectId[] = ['math', 'english', 'chinese', 'science'];
    if (Array.isArray(parsed) && parsed.every((s) => valid.includes(s))) {
      return parsed;
    }
    return ['math', 'english', 'chinese', 'science']; // fallback to all
  } catch {
    return null;
  }
}

// ── Sibling profiles ───────────────────────────────────────────────

export function persistSiblingProfile(index: number, profile: ChildProfile): void {
  store().set(`${KEY_SIBLING_PREFIX}${index}`, JSON.stringify(profile));
  store().set(KEY_CHILD_COUNT, Math.max(index + 1, loadChildCount()));
}

export function loadSiblingProfile(index: number): ChildProfile | null {
  const raw = store().getString(`${KEY_SIBLING_PREFIX}${index}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChildProfile;
  } catch {
    return null;
  }
}

export function loadChildCount(): number {
  const raw = store().getString(KEY_CHILD_COUNT);
  if (!raw) return 1; // default: 1 child (the main one)
  const count = parseInt(raw, 10);
  return isNaN(count) ? 1 : count;
}

// ── Onboarding completion ──────────────────────────────────────────

export function markOnboardingCompleted(): void {
  store().set(KEY_COMPLETED, 'true');
}

export function isOnboardingCompleted(): boolean {
  return store().getString(KEY_COMPLETED) === 'true';
}

// ── First home visit tracking ─────────────────────────────────────

export function isFirstHomeVisit(): boolean {
  const raw = store().getString(KEY_FIRST_HOME_VISIT);
  // Default: true — if the flag was never set, it's the first visit
  return raw === undefined || raw === null || raw === 'true';
}

export function markFirstHomeVisitComplete(): void {
  store().set(KEY_FIRST_HOME_VISIT, 'false');
}

export function resetOnboarding(): void {
  store().delete(KEY_LOCALE);
  store().delete(KEY_GRADE);
  store().delete(KEY_SUBJECTS);
  store().delete(KEY_COMPLETED);
  store().delete(KEY_CHILD_COUNT);
  store().delete(KEY_FIRST_HOME_VISIT);
  // Clear sibling profiles
  const keys = store().getAllKeys();
  keys.forEach((k) => {
    if (k.startsWith(KEY_SIBLING_PREFIX)) {
      store().delete(k);
    }
  });
}

// ── Bulk load ──────────────────────────────────────────────────────

export function loadFullState(): OnboardingState {
  const locale = loadLocale();
  const grade = loadGrade();
  const subjects = loadSubjects();
  const childCount = loadChildCount();

  const siblingProfiles: ChildProfile[] = [];
  for (let i = 1; i < childCount; i++) {
    const profile = loadSiblingProfile(i);
    if (profile) siblingProfiles.push(profile);
  }

  return {
    locale,
    currentChild: {
      grade: grade ?? 'P1',
      subjects: subjects ?? ['math', 'english', 'chinese', 'science'],
    },
    siblingProfiles,
    completed: isOnboardingCompleted(),
  };
}

export function persistPrivacyConsent(consented: boolean): void {
  store().set('privacy_consent', consented);
}

export function persistEulaConsent(consented: boolean): void {
  store().set('eula_consent', consented);
}
