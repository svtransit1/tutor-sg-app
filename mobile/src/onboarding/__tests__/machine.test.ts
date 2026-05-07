/**
 * Tests for the onboarding state machine — pure transition functions.
 */

import {
  goNext,
  goBack,
  completeOnboarding,
  resumeOnboarding,
  getCurrentRoute,
  getStepNumber,
  canGoBackFrom,
  canGoNextFrom,
  isOnboardingComplete,
} from '../machine';
import {
  initialOnboardingState,
  ONBOARDING_STEPS,
  STEP_CONFIG,
} from '../types';
import type { OnboardingStep } from '../types';

// ── Helpers ────────────────────────────────────────────────────────

function freshState() {
  const s = initialOnboardingState();
  s.steps.splash = 'in_progress';
  return s;
}

function advanceToStep(state: ReturnType<typeof freshState>, target: OnboardingStep) {
  let current = state;
  while (current.currentStep !== target) {
    const next = goNext(current);
    if (!next) break;
    current = next;
  }
  return current;
}

// ── Flow order ─────────────────────────────────────────────────────

describe('onboarding state machine — flow order', () => {
  it('starts at splash', () => {
    const state = freshState();
    expect(state.currentStep).toBe('splash');
    expect(state.steps.splash).toBe('in_progress');
  });

  it('follows the correct step order', () => {
    let state = freshState();
    const expectedOrder: OnboardingStep[] = [
      'splash',
      'lang_pick',
      'age_gate',
      'parent_pin_setup',
      'parent_sign_in',
      'grade_subject_pick',
      'sibling_prompt',
      'device_tier_result',
      'permission_primer',
      'model_download',
      'ready_landing',
      'done',
    ];

    for (const expected of expectedOrder) {
      expect(state.currentStep).toBe(expected);
      const next = goNext(state);
      if (expected !== 'done') {
        expect(next).not.toBeNull();
        state = next!;
      }
    }

    // Should not advance past done
    expect(state.currentStep).toBe('done');
    expect(goNext(state)).toBeNull();
  });

  it('marks each step as completed when advancing', () => {
    const state = freshState();
    expect(state.steps.splash).toBe('in_progress');

    const step2 = goNext(state)!;
    expect(step2.steps.splash).toBe('completed');
    expect(step2.steps.lang_pick).toBe('in_progress');
  });
});

// ── goNext ──────────────────────────────────────────────────────────

describe('goNext', () => {
  it('returns null when at final step', () => {
    const state = freshState();
    const final = advanceToStep(state, 'done');
    expect(goNext(final)).toBeNull();
  });

  it('returns null for invalid state', () => {
    const state = freshState();
    (state as any).currentStep = 'invalid_step';
    expect(goNext(state)).toBeNull();
  });

  it('moves from splash to lang_pick', () => {
    const state = freshState();
    const next = goNext(state);
    expect(next).not.toBeNull();
    expect(next!.currentStep).toBe('lang_pick');
  });

  it('moves from ready_landing to done and marks complete', () => {
    const state = advanceToStep(freshState(), 'ready_landing');
    const next = goNext(state);
    expect(next).not.toBeNull();
    expect(next!.currentStep).toBe('done');
    expect(next!.steps.ready_landing).toBe('completed');
    expect(next!.steps.done).toBe('in_progress');
  });
});

// ── goBack ──────────────────────────────────────────────────────────

describe('goBack', () => {
  it('returns null from splash (first step)', () => {
    expect(goBack(freshState())).toBeNull();
  });

  it('returns null from done', () => {
    const state = advanceToStep(freshState(), 'done');
    expect(goBack(state)).toBeNull();
  });

  it('returns null from a non-reversible step', () => {
    // Move to parent_pin_setup (non-reversible)
    const state = advanceToStep(freshState(), 'parent_pin_setup');
    expect(goBack(state)).toBeNull();
  });

  it('goes back from age_gate to lang_pick', () => {
    const state = advanceToStep(freshState(), 'age_gate');
    const prev = goBack(state);
    expect(prev).not.toBeNull();
    expect(prev!.currentStep).toBe('lang_pick');
    expect(prev!.steps.lang_pick).toBe('in_progress');
    expect(prev!.steps.age_gate).toBe('not_started');
  });

  it('goes back from lang_pick but splash is non-reversible', () => {
    const state = advanceToStep(freshState(), 'lang_pick');
    const prev = goBack(state);
    // splash is non-reversible, so goBack should return null
    expect(prev).toBeNull();
  });

  it('returns null from lang_pick since splash is non-reversible', () => {
    // splash is non-reversible, so going back from lang_pick should fail
    const state = advanceToStep(freshState(), 'lang_pick');
    expect(goBack(state)).toBeNull();
  });
});

