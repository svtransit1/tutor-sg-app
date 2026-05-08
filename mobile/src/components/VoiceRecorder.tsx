import { TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native'

interface VoiceRecorderProps {
  onResult: (text: string) => void
  onError: (error: Error) => void
  style?: ViewStyle
}

export default function VoiceRecorder({ onResult, style }: VoiceRecorderProps) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={() => onResult('Voice input placeholder')}
      accessibilityRole="button" accessibilityLabel="Voice input">
      <Text style={styles.icon}>🎤</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 20 },
})
