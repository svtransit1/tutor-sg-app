import { PixelRatio } from 'react-native';
import { fontSize as fontSizeTokens, lineHeight as lineHeightTokens } from '../tokens/typography';

const MAX_SCALE = 1.5;
const MIN_TOUCH_TARGET = 44;

function getScale(): number {
  return Math.min(PixelRatio.getFontScale(), MAX_SCALE);
}

export function scaledFontSize(role: keyof typeof fontSizeTokens): number {
  const base = fontSizeTokens[role];
  return Math.round(base * getScale());
}

export function scaledLineHeight(
  role: keyof typeof fontSizeTokens,
  lineHeightRole: keyof typeof lineHeightTokens = 'normal',
): number {
  const size = scaledFontSize(role);
  return Math.round(size * lineHeightTokens[lineHeightRole]);
}

export function scaledTouchTarget(): number {
  return Math.round(MIN_TOUCH_TARGET * getScale());
}