// ── completeOnboarding ─────────────────────────────────────────────

describe('completeOnboarding', () => {
  it('marks all steps as completed and transitions to done', () => {
    const state = freshState();
    const completed = completeOnboarding(state);
    expect(completed.currentStep).toBe('done');
    for (const step of ONBOARDING_STEPS) {
      expect(completed.steps[step]).toBe('completed');
    }
  });
});

// ── isOnboardingComplete ───────────────────────────────────────────

describe('isOnboardingComplete', () => {
  it('returns false for fresh state', () => {
    expect(isOnboardingComplete(freshState())).toBe(false);
  });

  it('returns true after completeOnboarding', () => {
    expect(isOnboardingComplete(completeOnboarding(freshState()))).toBe(true);
  });

  it('returns true when currentStep is done', () => {
    const state = advanceToStep(freshState(), 'done');
    expect(isOnboardingComplete(state)).toBe(true);
  });
});

// ── resumeOnboarding ───────────────────────────────────────────────

describe('resumeOnboarding', () => {
  it('returns fresh state for empty input', () => {
    const resumed = resumeOnboarding({});
    expect(resumed.currentStep).toBe('splash');
    expect(resumed.steps.splash).toBe('in_progress');
  });

  it('returns fresh state for null input', () => {
    const resumed = resumeOnboarding(null as any);
    expect(resumed.currentStep).toBe('splash');
  });

  it('resumes at first incomplete step', () => {
    const persisted = {
      currentStep: undefined as any,
      steps: {
        splash: 'completed',
        lang_pick: 'completed',
        age_gate: 'completed',
        parent_pin_setup: 'completed',
        parent_sign_in: 'completed',
        grade_subject_pick: 'not_started',
        sibling_prompt: 'not_started',
        device_tier_result: 'not_started',
        permission_primer: 'not_started',
        model_download: 'not_started',
        ready_landing: 'not_started',
        done: 'not_started',
      } as any,
    };
    const resumed = resumeOnboarding(persisted);
    expect(resumed.currentStep).toBe('grade_subject_pick');
    expect(resumed.steps.grade_subject_pick).toBe('in_progress');
  });

  it('resumes at done when all completed', () => {
    const allCompleted = Object.fromEntries(
      ONBOARDING_STEPS.map((s) => [s, 'completed']),
    );
    const persisted = { currentStep: undefined, steps: allCompleted as any };
    const resumed = resumeOnboarding(persisted);
    expect(resumed.currentStep).toBe('done');
  });

  it('merges locale/grade/subjects from persisted state', () => {
    const persisted = {
      currentStep: undefined as any,
      steps: {
        splash: 'completed',
        lang_pick: 'not_started',
        age_gate: 'not_started',
        parent_pin_setup: 'not_started',
        parent_sign_in: 'not_started',
        grade_subject_pick: 'not_started',
        sibling_prompt: 'not_started',
        device_tier_result: 'not_started',
        permission_primer: 'not_started',
        model_download: 'not_started',
        ready_landing: 'not_started',
        done: 'not_started',
      } as any,
      locale: 'zh-Hans' as const,
      grade: 'P3' as const,
      subjects: ['math', 'english'] as any,
    };
    const resumed = resumeOnboarding(persisted);
    expect(resumed.locale).toBe('zh-Hans');
    expect(resumed.grade).toBe('P3');
    expect(resumed.subjects).toEqual(['math', 'english']);
  });

  it('fills in missing steps', () => {
    const persisted = {
      currentStep: undefined as any,
      steps: { splash: 'completed' } as any,
    };
    const resumed = resumeOnboarding(persisted);
    // Should have filled all steps
    for (const step of ONBOARDING_STEPS) {
      expect(resumed.steps[step]).toBeDefined();
    }
  });
});

// ── getCurrentRoute ────────────────────────────────────────────────

