import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { verifyPin } from '../../storage/pin-storage';

interface Props { onSuccess: () => void }

export default function PinGateScreen({ onSuccess }: Props) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const handle = useCallback(async () => {
    if (pin.length !== 6) return;
    if (await verifyPin(pin)) { onSuccess(); return }
    const a = attempts + 1; setAttempts(a);
    if (a >= 5) { Alert.alert(t('parentAuth.cooldown')); return }
    Alert.alert(t('parentAuth.wrongPin', { attempts: 5 - a }));
    setPin('');
  }, [pin, attempts, onSuccess, t]);
  return (
    <View style={s.c}>
      <Text style={s.title}>{t('parentAuth.enterPin')}</Text>
      <TextInput style={s.in} value={pin} onChangeText={setPin} keyboardType="number-pad" maxLength={6} secureTextEntry placeholderTextColor="#D1D5DB" />
      <Pressable style={[s.btn, pin.length!==6&&s.bd]} onPress={handle} disabled={pin.length!==6}><Text style={s.bt}>{t('common.submit')}</Text></Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  c:{flex:1,justifyContent:'center',alignItems:'center',padding:24,backgroundColor:'#FFF'},
  title:{fontSize:20,fontWeight:'700',color:'#1A1A1A',marginBottom:24},
  in:{width:'100%',fontSize:32,letterSpacing:12,textAlign:'center',paddingVertical:16,borderBottomWidth:2,borderBottomColor:'#E5E7EB',marginBottom:24},
  btn:{backgroundColor:'#2563EB',paddingVertical:14,paddingHorizontal:48,borderRadius:12}, bd:{opacity:0.4},
  bt:{fontSize:16,fontWeight:'700',color:'#FFF'},
})
