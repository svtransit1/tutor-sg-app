/**
 * Manual Input Fallback Screen — full-screen fallback when OCR can't
 * read one or more items from the homework photo.
 *
 * Supports two input modes:
 * 1. **Type** — traditional TextInput for each unclear item
 * 2. **Draw** — a drawing canvas for handwritten answers (finger or stylus)
 *
 * Navigation flow:
 *   camera.tsx → manual-input.tsx (when ocrResult.needsManualInput)
 *   manual-input.tsx → camera.tsx (via router.push after submit)
 *   The parent camera screen resumes inference with the filled-in values
 *
 * @see ADD §4.1 — OCR fallback
 * @see decisions-locked — "Cannot recognise item N. Please type the answer."
 */

import { useState, useCallback, useEffect } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DrawingCanvas, { type Stroke } from '@/components/DrawingCanvas'
import { saveDraft, loadDraft, clearDraft, type DraftData } from '@/storage/manual-input-draft'

// ── Types ──────────────────────────────────────────────────────────

export type InputMode = 'type' | 'draw'

export type SubjectKey = 'math' | 'english' | 'science' | 'chinese'

export interface ManualInputItem {
  /** 1-based index shown to the user */
  index: number
  /** The text that OCR tried to read (may be garbled) */
  originalText: string
  /** Confidence score 0–1 */
  confidence: number
}

interface ManualInputAnswer {
  /** Matches ManualInputItem.index */
  index: number
  mode: InputMode
  textValue: string
  strokes: Stroke[]
}

const SUBJECTS: { key: SubjectKey; icon: string }[] = [
  { key: 'math', icon: '🧮' },
  { key: 'english', icon: '📖' },
  { key: 'science', icon: '🔬' },
  { key: 'chinese', icon: '🀄' },
]

// ── Props from navigation params ──────────────────────────────────

interface ManualInputParams {
  /** JSON-stringified array of ManualInputItem[] */
  items: string
  /** The session/capture data needed to resume inference after submit */
  capturedPageUris: string
}

// ── Segmented Control ─────────────────────────────────────────────

function ModeSegmentedControl({
  mode,
  onModeChange,
  labelType,
  labelDraw,
}: {
  mode: InputMode
  onModeChange: (m: InputMode) => void
  labelType: string
  labelDraw: string
}) {
  const isDark = useColorScheme() === 'dark'

  return (
    <View
      style={[styles.segmentedControl, { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' }]}
      accessibilityRole="tablist"
    >
      <TouchableOpacity
        style={[
          styles.segment,
          mode === 'type' && {
            backgroundColor: isDark ? '#2563EB' : '#4A90D9',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
          },
        ]}
        onPress={() => onModeChange('type')}
        accessibilityRole="tab"
        accessibilityLabel={labelType}
        accessibilityState={{ selected: mode === 'type' }}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.segmentText,
            {
              color: mode === 'type' ? '#FFFFFF' : isDark ? '#AAAAAA' : '#6B7280',
            },
          ]}
        >
          {labelType}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.segment,
          mode === 'draw' && {
            backgroundColor: isDark ? '#2563EB' : '#4A90D9',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
          },
        ]}
        onPress={() => onModeChange('draw')}
        accessibilityRole="tab"
        accessibilityLabel={labelDraw}
        accessibilityState={{ selected: mode === 'draw' }}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.segmentText,
            {
              color: mode === 'draw' ? '#FFFFFF' : isDark ? '#AAAAAA' : '#6B7280',
            },
          ]}
        >
          {labelDraw}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

// ── Screen ─────────────────────────────────────────────────────────

