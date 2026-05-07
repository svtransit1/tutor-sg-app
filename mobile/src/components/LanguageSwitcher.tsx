import React from 'react';
import { TouchableOpacity, Text, StyleSheet, useColorScheme, type ViewStyle } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  style?: ViewStyle;
}

export default function LanguageSwitcher({ style }: LanguageSwitcherProps) {
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const isChinese = language === 'zh-Hans';
  const label = isChinese ? 'EN' : '中';
  const accessibilityLabel = t('kidHome.header.switchLanguage');

  return (
    <TouchableOpacity
      style={[
        styles.toggle,
        {
          backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0',
          borderColor: isDark ? '#444' : '#D1D5DB',
        },
        style,
      ]}
      onPress={toggleLanguage}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          { color: isDark ? '#FFFFFF' : '#1A1A1A' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 40,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
