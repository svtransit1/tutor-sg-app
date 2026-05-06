/**
 * ParentKidManagementScreen — Parent profile & kid management screen.
 *
 * Purpose: After parent signs in, they configure their account:
 *   - Display name (editable)
 *   - Language preference toggle (EN / zh-Hans)
 *   - Add/edit/remove child profiles (up to 4 per family plan)
 *   - Each child has: name, grade (P1–P6), language preference
 *
 * Per AAAS-165 / M2-26:
 *   - Min 1 child, max 4 children
 *   - Validation before "Continue" enables
 *   - Proceeds to device tier check + model download
 *
 * Bilingual (EN + zh-Hans). Kid-safe (no data leaving device).
 * Accessibility: VoiceOver/TalkBack labels on all interactive elements.
 * Uses Text + emoji for icons (no @expo/vector-icons dependency).
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import {
  saveParentProfile,
  loadParentProfile,
  persistChildren,
  type ChildProfileFull,
} from '../../storage/parent-profile';
import type { Grade } from '../../storage/onboarding-state';

// ── Constants ──────────────────────────────────────────────────────

const MAX_CHILDREN = 4;
const GRADES: Grade[] = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

// ── Types ──────────────────────────────────────────────────────────

interface ParentKidManagementScreenProps {
  /** Called when setup completes. */
  onComplete?: () => void;
}

interface ChildFormData {
  name: string;
  grade: Grade | null;
  language: 'en' | 'zh-Hans';
}

type FormMode = 'idle' | 'adding' | 'editing';

// ── Helpers ────────────────────────────────────────────────────────

function emptyFormData(): ChildFormData {
  return { name: '', grade: null, language: 'en' };
}

// ── Child Card Component ───────────────────────────────────────────

