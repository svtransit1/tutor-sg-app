/**
 * Unit tests for the onboarding state machine.
 *
 * Tests every forward and backward transition, edge cases,
 * completion, and resume-from-persisted-state logic.
 */

import {
  transition,
  completeOnboarding,
  resumeOnboarding,
  isOnboardingComplete,
} from '../machine';
import { initialOnboardingState, ONBOARDING_STEPS, STEP_CONFIG } from '../types';
import type { OnboardingState } from '../types';

function freshState(): OnboardingState {
  const s = initialOnboardingState();
  s.steps['welcome'] = 'in_progress';
  return s;
}

// ── Forward transitions ───────────────────────────────────────────

describe('forward transitions (next)', () => {
  it('advances from welcome to consent', () => {
    const s = freshState();
    const result = transition(s, 'next');
    expect(result).not.toBeNull();
    expect(result!.currentStep).toBe('consent');
    expect(result!.steps['welcome']).toBe('completed');
    expect(result!.steps['consent']).toBe('in_progress');
  });

  it('advances from consent to device-tier', () => {
    const s = freshState();
    const s2 = transition(s, 'next')!;
    const result = transition(s2, 'next');
    expect(result).not.toBeNull();
    expect(result!.currentStep).toBe('device-tier');
    expect(result!.steps['consent']).toBe('completed');
  });

  it('advances from device-tier to model-download', () => {
    const s = freshState();
    const s2 = transition(s, 'next')!;
    const s3 = transition(s2, 'next')!;
    const result = transition(s3, 'next');
    expect(result).not.toBeNull();
    expect(result!.currentStep).toBe('model-download');
    expect(result!.steps['device-tier']).toBe('completed');
  });

  it('advances from model-download to kid-profile', () => {
    const s = freshState();
    let curr = s;
    for (let i = 0; i < 3; i++) curr = transition(curr, 'next')!;
    const result = transition(curr, 'next');
    expect(result).not.toBeNull();
    expect(result!.currentStep).toBe('kid-profile');
  });

  it('advances from kid-profile to first-homework', () => {
    const s = freshState();
    let curr = s;
    for (let i = 0; i < 4; i++) curr = transition(curr, 'next')!;
    const result = transition(curr, 'next');
    expect(result).not.toBeNull();
    expect(result!.currentStep).toBe('first-homework');
  });

  it('advances from first-homework to done', () => {
    const s = freshState();
    let curr = s;
    for (let i = 0; i < 5; i++) curr = transition(curr, 'next')!;
    const result = transition(curr, 'next');
    expect(result).not.toBeNull();
    expect(result!.currentStep).toBe('done');
    expect(result!.steps['first-homework']).toBe('completed');
    expect(result!.steps['done']).toBe('in_progress');
  });

  it('cannot advance past done', () => {
    const s = freshState();
    let curr = s;
    for (let i = 0; i < ONBOARDING_STEPS.length; i++) {
      const next = transition(curr, 'next');
      if (next) curr = next;
    }
    const result = transition(curr, 'next');
    expect(result).toBeNull();
  });
});

// ── Backward transitions ──────────────────────────────────────────

describe('back transitions (back)', () => {
  it('can go back from consent to welcome', () => {
    const s = freshState();
    const s2 = transition(s, 'next')!;
    const result = transition(s2, 'back');
    expect(result).not.toBeNull();
    expect(result!.currentStep).toBe('welcome');
    expect(result!.steps['consent']).toBe('not_started');
    expect(result!.steps['welcome']).toBe('in_progress');
  });

  it('can go back from device-tier to consent', () => {
    const s = freshState();
    const s2 = transition(s, 'next')!;
    const s3 = transition(s2, 'next')!;
    const result = transition(s3, 'back');
    expect(result).not.toBeNull();
    expect(result!.currentStep).toBe('consent');
    expect(result!.steps['device-tier']).toBe('not_started');
  });

  it('cannot go back from model-download (non-reversible)', () => {
    const s = freshState();
    let curr = s;
    for (let i = 0; i < 3; i++) curr = transition(curr, 'next')!;
    expect(curr.currentStep).toBe('model-download');
    const result = transition(curr, 'back');
    expect(result).toBeNull();
  });

  it('cannot go back from kid-profile (non-reversible)', () => {
    const s = freshState();
    let curr = s;
    for (let i = 0; i < 4; i++) curr = transition(curr, 'next')!;
    expect(curr.currentStep).toBe('kid-profile');
    const result = transition(curr, 'back');
    expect(result).toBeNull();
  });

  it('cannot go back from welcome', () => {
    const s = freshState();
    const result = transition(s, 'back');
    expect(result).toBeNull();
  });

  it('cannot go back from first-homework (irreversible)', () => {
    const s = freshState();
    let curr = s;
    for (let i = 0; i < 5; i++) curr = transition(curr, 'next')!;
    const result = transition(curr, 'back');
    expect(result).toBeNull();
  });

  it('cannot go back from done (irreversible)', () => {
    const s = freshState();
    let curr = s;
    for (let i = 0; i < ONBOARDING_STEPS.length; i++) {
      const next = transition(curr, 'next');
      if (next) curr = next;
    }
    const result = transition(curr, 'back');
    expect(result).toBeNull();
  });
});

// ── Back-navigation reversibility rules ───────────────────────────

