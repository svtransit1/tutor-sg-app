import React from 'react'; import { View, Text, StyleSheet, Modal, SafeAreaView } from 'react-native'; import { BELOW_FLOOR_MESSAGES } from '../types';
interface Props { visible: boolean; language?: 'en' | 'zh-Hans'; }
export function BelowFloorModal({ visible, language = 'en' }: Props) {
  const isZh = language === 'zh-Hans';
  const title = isZh ? BELOW_FLOOR_MESSAGES.titleZh : BELOW_FLOOR_MESSAGES.titleEn;
  const msg = isZh ? BELOW_FLOOR_MESSAGES.zh : BELOW_FLOOR_MESSAGES.en;
  return (<Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent accessibilityViewIsModal><SafeAreaView style={{flex:1,backgroundColor:'#fff'}}><View style={{flex:1,justifyContent:'center',alignItems:'center',paddingHorizontal:32}}><Text accessibilityRole="header" accessibilityLabel={title} style={{fontSize:24,fontWeight:'700',textAlign:'center',marginBottom:16,color:'#1A1A1A'}}>{title}</Text><Text accessibilityLabel={msg} style={{fontSize:16,textAlign:'center',lineHeight:24,color:'#4A4A4A'}}>{msg}</Text></View></SafeAreaView></Modal>);
}
