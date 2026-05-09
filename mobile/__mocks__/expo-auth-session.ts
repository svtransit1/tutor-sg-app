export const makeRedirectUri = jest.fn(
  (_opts?: Record<string, unknown>) => 'tutor-sg://auth/callback',
);

export function useAuthRequest(
  _config: Record<string, unknown>,
  _discovery?: Record<string, unknown>,
) {
  return [
    null,
    null,
    jest.fn().mockResolvedValue({ type: 'success', params: { code: 'mock-code' } }),
  ] as const;
}
