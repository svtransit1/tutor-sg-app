import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import KidAvatarPicker from '../../components/KidAvatarPicker';
import { addKidProfile, getAllKidProfiles, getKidCount, MAX_KIDS, type AvatarId, type KidProfile } from '../../storage/kid-profile-store';
import { persistGrade, type Grade } from '../../storage/onboarding-state';

const GRADES: Grade[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

interface KidProfileScreenProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function KidProfileScreen({ onComplete, onSkip }: KidProfileScreenProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [grade, setGrade] = useState<Grade | null>(null);
  const [avatarId, setAvatarId] = useState<AvatarId | null>(null);
  const [nameError, setNameError] = useState(false);
  const kidCount = getKidCount();

  const validateName = useCallback((text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 1 || trimmed.length > 30) {
      setNameError(true);
      return false;
    }
    setNameError(false);
    return true;
  }, []);

  const canSave = name.trim().length >= 1 && name.trim().length <= 30 && grade !== null && avatarId !== null && kidCount < MAX_KIDS;

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (!validateName(trimmed)) return;
    if (!grade || !avatarId) return;
    if (kidCount >= MAX_KIDS) return;

    const profile: KidProfile = {
      id: `kid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      grade,
      avatarId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addKidProfile(profile);
    persistGrade(grade);
    onComplete?.();
  }, [name, grade, avatarId, kidCount, validateName, onComplete]);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
    if (nameError && text.trim().length >= 1 && text.trim().length <= 30) {
      setNameError(false);
    }
  }, [nameError]);

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
      ]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        style={[
          styles.title,
          { color: isDark ? '#FFFFFF' : '#1A1A1A' },
        ]}
        accessibilityRole="header"
      >
        {t('onboarding.kidProfile.title')}
      </Text>

      <Text
        style={[
          styles.subtitle,
          { color: isDark ? '#9CA3AF' : '#6B7280' },
        ]}
      >
        {t('onboarding.kidProfile.subtitle')}
      </Text>

      {kidCount > 0 && (
        <Text
          style={[
            styles.kidCount,
            { color: isDark ? '#60A5FA' : '#2563EB' },
          ]}
        >
          {t('onboarding.kidProfile.kidCount', { number: kidCount + 1, total: MAX_KIDS })}
        </Text>
      )}

      <View style={styles.section}>
        <Text
          style={[
            styles.fieldLabel,
            { color: isDark ? '#E5E7EB' : '#374151' },
          ]}
        >
          {t('onboarding.kidProfile.nameLabel')}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
              color: isDark ? '#FFFFFF' : '#1A1A1A',
              borderColor: nameError ? '#EF4444' : isDark ? '#374151' : '#D1D5DB',
            },
          ]}
          value={name}
          onChangeText={handleNameChange}
          onBlur={() => validateName(name)}
          placeholder={t('onboarding.kidProfile.namePlaceholder')}
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          maxLength={30}
          autoCapitalize="words"
          returnKeyType="done"
          accessibilityLabel={t('onboarding.kidProfile.namePlaceholder')}
        />
        {nameError && (
          <Text style={styles.errorText}>
            {t('onboarding.kidProfile.nameError')}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.fieldLabel,
            { color: isDark ? '#E5E7EB' : '#374151' },
          ]}
        >
          {t('onboarding.kidProfile.gradeLabel')}
        </Text>
        <View style={styles.gradeGrid}>
          {GRADES.map((g) => {
            const isSelected = grade === g;
            return (
              <TouchableOpacity
                key={g}
                style={[
                  styles.gradeBtn,
                  {
                    backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
                    borderColor: isSelected ? (isDark ? '#60A5FA' : '#2563EB') : (isDark ? '#374151' : '#E5E7EB'),
                  },
                ]}
                onPress={() => setGrade(g)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t('onboarding.kidProfile.accessibility.gradeOption', { grade: g })}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.gradeText,
                    {
                      color: isSelected ? (isDark ? '#60A5FA' : '#2563EB') : (isDark ? '#D1D5DB' : '#4B5563'),
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <KidAvatarPicker selectedAvatarId={avatarId} onSelectAvatar={setAvatarId} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueBtn,
            { backgroundColor: isDark ? '#2563EB' : '#2563EB' },
            !canSave && styles.continueBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.kidProfile.continue')}
          accessibilityState={{ disabled: !canSave }}
        >
          <Text style={styles.continueBtnText}>
            {t('onboarding.kidProfile.continue')}
          </Text>
        </TouchableOpacity>

        {kidCount >= MAX_KIDS && (
          <Text
            style={[
              styles.maxReached,
              { color: isDark ? '#FCA5A5' : '#EF4444' },
            ]}
          >
            {t('onboarding.kidProfile.maxReached')}
          </Text>
        )}

        <TouchableOpacity
          onPress={onSkip}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.siblingPrompt.skip')}
        >
          <Text
            style={[
              styles.skipBtn,
              { color: isDark ? '#9CA3AF' : '#6B7280' },
            ]}
          >
            {t('onboarding.siblingPrompt.skip')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } satisfies ViewStyle,
  contentContainer: {
    paddingHorizontal: 24,
    gap: 24,
  } satisfies ViewStyle,
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  } satisfies TextStyle,
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  } satisfies TextStyle,
  kidCount: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  } satisfies TextStyle,
  section: {
    gap: 8,
  } satisfies ViewStyle,
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
  } satisfies TextStyle,
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 17,
    lineHeight: 22,
  } satisfies TextStyle,
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    lineHeight: 18,
  } satisfies TextStyle,
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  } satisfies ViewStyle,
  gradeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 64,
    alignItems: 'center',
  } satisfies ViewStyle,
  gradeText: {
    fontSize: 16,
  } satisfies TextStyle,
  footer: {
    gap: 12,
    alignItems: 'center',
    paddingTop: 8,
  } satisfies ViewStyle,
  continueBtn: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,
  continueBtnDisabled: {
    opacity: 0.5,
  } satisfies ViewStyle,
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  } satisfies TextStyle,
  maxReached: {
    fontSize: 13,
    textAlign: 'center',
  } satisfies TextStyle,
  skipBtn: {
    fontSize: 15,
    textDecorationLine: 'underline',
    paddingVertical: 8,
    paddingHorizontal: 16,
  } satisfies TextStyle,
});
