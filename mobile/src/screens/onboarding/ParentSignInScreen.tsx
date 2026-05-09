import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  type TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';
import OnboardingProgressIndicator from '../../components/OnboardingProgressIndicator';
import {
  signInWithMagicLink,
  signInWithGoogle,
  signInWithApple,
  handleAuthCallback,
  getCurrentSession,
  AuthError,
} from '../../services/auth';

interface ParentSignInScreenProps {
  onSignedIn?: () => void;
  onSkip?: () => void;
}

type ScreenState =
  | 'idle'
  | 'loading_magic_link'
  | 'magic_link_sent'
  | 'loading_oauth'
  | 'signed_in'
  | 'error';

export default function ParentSignInScreen({
  onSignedIn,
  onSkip,
}: ParentSignInScreenProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const [email, setEmail] = useState('');
  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const colors = {
    bg: isDark ? '#121212' : '#FFFFFF',
    surface: isDark ? '#1E1E1E' : '#F9FAFB',
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? '#B0B0B0' : '#666666',
    textMuted: isDark ? '#888888' : '#9CA3AF',
    border: isDark ? '#333333' : '#D1D5DB',
    divider: isDark ? '#333333' : '#E5E7EB',
    inputBg: isDark ? '#2A2A2A' : '#F9FAFB',
    errorBg: isDark ? '#3D1A1A' : '#FEF2F2',
    errorText: '#EF4444',
    primary: '#4A90D9',
    primaryDark: isDark ? '#5BA3E6' : '#2563EB',
  };

  const handleSendMagicLink = useCallback(async () => {
    setErrorMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage(t('parentAuth.signIn.errorInvalidEmail'));
      return;
    }

    setScreenState('loading_magic_link');

    try {
      await signInWithMagicLink(trimmed);
      setScreenState('magic_link_sent');
    } catch (err) {
      if (err instanceof AuthError) {
        setErrorMessage(
          err.code === 'invalid_email'
            ? t('parentAuth.signIn.errorInvalidEmail')
            : t('parentAuth.signIn.errorSendFailed'),
        );
      } else {
        setErrorMessage(t('parentAuth.signIn.errorSendFailed'));
      }
      setScreenState('idle');
    }
  }, [email, t]);

  const handleGoogleSignIn = useCallback(async () => {
    setErrorMessage(null);
    setScreenState('loading_oauth');

    try {
      await signInWithGoogle();
      const session = await getCurrentSession();
      if (session?.user) {
        setScreenState('signed_in');
        onSignedIn?.();
      } else {
        const url = await Linking.getInitialURL();
        if (url && url.includes('auth/callback')) {
          await handleAuthCallback(url);
          setScreenState('signed_in');
          onSignedIn?.();
        } else {
          throw new AuthError('sign_in_failed', 'No session after OAuth');
        }
      }
    } catch (err) {
      if (err instanceof AuthError && err.code === 'session_cancelled') {
        setScreenState('idle');
        return;
      }
      setErrorMessage(t('parentAuth.signIn.errorSignInFailed'));
      setScreenState('idle');
    }
  }, [onSignedIn, t]);

  const handleAppleSignIn = useCallback(async () => {
    setErrorMessage(null);
    setScreenState('loading_oauth');

    try {
      await signInWithApple();
      const session = await getCurrentSession();
      if (session?.user) {
        setScreenState('signed_in');
        onSignedIn?.();
      } else {
        const url = await Linking.getInitialURL();
        if (url && url.includes('auth/callback')) {
          await handleAuthCallback(url);
          setScreenState('signed_in');
          onSignedIn?.();
        } else {
          throw new AuthError('sign_in_failed', 'No session after OAuth');
        }
      }
    } catch (err) {
      if (err instanceof AuthError && err.code === 'session_cancelled') {
        setScreenState('idle');
        return;
      }
      setErrorMessage(t('parentAuth.signIn.errorSignInFailed'));
      setScreenState('idle');
    }
  }, [onSignedIn, t]);

  React.useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      if (event.url.includes('auth/callback')) {
        try {
          await handleAuthCallback(event.url);
          const session = await getCurrentSession();
          if (session?.user) {
            setScreenState('signed_in');
            onSignedIn?.();
          }
        } catch {
          setErrorMessage(t('parentAuth.signIn.errorSignInFailed'));
          setScreenState('idle');
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url && url.includes('auth/callback')) {
        handleDeepLink({ url });
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [onSignedIn, t]);

  if (screenState === 'magic_link_sent') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <OnboardingProgressIndicator currentStep={5} totalSteps={7} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1E3A5F' : '#E8F4FD' }]}>
              <Text style={styles.iconText}>✉️</Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {t('parentAuth.signIn.magicLinkSent')}
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('parentAuth.signIn.checkEmail')}
            </Text>

            <Text style={[styles.emailDisplay, { color: colors.primary }]}>{email}</Text>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
              onPress={() => { setScreenState('idle'); setEmail(''); }}
              accessibilityRole="button"
              accessibilityLabel={t('parentAuth.signIn.sendMagicLink')}
            >
              <Text style={styles.primaryButtonText}>
                {t('parentAuth.signIn.sendMagicLink')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              accessibilityRole="button"
              accessibilityLabel={t('parentAuth.signIn.skip')}
            >
              <Text style={[styles.skipButtonText, { color: colors.textMuted }]}>
                {t('parentAuth.signIn.skip')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screenState === 'signed_in') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <OnboardingProgressIndicator currentStep={5} totalSteps={7} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1A3D1A' : '#F0FDF4' }]}>
              <Text style={styles.iconText}>✅</Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {t('parentAuth.signIn.signedIn')}
            </Text>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}
              onPress={onSignedIn}
              accessibilityRole="button"
              accessibilityLabel="Continue"
            >
              <Text style={styles.primaryButtonText}>
                {t('common.continue', 'Continue')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <OnboardingProgressIndicator currentStep={5} totalSteps={7} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1E3A5F' : '#E8F4FD' }]}>
              <Text style={styles.iconText}>🔐</Text>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {t('parentAuth.signIn.title')}
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('parentAuth.signIn.subtitle')}
            </Text>

            <View style={styles.emailSection}>
              <TextInput
                style={[
                  styles.emailInput,
                  {
                    color: colors.text,
                    borderColor: errorMessage ? colors.errorText : colors.border,
                    backgroundColor: colors.inputBg,
                  },
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMessage(null);
                }}
                placeholder={t('parentAuth.signIn.emailPlaceholder')}
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={screenState !== 'loading_magic_link' && screenState !== 'loading_oauth'}
                accessibilityLabel={t('parentAuth.signIn.emailPlaceholder')}
                accessibilityRole="none"
              />

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primaryDark },
                  (!email.trim() || screenState === 'loading_magic_link') &&
                    styles.primaryButtonDisabled,
                ]}
                onPress={handleSendMagicLink}
                disabled={!email.trim() || screenState === 'loading_magic_link'}
                accessibilityRole="button"
                accessibilityLabel={t('parentAuth.signIn.sendMagicLink')}
              >
                {screenState === 'loading_magic_link' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {t('parentAuth.signIn.sendMagicLink')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>
                {t('parentAuth.signIn.orDivider')}
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
            </View>

            <View style={styles.oauthSection}>
              <TouchableOpacity
                style={[styles.oauthButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={handleGoogleSignIn}
                disabled={screenState === 'loading_oauth'}
                accessibilityRole="button"
                accessibilityLabel={t('parentAuth.signIn.continueWithGoogle')}
              >
                {screenState === 'loading_oauth' ? (
                  <ActivityIndicator color={colors.textMuted} />
                ) : (
                  <View style={styles.oauthIconContainer}>
                    <Text style={styles.oauthIcon}>G</Text>
                  </View>
                )}
                <Text style={[styles.oauthButtonLabel, { color: colors.text }]}>
                  {t('parentAuth.signIn.continueWithGoogle')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.oauthButton, styles.oauthButtonApple]}
                onPress={handleAppleSignIn}
                disabled={screenState === 'loading_oauth'}
                accessibilityRole="button"
                accessibilityLabel={t('parentAuth.signIn.continueWithApple')}
              >
                {screenState === 'loading_oauth' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.oauthIconContainer}>
                    <Text style={[styles.oauthIcon, styles.oauthIconApple]}></Text>
                  </View>
                )}
                <Text style={[styles.oauthButtonLabel, styles.oauthButtonLabelApple]}>
                  {t('parentAuth.signIn.continueWithApple')}
                </Text>
              </TouchableOpacity>
            </View>

            {errorMessage && (
              <View style={[styles.errorContainer, { backgroundColor: colors.errorBg }]}>
                <Text style={[styles.errorText, { color: colors.errorText }]}>
                  {errorMessage}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              accessibilityRole="button"
              accessibilityLabel={t('parentAuth.signIn.skip')}
            >
              <Text style={[styles.skipButtonText, { color: colors.textMuted }]}>
                {t('parentAuth.signIn.skip')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  } as TextStyle,
  emailSection: {
    width: '100%',
    marginBottom: 24,
  },
  emailInput: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  } as TextStyle,
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  oauthSection: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  oauthButton: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    gap: 10,
  },
  oauthButtonApple: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  oauthIconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oauthIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  oauthIconApple: {
    color: '#FFFFFF',
  },
  oauthButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  oauthButtonLabelApple: {
    color: '#FFFFFF',
  },
  errorContainer: {
    width: '100%',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emailDisplay: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
