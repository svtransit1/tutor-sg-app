/**
 * Onboarding persistence layer.
 *
 * Abstract storage interface with MMKV (production) and in-memory (test) implementations.
 * All onboarding state is stored under a single MMKV key for atomic reads/writes.
 */

import { OnboardingState } from './types';

const STORAGE_KEY = 'onboarding_state_v1';

export interface OnboardingStorage {
  load(): OnboardingState | null;
  save(state: OnboardingState): void;
  clear(): void;
}

/**
 * MMKV-backed storage (production).
 * Uses react-native-mmkv for fast, encrypted key-value storage.
 */
export class MMKVOnboardingStorage implements OnboardingStorage {
  private mmkv: import('react-native-mmkv').MMKV;

  constructor() {
    const { MMKV } = require('react-native-mmkv');
    this.mmkv = new MMKV();
  }

  load(): OnboardingState | null {
    const raw = this.mmkv.getString(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as OnboardingState;
    } catch {
      return null; // corrupted — treat as fresh
    }
  }

  save(state: OnboardingState): void {
    this.mmkv.set(STORAGE_KEY, JSON.stringify(state));
  }

  clear(): void {
    this.mmkv.delete(STORAGE_KEY);
  }
}

/**
 * In-memory storage (tests / dev).
 */
export class InMemoryOnboardingStorage implements OnboardingStorage {
  private store: Map<string, string> = new Map();

  constructor(private _key: string = STORAGE_KEY) {}

  load(): OnboardingState | null {
    const raw = this.store.get(this._key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as OnboardingState;
    } catch {
      return null;
    }
  }

  save(state: OnboardingState): void {
    this.store.set(this._key, JSON.stringify(state));
  }

  clear(): void {
    this.store.delete(this._key);
  }

  // Test helper: seed initial state
  seed(state: OnboardingState): void {
    this.store.set(this._key, JSON.stringify(state));
  }
}
