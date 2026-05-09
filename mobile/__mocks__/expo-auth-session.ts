export const makeRedirectUri = jest.fn(() => 'tutor-sg://auth/callback');
export function useAuthRequest() { return [null, null, jest.fn()] as const; }
