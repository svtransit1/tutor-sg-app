import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

export interface CameraUnavailableSheetProps {
  onDismiss: () => void;
  onManualInput: () => void;
}

export default function CameraUnavailableSheet({
  onDismiss,
  onManualInput,
}: CameraUnavailableSheetProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const bgColor = isDark ? '#1A1A1A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#B0B0B0' : '#6B7280';
  const iconBg = isDark ? '#2A1A1A' : '#FEF2F2';
  const primaryBlue = isDark ? '#3B82F6' : '#2563EB';
  const cancelColor = '#9CA3AF';

  return (
    <View style={s.overlay}>
      <View style={s.container}>
        <Pressable style={s.dismissArea} onPress={onDismiss} />
        <View style={[s.content, { backgroundColor: bgColor }]}>
          <View style={[s.iconWrap, { backgroundColor: iconBg }]}>
            <Text style={s.icon}>{'\uD83D\uDCF1'}</Text>
          </View>
          <Text
            style={[s.title, { color: textColor }]}
            accessibilityRole="header"
          >
            {t('homeworkError.noCamera.title')}
          </Text>
          <Text style={[s.description, { color: mutedColor }]}>
            {t('homeworkError.noCamera.description')}
          </Text>
          <View style={s.actions}>
            <Pressable
              style={[s.actionBtn, { backgroundColor: primaryBlue }]}
              onPress={onManualInput}
              accessibilityRole="button"
              accessibilityLabel={t('homeworkError.noCamera.typeItOut')}
            >
              <Text style={[s.actionBtnText, { color: '#FFFFFF' }]}>
                {t('homeworkError.noCamera.typeItOut')}
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={s.dismissBtn}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel={t('homeworkError.noCamera.goBack')}
          >
            <Text style={[s.dismissBtnText, { color: cancelColor }]}>
              {t('homeworkError.noCamera.goBack')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  } satisfies ViewStyle,
  container: { flex: 1, justifyContent: 'flex-end' } satisfies ViewStyle,
  dismissArea: { flex: 1 } satisfies ViewStyle,
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  } satisfies ViewStyle,
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  } satisfies ViewStyle,
  icon: { fontSize: 32 } satisfies TextStyle,
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  } satisfies TextStyle,
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  } satisfies TextStyle,
  actions: { width: '100%', gap: 8, marginBottom: 16 } satisfies ViewStyle,
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  } satisfies ViewStyle,
  actionBtnText: { fontSize: 16, fontWeight: '600' } satisfies TextStyle,
  dismissBtn: { paddingVertical: 10, paddingHorizontal: 20 } satisfies ViewStyle,
  dismissBtnText: { fontSize: 15, fontWeight: '500' } satisfies TextStyle,
});
