import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

interface DrawingCanvasProps {
  onStrokeStart?: () => void;
  accessibilityLabel?: string;
}

const STROKE_COLOR = '#1A1A1A';
const STROKE_WIDTH = 4;

export default function DrawingCanvas({
  onStrokeStart,
  accessibilityLabel,
}: DrawingCanvasProps) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const layoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    layoutRef.current = { x, y, width, height };
  }, []);

  const getPoint = (evt: GestureResponderEvent): Point => ({
    x: evt.nativeEvent.locationX,
    y: evt.nativeEvent.locationY,
  });

  const [gestureResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const point = getPoint(evt);
        onStrokeStart?.();
        setCurrentStroke({ points: [point], color: STROKE_COLOR, width: STROKE_WIDTH });
      },
      onPanResponderMove: (evt) => {
        const point = getPoint(evt);
        setCurrentStroke((prev) => (prev ? { ...prev, points: [...prev.points, point] } : null));
      },
      onPanResponderRelease: () => {
        setStrokes((prev) => {
          if (!currentStroke || currentStroke.points.length === 0) return prev;
          return [...prev, currentStroke];
        });
        setCurrentStroke(null);
      },
      onPanResponderTerminate: () => {
        if (currentStroke && currentStroke.points.length > 0) {
          setStrokes((prev) => [...prev, currentStroke as Stroke]);
        }
        setCurrentStroke(null);
      },
    }),
  );

  const clear = useCallback(() => {
    setStrokes([]);
    setCurrentStroke(null);
  }, []);

  const renderStroke = (stroke: Stroke, strokeIndex: number) => {
    if (stroke.points.length === 0) return null;
    if (stroke.points.length === 1) {
      const p = stroke.points[0];
      return (
        <View
          key={`dot-${strokeIndex}`}
          style={{
            position: 'absolute',
            left: p.x - stroke.width / 2,
            top: p.y - stroke.width / 2,
            width: stroke.width,
            height: stroke.width,
            borderRadius: stroke.width / 2,
            backgroundColor: stroke.color,
          }}
        />
      );
    }
    const segments: React.ReactElement[] = [];
    for (let i = 0; i < stroke.points.length - 1; i++) {
      const a = stroke.points[i];
      const b = stroke.points[i + 1];
      const length = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      segments.push(
        <View
          key={`seg-${strokeIndex}-${i}`}
          style={{
            position: 'absolute',
            left: a.x,
            top: a.y - stroke.width / 2,
            width: length,
            height: stroke.width,
            backgroundColor: stroke.color,
            transform: [{ rotate: `${angle}rad` }],
            transformOrigin: 'left center',
          }}
        />,
      );
    }
    return segments;
  };

  const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

  return (
    <View
      style={styles.container}
      onLayout={handleLayout}
      accessibilityLabel={accessibilityLabel ?? 'Drawing canvas'}
      accessibilityRole="adjustable"
    >
      <View style={styles.canvas} {...gestureResponder.panHandlers}>
        {allStrokes.map((stroke, i) => renderStroke(stroke, i))}
      </View>
      {strokes.length > 0 && (
        <View style={styles.clearButton} pointerEvents="box-none">
          <View
            style={styles.clearHitArea}
            onTouchEnd={clear}
            accessibilityRole="button"
            accessibilityLabel="Clear drawing"
          >
            <View style={styles.clearIcon}>
              <View style={[styles.clearLine, { transform: [{ rotate: '45deg' }] }]} />
              <View style={[styles.clearLine, { transform: [{ rotate: '-45deg' }] }]} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  clearHitArea: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearLine: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: '#EF4444',
    borderRadius: 1,
  },
});
