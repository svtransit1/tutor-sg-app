/**
 * Mock for @supabase/supabase-js.
 *
 * Provides a mock Supabase client suitable for testing auth flows.
 * Auth methods return canned responses that can be overridden in tests.
 */
export function createClient(_url: string, _anonKey: string, _options?: Record<string, unknown>) {
  return {
    auth: {
      signInWithOtp: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithOAuth: jest
        .fn()
        .mockResolvedValue({
          data: { url: 'https://mock.supabase.co/auth/v1/authorize?provider=google' },
          error: null,
        }),
      exchangeCodeForSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            expires_at: 9999999999,
            user: {
              id: 'mock-user-id',
              email: 'parent@example.com',
            },
          },
        },
        error: null,
      }),
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
            expires_at: 9999999999,
            user: {
              id: 'mock-user-id',
              email: 'parent@example.com',
            },
          },
        },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  };
}
