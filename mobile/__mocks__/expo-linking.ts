export const createURL = jest.fn((path: string) => `mock://${path}`);
export const openURL = jest.fn().mockResolvedValue(true);
export const useURL = jest.fn().mockReturnValue(null);
export const useLinkingURL = jest.fn().mockReturnValue(null);
export const sendIntent = jest.fn();
export default { createURL, openURL, useURL, useLinkingURL, sendIntent };
