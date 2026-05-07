const React = require('react');
const { View } = require('react-native');

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
};

module.exports = {
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Stack: {
    Screen: ({ children }: { children?: React.ReactNode }) => children || null,
  },
  Tabs: ({ children }: { children?: React.ReactNode }) =>
    React.createElement(View, null, children),
  Link: ({ children, ...props }: { children: React.ReactNode }) =>
    React.createElement(View, props, children),
  router: mockRouter,
};
