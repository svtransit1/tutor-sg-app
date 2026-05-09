const WebBrowser = {
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn().mockResolvedValue({
    type: 'success',
    url: 'tutor-sg://auth/callback?code=mock-code',
  }),
  openBrowserAsync: jest.fn().mockResolvedValue({ type: 'opened' }),
  dismissBrowser: jest.fn(),
  dismissAuthSession: jest.fn(),
};

export default WebBrowser;
