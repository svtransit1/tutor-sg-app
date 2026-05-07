import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GradeSubjectPickScreen from '../GradeSubjectPickScreen';

const mockT = (k: string) => k;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT, i18n: { language: 'en' } }),
}));

describe('GradeSubjectPickScreen', () => {
  it('renders title and subject title', () => {
    render(<GradeSubjectPickScreen />);
    expect(screen.getByText('onboarding.gradePick.title')).toBeTruthy();
    expect(screen.getByText('onboarding.gradePick.subjectTitle')).toBeTruthy();
  });

  it('renders all 6 grade chips', () => {
    render(<GradeSubjectPickScreen />);
    expect(screen.getByText('onboarding.gradePick.gradeP1')).toBeTruthy();
    expect(screen.getByText('onboarding.gradePick.gradeP2')).toBeTruthy();
    expect(screen.getByText('onboarding.gradePick.gradeP3')).toBeTruthy();
    expect(screen.getByText('onboarding.gradePick.gradeP4')).toBeTruthy();
    expect(screen.getByText('onboarding.gradePick.gradeP5')).toBeTruthy();
    expect(screen.getByText('onboarding.gradePick.gradeP6')).toBeTruthy();
  });

  it('renders all 4 subject chips', () => {
    render(<GradeSubjectPickScreen />);
    expect(screen.getByText('onboarding.gradePick.subjectMath')).toBeTruthy();
    expect(screen.getByText('onboarding.gradePick.subjectEnglish')).toBeTruthy();
    expect(screen.getByText('onboarding.gradePick.subjectScience')).toBeTruthy();
    expect(screen.getByText('onboarding.gradePick.subjectChinese')).toBeTruthy();
  });

  it('grade chips have accessibilityRole radio', () => {
    render(<GradeSubjectPickScreen />);
    const p1Chip = screen.getByLabelText('onboarding.gradePick.accessibility.gradeOption');
    expect(p1Chip.props.accessibilityRole).toBe('radio');
  });

  it('selecting a grade marks it selected', () => {
    render(<GradeSubjectPickScreen />);
    const p1Chip = screen.getByLabelText('onboarding.gradePick.accessibility.gradeOption');
    fireEvent.press(p1Chip);
    const selected = screen.getByLabelText('onboarding.gradePick.accessibility.gradeSelected');
    expect(selected.props.accessibilityState.selected).toBe(true);
  });

  it('subject toggles have accessibilityRole switch', () => {
    render(<GradeSubjectPickScreen />);
    const toggle = screen.getByLabelText('onboarding.gradePick.accessibility.subjectToggle');
    expect(toggle.props.accessibilityRole).toBe('switch');
  });

  it('all subjects toggle renders as switch', () => {
    render(<GradeSubjectPickScreen />);
    const toggle = screen.getByLabelText('onboarding.gradePick.allSubjects');
    expect(toggle.props.accessibilityRole).toBe('switch');
  });

  it('all subjects checked by default', () => {
    render(<GradeSubjectPickScreen />);
    const toggle = screen.getByLabelText('onboarding.gradePick.allSubjects');
    expect(toggle.props.accessibilityState.checked).toBe(true);
  });

  it('deselecting all subjects via all-subjects toggle', () => {
    render(<GradeSubjectPickScreen />);
    const toggle = screen.getByLabelText('onboarding.gradePick.allSubjects');
    fireEvent.press(toggle);
    expect(toggle.props.accessibilityState.checked).toBe(false);
  });

  it('continue disabled when no grade selected', () => {
    render(<GradeSubjectPickScreen />);
    const btn = screen.getByLabelText('onboarding.gradePick.continue');
    expect(btn.props.accessibilityState.disabled).toBe(true);
  });

  it('continue calls onComplete with grade and selected subjects', () => {
    const onComplete = jest.fn();
    render(<GradeSubjectPickScreen onComplete={onComplete} />);

    fireEvent.press(screen.getByLabelText('onboarding.gradePick.accessibility.gradeOption'));
    fireEvent.press(screen.getByLabelText('onboarding.gradePick.continue'));

    expect(onComplete).toHaveBeenCalledWith('P1', [
      'math',
      'english',
      'science',
      'chinese',
    ]);
  });

  it('renders hint text below subjects', () => {
    render(<GradeSubjectPickScreen />);
    expect(screen.getByText('onboarding.gradePick.subjectHint')).toBeTruthy();
  });
});
