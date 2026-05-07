import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  useColorScheme,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface CameraGuideFrameProps {
  isAligned: boolean;
  style?: ViewStyle;
}

const GUIDE_ASPECT_RATIO = 1.414;
const CORNER_SIZE = 28;
const CORNER_THICKNESS = 3;
const FRAME_BORDER_RADIUS = 4;

export default function CameraGuideFrame({ isAligned, style }: CameraGuideFrameProps) {
  const { t } = useTranslation();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isDark = useColorScheme() === 'dark';

  const frameWidth = Math.min(screenWidth * 0.85, 400);
  const frameHeight = frameWidth * GUIDE_ASPECT_RATIO;

  const maxHeight = screenHeight * 0.65;
  const finalHeight = Math.min(frameHeight, maxHeight);
  const finalWidth = finalHeight / GUIDE_ASPECT_RATIO;

  const accentColor = isAligned ? '#34C759' : isDark ? '#64B5F6' : '#4A90D9';
  const overlayColor = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.40)';
  const alignedGlowColor = isAligned ? 'rgba(52,199,89,0.15)' : 'transparent';
  const statusColor = isAligned ? '#34C759' : isDark ? '#B0BEC5' : '#9CA3AF';

  const middleRowHeight = finalHeight;
  const topPanelHeight = Math.max(0, (screenHeight - finalHeight) / 2 - 40);
  const bottomPanelFlex = 1;

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="image"
      accessibilityLabel={
        isAligned
          ? t('cameraGuideFrame.accessibility.aligned')
          : t('cameraGuideFrame.accessibility.alignFrame')
      }
      accessibilityLiveRegion="polite"
    >
      {/* Top overlay panel */}
      <View style={[styles.overlayPanel, { height: topPanelHeight, backgroundColor: overlayColor }]} />

      {/* Middle row: left overlay + frame + right overlay */}
      <View style={[styles.middleRow, { height: middleRowHeight }]}>
        <View style={{ flex: 1, backgroundColor: overlayColor }} />

        {/* Frame area */}
        <View style={[{ width: finalWidth, height: finalHeight }, styles.frameContainer]}>
          {/* Aligned glow border */}
          {isAligned && (
            <View
              style={[
                styles.alignedGlow,
                { backgroundColor: alignedGlowColor, borderColor: accentColor },
              ]}
            />
          )}

          {/* Corner guides */}
          <View style={[styles.cornerTL, { borderTopColor: accentColor, borderLeftColor: accentColor }]} />
          <View style={[styles.cornerTR, { borderTopColor: accentColor, borderRightColor: accentColor }]} />
          <View style={[styles.cornerBL, { borderBottomColor: accentColor, borderLeftColor: accentColor }]} />
          <View style={[styles.cornerBR, { borderBottomColor: accentColor, borderRightColor: accentColor }]} />
        </View>

        <View style={{ flex: 1, backgroundColor: overlayColor }} />
      </View>

      {/* Bottom overlay panel */}
      <View style={[styles.overlayPanel, { flex: bottomPanelFlex, backgroundColor: overlayColor }]}>
        {/* Status text */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: accentColor },
            ]}
          />
          <Text
            style={[styles.statusText, { color: statusColor }]}
            accessibilityRole="text"
            accessibilityLiveRegion="assertive"
          >
            {isAligned ? t('cameraGuideFrame.aligned') : t('cameraGuideFrame.hint')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  } satisfies ViewStyle,

  overlayPanel: {
    width: '100%',
  } satisfies ViewStyle,

  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } satisfies ViewStyle,

  frameContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: FRAME_BORDER_RADIUS,
  } satisfies ViewStyle,

  alignedGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: FRAME_BORDER_RADIUS + 4,
    borderWidth: 2,
    margin: -6,
  } satisfies ViewStyle,

  // ╭ ── Corner top-left
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: CORNER_SIZE / 2,
  } satisfies ViewStyle,

  // ╮ Corner top-right
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: CORNER_SIZE / 2,
  } satisfies ViewStyle,

  // ╰ Corner bottom-left
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: CORNER_SIZE / 2,
  } satisfies ViewStyle,

  // ╯ Corner bottom-right
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: CORNER_SIZE / 2,
  } satisfies ViewStyle,

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 20,
  } satisfies ViewStyle,

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  } satisfies ViewStyle,

  statusText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  } satisfies TextStyle,
});
