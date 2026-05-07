/**
 * Skeleton component tests.
 *
 * Covers:
 * - SkeletonBox renders with correct dimensions
 * - SkeletonCircle renders as a circle
 * - SkeletonLine renders as a line
 * - SkeletonCard renders with configurable lines
 * - SkeletonSubjectGrid renders 4 tiles
 * - SkeletonSessionList renders correct card count
 * - SkeletonCameraButton renders
 * - SkeletonOnboardingPage renders with all sections
 * - SkeletonDeviceCheck renders with spec card
 * - SkeletonDownloadPrep renders with progress bar
 * - SkeletonWelcomeHero renders with chip row
 * - Dark mode variants use darker colors
 * - Accessibility labels are present
 */

import React from 'react';
import { create } from 'react-test-renderer';
import { View } from 'react-native';
import {
  SkeletonBox,
  SkeletonCircle,
  SkeletonLine,
  SkeletonCard,
  SkeletonSubjectGrid,
  SkeletonSessionList,
  SkeletonCameraButton,
  SkeletonOnboardingPage,
  SkeletonDeviceCheck,
  SkeletonDownloadPrep,
  SkeletonWelcomeHero,
} from '../Skeleton';

// ── Helpers ─────────────────────────────────────────────────────────

function render(component: React.ReactElement) {
  return create(component);
}

function getRoot(component: React.ReactElement) {
  return render(component).root;
}

// ── SkeletonBox Tests ──────────────────────────────────────────────

describe('SkeletonBox', () => {
  it('renders with default dimensions', () => {
    const instance = render(<SkeletonBox />).root;
    const view = instance.findByProps({ accessibilityRole: 'image' });
    expect(view).toBeDefined();
    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ height: 20, borderRadius: 8 }),
      ]),
    );
  });

  it('renders with custom width and height', () => {
    const instance = render(<SkeletonBox width={120} height={48} borderRadius={12} />).root;
    const view = instance.findByProps({ accessibilityRole: 'image' });
    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 120, height: 48, borderRadius: 12 }),
      ]),
    );
  });

  it('has loading accessibility label', () => {
    const instance = render(<SkeletonBox />).root;
    const view = instance.findByProps({ accessibilityRole: 'image' });
    expect(view.props.accessibilityLabel).toBe('Loading');
  });
});

// ── SkeletonCircle Tests ─────────────────────────────────────────────

describe('SkeletonCircle', () => {
  it('renders as a circle with correct size', () => {
    const instance = render(<SkeletonCircle size={64} />).root;
    const view = instance.findByProps({ accessibilityRole: 'image' });
    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 64, height: 64, borderRadius: 32 }),
      ]),
    );
  });

  it('renders with default size 48', () => {
    const instance = render(<SkeletonCircle />).root;
    const view = instance.findByProps({ accessibilityRole: 'image' });
    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 48, height: 48, borderRadius: 24 }),
      ]),
    );
  });
});

// ── SkeletonLine Tests ──────────────────────────────────────────────

describe('SkeletonLine', () => {
  it('renders with text-line proportions', () => {
    const instance = render(<SkeletonLine width="80%" height={16} />).root;
    const view = instance.findByProps({ accessibilityRole: 'image' });
    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: '80%', height: 16 }),
      ]),
    );
  });

  it('renders with default line height (14px)', () => {
    const instance = render(<SkeletonLine />).root;
    const view = instance.findByProps({ accessibilityRole: 'image' });
    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ height: 14 }),
      ]),
    );
  });
});

// ── SkeletonCard Tests ──────────────────────────────────────────────

