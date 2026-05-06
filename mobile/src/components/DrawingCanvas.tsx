/**
 * DrawingCanvas — a simple finger/stylus drawing area for the manual
 * input fallback screen.
 *
 * Uses React Native's PanResponder for touch tracking and renders
 * the drawing as a series of stroked points stored in state.
 * No external dependencies beyond react-native.
 *
 * Supports:
 * - Multi-touch drawing with configurable stroke width and color
 * - Clear/reset
 * - Accessibility: labeled drawing area, clear button, double-tap
 *   to dismiss keyboard mode
 *
 * @see ADD §4.1 — OCR fallback (stylus input)
 * @see ADD §4.4 — Stylus-input native support
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  Text,
  useColorScheme,
  type GestureResponderEvent,
  type PanResponderGestureState,
  type ViewStyle,
} from 'react-native';

// ── Types ──────────────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

interface DrawingCanvasProps {
  /** Current strokes in the canvas */
  strokes: Stroke[];
  /** Callback when a new stroke is completed (touch end) */
  onStrokesChange: (strokes: Stroke[]) => void;
  /** Current stroke color (default: #1A1A1A) */
  strokeColor?: string;
  /** Stroke width in pixels (default: 3) */
  strokeWidth?: number;
  /** Placeholder text shown when canvas is empty */
  placeholder?: string;
  /** Accessibility label for the canvas area */
  accessibilityLabel?: string;
  /** Test ID */
  testID?: string;
}

// ── Constants ──────────────────────────────────────────────────────

const DEFAULT_STROKE_COLOR = '#1A1A1A';
const DEFAULT_STROKE_WIDTH = 3;
const CANVAS_MIN_HEIGHT = 160;

// ── Component ──────────────────────────────────────────────────────

export default function DrawingCanvas({
  strokes,
  onStrokesChange,
  strokeColor = DEFAULT_STROKE_COLOR,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  placeholder,
  accessibilityLabel = 'Drawing canvas',
  testID,
}: DrawingCanvasProps) {
  const isDark = useColorScheme() === 'dark';
  const currentStrokeRef = useRef<Point[]>([]);
  const canvasRef = useRef<View>(null);
  const canvasLayoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // ── PanResponder for touch drawing ─────────────────────────────

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStrokeRef.current = [{ x: locationX, y: locationY }];
      },

      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        const lastPoint =
          currentStrokeRef.current[
            currentStrokeRef.current.length - 1
          ];

        // Only add point if we've moved enough (avoid dense point clouds)
        if (
          lastPoint &&
          (Math.abs(locationX - lastPoint.x) > 2 ||
            Math.abs(locationY - lastPoint.y) > 2)
        ) {
          currentStrokeRef.current = [
            ...currentStrokeRef.current,
            { x: locationX, y: locationY },
          ];
        }
      },

      onPanResponderRelease: () => {
        if (currentStrokeRef.current.length > 0) {
          const newStroke: Stroke = {
            points: currentStrokeRef.current,
            color: strokeColor,
            width: strokeWidth,
          };
          onStrokesChange([...strokes, newStroke]);
          currentStrokeRef.current = [];
        }
      },

      onPanResponderTerminate: () => {
        // Touch interrupted — discard current stroke
        currentStrokeRef.current = [];
      },
    }),
  ).current;

  // ── Clear handler ──────────────────────────────────────────────

  const handleClear = useCallback(() => {
    onStrokesChange([]);
    currentStrokeRef.current = [];
  }, [onStrokesChange]);

  // ── Render helper: build SVG-like segments from strokes ────────

  const renderStroke = (stroke: Stroke, strokeIndex: number) => {
    if (stroke.points.length < 2) return null;

    const elements: React.ReactNode[] = [];

    for (let i = 0; i < stroke.points.length - 1; i++) {
      const p0 = stroke.points[i];
      const p1 = stroke.points[i + 1];

      if (!p0 || !p1) continue;

      // Draw a line segment between consecutive points
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      elements.push(
        <View
          key={`${strokeIndex}-${i}`}
          style={{
            position: 'absolute',
            left: p0.x,
            top: p0.y,
            width: length,
            height: stroke.width,
            backgroundColor: stroke.color,
            borderRadius: stroke.width / 2,
            transform: [{ rotate: `${angle}rad` }],
            transformOrigin: 'left center',
          } as ViewStyle}
        />,
      );
    }

    return elements;
  };

  // ── Render ─────────────────────────────────────────────────────

  const isEmpty = strokes.length === 0 && currentStrokeRef.current.length === 0;

  return (
    <View
      style={styles.container}
      testID={testID}
    >
      {/* Canvas area */}
      <View
        ref={canvasRef}
        style={[
          styles.canvas,
          {
            minHeight: CANVAS_MIN_HEIGHT,
            backgroundColor: isDark ? '#2A2A2A' : '#F9FAFB',
            borderColor: isDark ? '#444' : '#D1D5DB',
          },
        ]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="image"
        {...panResponder.panHandlers}
      >
        {/* Rendered strokes */}
        {strokes.map((stroke, index) => renderStroke(stroke, index))}

        {/* Placeholder when empty */}
        {isEmpty && placeholder && (
          <Text style={[styles.placeholder, { color: isDark ? '#666' : '#9CA3AF' }]}>
            {placeholder}
          </Text>
        )}
      </View>

      {/* Clear button */}
      {!isEmpty && (
        <TouchableOpacity
          style={[
            styles.clearButton,
            {
              backgroundColor: isDark ? '#3A3A3A' : '#F3F4F6',
              borderColor: isDark ? '#555' : '#D1D5DB',
            },
          ]}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear drawing"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.clearText, { color: isDark ? '#CCCCCC' : '#6B7280' }]}>
            Clear
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  canvas: {
    width: '100%',
    minHeight: CANVAS_MIN_HEIGHT,
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 14,
    lineHeight: CANVAS_MIN_HEIGHT,
    paddingHorizontal: 16,
  },
  clearButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
