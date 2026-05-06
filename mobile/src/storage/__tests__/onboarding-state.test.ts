/**
 * Onboarding state store tests.
 *
 * Uses the MMKV mock configured in jest.config.js.
 */

import { MMKV } from 'react-native-mmkv';
import {
  persistGrade,
  loadGrade,
  persistSubjects,
  loadSubjects,
  persistLocale,
  loadLocale,
  markOnboardingCompleted,
  isOnboardingCompleted,
  resetOnboarding,
  persistSiblingProfile,
  loadSiblingProfile,
  loadChildCount,
  loadFullState,
} from '../onboarding-state';

describe('onboarding-state store', () => {
  beforeEach(() => {
    MMKV.__clearAllStores();
    // Also reset all module-scoped keys so singleton references are clean
    resetOnboarding();
  });

  describe('locale', () => {
    it('persists and loads locale', () => {
      persistLocale('zh-Hans');
      expect(loadLocale()).toBe('zh-Hans');
    });

    it('defaults to en', () => {
      expect(loadLocale()).toBe('en');
    });

    it('handles invalid locale value', () => {
      persistLocale('fr' as any);
      expect(loadLocale()).toBe('en');
    });
  });

  describe('grade', () => {
    it('persists and loads grade', () => {
      persistGrade('P3');
      expect(loadGrade()).toBe('P3');
    });

    it('returns null when no grade stored', () => {
      expect(loadGrade()).toBeNull();
    });

    it('validates grade value', () => {
      persistGrade('P7' as any);
      expect(loadGrade()).toBeNull();
    });

    it('stores all grades', () => {
      const grades = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] as const;
      for (const g of grades) {
        persistGrade(g);
        expect(loadGrade()).toBe(g);
      }
    });
  });

  describe('subjects', () => {
    it('persists and loads subjects', () => {
      persistSubjects(['math', 'english']);
      expect(loadSubjects()).toEqual(['math', 'english']);
    });

    it('returns null when no subjects stored', () => {
      // Ensure store is clean by persisting then reading different key
      // MMKV singletons cache references so we verify via load after reset
      resetOnboarding();
      expect(loadSubjects()).toBeNull();
    });

    it('handles all subjects', () => {
      persistSubjects(['math', 'english', 'chinese', 'science']);
      expect(loadSubjects()).toEqual(['math', 'english', 'chinese', 'science']);
    });

    it('falls back to all subjects for invalid data', () => {
      persistSubjects(['invalid'] as any);
      // Should return null (or all subjects fallback)
      const result = loadSubjects();
      expect(result).toEqual(['math', 'english', 'chinese', 'science']);
    });
  });

  describe('onboarding completion', () => {
    it('starts not completed', () => {
      expect(isOnboardingCompleted()).toBe(false);
    });

    it('marks as completed', () => {
      markOnboardingCompleted();
      expect(isOnboardingCompleted()).toBe(true);
    });

    it('reset clears completion', () => {
      markOnboardingCompleted();
      resetOnboarding();
      expect(isOnboardingCompleted()).toBe(false);
    });
  });

  describe('sibling profiles', () => {
    it('persists and loads sibling profile', () => {
      persistSiblingProfile(1, { grade: 'P5', subjects: ['math', 'science'] });
      const loaded = loadSiblingProfile(1);
      expect(loaded).toEqual({ grade: 'P5', subjects: ['math', 'science'] });
    });

    it('returns null for non-existent sibling', () => {
      expect(loadSiblingProfile(99)).toBeNull();
    });

    it('tracks child count', () => {
      resetOnboarding();
      expect(loadChildCount()).toBe(1); // default (1 child after reset)
      persistSiblingProfile(0, { grade: 'P2', subjects: ['english'] });
      expect(loadChildCount()).toBe(1); // still 1 because index 0 is ≤ previous max
    });
  });

  describe('reset', () => {
    it('clears all onboarding state', () => {
      persistGrade('P6');
      persistSubjects(['chinese']);
      markOnboardingCompleted();
      persistSiblingProfile(1, { grade: 'P1', subjects: ['math'] });

      resetOnboarding();

      expect(loadGrade()).toBeNull();
      expect(loadSubjects()).toBeNull();
      expect(isOnboardingCompleted()).toBe(false);
      expect(loadSiblingProfile(1)).toBeNull();
    });
  });

  describe('loadFullState', () => {
    it('returns default state when nothing stored', () => {
      const state = loadFullState();
      expect(state.locale).toBe('en');
      expect(state.currentChild.grade).toBe('P1');
      expect(state.currentChild.subjects).toEqual(['math', 'english', 'chinese', 'science']);
      expect(state.siblingProfiles).toEqual([]);
      expect(state.completed).toBe(false);
    });

    it('returns persisted state', () => {
      persistLocale('zh-Hans');
      persistGrade('P4');
      persistSubjects(['math', 'chinese']);
      markOnboardingCompleted();
      persistSiblingProfile(1, { grade: 'P2', subjects: ['english'] });

      // Need to manually set child count for sibling
      const { MMKV: MockMMKV } = require('react-native-mmkv');
      const store = new MockMMKV({ id: 'onboarding' });
      store.set('onboarding.child_count', '2');

      const state = loadFullState();
      expect(state.locale).toBe('zh-Hans');
      expect(state.currentChild.grade).toBe('P4');
      expect(state.currentChild.subjects).toEqual(['math', 'chinese']);
      expect(state.siblingProfiles).toHaveLength(1);
      expect(state.siblingProfiles[0].grade).toBe('P2');
      expect(state.completed).toBe(true);
    });
  });
});