export default function ManualInputFallbackScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const params = useLocalSearchParams<ManualInputParams>()

  // ── Parse navigation params synchronously ──────────────────

  const [items, setItems] = useState<ManualInputItem[]>(() => {
    try {
      return JSON.parse(params.items ?? '[]') as ManualInputItem[]
    } catch {
      return []
    }
  })
  const [answers, setAnswers] = useState<ManualInputAnswer[]>(() => {
    try {
      const parsed = JSON.parse(params.items ?? '[]') as ManualInputItem[]
      return parsed.map((item) => ({
        index: item.index,
        mode: 'type' as const,
        textValue: '',
        strokes: [],
      }))
    } catch {
      return []
    }
  })
  const [inputMode, setInputMode] = useState<InputMode>('type')
  const [parseError, setParseError] = useState(() => {
    try {
      JSON.parse(params.items ?? '[]')
      return false
    } catch {
      return true
    }
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<SubjectKey | null>(null)
  const [draftRestored, setDraftRestored] = useState(false)

  // ── Restore draft asynchronously on mount ──────────────────
  useEffect(() => {
    const capturedUris = params.capturedPageUris
    if (!capturedUris || parseError || items.length === 0) return
    ;(async () => {
      try {
        const draft = await loadDraft(capturedUris)
        if (!draft) {
          setDraftRestored(true)
          return
        }

        setAnswers(
          items.map((item) => {
            const saved = draft.answers.find((a) => a.index === item.index)
            return {
              index: item.index,
              mode: draft.inputMode,
              textValue: saved?.textValue ?? '',
              strokes: saved?.strokesJSON ? (JSON.parse(saved.strokesJSON) as Stroke[]) : [],
            }
          }),
        )
        setInputMode(draft.inputMode)
        if (draft.subject) {
          setSelectedSubject(draft.subject as SubjectKey)
        }
        setDraftRestored(true)
      } catch {
        setDraftRestored(true)
      }
    })()
  }, []) // run once on mount

  // ── Auto-save draft when answers change ─────────────────────
  useEffect(() => {
    if (!draftRestored || !params.capturedPageUris) return

    const timer = setTimeout(() => {
      const data: DraftData = {
        answers: answers.map((a) => ({
          index: a.index,
          textValue: a.textValue,
          strokesJSON: JSON.stringify(a.strokes),
        })),
        subject: selectedSubject ?? '',
        inputMode,
        updatedAt: new Date().toISOString(),
      }
      saveDraft(params.capturedPageUris, data)
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [answers, selectedSubject, inputMode, draftRestored, params.capturedPageUris])

  // ── Update answer for a specific item ──────────────────────────

  const updateTextAnswer = useCallback((itemIndex: number, text: string) => {
    setAnswers((prev) =>
      prev.map((a) => (a.index === itemIndex ? { ...a, textValue: text, mode: 'type' } : a)),
    )
  }, [])

  const updateDrawAnswer = useCallback((itemIndex: number, strokes: Stroke[]) => {
    setAnswers((prev) =>
      prev.map((a) => (a.index === itemIndex ? { ...a, strokes, mode: 'draw' } : a)),
    )
  }, [])

  // ── Submit ─────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    // Validate: at least one item must have input
    const hasInput = answers.some((a) => a.textValue.trim().length > 0 || a.strokes.length > 0)
    if (!hasInput) {
      setValidationError(t('manualInputFallback.error.noInputs'))
      return
    }

    // Clear draft on successful submit
    if (params.capturedPageUris) {
      await clearDraft(params.capturedPageUris)
    }

    // Build the result to pass back
    const result = answers.map((a) => ({
      index: a.index,
      textValue: a.textValue,
      hasDrawing: a.strokes.length > 0,
      // Pass strokes as JSON for the parent to interpret
      strokesJSON: JSON.stringify(a.strokes),
    }))

    // Navigate back to camera screen with results
    router.push({
      pathname: '/(kid)/camera',
      params: {
        manualInputResult: JSON.stringify(result),
        capturedPageUris: params.capturedPageUris ?? '',
        manualInputSubject: selectedSubject ?? '',
      },
    })
  }, [answers, selectedSubject, params.capturedPageUris, router, t])

  // ── Skip item ──────────────────────────────────────────────────

  const handleSkipItem = useCallback(
    (itemIndex: number) => {
      updateTextAnswer(itemIndex, '(skipped)')
      setValidationError(null)
    },
    [updateTextAnswer],
  )

  // ── Navigate back ─────────────────────────────────────────────

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  // ── Parse error state ─────────────────────────────────────────

  if (parseError) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: isDark ? '#121212' : '#F8F9FA' },
        ]}
      >
        <Text style={styles.errorEmoji}>😅</Text>
        <Text style={[styles.errorTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
          {t('cameraScreen.error.title')}
        </Text>
        <Text style={[styles.errorDesc, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
          {t('cameraScreen.error.processingFailed')}
        </Text>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: isDark ? '#2563EB' : '#4A90D9' }]}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t('common.goBack')}
        >
          <Text style={styles.primaryButtonText}>{t('common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ── Empty state ───────────────────────────────────────────────

  if (items.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: isDark ? '#121212' : '#F8F9FA' },
        ]}
      >
        <ActivityIndicator size="large" color={isDark ? '#90CAF9' : '#4A90D9'} />
      </View>
    )
  }

  // ── Main render ──────────────────────────────────────────────

  const answeredCount = answers.filter(
    (a) => a.textValue.trim().length > 0 || a.strokes.length > 0,
  ).length
  const remaining = items.length - answeredCount

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel={t('common.goBack')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.backButton, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
              ← {t('common.back')}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
            {t('manualInputFallback.title')}
          </Text>

          {/* Spacer for symmetry */}
          <View style={{ width: 50 }} />
        </View>

        {/* Description */}
        <Text style={[styles.headerDesc, { color: isDark ? '#AAAAAA' : '#6B7280' }]}>
          {t('manualInputFallback.description')}
        </Text>

        {/* Progress indicator */}
        <Text style={[styles.progressText, { color: isDark ? '#888888' : '#9CA3AF' }]}>
          {remaining > 0
            ? t('manualInputFallback.remaining', { count: remaining })
            : t('manualInputFallback.remaining', { count: 0 })}
        </Text>

        {/* Subject picker */}
        <Text style={[styles.subjectPrompt, { color: isDark ? '#BBBBBB' : '#6B7280' }]}>
          {t('manualInputFallback.subjectPrompt')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectRow}
        >
          {SUBJECTS.map((subject) => {
            const isSelected = selectedSubject === subject.key
            return (
              <TouchableOpacity
                key={subject.key}
                style={[
                  styles.subjectChip,
                  {
                    backgroundColor: isDark
                      ? isSelected
                        ? '#2563EB'
                        : '#2A2A2A'
                      : isSelected
                        ? '#4A90D9'
                        : '#F3F4F6',
                    borderColor: isDark ? '#444' : '#D1D5DB',
                  },
                ]}
                onPress={() => setSelectedSubject(isSelected ? null : subject.key)}
                accessibilityRole="button"
                accessibilityLabel={`${subject.key} subject`}
                accessibilityState={{ selected: isSelected }}
                activeOpacity={0.7}
              >
                <Text style={styles.subjectChipIcon}>{subject.icon}</Text>
                <Text
                  style={[
                    styles.subjectChipLabel,
                    {
                      color: isSelected ? '#FFFFFF' : isDark ? '#CCCCCC' : '#4A5568',
                    },
                  ]}
                >
                  {t(`kidHome.subjects.${subject.key}`)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Mode switcher */}
        <ModeSegmentedControl
          mode={inputMode}
          onModeChange={setInputMode}
          labelType={t('manualInputFallback.typeTab')}
          labelDraw={t('manualInputFallback.drawTab')}
        />
      </View>

      {/* Item list */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {items.map((item) => {
          const answer = answers.find((a) => a.index === item.index)
          const isAnswered =
            (answer?.textValue.trim().length ?? 0) > 0 || (answer?.strokes.length ?? 0) > 0

          return (
            <View
              key={item.index}
              style={[
                styles.itemCard,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: isDark
                    ? isAnswered
                      ? '#2E7D32'
                      : '#333'
                    : isAnswered
                      ? '#C8E6C9'
                      : '#E5E7EB',
                },
              ]}
              accessibilityLabel={t('manualInputFallback.itemLabel', {
                number: item.index,
              })}
            >
              {/* Item header */}
              <View style={styles.itemHeader}>
                <View style={styles.itemHeaderLeft}>
                  <View
                    style={[styles.itemBadge, { backgroundColor: isDark ? '#2A4A7A' : '#E8F4FD' }]}
                  >
                    <Text style={[styles.itemBadgeText, { color: isDark ? '#90CAF9' : '#2563EB' }]}>
                      {t('manualInputFallback.itemLabel', {
                        number: item.index,
                      })}
                    </Text>
                  </View>
                  {isAnswered && <Text style={styles.checkmark}>✓</Text>}
                </View>

                {/* Skip button */}
                <TouchableOpacity
                  onPress={() => handleSkipItem(item.index)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={t('manualInputFallback.accessibility.skip')}
                >
                  <Text style={[styles.skipLink, { color: isDark ? '#90CAF9' : '#9CA3AF' }]}>
                    {t('manualInputFallback.skip')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* OCR'd text */}
              <Text
                style={[styles.originalText, { color: isDark ? '#BBBBBB' : '#6B7280' }]}
                numberOfLines={2}
              >
                {t('manualInputFallback.itemLabel', {
                  number: item.index,
                })}
                : “{item.originalText}”
              </Text>

              {/* Input area — type or draw based on mode */}
              {inputMode === 'type' ? (
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6',
                      color: isDark ? '#FFFFFF' : '#1A1A1A',
                      borderColor: isDark ? '#444' : '#D1D5DB',
                    },
                  ]}
                  placeholder={t('manualInputFallback.typePlaceholder')}
                  placeholderTextColor={isDark ? '#666' : '#9CA3AF'}
                  value={answer?.textValue ?? ''}
                  onChangeText={(text) => updateTextAnswer(item.index, text)}
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel={t('manualInputFallback.accessibility.typeInput', {
                    number: item.index,
                  })}
                />
              ) : (
                <DrawingCanvas
                  strokes={answer?.strokes ?? []}
                  onStrokesChange={(strokes) => updateDrawAnswer(item.index, strokes)}
                  placeholder={t('manualInputFallback.drawPlaceholder')}
                  accessibilityLabel={t('manualInputFallback.accessibility.drawCanvas', {
                    number: item.index,
                  })}
                  strokeColor={isDark ? '#FFFFFF' : '#1A1A1A'}
                  strokeWidth={3}
                />
              )}
            </View>
          )
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Validation error */}
      {validationError && (
        <View style={[styles.validationBar, { backgroundColor: isDark ? '#4A1A1A' : '#FEE2E2' }]}>
          <Text style={[styles.validationText, { color: isDark ? '#FF8A8A' : '#DC2626' }]}>
            {validationError}
          </Text>
        </View>
      )}

      {/* Bottom submit bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + 12,
            backgroundColor: isDark ? '#121212' : '#F8F9FA',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: isDark ? '#2563EB' : '#4A90D9',
              opacity: remaining === 0 ? 0.8 : 1,
            },
          ]}
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel={t('manualInputFallback.accessibility.submit')}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {t('manualInputFallback.submit')}
            {remaining > 0 && ` (${remaining})`}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },

  // ── Error ──
  errorEmoji: { fontSize: 48 },
  errorTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  errorDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22 },

  // ── Header ──
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerDesc: { fontSize: 13, lineHeight: 18 },
  progressText: { fontSize: 12, fontWeight: '500' },

  // ── Subject Picker ──
  subjectPrompt: { fontSize: 13, fontWeight: '500', marginBottom: -4 },
  subjectRow: { gap: 8, paddingVertical: 4 },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  subjectChipIcon: { fontSize: 16 },
  subjectChipLabel: { fontSize: 14, fontWeight: '600' },

  // ── Segmented Control ──
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentText: { fontSize: 14, fontWeight: '600' },

  // ── Scroll Area ──
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },

  // ── Item Card ──
  itemCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  itemBadgeText: { fontSize: 13, fontWeight: '600' },
  checkmark: { fontSize: 16, color: '#2E7D32', fontWeight: '700' },
  skipLink: { fontSize: 13, fontWeight: '500' },
  originalText: { fontSize: 13, fontStyle: 'italic', paddingRight: 16 },

  // ── Type Input ──
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 80,
    lineHeight: 22,
  },

  // ── Validation ──
  validationBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  validationText: { fontSize: 13, fontWeight: '500', textAlign: 'center' },

  // ── Bottom Bar ──
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  // ── Primary Button (reused in error state) ──
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
})
