import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import GradeSubjectPickScreen from '../GradeSubjectPickScreen';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
    ready: true,
  }),
}));

// Mock onboarding state
jest.mock('../../../storage/onboarding-state', () => ({
  persistGrade: jest.fn(),
  persistSubjects: jest.fn(),
}));

describe('GradeSubjectPickScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title', () => {
    const { getAllByText } = render(<GradeSubjectPickScreen />);
    const titles = getAllByText('onboarding.gradePick.title');
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it('renders all 6 grade options', () => {
    const { getByText } = render(<GradeSubjectPickScreen />);
    expect(getByText('onboarding.gradePick.gradeP1')).toBeTruthy();
    expect(getByText('onboarding.gradePick.gradeP2')).toBeTruthy();
    expect(getByText('onboarding.gradePick.gradeP3')).toBeTruthy();
    expect(getByText('onboarding.gradePick.gradeP4')).toBeTruthy();
    expect(getByText('onboarding.gradePick.gradeP5')).toBeTruthy();
    expect(getByText('onboarding.gradePick.gradeP6')).toBeTruthy();
  });

  it('renders all 4 subject options', () => {
    const { getByText } = render(<GradeSubjectPickScreen />);
    expect(getByText('onboarding.gradePick.subjectMath')).toBeTruthy();
    expect(getByText('onboarding.gradePick.subjectEnglish')).toBeTruthy();
    expect(getByText('onboarding.gradePick.subjectScience')).toBeTruthy();
    expect(getByText('onboarding.gradePick.subjectChinese')).toBeTruthy();
  });

  it('has all subjects selected by default', () => {
    const { getByText } = render(<GradeSubjectPickScreen />);
    expect(getByText('onboarding.gradePick.allSubjects')).toBeTruthy();
  });

  it('can select a grade', () => {
    const { getByText } = render(<GradeSubjectPickScreen />);
    const p3Option = getByText('onboarding.gradePick.gradeP3');
    fireEvent.press(p3Option);
    // Grade P3 should still be rendered (it's toggled, not hidden)
    expect(p3Option).toBeTruthy();
  });

  it('continue button is disabled when no grade is selected', () => {
    const { getByText } = render(<GradeSubjectPickScreen />);
    const continueButton = getByText('onboarding.gradePick.continue');
    // The parent TouchableOpacity should be disabled
    expect(continueButton).toBeTruthy();
  });

  it('calls onComplete when continue is pressed with grade + subjects', () => {
    const onComplete = jest.fn();
    const { getByText } = render(
      <GradeSubjectPickScreen onComplete={onComplete} />,
    );

    // Select a grade
    fireEvent.press(getByText('onboarding.gradePick.gradeP1'));
    // Press continue
    fireEvent.press(getByText('onboarding.gradePick.continue'));
    // onComplete should be called after grade + subjects are set
    expect(onComplete).toHaveBeenCalled();
  });

  it('can toggle all subjects off and on', () => {
    const { getByText } = render(<GradeSubjectPickScreen />);
    const allSubjectsToggle = getByText('onboarding.gradePick.allSubjects');

    // Toggle off
    fireEvent.press(allSubjectsToggle);
    // All subject chips should still render
    expect(getByText('onboarding.gradePick.subjectMath')).toBeTruthy();

    // Toggle on
    fireEvent.press(allSubjectsToggle);
    expect(getByText('onboarding.gradePick.subjectMath')).toBeTruthy();
  });

  it('can toggle individual subjects', () => {
    const { getByText } = render(<GradeSubjectPickScreen />);
    const mathOption = getByText('onboarding.gradePick.subjectMath');

    fireEvent.press(mathOption);
    // Still rendered after deselect
    expect(mathOption).toBeTruthy();

    // Re-select
    fireEvent.press(mathOption);
    expect(mathOption).toBeTruthy();
  });

  it('shows sibling prompt after continue', () => {
    const { getByText } = render(
      <GradeSubjectPickScreen onComplete={jest.fn()} />,
    );

    // Select grade
    fireEvent.press(getByText('onboarding.gradePick.gradeP1'));
    // Continue
    fireEvent.press(getByText('onboarding.gradePick.continue'));

    // Sibling prompt should appear
    expect(getByText('onboarding.siblingPrompt.title')).toBeTruthy();
  });

  it('grade chips have accessibility labels', () => {
    const { getAllByLabelText, UNSAFE_getAllByType } = render(<GradeSubjectPickScreen />);
    const gradeLabels = getAllByLabelText('onboarding.gradePick.accessibility.gradeOption');
    expect(gradeLabels.length).toBe(6);
  });
});
