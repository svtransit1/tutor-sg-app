/**
 * Auth service wrapping Supabase Auth for parent sign-in.
 *
 * Provides three sign-in methods:
 * 1. Email magic link — send a PKCE-based magic link to the parent's email
 * 2. Google OAuth — via expo-auth-session
 * 3. Apple OAuth — via expo-auth-session
 *
 * Also exposes sign-out, session retrieval, and auth state change subscription.
 *
 * Per ADD §6.5: parent only — kid profile is local, no auth token.
 * Per ADD §7: backend is minimal — auth via Supabase.
 */
import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';

// ── Constants ──────────────────────────────────────────────────────

const SECURE_STORE_SESSION_KEY = 'supabase_session';

// ── Types ──────────────────────────────────────────────────────────

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  expiresAt?: number;
  user: {
    id: string;
    email?: string;
  } | null;
}

export type AuthErrorCode =
  | 'invalid_email'
  | 'send_failed'
  | 'sign_in_failed'
  | 'session_cancelled';

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ── WebBrowser warm-up ─────────────────────────────────────────────

WebBrowser.maybeCompleteAuthSession();

// ── Redirect URI ───────────────────────────────────────────────────

/**
 * The redirect URI that Supabase Auth will send the user back to.
 * For Expo, this is typically the app's custom scheme + `://auth/callback`.
 * Falls back to a development URL when running in Expo Go.
 */
function getRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'tutor-sg',
    path: 'auth/callback',
    preferLocalhost: true,
  });
}

// ── Secure store helpers ───────────────────────────────────────────

async function persistSession(session: AuthSession): Promise<void> {
  try {
    await SecureStore.setItemAsync(SECURE_STORE_SESSION_KEY, JSON.stringify(session));
  } catch {
    console.warn('[auth] Failed to persist session to secure store');
  }
}

async function loadSession(): Promise<AuthSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(SECURE_STORE_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

async function clearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_STORE_SESSION_KEY);
  } catch {
    // Swallow — best-effort
  }
}

// ── Email helper ───────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Send a magic link email to the parent's email address.
 * Uses the Supabase PKCE flow — the user clicks the link and is
 * redirected back to the app where `handleAuthCallback` must be called.
 *
 * The redirect URL is configured in the Supabase project settings under
 * Authentication > URL Configuration > Redirect URLs.
 *
 * @param email - Parent's email address
 * @throws AuthError if email is invalid or sending fails
 */
export async function signInWithMagicLink(email: string): Promise<void> {
  const trimmed = email.trim();

  if (!isValidEmail(trimmed)) {
    throw new AuthError('invalid_email', `Invalid email address: "${trimmed}"`);
  }

  const redirectUri = getRedirectUri();

  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: redirectUri,
      shouldCreateUser: true,
    },
  });

  if (error) {
    throw new AuthError('send_failed', error.message);
  }
}

/**
 * Sign in with Google OAuth via expo-auth-session.
 *
 * Opens the system browser for the OAuth flow and handles the
 * redirect back with the session tokens.
 *
 * @returns The authenticated session
 * @throws AuthError if the flow is cancelled or fails
 */
export async function signInWithGoogle(): Promise<AuthSession> {
  const redirectUri = getRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    throw new AuthError('sign_in_failed', error?.message ?? 'No OAuth URL returned');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri, {
    preferEphemeralSession: true,
    showInRecents: true,
  });

  if (result.type === 'cancel' || result.type === 'dismiss' || result.type === 'locked') {
    throw new AuthError('session_cancelled', 'OAuth session was cancelled');
  }

  // The callback URL from the browser redirect includes the PKCE code
  const callbackUrl = result.type === 'success' ? result.url : redirectUri;
  return handleAuthCallback(callbackUrl);
}

/**
 * Sign in with Apple OAuth via expo-auth-session.
 *
 * Same flow as Google but with Apple as the provider.
 *
 * @returns The authenticated session
 * @throws AuthError if the flow is cancelled or fails
 */
export async function signInWithApple(): Promise<AuthSession> {
  const redirectUri = getRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    throw new AuthError('sign_in_failed', error?.message ?? 'No OAuth URL returned');
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri, {
    preferEphemeralSession: true,
    showInRecents: true,
  });

  if (result.type === 'cancel' || result.type === 'dismiss' || result.type === 'locked') {
    throw new AuthError('session_cancelled', 'OAuth session was cancelled');
  }

  const callbackUrl = result.type === 'success' ? result.url : redirectUri;
  return handleAuthCallback(callbackUrl);
}

/**
 * Handle the auth callback URL from a magic link or OAuth redirect.
 *
 * This extracts the PKCE code from the URL and exchanges it for a session.
 * Call this from your deep-link handler or from the screen that receives
 * the callback URL.
 *
 * @param url - The callback URL containing the PKCE code
 * @returns The authenticated session
 * @throws AuthError if the exchange fails
 */
export async function handleAuthCallback(url: string): Promise<AuthSession> {
  const { data, error } = await supabase.auth.exchangeCodeForSession(url);

  if (error || !data.session) {
    throw new AuthError('sign_in_failed', error?.message ?? 'Failed to exchange code for session');
  }

  const session: AuthSession = {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in,
    expiresAt: data.session.expires_at,
    user: data.session.user
      ? {
          id: data.session.user.id,
          email: data.session.user.email ?? undefined,
        }
      : null,
  };

  await persistSession(session);
  return session;
}

/**
 * Get the current session from the secure store.
 * Returns null if no session has been persisted.
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  // First try the in-memory Supabase session
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      expiresAt: data.session.expires_at,
      user: data.session.user
        ? { id: data.session.user.id, email: data.session.user.email ?? undefined }
        : null,
    };
  }

  // Fall back to secure store
  return loadSession();
}

/**
 * Sign the user out, clearing the session from Supabase and secure store.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  await clearSession();
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(
  callback: (session: AuthSession | null) => void,
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      callback({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresIn: session.expires_in,
        expiresAt: session.expires_at,
        user: session.user
          ? { id: session.user.id, email: session.user.email ?? undefined }
          : null,
      });
    } else {
      callback(null);
    }
  });

  return () => subscription.unsubscribe();
}
