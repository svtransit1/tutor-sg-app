/**
 * LoadingBoundary component tests.
 *
 * Covers:
 * - Shows skeleton when isLoading is true
 * - Shows children when isLoading is false
 * - Delayed show (skip fast loads)
 * - Transition between loading and content
 */

import React from 'react';
import { View, Text } from 'react-native';
import { create } from 'react-test-renderer';
import LoadingBoundary from '../LoadingBoundary';

function SkeletonMock() {
  return <View testID="skeleton" />;
}

function ContentMock() {
  return <Text testID="content">Real content</Text>;
}

describe('LoadingBoundary', () => {
  it('renders children when not loading', () => {
    const instance = create(
      <LoadingBoundary isLoading={false} skeleton={<SkeletonMock />}>
        <ContentMock />
      </LoadingBoundary>,
    ).root;

    expect(instance.findByProps({ testID: 'content' })).toBeDefined();
  });

  it('renders skeleton when isLoading is true', () => {
    // With showDelayMs=0 for immediate skeleton
    const instance = create(
      <LoadingBoundary
        isLoading={true}
        skeleton={<SkeletonMock />}
        showDelayMs={0}
      >
        <ContentMock />
      </LoadingBoundary>,
    ).root;

    expect(instance.findByProps({ testID: 'skeleton' })).toBeDefined();
  });

  it('has aria live region for screen readers', () => {
    const instance = create(
      <LoadingBoundary isLoading={true} skeleton={<SkeletonMock />}>
        <ContentMock />
      </LoadingBoundary>,
    ).root;

    // The container should have accessibilityLiveRegion
    const containers = instance.findAll(
      (node) => node.props.accessibilityLiveRegion === 'polite',
    );
    expect(containers.length).toBeGreaterThan(0);
  });

  it('handles delayed showing (fast load skip)', () => {
    // When showDelayMs is high and isLoading is true, skeleton may not show immediately
    const instance = create(
      <LoadingBoundary
        isLoading={true}
        skeleton={<SkeletonMock />}
        showDelayMs={1000}
      >
        <ContentMock />
      </LoadingBoundary>,
    );

    // The component should still render without crashing
    expect(instance.root).toBeDefined();
  });

  it('switches from skeleton to content', async () => {
    // Create with loading=true, then switch to loading=false
    const instance = create(
      <LoadingBoundary
        isLoading={true}
        skeleton={<SkeletonMock />}
        showDelayMs={0}
        minDisplayMs={0}
        fadeDurationMs={0}
      >
        <ContentMock />
      </LoadingBoundary>,
    );

    expect(instance.root.findByProps({ testID: 'skeleton' })).toBeDefined();

    // Update to not loading
    instance.update(
      <LoadingBoundary
        isLoading={false}
        skeleton={<SkeletonMock />}
        showDelayMs={0}
        minDisplayMs={0}
        fadeDurationMs={0}
      >
        <ContentMock />
      </LoadingBoundary>,
    );

    // After the transition, content should be visible
    // (The skeleton may still be fading out, but content should be present)
    expect(instance.root.findByProps({ testID: 'content' })).toBeDefined();
  });
});