describe('back-navigation reversibility', () => {
  it('welcome is reversible', () => {
    expect(STEP_CONFIG['welcome'].reversible).toBe(true);
  });

  it('consent is reversible', () => {
    expect(STEP_CONFIG['consent'].reversible).toBe(true);
  });

  it('device-tier is reversible', () => {
    expect(STEP_CONFIG['device-tier'].reversible).toBe(true);
  });

  it('model-download is NOT reversible', () => {
    expect(STEP_CONFIG['model-download'].reversible).toBe(false);
  });

  it('kid-profile is NOT reversible', () => {
    expect(STEP_CONFIG['kid-profile'].reversible).toBe(false);
  });

  it('first-homework is NOT reversible', () => {
    expect(STEP_CONFIG['first-homework'].reversible).toBe(false);
  });

  it('done is NOT reversible', () => {
    expect(STEP_CONFIG['done'].reversible).toBe(false);
  });
});

// ── Complete onboarding ──────────────────────────────────────────

describe('completeOnboarding', () => {
  it('marks all steps completed and sets currentStep to done', () => {
    const s = freshState();
    const result = completeOnboarding(s);
    expect(result.currentStep).toBe('done');
    for (const step of ONBOARDING_STEPS) {
      expect(result.steps[step]).toBe('completed');
    }
  });

  it('preserves existing progress data', () => {
    const s = freshState();
    s.deviceTier = 'high';
    s.kidName = 'Alice';
    const result = completeOnboarding(s);
    expect(result.deviceTier).toBe('high');
    expect(result.kidName).toBe('Alice');
  });
});

// ── isOnboardingComplete ──────────────────────────────────────────

describe('isOnboardingComplete', () => {
  it('returns false for fresh state', () => {
    expect(isOnboardingComplete(freshState())).toBe(false);
  });

  it('returns false for mid-onboarding state', () => {
    const s = freshState();
    const s2 = transition(s, 'next')!;
    expect(isOnboardingComplete(s2)).toBe(false);
  });

  it('returns true when currentStep is done', () => {
    const s = completeOnboarding(freshState());
    expect(isOnboardingComplete(s)).toBe(true);
  });

  it('returns true when done step is completed', () => {
    const s = freshState();
    s.steps['done'] = 'completed';
    expect(isOnboardingComplete(s)).toBe(true);
  });
});

// ── Resume from persisted state ──────────────────────────────────

describe('resumeOnboarding', () => {
  it('starts at welcome for empty state', () => {
    const result = resumeOnboarding({});
    expect(result.currentStep).toBe('welcome');
    expect(result.steps['welcome']).toBe('in_progress');
  });

  it('starts at welcome for null-ish state', () => {
    const result = resumeOnboarding({} as any);
    expect(result.currentStep).toBe('welcome');
  });

  it('resumes at first incomplete step', () => {
    const persisted: Partial<OnboardingState> = {
      currentStep: 'device-tier',
      steps: {
        welcome: 'completed',
        consent: 'completed',
        'device-tier': 'not_started',
        'model-download': 'not_started',
        'kid-profile': 'not_started',
        'first-homework': 'not_started',
        done: 'not_started',
      },
    };
    const result = resumeOnboarding(persisted);
    expect(result.currentStep).toBe('device-tier');
    expect(result.steps['device-tier']).toBe('in_progress');
  });

  it('marks all steps done if all completed', () => {
    const persisted: Partial<OnboardingState> = {
      currentStep: 'model-download',
      steps: {
        welcome: 'completed',
        consent: 'completed',
        'device-tier': 'completed',
        'model-download': 'completed',
        'kid-profile': 'completed',
        'first-homework': 'completed',
        done: 'completed',
      },
    };
    const result = resumeOnboarding(persisted);
    expect(result.currentStep).toBe('done');
  });

  it('preserves progress data from persisted state', () => {
    const persisted: Partial<OnboardingState> = {
      currentStep: 'kid-profile',
      steps: {
        welcome: 'completed',
        consent: 'completed',
        'device-tier': 'completed',
        'model-download': 'completed',
        'kid-profile': 'not_started',
        'first-homework': 'not_started',
        done: 'not_started',
      },
      deviceTier: 'high',
      kidName: 'Bob',
      kidLevel: 'P3',
      kidLanguage: 'en',
    };
    const result = resumeOnboarding(persisted);
    expect(result.deviceTier).toBe('high');
    expect(result.kidName).toBe('Bob');
    expect(result.kidLevel).toBe('P3');
    expect(result.kidLanguage).toBe('en');
  });

  it('fills in missing steps record', () => {
    const persisted: Partial<OnboardingState> = {
      currentStep: 'consent',
      steps: {
        welcome: 'completed',
        // missing other steps
      } as any,
    };
    const result = resumeOnboarding(persisted);
    for (const step of ONBOARDING_STEPS) {
      expect(result.steps[step]).toBeDefined();
    }
    expect(result.currentStep).toBe('consent');
  });
});

// ── Transition immutability ──────────────────────────────────────

describe('transition immutability', () => {
  it('does not mutate the input state', () => {
    const s = freshState();
    const original = JSON.stringify(s);
    transition(s, 'next');
    expect(JSON.stringify(s)).toBe(original);
  });

  it('returns a new state object on success', () => {
    const s = freshState();
    const result = transition(s, 'next');
    expect(result).not.toBe(s);
  });
});

// ── Step order integrity ─────────────────────────────────────────

describe('step order', () => {
  it('has exactly 7 steps', () => {
    expect(ONBOARDING_STEPS).toHaveLength(7);
  });

  it('ends with done', () => {
    expect(ONBOARDING_STEPS[6]).toBe('done');
  });

  it('starts with welcome', () => {
    expect(ONBOARDING_STEPS[0]).toBe('welcome');
  });

  it('has config for every step', () => {
    for (const step of ONBOARDING_STEPS) {
      expect(STEP_CONFIG[step]).toBeDefined();
    }
  });
});
