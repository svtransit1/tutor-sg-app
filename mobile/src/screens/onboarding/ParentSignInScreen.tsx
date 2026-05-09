import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, type TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';
import { signInWithMagicLink, signInWithGoogle, signInWithApple, signUp, signIn, handleAuthCallback, getCurrentSession, AuthError } from '../../services/auth';

interface Props { onSignedIn?: () => void; onSkip?: () => void; }
type AuthMode = 'magic_link' | 'password_sign_in' | 'password_sign_up';
type ScreenState = 'idle' | 'loading_magic_link' | 'magic_link_sent' | 'loading_password' | 'loading_oauth' | 'signed_in' | 'error';

const TABS: { mode: AuthMode; label: string }[] = [
  { mode: 'magic_link', label: 'parentAuth.signIn.magicLinkTab' },
  { mode: 'password_sign_in', label: 'parentAuth.signIn.passwordTab' },
  { mode: 'password_sign_up', label: 'parentAuth.signIn.signUpTab' },
];

export default function ParentSignInScreen({ onSignedIn, onSkip }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('magic_link');
  const [screenState, setScreenState] = useState<ScreenState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMagicLink = useCallback(async () => {
    setErrorMessage(null); if (!email.trim()) { setErrorMessage(t('parentAuth.signIn.errorInvalidEmail')); return; }
    setScreenState('loading_magic_link');
    try { await signInWithMagicLink(email.trim()); setScreenState('magic_link_sent'); }
    catch (err) { setErrorMessage(err instanceof AuthError && err.code === 'invalid_email' ? t('parentAuth.signIn.errorInvalidEmail') : t('parentAuth.signIn.errorSendFailed')); setScreenState('idle'); }
  }, [email, t]);

  const handlePassword = useCallback(async () => {
    setErrorMessage(null); if (!email.trim()) { setErrorMessage(t('parentAuth.signIn.errorInvalidEmail')); return; }
    if (!password || password.length < 6) { setErrorMessage(t('parentAuth.signIn.errorInvalidPassword')); return; }
    setScreenState('loading_password');
    try {
      if (authMode === 'password_sign_up') await signUp(email.trim(), password); else await signIn(email.trim(), password);
      const s = await getCurrentSession();
      if (s?.user) { setScreenState('signed_in'); onSignedIn?.(); }
      else { setErrorMessage(t('parentAuth.signIn.errorSignInFailed')); setScreenState('idle'); }
    } catch (err) { setErrorMessage(err instanceof AuthError ? err.message : t('parentAuth.signIn.errorSignInFailed')); setScreenState('idle'); }
  }, [email, password, authMode, onSignedIn, t]);

  const handleOAuth = useCallback(async (provider: 'google' | 'apple') => {
    setErrorMessage(null); setScreenState('loading_oauth');
    try {
      await (provider === 'google' ? signInWithGoogle : signInWithApple)();
      const s = await getCurrentSession();
      if (s?.user) { setScreenState('signed_in'); onSignedIn?.(); }
      else { const u = await Linking.getInitialURL(); if (u?.includes('auth/callback')) { await handleAuthCallback(u); setScreenState('signed_in'); onSignedIn?.(); } else throw new AuthError('sign_in_failed', 'No session'); }
    } catch (err) { if (err instanceof AuthError && err.code === 'session_cancelled') { setScreenState('idle'); return; } setErrorMessage(t('parentAuth.signIn.errorSignInFailed')); setScreenState('idle'); }
  }, [onSignedIn, t]);

  React.useEffect(() => {
    const handler = async (event: { url: string }) => {
      if (event.url.includes('auth/callback')) { try { await handleAuthCallback(event.url); const s = await getCurrentSession(); if (s?.user) { setScreenState('signed_in'); onSignedIn?.(); } } catch { setErrorMessage(t('parentAuth.signIn.errorSignInFailed')); setScreenState('idle'); } }
    };
    Linking.getInitialURL().then((u: string | null) => { if (u?.includes('auth/callback')) handler({ url: u }); });
    const sub = Linking.addEventListener('url', handler); return () => sub.remove();
  }, [onSignedIn, t]);

  const loading = screenState === 'loading_magic_link' || screenState === 'loading_password' || screenState === 'loading_oauth';

  if (screenState === 'magic_link_sent') return (
    <SafeAreaView style={st.container}><ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled"><View style={st.content}>
      <View style={st.iconWrap}><Text style={st.icon}>✉️</Text></View>
      <Text style={st.title}>{t('parentAuth.signIn.magicLinkSent')}</Text>
      <Text style={st.subtitle}>{t('parentAuth.signIn.checkEmail')}</Text>
      <Text style={st.emailDisplay}>{email}</Text>
      <TouchableOpacity style={st.btn} onPress={() => setScreenState('idle')} accessibilityRole="button"><Text style={st.btnText}>{t('parentAuth.signIn.sendMagicLink')}</Text></TouchableOpacity>
      <TouchableOpacity style={st.skipBtn} onPress={onSkip} accessibilityRole="button"><Text style={st.skipText}>{t('parentAuth.signIn.skip')}</Text></TouchableOpacity>
    </View></ScrollView></SafeAreaView>
  );

  if (screenState === 'signed_in') return (
    <SafeAreaView style={st.container}><ScrollView contentContainerStyle={st.scroll}><View style={st.content}>
      <View style={st.iconWrap}><Text style={st.icon}>✅</Text></View>
      <Text style={st.title}>{t('parentAuth.signIn.signedIn')}</Text>
      <TouchableOpacity style={st.btn} onPress={onSignedIn} accessibilityRole="button"><Text style={st.btnText}>Continue</Text></TouchableOpacity>
    </View></ScrollView></SafeAreaView>
  );

  return (
    <SafeAreaView style={st.container}>
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled"><View style={st.content}>
          <Text style={st.title}>{t('parentAuth.signIn.title')}</Text>
          <Text style={st.subtitle}>{t('parentAuth.signIn.subtitle')}</Text>
          <View style={st.tabs}>{TABS.map(({mode,label}) => (
            <TouchableOpacity key={mode} style={[st.tab, authMode===mode&&st.tabActive]} onPress={()=>{setAuthMode(mode);setErrorMessage(null)}} accessibilityRole="tab" accessibilityState={{selected:authMode===mode}}><Text style={[st.tabText, authMode===mode&&st.tabTextActive]}>{t(label)}</Text></TouchableOpacity>
          ))}</View>
          <TextInput style={[st.input, errorMessage&&st.inputErr]} value={email} onChangeText={v=>{setEmail(v);setErrorMessage(null)}} placeholder={t('parentAuth.signIn.emailPlaceholder')} placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!loading} />
          {(authMode==='password_sign_in'||authMode==='password_sign_up') && <TextInput style={[st.input, errorMessage&&st.inputErr]} value={password} onChangeText={v=>{setPassword(v);setErrorMessage(null)}} placeholder={t('parentAuth.signIn.passwordPlaceholder')} placeholderTextColor="#999" secureTextEntry autoCapitalize="none" autoCorrect={false} editable={!loading} />}
          <TouchableOpacity style={[st.btn, (!email.trim()||loading||(authMode!=='magic_link'&&!password))&&st.btnDisabled]} onPress={authMode==='magic_link'?handleMagicLink:handlePassword} disabled={!email.trim()||loading||(authMode!=='magic_link'&&!password)} accessibilityRole="button">
            {loading?<ActivityIndicator color="#fff"/>:<Text style={st.btnText}>{authMode==='magic_link'?t('parentAuth.signIn.sendMagicLink'):authMode==='password_sign_up'?t('parentAuth.signIn.signUp'):t('parentAuth.signIn.signIn')}</Text>}
          </TouchableOpacity>
          <View style={st.divider}><View style={st.divLine}/><Text style={st.divText}>{t('parentAuth.signIn.orDivider')}</Text><View style={st.divLine}/></View>
          <TouchableOpacity style={st.oAuthBtn} onPress={()=>handleOAuth('google')} disabled={loading} accessibilityRole="button"><Text style={st.oAuthIcon}>G</Text><Text style={st.oAuthLabel}>{t('parentAuth.signIn.continueWithGoogle')}</Text></TouchableOpacity>
          <TouchableOpacity style={[st.oAuthBtn, st.oAuthApple]} onPress={()=>handleOAuth('apple')} disabled={loading} accessibilityRole="button"><Text style={[st.oAuthIcon, st.oAuthIconWhite]}></Text><Text style={[st.oAuthLabel, st.oAuthLabelWhite]}>{t('parentAuth.signIn.continueWithApple')}</Text></TouchableOpacity>
          {errorMessage && <View style={st.errWrap}><Text style={st.errText}>{errorMessage}</Text></View>}
          <TouchableOpacity style={st.skipBtn} onPress={onSkip} accessibilityRole="button"><Text style={st.skipText}>{t('parentAuth.signIn.skip')}</Text></TouchableOpacity>
        </View></ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container:{flex:1,backgroundColor:'#FFFFFF'}, scroll:{flexGrow:1,justifyContent:'center'},
  content:{paddingHorizontal:24,paddingVertical:32,alignItems:'center' as const},
  iconWrap:{width:80,height:80,borderRadius:40,backgroundColor:'#F0F4FF',alignItems:'center' as const,justifyContent:'center' as const,marginBottom:24},
  icon:{fontSize:36},
  title:{fontSize:24,fontWeight:'700',color:'#1A1A1A',textAlign:'center' as const,marginBottom:12}as TextStyle,
  subtitle:{fontSize:16,lineHeight:24,color:'#666',textAlign:'center' as const,marginBottom:24,paddingHorizontal:16}as TextStyle,
  tabs:{flexDirection:'row' as const,width:'100%',backgroundColor:'#F3F4F6',borderRadius:10,padding:3,marginBottom:20},
  tab:{flex:1,paddingVertical:10,borderRadius:8,alignItems:'center' as const},
  tabActive:{backgroundColor:'#FFFFFF',shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:.1,shadowRadius:2,elevation:2},
  tabText:{fontSize:14,fontWeight:'500',color:'#9CA3AF'}, tabTextActive:{color:'#4A90D9',fontWeight:'600'},
  input:{width:'100%',height:52,borderWidth:1.5,borderColor:'#D1D5DB',borderRadius:12,paddingHorizontal:16,fontSize:16,color:'#1A1A1A',backgroundColor:'#F9FAFB',marginBottom:12},
  inputErr:{borderColor:'#EF4444'},
  btn:{width:'100%',height:52,backgroundColor:'#4A90D9',borderRadius:12,alignItems:'center' as const,justifyContent:'center' as const}, btnDisabled:{opacity:.5},
  btnText:{color:'#FFFFFF',fontSize:17,fontWeight:'600'}as TextStyle,
  divider:{flexDirection:'row' as const,alignItems:'center' as const,width:'100%',marginBottom:24,marginTop:24},
  divLine:{flex:1,height:1,backgroundColor:'#E5E7EB'}, divText:{marginHorizontal:16,fontSize:14,color:'#9CA3AF'},
  oAuthBtn:{width:'100%',height:52,flexDirection:'row' as const,alignItems:'center' as const,justifyContent:'center' as const,borderWidth:1.5,borderColor:'#D1D5DB',borderRadius:12,backgroundColor:'#FFFFFF',marginBottom:12,gap:10},
  oAuthApple:{backgroundColor:'#000',borderColor:'#000'},
  oAuthIcon:{fontSize:20,fontWeight:'700',color:'#333'}, oAuthIconWhite:{color:'#FFF'},
  oAuthLabel:{fontSize:16,fontWeight:'500',color:'#333'}, oAuthLabelWhite:{color:'#FFF'},
  errWrap:{width:'100%',backgroundColor:'#FEF2F2',borderRadius:8,padding:12,marginBottom:16},
  errText:{fontSize:14,color:'#DC2626',textAlign:'center' as const},
  emailDisplay:{fontSize:16,fontWeight:'600',color:'#4A90D9',marginBottom:24},
  skipBtn:{paddingVertical:12,paddingHorizontal:24}, skipText:{fontSize:15,color:'#9CA3AF',textDecorationLine:'underline' as const},
});
