import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { KidProfileScreen } from '../../onboarding/screens/KidProfileScreen';

const mockGoNext = jest.fn();
const mockUpdateProgress = jest.fn();
const mockGetKids = jest.fn();
const mockAddKid = jest.fn();

jest.mock('../../onboarding/OnboardingProvider', () => ({
  useOnboarding: () => ({
    goNext: mockGoNext,
    goBack: jest.fn(),
    updateProgress: mockUpdateProgress,
    state: { currentStep: 'kid-profile' as const },
    canGoBack: true,
    isComplete: false,
  }),
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../storage/kid-profile', () => ({
  getKids: () => mockGetKids(),
  addKid: (...args: any[]) => mockAddKid(...args),
  updateKid: jest.fn(),
  deleteKid: jest.fn(),
}));

describe('KidProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetKids.mockResolvedValue([]);
    mockAddKid.mockResolvedValue(true);
  });

  it('renders without crash', async () => {
    render(<KidProfileScreen />);
    expect(await screen.findByText('Set up child profile')).toBeTruthy();
  });

  it('shows add first child button when no kids exist', async () => {
    render(<KidProfileScreen />);
    expect(await screen.findByText('Add your first child')).toBeTruthy();
  });

  it('shows add form when button is pressed', async () => {
    render(<KidProfileScreen />);
    fireEvent.press(await screen.findByText('Add your first child'));
    expect(screen.getByTestId('kidProfile-name')).toBeTruthy();
  });

  it('shows level picker chips', async () => {
    render(<KidProfileScreen />);
    fireEvent.press(await screen.findByText('Add your first child'));
    expect(screen.getByTestId('kidProfile-level-P1')).toBeTruthy();
    expect(screen.getByTestId('kidProfile-level-P6')).toBeTruthy();
  });

  it('shows language selection chips', async () => {
    render(<KidProfileScreen />);
    fireEvent.press(await screen.findByText('Add your first child'));
    expect(screen.getByTestId('kidProfile-lang-en')).toBeTruthy();
    expect(screen.getByTestId('kidProfile-lang-zh')).toBeTruthy();
  });

  it('shows Save button in form', async () => {
    render(<KidProfileScreen />);
    fireEvent.press(await screen.findByText('Add your first child'));
    expect(screen.getByTestId('kidProfile-save')).toBeTruthy();
  });

  it('disables continue when no kids added', async () => {
    render(<KidProfileScreen />);
    const continueBtn = screen.getByTestId('kidProfile-continue');
    expect(continueBtn).toBeDisabled();
  });

  it('disables save when name is empty and no level selected', async () => {
    render(<KidProfileScreen />);
    fireEvent.press(await screen.findByText('Add your first child'));
    const saveBtn = screen.getByTestId('kidProfile-save');
    expect(saveBtn).toBeDisabled();
  });
});
