/**
 * Mock for expo-web-browser.
 */
const WebBrowser = {
  openAuthSessionAsync: jest.fn(async (_url: string, _redirectUrl: string) => {
    return { type: 'cancel' as const };
  }),
  maybeCompleteAuthSession: jest.fn(),
  dismissBrowser: jest.fn(),
  warmUpAsync: jest.fn(),
  coolDownAsync: jest.fn(),
};

export { WebBrowser };
export default WebBrowser;
