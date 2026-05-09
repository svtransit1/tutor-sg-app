const maybeCompleteAuthSession = jest.fn();
const openAuthSessionAsync = jest.fn().mockResolvedValue({ type: 'success', url: 'tutor-sg://auth/callback?code=mock-code' });
export { maybeCompleteAuthSession, openAuthSessionAsync };
