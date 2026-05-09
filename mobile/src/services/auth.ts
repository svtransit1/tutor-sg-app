import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { makeRedirectUri } from 'expo-auth-session';

const SESSION_KEY = 'supabase_session';
const EMAIL_KEY = 'supabase_email';

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  expiresAt?: number;
  user: { id: string; email?: string } | null;
}

export type AuthErrorCode = 'invalid_email' | 'invalid_password' | 'send_failed' | 'sign_in_failed' | 'sign_up_failed' | 'session_cancelled';

export class AuthError extends Error {
  constructor(public code: AuthErrorCode, message: string) { super(message); this.name = 'AuthError'; }
}

WebBrowser.maybeCompleteAuthSession();

function getRedirectUri(): string { return makeRedirectUri({ scheme: 'tutor-sg', path: 'auth/callback', preferLocalhost: true }); }

async function persistSession(session: AuthSession): Promise<void> {
  try { await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session)); } catch { console.warn('[auth] Failed to persist session'); }
}

async function persistEmail(email: string): Promise<void> {
  try { await SecureStore.setItemAsync(EMAIL_KEY, email); } catch { console.warn('[auth] Failed to persist email'); }
}

export async function loadSession(): Promise<AuthSession | null> {
  try { const raw = await SecureStore.getItemAsync(SESSION_KEY); return raw ? (JSON.parse(raw) as AuthSession) : null; } catch { return null; }
}

async function clearSession(): Promise<void> { try { await SecureStore.deleteItemAsync(SESSION_KEY); } catch {} }

export async function getPersistedEmail(): Promise<string | null> {
  try { return await SecureStore.getItemAsync(EMAIL_KEY); } catch { return null; }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email: string): boolean { return EMAIL_RE.test(email.trim()); }
function isValidPassword(password: string): boolean { return password.length >= 6; }

interface RawSession { access_token: string; refresh_token: string; expires_in?: number; expires_at?: number; user?: { id: string; email?: string } | null; }

function mapSession(s: RawSession): AuthSession {
  return { accessToken: s.access_token, refreshToken: s.refresh_token, expiresIn: s.expires_in, expiresAt: s.expires_at, user: s.user ? { id: s.user.id, email: s.user.email ?? undefined } : null };
}

export async function signUp(email: string, password: string): Promise<AuthSession> {
  const t = email.trim();
  if (!isValidEmail(t)) throw new AuthError('invalid_email', `Invalid email: "${t}"`);
  if (!isValidPassword(password)) throw new AuthError('invalid_password', 'Password must be at least 6 characters');
  const { data, error } = await supabase.auth.signUp({ email: t, password });
  if (error) throw new AuthError('sign_up_failed', error.message);
  if (!data.session) throw new AuthError('sign_up_failed', 'No session returned');
  const session = mapSession(data.session);
  await persistSession(session);
  await persistEmail(t);
  return session;
}

export async function signIn(email: string, password: string): Promise<AuthSession> {
  const t = email.trim();
  if (!isValidEmail(t)) throw new AuthError('invalid_email', `Invalid email: "${t}"`);
  if (!isValidPassword(password)) throw new AuthError('invalid_password', 'Password must be at least 6 characters');
  const { data, error } = await supabase.auth.signInWithPassword({ email: t, password });
  if (error) throw new AuthError('sign_in_failed', error.message);
  if (!data.session) throw new AuthError('sign_in_failed', 'No session returned');
  const session = mapSession(data.session);
  await persistSession(session);
  await persistEmail(t);
  return session;
}

export async function signInWithMagicLink(email: string): Promise<void> {
  const t = email.trim();
  if (!isValidEmail(t)) throw new AuthError('invalid_email', `Invalid email: "${t}"`);
  const { error } = await supabase.auth.signInWithOtp({ email: t, options: { emailRedirectTo: getRedirectUri(), shouldCreateUser: true } });
  if (error) throw new AuthError('send_failed', error.message);
  await persistEmail(t);
}

export async function signInWithGoogle(): Promise<AuthSession> {
  const redirectUri = getRedirectUri();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUri, skipBrowserRedirect: true } });
  if (error || !data?.url) throw new AuthError('sign_in_failed', error?.message ?? 'No OAuth URL');
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri, { preferEphemeralSession: true, showInRecents: true });
  if (result.type === 'cancel' || result.type === 'dismiss' || result.type === 'locked') throw new AuthError('session_cancelled', 'OAuth session cancelled');
  const callbackUrl = result.type === 'success' ? result.url : redirectUri;
  return handleAuthCallback(callbackUrl);
}

export async function signInWithApple(): Promise<AuthSession> {
  const redirectUri = getRedirectUri();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: redirectUri, skipBrowserRedirect: true } });
  if (error || !data?.url) throw new AuthError('sign_in_failed', error?.message ?? 'No OAuth URL');
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri, { preferEphemeralSession: true, showInRecents: true });
  if (result.type === 'cancel' || result.type === 'dismiss' || result.type === 'locked') throw new AuthError('session_cancelled', 'OAuth session cancelled');
  const callbackUrl = result.type === 'success' ? result.url : redirectUri;
  return handleAuthCallback(callbackUrl);
}

export async function handleAuthCallback(url: string): Promise<AuthSession> {
  const { data, error } = await supabase.auth.exchangeCodeForSession(url);
  if (error || !data.session) throw new AuthError('sign_in_failed', error?.message ?? 'Failed to exchange code for session');
  const session = mapSession(data.session);
  await persistSession(session);
  return session;
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return mapSession(data.session);
  return loadSession();
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  await clearSession();
}

export function onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: RawSession | null) => { callback(session ? mapSession(session) : null); });
  return () => subscription.unsubscribe();
}
