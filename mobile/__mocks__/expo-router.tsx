export const router = {
  back: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
};
export const useLocalSearchParams = jest.fn().mockReturnValue({});
export const useSegments = jest.fn().mockReturnValue([]);
export const Stack = { Screen: 'StackScreen' };
export const Tabs = { Screen: 'TabsScreen' };
export default { router, useLocalSearchParams, useSegments, Stack, Tabs };
