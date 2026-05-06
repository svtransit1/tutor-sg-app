export const launchImageLibraryAsync = jest.fn().mockResolvedValue({ canceled: true, assets: null });
export const launchCameraAsync = jest.fn().mockResolvedValue({ canceled: true, assets: null });
export const requestMediaLibraryPermissionsAsync = jest.fn().mockResolvedValue({ granted: true });
export const requestCameraPermissionsAsync = jest.fn().mockResolvedValue({ granted: true });
export default { launchImageLibraryAsync, launchCameraAsync, requestMediaLibraryPermissionsAsync, requestCameraPermissionsAsync };
