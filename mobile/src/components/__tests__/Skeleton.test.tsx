import React from 'react';
import { render } from '@testing-library/react-native';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('renders a rectangle with default props', () => {
    const { UNSAFE_root } = render(<Skeleton />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with custom width and height', () => {
    const { UNSAFE_root } = render(<Skeleton width="60%" height={20} borderRadius={4} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders in dark mode', () => {
    const { UNSAFE_root } = render(<Skeleton isDark />);
    expect(UNSAFE_root).toBeTruthy();
  });

  describe('Skeleton.Circle', () => {
    it('renders a circle', () => {
      const { UNSAFE_root } = render(<Skeleton.Circle size={28} />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Skeleton.Button', () => {
    it('renders a button-shaped skeleton', () => {
      const { UNSAFE_root } = render(<Skeleton.Button height={44} />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
