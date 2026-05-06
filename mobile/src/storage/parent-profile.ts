/**
 * Parent profile storage — MMKV-backed store.
 *
 * Persists the parent's display name, language preference,
 * and a list of child profiles (up to 4 for family plan).
 *
 * Extends the onboarding-state pattern with richer child profiles
 * that include name + grade + language preference.
 *
 * Kid-safe: no data leaves the device.
 */

import { MMKV } from 'react-native-mmkv';
import type { Grade } from './onboarding-state';

// ── Types ──────────────────────────────────────────────────────────

export interface ChildProfileFull {
  /** Unique ID for this child profile (UUID). */
  id: string;
  /** Display name (e.g. "Ming"). */
  name: string;
  /** School level P1–P6. */
  grade: Grade;
  /** Language preference for this child's sessions. */
  language: 'en' | 'zh-Hans';
}

export interface ParentProfile {
  /** Parent's display name. */
  displayName: string;
  /** Parent's UI language preference. */
  language: 'en' | 'zh-Hans';
  /** Child profiles, min 1, max 4. */
  children: ChildProfileFull[];
}

// ── Constants ──────────────────────────────────────────────────────

const STORAGE_ID = 'parent_profile';
const KEY_DISPLAY_NAME = 'parent.display_name';
const KEY_LANGUAGE = 'parent.language';
const KEY_CHILDREN = 'parent.children';

let _store: MMKV | null = null;

function store(): MMKV {
  if (!_store) _store = new MMKV({ id: STORAGE_ID });
  return _store;
}

// ── Parent display name ────────────────────────────────────────────

export function persistParentDisplayName(name: string): void {
  store().set(KEY_DISPLAY_NAME, name);
}

export function loadParentDisplayName(): string {
  return store().getString(KEY_DISPLAY_NAME) ?? '';
}

// ── Parent language ────────────────────────────────────────────────

export function persistParentLanguage(lang: 'en' | 'zh-Hans'): void {
  store().set(KEY_LANGUAGE, lang);
}

export function loadParentLanguage(): 'en' | 'zh-Hans' {
  const raw = store().getString(KEY_LANGUAGE);
  if (raw === 'zh-Hans') return 'zh-Hans';
  return 'en';
}

// ── Child profiles ─────────────────────────────────────────────────

export function persistChildren(children: ChildProfileFull[]): void {
  store().set(KEY_CHILDREN, JSON.stringify(children));
}

export function loadChildren(): ChildProfileFull[] {
  const raw = store().getString(KEY_CHILDREN);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ChildProfileFull[];
    return [];
  } catch {
    return [];
  }
}

export function addChild(child: ChildProfileFull): void {
  const children = loadChildren();
  children.push(child);
  persistChildren(children);
}

export function updateChild(id: string, updates: Partial<ChildProfileFull>): void {
  const children = loadChildren();
  const index = children.findIndex((c) => c.id === id);
  if (index === -1) return;
  children[index] = { ...children[index], ...updates };
  persistChildren(children);
}

export function removeChild(id: string): void {
  const children = loadChildren();
  persistChildren(children.filter((c) => c.id !== id));
}

// ── Bulk load / save ───────────────────────────────────────────────

export function loadParentProfile(): ParentProfile {
  return {
    displayName: loadParentDisplayName(),
    language: loadParentLanguage(),
    children: loadChildren(),
  };
}

export function saveParentProfile(profile: ParentProfile): void {
  persistParentDisplayName(profile.displayName);
  persistParentLanguage(profile.language);
  persistChildren(profile.children);
}

// ── Reset ──────────────────────────────────────────────────────────

export function resetParentProfile(): void {
  store().delete(KEY_DISPLAY_NAME);
  store().delete(KEY_LANGUAGE);
  store().delete(KEY_CHILDREN);
}
