/**
 * Tests for ParentKidManagementScreen (M2-26 — Parent profile & kid management).
 *
 * Validates:
 * - Renders parent profile section with name input and language toggle
 * - Renders children section with add/display/edit/remove
 * - Add child form works: name, grade, language
 * - Edit child pre-fills form with existing data
 * - Remove child shows confirmation alert
 * - Validation: requires parent name and at least 1 child before Continue
 * - Max 4 children cap
 * - Continue persists and calls onComplete
 * - Accessibility labels present
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ParentKidManagementScreen from '../ParentKidManagementScreen';
import * as parentProfile from '../../../storage/parent-profile';

// ── Mock t() with interpolation support ────────────────────────────

const mockT = (k: string, params?: Record<string, string>) => {
  const display: Record<string, string> = {
    'onboarding.parentKidManagement.title': 'Your profile & children',
    'onboarding.parentKidManagement.parentSectionTitle': 'Your profile',
    'onboarding.parentKidManagement.displayNameLabel': 'Your name',
    'onboarding.parentKidManagement.displayNamePlaceholder': 'Enter your name',
    'onboarding.parentKidManagement.languageLabel': 'App language',
    'onboarding.parentKidManagement.languageEn': 'English',
    'onboarding.parentKidManagement.languageZhHans': '中文',
    'onboarding.parentKidManagement.childrenSectionTitle': 'Children',
    'onboarding.parentKidManagement.childrenHelper': 'Add your child so they can start learning.',
    'onboarding.parentKidManagement.addChild': 'Add child',
    'onboarding.parentKidManagement.editChild': 'Edit',
    'onboarding.parentKidManagement.removeChild': 'Remove',
    'onboarding.parentKidManagement.nameLabel': "Child's name",
    'onboarding.parentKidManagement.namePlaceholder': "Enter child's name",
    'onboarding.parentKidManagement.gradeLabel': 'Grade level',
    'onboarding.parentKidManagement.childLanguageLabel': 'Learning language',
    'onboarding.parentKidManagement.childLanguageEn': 'English',
    'onboarding.parentKidManagement.childLanguageZhHans': '中文',
    'onboarding.parentKidManagement.saveChild': 'Save child',
    'onboarding.parentKidManagement.cancel': 'Cancel',
    'onboarding.parentKidManagement.continue': 'Continue',
    'onboarding.parentKidManagement.validation.nameRequired': "Please enter the child's name.",
    'onboarding.parentKidManagement.validation.gradeRequired': 'Please select a grade level.',
    'onboarding.parentKidManagement.validation.minChildren': 'Please add at least one child before continuing.',
    'onboarding.parentKidManagement.validation.maxChildren': 'You can add up to 4 children.',
    'onboarding.parentKidManagement.validation.parentNameRequired': 'Please enter your name.',
    'onboarding.parentKidManagement.confirmRemoveTitle': 'Remove {{name}}?',
    'onboarding.parentKidManagement.confirmRemoveBody': "{{name}}'s learning data will be removed.",
    'onboarding.parentKidManagement.confirmRemoveYes': 'Remove',
    'onboarding.parentKidManagement.confirmRemoveNo': 'Cancel',
    'onboarding.parentKidManagement.accessibility.childCard': '{{name}}, grade {{grade}}',
    'onboarding.parentKidManagement.accessibility.childCardEn': '{{name}}, grade {{grade}}, learning in English',
    'onboarding.parentKidManagement.accessibility.childCardZh': '{{name}}, grade {{grade}}, learning in Chinese',
    'onboarding.parentKidManagement.accessibility.editChildButton': 'Edit {{name}}',
    'onboarding.parentKidManagement.accessibility.removeChildButton': 'Remove {{name}}',
    'onboarding.parentKidManagement.accessibility.addChildButton': 'Add a child',
    'onboarding.parentKidManagement.accessibility.gradeOption': 'Grade {{grade}}',
    'onboarding.parentKidManagement.accessibility.gradeSelected': 'Grade {{grade}} selected',
    'onboarding.gradePick.gradeP1': 'P1',
    'onboarding.gradePick.gradeP2': 'P2',
    'onboarding.gradePick.gradeP3': 'P3',
    'onboarding.gradePick.gradeP4': 'P4',
    'onboarding.gradePick.gradeP5': 'P5',
    'onboarding.gradePick.gradeP6': 'P6',
  };
  let value = display[k] ?? k;
  if (params) {
    value = value.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] ?? `{{${key}}}`);
  }
  return value;
};

// ── Mocks ──────────────────────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT, i18n: { language: 'en' } }),
}));

// Mock storage with spy-able functions
const mockLoadParentProfile = jest.fn();
const mockSaveParentProfile = jest.fn();
const mockPersistChildren = jest.fn();

jest.mock('../../../storage/parent-profile', () => ({
  loadParentProfile: (...args: unknown[]) => mockLoadParentProfile(...args),
  saveParentProfile: (...args: unknown[]) => mockSaveParentProfile(...args),
  persistChildren: (...args: unknown[]) => mockPersistChildren(...args),
}));

jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
}));

// ── Helpers ────────────────────────────────────────────────────────

function typeInField(label: string, text: string) {
  const input = screen.getByLabelText(label);
  fireEvent.changeText(input, text);
}

function pressGrade(grade: string) {
  const btn = screen.getByAccessibilityState({ selected: false });
  // Find the grade chip by text
  const gradeText = screen.getByText(grade);
  if (gradeText.parent?.type === 'View' || gradeText.parent?.type === 'Pressable') {
    fireEvent.press(gradeText);
  } else {
    // Fall back to accessibility label
    fireEvent.press(gradeText);
  }
}

function pressGradeLabel(gradeLabel: string) {
  // All grade chips that are NOT selected have label "Grade P1" etc.
  const chips = screen.getAllByAccessibilityState({ selected: false });
  for (const chip of chips) {
    if (chip.props.accessibilityLabel === gradeLabel) {
      fireEvent.press(chip);
      return;
    }
  }
  // Last resort
  const btn = screen.getByLabelText(gradeLabel);
  fireEvent.press(btn);
}

// ── Tests ──────────────────────────────────────────────────────────

describe('ParentKidManagementScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadParentProfile.mockReturnValue({
      displayName: '',
      language: 'en',
      children: [],
    });
    mockSaveParentProfile.mockResolvedValue(undefined);
    mockPersistChildren.mockResolvedValue(undefined);
  });

  // ── Initial render ─────────────────────────────────────────────

  it('renders parent profile section with name input and language toggle', () => {
    render(<ParentKidManagementScreen />);
    expect(screen.getByText('Your profile')).toBeTruthy();
    expect(screen.getByLabelText('Your name')).toBeTruthy();
    expect(screen.getByText('App language')).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
  });

  it('renders children section and Add child button', () => {
    render(<ParentKidManagementScreen />);
    expect(screen.getByText('Children')).toBeTruthy();
    expect(screen.getByLabelText('Add a child')).toBeTruthy();
  });

  it('renders Continue button via accessibility label', () => {
    render(<ParentKidManagementScreen />);
    expect(screen.getByLabelText('Continue')).toBeTruthy();
  });

  // ── Add child ──────────────────────────────────────────────────

  it('shows inline add-child form when Add child is tapped', () => {
    render(<ParentKidManagementScreen />);
    fireEvent.press(screen.getByLabelText('Add a child'));
    expect(screen.getByText("Child's name")).toBeTruthy();
    expect(screen.getByText('Grade level')).toBeTruthy();
    expect(screen.getByText('Learning language')).toBeTruthy();
    expect(screen.getByLabelText('Save child')).toBeTruthy();
    expect(screen.getByLabelText('Cancel')).toBeTruthy();
  });

  it('adds a child with valid name, grade, and language', () => {
    render(<ParentKidManagementScreen />);
    fireEvent.press(screen.getByLabelText('Add a child'));
    typeInField("Child's name", 'Alice');
    // Press the "P1" grade chip text
    const p1Chip = screen.getByText('P1');
    fireEvent.press(p1Chip);
    // Save
    fireEvent.press(screen.getByLabelText('Save child'));
    // Child card should show Alice
    expect(screen.getByText('Alice')).toBeTruthy();
    // Grade badge P1 visible
    expect(screen.getByText('P1')).toBeTruthy();
    // Language indicator EN
    expect(screen.getByText('EN')).toBeTruthy();
    // Form should close
    expect(screen.queryByLabelText('Cancel')).toBeNull();
  });

  it('shows validation errors when adding child with empty name', () => {
    render(<ParentKidManagementScreen />);
    fireEvent.press(screen.getByLabelText('Add a child'));
    fireEvent.press(screen.getByLabelText('Save child'));
    expect(screen.getByText("Please enter the child's name.")).toBeTruthy();
    expect(screen.getByText('Please select a grade level.')).toBeTruthy();
  });

  it('cancels the add form', () => {
    render(<ParentKidManagementScreen />);
    fireEvent.press(screen.getByLabelText('Add a child'));
    expect(screen.getByLabelText('Cancel')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Cancel'));
    expect(screen.queryByLabelText('Cancel')).toBeNull();
    expect(screen.getByLabelText('Add a child')).toBeTruthy();
  });

  it('persists children via storage when adding', () => {
    render(<ParentKidManagementScreen />);
    fireEvent.press(screen.getByLabelText('Add a child'));
    typeInField("Child's name", 'Bob');
    fireEvent.press(screen.getByText('P2'));
    fireEvent.press(screen.getByLabelText('Save child'));
    expect(mockPersistChildren).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Bob', grade: 'P2', language: 'en' }),
      ]),
    );
  });

  // ── Edit child ─────────────────────────────────────────────────

  it('opens edit form pre-filled with existing child data', () => {
    mockLoadParentProfile.mockReturnValue({
      displayName: 'Parent',
      language: 'en',
      children: [{ id: 'c1', name: 'Charlie', grade: 'P3', language: 'zh-Hans' }],
    });
    render(<ParentKidManagementScreen />);
    // Edit button for Charlie
    const editLabel = mockT('onboarding.parentKidManagement.accessibility.editChildButton', { name: 'Charlie' });
    fireEvent.press(screen.getByLabelText(editLabel));
    expect(screen.getByDisplayValue('Charlie')).toBeTruthy();
    expect(screen.getByLabelText('Save child')).toBeTruthy();
  });

  it('updates child data on edit save', () => {
    mockLoadParentProfile.mockReturnValue({
      displayName: 'Parent',
      language: 'en',
      children: [{ id: 'c1', name: 'Charlie', grade: 'P3', language: 'zh-Hans' }],
    });
    render(<ParentKidManagementScreen />);
    const editLabel = mockT('onboarding.parentKidManagement.accessibility.editChildButton', { name: 'Charlie' });
    fireEvent.press(screen.getByLabelText(editLabel));
    // Change name
    typeInField("Child's name", 'Charlotte');
    fireEvent.press(screen.getByLabelText('Save child'));
    expect(screen.queryByText('Charlie')).toBeNull();
    expect(screen.getByText('Charlotte')).toBeTruthy();
  });

  // ── Remove child ───────────────────────────────────────────────

  it('shows confirmation alert when remove is tapped', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    mockLoadParentProfile.mockReturnValue({
      displayName: 'Parent',
      language: 'en',
      children: [{ id: 'c1', name: 'Dave', grade: 'P4', language: 'en' }],
    });
    render(<ParentKidManagementScreen />);
    const removeLabel = mockT('onboarding.parentKidManagement.accessibility.removeChildButton', { name: 'Dave' });
    fireEvent.press(screen.getByLabelText(removeLabel));
    expect(alertSpy).toHaveBeenCalledWith(
      'Remove Dave?',
      expect.stringContaining("Dave's learning data will be removed."),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Remove' }),
      ]),
    );
    alertSpy.mockRestore();
  });

  // ── Validation before Continue ─────────────────────────────────

  it('shows validation when Continue tapped without children', () => {
    render(<ParentKidManagementScreen />);
    fireEvent.press(screen.getByLabelText('Continue'));
    expect(screen.getByText('Please add at least one child before continuing.')).toBeTruthy();
  });

  it('shows validation when Continue tapped without parent name', () => {
    mockLoadParentProfile.mockReturnValue({
      displayName: '',
      language: 'en',
      children: [{ id: 'c1', name: 'Test', grade: 'P1', language: 'en' }],
    });
    render(<ParentKidManagementScreen />);
    fireEvent.press(screen.getByLabelText('Continue'));
    expect(screen.getByText('Please enter your name.')).toBeTruthy();
  });

  it('calls onComplete when Continue tapped with valid data', () => {
    const onComplete = jest.fn();
    mockLoadParentProfile.mockReturnValue({
      displayName: 'Test Parent',
      language: 'en',
      children: [{ id: 'c1', name: 'Test Kid', grade: 'P1', language: 'en' }],
    });
    render(<ParentKidManagementScreen onComplete={onComplete} />);
    fireEvent.press(screen.getByLabelText('Continue'));
    expect(mockSaveParentProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: 'Test Parent',
        language: 'en',
        children: expect.arrayContaining([
          expect.objectContaining({ name: 'Test Kid', grade: 'P1' }),
        ]),
      }),
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  // ── Max children ───────────────────────────────────────────────

  it('disables add button when 4 children exist', () => {
    mockLoadParentProfile.mockReturnValue({
      displayName: 'Parent',
      language: 'en',
      children: [
        { id: 'c1', name: 'A', grade: 'P1', language: 'en' },
        { id: 'c2', name: 'B', grade: 'P2', language: 'en' },
        { id: 'c3', name: 'C', grade: 'P3', language: 'en' },
        { id: 'c4', name: 'D', grade: 'P4', language: 'en' },
      ],
    });
    render(<ParentKidManagementScreen />);
    const addBtn = screen.getByLabelText('Add a child');
    expect(addBtn.props.accessibilityState?.disabled ?? addBtn.props.disabled).toBeTruthy();
  });

  // ── Accessibility ──────────────────────────────────────────────

  it('has accessibility labels on language toggle buttons', () => {
    render(<ParentKidManagementScreen />);
    expect(screen.getByLabelText('English')).toBeTruthy();
    expect(screen.getByLabelText('中文')).toBeTruthy();
  });

  it('has accessibility labels on child card', () => {
    mockLoadParentProfile.mockReturnValue({
      displayName: 'Parent',
      language: 'en',
      children: [{ id: 'c1', name: 'Fiona', grade: 'P2', language: 'en' }],
    });
    render(<ParentKidManagementScreen />);
    const cardLabel = mockT('onboarding.parentKidManagement.accessibility.childCardEn', {
      name: 'Fiona',
      grade: 'P2',
    });
    expect(screen.getByLabelText(cardLabel)).toBeTruthy();
  });

  it('has accessibility labels on Continue button', () => {
    render(<ParentKidManagementScreen />);
    expect(screen.getByLabelText('Continue')).toBeTruthy();
  });
});
