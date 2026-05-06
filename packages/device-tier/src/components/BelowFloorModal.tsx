/**
 * BelowFloorModal — blocking full-screen modal for unsupported devices.
 *
 * Shown when the device has less than the minimum RAM floor (< 3 GB).
 * This is a terminal UI — no continue button, no dismiss. The user
 * cannot proceed with the app on this device.
 *
 * Per ADD §3.4 + locked decisions: below floor → "device too old" message.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BELOW_FLOOR_MESSAGES } from '../types';

interface BelowFloorModalProps {
  visible: boolean;
  language?: 'en' | 'zh-Hans';
}

export function BelowFloorModal({ visible, language }: BelowFloorModalProps) {
  const { i18n } = useTranslation();
  const locale = language ?? (i18n.language === 'zh-Hans' ? 'zh-Hans' : 'en');
  const message = BELOW_FLOOR_MESSAGES[locale] ?? BELOW_FLOOR_MESSAGES.en;

  return (
    <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>📵</Text>
          </View>
          <Text style={styles.title}>
            {locale === 'zh-Hans' ? '设备不兼容' : 'Device Not Supported'}
          </Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#4A4A4A',
  },
});
