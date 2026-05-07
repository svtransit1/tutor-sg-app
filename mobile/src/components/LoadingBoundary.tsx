/**
 * LoadingBoundary — wraps content and shows a skeleton while data loads.
 *
 * Provides:
 * - Auto-switch between skeleton and content once `isLoading` flips
 * - Minimum display time to avoid flash-of-loading
 * - Delayed skeleton appearance to skip fast loads (< threshold)
 * - Smooth fade transition between states
 *
 * Use on any screen with async data that benefits from skeleton placeholders.
 *
 * @example
 * ```tsx
 * <LoadingBoundary isLoading={sessions.length === 0 && !welcomeInitDone}>
 *   <KidHomeContent />
 * </LoadingBoundary>
 * ```
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

// ── Types ──────────────────────────────────────────────────────────

interface LoadingBoundaryProps {
  /** True while the async data is loading */
  isLoading: boolean;
  /** The skeleton component to show while loading */
  skeleton: React.ReactNode;
  /** The real content (shown when not loading) */
  children: React.ReactNode;
  /** Minimum skeleton display time in ms (prevents flash) */
  minDisplayMs?: number;
  /** Delay before showing skeleton (skip fast loads) */
  showDelayMs?: number;
  /** Fade transition duration */
  fadeDurationMs?: number;
  style?: ViewStyle;
}

// ── Component ──────────────────────────────────────────────────────

export default function LoadingBoundary({
  isLoading,
  skeleton,
  children,
  minDisplayMs = 0,
  showDelayMs = 150,
  fadeDurationMs = 200,
  style,
}: LoadingBoundaryProps) {
  // Whether skeleton is visually shown
  const [showSkeleton, setShowSkeleton] = useState(isLoading);
  // Fade animation for smooth transition
  const fadeAnim = useRef(new Animated.Value(isLoading ? 0 : 1)).current;
  // Track min display timer
  const minTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track show delay timer
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mounted guard
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (minTimerRef.current) clearTimeout(minTimerRef.current);
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      // Delay skeleton appearance to skip fast loads
      delayTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setShowSkeleton(true);
        // Fade in the skeleton
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: fadeDurationMs,
          useNativeDriver: true,
        }).start();
      }, showDelayMs);
    } else if (showSkeleton) {
      // Content loaded while skeleton was showing
      // If minDisplayMs > 0, wait before transitioning
      const transition = () => {
        if (!mountedRef.current) return;
        // Fade out skeleton
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: fadeDurationMs,
          useNativeDriver: true,
        }).start(() => {
          if (mountedRef.current) {
            setShowSkeleton(false);
            fadeAnim.setValue(1);
          }
        });
      };

      if (minDisplayMs > 0) {
        minTimerRef.current = setTimeout(transition, minDisplayMs);
      } else {
        transition();
      }
    }

    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (minTimerRef.current) clearTimeout(minTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // If not loading and not showing skeleton, just render children
  if (!isLoading && !showSkeleton) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View style={style} accessibilityLiveRegion="polite">
      <Animated.View
        style={[
          styles.layer,
          { opacity: showSkeleton ? fadeAnim : 0, display: showSkeleton ? undefined : 'none' },
        ]}
        pointerEvents={isLoading ? 'none' : 'auto'}
      >
        {skeleton}
      </Animated.View>
      <Animated.View
        style={[
          styles.layer,
          { opacity: showSkeleton ? 1 : undefined },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
});
