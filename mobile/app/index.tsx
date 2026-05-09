import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useAuth } from '../src/components/auth/AuthProvider';

export default function RootIndexScreen() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  useEffect(() => {
    if (isLoading) return;
    const t = setTimeout(() => router.replace(isAuthenticated ? '/(kid)/home' : '/(onboarding)/parent-sign-in'), 100);
    return () => clearTimeout(t);
  }, [isLoading, isAuthenticated]);
  return (<View style={s.c}><ActivityIndicator size="large" color="#2563EB"/><Text style={s.t}>{t('app.loading')}</Text></View>);
}
const s = StyleSheet.create({c:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#FFFFFF'},t:{marginTop:16,fontSize:16,color:'#6B7280'}});
