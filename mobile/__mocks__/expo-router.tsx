import React from 'react';
import { View, Text } from 'react-native';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockDismiss = jest.fn();
const mockDismissAll = jest.fn();
const mockNavigate = jest.fn();
const mockCanGoBack = jest.fn(() => true);

export const useRouter = () => ({
  push: mockPush,
  replace: mockReplace,
  back: mockBack,
  dismiss: mockDismiss,
  dismissAll: mockDismissAll,
  navigate: mockNavigate,
  canGoBack: mockCanGoBack,
});

export const useLocalSearchParams = () => ({});
export const useGlobalSearchParams = () => ({});
export const useSegments = () => ['(onboarding)', 'welcome'];
export const usePathname = () => '/(onboarding)/welcome';
export const useFocusEffect = (cb: () => void) => React.useEffect(() => cb(), [cb]);

export const Redirect = ({ href }: { href: string }) => {
  mockPush(href);
  return React.createElement(View, null, null);
};

export const Link = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return React.createElement(
    Text,
    { onPress: () => mockPush(href), role: 'link' },
    children,
  );
};

export const Stack = {
  Screen: ({ name }: { name: string }) => React.createElement(View, { testID: `stack-screen-${name}` }),
};

export const Tabs = {
  Screen: ({ name }: { name: string }) => React.createElement(View, { testID: `tab-screen-${name}` }),
};

export const Slot = () => React.createElement(View, { testID: 'slot' });

export default {
  useRouter,
  useLocalSearchParams,
  useGlobalSearchParams,
  useSegments,
  usePathname,
  useFocusEffect,
  Redirect,
  Link,
  Stack,
  Tabs,
  Slot,
};

// Expose mocks for test assertions
export const __mockPush = mockPush;
export const __mockReplace = mockReplace;
export const __mockBack = mockBack;
