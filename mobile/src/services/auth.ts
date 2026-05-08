export class AuthError extends Error {
  constructor(
    public code: 'invalid_email' | 'send_failed' | 'sign_in_failed' | 'session_cancelled' | 'not_implemented',
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

interface AuthUser { id: string; email: string; provider: 'email' | 'google' | 'apple'; }
interface AuthSession { user: AuthUser | null; accessToken: string | null; }

let currentSession: AuthSession | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function signInWithMagicLink(email: string): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new AuthError('invalid_email', `Invalid email: ${trimmed}`);
  }
  if (process.env.NODE_ENV === 'test') return;
  await delay(800);
}

export async function signInWithGoogle(): Promise<void> {
  if (process.env.NODE_ENV === 'test') {
    currentSession = { user: { id: 'google-test-user', email: 'google-user@example.com', provider: 'google' }, accessToken: 'mock-google-token' };
    return;
  }
  await delay(600);
  currentSession = { user: { id: 'google-user-1', email: 'parent@example.com', provider: 'google' }, accessToken: 'mock-google-token' };
}

export async function signInWithApple(): Promise<void> {
  if (process.env.NODE_ENV === 'test') {
    currentSession = { user: { id: 'apple-test-user', email: 'apple-user@example.com', provider: 'apple' }, accessToken: 'mock-apple-token' };
    return;
  }
  await delay(600);
  currentSession = { user: { id: 'apple-user-1', email: 'parent@icloud.com', provider: 'apple' }, accessToken: 'mock-apple-token' };
}

export async function handleAuthCallback(url: string): Promise<void> {
  if (!url.includes('auth/callback')) throw new AuthError('sign_in_failed', 'Invalid callback URL');
  if (process.env.NODE_ENV === 'test') {
    currentSession = { user: { id: 'callback-test-user', email: 'callback@example.com', provider: 'email' }, accessToken: 'mock-callback-token' };
    return;
  }
  await delay(300);
  currentSession = { user: { id: 'cb-user-1', email: 'parent@example.com', provider: 'email' }, accessToken: 'mock-callback-token' };
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  if (process.env.NODE_ENV === 'test') return currentSession;
  await delay(100);
  return currentSession;
}

export function signOut(): void { currentSession = null; }
