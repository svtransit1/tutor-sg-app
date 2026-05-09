import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { handleAuthCallback, getCurrentSession } from '../../src/services/auth';

export default function AuthCallbackRoute() {
  useEffect(() => { (async () => {
    try { const u = await Linking.getInitialURL(); if (u) await handleAuthCallback(u); router.replace('/(onboarding)/parent-sign-in'); }
    catch { router.replace('/(onboarding)/parent-sign-in'); }
  })(); }, []);
  return <View style={s.c}><ActivityIndicator size="large" color="#4A90D9" /><Text style={s.t}>Completing sign-in…</Text></View>;
}
const s = StyleSheet.create({ c: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', gap: 16 }, t: { fontSize: 16, color: '#666' } });
