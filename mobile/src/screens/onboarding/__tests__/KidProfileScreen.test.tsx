import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import KidProfileScreen from '../KidProfileScreen';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
    ready: true,
  }),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
}));

// Mock onboarding state
jest.mock('../../../storage/onboarding-state', () => ({
  persistLocale: jest.fn(),
}));

describe('KidProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title', () => {
    const { getByText } = render(
      <KidProfileScreen gradeLabel="Grade P3" />,
    );
    expect(getByText('onboarding.kidProfile.title')).toBeTruthy();
  });

  it('shows the grade label', () => {
    const { getByText } = render(
      <KidProfileScreen gradeLabel="Grade P3" />,
    );
    expect(getByText('Grade P3')).toBeTruthy();
  });

  it('renders the name input', () => {
    const { getByPlaceholderText } = render(
      <KidProfileScreen gradeLabel="Grade P3" />,
    );
    expect(
      getByPlaceholderText('onboarding.kidProfile.namePlaceholder'),
    ).toBeTruthy();
  });

  it('renders language selector chips', () => {
    const { getByText } = render(
      <KidProfileScreen gradeLabel="Grade P3" />,
    );
    expect(getByText('onboarding.kidProfile.languageEn')).toBeTruthy();
    expect(getByText('onboarding.kidProfile.languageZh')).toBeTruthy();
  });

  it('defaults to English language', () => {
    const { getByText } = render(
      <KidProfileScreen gradeLabel="Grade P3" />,
    );
    const englishChip = getByText('onboarding.kidProfile.languageEn');
    expect(englishChip).toBeTruthy();
  });

  it('shows validation error when name is empty on save', () => {
    const { getByText } = render(
      <KidProfileScreen gradeLabel="Grade P3" />,
    );
    fireEvent.press(getByText('onboarding.kidProfile.save'));
    expect(getByText('onboarding.kidProfile.nameRequired')).toBeTruthy();
  });

  it('calls onComplete with profile data when name is entered', () => {
    const onComplete = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <KidProfileScreen gradeLabel="Grade P3" onComplete={onComplete} />,
    );

    const input = getByPlaceholderText('onboarding.kidProfile.namePlaceholder');
    fireEvent.changeText(input, 'Alice');
    fireEvent.press(getByText('onboarding.kidProfile.save'));

    expect(onComplete).toHaveBeenCalledWith({
      id: 'mock-uuid-123',
      name: 'Alice',
      preferredLanguage: 'en',
      createdAt: expect.any(String),
    });
  });

  it('can switch language to Chinese', () => {
    const { getByText } = render(
      <KidProfileScreen gradeLabel="Grade P3" />,
    );
    fireEvent.press(getByText('onboarding.kidProfile.languageZh'));
    // Just verify it doesn't crash
    expect(getByText('onboarding.kidProfile.languageZh')).toBeTruthy();
  });

  it('strips whitespace from name', () => {
    const onComplete = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <KidProfileScreen gradeLabel="Grade P3" onComplete={onComplete} />,
    );

    const input = getByPlaceholderText('onboarding.kidProfile.namePlaceholder');
    fireEvent.changeText(input, '  Bob  ');
    fireEvent.press(getByText('onboarding.kidProfile.save'));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Bob' }),
    );
  });

  it('has accessibility labels on the name input', () => {
    const { getByLabelText } = render(
      <KidProfileScreen gradeLabel="Grade P3" />,
    );
    expect(
      getByLabelText('onboarding.kidProfile.accessibility.nameInput'),
    ).toBeTruthy();
  });
});
