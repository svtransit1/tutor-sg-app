import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  lightColors as lightC,
  darkColors as darkC,
  scaledFontSize,
  scaledTouchTarget,
} from '@tutor-sg/theme';
import {
  classifyError,
  ERROR_TYPE_TO_I18N_SECTION,
  type HomeworkError,
  type HomeworkErrorType,
} from '@/errors/homework-errors';

interface ErrorScreenProps {
  error: HomeworkError;
  onReset: () => void;
}

const ERROR_ICONS: Record<HomeworkErrorType, string> = {
  llm_timeout: '\u23F3',
  camera_permission_denied: '\uD83D\uDCF7',
  ocr_failure: '\uD83D\uDD0D',
  model_not_downloaded: '\uD83D\uDCE6',
  unknown: '\uD83D\uDE05',
};

function HomeworkErrorScreen({ error, onReset }: ErrorScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const errorKey = ERROR_TYPE_TO_I18N_SECTION[error.type];
  const icon = ERROR_ICONS[error.type];
  const C = isDark ? darkC : lightC;

  const handleGoBack = () => {
    router.replace('/(kid)/home');
  };

  const handleManualInput = () => {
    router.push({
      pathname: '/(kid)/manual-input',
      params: { items: '[]', capturedPageUris: '' },
    });
  };

  const handleParentArea = () => {
    router.replace('/(parent)/dashboard');
  };

  const touchTarget = scaledTouchTarget();
  const bodySize = scaledFontSize('body');

  const primaryAction = (() => {
    switch (error.type) {
      case 'llm_timeout':
        return (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: C.primary, minHeight: touchTarget }]}
            onPress={onReset}
            accessibilityRole="button"
            accessibilityLabel={t(`homeworkError.${errorKey}.retry`)}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { fontSize: bodySize }]}>
              {t(`homeworkError.${errorKey}.retry`)}
            </Text>
          </TouchableOpacity>
        );
      case 'camera_permission_denied':
        return (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: C.primary, minHeight: touchTarget }]}
            onPress={handleManualInput}
            accessibilityRole="button"
            accessibilityLabel={t(`homeworkError.${errorKey}.typeItOut`)}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { fontSize: bodySize }]}>
              {t(`homeworkError.${errorKey}.typeItOut`)}
            </Text>
          </TouchableOpacity>
        );
      case 'ocr_failure':
        return (
          <>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: C.primary, minHeight: touchTarget }]}
              onPress={onReset}
              accessibilityRole="button"
              accessibilityLabel={t(`homeworkError.${errorKey}.retake`)}
              activeOpacity={0.8}
            >
              <Text style={[styles.primaryButtonText, { fontSize: bodySize }]}>
                {t(`homeworkError.${errorKey}.retake`)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: C.primary, minHeight: touchTarget }]}
              onPress={handleManualInput}
              accessibilityRole="button"
              accessibilityLabel={t(`homeworkError.${errorKey}.manualInput`)}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryButtonText, { color: C.primary, fontSize: bodySize }]}>
                {t(`homeworkError.${errorKey}.manualInput`)}
              </Text>
            </TouchableOpacity>
          </>
        );
      case 'model_not_downloaded':
        return (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: C.primary, minHeight: touchTarget }]}
            onPress={handleParentArea}
            accessibilityRole="button"
            accessibilityLabel={t(`homeworkError.${errorKey}.parentArea`)}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { fontSize: bodySize }]}>
              {t(`homeworkError.${errorKey}.parentArea`)}
            </Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: C.primary, minHeight: touchTarget }]}
            onPress={onReset}
            accessibilityRole="button"
            accessibilityLabel={t(`homeworkError.${errorKey}.retry`)}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { fontSize: bodySize }]}>
              {t(`homeworkError.${errorKey}.retry`)}
            </Text>
          </TouchableOpacity>
        );
    }
  })();

  return (
    <View
      style={[
        styles.container,
        styles.centerContent,
        {
          backgroundColor: C.bgPrimary,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.errorCard}>
        <Text style={styles.errorEmoji}>{icon}</Text>

        <Text
          style={[styles.errorTitle, { color: C.textPrimary }]}
          accessibilityRole="header"
        >
          {t(`homeworkError.${errorKey}.title`)}
        </Text>

        <Text style={[styles.errorDesc, { color: C.textSecondary, fontSize: bodySize }]}>
          {t(`homeworkError.${errorKey}.description`)}
        </Text>

        <View style={styles.actions}>
          {primaryAction}

          <TouchableOpacity
            style={[styles.textLink, { minHeight: touchTarget }]}
            onPress={handleGoBack}
            accessibilityRole="button"
            accessibilityLabel={t('homeworkError.unknown.goBack')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.textLinkLabel, { color: C.textTertiary, fontSize: bodySize }]}>
              {t('homeworkError.unknown.goBack')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: HomeworkError | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class HomeworkErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(err: Error): ErrorBoundaryState {
    return { hasError: true, error: classifyError(err) };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    if (__DEV__) {
      console.error('[HomeworkErrorBoundary]', err, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <HomeworkErrorScreen
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorCard: {
    alignItems: 'center',
    gap: 12,
    maxWidth: 340,
  },
  errorEmoji: { fontSize: 56, marginBottom: 4 },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  errorDesc: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  textLink: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textLinkLabel: {
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
