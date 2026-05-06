export const useLinking = () => {};
export const createURL = () => 'mock://app';
export const openURL = jest.fn();
export const canOpenURL = jest.fn(() => Promise.resolve(true));
export const getInitialURL = jest.fn(() => Promise.resolve(null));
export const addEventListener = jest.fn(() => ({ remove: jest.fn() }));
export const parse = jest.fn();
