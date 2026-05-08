import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ParentSignInScreen from '../ParentSignInScreen';

const mockT = (k: string) => k;
const mockSignInWithMagicLink = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockSignInWithApple = jest.fn();
const mockGetCurrentSession = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT, i18n: { language: 'en' } }),
}));

jest.mock('../../../services/auth', () => ({
  signInWithMagicLink: (...args: unknown[]) => mockSignInWithMagicLink(...args),
  signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
  signInWithApple: (...args: unknown[]) => mockSignInWithApple(...args),
  handleAuthCallback: jest.fn(),
  getCurrentSession: (...args: unknown[]) => mockGetCurrentSession(...args),
  AuthError: class extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
      this.name = 'AuthError';
    }
  },
}));

describe('ParentSignInScreen', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders title and subtitle', () => {
    render(<ParentSignInScreen />);
    expect(screen.getByText('parentAuth.signIn.title')).toBeTruthy();
    expect(screen.getByText('parentAuth.signIn.subtitle')).toBeTruthy();
  });

  it('renders email input and all buttons', () => {
    render(<ParentSignInScreen />);
    expect(screen.getByLabelText('parentAuth.signIn.emailPlaceholder')).toBeTruthy();
    expect(screen.getByLabelText('parentAuth.signIn.sendMagicLink')).toBeTruthy();
    expect(screen.getByLabelText('parentAuth.signIn.continueWithGoogle')).toBeTruthy();
    expect(screen.getByLabelText('parentAuth.signIn.continueWithApple')).toBeTruthy();
    expect(screen.getByLabelText('parentAuth.signIn.skip')).toBeTruthy();
  });

  it('calls onSkip when skip link is pressed', () => {
    const onSkip = jest.fn();
    render(<ParentSignInScreen onSkip={onSkip} />);
    fireEvent.press(screen.getByLabelText('parentAuth.signIn.skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('disables send button when email is empty', () => {
    render(<ParentSignInScreen />);
    expect(screen.getByLabelText('parentAuth.signIn.sendMagicLink').props.accessibilityState?.disabled).toBe(true);
  });

  it('sends magic link and shows sent state', async () => {
    mockSignInWithMagicLink.mockResolvedValueOnce(undefined);
    render(<ParentSignInScreen />);
    fireEvent.changeText(screen.getByLabelText('parentAuth.signIn.emailPlaceholder'), 'parent@example.com');
    fireEvent.press(screen.getByLabelText('parentAuth.signIn.sendMagicLink'));
    await waitFor(() => {
      expect(mockSignInWithMagicLink).toHaveBeenCalledWith('parent@example.com');
      expect(screen.getByText('parentAuth.signIn.magicLinkSent')).toBeTruthy();
    });
  });

  it('calls onSignedIn after Google sign-in succeeds', async () => {
    const onSignedIn = jest.fn();
    mockSignInWithGoogle.mockResolvedValueOnce(undefined);
    mockGetCurrentSession.mockResolvedValueOnce({ user: { id: '1', email: 'test@example.com', provider: 'google' }, accessToken: 'token' });
    render(<ParentSignInScreen onSignedIn={onSignedIn} />);
    fireEvent.press(screen.getByLabelText('parentAuth.signIn.continueWithGoogle'));
    await waitFor(() => { expect(onSignedIn).toHaveBeenCalledTimes(1); });
  });

  it('calls onSignedIn after Apple sign-in succeeds', async () => {
    const onSignedIn = jest.fn();
    mockSignInWithApple.mockResolvedValueOnce(undefined);
    mockGetCurrentSession.mockResolvedValueOnce({ user: { id: '2', email: 'test@icloud.com', provider: 'apple' }, accessToken: 'token' });
    render(<ParentSignInScreen onSignedIn={onSignedIn} />);
    fireEvent.press(screen.getByLabelText('parentAuth.signIn.continueWithApple'));
    await waitFor(() => { expect(onSignedIn).toHaveBeenCalledTimes(1); });
  });

  it('shows error when sign-in fails', async () => {
    mockSignInWithGoogle.mockRejectedValueOnce(new Error('fail'));
    render(<ParentSignInScreen />);
    fireEvent.press(screen.getByLabelText('parentAuth.signIn.continueWithGoogle'));
    await waitFor(() => { expect(screen.getByText('parentAuth.signIn.errorSignInFailed')).toBeTruthy(); });
  });

  it('has accessibilityRole button on all interactive elements', () => {
    render(<ParentSignInScreen />);
    ['parentAuth.signIn.sendMagicLink', 'parentAuth.signIn.continueWithGoogle', 'parentAuth.signIn.continueWithApple', 'parentAuth.signIn.skip'].forEach((label) => {
      expect(screen.getByLabelText(label).props.accessibilityRole).toBe('button');
    });
  });
});
