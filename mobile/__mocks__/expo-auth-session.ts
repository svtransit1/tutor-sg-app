/**
 * Mock for expo-auth-session.
 * Provides makeRedirectUri and useAuthRequest for testing.
 */
const AuthSession = {
  makeRedirectUri: jest.fn((options?: { scheme?: string; path?: string }) => {
    const scheme = options?.scheme ?? 'tutor-sg';
    const path = options?.path ?? '';
    return `${scheme}://${path}`;
  }),
  useAuthRequest: jest.fn(() => {
    return [
      null, // request
      null, // response
      jest.fn(), // promptAsync
    ];
  }),
};

export { AuthSession };
export const makeRedirectUri = AuthSession.makeRedirectUri;
export const useAuthRequest = AuthSession.useAuthRequest;
export default AuthSession;
