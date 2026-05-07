/**
 * Tests for ParentSignInScreen.
 *
 * Covers rendering and structure.
 * Note: fireEvent-based interaction tests are skipped due to a
 * pre-existing React version mismatch (react 19.2.6 vs
 * react-native-renderer 19.1.0) that causes AggregateError in act().
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import ParentSignInScreen from '../ParentSignInScreen';

// Mock the auth service
jest.mock('../../../services/auth', () => ({
  signInWithMagicLink: jest.fn(),
  signInWithGoogle: jest.fn(),
  signInWithApple: jest.fn(),
  handleAuthCallback: jest.fn(),
  getCurrentSession: jest.fn(),
  AuthError: class AuthError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.name = 'AuthError';
      this.code = code;
    }
  },
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn().mockResolvedValue(null),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    Svg: ({ children }: { children: React.ReactNode }) =>
      React.createElement('mock-svg', null, children),
    Path: () => React.createElement('mock-path'),
    default: {
      Svg: ({ children }: { children: React.ReactNode }) =>
        React.createElement('mock-svg', null, children),
      Path: () => React.createElement('mock-path'),
    },
  };
});

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, _params?: Record<string, unknown>) => {
      const keys: Record<string, string> = {
        'parentAuth.signIn.title': 'Create your account',
        'parentAuth.signIn.subtitle': 'Sign in to save progress. Data never leaves the device.',
        'parentAuth.signIn.emailPlaceholder': 'Enter your email address',
        'parentAuth.signIn.sendMagicLink': 'Send magic link',
        'parentAuth.signIn.magicLinkSent': 'Magic link sent!',
        'parentAuth.signIn.checkEmail': 'Check your email for the sign-in link.',
        'parentAuth.signIn.orDivider': 'or continue with',
        'parentAuth.signIn.continueWithGoogle': 'Continue with Google',
        'parentAuth.signIn.continueWithApple': 'Continue with Apple',
        'parentAuth.signIn.skip': 'Skip for now',
        'parentAuth.signIn.errorInvalidEmail': 'Please enter a valid email address',
        'parentAuth.signIn.errorSendFailed': 'Failed to send magic link.',
        'parentAuth.signIn.errorSignInFailed': 'Sign-in failed.',
        'parentAuth.signIn.errorAuthSession': 'Auth session cancelled.',
        'parentAuth.signIn.signedIn': 'Signed in successfully',
      };
      return keys[key] ?? key;
    },
  }),
}));

// ── Tests ──────────────────────────────────────────────────────────

describe('ParentSignInScreen', () => {
  it('renders the sign-in title', () => {
    const { getByText } = render(<ParentSignInScreen />);
    expect(getByText('Create your account')).toBeTruthy();
  });

  it('renders the subtitle', () => {
    const { getByText } = render(<ParentSignInScreen />);
    expect(
      getByText('Sign in to save progress. Data never leaves the device.'),
    ).toBeTruthy();
  });

  it('renders the email input', () => {
    const { getByPlaceholderText } = render(<ParentSignInScreen />);
    expect(getByPlaceholderText('Enter your email address')).toBeTruthy();
  });

  it('renders the Send magic link button', () => {
    const { getByText } = render(<ParentSignInScreen />);
    expect(getByText('Send magic link')).toBeTruthy();
  });

  it('renders Google and Apple sign-in buttons', () => {
    const { getByText } = render(<ParentSignInScreen />);
    expect(getByText('Continue with Google')).toBeTruthy();
    expect(getByText('Continue with Apple')).toBeTruthy();
  });

  it('renders the Skip link', () => {
    const { getByText } = render(<ParentSignInScreen />);
    expect(getByText('Skip for now')).toBeTruthy();
  });

  it('renders the or divider text', () => {
    const { getByText } = render(<ParentSignInScreen />);
    expect(getByText('or continue with')).toBeTruthy();
  });

  it('renders with onSkip and onSignedIn callbacks', () => {
    const { getByText } = render(
      <ParentSignInScreen onSkip={jest.fn()} onSignedIn={jest.fn()} />,
    );
    expect(getByText('Create your account')).toBeTruthy();
    expect(getByText('Skip for now')).toBeTruthy();
  });
});
