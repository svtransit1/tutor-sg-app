import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SkeletonPrimitive (default export)', () => {
    it('renders with default props', () => {
      render(<Skeleton isDark={false} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('renders with custom dimensions', () => {
      render(<Skeleton isDark={false} width={200} height={32} borderRadius={8} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('has accessibility role and label', () => {
      render(<Skeleton isDark={false} />);
      const el = screen.getByLabelText('Loading');
      expect(el.props.accessibilityRole).toBe('image');
    });

    it('has accessibilityLiveRegion polite', () => {
      render(<Skeleton isDark={false} />);
      expect(screen.getByLabelText('Loading').props.accessibilityLiveRegion).toBe('polite');
    });

    it('accepts custom style prop', () => {
      render(<Skeleton isDark={false} style={{ marginTop: 10 }} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });
  });

  describe('Skeleton.Line', () => {
    it('renders with default props', () => {
      render(<Skeleton.Line isDark={false} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('renders with custom width', () => {
      render(<Skeleton.Line isDark={false} width="50%" />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('has accessibility role', () => {
      render(<Skeleton.Line isDark={false} />);
      expect(screen.getByLabelText('Loading').props.accessibilityRole).toBe('image');
    });
  });

  describe('Skeleton.Circle', () => {
    it('renders with default size', () => {
      render(<Skeleton.Circle isDark={false} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('renders with custom size', () => {
      render(<Skeleton.Circle isDark={false} size={64} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('has accessibility role', () => {
      render(<Skeleton.Circle isDark={false} />);
      expect(screen.getByLabelText('Loading').props.accessibilityRole).toBe('image');
    });
  });

  describe('Skeleton.Card', () => {
    it('renders with default height', () => {
      render(<Skeleton.Card isDark={false} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('renders with custom height', () => {
      render(<Skeleton.Card isDark={false} height={200} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('has accessibility role', () => {
      render(<Skeleton.Card isDark={false} />);
      expect(screen.getByLabelText('Loading').props.accessibilityRole).toBe('image');
    });
  });

  describe('Skeleton.Button', () => {
    it('renders with default height', () => {
      render(<Skeleton.Button isDark={false} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('renders with custom height', () => {
      render(<Skeleton.Button isDark={false} height={60} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('has accessibility role', () => {
      render(<Skeleton.Button isDark={false} />);
      expect(screen.getByLabelText('Loading').props.accessibilityRole).toBe('image');
    });
  });

  describe('dark mode', () => {
    it('renders Skeleton with dark mode', () => {
      render(<Skeleton isDark />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('renders Line with dark mode', () => {
      render(<Skeleton.Line isDark />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('renders Circle with dark mode', () => {
      render(<Skeleton.Circle isDark />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('renders Card with dark mode', () => {
      render(<Skeleton.Card isDark />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('renders Button with dark mode', () => {
      render(<Skeleton.Button isDark />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('Skeleton has accessible loading label', () => {
      render(<Skeleton isDark={false} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('Skeleton.Line has accessible loading label', () => {
      render(<Skeleton.Line isDark={false} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('Skeleton.Circle has accessible loading label', () => {
      render(<Skeleton.Circle isDark={false} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('Skeleton.Card has accessible loading label', () => {
      render(<Skeleton.Card isDark={false} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });

    it('Skeleton.Button has accessible loading label', () => {
      render(<Skeleton.Button isDark={false} />);
      expect(screen.getByLabelText('Loading')).toBeTruthy();
    });
  });
});
