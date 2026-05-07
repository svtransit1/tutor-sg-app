import React from 'react'; import { View, Text, StyleSheet, Modal, SafeAreaView } from 'react-native'; import { BELOW_FLOOR_MESSAGES } from '../types';
interface Props { visible: boolean; language?: 'en' | 'zh-Hans'; }
export function BelowFloorModal({ visible, language = 'en' }: Props) {
  const msg = language === 'zh-Hans' ? BELOW_FLOOR_MESSAGES.zh : BELOW_FLOOR_MESSAGES.en;
  return (<Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent><SafeAreaView style={{flex:1,backgroundColor:'#fff'}}><View style={{flex:1,justifyContent:'center',alignItems:'center',paddingHorizontal:32}}><Text style={{fontSize:24,fontWeight:'700',textAlign:'center',marginBottom:16,color:'#1A1A1A'}}>Device Not Supported</Text><Text style={{fontSize:16,textAlign:'center',lineHeight:24,color:'#4A4A4A'}}>{msg}</Text></View></SafeAreaView></Modal>);
}
