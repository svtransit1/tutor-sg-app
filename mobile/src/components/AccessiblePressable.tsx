import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';

const MIN_TOUCH_TARGET = 44;
const MIN_BODY_SIZE = 16;

const COLORS = {
  light: {
    primary: '#2563EB',
    textInverse: '#FFFFFF',
  },
  dark: {
    primary: '#60A5FA',
    textInverse: '#FFFFFF',
  },
};

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
  const C = isDark ? COLORS.dark : COLORS.light;

  const containerStyle: ViewStyle[] = [baseStyles.base];
  const labelStyle: TextStyle[] = [baseStyles.label];

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

const baseStyles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: MIN_BODY_SIZE,
    fontWeight: '600',
  },
});
