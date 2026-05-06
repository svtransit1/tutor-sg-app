// Mock react-native-device-info for Jest (node environment)
const DeviceInfo = {
  getDeviceId: () => 'iPhone15,2',
  getDevice: () => 'iPhone15,2',
  getBrand: () => 'Apple',
  getModel: () => 'iPhone 15 Pro',
  getTotalMemory: () => Promise.resolve(8 * 1024 * 1024 * 1024),
  getSystemName: () => 'iOS',
  getSystemVersion: () => '18.0',
};

export default DeviceInfo;
