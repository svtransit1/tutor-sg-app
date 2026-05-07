import React from 'react'
import { Modal, View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { BELOW_FLOOR_MESSAGES } from '../types'

interface BelowFloorModalProps {
  visible: boolean
  language?: 'en' | 'zh-Hans'
}

export function BelowFloorModal({ visible, language = 'en' }: BelowFloorModalProps) {
  const message = language === 'zh-Hans' ? BELOW_FLOOR_MESSAGES.zh : BELOW_FLOOR_MESSAGES.en

  return (
    <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Device Not Supported</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </SafeAreaView>
    </Modal>
  )
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
})
