import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useOnboarding } from '../OnboardingProvider';
import { useTranslation } from 'react-i18next';
import { addKid, updateKid, deleteKid, getKids } from '../../storage/kid-profile';
import type { KidProfile } from '../../storage/kid-profile';

const LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'] as const;
type Level = (typeof LEVELS)[number];
const MAX_KIDS = 4;

const LEVEL_LABELS: Record<Level, { en: string; zh: string }> = {
  P1: { en: 'Primary 1', zh: '小一' },
  P2: { en: 'Primary 2', zh: '小二' },
  P3: { en: 'Primary 3', zh: '小三' },
  P4: { en: 'Primary 4', zh: '小四' },
  P5: { en: 'Primary 5', zh: '小五' },
  P6: { en: 'Primary 6', zh: '小六' },
};

export function KidProfileScreen() {
  const { t, i18n } = useTranslation();
  const { goNext, updateProgress } = useOnboarding();

  // List of persisted kids
  const [kids, setKids] = useState<KidProfile[]>([]);

  // Form state for adding/editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<Level | null>(null);
  const [language, setLanguage] = useState<'en' | 'zh-Hans'>('en');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadKids = useCallback(async () => {
    const data = await getKids();
    setKids(data);
  }, []);

  useEffect(() => {
    loadKids();
  }, [loadKids]);

  const resetForm = () => {
    setName('');
    setLevel(null);
    setLanguage('en');
    setError('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (kid: KidProfile) => {
    setEditingId(kid.id);
    setName(kid.name);
    setLevel(kid.level);
    setLanguage(kid.language);
    setError('');
    setShowForm(true);
  };

  const handleDelete = (kid: KidProfile) => {
    Alert.alert(
      t('onboarding.kidProfile.deleteTitle', 'Delete profile?'),
      t('onboarding.kidProfile.deleteDesc', 'This cannot be undone.'),
      [
        { text: t('onboarding.common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('onboarding.common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteKid(kid.id);
            if (editingId === kid.id) resetForm();
            await loadKids();
          },
        },
      ],
    );
  };

  const handleSave = async () => {
    if (name.trim().length === 0 || name.trim().length > 30) {
      setError(t('onboarding.kidProfile.nameError', 'Name must be 1-30 characters'));
      return;
    }
    if (!level) return;

    if (editingId) {
      await updateKid(editingId, { name: name.trim(), level, language });
    } else {
      const result = await addKid(name.trim(), level, language);
      if (!result) {
        Alert.alert('Error', t('onboarding.kidProfile.maxKids', 'Maximum 4 children reached.'));
        return;
      }
    }

    resetForm();
    await loadKids();
  };

  const handleContinue = () => {
    if (kids.length === 0) return;
    // Persist the first kid to the onboarding state machine for downstream compatibility
    const first = kids[0]!;
    updateProgress({
      kidName: first.name,
      kidLevel: first.level,
      kidLanguage: first.language,
    });
    goNext();
  };

  const canSave = name.trim().length >= 1 && name.trim().length <= 30 && level !== null;
  const canContinue = kids.length > 0 && !showForm;
  const levelLabel = (l: Level) =>
    i18n.language === 'zh-Hans' ? LEVEL_LABELS[l].zh : LEVEL_LABELS[l].en;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>
        {t('onboarding.kidProfile.title', 'Set up child profile')}
      </Text>

      {/* Existing kids list */}
      {kids.length > 0 && (
        <View style={styles.kidsSection}>
          <Text style={styles.kidsSectionTitle}>
            {t('onboarding.kidProfile.children', 'Children')} ({kids.length}/{MAX_KIDS})
          </Text>
          {kids.map((kid) => (
            <View key={kid.id} style={styles.kidCard}>
              <View style={styles.kidInfo}>
                <Text style={styles.kidName}>{kid.name}</Text>
                <Text style={styles.kidDetail}>
                  {levelLabel(kid.level)} &middot; {kid.language === 'en' ? 'English' : '简体中文'}
                </Text>
              </View>
              <View style={styles.kidActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleEdit(kid)}
                  testID={`kid-edit-${kid.id}`}
                >
                  <Text style={styles.editBtnText}>{t('onboarding.kidProfile.edit', 'Edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(kid)}
                  testID={`kid-delete-${kid.id}`}
                >
                  <Text style={styles.deleteBtnText}>{t('onboarding.kidProfile.delete', 'Delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>
            {editingId
              ? t('onboarding.kidProfile.editTitle', 'Edit profile')
              : t('onboarding.kidProfile.addTitle', 'Add another child')}
          </Text>

          <Text style={styles.label}>
            {t('onboarding.kidProfile.nameLabel', "Child's name")}
          </Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (v.trim().length > 30) setError(t('onboarding.kidProfile.nameError', 'Name must be 1-30 characters'));
              else setError('');
            }}
            placeholder={t('onboarding.kidProfile.namePlaceholder', 'Enter a name (max 30 characters)')}
            maxLength={35}
            autoCapitalize="words"
            testID="kidProfile-name"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>
            {t('onboarding.kidProfile.levelLabel', 'Primary level')}
          </Text>
          <View style={styles.levelGrid}>
            {LEVELS.map((l) => (
              <TouchableOpacity
                key={l}
                style={[styles.levelChip, level === l && styles.levelChipActive]}
                onPress={() => setLevel(l)}
                testID={`kidProfile-level-${l}`}
              >
                <Text style={[styles.levelText, level === l && styles.levelTextActive]}>
                  {levelLabel(l)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>
            {t('onboarding.kidProfile.languageLabel', 'Primary language')}
          </Text>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langChip, language === 'en' && styles.langChipActive]}
              onPress={() => setLanguage('en')}
              testID="kidProfile-lang-en"
            >
              <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
                {t('onboarding.kidProfile.languageEN', 'English')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langChip, language === 'zh-Hans' && styles.langChipActive]}
              onPress={() => setLanguage('zh-Hans')}
              testID="kidProfile-lang-zh"
            >
              <Text style={[styles.langText, language === 'zh-Hans' && styles.langTextActive]}>
                {t('onboarding.kidProfile.languageZH', '简体中文')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelBtnText}>{t('onboarding.common.cancel', 'Cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!canSave}
              testID="kidProfile-save"
            >
              <Text style={styles.saveBtnText}>{t('onboarding.common.save', 'Save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Add child button (when not showing form and under max) */}
      {!showForm && kids.length < MAX_KIDS && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            resetForm();
            setShowForm(true);
          }}
          testID="kidProfile-add"
        >
          <Text style={styles.addBtnText}>
            {kids.length === 0
              ? t('onboarding.kidProfile.addFirst', 'Add your first child')
              : t('onboarding.kidProfile.addAnother', 'Add another child')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Continue button */}
      {!showForm && (
        <TouchableOpacity
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          testID="kidProfile-continue"
        >
          <Text style={styles.buttonText}>
            {t('onboarding.common.next', 'Next')}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24 },
  kidsSection: { marginBottom: 16 },
  kidsSectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#666' },
  kidCard: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  kidInfo: { marginBottom: 10 },
  kidName: { fontSize: 17, fontWeight: '600', color: '#1a1a2e' },
  kidDetail: { fontSize: 16, color: '#666', marginTop: 2 },
  kidActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e8edf5',
    alignItems: 'center',
  },
  editBtnText: { fontSize: 14, fontWeight: '500', color: '#4A90D9' },
  deleteBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fce4e4',
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 14, fontWeight: '500', color: '#d32f2f' },
  formSection: { marginTop: 8 },
  formTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  inputError: { borderColor: '#d32f2f' },
  errorText: { color: '#d32f2f', fontSize: 14, marginTop: 4 },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
  levelChipActive: { borderColor: '#4A90D9', backgroundColor: '#E8F0FE' },
  levelText: { fontSize: 16 },
  levelTextActive: { color: '#4A90D9', fontWeight: '600' },
  langRow: { flexDirection: 'row', gap: 12 },
  langChip: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  langChipActive: { borderColor: '#4A90D9', backgroundColor: '#E8F0FE' },
  langText: { fontSize: 16 },
  langTextActive: { color: '#4A90D9', fontWeight: '600' },
  formButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  cancelBtnText: { fontSize: 16, color: '#666', fontWeight: '500' },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#2ecc71', alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  addBtn: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  button: { backgroundColor: '#4A90D9', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
