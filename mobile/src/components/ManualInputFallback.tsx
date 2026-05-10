import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

export type ManualInputTab = 'type' | 'draw';

export interface ManualInputFallbackProps {
  failedItems: number[];
  subject?: string;
  error?: 'parseFailed' | 'noInputs' | null;
  onSubjectChange?: (subject: string) => void;
  onSkipItem: (itemNumber: number) => void;
  onSubmit: (answers: Record<number, string>) => void;
  onDismissError?: () => void;
  onBack?: () => void;
}

export default function ManualInputFallback({
  failedItems,
  error,
  onSkipItem,
  onSubmit,
  onDismissError,
  onBack,
}: ManualInputFallbackProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeTabs, setActiveTabs] = useState<Record<number, ManualInputTab>>({});
  const [submitted, setSubmitted] = useState(false);

  const bgColor = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#B0B0B0' : '#6B7280';
  const borderColor = isDark ? '#333333' : '#E5E7EB';
  const primaryColor = isDark ? '#2563EB' : '#4A90D9';
  const secondaryBg = isDark ? '#2A2A2A' : '#F3F4F6';
  const inputBg = isDark ? '#2A2A2A' : '#F9FAFB';
  const inputBorder = isDark ? '#444444' : '#D1D5DB';
  const errorBg = isDark ? '#2A1A1A' : '#FFF5F5';
  const errorBorder = isDark ? '#5A2A2A' : '#FECACA';
  const errorTextColor = isDark ? '#FCA5A5' : '#DC2626';

  const remainingCount = failedItems.filter(
    (item) => !answers[item] && !submitted,
  ).length;

  const allFilled = failedItems.every((item) => (answers[item] ?? '').trim().length > 0);

  const handleAnswerChange = useCallback(
    (itemNumber: number, text: string) => {
      setAnswers((prev) => ({ ...prev, [itemNumber]: text }));
      if (error && onDismissError) onDismissError();
    },
    [error, onDismissError],
  );

  const handleTabChange = useCallback(
    (itemNumber: number, tab: ManualInputTab) => {
      setActiveTabs((prev) => ({ ...prev, [itemNumber]: tab }));
    },
    [],
  );

  const handleClear = useCallback(
    (itemNumber: number) => {
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[itemNumber];
        return next;
      });
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!allFilled && remainingCount > 0) return;
    setSubmitted(true);
    onSubmit(answers);
  }, [allFilled, remainingCount, answers, onSubmit]);

  const subjectColors = ['#4A90D9', '#34A853', '#EA4335', '#FBBC04', '#9C27B0'];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel={t('manualInputFallback.accessibility.back')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={[styles.backBtnText, { color: primaryColor }]}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.title, { color: textColor }]}>
            {t('manualInputFallback.title')}
          </Text>
        </View>
        <Text style={[styles.description, { color: mutedColor }]}>
          {t('manualInputFallback.description')}
        </Text>

        {failedItems.map((itemNumber, idx) => {
          const tab = activeTabs[itemNumber] ?? 'type';
          const answer = answers[itemNumber] ?? '';
          const accentColor = subjectColors[idx % subjectColors.length];
          const isDraw = tab === 'draw';

          return (
            <View
              key={itemNumber}
              style={[styles.itemCard, { backgroundColor: secondaryBg, borderColor }]}
              accessibilityLabel={`${t('manualInputFallback.itemLabel', { number: String(itemNumber) })}`}
            >
              <View style={styles.itemHeader}>
                <View style={[styles.itemBadge, { backgroundColor: accentColor }]}>
                  <Text style={styles.itemBadgeText}>{itemNumber}</Text>
                </View>
                <Text style={[styles.itemLabel, { color: textColor }]}>
                  {t('manualInputFallback.itemLabel', { number: String(itemNumber) })}
                </Text>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    onPress={() => handleClear(itemNumber)}
                    style={styles.itemActionBtn}
                    accessibilityRole="button"
                    accessibilityLabel={t('manualInputFallback.clear')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.itemActionText, { color: mutedColor }]}>
                      {t('manualInputFallback.clear')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onSkipItem(itemNumber)}
                    style={styles.itemActionBtn}
                    accessibilityRole="button"
                    accessibilityLabel={t('manualInputFallback.accessibility.skip')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.itemActionText, { color: mutedColor }]}>
                      {t('manualInputFallback.skip')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    tab === 'type' && [styles.tabActive, { borderColor: accentColor }],
                  ]}
                  onPress={() => handleTabChange(itemNumber, 'type')}
                  accessibilityRole="button"
                  accessibilityLabel={t('manualInputFallback.typeTab')}
                  accessibilityState={{ selected: tab === 'type' }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: mutedColor },
                      tab === 'type' && { color: accentColor },
                    ]}
                  >
                    {t('manualInputFallback.typeTab')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    isDraw && [styles.tabActive, { borderColor: accentColor }],
                  ]}
                  onPress={() => handleTabChange(itemNumber, 'draw')}
                  accessibilityRole="button"
                  accessibilityLabel={t('manualInputFallback.drawTab')}
                  accessibilityState={{ selected: isDraw }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: mutedColor },
                      isDraw && { color: accentColor },
                    ]}
                  >
                    {t('manualInputFallback.drawTab')}
                  </Text>
                </TouchableOpacity>
              </View>

              {tab === 'type' ? (
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                    },
                  ]}
                  value={answer}
                  onChangeText={(text) => handleAnswerChange(itemNumber, text)}
                  placeholder={t('manualInputFallback.typePlaceholder')}
                  placeholderTextColor={mutedColor}
                  accessibilityLabel={t('manualInputFallback.accessibility.typeInput', {
                    number: String(itemNumber),
                  })}
                  accessibilityRole="none"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              ) : (
                <View
                  style={[
                    styles.drawCanvas,
                    {
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                    },
                  ]}
                  accessibilityLabel={t('manualInputFallback.accessibility.drawCanvas', {
                    number: String(itemNumber),
                  })}
                  accessibilityRole="image"
                >
                  <Text style={[styles.drawPlaceholder, { color: mutedColor }]}>
                    {t('manualInputFallback.drawPlaceholder')}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {error === 'parseFailed' && (
          <View
            style={[styles.errorBanner, { backgroundColor: errorBg, borderColor: errorBorder }]}
            accessibilityRole="alert"
            accessibilityLabel={t('manualInputFallback.error.parseFailed')}
          >
            <Text style={[styles.errorText, { color: errorTextColor }]}>
              {t('manualInputFallback.error.parseFailed')}
            </Text>
          </View>
        )}

        {error === 'noInputs' && (
          <View
            style={[styles.errorBanner, { backgroundColor: errorBg, borderColor: errorBorder }]}
            accessibilityRole="alert"
            accessibilityLabel={t('manualInputFallback.error.noInputs')}
          >
            <Text style={[styles.errorText, { color: errorTextColor }]}>
              {t('manualInputFallback.error.noInputs')}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: borderColor }]}>
        <View style={styles.footerRow}>
          <Text style={[styles.remaining, { color: mutedColor }]}>
            {remainingCount > 0
              ? t('manualInputFallback.remaining', { count: String(remainingCount) })
              : ''}
          </Text>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: allFilled ? primaryColor : (isDark ? '#444444' : '#D1D5DB') },
            ]}
            onPress={handleSubmit}
            disabled={!allFilled}
            accessibilityRole="button"
            accessibilityLabel={t('manualInputFallback.accessibility.submit')}
            accessibilityState={{ disabled: !allFilled }}
          >
            <Text
              style={[
                styles.submitBtnText,
                { color: allFilled ? '#FFFFFF' : (isDark ? '#888888' : '#9CA3AF') },
              ]}
            >
              {t('manualInputFallback.submit')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } satisfies ViewStyle,

  scroll: {
    flex: 1,
  } satisfies ViewStyle,

  scrollContent: {
    padding: 24,
    paddingBottom: 16,
  } satisfies ViewStyle,

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  } satisfies ViewStyle,

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,

  backBtnText: {
    fontSize: 22,
    fontWeight: '600',
  } satisfies TextStyle,

  title: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  } satisfies TextStyle,

  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  } satisfies TextStyle,

  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  } satisfies ViewStyle,

  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  } satisfies ViewStyle,

  itemBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,

  itemBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  } satisfies TextStyle,

  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  } satisfies TextStyle,

  itemActions: {
    flexDirection: 'row',
    gap: 8,
  } satisfies ViewStyle,

  itemActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  } satisfies ViewStyle,

  itemActionText: {
    fontSize: 13,
    fontWeight: '500',
  } satisfies TextStyle,

  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  } satisfies ViewStyle,

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,

  tabActive: {
    borderWidth: 1.5,
  } satisfies ViewStyle,

  tabText: {
    fontSize: 14,
    fontWeight: '600',
  } satisfies TextStyle,

  textInput: {
    height: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  } satisfies TextStyle,

  drawCanvas: {
    height: 120,
    borderWidth: 1.5,
    borderRadius: 12,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies ViewStyle,

  drawPlaceholder: {
    fontSize: 14,
    fontWeight: '500',
  } satisfies TextStyle,

  errorBanner: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  } satisfies ViewStyle,

  errorText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  } satisfies TextStyle,

  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  } satisfies ViewStyle,

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  } satisfies ViewStyle,

  remaining: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  } satisfies TextStyle,

  submitBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  } satisfies ViewStyle,

  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
  } satisfies TextStyle,
});
