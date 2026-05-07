const speak = jest.fn();
const stop = jest.fn();
const isSpeakingAsync = jest.fn(() => Promise.resolve(false));
const getVoicesAsync = jest.fn(() => Promise.resolve([]));

export { speak, stop, isSpeakingAsync, getVoicesAsync };

export default {
  speak,
  stop,
  isSpeakingAsync,
  getVoicesAsync,
};
