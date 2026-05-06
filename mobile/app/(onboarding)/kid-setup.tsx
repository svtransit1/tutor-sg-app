import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { addKid, updateKid, deleteKid, getKid } from '../../src/storage';
import { KID_LEVELS, MAX_NAME_LENGTH, type KidLevel } from '../../src/i18n';

export default function KidSetup() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editId = params.id;

  const [name, setName] = useState('');
  const [level, setLevel] = useState<KidLevel | null>(null);
  const [language, setLanguage] = useState<'en' | 'zh-Hans'>('en');
  const [nameError, setNameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId) {
      (async () => {
        const existing = await getKid(editId);
        if (existing) {
          setName(existing.name);
          setLevel(existing.level);
          setLanguage(existing.language);
        }
      })();
    }
  }, [editId]);

  const validateName = (value: string) => {
    setName(value);
    if (value.trim().length === 0) {
      setNameError(null);
    } else if (value.length > MAX_NAME_LENGTH) {
      setNameError(t('onboarding.kidProfile.nameError'));
    } else {
      setNameError(null);
    }
  };

  const handleSave = async () => {
    if (name.trim().length === 0) {
      setNameError(t('onboarding.kidProfile.nameError'));
      return;
    }
    if (!level) return;

    setLoading(true);
    try {
      if (editId) {
        await updateKid(editId, { name, level, language });
      } else {
        const result = await addKid(name, level, language);
        if (!result) {
          Alert.alert('Error', 'Maximum number of children reached.');
          return;
        }
      }
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!editId) return;
    Alert.alert(
      t('onboarding.kidList.confirmDelete'),
      t('onboarding.kidList.confirmDeleteDesc'),
      [
        { text: t('onboarding.common.cancel'), style: 'cancel' },
        {
          text: t('onboarding.common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteKid(editId);
            router.back();
          },
        },
      ],
    );
  };

  const canSave = name.trim().length > 0 && level !== null && name.length <= MAX_NAME_LENGTH && !loading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>{t('onboarding.common.back')}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            {editId
              ? t('onboarding.kidSetup.editTitle')
              : t('onboarding.kidSetup.title')}
          </Text>

          {/* Name input */}
          <Text style={styles.label}>{t('onboarding.kidProfile.nameLabel')}</Text>
          <TextInput
            style={[styles.input, nameError && styles.inputError]}
            placeholder={t('onboarding.kidProfile.namePlaceholder')}
            value={name}
            onChangeText={validateName}
            maxLength={MAX_NAME_LENGTH + 10}
            autoCapitalize="words"
            accessible
            accessibilityLabel={t('onboarding.kidProfile.nameLabel')}
          />
          {nameError && (
            <Text style={styles.errorText}>{nameError}</Text>
          )}

          {/* Level picker */}
          <Text style={styles.label}>{t('onboarding.kidProfile.levelLabel')}</Text>
          <View style={styles.levelGrid}>
            {KID_LEVELS.map((lvl) => (
              <TouchableOpacity
                key={lvl}
                style={[
                  styles.levelButton,
                  level === lvl && styles.levelButtonActive,
                ]}
                onPress={() => setLevel(lvl)}
                accessible
                accessibilityLabel={t(`onboarding.kidProfile.levels.${lvl}`)}
                accessibilityRole="button"
                accessibilityState={{ selected: level === lvl }}
              >
                <Text
                  style={[
                    styles.levelButtonText,
                    level === lvl && styles.levelButtonTextActive,
                  ]}
                >
                  {t(`onboarding.kidProfile.levels.${lvl}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Language picker */}
          <Text style={styles.label}>{t('onboarding.kidProfile.languageLabel')}</Text>
          <View style={styles.languageRow}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'en' && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage('en')}
              accessible
              accessibilityLabel={t('onboarding.kidProfile.languageEN')}
              accessibilityRole="button"
              accessibilityState={{ selected: language === 'en' }}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'en' && styles.languageButtonTextActive,
                ]}
              >
                {t('onboarding.kidProfile.languageEN')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'zh-Hans' && styles.languageButtonActive,
              ]}
              onPress={() => setLanguage('zh-Hans')}
              accessible
              accessibilityLabel={t('onboarding.kidProfile.languageZH')}
              accessibilityRole="button"
              accessibilityState={{ selected: language === 'zh-Hans' }}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  language === 'zh-Hans' && styles.languageButtonTextActive,
                ]}
              >
                {t('onboarding.kidProfile.languageZH')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Delete button (edit mode only) */}
          {editId && (
            <TouchableOpacity
              style={styles.deleteProfileButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteProfileButtonText}>
                {t('onboarding.kidSetup.deleteProfile')}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Save button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.saveButtonText}>
              {t('onboarding.kidSetup.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90D9',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
    marginTop: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    marginTop: 4,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: '#4A90D9',
  },
  levelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  levelButtonTextActive: {
    color: '#fff',
  },
  languageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#4A90D9',
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  deleteProfileButton: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#fce4e4',
    alignItems: 'center',
  },
  deleteProfileButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#d32f2f',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#b0d8c0',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
