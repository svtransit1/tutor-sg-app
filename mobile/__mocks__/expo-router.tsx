import React from 'react';
export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};
export const useRouter = () => router;
export const usePathname = () => '/';
export const useLocalSearchParams = () => ({});
export const Link = ({ children, ...props }: any) => React.createElement('a', props, children);
export const Stack = {
  Screen: ({ children, ...props }: any) => React.createElement('div', null, children),
};
export const Redirect = ({ href }: any) => null;
