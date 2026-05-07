/**
 * Tests for the auth service.
 */
import { AuthError } from '../../services/auth';

// ── Mock setup ─────────────────────────────────────────────────────

jest.mock('../../services/supabase', () => {
  const mockSupabase = {
    auth: {
      signInWithOtp: jest.fn(),
      signInWithOAuth: jest.fn(),
      exchangeCodeForSession: jest.fn(),
      getSession: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  };
  return { supabase: mockSupabase };
});

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
}));

const WebBrowser = require('expo-web-browser') as { openAuthSessionAsync: jest.Mock };

// Import after mocks are set up
const {
  signInWithMagicLink,
  signInWithGoogle,
  signInWithApple,
  handleAuthCallback,
  getCurrentSession,
  signOut,
} = require('../../services/auth');

const { supabase } = require('../../services/supabase');

// ── Setup ──────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Magic link tests ──────────────────────────────────────────────

describe('signInWithMagicLink', () => {
  it('sends a magic link for a valid email', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({
      data: {},
      error: null,
    });

    await signInWithMagicLink('parent@example.com');

    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'parent@example.com' }),
    );
  });

  it('trims whitespace from email', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({
      data: {},
      error: null,
    });

    await signInWithMagicLink('  parent@example.com  ');

    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'parent@example.com' }),
    );
  });

  it('throws AuthError for invalid email', async () => {
    await expect(signInWithMagicLink('not-an-email')).rejects.toThrow(AuthError);
    await expect(signInWithMagicLink('not-an-email')).rejects.toThrow(
      expect.objectContaining({ code: 'invalid_email' }),
    );
    expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it('throws AuthError for empty email', async () => {
    await expect(signInWithMagicLink('')).rejects.toThrow(AuthError);
    await expect(signInWithMagicLink('')).rejects.toThrow(
      expect.objectContaining({ code: 'invalid_email' }),
    );
    expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it('throws AuthError when Supabase returns an error', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({
      data: {},
      error: { message: 'Rate limit exceeded' },
    });

    await expect(signInWithMagicLink('parent@example.com')).rejects.toThrow(AuthError);
    await expect(signInWithMagicLink('parent@example.com')).rejects.toThrow(
      expect.objectContaining({ code: 'send_failed' }),
    );
  });
});

// ── OAuth tests ───────────────────────────────────────────────────

describe('signInWithGoogle', () => {
  it('opens browser and exchanges code on success', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValue({
      data: {
        provider: 'google',
        url: 'https://mock.supabase.co/auth/v1/authorize?provider=google',
      },
      error: null,
    });
    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'tutor-sg://auth/callback?code=mock-code',
    });
    supabase.auth.exchangeCodeForSession.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'parent@example.com' },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: 9999999999,
          user: { id: 'user-1', email: 'parent@example.com' },
        },
      },
      error: null,
    });

    const session = await signInWithGoogle();

    expect(session.user?.email).toBe('parent@example.com');
    expect(session.accessToken).toBe('mock-access-token');
    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith(
      'tutor-sg://auth/callback?code=mock-code',
    );
  });

  it('throws AuthError when browser session is cancelled', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValue({
      data: {
        provider: 'google',
        url: 'https://mock.supabase.co/auth/v1/authorize?provider=google',
      },
      error: null,
    });
    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'cancel',
    });

    await expect(signInWithGoogle()).rejects.toThrow(AuthError);
    await expect(signInWithGoogle()).rejects.toThrow(
      expect.objectContaining({ code: 'session_cancelled' }),
    );
  });
});

describe('signInWithApple', () => {
  it('opens browser and exchanges code on success', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValue({
      data: {
        provider: 'apple',
        url: 'https://mock.supabase.co/auth/v1/authorize?provider=apple',
      },
      error: null,
    });
    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'tutor-sg://auth/callback?code=mock-code-apple',
    });
    supabase.auth.exchangeCodeForSession.mockResolvedValue({
      data: {
        user: { id: 'user-apple', email: 'parent@icloud.com' },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: 9999999999,
          user: { id: 'user-apple', email: 'parent@icloud.com' },
        },
      },
      error: null,
    });

    const session = await signInWithApple();

    expect(session.user?.email).toBe('parent@icloud.com');
    expect(session.accessToken).toBe('mock-access-token');
  });

  it('throws AuthError when OAuth URL is null', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValue({
      data: { provider: 'apple', url: null },
      error: null,
    });

    await expect(signInWithApple()).rejects.toThrow(AuthError);
    await expect(signInWithApple()).rejects.toThrow(
      expect.objectContaining({ code: 'sign_in_failed' }),
    );
  });
});

describe('handleAuthCallback', () => {
  it('returns session on successful code exchange', async () => {
    supabase.auth.exchangeCodeForSession.mockResolvedValue({
      data: {
        user: { id: 'callback-user', email: 'parent@example.com' },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: 9999999999,
          user: { id: 'callback-user', email: 'parent@example.com' },
        },
      },
      error: null,
    });

    const session = await handleAuthCallback('tutor-sg://auth/callback?code=abc');

    expect(session.accessToken).toBe('mock-access-token');
    expect(session.user?.id).toBe('callback-user');
  });

  it('throws AuthError when exchange fails', async () => {
    supabase.auth.exchangeCodeForSession.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid code' },
    });

    await expect(handleAuthCallback('tutor-sg://auth/callback?code=bad')).rejects.toThrow(
      AuthError,
    );
  });
});

describe('getCurrentSession', () => {
  it('returns null when no session exists', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const session = await getCurrentSession();
    expect(session).toBeNull();
  });
});

describe('signOut', () => {
  it('calls supabase signOut', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });

    await signOut();

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
