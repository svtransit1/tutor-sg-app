import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SiblingPromptScreen from '../SiblingPromptScreen';

const mockPersistSiblingIntent = jest.fn();
jest.mock('../../../storage/onboarding-state', () => ({
  persistSiblingIntent: (...args: unknown[]) => mockPersistSiblingIntent(...args),
}));

const mockT = jest.fn((key: string) => {
  const keys: Record<string, string> = {
    'onboarding.siblingPrompt.title': 'Add another child?',
    'onboarding.siblingPrompt.subtitle': 'tutor-sg works best for the whole family. Add a sibling to share the plan.',
    'onboarding.siblingPrompt.addAnother': 'Add another child',
    'onboarding.siblingPrompt.skip': 'Not now',
    'onboarding.siblingPrompt.addHint': 'Add another child profile to your family plan',
    'onboarding.siblingPrompt.skipHint': 'Continue without adding another child',
  };
  return keys[key] ?? key;
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: { language: 'en' },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe('SiblingPromptScreen — Onboarding Step 6/11', () => {
  const onAdd = jest.fn();
  const onSkip = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title from i18n', () => {
    render(<SiblingPromptScreen onAdd={onAdd} onSkip={onSkip} />);
    expect(screen.getByText('Add another child?')).toBeTruthy();
  });

  it('renders the subtitle from i18n', () => {
    render(<SiblingPromptScreen onAdd={onAdd} onSkip={onSkip} />);
    expect(
      screen.getByText(
        'tutor-sg works best for the whole family. Add a sibling to share the plan.',
      ),
    ).toBeTruthy();
  });

  it('renders the "Add another child" button with + prefix', () => {
    render(<SiblingPromptScreen onAdd={onAdd} onSkip={onSkip} />);
    expect(screen.getByText('+ Add another child')).toBeTruthy();
  });

  it('renders the "Not now" button', () => {
    render(<SiblingPromptScreen onAdd={onAdd} onSkip={onSkip} />);
    expect(screen.getByText('Not now')).toBeTruthy();
  });

  it('calls persistSiblingIntent(true) + onAdd when "Add another child" is pressed', () => {
    render(<SiblingPromptScreen onAdd={onAdd} onSkip={onSkip} />);
    const addButton = screen.getByLabelText('Add another child profile to your family plan');
    fireEvent.press(addButton);
    expect(mockPersistSiblingIntent).toHaveBeenCalledWith(true);
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('calls persistSiblingIntent(false) + onSkip when "Not now" is pressed', () => {
    render(<SiblingPromptScreen onAdd={onAdd} onSkip={onSkip} />);
    const skipButton = screen.getByLabelText('Continue without adding another child');
    fireEvent.press(skipButton);
    expect(mockPersistSiblingIntent).toHaveBeenCalledWith(false);
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('has accessibilityRole header on the title', () => {
    render(<SiblingPromptScreen onAdd={onAdd} onSkip={onSkip} />);
    const headers = screen.getAllByRole('header');
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });

  it('has accessibilityRole button on add button', () => {
    render(<SiblingPromptScreen onAdd={onAdd} onSkip={onSkip} />);
    const button = screen.getByLabelText('Add another child profile to your family plan');
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('has accessibilityRole button on skip button', () => {
    render(<SiblingPromptScreen onAdd={onAdd} onSkip={onSkip} />);
    const button = screen.getByLabelText('Continue without adding another child');
    expect(button.props.accessibilityRole).toBe('button');
  });

  it('does NOT call add or skip on mount', () => {
    render(<SiblingPromptScreen onAdd={onAdd} onSkip={onSkip} />);
    expect(onAdd).not.toHaveBeenCalled();
    expect(onSkip).not.toHaveBeenCalled();
    expect(mockPersistSiblingIntent).not.toHaveBeenCalled();
  });
});
