import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  signInWithMagicLink, signInWithGoogle, signInWithApple,
  getCurrentSession, AuthError,
} from '../../services/auth';

type ScreenState = 'idle' | 'loading_magic_link' | 'magic_link_sent' | 'loading_oauth' | 'signed_in' | 'error';

interface ParentSignInScreenProps {
  onSignedIn?: () => void;
  onSkip?: () => void;
}

export default function ParentSignInScreen({ onSignedIn, onSkip }: ParentSignInScreenProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendMagicLink = useCallback(async () => {
    setErrorMessage(null);
    const trimmed = email.trim();
    if (!trimmed) { setErrorMessage(t('parentAuth.signIn.errorInvalidEmail')); return; }
    setScreenState('loading_magic_link');
    try {
      await signInWithMagicLink(trimmed);
      setScreenState('magic_link_sent');
    } catch (err) {
      setErrorMessage(err instanceof AuthError ? t('parentAuth.signIn.errorSendFailed') : t('parentAuth.signIn.errorSendFailed'));
      setScreenState('idle');
    }
  }, [email, t]);

  const handleOAuth = useCallback(async (provider: 'google' | 'apple') => {
    setErrorMessage(null);
    setScreenState('loading_oauth');
    try {
      await (provider === 'google' ? signInWithGoogle() : signInWithApple());
      const session = await getCurrentSession();
      if (session?.user) { setScreenState('signed_in'); onSignedIn?.(); }
      else throw new AuthError('sign_in_failed', 'No session');
    } catch (err) {
      if (err instanceof AuthError && err.code === 'session_cancelled') { setScreenState('idle'); return; }
      setErrorMessage(t('parentAuth.signIn.errorSignInFailed'));
      setScreenState('idle');
    }
  }, [onSignedIn, t]);

  const isBusy = screenState === 'loading_magic_link' || screenState === 'loading_oauth';

  if (screenState === 'magic_link_sent') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.iconWrap}><Text style={styles.icon}>✉️</Text></View>
            <Text style={styles.title}>{t('parentAuth.signIn.magicLinkSent')}</Text>
            <Text style={styles.body}>{t('parentAuth.signIn.checkEmail')}</Text>
            <Text style={styles.emailDisplay}>{email}</Text>
            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              onPress={() => setScreenState('idle')} accessibilityRole="button"
              accessibilityLabel={t('parentAuth.signIn.sendMagicLink')}>
              <Text style={styles.primaryButtonText}>{t('parentAuth.signIn.sendMagicLink')}</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.skipLink, pressed && styles.skipLinkPressed]}
              onPress={onSkip} accessibilityRole="button" accessibilityLabel={t('parentAuth.signIn.skip')}>
              <Text style={styles.skipLinkText}>{t('parentAuth.signIn.skip')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (screenState === 'signed_in') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.iconWrap}><Text style={styles.icon}>✅</Text></View>
            <Text style={styles.title}>{t('parentAuth.signIn.signedIn')}</Text>
            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              onPress={onSignedIn} accessibilityRole="button">
              <Text style={styles.primaryButtonText}>{t('onboarding.done.cameraCta')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.iconWrap}><Text style={styles.icon}>👤</Text></View>
            <Text style={styles.title}>{t('parentAuth.signIn.title')}</Text>
            <Text style={styles.body}>{t('parentAuth.signIn.subtitle')}</Text>

            <View style={styles.emailSection}>
              <TextInput style={[styles.emailInput, errorMessage ? styles.inputError : null]}
                value={email} onChangeText={(t) => { setEmail(t); setErrorMessage(null); }}
                placeholder={t('parentAuth.signIn.emailPlaceholder')} placeholderTextColor="#9CA3AF"
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"
                editable={!isBusy} accessibilityLabel={t('parentAuth.signIn.emailPlaceholder')} />
              <Pressable style={({ pressed }) => [styles.primaryButton, (!email.trim() || isBusy) && styles.primaryButtonDisabled, pressed && !isBusy && styles.primaryButtonPressed]}
                onPress={handleSendMagicLink} disabled={!email.trim() || isBusy}
                accessibilityRole="button" accessibilityLabel={t('parentAuth.signIn.sendMagicLink')}>
                {screenState === 'loading_magic_link' ? <ActivityIndicator color="#FFFFFF" /> :
                  <Text style={styles.primaryButtonText}>{t('parentAuth.signIn.sendMagicLink')}</Text>}
              </Pressable>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('parentAuth.signIn.orDivider')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.oauthSection}>
              <Pressable style={({ pressed }) => [styles.oauthButton, pressed && styles.oauthButtonPressed]}
                onPress={() => handleOAuth('google')} disabled={isBusy}
                accessibilityRole="button" accessibilityLabel={t('parentAuth.signIn.continueWithGoogle')}>
                {screenState === 'loading_oauth' ? <ActivityIndicator color="#374151" /> : <Text style={styles.oauthButtonIcon}>G</Text>}
                <Text style={styles.oauthButtonLabel}>{t('parentAuth.signIn.continueWithGoogle')}</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.oauthButton, styles.oauthButtonApple, pressed && styles.oauthButtonApplePressed]}
                onPress={() => handleOAuth('apple')} disabled={isBusy}
                accessibilityRole="button" accessibilityLabel={t('parentAuth.signIn.continueWithApple')}>
                {screenState === 'loading_oauth' ? <ActivityIndicator color="#FFFFFF" /> : <Text style={[styles.oauthButtonIcon, styles.oauthButtonIconApple]}></Text>}
                <Text style={[styles.oauthButtonLabel, styles.oauthButtonLabelApple]}>{t('parentAuth.signIn.continueWithApple')}</Text>
              </Pressable>
            </View>

            {errorMessage && (
              <View style={styles.errorContainer} accessibilityRole="alert" accessibilityLiveRegion="assertive">
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <Pressable style={({ pressed }) => [styles.skipLink, pressed && styles.skipLinkPressed]}
              onPress={onSkip} accessibilityRole="button" accessibilityLabel={t('parentAuth.signIn.skip')}>
              <Text style={styles.skipLinkText}>{t('parentAuth.signIn.skip')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  content: { paddingHorizontal: 24, paddingVertical: 40, alignItems: 'center' },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F4FF', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  icon: { fontSize: 36 },
  title: { fontSize: 26, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 24, color: '#6B7280', textAlign: 'center', marginBottom: 32, paddingHorizontal: 8 },
  emailSection: { width: '100%', marginBottom: 24 },
  emailInput: { width: '100%', height: 52, borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, color: '#1A1A1A', backgroundColor: '#F9FAFB', marginBottom: 12 },
  inputError: { borderColor: '#EF4444' },
  primaryButton: { width: '100%', height: 52, backgroundColor: '#2563EB', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryButtonPressed: { backgroundColor: '#1D4ED8' },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 16, fontSize: 14, color: '#9CA3AF' },
  oauthSection: { width: '100%', gap: 12, marginBottom: 24 },
  oauthButton: { width: '100%', height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 12, backgroundColor: '#FFFFFF', gap: 10 },
  oauthButtonPressed: { backgroundColor: '#F9FAFB' },
  oauthButtonApple: { backgroundColor: '#000000', borderColor: '#000000' },
  oauthButtonApplePressed: { backgroundColor: '#1F2937' },
  oauthButtonIcon: { fontSize: 20, fontWeight: '700', color: '#374151', width: 24, textAlign: 'center' },
  oauthButtonIconApple: { color: '#FFFFFF' },
  oauthButtonLabel: { fontSize: 16, fontWeight: '500', color: '#374151' },
  oauthButtonLabelApple: { color: '#FFFFFF' },
  errorContainer: { width: '100%', backgroundColor: '#FEF2F2', borderRadius: 8, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 14, color: '#DC2626', textAlign: 'center' },
  emailDisplay: { fontSize: 16, fontWeight: '600', color: '#2563EB', marginBottom: 24 },
  skipLink: { paddingVertical: 10, paddingHorizontal: 20 },
  skipLinkPressed: { opacity: 0.6 },
  skipLinkText: { fontSize: 15, color: '#9CA3AF', textDecorationLine: 'underline' },
});
