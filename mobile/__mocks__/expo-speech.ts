export const speak = jest.fn();
export const stop = jest.fn();
export const isSpeakingAsync = jest.fn(() => Promise.resolve(false));
export const getVoicesAsync = jest.fn(() => Promise.resolve([]));