describe('getCurrentRoute', () => {
  it('returns correct route for each step', () => {
    const routeMap: Record<OnboardingStep, string> = {
      splash: '/(onboarding)/splash',
      lang_pick: '/(onboarding)/lang-pick',
      age_gate: '/(onboarding)/age-gate',
      parent_pin_setup: '/(onboarding)/parent-pin-setup',
      grade_subject_pick: '/(onboarding)/grade-subject-pick',
      sibling_prompt: '/(onboarding)/sibling-prompt',
      device_tier_result: '/(onboarding)/device-tier-result',
      permission_primer: '/(onboarding)/permission-primer',
      model_download: '/(onboarding)/model-download',
      ready_landing: '/(onboarding)/ready-landing',
      done: '/(onboarding)/splash', // done has no screen, fallback to splash
    };

    for (const [step, expectedRoute] of Object.entries(routeMap)) {
      const state = freshState();
      state.currentStep = step as OnboardingStep;
      state.steps[step as OnboardingStep] = 'in_progress';
      expect(getCurrentRoute(state)).toBe(expectedRoute);
    }
  });
});

// ── getStepNumber ──────────────────────────────────────────────────

describe('getStepNumber', () => {
  it('returns 1-indexed display step (excluding splash and done)', () => {
    const expectedSteps = ONBOARDING_STEPS.filter(
      (s) => s !== 'splash' && s !== 'done',
    );

    expectedSteps.forEach((step, idx) => {
      const { current, total } = getStepNumber(step);
      expect(current).toBe(idx + 1);
      expect(total).toBe(expectedSteps.length);
    });
  });

  it('returns 1 for splash (display fallback)', () => {
    const { current } = getStepNumber('splash');
    expect(current).toBe(1);
  });
});

// ── canGoBackFrom / canGoNextFrom ──────────────────────────────────

describe('canGoBackFrom', () => {
  it('returns false for splash', () => {
    expect(canGoBackFrom(freshState())).toBe(false);
  });

  it('returns false for non-reversible steps', () => {
    const state = advanceToStep(freshState(), 'parent_pin_setup');
    expect(canGoBackFrom(state)).toBe(false);
  });

  it('returns true for reversible steps (lang_pick, age_gate)', () => {
    const state = advanceToStep(freshState(), 'lang_pick');
    expect(canGoBackFrom(state)).toBe(true);

    const ageState = advanceToStep(freshState(), 'age_gate');
    expect(canGoBackFrom(ageState)).toBe(true);
  });
});

describe('canGoNextFrom', () => {
  it('returns true for all steps except done', () => {
    for (const step of ONBOARDING_STEPS) {
      const state = freshState();
      state.currentStep = step;
      if (step === 'done') {
        expect(canGoNextFrom(state)).toBe(false);
      } else {
        expect(canGoNextFrom(state)).toBe(true);
      }
    }
  });
});

// ── Edge cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles complete -> resume -> complete round-trip', () => {
    const original = freshState();
    const completed = completeOnboarding(original);
    expect(isOnboardingComplete(completed)).toBe(true);

    const resumed = resumeOnboarding(completed);
    expect(resumed.currentStep).toBe('done');
    expect(isOnboardingComplete(resumed)).toBe(true);
  });

  it('handles partial resume: mid-way through flow', () => {
    const state = freshState();
    // Advance to sibling_prompt
    const mid = advanceToStep(state, 'sibling_prompt');
    expect(mid.currentStep).toBe('sibling_prompt');

    // Simulate resume from persisted state
    const resumed = resumeOnboarding(mid);
    expect(resumed.currentStep).toBe('sibling_prompt');
    expect(resumed.steps.splash).toBe('completed');
    expect(resumed.steps.lang_pick).toBe('completed');
    expect(resumed.steps.age_gate).toBe('completed');
    expect(resumed.steps.parent_pin_setup).toBe('completed');
    expect(resumed.steps.grade_subject_pick).toBe('completed');
    expect(resumed.steps.sibling_prompt).toBe('in_progress');
  });

  it('does not allow goBack from non-reversible steps even with available reversible parent', () => {
    // device_tier_result is non-reversible
    const state = advanceToStep(freshState(), 'device_tier_result');
    expect(canGoBackFrom(state)).toBe(false);
    expect(goBack(state)).toBeNull();
  });

  it('allows goBack from age_gate to lang_pick only (cannot go past lang_pick since splash is non-reversible)', () => {
    const state = advanceToStep(freshState(), 'age_gate');
    const back = goBack(state);
    expect(back).not.toBeNull();
    expect(back!.currentStep).toBe('lang_pick');
    // lang_pick is reversible, but there's no reversible step before it (splash is non-reversible)
    const back2 = goBack(back!);
    expect(back2).toBeNull();
  });
});
