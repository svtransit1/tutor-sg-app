/**
 * GradePickScreen — Onboarding step 4/7 smoke tests.
 *
 * Checks:
 * - Renders without crash
 * - Shows OnboardingProgressIndicator step 4/7
 * - Shows grade chips P1–P6
 * - Shows all 4 subject toggle chips
 * - Shows "All subjects" meta-toggle
 * - Continue button disabled by default
 * - Continue button enabled after selecting a grade
 * - Subject toggles work (all ON by default, can deselect)
 * - "All subjects" toggle selects/deselects all
 * - Persistence wired on continue
 * - Accessibility labels present
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GradePickScreen from '../grade-pick';
import * as OnboardingState from '@/storage/onboarding-state';

// ── Mocks ──────────────────────────────────────────────────────────

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => inset,
  };
});

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params && params.grade) return `${key}:${params.grade}`;
      if (params && params.subject) return `${key}:${params.subject}`;
      if (params && params.state) return `${key}:${params.state}`;
      if (params && params.current) return `Step ${params.current} of ${params.total}`;
      if (params && params.defaultValue) return params.defaultValue as string;
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

// Mock expo-router
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock OnboardingProgressIndicator
jest.mock('@/components/OnboardingProgressIndicator', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) =>
    React.createElement(Text, { testID: 'progress-indicator' }, `Step ${currentStep} of ${totalSteps}`);
});

// Spy on persistence functions (they're no-ops in test via MMKV mock)
const persistGradeSpy = jest.spyOn(OnboardingState, 'persistGrade');
const persistSubjectsSpy = jest.spyOn(OnboardingState, 'persistSubjects');

// ── Tests ──────────────────────────────────────────────────────────

describe('GradePickScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crash', () => {
    const { toJSON } = render(<GradePickScreen />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows progress indicator step 4 of 7', () => {
    const { getByTestId } = render(<GradePickScreen />);
    expect(getByTestId('progress-indicator')).toBeTruthy();
    expect(getByTestId('progress-indicator').props.children).toContain('Step 4');
    expect(getByTestId('progress-indicator').props.children).toContain('7');
  });

  it('renders title', () => {
    const { getByText } = render(<GradePickScreen />);
    expect(getByText('onboarding.gradePick.title')).toBeTruthy();
  });

  it('renders all 6 grade chips', () => {
    const { getByText } = render(<GradePickScreen />);
    const grades = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
    for (const grade of grades) {
      expect(getByText(`onboarding.gradePick.grade${grade}`)).toBeTruthy();
    }
  });

  it('renders all 4 subject toggle chips', () => {
    const { getByText } = render(<GradePickScreen />);
    expect(getByText('onboarding.gradePick.subjectMath')).toBeTruthy();
    expect(getByText('onboarding.gradePick.subjectEnglish')).toBeTruthy();
    expect(getByText('onboarding.gradePick.subjectChinese')).toBeTruthy();
    expect(getByText('onboarding.gradePick.subjectScience')).toBeTruthy();
  });

  it('renders "All subjects" meta-toggle', () => {
    const { getByText } = render(<GradePickScreen />);
    expect(getByText('onboarding.gradePick.allSubjects')).toBeTruthy();
  });

  it('renders subject hint text', () => {
    const { getByText } = render(<GradePickScreen />);
    expect(getByText('onboarding.gradePick.subjectHint')).toBeTruthy();
  });

  it('renders continue button', () => {
    const { getByText } = render(<GradePickScreen />);
    expect(getByText('onboarding.gradePick.continue')).toBeTruthy();
  });

  it('continue button is disabled when no grade selected', () => {
    const { getByText } = render(<GradePickScreen />);
    const button = getByText('onboarding.gradePick.continue').parent;
    expect(button?.props?.accessibilityState?.disabled).toBe(true);
  });

  it('continue button is enabled after selecting a grade', () => {
    const { getByText } = render(<GradePickScreen />);

    const p3Button = getByText('onboarding.gradePick.gradeP3').parent;
    fireEvent.press(p3Button!);

    const button = getByText('onboarding.gradePick.continue').parent;
    expect(button?.props?.accessibilityState?.disabled).toBe(false);
  });

  it('does not navigate when continue pressed with no grade selected', () => {
    const { getByText } = render(<GradePickScreen />);
    const button = getByText('onboarding.gradePick.continue').parent;
    fireEvent.press(button!);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('persists grade and subjects and navigates when continue pressed with grade selected', () => {
    const { getByText } = render(<GradePickScreen />);

    // Select grade P3
    const p3Button = getByText('onboarding.gradePick.gradeP3').parent;
    fireEvent.press(p3Button!);

    // Press continue
    const button = getByText('onboarding.gradePick.continue').parent;
    fireEvent.press(button!);

    expect(persistGradeSpy).toHaveBeenCalledWith('P3');
    expect(persistSubjectsSpy).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/(onboarding)/parent-sign-in');
  });

  it('all subjects are selected by default (checked accessibility state)', () => {
    const { getAllByLabelText } = render(<GradePickScreen />);
    // Find all subject toggle chips via accessibilityLabel pattern
    const subjectChips = getAllByLabelText(/Math|English|Chinese|Science/);
    expect(subjectChips.length).toBe(4);
    subjectChips.forEach((chip) => {
      expect(chip.props.accessibilityState?.checked).toBe(true);
    });
  });

  it('toggling a subject deselects it', () => {
    const { getAllByLabelText } = render(<GradePickScreen />);
    const subjectChips = getAllByLabelText(/Math|English|Chinese|Science/);

    // Deselect first subject (math)
    fireEvent.press(subjectChips[0]);

    const updatedChips = getAllByLabelText(/Math|English|Chinese|Science/);
    expect(updatedChips[0].props.accessibilityState?.checked).toBe(false);
  });

  it('toggling a subject that was deselected selects it again', () => {
    const { getAllByLabelText } = render(<GradePickScreen />);
    const subjectChips = getAllByLabelText(/Math|English|Chinese|Science/);

    // Deselect math
    fireEvent.press(subjectChips[0]);
    // Re-select math
    fireEvent.press(subjectChips[0]);

    const updatedChips = getAllByLabelText(/Math|English|Chinese|Science/);
    expect(updatedChips[0].props.accessibilityState?.checked).toBe(true);
  });

  it('"All subjects" meta-toggle toggles all subjects on/off', () => {
    const { getByText, getAllByLabelText } = render(<GradePickScreen />);

    // Verify all subjects are on by default
    let subjectChips = getAllByLabelText(/Math|English|Chinese|Science/);
    subjectChips.forEach((chip) => {
      expect(chip.props.accessibilityState?.checked).toBe(true);
    });

    // Tap "All subjects" to deselect all (keeps math as sole selected)
    const allToggle = getByText('onboarding.gradePick.allSubjects').parent;
    fireEvent.press(allToggle!);

    // Verify only math remains selected (guaranteed minimum 1 subject)
    subjectChips = getAllByLabelText(/Math|English|Chinese|Science/);
    expect(subjectChips[0].props.accessibilityState?.checked).toBe(true); // Math stays
    expect(subjectChips[1].props.accessibilityState?.checked).toBe(false); // English off
    expect(subjectChips[2].props.accessibilityState?.checked).toBe(false); // Chinese off
    expect(subjectChips[3].props.accessibilityState?.checked).toBe(false); // Science off

    // Tap "All subjects" again to re-select all
    fireEvent.press(allToggle!);

    subjectChips = getAllByLabelText(/Math|English|Chinese|Science/);
    subjectChips.forEach((chip) => {
      expect(chip.props.accessibilityState?.checked).toBe(true);
    });
  });

  it('"All subjects" toggle shows tri-state indicator', () => {
    const { getByText, getAllByLabelText } = render(<GradePickScreen />);

    // Default: all selected → checkmark ✓
    let allToggle = getByText('onboarding.gradePick.allSubjects').parent;
    let checkText = allToggle!.children[allToggle!.children.length - 1] as any;
    expect(checkText.props.children).toBe('✓');

    // Deselect just English
    const englishChip = getAllByLabelText(/English/)[0];
    fireEvent.press(englishChip);

    // After partial deselect: mixed state ◐
    allToggle = getByText('onboarding.gradePick.allSubjects').parent;
    checkText = allToggle!.children[allToggle!.children.length - 1] as any;
    expect(checkText.props.children).toBe('◐');
  });

  it('prevents deselecting all subjects (at least 1 must remain)', () => {
    const { getAllByLabelText } = render(<GradePickScreen />);

    // Deselect three subjects one by one
    const subjectChips = getAllByLabelText(/Math|English|Chinese|Science/);

    fireEvent.press(subjectChips[0]); // deselect math
    fireEvent.press(subjectChips[1]); // deselect english
    fireEvent.press(subjectChips[2]); // deselect chinese
    fireEvent.press(subjectChips[3]); // try to deselect science (last one)

    // Science should still be selected (prevented from deselecting last subject)
    const updatedChips = getAllByLabelText(/Math|English|Chinese|Science/);
    expect(updatedChips[3].props.accessibilityState?.checked).toBe(true);
  });

  it('grade chips have accessibility labels and radio role', () => {
    const { getByText } = render(<GradePickScreen />);
    const grades = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
    for (const grade of grades) {
      const chip = getByText(`onboarding.gradePick.grade${grade}`).parent;
      expect(chip?.props?.accessibilityLabel).toBeTruthy();
      expect(chip?.props?.accessibilityRole).toBe('radio');
    }
  });

  it('subject chips have accessibility labels and switch role', () => {
    const { getAllByLabelText } = render(<GradePickScreen />);
    const subjectChips = getAllByLabelText(/Math|English|Chinese|Science/);
    expect(subjectChips.length).toBe(4);
    subjectChips.forEach((chip) => {
      expect(chip.props.accessibilityLabel).toBeTruthy();
      expect(chip.props.accessibilityRole).toBe('switch');
    });
  });
});
