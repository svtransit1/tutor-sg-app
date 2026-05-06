export const makeRedirectUri = () => 'mock://redirect';
export const useAuthRequest = () => [{}, null, () => {}];
export const AuthRequest = { promptAsync: jest.fn() };
