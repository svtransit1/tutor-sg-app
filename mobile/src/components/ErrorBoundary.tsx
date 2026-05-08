import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  getHomeworkErrorCode,
  type HomeworkErrorCode,
} from '@/errors/homework-errors'

export interface ErrorBoundaryProps {
  children: React.ReactNode
  onRetry?: () => void
  onManualInput?: () => void
  onError?: (error: Error) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

const ERROR_ICONS: Record<HomeworkErrorCode, string> = {
  LLM_TIMEOUT: '⏳',
  CAMERA_PERMISSION_DENIED: '📷',
  OCR_FAILURE: '📝',
  MODEL_NOT_DOWNLOADED: '⬇️',
}

const GENERIC_ICON = '😅'

function ErrorFallback({
  error,
  onRetry,
  onManualInput,
}: {
  error: Error
  onRetry?: () => void
  onManualInput?: () => void
}) {
  const { t } = useTranslation()
  const isDark = useColorScheme() === 'dark'

  const code: HomeworkErrorCode | null = getHomeworkErrorCode(error)

  const icon = code ? ERROR_ICONS[code] : GENERIC_ICON
  const title = code
    ? t(`homeworkError.${code}.title`)
    : t('homeworkError.UNKNOWN.title')
  const body = code
    ? t(`homeworkError.${code}.body`)
    : t('homeworkError.UNKNOWN.body')

  const retryLabel = t('homeworkError.retry')
  const manualInputLabel = t('homeworkError.manualInput')

  const showRetry =
    code === 'LLM_TIMEOUT' || code === 'MODEL_NOT_DOWNLOADED' || code === null
  const showManualInput =
    code === 'CAMERA_PERMISSION_DENIED' || code === 'OCR_FAILURE'

  const bgColor = isDark ? '#121212' : '#F8F9FA'
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A'
  const mutedColor = isDark ? '#A0A0A0' : '#6B7280'
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF'
  const borderColor = isDark ? '#333' : '#E5E7EB'
  const primaryColor = isDark ? '#2563EB' : '#4A90D9'

  return (
    <View
      style={[styles.root, { backgroundColor: bgColor }]}
      accessibilityRole="alert"
      accessibilityLabel={`${title}. ${body}`}
    >
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]} testID="error-boundary-card">
        <Text style={styles.icon} accessibilityLabel="">
          {icon}
        </Text>
        <Text
          style={[styles.title, { color: textColor }]}
          accessibilityRole="header"
        >
          {title}
        </Text>
        <Text style={[styles.body, { color: mutedColor }]}>{body}</Text>

        <View style={styles.actions}>
          {(showRetry) && (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: primaryColor }]}
              onPress={onRetry}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={retryLabel}
            >
              <Text style={styles.primaryButtonText}>{retryLabel}</Text>
            </TouchableOpacity>
          )}
          {showManualInput && onManualInput && (
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { borderColor: primaryColor },
              ]}
              onPress={onManualInput}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={manualInputLabel}
            >
              <Text style={[styles.secondaryButtonText, { color: primaryColor }]}>
                {manualInputLabel}
              </Text>
            </TouchableOpacity>
          )}
          {showManualInput && onRetry && (
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { borderColor: isDark ? '#444' : '#D1D5DB' },
              ]}
              onPress={onRetry}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={retryLabel}
            >
              <Text style={[styles.secondaryButtonText, { color: mutedColor }]}>
                {retryLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error): void {
    this.props.onError?.(error)
  }

  handleRetry = (): void => {
    this.setState({ error: null })
    this.props.onRetry?.()
  }

  handleManualInput = (): void => {
    this.setState({ error: null })
    this.props.onManualInput?.()
  }

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          onManualInput={
            this.props.onManualInput ? this.handleManualInput : undefined
          }
        />
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  } satisfies ViewStyle,

  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  } satisfies ViewStyle,

  icon: {
    fontSize: 48,
  } satisfies TextStyle,

  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  } satisfies TextStyle,

  body: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  } satisfies TextStyle,

  actions: {
    marginTop: 8,
    width: '100%',
    gap: 10,
    alignItems: 'center',
  } satisfies ViewStyle,

  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  } satisfies ViewStyle,

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  } satisfies TextStyle,

  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  } satisfies ViewStyle,

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  } satisfies TextStyle,
})
