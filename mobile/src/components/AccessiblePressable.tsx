import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';
import {
  lightColors as lightC,
  darkColors as darkC,
  scaledFontSize,
  scaledTouchTarget,
} from '@tutor-sg/theme';

interface AccessiblePressableProps {
  onPress: () => void;
  label: string;
  hint?: string;
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function AccessiblePressable({
  onPress,
  label,
  hint,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}: AccessiblePressableProps) {
  const isDark = useColorScheme() === 'dark';
  const C = isDark ? darkC : lightC;
  const touchTarget = scaledTouchTarget();
  const bodySize = scaledFontSize('body');

  const containerStyle: ViewStyle[] = [
    styles.base,
    { minHeight: touchTarget },
  ];
  const labelStyle: TextStyle[] = [
    styles.label,
    { fontSize: bodySize },
  ];

  switch (variant) {
    case 'primary':
      containerStyle.push({
        backgroundColor: C.primary,
        borderRadius: 14,
      });
      labelStyle.push({ color: C.textInverse });
      break;
    case 'secondary':
      containerStyle.push({
        backgroundColor: 'transparent',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: C.primary,
      });
      labelStyle.push({ color: C.primary });
      break;
    case 'text':
      containerStyle.push({
        backgroundColor: 'transparent',
      });
      labelStyle.push({ color: C.primary });
      break;
  }

  if (disabled) {
    containerStyle.push({ opacity: 0.4 });
  }

  if (style) containerStyle.push(style);
  if (textStyle) labelStyle.push(textStyle);

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      activeOpacity={0.7}
    >
      <Text style={labelStyle}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
});
