/**
 * ParentSignInScreen — Onboarding step 5/7.
 *
 * Provides three sign-in methods:
 * 1. Email magic link
 * 2. Google OAuth
 * 3. Apple OAuth
 *
 * Also offers a "Skip for now" option that defers sign-in.
 * After successful sign-in, navigates to the next onboarding step.
 *
 * Per ADD §6.5: parent auth only — kid profile is local, no auth token.
 * Per onboarding dev spec (article 12): email/SSO sign-up is deferred
 * until after first homework session; this screen is the entry point
 * for when the parent chooses to sign up.
 */
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
  type TextStyle,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";;
import * as Linking from 'expo-linking';
import {
  signInWithMagicLink,
  signInWithGoogle,
  signInWithApple,
  handleAuthCallback,
  getCurrentSession,
  AuthError,
} from '../../services/auth';

// ── Types ──────────────────────────────────────────────────────────

interface ParentSignInScreenProps {
  /** Called after successful sign-in */
  onSignedIn?: () => void;
  /** Called when the user taps "Skip for now" */
  onSkip?: () => void;
}

// ── Screen states ──────────────────────────────────────────────────

type ScreenState =
  | 'idle'
  | 'loading_magic_link'
  | 'magic_link_sent'
  | 'loading_oauth'
  | 'signed_in'
  | 'error';

// ── Component ──────────────────────────────────────────────────────

export default function ParentSignInScreen({
  onSignedIn,
  onSkip,
}: ParentSignInScreenProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Magic link handler ───────────────────────────────────────

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

  // ── OAuth handlers ───────────────────────────────────────────

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
        // Fall back: check for auth callback via deep link
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
        // User cancelled — just go back to idle
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

  // ── Deep link handler setup ──────────────────────────────────

  // Handle magic link callback when app is opened via deep link
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

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url && url.includes('auth/callback')) {
        handleDeepLink({ url });
      }
    });

    // Subscribe to future deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [onSignedIn, t]);

  // ── Magic link sent state ────────────────────────────────────

  if (screenState === 'magic_link_sent') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Check email icon placeholder */}
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>✉️</Text>
            </View>

            <Text style={styles.title}>
              {t('parentAuth.signIn.magicLinkSent')}
            </Text>

            <Text style={styles.subtitle}>
              {t('parentAuth.signIn.checkEmail')}
            </Text>

            <Text style={styles.emailDisplay}>{email}</Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setScreenState('idle')}
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
              <Text style={styles.skipButtonText}>
                {t('parentAuth.signIn.skip')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Signed in state ──────────────────────────────────────────

  if (screenState === 'signed_in') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>✅</Text>
            </View>

            <Text style={styles.title}>
              {t('parentAuth.signIn.signedIn')}
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onSignedIn}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                {t('parentAuth.signIn.continue')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Main sign-in form ────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>
              {t('parentAuth.signIn.title')}
            </Text>

            <Text style={styles.subtitle}>
              {t('parentAuth.signIn.subtitle')}
            </Text>

            {/* Email input */}
            <View style={styles.emailSection}>
              <TextInput
                style={[
                  styles.emailInput,
                  screenState === 'error' && errorMessage ? styles.inputError : null,
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMessage(null);
                }}
                placeholder={t('parentAuth.signIn.emailPlaceholder')}
                placeholderTextColor="#999"
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

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>
                {t('parentAuth.signIn.orDivider')}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OAuth buttons */}
            <View style={styles.oauthSection}>
              <TouchableOpacity
                style={styles.oauthButton}
                onPress={handleGoogleSignIn}
                disabled={screenState === 'loading_oauth'}
                accessibilityRole="button"
                accessibilityLabel={t('parentAuth.signIn.continueWithGoogle')}
              >
                {screenState === 'loading_oauth' ? (
                  <ActivityIndicator color="#333" />
                ) : (
                  <View style={styles.brandIconWrap}>
                    <Ionicons name="logo-google" size={18} color="#4285F4" />
                  </View>
                )}
                <Text style={styles.oauthButtonLabel}>
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
                  <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                )}
                <Text style={[styles.oauthButtonLabel, styles.oauthButtonLabelApple]}>
                  {t('parentAuth.signIn.continueWithApple')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error message */}
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Skip link */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              accessibilityRole="button"
              accessibilityLabel={t('parentAuth.signIn.skip')}
            >
              <Text style={styles.skipButtonIcon}>→</Text>
              <Text style={styles.skipButtonText}>
                {t('parentAuth.signIn.skip')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F0F4FF',
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
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
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
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#4A90D9',
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
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
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
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  oauthButtonApple: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  brandIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  oauthButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  oauthButtonLabelApple: {
    color: '#FFFFFF',
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },
  emailDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90D9',
    marginBottom: 24,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  skipButtonIcon: {
    fontSize: 15,
    color: '#6B7280',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
});
