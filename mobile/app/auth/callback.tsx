/**
 * Auth callback handler.
 *
 * This route handles the redirect from Supabase Auth after a magic link
 * or OAuth flow. It exchanges the PKCE code for a session and then
 * navigates back to the onboarding flow.
 *
 * Route: /auth/callback
 */
import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { handleAuthCallback, getCurrentSession } from '../../src/services/auth';

export default function AuthCallbackRoute() {
  const params = useLocalSearchParams();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // The URL is available from the deep link params or the initial URL
        const url = await Linking.getInitialURL();

        if (url) {
          await handleAuthCallback(url);
        } else {
          // If no URL available, try checking if we have a session already
          const session = await getCurrentSession();
          if (!session?.user) {
            console.warn('[auth/callback] No auth URL or session found');
          }
        }

        // Navigate back to the parent sign-in screen which will show the
        // signed-in state and let the user continue
        router.replace('/(onboarding)/parent-sign-in');
      } catch (err) {
        console.error('[auth/callback] Error processing auth callback:', err);
        router.replace('/(onboarding)/parent-sign-in');
      }
    };

    processCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4A90D9" />
      <Text style={styles.text}>Completing sign-in…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
