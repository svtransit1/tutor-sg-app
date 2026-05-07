import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  Pressable,
  StyleSheet,
  LayoutChangeEvent,
  ImageSourcePropType,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OcrBlock } from '../types/ocr';
import {
  getConfidenceLevel,
  getConfidenceColor,
  getConfidenceBgColor,
  isTapToType,
} from '../types/ocr';

interface OcrOverlayProps {
  imageSource: ImageSourcePropType;
  blocks: OcrBlock[];
  imageWidth: number;
  imageHeight: number;
  onBlockPress?: (index: number) => void;
  onRetake?: () => void;
}

export default function OcrOverlay({
  imageSource,
  blocks,
  imageWidth: origWidth,
  imageHeight: origHeight,
  onBlockPress,
  onRetake,
}: OcrOverlayProps) {
  const { t } = useTranslation();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  }, []);

  const displayScale = useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0) return null;
    const scaleX = containerSize.width / origWidth;
    const scaleY = containerSize.height / origHeight;
    return { x: scaleX, y: scaleY };
  }, [containerSize, origWidth, origHeight]);

  if (blocks.length === 0) {
    return (
      <View style={styles.container} onLayout={handleLayout} testID="ocr-overlay-container">
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.emptyState}>
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>{t('ocr.overlay.emptyTitle')}</Text>
            <Text style={styles.emptyStateSubtitle}>{t('ocr.overlay.emptySubtitle')}</Text>
            {onRetake && (
              <Pressable style={styles.emptyStateRetakeButton} onPress={onRetake} accessibilityRole="button">
                <Text style={styles.emptyStateRetakeText}>{t('ocr.overlay.retake')}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      onLayout={handleLayout}
      testID="ocr-overlay-container"
    >
      <Image
        source={imageSource}
        style={styles.image}
        resizeMode="contain"
      />
      {displayScale && (
        <View style={styles.overlayLayer} pointerEvents="box-none">
          {blocks.map((block, index) => {
            const level = getConfidenceLevel(block.confidence);
            const borderColor = getConfidenceColor(level);
            const bgColor = getConfidenceBgColor(level);
            return (
              <View key={index} style={styles.blockWrapper}>
                <Pressable
                  onPress={() => onBlockPress?.(index)}
                  style={[
                    styles.boundingBox,
                    {
                      left: block.boundingBox.x * displayScale.x,
                      top: block.boundingBox.y * displayScale.y,
                      width: block.boundingBox.width * displayScale.x,
                      height: block.boundingBox.height * displayScale.y,
                      borderColor,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Detected region ${index + 1}: ${block.text.substring(0, 30)}`}
                >
                  {isTapToType(block.confidence) && (
                    <View style={styles.lowConfOverlay}>
                      <Text style={styles.lowConfBadge}>{t('ocr.overlay.tapToType')}</Text>
                    </View>
                  )}
                  <View style={[styles.confidenceBadge, { backgroundColor: bgColor, borderColor }]}>
                    <Text style={[styles.confidenceText, { color: borderColor }]}>
                      {Math.round(block.confidence * 100)}%
                    </Text>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', backgroundColor: '#000000' },
  image: { flex: 1, width: '100%' },
  overlayLayer: { ...StyleSheet.absoluteFillObject },
  blockWrapper: { position: 'absolute' },
  boundingBox: { position: 'absolute', borderWidth: 2.5, borderRadius: 4 },
  confidenceBadge: {
    position: 'absolute', top: -12, right: -4,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6, borderWidth: 1, zIndex: 10,
  },
  confidenceText: { fontSize: 11, fontWeight: '700' },
  lowConfOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 4,
  },
  lowConfBadge: {
    fontSize: 12, fontWeight: '700', color: '#FFFFFF',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, overflow: 'hidden',
  },
  emptyState: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateCard: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    maxWidth: 320,
  },
  emptyStateTitle: {
    fontSize: 18, fontWeight: '700', color: '#FFFFFF',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14, color: '#D1D5DB',
    textAlign: 'center', lineHeight: 20,
  },
  emptyStateRetakeButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 12, marginTop: 4,
  },
  emptyStateRetakeText: {
    fontSize: 15, fontWeight: '700', color: '#FFFFFF',
  },
});
