import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { t } = useTranslation();
  return <View style={s.c}><Text style={s.title}>{t('parent.settings.title')}</Text><Text style={s.ph}>{t('parent.settings.placeholder')}</Text></View>;
}
const s = StyleSheet.create({ c:{flex:1,backgroundColor:'#F8F9FA',padding:16}, title:{fontSize:18,fontWeight:'700',color:'#1A1A1A',marginBottom:12}, ph:{fontSize:15,color:'#9CA3AF'} })
