export const detectDeviceTier = jest.fn().mockResolvedValue('high');
export const getDeviceTier = jest.fn().mockReturnValue('high');
export const useDeviceTier = jest.fn().mockReturnValue({ tier: 'high', loading: false, error: null });
export default { detectDeviceTier, getDeviceTier, useDeviceTier };