function ChildCard({
  child,
  onEdit,
  onRemove,
}: {
  child: ChildProfileFull;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t, i18n } = useTranslation();
  const labelKey =
    child.language === 'en'
      ? 'onboarding.parentKidManagement.accessibility.childCardEn'
      : 'onboarding.parentKidManagement.accessibility.childCardZh';

  return (
    <View
      style={styles.childCard}
      accessibilityRole="none"
      accessibilityLabel={t(labelKey, { name: child.name, grade: child.grade })}
    >
      <View style={styles.childCardInfo}>
        <Text style={styles.childCardName}>{child.name}</Text>
        <View style={styles.childCardMeta}>
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeBadgeText}>
              {t(`onboarding.gradePick.grade${child.grade}`)}
            </Text>
          </View>
          <Text style={styles.childCardLang}>
            {child.language === 'en' ? 'EN' : '中文'}
          </Text>
        </View>
      </View>
      <View style={styles.childCardActions}>
        <Pressable
          style={({ pressed }) => [styles.smallBtn, pressed && styles.smallBtnPressed]}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.parentKidManagement.accessibility.editChildButton', {
            name: child.name,
          })}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.smallBtnText}>
            ✏️ {t('onboarding.parentKidManagement.editChild')}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.smallBtnDanger, pressed && styles.smallBtnDangerPressed]}
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.parentKidManagement.accessibility.removeChildButton', {
            name: child.name,
          })}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.smallBtnDangerText}>
            🗑️ {t('onboarding.parentKidManagement.removeChild')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Grade Picker Component ─────────────────────────────────────────

function GradePicker({
  selected,
  onSelect,
}: {
  selected: Grade | null;
  onSelect: (g: Grade) => void;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.gradeRow}>
      {GRADES.map((grade) => {
        const isSelected = selected === grade;
        return (
          <Pressable
            key={grade}
            style={({ pressed }) => [
              styles.gradeChip,
              isSelected && styles.gradeChipSelected,
              pressed && !isSelected && styles.gradeChipPressed,
            ]}
            onPress={() => onSelect(grade)}
            accessibilityRole="button"
            accessibilityLabel={
              isSelected
                ? t('onboarding.parentKidManagement.accessibility.gradeSelected', { grade })
                : t('onboarding.parentKidManagement.accessibility.gradeOption', { grade })
            }
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              style={[styles.gradeChipText, isSelected && styles.gradeChipTextSelected]}
            >
              {t(`onboarding.gradePick.grade${grade}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Child Form Modal (Inline) ──────────────────────────────────────

function ChildForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: ChildFormData;
  onSave: (data: ChildFormData) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial.name);
  const [grade, setGrade] = useState<Grade | null>(initial.grade);
  const [language, setLanguage] = useState<'en' | 'zh-Hans'>(initial.language);
  const [nameError, setNameError] = useState(false);
  const [gradeError, setGradeError] = useState(false);

  const handleSave = useCallback(() => {
    const nameTrimmed = name.trim();
    const hasNameError = nameTrimmed.length === 0;
    const hasGradeError = grade === null;

    setNameError(hasNameError);
    setGradeError(hasGradeError);

    if (!hasNameError && !hasGradeError) {
      onSave({ name: nameTrimmed, grade, language });
    }
  }, [name, grade, language, onSave]);

  return (
    <View style={styles.childForm} accessibilityRole="none">
      {/* Name */}
      <Text style={styles.formLabel}>
        {t('onboarding.parentKidManagement.nameLabel')}
      </Text>
      <TextInput
        style={[styles.textInput, nameError && styles.textInputError]}
        value={name}
        onChangeText={setName}
        placeholder={t('onboarding.parentKidManagement.namePlaceholder')}
        placeholderTextColor="#9CA3AF"
        autoFocus
        accessibilityLabel={t('onboarding.parentKidManagement.nameLabel')}
      />
      {nameError && (
        <Text style={styles.fieldError}>
          {t('onboarding.parentKidManagement.validation.nameRequired')}
        </Text>
      )}

      {/* Grade */}
      <Text style={[styles.formLabel, { marginTop: 16 }]}>
        {t('onboarding.parentKidManagement.gradeLabel')}
      </Text>
      <GradePicker selected={grade} onSelect={(g) => { setGrade(g); setGradeError(false); }} />
      {gradeError && (
        <Text style={styles.fieldError}>
          {t('onboarding.parentKidManagement.validation.gradeRequired')}
        </Text>
      )}

      {/* Language */}
      <Text style={[styles.formLabel, { marginTop: 16 }]}>
        {t('onboarding.parentKidManagement.childLanguageLabel')}
      </Text>
      <View style={styles.langToggleRow}>
        <Pressable
          style={({ pressed }) => [
            styles.langToggleBtn,
            language === 'en' && styles.langToggleBtnActive,
            pressed && styles.langToggleBtnPressed,
          ]}
          onPress={() => setLanguage('en')}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.parentKidManagement.childLanguageEn')}
          accessibilityState={{ selected: language === 'en' }}
        >
          <Text
            style={[
              styles.langToggleBtnText,
              language === 'en' && styles.langToggleBtnTextActive,
            ]}
          >
            {t('onboarding.parentKidManagement.childLanguageEn')}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.langToggleBtn,
            language === 'zh-Hans' && styles.langToggleBtnActive,
            pressed && styles.langToggleBtnPressed,
          ]}
          onPress={() => setLanguage('zh-Hans')}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.parentKidManagement.childLanguageZhHans')}
          accessibilityState={{ selected: language === 'zh-Hans' }}
        >
          <Text
            style={[
              styles.langToggleBtnText,
              language === 'zh-Hans' && styles.langToggleBtnTextActive,
            ]}
          >
            {t('onboarding.parentKidManagement.childLanguageZhHans')}
          </Text>
        </Pressable>
      </View>

      {/* Action buttons */}
      <View style={styles.formActions}>
        <Pressable
          style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnSecondaryPressed]}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.parentKidManagement.cancel')}
        >
          <Text style={styles.btnSecondaryText}>
            ❌ {t('onboarding.parentKidManagement.cancel')}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.parentKidManagement.saveChild')}
        >
          <Text style={styles.btnPrimaryText}>
            ✅ {t('onboarding.parentKidManagement.saveChild')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Main Screen Component ──────────────────────────────────────────

export default function ParentKidManagementScreen({
  onComplete,
}: ParentKidManagementScreenProps) {
  const { t } = useTranslation();

  // ── Parent profile state ────────────────────────────────────

  const [displayName, setDisplayName] = useState('');
  const [parentLanguage, setParentLanguage] = useState<'en' | 'zh-Hans'>('en');
  const [parentNameError, setParentNameError] = useState(false);

  // ── Children state ──────────────────────────────────────────

  const [children, setChildren] = useState<ChildProfileFull[]>([]);
  const [formMode, setFormMode] = useState<FormMode>('idle');
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [minChildrenError, setMinChildrenError] = useState(false);
  const [maxChildrenError, setMaxChildrenError] = useState(false);

  // ── Load persisted state on mount ───────────────────────────

  React.useEffect(() => {
    const profile = loadParentProfile();
    setDisplayName(profile.displayName);
    setParentLanguage(profile.language);
    setChildren(profile.children);
  }, []);

  // ── Derived ─────────────────────────────────────────────────

  const childCount = children.length;
  const canAddMore = childCount < MAX_CHILDREN;
  const hasRequiredChildren = childCount >= 1;

  const formInitial = useMemo<ChildFormData>(() => {
    if (formMode === 'editing' && editingChildId) {
      const existing = children.find((c) => c.id === editingChildId);
      if (existing) {
        return {
          name: existing.name,
          grade: existing.grade,
          language: existing.language,
        };
      }
    }
    return emptyFormData();
  }, [formMode, editingChildId, children]);

  // ── Handlers ────────────────────────────────────────────────

  const handleAddChild = useCallback(() => {
    if (!canAddMore) {
      setMaxChildrenError(true);
      setTimeout(() => setMaxChildrenError(false), 3000);
      return;
    }
    setFormMode('adding');
    setEditingChildId(null);
  }, [canAddMore]);

  const handleEditChild = useCallback((id: string) => {
    setFormMode('editing');
    setEditingChildId(id);
  }, []);

  const handleRemoveChild = useCallback(
    (id: string) => {
      const child = children.find((c) => c.id === id);
      if (!child) return;
      Alert.alert(
        t('onboarding.parentKidManagement.confirmRemoveTitle', { name: child.name }),
        t('onboarding.parentKidManagement.confirmRemoveBody', { name: child.name }),
        [
          {
            text: t('onboarding.parentKidManagement.confirmRemoveNo'),
            style: 'cancel',
          },
          {
            text: t('onboarding.parentKidManagement.confirmRemoveYes'),
            style: 'destructive',
            onPress: () => {
              const updated = children.filter((c) => c.id !== id);
              setChildren(updated);
              persistChildren(updated);
            },
          },
        ],
      );
    },
    [children, t],
  );

  const handleSaveChildForm = useCallback(
    (data: ChildFormData) => {
      if (formMode === 'adding') {
        const newChild: ChildProfileFull = {
          id: uuidv4(),
          name: data.name,
          grade: data.grade!,
          language: data.language,
        };
        const updated = [...children, newChild];
        setChildren(updated);
        persistChildren(updated);
      } else if (formMode === 'editing' && editingChildId) {
        const updated = children.map((c) =>
          c.id === editingChildId
            ? { ...c, name: data.name, grade: data.grade!, language: data.language }
            : c,
        );
        setChildren(updated);
        persistChildren(updated);
      }
      setFormMode('idle');
      setEditingChildId(null);
    },
    [formMode, editingChildId, children],
  );

  const handleCancelForm = useCallback(() => {
    setFormMode('idle');
    setEditingChildId(null);
  }, []);

  const handleContinue = useCallback(() => {
    // Validate
    const nameTrimmed = displayName.trim();
    let valid = true;

    if (nameTrimmed.length === 0) {
      setParentNameError(true);
      valid = false;
    } else {
      setParentNameError(false);
    }

    if (children.length < 1) {
      setMinChildrenError(true);
      valid = false;
    } else {
      setMinChildrenError(false);
    }

    if (!valid) return;

    // Save everything
    saveParentProfile({
      displayName: nameTrimmed,
      language: parentLanguage,
      children,
    });

    onComplete?.();
  }, [displayName, parentLanguage, children, onComplete]);

  // ── Render ──────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Parent Profile Section ─────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('onboarding.parentKidManagement.parentSectionTitle')}
        </Text>

        {/* Display name */}
        <Text style={styles.formLabel}>
          {t('onboarding.parentKidManagement.displayNameLabel')}
        </Text>
        <TextInput
          style={[styles.textInput, parentNameError && styles.textInputError]}
          value={displayName}
          onChangeText={(text) => { setDisplayName(text); setParentNameError(false); }}
          placeholder={t('onboarding.parentKidManagement.displayNamePlaceholder')}
          placeholderTextColor="#9CA3AF"
          accessibilityLabel={t('onboarding.parentKidManagement.displayNameLabel')}
        />
        {parentNameError && (
          <Text style={styles.fieldError}>
            {t('onboarding.parentKidManagement.validation.parentNameRequired')}
          </Text>
        )}

        {/* Language toggle */}
        <Text style={[styles.formLabel, { marginTop: 16 }]}>
          {t('onboarding.parentKidManagement.languageLabel')}
        </Text>
        <View style={styles.langToggleRow}>
          <Pressable
            style={({ pressed }) => [
              styles.langToggleBtn,
              parentLanguage === 'en' && styles.langToggleBtnActive,
              pressed && styles.langToggleBtnPressed,
            ]}
            onPress={() => setParentLanguage('en')}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.parentKidManagement.languageEn')}
            accessibilityState={{ selected: parentLanguage === 'en' }}
          >
            <Text
              style={[
                styles.langToggleBtnText,
                parentLanguage === 'en' && styles.langToggleBtnTextActive,
              ]}
            >
              {t('onboarding.parentKidManagement.languageEn')}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.langToggleBtn,
              parentLanguage === 'zh-Hans' && styles.langToggleBtnActive,
              pressed && styles.langToggleBtnPressed,
            ]}
            onPress={() => setParentLanguage('zh-Hans')}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.parentKidManagement.languageZhHans')}
            accessibilityState={{ selected: parentLanguage === 'zh-Hans' }}
          >
            <Text
              style={[
                styles.langToggleBtnText,
                parentLanguage === 'zh-Hans' && styles.langToggleBtnTextActive,
              ]}
            >
              {t('onboarding.parentKidManagement.languageZhHans')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── Children Section ───────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('onboarding.parentKidManagement.childrenSectionTitle')}
        </Text>
        <Text style={styles.sectionHelper}>
          {t('onboarding.parentKidManagement.childrenHelper')}
        </Text>

        {/* Child list */}
        {children.length > 0 && (
          <View style={styles.childList}>
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onEdit={() => handleEditChild(child.id)}
                onRemove={() => handleRemoveChild(child.id)}
              />
            ))}
          </View>
        )}

        {/* Add child button */}
        {formMode === 'idle' && (
          <Pressable
            style={({ pressed }) => [
              styles.addChildBtn,
              pressed && styles.addChildBtnPressed,
              !canAddMore && styles.addChildBtnDisabled,
            ]}
            onPress={handleAddChild}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.parentKidManagement.accessibility.addChildButton')}
            disabled={!canAddMore}
          >
            <Text style={[styles.addChildBtnText, !canAddMore && styles.addChildBtnTextDisabled]}>
              ➕ {t('onboarding.parentKidManagement.addChild')}
            </Text>
          </Pressable>
        )}

        {/* Max children error */}
        {maxChildrenError && (
          <Text style={styles.fieldError} accessibilityRole="alert">
            {t('onboarding.parentKidManagement.validation.maxChildren')}
          </Text>
        )}

        {/* Inline form */}
        {formMode !== 'idle' && (
          <ChildForm
            initial={formInitial}
            onSave={handleSaveChildForm}
            onCancel={handleCancelForm}
          />
        )}

        {/* Min children error */}
        {minChildrenError && (
          <Text
            style={[styles.fieldError, { marginTop: 12 }]}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            {t('onboarding.parentKidManagement.validation.minChildren')}
          </Text>
        )}
      </View>

      {/* ── Continue Button ────────────────────────────────────── */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.continueBtn,
            !hasRequiredChildren && styles.continueBtnDisabled,
            pressed && hasRequiredChildren && styles.continueBtnPressed,
          ]}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.parentKidManagement.continue')}
          disabled={false}
        >
          <Text
            style={[
              styles.continueBtnText,
              !hasRequiredChildren && styles.continueBtnTextDisabled,
            ]}
          >
            {t('onboarding.parentKidManagement.continue')} →
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Sections
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  sectionHelper: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: 16,
  },

  // Form fields
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#F9FAFB',
  },
  textInputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  fieldError: {
    fontSize: 13,
    fontWeight: '500',
    color: '#DC2626',
    marginTop: 6,
  },

  // Language toggle
  langToggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  langToggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  langToggleBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  langToggleBtnPressed: {
    backgroundColor: '#F3F4F6',
  },
  langToggleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  langToggleBtnTextActive: {
    color: '#2563EB',
  },

  // Child list
  childList: {
    gap: 12,
    marginBottom: 16,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  childCardInfo: {
    flex: 1,
  },
  childCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  childCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
  },
  gradeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  childCardLang: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  childCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },

  // Small action buttons
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  smallBtnPressed: {
    backgroundColor: '#E5E7EB',
  },
  smallBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  smallBtnDanger: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  smallBtnDangerPressed: {
    backgroundColor: '#FEE2E2',
  },
  smallBtnDangerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },

  // Add child button
  addChildBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F5FF',
  },
  addChildBtnPressed: {
    backgroundColor: '#DBE6FF',
  },
  addChildBtnDisabled: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  addChildBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  addChildBtnTextDisabled: {
    color: '#9CA3AF',
  },

  // Grade picker
  gradeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gradeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  gradeChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  gradeChipPressed: {
    backgroundColor: '#E5E7EB',
  },
  gradeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  gradeChipTextSelected: {
    color: '#2563EB',
  },

  // Inline child form
  childForm: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  // Buttons
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryPressed: {
    backgroundColor: '#1D4ED8',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  btnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  btnSecondaryPressed: {
    backgroundColor: '#F3F4F6',
  },
  btnSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Footer with continue button
  footer: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  continueBtn: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnPressed: {
    backgroundColor: '#1D4ED8',
  },
  continueBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  continueBtnTextDisabled: {
    color: '#BFDBFE',
  },
} as TextStyle);
