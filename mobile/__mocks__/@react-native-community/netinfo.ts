export const useNetInfo = () => ({
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
});
export default { fetch: () => Promise.resolve({}) };
