import React from 'react';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

export function useRouter() {
  return {
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    canGoBack: () => true,
  };
}

export function useLocalSearchParams() {
  return {};
}

export function useSegments() {
  return ['(onboarding)', 'welcome'];
}

export function usePathname() {
  return '/(onboarding)/welcome';
}

export function useNavigation() {
  return { navigate: jest.fn(), goBack: jest.fn() };
}

export function Stack() {
  return null;
}

export function Tabs() {
  return null;
}

export const router = {
  push: mockPush,
  replace: mockReplace,
  back: mockBack,
};

export const Link = ({ children, ...props }: any) =>
  React.createElement('Link', props, children);

export const Redirect = ({ href }: { href: string }) => null;

export const useFocusEffect = (cb: () => void | (() => void)) => {
  React.useEffect(() => {
    const cleanup = cb();
    return cleanup;
  }, []);
};

export default {
  useRouter,
  useLocalSearchParams,
  useSegments,
  usePathname,
  useNavigation,
  Stack,
  Tabs,
  router,
  Link,
  Redirect,
  useFocusEffect,
};
