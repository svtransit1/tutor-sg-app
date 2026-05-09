import { signInWithMagicLink, signInWithGoogle, signUp, signIn, handleAuthCallback, getCurrentSession, signOut, onAuthStateChange, AuthError } from '../auth';
import { supabase } from '../supabase';
import * as SecureStore from 'expo-secure-store';

jest.mock('../supabase', () => ({ supabase: { auth: { signInWithOtp: jest.fn(), signInWithOAuth: jest.fn(), signUp: jest.fn(), signInWithPassword: jest.fn(), exchangeCodeForSession: jest.fn(), getSession: jest.fn(), signOut: jest.fn(), onAuthStateChange: jest.fn() } } }));
jest.mock('expo-web-browser', () => ({ maybeCompleteAuthSession: jest.fn(), openAuthSessionAsync: jest.fn() }));
jest.mock('expo-auth-session', () => ({ makeRedirectUri: jest.fn(() => 'tutor-sg://auth/callback') }));
jest.mock('expo-secure-store', () => { const m = new Map<string, string>(); return { getItemAsync: jest.fn(async (k: string) => m.get(k) ?? null), setItemAsync: jest.fn(async (k: string, v: string) => { m.set(k, v); }), deleteItemAsync: jest.fn(async (k: string) => { m.delete(k); }), isAvailableAsync: jest.fn(async () => true) }; });

beforeEach(() => jest.clearAllMocks());
const sess = { access_token: 'tok', refresh_token: 'ref', expires_in: 3600, expires_at: 9999999999, user: { id: 'u', email: 'p@e.com' } };

describe('signInWithMagicLink', () => {
  it('throws for invalid email', async () => { await expect(signInWithMagicLink('bad')).rejects.toMatchObject({ code: 'invalid_email' }); });
  it('calls signInWithOtp', async () => { (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValueOnce({ data: {}, error: null }); await signInWithMagicLink('parent@example.com'); expect(supabase.auth.signInWithOtp).toHaveBeenCalled(); });
  it('throws on error', async () => { (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValueOnce({ data: null, error: new Error('fail') }); await expect(signInWithMagicLink('parent@example.com')).rejects.toMatchObject({ code: 'send_failed' }); });
});

describe('signUp', () => {
  it('throws invalid email', async () => { await expect(signUp('bad', 'password123')).rejects.toMatchObject({ code: 'invalid_email' }); });
  it('throws short password', async () => { await expect(signUp('a@b.com', '12345')).rejects.toMatchObject({ code: 'invalid_password' }); });
  it('returns session', async () => { (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({ data: { user: sess.user, session: sess }, error: null }); expect((await signUp('parent@example.com', 'password123')).accessToken).toBe('tok'); });
  it('persists to SecureStore', async () => { (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({ data: { user: sess.user, session: sess }, error: null }); await signUp('parent@example.com', 'password123'); expect(SecureStore.setItemAsync).toHaveBeenCalledWith('supabase_session', expect.any(String)); });
  it('throws on supabase error', async () => { (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({ data: null, error: new Error('exists') }); await expect(signUp('parent@example.com', 'password123')).rejects.toMatchObject({ code: 'sign_up_failed' }); });
});

describe('signIn', () => {
  it('calls signInWithPassword', async () => { (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ data: { user: sess.user, session: sess }, error: null }); expect((await signIn('parent@example.com', 'password123')).accessToken).toBe('tok'); });
  it('throws on wrong creds', async () => { (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ data: null, error: new Error('invalid') }); await expect(signIn('parent@example.com', 'password123')).rejects.toMatchObject({ code: 'sign_in_failed' }); });
});

describe('signInWithGoogle', () => {
  it('exchanges OAuth session', async () => { (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({ data: { url: 'https://auth' }, error: null }); require('expo-web-browser').openAuthSessionAsync.mockResolvedValueOnce({ type: 'success', url: 'tutor-sg://auth/callback?code=abc' }); (supabase.auth.exchangeCodeForSession as jest.Mock).mockResolvedValueOnce({ data: { session: { access_token: 'oauth', refresh_token: 'ref', user: { id: 'u', email: 'e@e.com' } } }, error: null }); expect((await signInWithGoogle()).accessToken).toBe('oauth'); });
  it('throws on cancel', async () => { (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({ data: { url: 'https://auth' }, error: null }); require('expo-web-browser').openAuthSessionAsync.mockResolvedValueOnce({ type: 'cancel' }); await expect(signInWithGoogle()).rejects.toMatchObject({ code: 'session_cancelled' }); });
});

describe('handleAuthCallback', () => {
  it('exchanges code', async () => { (supabase.auth.exchangeCodeForSession as jest.Mock).mockResolvedValueOnce({ data: { session: { access_token: 'cb', refresh_token: 'r', user: { id: 'u', email: 'e@e.com' } } }, error: null }); expect((await handleAuthCallback('tutor-sg://auth/callback?code=abc')).accessToken).toBe('cb'); });
});

describe('getCurrentSession', () => {
  it('returns supabase session', async () => { (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ data: { session: { access_token: 'live', refresh_token: 'r', user: { id: 'u', email: 'e@e.com' } } }, error: null }); expect((await getCurrentSession())?.accessToken).toBe('live'); });
});

describe('signOut', () => {
  it('signs out and clears store', async () => { (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null }); await signOut(); expect(supabase.auth.signOut).toHaveBeenCalled(); expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('supabase_session'); });
});

describe('onAuthStateChange', () => {
  it('returns unsubscribe', () => { const unsub = jest.fn(); (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({ data: { subscription: { unsubscribe: unsub } } }); const fn = onAuthStateChange(jest.fn()); fn(); expect(unsub).toHaveBeenCalled(); });
});
