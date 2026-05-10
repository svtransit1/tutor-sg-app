import React from 'react';
import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ViewStyle, TextStyle } from 'react-native';

const SUBJECTS = ['math', 'english', 'science', 'chinese'] as const;

const SUBJECT_ICONS: Record<string, string> = {
  math: '🧮',
  english: '📖',
  science: '🔬',
  chinese: '🀄',
};

export interface SubjectTileGridProps {
  onSubjectPress: (subject: string) => void;
  onCameraPress: () => void;
}

export function SubjectTileGrid({ onSubjectPress, onCameraPress }: SubjectTileGridProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#AAAAAA' : '#6B7280';
  const cameraBg = isDark ? '#1E3A5F' : '#EFF6FF';
  const cameraBorder = isDark ? '#2A4A7F' : '#BFDBFE';
  const cameraTitleColor = isDark ? '#93C5FD' : '#2563EB';

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.cameraCard, { backgroundColor: cameraBg, borderColor: cameraBorder }]}
        onPress={onCameraPress}
        accessibilityRole="button"
        accessibilityLabel={t('kidHome.camera.accessibility')}
        accessibilityHint={t('kidHome.accessibility.cameraHint')}
      >
        <Text style={styles.cameraIcon}>📷</Text>
        <View style={styles.cameraTextWrap}>
          <Text style={[styles.cameraTitle, { color: cameraTitleColor }]}>
            {t('kidHome.camera.title')}
          </Text>
          <Text style={[styles.cameraSubtitle, { color: mutedColor }]}>
            {t('kidHome.camera.subtitle')}
          </Text>
        </View>
      </Pressable>

      <View style={styles.grid}>
        {SUBJECTS.map((subject) => (
          <Pressable
            key={subject}
            style={[styles.tile, { backgroundColor: cardBg }]}
            onPress={() => onSubjectPress(subject)}
            accessibilityRole="button"
            accessibilityLabel={t('kidHome.accessibility.subjectTile', { subject: t(`kidHome.subjects.${subject}`) })}
            accessibilityHint={t('kidHome.accessibility.subjectTileHint', { subject: t(`kidHome.subjects.${subject}`) })}
          >
            <Text style={styles.tileIcon}>{SUBJECT_ICONS[subject] ?? '📚'}</Text>
            <Text style={[styles.tileTitle, { color: textColor }]} numberOfLines={1}>
              {t(`kidHome.subjects.${subject}`)}
            </Text>
            <Text style={[styles.tileDescription, { color: mutedColor }]} numberOfLines={2}>
              {t(`kidHome.subjectsDescriptions.${subject}`)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  } satisfies ViewStyle,

  cameraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
    gap: 14,
  } satisfies ViewStyle,

  cameraIcon: {
    fontSize: 32,
  } satisfies TextStyle,

  cameraTextWrap: {
    flex: 1,
  } satisfies ViewStyle,

  cameraTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  } satisfies TextStyle,

  cameraSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  } satisfies TextStyle,

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  } satisfies ViewStyle,

  tile: {
    width: '48%',
    flexGrow: 1,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    gap: 6,
  } satisfies ViewStyle,

  tileIcon: {
    fontSize: 32,
    marginBottom: 4,
  } satisfies TextStyle,

  tileTitle: {
    fontSize: 17,
    fontWeight: '700',
  } satisfies TextStyle,

  tileDescription: {
    fontSize: 16,
    lineHeight: 21,
  } satisfies TextStyle,
});