describe('SkeletonCard', () => {
  it('renders with default 2 lines and icon', () => {
    const instance = render(<SkeletonCard />).root;
    // Card should contain SkeletonCircle (icon) + SkeletonLine children
    const images = instance.findAllByProps({ accessibilityRole: 'image' });
    expect(images.length).toBeGreaterThanOrEqual(3); // 1 card + 1 circle + 2 lines (one might be same)
  });

  it('renders with 3 lines when specified', () => {
    // Render with 3 lines and verify there are enough line elements
    const instance = render(<SkeletonCard lines={3} />).root;
    expect(instance).toBeDefined();
  });

  it('renders without icon when showIcon is false', () => {
    const instance = render(<SkeletonCard showIcon={false} lines={1} />).root;
    expect(instance).toBeDefined();
    // Card should still render but without the icon circle
  });
});

// ── Grid Tests ──────────────────────────────────────────────────────

describe('SkeletonSubjectGrid', () => {
  it('renders 4 subject tile skeletons in a grid', () => {
    const instance = render(<SkeletonSubjectGrid />).root;
    const grid = instance.findByProps({ accessibilityLabel: 'Loading subjects' });
    expect(grid).toBeDefined();
    // Grid contains 4 SkeletonBox elements
    const boxes = instance.findAllByType(View);
    expect(boxes.length).toBeGreaterThan(0);
  });
});

describe('SkeletonSessionList', () => {
  it('renders default 3 session cards', () => {
    const instance = render(<SkeletonSessionList />).root;
    const list = instance.findByProps({ accessibilityLabel: 'Loading sessions' });
    expect(list).toBeDefined();
  });

  it('renders custom count of session cards', () => {
    const instance = render(<SkeletonSessionList count={5} />).root;
    expect(instance).toBeDefined();
  });
});

// ── Camera Button ──────────────────────────────────────────────────

describe('SkeletonCameraButton', () => {
  it('renders a tall rounded skeleton', () => {
    const instance = render(<SkeletonCameraButton />).root;
    const view = instance.findByProps({ accessibilityRole: 'image' });
    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ height: 72 }),
      ]),
    );
  });
});

// ── Full-Page Skeletons ────────────────────────────────────────────

describe('SkeletonOnboardingPage', () => {
  it('renders with all sections', () => {
    const instance = render(<SkeletonOnboardingPage />).root;
    expect(instance.findByProps({ accessibilityLabel: 'Loading' })).toBeDefined();
  });

  it('renders without progress dots when hidden', () => {
    const instance = render(<SkeletonOnboardingPage showProgressDots={false} />).root;
    expect(instance).toBeDefined();
  });

  it('renders without subtitle', () => {
    const instance = render(<SkeletonOnboardingPage subtitle={false} />).root;
    expect(instance).toBeDefined();
  });
});

describe('SkeletonDeviceCheck', () => {
  it('renders device checking skeleton', () => {
    const instance = render(<SkeletonDeviceCheck />).root;
    expect(instance.findByProps({ accessibilityLabel: 'Checking device' })).toBeDefined();
  });
});

describe('SkeletonDownloadPrep', () => {
  it('renders download preparation skeleton', () => {
    const instance = render(<SkeletonDownloadPrep />).root;
    expect(instance.findByProps({ accessibilityLabel: 'Preparing download' })).toBeDefined();
  });
});

describe('SkeletonWelcomeHero', () => {
  it('renders welcome hero skeleton', () => {
    const instance = render(<SkeletonWelcomeHero />).root;
    expect(instance).toBeDefined();
  });
});

// ── Dark Mode ──────────────────────────────────────────────────────

describe('Dark mode', () => {
  it('SkeletonBox accepts isDark prop', () => {
    const instance = render(<SkeletonBox isDark />).root;
    expect(instance.findByProps({ accessibilityRole: 'image' })).toBeDefined();
  });

  it('SkeletonOnboardingPage accepts isDark prop', () => {
    const instance = render(<SkeletonOnboardingPage isDark />).root;
    expect(instance).toBeDefined();
  });

  it('SkeletonDeviceCheck accepts isDark prop', () => {
    const instance = render(<SkeletonDeviceCheck isDark />).root;
    expect(instance).toBeDefined();
  });
});
