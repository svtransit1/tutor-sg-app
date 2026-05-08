import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AVATAR_IDS, AVATAR_EMOJIS, type AvatarId } from '../storage/kid-profile-store';

interface KidAvatarPickerProps {
  selectedAvatarId: AvatarId | null;
  onSelectAvatar: (avatarId: AvatarId) => void;
}

const AVATAR_COLORS: Record<AvatarId, string> = {
  cat: '#FDE68A',
  dog: '#BFDBFE',
  rabbit: '#FBCFE8',
  panda: '#E5E7EB',
  owl: '#DDD6FE',
  tiger: '#FED7AA',
  koala: '#A7F3D0',
  lion: '#FDE68A',
};

export default function KidAvatarPicker({ selectedAvatarId, onSelectAvatar }: KidAvatarPickerProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          { color: isDark ? '#E5E7EB' : '#374151' },
        ]}
        accessibilityRole="header"
      >
        {t('onboarding.kidProfile.avatarLabel')}
      </Text>
      <View style={styles.grid}>
        {AVATAR_IDS.map((avatarId) => {
          const isSelected = selectedAvatarId === avatarId;
          return (
            <TouchableOpacity
              key={avatarId}
              style={[
                styles.avatarBtn,
                { backgroundColor: AVATAR_COLORS[avatarId] },
                isSelected && styles.avatarBtnSelected,
                isSelected && { borderColor: isDark ? '#60A5FA' : '#2563EB' },
              ]}
              onPress={() => onSelectAvatar(avatarId)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.kidProfile.accessibility.avatarOption', { avatar: AVATAR_EMOJIS[avatarId] })}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={styles.avatarEmoji}>{AVATAR_EMOJIS[avatarId]}</Text>
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: isDark ? '#60A5FA' : '#2563EB' }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  } satisfies ViewStyle,
  label: {
    fontSize: 16,
    fontWeight: '600',
  } satisfies TextStyle,
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  } satisfies ViewStyle,
  avatarBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  } satisfies ViewStyle,
  avatarBtnSelected: {
    borderWidth: 3,
  } satisfies ViewStyle,
  avatarEmoji: {
    fontSize: 32,
  } satisfies TextStyle,
  checkmark: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  } satisfies TextStyle,
});
