import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Subject } from '../../models/homework-feedback';
import type { OcrBlock } from '../../models/ocr';
import { getConfidenceLevel } from '../../models/ocr';
import DrawingCanvas from './DrawingCanvas';
import {
  useManualInputDraft,
  type ManualInputDraftData,
} from '../../hooks/useManualInputDraft';

const SUBJECTS = [
  { key: 'math' as Subject, label: 'Math', color: '#1D4ED8', bgColor: '#DBEAFE' },
  { key: 'english' as Subject, label: 'English', color: '#7C3AED', bgColor: '#EDE9FE' },
  { key: 'science' as Subject, label: 'Science', color: '#059669', bgColor: '#D1FAE5' },
  { key: 'chinese_mt' as Subject, label: '中文', color: '#B45309', bgColor: '#FEF3C7' },
];

type InputMode = 'type' | 'stylus';

export interface ManualInputItem {
  index: number;
  originalText: string;
  confidence: number;
  typedText: string;
  inputMode: InputMode;
}

export interface ManualInputScreenProps {
  photoUri: string;
  blocks: OcrBlock[];
  imageWidth: number;
  imageHeight: number;
  onDone: (items: ManualInputItem[], subject: Subject) => void;
  onBack: () => void;
}

export default function ManualInputScreen({
  photoUri,
  blocks,
  imageWidth,
  imageHeight,
  onDone,
  onBack,
}: ManualInputScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const lowConfBlocks = useMemo(
    () => blocks.map((b, i) => ({ ...b, originalIndex: i })).filter((b) => getConfidenceLevel(b.confidence) !== 'high'),
    [blocks],
  );

  const [items, setItems] = useState<ManualInputItem[]>(() =>
    lowConfBlocks.map((b) => ({
      index: b.originalIndex,
      originalText: b.text,
      confidence: b.confidence,
      typedText: '',
      inputMode: 'type' as InputMode,
    })),
  );

  const [selectedSubject, setSelectedSubject] = useState<Subject>('math');
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showDraftRestored, setShowDraftRestored] = useState(false);

  const { saveDraft, clearDraft, loadDraft } = useManualInputDraft();

  useEffect(() => {
    (async () => {
      const saved = await loadDraft();
      if (saved && saved.items.length > 0) {
        setItems((prev) =>
          prev.map((item) => {
            const found = saved.items.find((si) => si.itemIndex === item.index);
            return found && found.typedText ? { ...item, typedText: found.typedText } : item;
          }),
        );
        if (saved.subject) setSelectedSubject(saved.subject as Subject);
        setShowDraftRestored(true);
        setTimeout(() => setShowDraftRestored(false), 3000);
      }
    })();
  }, []);

  const draftData: ManualInputDraftData | null = useMemo(() => {
    if (items.length === 0) return null;
    return {
      sessionId: `manual-${Date.now()}`,
      photoUri,
      imageWidth,
      imageHeight,
      subject: selectedSubject,
      items: items.map((item) => ({ itemIndex: item.index, typedText: item.typedText })),
    };
  }, [items, selectedSubject, photoUri, imageWidth, imageHeight]);

  useEffect(() => {
    if (draftData) saveDraft(draftData);
  }, [draftData, saveDraft]);

  const currentItem = items[currentItemIndex];
  const isLastItem = currentItemIndex === items.length - 1;
  const allFilled = items.every((item) => item.typedText.trim().length > 0);

  const updateItem = useCallback(
    (updates: Partial<ManualInputItem>) => {
      if (!currentItem) return;
      setItems((prev) => {
        const next = [...prev];
        next[currentItemIndex] = { ...next[currentItemIndex], ...updates };
        return next;
      });
    },
    [currentItemIndex],
  );

  const handlePrev = useCallback(() => {
    if (currentItemIndex > 0) setCurrentItemIndex((i) => i - 1);
  }, [currentItemIndex]);

  const handleNext = useCallback(() => {
    if (currentItemIndex < items.length - 1) setCurrentItemIndex((i) => i + 1);
  }, [currentItemIndex, items.length]);

  const handleDone = useCallback(() => {
    clearDraft();
    onDone(items, selectedSubject);
  }, [items, selectedSubject, clearDraft, onDone]);

  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header onBack={onBack} title={t('manualInputFallback.title')} />
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={48} color="#22C55E" />
          <Text style={styles.emptyStateTitle}>{t('manualInputFallback.title')}</Text>
          <Text style={styles.emptyStateText}>All text was recognised successfully.</Text>
          <Pressable style={styles.continueButton} onPress={handleDone}>
            <Text style={styles.continueButtonText}>{t('manualInputFallback.continue')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header onBack={onBack} title={t('manualInputFallback.title')} />

      {showDraftRestored && (
        <View style={styles.draftBanner}>
          <Ionicons name="refresh-outline" size={16} color="#2563EB" />
          <Text style={styles.draftBannerText}>{t('manualInputFallback.draftRestored')}</Text>
        </View>
      )}

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>{t('manualInputFallback.subtitle')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('manualInputFallback.subjectLabel')}</Text>
          <View style={styles.subjectRow}>
            {SUBJECTS.map((subj) => {
              const isSelected = selectedSubject === subj.key;
              return (
                <Pressable
                  key={subj.key}
                  style={[styles.subjectPill, { backgroundColor: isSelected ? subj.color : subj.bgColor, borderColor: subj.color }]}
                  onPress={() => setSelectedSubject(subj.key)}
                  accessibilityRole="button"
                  accessibilityLabel={subj.label}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.subjectPillText, { color: isSelected ? '#FFFFFF' : subj.color }]}>{subj.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {t('manualInputFallback.itemLabel', { number: currentItemIndex + 1 })} / {items.length}
          </Text>
          <View style={styles.progressDots}>
            {items.map((_, i) => (
              <View key={i} style={[styles.progressDot, { backgroundColor: i === currentItemIndex ? '#2563EB' : '#D1D5DB' }]} />
            ))}
          </View>
        </View>

        <View style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemHeaderLeft}>
              <View style={styles.itemNumberBadge}><Text style={styles.itemNumberText}>{currentItem.index + 1}</Text></View>
              <Text style={styles.itemTitle}>{t('manualInputFallback.itemLabel', { number: currentItem.index + 1 })}</Text>
            </View>
            <View style={[styles.confidenceBadge, { backgroundColor: currentItem.confidence >= 0.3 ? '#FEF9C3' : '#FEE2E2', borderColor: currentItem.confidence >= 0.3 ? '#EAB308' : '#EF4444' }]}>
              <Text style={[styles.confidenceBadgeText, { color: currentItem.confidence >= 0.3 ? '#854D0E' : '#DC2626' }]}>
                {Math.round(currentItem.confidence * 100)}%
              </Text>
            </View>
          </View>

          {currentItem.originalText ? (
            <View style={styles.originalTextRow}>
              <Text style={styles.originalTextLabel}>{t('manualInputFallback.originalText')}</Text>
              <Text style={styles.originalText} numberOfLines={2}>{currentItem.originalText}</Text>
            </View>
          ) : null}

          <View style={styles.modeTabs}>
            <Pressable
              style={[styles.modeTab, currentItem.inputMode === 'type' && styles.modeTabActive]}
              onPress={() => updateItem({ inputMode: 'type' })}
              accessibilityRole="button"
              accessibilityLabel={t('manualInputFallback.typeTab')}
              accessibilityState={{ selected: currentItem.inputMode === 'type' }}
            >
              <Ionicons name="keypad-outline" size={16} color={currentItem.inputMode === 'type' ? '#2563EB' : '#6B7280'} />
              <Text style={[styles.modeTabText, currentItem.inputMode === 'type' && styles.modeTabTextActive]}>{t('manualInputFallback.typeTab')}</Text>
            </Pressable>
            <Pressable
              style={[styles.modeTab, currentItem.inputMode === 'stylus' && styles.modeTabActive]}
              onPress={() => updateItem({ inputMode: 'stylus' })}
              accessibilityRole="button"
              accessibilityLabel={t('manualInputFallback.stylusTab')}
              accessibilityState={{ selected: currentItem.inputMode === 'stylus' }}
            >
              <Ionicons name="create-outline" size={16} color={currentItem.inputMode === 'stylus' ? '#2563EB' : '#6B7280'} />
              <Text style={[styles.modeTabText, currentItem.inputMode === 'stylus' && styles.modeTabTextActive]}>{t('manualInputFallback.stylusTab')}</Text>
            </Pressable>
          </View>

          {currentItem.inputMode === 'type' ? (
            <TextInput
              style={styles.textInput}
              value={currentItem.typedText}
              onChangeText={(text) => updateItem({ typedText: text })}
              placeholder={t('manualInputFallback.typeHere')}
              placeholderTextColor="#9CA3AF"
              multiline
              autoFocus={currentItem.typedText.length === 0}
              textAlignVertical="top"
              accessibilityLabel={t('manualInputFallback.typeHere')}
            />
          ) : (
            <View style={styles.stylusArea}>
              <DrawingCanvas accessibilityLabel={t('manualInputFallback.drawHere')} />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerNav}>
          <Pressable
            style={[styles.navButton, currentItemIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrev}
            disabled={currentItemIndex === 0}
            accessibilityRole="button"
            accessibilityLabel={t('manualInputFallback.prev')}
          >
            <Ionicons name="chevron-back" size={18} color={currentItemIndex === 0 ? '#D1D5DB' : '#374151'} />
            <Text style={[styles.navButtonText, currentItemIndex === 0 && styles.navButtonTextDisabled]}>{t('manualInputFallback.prev')}</Text>
          </Pressable>

          {!isLastItem ? (
            <Pressable style={styles.navButton} onPress={handleNext} accessibilityRole="button" accessibilityLabel={t('manualInputFallback.next')}>
              <Text style={styles.navButtonText}>{t('manualInputFallback.next')}</Text>
              <Ionicons name="chevron-forward" size={18} color="#374151" />
            </Pressable>
          ) : (
            <Pressable
              style={[styles.doneButton, !allFilled && styles.doneButtonDisabled]}
              onPress={handleDone}
              disabled={!allFilled}
              accessibilityRole="button"
              accessibilityLabel={t('manualInputFallback.done')}
              accessibilityState={{ disabled: !allFilled }}
            >
              <Text style={[styles.doneButtonText, !allFilled && styles.doneButtonTextDisabled]}>{t('manualInputFallback.done')}</Text>
              <Ionicons name="checkmark-circle-outline" size={18} color={allFilled ? '#FFFFFF' : '#9CA3AF'} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={headerStyles.container}>
      <Pressable onPress={onBack} style={headerStyles.backButton} accessibilityRole="button" accessibilityLabel="Back">
        <Ionicons name="chevron-back" size={22} color="#374151" />
      </Pressable>
      <Text style={headerStyles.title}>{title}</Text>
      <View style={headerStyles.spacer} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  spacer: { width: 40 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  draftBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#DBEAFE', paddingHorizontal: 16, paddingVertical: 8 },
  draftBannerText: { fontSize: 13, color: '#1D4ED8', fontWeight: '500' },
  body: { flex: 1 },
  bodyContent: { padding: 16, gap: 16, paddingBottom: 24 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  section: { gap: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  subjectPillText: { fontSize: 14, fontWeight: '600' },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  progressDots: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  itemCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemNumberBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  itemNumberText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#374151' },
  confidenceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  confidenceBadgeText: { fontSize: 12, fontWeight: '700' },
  originalTextRow: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 10 },
  originalTextLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', marginBottom: 4 },
  originalText: { fontSize: 14, color: '#6B7280', fontStyle: 'italic', lineHeight: 20 },
  modeTabs: { flexDirection: 'row', gap: 8 },
  modeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB' },
  modeTabActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  modeTabText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  modeTabTextActive: { color: '#2563EB' },
  textInput: { minHeight: 100, backgroundColor: '#F8F9FA', borderRadius: 10, borderWidth: 1.5, borderColor: '#D1D5DB', padding: 14, fontSize: 16, color: '#1A1A1A', lineHeight: 24 },
  stylusArea: { height: 200 },
  footer: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerNav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  navButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#F3F4F6' },
  navButtonDisabled: { opacity: 0.5 },
  navButtonText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  navButtonTextDisabled: { color: '#D1D5DB' },
  doneButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
  doneButtonDisabled: { backgroundColor: '#E5E7EB' },
  doneButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  doneButtonTextDisabled: { color: '#9CA3AF' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyStateTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  emptyStateText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  continueButton: { backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  continueButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
